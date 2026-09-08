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

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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
    </Routes>
  );
}
