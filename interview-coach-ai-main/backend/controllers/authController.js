import * as authService from '../services/auth.service.js';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Controller — HTTP only. All logic delegated to auth.service.js.
// ─────────────────────────────────────────────────────────────────────────────

export const registerUser = async (req, res, next) => {
  try {
    const { token, user } = await authService.registerUser(req.body);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    next(err);
  }
};

export const changeUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

export default { registerUser, loginUser, getUserProfile, updateUserProfile, changeUserPassword };
