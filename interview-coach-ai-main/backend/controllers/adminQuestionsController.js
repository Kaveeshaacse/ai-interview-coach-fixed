import * as adminQuestionsService from '../services/adminQuestions.service.js';

export const listQuestions = async (req, res, next) => {
  try {
    const { type, difficulty, category, isActive } = req.query;
    const filters = { type, difficulty, category };
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    const questions = await adminQuestionsService.listQuestions(filters);
    res.json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const question = await adminQuestionsService.createQuestion(req.body, req.admin);
    res.status(201).json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await adminQuestionsService.updateQuestion(req.params.id, req.body, req.admin);
    res.json({ success: true, question });
  } catch (err) {
    next(err);
  }
};

export const activateQuestion = async (req, res, next) => {
  try {
    await adminQuestionsService.setQuestionActive(req.params.id, true, req.admin);
    res.json({ success: true, message: 'Question activated' });
  } catch (err) {
    next(err);
  }
};

export const deactivateQuestion = async (req, res, next) => {
  try {
    await adminQuestionsService.setQuestionActive(req.params.id, false, req.admin);
    res.json({ success: true, message: 'Question deactivated' });
  } catch (err) {
    next(err);
  }
};

export default { listQuestions, createQuestion, updateQuestion, activateQuestion, deactivateQuestion };
