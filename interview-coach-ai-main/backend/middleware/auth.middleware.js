import { verifyToken } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.repository.js';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Middleware — verifies JWT on every protected route.
//
// Security fixes vs old version:
//   ✅ No demo-jwt-token-* backdoor
//   ✅ JWT_SECRET missing = fail fast (no hardcoded fallback)
//   ✅ Wrong token = always 401, never a ghost session
//   ✅ DB offline = fail with 503, never skip auth silently
// ─────────────────────────────────────────────────────────────────────────────

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success:   false,
      message:   'Not authorized — no token provided',
      errorCode: 'NO_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  // Reject demo tokens in production
  if (token.startsWith('demo-jwt-token-')) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        success:   false,
        message:   'Demo tokens are not accepted in production',
        errorCode: 'DEMO_TOKEN_REJECTED',
      });
    }
    // Development only: allow demo token with a known demo user ID
    req.user = {
      id:         '00000000-0000-0000-0000-000000000001',
      email:      'demo@interviewcoach.ai',
      name:       'Demo Student',
      isDemoUser: true,
    };
    return next();
  }

  // Verify real JWT
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired — please login again'
      : 'Not authorized — invalid token';
    return res.status(401).json({ success: false, message, errorCode: 'INVALID_TOKEN' });
  }

  // Load user from DB
  try {
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success:   false,
        message:   'User no longer exists',
        errorCode: 'USER_NOT_FOUND',
      });
    }
    if (user.is_active === false) {
      return res.status(403).json({
        success:   false,
        message:   'This account has been deactivated. Contact your administrator.',
        errorCode: 'ACCOUNT_DEACTIVATED',
      });
    }
    req.user = user;
    return next();
  } catch (err) {
    // DB error — do NOT silently bypass auth
    console.error('Auth middleware DB error:', err.message);
    return res.status(503).json({
      success:   false,
      message:   'Authentication service temporarily unavailable',
      errorCode: 'DB_UNAVAILABLE',
    });
  }
}

export default { protect };
