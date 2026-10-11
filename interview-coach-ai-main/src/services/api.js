import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: global error handling ────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// ── Resume ──────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (file, options = {}) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (options.jobRole) formData.append('jobRole', options.jobRole);
    if (options.targetRole) formData.append('targetRole', options.targetRole);
    if (options.jobDescription) formData.append('jobDescription', options.jobDescription);
    return API.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  analyze: (resumeId) => API.post(`/resume/analyze/${resumeId}`),
  analyzeText: (data) => API.post('/resume/analyze', data),
  matchJob: (resumeId, jobDescription, targetRole) =>
    API.post(`/resume/match-job/${resumeId}`, { jobDescription, targetRole }),
  getAnalysis: (resumeId) => API.get(`/resume/analysis/${resumeId}`),
  getAll: () => API.get('/resume'),
};

// ── ATS ─────────────────────────────────────────────────────────────
export const atsAPI = {
  analyze: (fileOrData, options = {}) => {
    if (fileOrData instanceof File || fileOrData instanceof Blob) {
      const formData = new FormData();
      formData.append('resume', fileOrData);
      if (options.jobRole) formData.append('jobRole', options.jobRole);
      if (options.targetRole) formData.append('targetRole', options.targetRole);
      return API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return API.post('/ats/analyze', fileOrData);
  },
  getScore: (id) => API.get(`/ats/score/${id}`),
  getHistory: () => API.get('/ats/history'),
};

// ── Interview ───────────────────────────────────────────────────────
export const interviewAPI = {
  start: (data) => API.post('/interview/start', data),
  getQuestion: (sessionId) => API.get(`/interview/question/${sessionId}`),
  submitAnswer: (sessionId, data) =>
    API.post(`/interview/answer/${sessionId}`, data),
  getResults: (sessionId) => API.get(`/interview/results/${sessionId}`),
  getHistory: () => API.get('/interview/history'),
};

// ── Communication ───────────────────────────────────────────────────
export const communicationAPI = {
  // text must be the ACTUAL current transcript — not stale state
  evaluate:     (data) => API.post('/communication/evaluate', data),
  getHistory:   ()     => API.get('/communication/history'),
  getQuestions: ()     => API.get('/communication/questions'),
};

// ── Technical Interview ─────────────────────────────────────────────
export const technicalAPI = {
  // Only role + difficulty needed — technologies are derived on the backend
  generate:   ({ role, difficulty, count }) =>
    API.post('/technical/generate', { role, difficulty, count }),
  submit:     (data) => API.post('/technical/submit', data),
  evaluate:   (data) => API.post('/technical/evaluate', data),
  getHistory: ()     => API.get('/technical/history'),
};

// ── Coding ──────────────────────────────────────────────────────────
export const codingAPI = {
  getProblems: (params) => API.get('/coding/problems', { params }),
  getProblem: (id) => API.get(`/coding/problems/${id}`),
  runCode: (data) => API.post('/coding/run', data),
  submitCode: (data) => API.post('/coding/submit', data),
  getSubmissions: (problemId) => API.get(`/coding/submissions/${problemId}`),
};

// ── Aptitude ────────────────────────────────────────────────────────
export const aptitudeAPI = {
  getCategories: () => API.get('/aptitude/categories'),
  startTest: (data) => API.post('/aptitude/start', data),
  getQuestion: (testId) => API.get(`/aptitude/question/${testId}`),
  submitAnswer: (testId, data) =>
    API.post(`/aptitude/answer/${testId}`, data),
  submitTest: (data, testId) =>
    API.post('/aptitude/submit', typeof data === 'object' ? data : { testId: data }),
  getResults: (testId) => API.get(`/aptitude/results/${testId}`),
  getHistory: () => API.get('/aptitude/history'),
};

// ── Skills ──────────────────────────────────────────────────────────
export const skillsAPI = {
  getRecommendations: () => API.get('/skills/recommendations'),
  getCurrentSkills:   () => API.get('/skills/current'),
  updateSkills:  (data) => API.put('/skills/current', data),
  getHistory:         () => API.get('/skills/history'),
};

// ── Performance ─────────────────────────────────────────────────────
export const performanceAPI = {
  getDashboard: () => API.get('/performance/dashboard'),
  getHistory: (type) => API.get(`/performance/history/${type}`),
  getOverall: () => API.get('/performance/overall'),
};

// ── Learning Paths ──────────────────────────────────────────────────────────
export const learningPathsAPI = {
  getAll: () => API.get('/learning-paths'),
  getById: (id) => API.get(`/learning-paths/${id}`),
  start: (id) => API.patch(`/learning-paths/${id}/start`),
  markTopicComplete: (id, topicIndex, completed = true) =>
    API.put(`/learning-paths/${id}/topics/${topicIndex}/progress`, { completed }),
  updateTopicProgress: (topicId, completed = true, pathId = null) =>
    API.put(`/learning-paths/topics/${topicId}/progress`, { completed, pathId }),
};

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

export default API;
