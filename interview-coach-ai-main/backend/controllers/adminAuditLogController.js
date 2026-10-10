import { adminAuditLogRepository } from '../repositories/adminAuditLog.repository.js';

export const getAuditLog = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const entries = await adminAuditLogRepository.list(limit);
    res.json({ success: true, entries });
  } catch (err) {
    next(err);
  }
};

export default { getAuditLog };
