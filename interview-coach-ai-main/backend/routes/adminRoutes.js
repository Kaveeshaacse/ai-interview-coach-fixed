import express from 'express';
import { protectAdmin, requireAdminRole } from '../middleware/adminAuth.middleware.js';

import { getDashboard } from '../controllers/adminDashboardController.js';
import {
  listStudents, getStudentDetail, deactivateStudent, reactivateStudent, exportStudentsCsv,
} from '../controllers/adminStudentsController.js';
import {
  listQuestions, createQuestion, updateQuestion, activateQuestion, deactivateQuestion,
} from '../controllers/adminQuestionsController.js';
import { listStaff, createStaff, deactivateStaff, reactivateStaff } from '../controllers/adminStaffController.js';
import { listEvaluations } from '../controllers/adminEvaluationsController.js';
import { getAnalytics, getWeakAreaStudents } from '../controllers/adminAnalyticsController.js';
import {
  getEvaluationSettings, updateEvaluationSettings, getInterviewSettings, updateInterviewSettings,
} from '../controllers/adminSettingsController.js';
import {
  listNotifications, markNotificationRead, markAllNotificationsRead,
} from '../controllers/adminNotificationsController.js';
import { getAlerts } from '../controllers/adminAlertsController.js';
import { getAuditLog } from '../controllers/adminAuditLogController.js';

const router = express.Router();

// Every route below requires a valid admin/staff token.
router.use(protectAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Students
router.get('/students', listStudents);
router.get('/students/export', exportStudentsCsv);
router.get('/students/:id', getStudentDetail);
router.put('/students/:id/deactivate', deactivateStudent);
router.put('/students/:id/reactivate', reactivateStudent);

// Question Bank
router.get('/questions', listQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.put('/questions/:id/activate', activateQuestion);
router.put('/questions/:id/deactivate', deactivateQuestion);

// Staff management — creating/removing staff is admin-role only
router.get('/staff', listStaff);
router.post('/staff', requireAdminRole, createStaff);
router.put('/staff/:id/deactivate', requireAdminRole, deactivateStaff);
router.put('/staff/:id/reactivate', requireAdminRole, reactivateStaff);

// Evaluations review
router.get('/evaluations', listEvaluations);

// Analytics & skill gaps
router.get('/analytics', getAnalytics);
router.get('/analytics/weak-area', getWeakAreaStudents);

// Settings — any staff can view, only admins can change
router.get('/settings/evaluation', getEvaluationSettings);
router.put('/settings/evaluation', requireAdminRole, updateEvaluationSettings);
router.get('/settings/interview', getInterviewSettings);
router.put('/settings/interview', requireAdminRole, updateInterviewSettings);

// Notifications — shared staff-wide feed
router.get('/notifications', listNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);

// Alerts — computed live from real student data
router.get('/alerts', getAlerts);

// Audit log — admin-role only
router.get('/audit-log', requireAdminRole, getAuditLog);

export default router;
