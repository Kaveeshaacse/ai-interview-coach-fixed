import express from 'express';
import { generateTechQuestions, submitTechAnswer, getTechHistory } from '../controllers/technicalController.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateAnswerSubmission } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/generate', protect, generateTechQuestions);
router.post('/submit',   protect, validateAnswerSubmission, submitTechAnswer);
router.post('/evaluate', protect, validateAnswerSubmission, submitTechAnswer);
router.get('/history',   protect, getTechHistory);

export default router;
