import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { adminUserRepository } from '../repositories/adminUser.repository.js';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Auth Service — separate token scope from student auth, so a student
// JWT can never be replayed against an admin-only route and vice versa.
// There is no public "admin register" endpoint on purpose: admin accounts
// are created with backend/scripts/create-admin.mjs, run by someone with
// server access only.
// ─────────────────────────────────────────────────────────────────────────────

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required but not set.');
  return secret;
}

export function generateAdminToken(adminId, role) {
  return jwt.sign(
    { id: adminId, role, scope: 'admin' },
    getJwtSecret(),
    { expiresIn: process.env.ADMIN_JWT_EXPIRE || '12h' }
  );
}

export function verifyAdminToken(token) {
  const decoded = jwt.verify(token, getJwtSecret());
  if (decoded.scope !== 'admin') {
    throw Object.assign(new Error('Not an admin token'), { statusCode: 401 });
  }
  return decoded;
}

export async function loginAdmin({ email, password }) {
  if (!email || !password) {
    throw Object.assign(new Error('Please provide email and password'), { statusCode: 400 });
  }
  const admin = await adminUserRepository.findByEmail(email);
  if (!admin) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }
  if (admin.is_active === false) {
    throw Object.assign(new Error('This admin account has been deactivated'), { statusCode: 403 });
  }
  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }
  adminUserRepository.recordLogin(admin.id).catch(() => {}); // fire-and-forget
  const token = generateAdminToken(admin.id, admin.role);
  const { password_hash, ...safeAdmin } = admin;
  return { token, admin: safeAdmin };
}

export async function createAdmin({ email, password, name, role = 'staff' }) {
  if (!email || !password || !name) {
    throw Object.assign(new Error('Please provide name, email and password'), { statusCode: 400 });
  }
  if (password.length < 6) {
    throw Object.assign(new Error('Password must be at least 6 characters'), { statusCode: 400 });
  }
  const existing = await adminUserRepository.findByEmail(email);
  if (existing) {
    throw Object.assign(new Error('An admin account with this email already exists'), { statusCode: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  return adminUserRepository.create({ email, passwordHash, name, role });
}

export default { generateAdminToken, verifyAdminToken, loginAdmin, createAdmin };
