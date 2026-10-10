import * as adminSettingsService from '../services/adminSettings.service.js';
import { adminAuditLogRepository } from '../repositories/adminAuditLog.repository.js';

export const getEvaluationSettings = async (req, res, next) => {
  try {
    const settings = await adminSettingsService.getEvaluationSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

export const updateEvaluationSettings = async (req, res, next) => {
  try {
    const settings = await adminSettingsService.updateEvaluationSettings(req.body, req.admin);
    adminAuditLogRepository.log({
      adminId: req.admin.id, adminName: req.admin.name,
      action: 'update_evaluation_settings', target: 'evaluation', details: settings,
    }).catch(() => {});
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

export const getInterviewSettings = async (req, res, next) => {
  try {
    const settings = await adminSettingsService.getInterviewSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

export const updateInterviewSettings = async (req, res, next) => {
  try {
    const settings = await adminSettingsService.updateInterviewSettings(req.body, req.admin);
    adminAuditLogRepository.log({
      adminId: req.admin.id, adminName: req.admin.name,
      action: 'update_interview_settings', target: 'interview', details: settings,
    }).catch(() => {});
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

export default { getEvaluationSettings, updateEvaluationSettings, getInterviewSettings, updateInterviewSettings };
