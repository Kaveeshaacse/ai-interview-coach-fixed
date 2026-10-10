import * as adminAlertsService from '../services/adminAlerts.service.js';

export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await adminAlertsService.getAlerts();
    res.json({ success: true, alerts });
  } catch (err) {
    next(err);
  }
};

export default { getAlerts };
