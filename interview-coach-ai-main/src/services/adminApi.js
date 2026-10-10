import axios from 'axios';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Separate axios instance for the admin/staff portal. Deliberately NOT the
// same `API` instance the student app uses in src/services/api.js: it must
// never attach a student token to an admin request (or vice versa), and a
// 401 here must only ever clear the admin session, never the student one.
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

ADMIN_API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

ADMIN_API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/staff-login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export const adminAuthAPI = {
  login: (data) => ADMIN_API.post('/admin-auth/login', data),
  getProfile: () => ADMIN_API.get('/admin-auth/profile'),
};

export const adminAPI = {
  getDashboard: () => ADMIN_API.get('/admin/dashboard'),

  listStudents: (search = '') => ADMIN_API.get('/admin/students', { params: { search } }),
  getStudent: (id) => ADMIN_API.get(`/admin/students/${id}`),
  deactivateStudent: (id) => ADMIN_API.put(`/admin/students/${id}/deactivate`),
  reactivateStudent: (id) => ADMIN_API.put(`/admin/students/${id}/reactivate`),
  exportStudentsCsv: () => ADMIN_API.get('/admin/students/export', { responseType: 'blob' }),

  listQuestions: (filters = {}) => ADMIN_API.get('/admin/questions', { params: filters }),
  createQuestion: (data) => ADMIN_API.post('/admin/questions', data),
  updateQuestion: (id, data) => ADMIN_API.put(`/admin/questions/${id}`, data),
  activateQuestion: (id) => ADMIN_API.put(`/admin/questions/${id}/activate`),
  deactivateQuestion: (id) => ADMIN_API.put(`/admin/questions/${id}/deactivate`),

  listStaff: () => ADMIN_API.get('/admin/staff'),
  createStaff: (data) => ADMIN_API.post('/admin/staff', data),
  deactivateStaff: (id) => ADMIN_API.put(`/admin/staff/${id}/deactivate`),
  reactivateStaff: (id) => ADMIN_API.put(`/admin/staff/${id}/reactivate`),

  listEvaluations: (limit = 50) => ADMIN_API.get('/admin/evaluations', { params: { limit } }),

  getAnalytics: () => ADMIN_API.get('/admin/analytics'),
  getWeakAreaStudents: (type, label) => ADMIN_API.get('/admin/analytics/weak-area', { params: { type, label } }),

  getEvaluationSettings: () => ADMIN_API.get('/admin/settings/evaluation'),
  updateEvaluationSettings: (data) => ADMIN_API.put('/admin/settings/evaluation', data),
  getInterviewSettings: () => ADMIN_API.get('/admin/settings/interview'),
  updateInterviewSettings: (data) => ADMIN_API.put('/admin/settings/interview', data),

  listNotifications: () => ADMIN_API.get('/admin/notifications'),
  markNotificationRead: (id) => ADMIN_API.put(`/admin/notifications/${id}/read`),
  markAllNotificationsRead: () => ADMIN_API.put('/admin/notifications/read-all'),

  getAlerts: () => ADMIN_API.get('/admin/alerts'),

  getAuditLog: () => ADMIN_API.get('/admin/audit-log'),
};

export default ADMIN_API;
