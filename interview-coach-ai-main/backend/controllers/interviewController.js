import * as interviewService from '../services/interview.service.js';

// ─────────────────────────────────────────────────────────────────────────────
// Interview Controller — HTTP only.
// ─────────────────────────────────────────────────────────────────────────────

export const startInterview = async (req, res, next) => {
  try {
    const result = await interviewService.startMockInterview(req.user.id, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getInterviewQuestion = async (req, res, next) => {
  try {
    const index  = Number(req.query.index || 0);
    const result = await interviewService.getInterviewQuestion(req.user.id, req.params.sessionId, index);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const submitInterviewAnswer = async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId || req.body.sessionId;
    const result    = await interviewService.submitAnswer(req.user.id, sessionId, req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getInterviewResults = async (req, res, next) => {
  try {
    const result = await interviewService.getInterviewResults(req.user.id, req.params.sessionId);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getInterviewHistory = async (req, res, next) => {
  try {
    const attempts = await interviewService.getInterviewHistory(req.user.id);
    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    next(err);
  }
};

export default { startInterview, getInterviewQuestion, submitInterviewAnswer, getInterviewResults, getInterviewHistory };
