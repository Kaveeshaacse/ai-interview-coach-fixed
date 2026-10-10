import { studentNotificationsRepository } from '../repositories/studentNotifications.repository.js';

export const listNotifications = async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      studentNotificationsRepository.listForUser(req.user.id),
      studentNotificationsRepository.unreadCount(req.user.id),
    ]);
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await studentNotificationsRepository.markRead(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await studentNotificationsRepository.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export default { listNotifications, markNotificationRead, markAllNotificationsRead };
