import { adminNotificationsRepository } from '../repositories/adminNotifications.repository.js';

export const listNotifications = async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      adminNotificationsRepository.list(),
      adminNotificationsRepository.unreadCount(),
    ]);
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await adminNotificationsRepository.markRead(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await adminNotificationsRepository.markAllRead();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export default { listNotifications, markNotificationRead, markAllNotificationsRead };
