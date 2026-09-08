import express from 'express';
import { getAptitudeCategories, startAptitudeTest, submitAptitudeTest, getAptitudeHistory } from '../controllers/aptitudeController.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateAptitudeSubmit } from '../middleware/validate.middleware.js';

const router = express.Router();

router.get('/categories',        getAptitudeCategories);
router.post('/start',    protect, startAptitudeTest);
router.get('/questions', protect, startAptitudeTest);
router.post('/submit/:testId', protect, validateAptitudeSubmit, submitAptitudeTest);
router.post('/submit',         protect, validateAptitudeSubmit, submitAptitudeTest);
router.get('/history',   protect, getAptitudeHistory);

export default router;
