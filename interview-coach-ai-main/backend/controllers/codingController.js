import { codingRepository } from '../repositories/coding.repository.js';
import { getMergedCodingProblems, getMergedCodingProblemById } from '../services/questionBankBridge.service.js';
import { executeCode } from '../services/codeExecutionEngine.js';
import { recordActivity } from '../services/activity.service.js';

export const getCodingProblems = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;
    let filtered = await getMergedCodingProblems();
    if (category   && category   !== 'All') filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    if (difficulty && difficulty !== 'All') filtered = filtered.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    let statusMap = {};
    if (req.user?.id) {
      statusMap = await codingRepository.getUserProblemStatusMap(req.user.id);
    }

    const problems = filtered.map(p => {
      const s = statusMap[p.id];
      let userStatus = 'Unsolved';
      if (s) userStatus = (s.status === 'PASSED' || s.status === 'Accepted') ? 'Solved' : s.status === 'Compilation Error' ? 'Compilation Error' : 'Attempted';
      return { id: p.id, title: p.title, difficulty: p.difficulty, category: p.category, acceptance: p.acceptance, totalTestCases: p.visibleTestCases.length + p.hiddenTestCases.length, userStatus };
    });

    res.json({ success: true, count: problems.length, problems });
  } catch (err) {
    next(err);
  }
};

export const getCodingProblemById = async (req, res, next) => {
  try {
    const problem = await getMergedCodingProblemById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found', errorCode: 'PROBLEM_NOT_FOUND' });
    res.json({ success: true, problem: { id: problem.id, title: problem.title, difficulty: problem.difficulty, category: problem.category, acceptance: problem.acceptance, description: problem.description, inputFormat: problem.inputFormat, outputFormat: problem.outputFormat, examples: problem.examples, visibleTestCases: problem.visibleTestCases } });
  } catch (err) {
    next(err);
  }
};

export const runCode = async (req, res, next) => {
  try {
    const { problemId, language = 'Java', code = '' } = req.body;
    const problem = (await getMergedCodingProblemById(problemId)) || (await getMergedCodingProblems())[0];
    if (!code.trim()) return res.status(400).json({ success: false, message: 'Please write code before running', errorCode: 'EMPTY_CODE' });

    const result = await executeCode(code, language, problem.visibleTestCases);
    res.json({ success: true, problemId: problem.id, language, status: result.status, compileError: result.compileError, passedCount: result.passedCount, failedCount: result.failedCount, totalCount: result.totalCount, accuracy: result.accuracy, isAllPassed: result.isAllPassed, results: result.results });
  } catch (err) {
    next(err);
  }
};

export const submitCode = async (req, res, next) => {
  try {
    const { problemId, language = 'Java', code = '' } = req.body;
    const problem = (await getMergedCodingProblemById(problemId)) || (await getMergedCodingProblems())[0];
    if (!code.trim()) return res.status(400).json({ success: false, message: 'Please write code before submitting', errorCode: 'EMPTY_CODE' });

    const allCases = [...problem.visibleTestCases, ...problem.hiddenTestCases];
    const result   = await executeCode(code, language, allCases);
    const status   = result.isAllPassed ? 'Accepted' : result.compileError ? 'Compilation Error' : 'FAILED';

    await codingRepository.create(req.user.id, {
      problemId:        problem.id,
      problemTitle:     problem.title,
      difficulty:       problem.difficulty,
      category:         problem.category,
      language, code, status,
      score:            result.accuracy,
      passedTestCases:  result.passedCount,
      totalTestCases:   result.totalCount,
    });

    recordActivity(req.user.id, 'coding', { score: result.accuracy }).catch(() => {});

    const clientResults = result.results.map((r, idx) => ({
      testCaseNumber: idx + 1,
      input:           r.isHidden ? 'Hidden Input'  : r.input,
      expectedOutput:  r.isHidden ? 'Hidden Output' : r.expectedOutput,
      actualOutput:    r.isHidden ? (r.passed ? 'Hidden Output' : 'Output Hidden (Failed)') : r.actualOutput,
      status:          r.status,
      passed:          r.passed,
      isHidden:        r.isHidden,
      error:           r.error,
    }));

    res.json({ success: true, status, judgeStatus: result.status, accuracy: result.accuracy, compileError: result.compileError, passedCount: result.passedCount, failedCount: result.failedCount, totalCount: result.totalCount, isAllPassed: result.isAllPassed, results: clientResults });
  } catch (err) {
    next(err);
  }
};

export const getProblemSubmissions = async (req, res, next) => {
  try {
    const submissions = await codingRepository.findByProblem(req.user.id, Number(req.params.problemId));
    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    next(err);
  }
};

export default { getCodingProblems, getCodingProblemById, runCode, submitCode, getProblemSubmissions };
