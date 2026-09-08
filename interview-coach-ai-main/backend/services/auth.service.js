import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Service — business logic for authentication
// No HTTP concerns. No database queries (delegated to repository).
// ─────────────────────────────────────────────────────────────────────────────

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required but not set.');
  }
  return secret;
}

export function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export async function registerUser({ name, email, password, college, degree, branch, graduationYear, phone, location }) {
  // 1. Validate input
  if (!name || !email || !password) {
    throw Object.assign(new Error('Please provide name, email and password'), { statusCode: 400 });
  }
  if (password.length < 6) {
    throw Object.assign(new Error('Password must be at least 6 characters'), { statusCode: 400 });
  }

  // 2. Check for existing user
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw Object.assign(new Error('An account with this email already exists'), { statusCode: 400 });
  }

  // 3. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 4. Create user
  const user = await userRepository.create({
    name, email, passwordHash,
    college, degree, branch, graduationYear, phone, location,
  });

  // 5. Generate token
  const token = generateToken(user.id);

  return { token, user: formatUser(user) };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw Object.assign(new Error('Please provide email and password'), { statusCode: 400 });
  }

  // 1. Find user (includes password_hash)
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  // 2. Verify password — ALWAYS, no bypasses
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  // 3. Record login (fire-and-forget — don't block response)
  userRepository.recordLogin(user.id).catch(() => {});

  // 4. Generate token
  const token = generateToken(user.id);

  return { token, user: formatUser(user) };
}

export async function getUserProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }
  const skills = await userRepository.getUserSkills(userId);
  return formatUser(user, skills);
}

export async function updateProfile(userId, fields) {
  const updated = await userRepository.update(userId, fields);
  // If skills array provided, replace it
  if (Array.isArray(fields.skills) || Array.isArray(fields.currentSkills)) {
    const skillsArr = fields.currentSkills || fields.skills || [];
    await userRepository.replaceUserSkills(userId, skillsArr);
  }
  const skills = await userRepository.getUserSkills(userId);
  return formatUser(updated, skills);
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw Object.assign(new Error('Please provide current and new password'), { statusCode: 400 });
  }
  if (newPassword.length < 6) {
    throw Object.assign(new Error('New password must be at least 6 characters'), { statusCode: 400 });
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);
  await userRepository.updatePasswordHash(userId, newHash);
}

// ─────────────────────────────────────────────────────────────────────────────
// Format DB row → API response shape expected by frontend
// ─────────────────────────────────────────────────────────────────────────────
export function formatUser(dbUser, skills = []) {
  return {
    id:             dbUser.id,
    _id:            dbUser.id,  // backward compat with frontend
    name:           dbUser.name            || '',
    email:          dbUser.email           || '',
    phone:          dbUser.phone           || '',
    location:       dbUser.location        || '',
    college:        dbUser.college         || '',
    degree:         dbUser.degree          || '',
    branch:         dbUser.branch          || '',
    graduationYear: dbUser.graduation_year || '',
    bio:            dbUser.bio             || '',
    linkedIn:       dbUser.linkedin_url    || '',
    github:         dbUser.github_url      || '',
    portfolio:      dbUser.portfolio_url   || '',
    resumeUrl:      dbUser.resume_url      || '',
    jobPreference:  dbUser.job_preference  || 'Software Engineer',
    skills:         skills.map(s => s.name),
    currentSkills:  skills,
    role:           'student',
  };
}
