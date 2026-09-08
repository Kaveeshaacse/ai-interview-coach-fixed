import express from 'express';
import { evaluateCommunication, getCommunicationHistory } from '../controllers/communicationController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/evaluate', protect, evaluateCommunication);
router.post('/analyze',  protect, evaluateCommunication); // alias
router.get('/history',   protect, getCommunicationHistory);

export default router;
