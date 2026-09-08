import express from 'express';
import { getCodingProblems, getCodingProblemById, runCode, submitCode, getProblemSubmissions } from '../controllers/codingController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/problems',               protect, getCodingProblems);
router.get('/problems/:id',           protect, getCodingProblemById);
router.post('/run',                   protect, runCode);
router.post('/submit',                protect, submitCode);
router.get('/submissions/:problemId', protect, getProblemSubmissions);

export default router;
