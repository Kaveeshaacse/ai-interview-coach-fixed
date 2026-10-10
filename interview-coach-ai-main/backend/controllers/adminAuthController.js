import * as adminAuthService from '../services/adminAuth.service.js';

export const loginAdmin = async (req, res, next) => {
  try {
    const { token, admin } = await adminAuthService.loginAdmin(req.body);
    res.json({ success: true, token, admin });
  } catch (err) {
    next(err);
  }
};

export const getAdminProfile = async (req, res) => {
  const { password_hash, ...safeAdmin } = req.admin;
  res.json({ success: true, admin: safeAdmin });
};

export default { loginAdmin, getAdminProfile };
