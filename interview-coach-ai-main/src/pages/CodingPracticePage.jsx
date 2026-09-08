import { useState, useEffect } from 'react';
import { codingAPI } from '../services/api';
import {
  Code2, Play, Send, Search, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, Terminal, AlertTriangle,
  Award, Layers, Check, X, ShieldAlert, Sparkles, RefreshCw,
} from 'lucide-react';
import Button from '../components/Button';
import Card, { CardHeader, CardTitle } from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const diffColors = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const languages = ['Java', 'Python', 'JavaScript', 'C++'];

export default function CodingPracticePage() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [language, setLanguage] = useState('Java');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [solvedMap, setSolvedMap] = useState({}); // { [problemId]: boolean }
  const [loading, setLoading] = useState(true);

  // Fetch 10 problems on mount
  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await codingAPI.getProblems();
      if (res.data?.problems?.length) {
        setProblems(res.data.problems);
        const map = {};
        res.data.problems.forEach((p) => {
          if (p.userStatus === 'Solved') map[p.id] = true;
        });
        setSolvedMap(map);
      }
    } catch {
      toast.error('Failed to load problems from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filtered = problems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  // Draft code helpers (saved per problem + per language)
  const getDraftCode = (problemId, lang) => {
    try {
      return localStorage.getItem(`coding_draft_${problemId}_${lang}`) || '';
    } catch {
      return '';
    }
  };

  const saveDraftCode = (problemId, lang, newCode) => {
    try {
      localStorage.setItem(`coding_draft_${problemId}_${lang}`, newCode);
    } catch (_) {}
  };

  const handleSelectProblem = async (problemHeader) => {
    setLoading(true);
    setEvaluationResult(null);
    try {
      const res = await codingAPI.getProblem(problemHeader.id);
      if (res.data?.problem) {
        const fullProblem = res.data.problem;
        setSelectedProblem(fullProblem);
        // Load user's saved draft for this problem & language, or empty string
        const draft = getDraftCode(fullProblem.id, language);
        setCode(draft);
      }
    } catch {
      toast.error('Could not load problem details');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (selectedProblem) {
      const draft = getDraftCode(selectedProblem.id, lang);
      setCode(draft);
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    if (selectedProblem) {
      saveDraftCode(selectedProblem.id, language, val);
    }
  };

  // Run code against visible test cases
  const handleRun = async () => {
    if (!code.trim()) return toast.error('Please write your code before running.');
    setRunning(true);
    setEvaluationResult(null);

    try {
      const res = await codingAPI.runCode({
        problemId: selectedProblem.id,
        language,
        code,
      });

      if (res.data) {
        const results = res.data.results || [];
        const passedTests = results.filter((r) => r.status === 'PASS' || r.passed === true).length;
        const totalTests = results.length;
        const failedTests = totalTests - passedTests;
        const accuracy = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        const isAllPassed = totalTests > 0 && passedTests === totalTests;

        const evalData = {
          ...res.data,
          results,
          passedCount: passedTests,
          failedCount: failedTests,
          totalCount: totalTests,
          accuracy,
          isAllPassed,
          isSubmission: false,
        };

        setEvaluationResult(evalData);

        if (isAllPassed) {
          toast.success(`✓ All ${totalTests} visible test cases PASSED!`);
        } else if (res.data.compileError) {
          toast.error('❌ Compilation Error');
        } else {
          toast.error(`❌ Solution Failed: ${failedTests} test case(s) failed`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code execution failed');
    } finally {
      setRunning(false);
    }
  };

  // Submit code against all test cases (visible + hidden)
  const handleSubmit = async () => {
    if (!code.trim()) return toast.error('Please write your code before submitting.');
    setSubmitting(true);
    setEvaluationResult(null);

    try {
      const res = await codingAPI.submitCode({
        problemId: selectedProblem.id,
        language,
        code,
      });

      if (res.data) {
        const results = res.data.results || [];
        const passedTests = results.filter((r) => r.status === 'PASS' || r.passed === true).length;
        const totalTests = results.length;
        const failedTests = totalTests - passedTests;
        const accuracy = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        const isAllPassed = totalTests > 0 && passedTests === totalTests;

        const evalData = {
          ...res.data,
          results,
          passedCount: passedTests,
          failedCount: failedTests,
          totalCount: totalTests,
          accuracy,
          isAllPassed,
          isSubmission: true,
        };

        setEvaluationResult(evalData);

        if (isAllPassed) {
          setSolvedMap((prev) => ({ ...prev, [selectedProblem.id]: true }));
          toast.success(`🎉 SOLVED! All ${totalTests} test cases passed (100% Accuracy)`);
        } else if (res.data.compileError) {
          toast.error('❌ Compilation Error');
        } else {
          toast.error(`❌ Solution Failed: ${failedTests} of ${totalTests} tests failed`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const solvedCount = Object.keys(solvedMap).length;

  if (loading && !selectedProblem) return <LoadingSpinner text="Loading 10 Coding Test Questions..." />;

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 1: PROBLEM CATALOG (10 QUESTIONS: 5 EASY, 5 MEDIUM)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!selectedProblem) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Coding Practice Test (10 Questions)</h1>
            <p className="text-slate-400 mt-1">Solve 5 Easy and 5 Medium problems tested against hidden test suites</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              Solved: {solvedCount} / 10
            </span>
          </div>
        </div>

        {/* Filters */}
        <Card hover={false}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="coding-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by problem title or topic..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Easy', 'Medium'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    diffFilter === d
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-[#1a1a3e] border-[#2a2a5a] text-slate-400 hover:border-purple-500/50'
                  }`}
                >
                  {d} {d === 'Easy' ? '(5)' : d === 'Medium' ? '(5)' : '(10)'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Problem List Grid */}
        <Card hover={false} className="!p-0 overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon={Code2} title="No matching problems" description="Try clearing your search query" />
          ) : (
            <div className="divide-y divide-[#2a2a5a]">
              {filtered.map((p, idx) => {
                const isSolved = solvedMap[p.id] || p.userStatus === 'Solved';

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProblem(p)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                        isSolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-[#1a1a3e] text-slate-400 border border-[#2a2a5a]'
                      }`}>
                        {isSolved ? <Check className="w-4 h-4 text-emerald-400" /> : idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition">{p.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffColors[p.difficulty]}`}>
                            {p.difficulty}
                          </span>
                          {isSolved ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ✓ Solved
                            </span>
                          ) : p.userStatus === 'Attempted' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                              ⚠ Attempted
                            </span>
                          ) : p.userStatus === 'Compilation Error' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                              ✕ Compilation Error
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{p.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 hidden sm:inline">{p.acceptance} Acceptance</span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 2: INTERACTIVE CODE IDE & EXECUTOR
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedProblem(null); setEvaluationResult(null); }}
            className="p-2 rounded-xl hover:bg-white/5 border border-[#2a2a5a] transition cursor-pointer text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-white">Problem {selectedProblem.id}: {selectedProblem.title}</h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diffColors[selectedProblem.difficulty]}`}>
                {selectedProblem.difficulty}
              </span>
              {solvedMap[selectedProblem.id] && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ SOLVED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedProblem.category}</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex gap-1.5 bg-[#141432] p-1 rounded-xl border border-[#2a2a5a]">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                language === lang
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Problem Prompt & Description */}
        <div className="space-y-4">
          <Card hover={false} className="p-6">
            <h2 className="text-base font-semibold text-white mb-3">Problem Statement</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-6">
              {selectedProblem.description}
            </div>

            {selectedProblem.inputFormat && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase text-purple-400 tracking-wider mb-1">Required Input Format</h3>
                <p className="text-xs text-slate-300 bg-[#0c0c24] p-3 rounded-xl border border-[#2a2a5a] font-mono">{selectedProblem.inputFormat}</p>
              </div>
            )}

            {selectedProblem.outputFormat && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase text-purple-400 tracking-wider mb-1">Required Output Format</h3>
                <p className="text-xs text-slate-300 bg-[#0c0c24] p-3 rounded-xl border border-[#2a2a5a] font-mono">{selectedProblem.outputFormat}</p>
              </div>
            )}

            {/* Sample Examples */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Sample Examples</h3>
              {(selectedProblem.examples || []).map((ex, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0c0c24] border border-[#2a2a5a] text-xs font-mono space-y-1.5">
                  <div className="text-slate-400"><strong className="text-slate-500">Input:</strong> <span className="text-slate-200">{ex.input}</span></div>
                  <div className="text-slate-400"><strong className="text-slate-500">Output:</strong> <span className="text-emerald-300 font-bold">{ex.output}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Code Editor & Execution Results */}
        <div className="space-y-4">
          {/* Editor Card */}
          <Card hover={false} className="!p-0 overflow-hidden border-[#2a2a5a]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a5a] bg-[#0c0c24]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">{language} Code Editor</span>
              </div>
              <span className="text-[10px] text-slate-500">Exact Output Match Required</span>
            </div>

            <textarea
              id="code-editor"
              value={code}
              onChange={handleCodeChange}
              placeholder={`Write your ${language} solution here...`}
              rows={16}
              spellCheck={false}
              className="w-full px-4 py-3 bg-[#0a0a1a] text-sm text-green-300 font-mono outline-none resize-none leading-relaxed placeholder:text-slate-600"
              style={{ tabSize: 2 }}
            />
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleRun} loading={running} variant="secondary" icon={Play} className="flex-1">
              Run Code (Visible Tests)
            </Button>
            <Button onClick={handleSubmit} loading={submitting} icon={Send} className="flex-1">
              Submit Solution (All Tests)
            </Button>
          </div>

          {/* Evaluation Results Box */}
          {evaluationResult && (() => {
            const results = evaluationResult.results || [];
            const passedCount = results.filter((r) => r.status === 'PASS' || r.passed === true).length;
            const totalCount = results.length;
            const failedCount = totalCount - passedCount;
            const accuracy = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
            const isAllPassed = totalCount > 0 && passedCount === totalCount;
            const failedTestCases = results.filter((r) => r.status === 'FAIL' || !r.passed);

            return (
              <Card hover={false} className="animate-fade-in space-y-4">
                {/* Header Banner: Status + Accuracy */}
                <div className="flex items-center justify-between border-b border-[#2a2a5a] pb-3">
                  <div className="flex items-center gap-2">
                    {isAllPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`text-sm font-bold ${isAllPassed ? 'text-emerald-300' : 'text-red-300'}`}>
                      {isAllPassed
                        ? (evaluationResult.isSubmission ? '✓ SOLVED — 100% Test Suite Passed' : '✓ Run Results: PASSED')
                        : (evaluationResult.compileError ? '❌ Compilation Error' : '❌ Solution Failed')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-emerald-400">Passed: {passedCount}</span>
                    <span className="text-red-400">Failed: {failedCount}</span>
                    <span className="text-purple-300">Total: {totalCount}</span>
                  </div>
                </div>

                {/* Score & Accuracy Gauge */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="text-slate-400 font-medium">Test Suite Accuracy</span>
                    <span className={`font-bold ${isAllPassed ? 'text-emerald-400' : accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {accuracy}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1a1a3e] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAllPassed ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>{passedCount} of {totalCount} test cases passed</span>
                    {failedCount > 0 && <span className="text-red-400 font-semibold">{failedCount} test case(s) failed</span>}
                  </div>
                </div>

                {/* Compilation Error Details */}
                {evaluationResult.compileError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-mono whitespace-pre-wrap">
                    <div className="font-bold mb-1 flex items-center gap-1.5 text-red-400">
                      <AlertTriangle className="w-4 h-4" /> Compiler Error output:
                    </div>
                    {evaluationResult.compileError}
                  </div>
                )}

                {/* Failed Test Cases Section (if any failed) */}
                {failedCount > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Failed Test Cases ({failedCount})
                    </h4>

                    {failedTestCases.map((tc, i) => (
                      <div key={tc.id || i} className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-xs space-y-2 font-mono">
                        <div className="flex items-center justify-between text-red-300 font-bold border-b border-red-500/20 pb-1.5">
                          <span>Test Case {tc.testCaseNumber || i + 1} ❌</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20">FAIL</span>
                        </div>

                        {tc.isHidden ? (
                          <div className="text-slate-300 text-xs font-sans">
                            <strong className="text-red-400">Hidden Test Case Failed:</strong> Your solution failed one or more hidden test cases.
                          </div>
                        ) : (
                          <>
                            {tc.input && (
                              <div className="text-slate-400"><strong className="text-slate-500">Input:</strong><br /><span className="text-slate-200">{tc.input}</span></div>
                            )}
                            <div className="text-slate-400"><strong className="text-slate-500">Expected:</strong><br /><span className="text-emerald-300">{tc.expectedOutput || tc.expected}</span></div>
                            <div className="text-slate-400"><strong className="text-slate-500">Your Output:</strong><br /><span className="text-red-300">{tc.actualOutput || tc.output || '(No output)'}</span></div>
                            {tc.error && (
                              <div className="text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20"><strong className="text-slate-400">Error:</strong> {tc.error}</div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Full Breakdown */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">All Test Cases Breakdown</h4>
                  {results.map((tc, i) => {
                    const isPassed = tc.status === 'PASS' || tc.passed;
                    return (
                      <div
                        key={tc.id || i}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 font-mono ${
                          isPassed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-bold text-slate-300">
                            Test Case {tc.testCaseNumber || i + 1} {tc.isHidden ? '(Hidden Test)' : ''}
                          </span>
                          <span className={`font-bold px-2.5 py-0.5 rounded text-[10px] ${
                            isPassed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {isPassed ? '✓ PASS' : '✗ FAIL'}
                          </span>
                        </div>

                        {!tc.isHidden && tc.input && (
                          <div className="text-slate-400"><strong className="text-slate-500">Input: </strong><span className="text-slate-300">{tc.input}</span></div>
                        )}
                        <div className="text-slate-400"><strong className="text-slate-500">Expected: </strong><span className="text-emerald-300">{tc.expectedOutput || tc.expected}</span></div>
                        <div className="text-slate-400">
                          <strong className="text-slate-500">Your Output: </strong>
                          <span className={isPassed ? 'text-emerald-300' : 'text-red-300'}>{tc.actualOutput || tc.output || '(No output)'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
