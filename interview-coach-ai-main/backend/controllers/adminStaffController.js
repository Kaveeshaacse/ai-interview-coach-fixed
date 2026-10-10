import { adminUserRepository } from '../repositories/adminUser.repository.js';
import { createAdmin } from '../services/adminAuth.service.js';
import { adminAuditLogRepository } from '../repositories/adminAuditLog.repository.js';
import { adminNotificationsRepository } from '../repositories/adminNotifications.repository.js';

export const listStaff = async (req, res, next) => {
  try {
    const staff = await adminUserRepository.list();
    res.json({ success: true, staff });
  } catch (err) {
    next(err);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const created = await createAdmin(req.body);
    const { password_hash, ...safe } = created;
    adminAuditLogRepository.log({
      adminId: req.admin.id, adminName: req.admin.name, action: 'add_staff', target: created.id,
      details: { email: created.email, role: created.role },
    }).catch(() => {});
    adminNotificationsRepository.create({
      title: 'Staff account created',
      message: `${req.admin.name} created a ${created.role} account for ${created.name}`,
      type: 'info',
    }).catch(() => {});
    res.status(201).json({ success: true, staff: safe });
  } catch (err) {
    next(err);
  }
};

export const deactivateStaff = async (req, res, next) => {
  try {
    if (req.params.id === req.admin.id) {
      return res.status(400).json({ success: false, message: "You can't deactivate your own account" });
    }
    await adminUserRepository.setActive(req.params.id, false);
    adminAuditLogRepository.log({
      adminId: req.admin.id, adminName: req.admin.name, action: 'deactivate_staff', target: req.params.id,
    }).catch(() => {});
    adminNotificationsRepository.create({
      title: 'Staff account deactivated',
      message: `${req.admin.name} deactivated a staff account`,
      type: 'warning',
    }).catch(() => {});
    res.json({ success: true, message: 'Staff account deactivated' });
  } catch (err) {
    next(err);
  }
};

export const reactivateStaff = async (req, res, next) => {
  try {
    await adminUserRepository.setActive(req.params.id, true);
    adminAuditLogRepository.log({
      adminId: req.admin.id, adminName: req.admin.name, action: 'reactivate_staff', target: req.params.id,
    }).catch(() => {});
    res.json({ success: true, message: 'Staff account reactivated' });
  } catch (err) {
    next(err);
  }
};

export default { listStaff, createStaff, deactivateStaff, reactivateStaff };
