import { getDashboardStats } from '../services/adminDashboard.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

export default { getDashboard };
