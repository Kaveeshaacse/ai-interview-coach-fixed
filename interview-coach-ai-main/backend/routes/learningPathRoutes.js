import express from 'express';
import { getLearningPaths, getLearningPathById, updateTopicProgress, startLearningPath } from '../controllers/learningPathController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/',                                         protect, getLearningPaths);
router.get('/:id',                                      protect, getLearningPathById);
router.patch('/:id/start',                              protect, startLearningPath);
router.put('/:id/topics/:topicIndex/progress',          protect, updateTopicProgress);
router.patch('/:id/topics/:topicIndex/complete',        protect, updateTopicProgress);
router.put('/topics/:topicId/progress',                 protect, updateTopicProgress);

export default router;
