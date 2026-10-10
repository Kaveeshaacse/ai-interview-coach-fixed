import express from 'express';
import {
  listNotifications, markNotificationRead, markAllNotificationsRead,
} from '../controllers/studentNotificationsController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', listNotifications);
router.put('/read-all', markAllNotificationsRead);
router.put('/:id/read', markNotificationRead);

export default router;
