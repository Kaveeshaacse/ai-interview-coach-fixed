import express from 'express';
import { getDashboard, getPerformanceHistoryByType } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/dashboard',       protect, getDashboard);
router.get('/overall',         protect, getDashboard);
router.get('/history/:type',   protect, getPerformanceHistoryByType);

export default router;
