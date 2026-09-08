import * as interviewService from '../services/interview.service.js';

export const generateTechQuestions = async (req, res, next) => {
  try {
    // Only role + difficulty needed — no technologies
    const { role, difficulty, count } = req.body;
    const result = await interviewService.startTechnicalInterview(req.user.id, {
      role, difficulty, count,
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const submitTechAnswer = async (req, res, next) => {
  try {
    const result = await interviewService.submitTechnicalAnswer(req.user.id, req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getTechHistory = async (req, res, next) => {
  try {
    const attempts = await interviewService.getTechnicalHistory(req.user.id);
    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    next(err);
  }
};

export default { generateTechQuestions, submitTechAnswer, getTechHistory };
