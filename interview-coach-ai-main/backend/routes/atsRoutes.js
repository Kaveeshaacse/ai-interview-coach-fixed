import express from 'express';
import { analyzeATS, getATSScore, getATSHistory } from '../controllers/atsController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/analyze',    protect, analyzeATS);
router.get('/score/:id',   protect, getATSScore);
router.get('/history',     protect, getATSHistory);

export default router;
