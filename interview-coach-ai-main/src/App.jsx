import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import ATSScorePage from './pages/ATSScorePage';
import JobMatchPage from './pages/JobMatchPage';
import MockInterviewPage from './pages/MockInterviewPage';
import CommunicationPage from './pages/CommunicationPage';
import TechnicalInterviewPage from './pages/TechnicalInterviewPage';
import CodingPracticePage from './pages/CodingPracticePage';
import AptitudePage from './pages/AptitudePage';
import SkillRecommendationsPage from './pages/SkillRecommendationsPage';
import LearningPathDetailPage from './pages/LearningPathDetailPage';
import PerformanceHistoryPage from './pages/PerformanceHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminEvaluationsPage from './pages/admin/AdminEvaluationsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSkillGapsPage from './pages/admin/AdminSkillGapsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminAuditLogPage from './pages/admin/AdminAuditLogPage';

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/staff-login" element={<AdminLoginPage />} />

      {/* protected (dashboard shell) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resume" element={<ResumeAnalyzerPage />} />
        <Route path="/ats" element={<ATSScorePage />} />
        <Route path="/job-match" element={<JobMatchPage />} />
        <Route path="/mock-interview" element={<MockInterviewPage />} />
        <Route path="/communication" element={<CommunicationPage />} />
        <Route path="/technical" element={<TechnicalInterviewPage />} />
        <Route path="/coding" element={<CodingPracticePage />} />
        <Route path="/aptitude" element={<AptitudePage />} />
        <Route path="/skills" element={<SkillRecommendationsPage />} />
        <Route path="/skill-recommendations" element={<SkillRecommendationsPage />} />
        <Route path="/skill-recommendations/:pathId" element={<LearningPathDetailPage />} />
        <Route path="/performance" element={<PerformanceHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* admin / staff portal */}
      <Route
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/students" element={<AdminStudentsPage />} />
        <Route path="/admin/staff" element={<AdminStaffPage />} />
        <Route path="/admin/questions" element={<AdminQuestionsPage />} />
        <Route path="/admin/evaluations" element={<AdminEvaluationsPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/skill-gaps" element={<AdminSkillGapsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/alerts" element={<AdminAlertsPage />} />
        <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
      </Route>
    </Routes>
  );
}
