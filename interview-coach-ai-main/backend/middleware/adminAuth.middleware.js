import { verifyAdminToken } from '../services/adminAuth.service.js';
import { adminUserRepository } from '../repositories/adminUser.repository.js';

// ─────────────────────────────────────────────────────────────────────────────
// protectAdmin — verifies an admin-scoped JWT on every admin route.
// Mirrors backend/middleware/auth.middleware.js but checks the separate
// admin_users table and the 'admin' token scope, so it never accepts a
// student token and a student route never accepts an admin token.
// ─────────────────────────────────────────────────────────────────────────────

export async function protectAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token provided', errorCode: 'NO_TOKEN' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAdminToken(token);
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired — please login again'
      : 'Not authorized — invalid token';
    return res.status(401).json({ success: false, message, errorCode: 'INVALID_TOKEN' });
  }

  try {
    const admin = await adminUserRepository.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin account no longer exists', errorCode: 'ADMIN_NOT_FOUND' });
    }
    if (admin.is_active === false) {
      return res.status(403).json({ success: false, message: 'This admin account has been deactivated', errorCode: 'ADMIN_DEACTIVATED' });
    }
    req.admin = admin;
    return next();
  } catch (err) {
    console.error('Admin auth middleware DB error:', err.message);
    return res.status(503).json({ success: false, message: 'Authentication service temporarily unavailable', errorCode: 'DB_UNAVAILABLE' });
  }
}

// Restricts a route to the 'admin' role only (not 'staff'). Use after protectAdmin.
export function requireAdminRole(req, res, next) {
  if (req.admin?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'This action requires an admin role, not staff', errorCode: 'INSUFFICIENT_ROLE' });
  }
  next();
}

export default { protectAdmin, requireAdminRole };
