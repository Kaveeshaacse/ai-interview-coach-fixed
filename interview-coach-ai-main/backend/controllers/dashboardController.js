import { getDashboardData, getPerformanceHistory } from '../services/dashboard.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await getDashboardData(req.user.id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export const getPerformanceHistoryByType = async (req, res, next) => {
  try {
    const { type = 'interview' } = req.params;
    const data = await getPerformanceHistory(req.user.id, type);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

export default { getDashboard, getPerformanceHistoryByType };
