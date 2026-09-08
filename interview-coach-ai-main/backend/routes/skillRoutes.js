import express from 'express';
import { getRecommendations, getCurrentSkills, updateCurrentSkills, getSkillHistory } from '../controllers/skillController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/recommendations', protect, getRecommendations);
router.get('/history',         protect, getSkillHistory);
router.route('/current')
  .get(protect, getCurrentSkills)
  .put(protect, updateCurrentSkills);

export default router;
