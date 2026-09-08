import express from 'express';
import { startInterview, getInterviewQuestion, submitInterviewAnswer, getInterviewResults, getInterviewHistory } from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateInterviewStart, validateInterviewId, validateAnswerSubmission } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/start',                   protect, validateInterviewStart,  startInterview);
router.get('/question/:sessionId',      protect, validateInterviewId,     getInterviewQuestion);
router.post('/answer/:sessionId',       protect, validateInterviewId, validateAnswerSubmission, submitInterviewAnswer);
router.post('/evaluate',                protect, validateAnswerSubmission, submitInterviewAnswer);
router.get('/results/:sessionId',       protect, validateInterviewId,     getInterviewResults);
router.get('/history',                  protect,                          getInterviewHistory);

export default router;
