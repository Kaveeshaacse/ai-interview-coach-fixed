# AI-Powered Interview Preparation & Resume Coach

A complete, production-quality full-stack web application that helps students prepare for technical interviews, optimize their resumes, match against job descriptions, and track placement readiness — all powered by an intelligent heuristic AI engine with optional live LLM support.

---

## Project Overview

This is an AI-powered placement preparation platform covering:
- **Resume Analysis** — full text extraction, keyword analysis, improvement suggestions
- **ATS Scoring** — role-specific ATS compatibility with transparent 6-component breakdown
- **Job Description Matching** — resume vs JD comparison with match score
- **Mock Interview** — voice-enabled AI interview with evaluation and feedback
- **Technical Interview** — deep technical Q&A with per-answer persistence
- **Communication Evaluator** — grammar, clarity, confidence, vocabulary scoring
- **Coding Practice** — real code execution (Java, Python, JavaScript)
- **Aptitude Tests** — timed tests with category-wise analysis
- **Learning Paths** — 9 personalized paths based on actual performance
- **Dashboard** — real-time analytics from live DB data

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19.x |
| Build Tool | Vite | 8.x |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | 3.x |
| Icons | Lucide React | latest |
| Notifications | React Hot Toast | 2.x |
| Routing | React Router DOM | 7.x |
| HTTP Client | Axios | 1.x |
| Backend Runtime | Node.js (ESM) | 18+ |
| Backend Framework | Express | 4.x |
| Database | MongoDB | 6+ |
| ODM | Mongoose | 8.x |
| Authentication | JWT + bcryptjs | — |
| File Upload | Multer | 1.x |
| PDF Parsing | pdf-parse | 1.x |
| DOCX Parsing | mammoth | 1.x |
| Security | Helmet + express-rate-limit | 8.x / 7.x |
| AI Engine | Built-in heuristic (default) / OpenAI-compatible LLM (optional) | — |

---

## System Architecture

```
interviewcoach/
├── src/                          # React frontend
│   ├── pages/                    # 16 page components
│   │   ├── ResumeAnalyzerPage    # Full analysis: score, extraction, keywords, suggestions
│   │   ├── ATSScorePage          # Role-specific ATS with 6-component breakdown
│   │   ├── JobMatchPage          # Resume vs Job Description matching
│   │   ├── DashboardPage         # Real-time analytics from DB
│   │   ├── MockInterviewPage     # Voice-enabled mock interview
│   │   ├── TechnicalInterviewPage
│   │   ├── CommunicationPage
│   │   ├── CodingPracticePage    # Real code execution
│   │   ├── AptitudePage
│   │   ├── SkillRecommendationsPage
│   │   ├── LearningPathDetailPage
│   │   ├── PerformanceHistoryPage
│   │   └── ProfilePage
│   ├── components/               # 14 reusable components
│   ├── context/AuthContext.jsx   # JWT + secure demo fallback
│   ├── services/api.js           # All axios API calls
│   ├── hooks/                    # useSpeechToText, useTextToSpeech
│   └── layouts/DashboardLayout   # Sidebar + Navbar shell
│
└── backend/
    ├── config/db.js              # MongoDB connection (non-fatal, graceful)
    ├── controllers/              # 12 controllers — all with full DB persistence
    ├── models/                   # 8 Mongoose models with indexes
    ├── routes/                   # 12 route modules
    ├── services/
    │   ├── atsAnalyzerEngine.js  # Resume extraction, keywords, JD matching
    │   ├── aiService.js          # Dual-mode: heuristic + optional LLM
    │   ├── activityStore.js      # In-memory + async DB sync
    │   ├── codeExecutionEngine.js
    │   └── textExtractionService.js
    ├── middleware/               # Auth, error, upload
    └── utils/                    # Questions, problems, learning paths
```

---

## Database Schema (MongoDB)

### Users
Fields: name, email (indexed, unique), password (hashed), college, degree, branch, graduationYear, phone, location, bio, linkedIn, github, portfolio, resumeUrl, jobPreference, skills[], currentSkills[{name, level, category}], totalSessions, lastLoginAt, averageScores{resume, ats, interview, communication, coding, aptitude, overall}, weeklyProgress[]

### Resumes
Fields: userId (indexed), fileName, extractedText, resumeScore, sectionBreakdown{10 categories}, extractedInfo{name, email, phone, location, linkedIn, gitHub, education[], experience[], certifications[], projects[], skills[], languages[], wordCount, estimatedPages}, keywordAnalysis{keywordsFound[], missingKeywords[], keywordsToImprove[]}, improvementSuggestions[], resumeAnalysis{good[], improvements[], missing[], recommendations[]}, atsScore, targetRole, atsDetails, rawScoringBreakdown, jobMatch{matchScore, matchingSkills[], missingSkills[], matchingKeywords[], recommendations[], summary}, version

**Indexes:** (userId, createdAt), (userId, atsScore), (userId, targetRole)

### Interviews
Fields: userId, role, type (Behavioral/Technical/HR/Case Study), technology, difficulty, questions[], answers[{question, userAnswer, score, clarityScore, grammarScore, confidenceScore, technicalScore, feedback, strengths[], weaknesses[], improvedAnswer}], totalScore, overallFeedback, strengths[], weaknesses[], status, durationMinutes, completedAt

**Indexes:** (userId, createdAt), (userId, type, createdAt), (userId, status)

### AptitudeAttempts
Fields: userId, category, score, accuracy, timeTaken, totalQuestions, correctAnswers, wrongAnswers, unanswered, categoryScores (Map), weakAreas[], categoryBreakdown[], userAnswers[{question, selectedAnswer, correctAnswer, isCorrect, status, explanation}]

**Indexes:** (userId, createdAt), (userId, category, createdAt)

### CodingAttempts
Fields: userId, problemId, problemTitle, difficulty, category, language, code, status, score, passedTestCases, totalTestCases, executionTimeMs

**Indexes:** (userId, createdAt), (userId, problemId, createdAt), (userId, status)

### CommunicationAttempts
Fields: userId, inputText, wordCount, grammarScore, clarityScore, vocabularyScore, confidenceScore, relevanceScore, overallScore, mistakes[], improvedAnswer

**Indexes:** (userId, createdAt)

### LearningPaths
Fields: userId, pathKey (compound unique with userId), title, topics[{topicId, title, resources[], practiceQuestions[], completed, completedAt}], progress (auto-computed pre-save hook), started, triggerScore, priority, level

**Indexes:** (userId, pathKey) UNIQUE, (userId, createdAt)

### SkillAssessments
Fields: userId, currentSkills[], skillGaps[], recommendations[], scoreSnapshot{all 7 module scores}

**Indexes:** (userId, createdAt)

---

## AI / NLP Functionality

### Dual-Mode AI Engine
- **USE_MOCK_AI=true** (default): Fully offline deterministic heuristic engine. No API key needed. Works without internet.
- **USE_MOCK_AI=false**: Calls OpenAI-compatible API. Falls back to heuristic on failure.

### Resume Analysis Engine (`atsAnalyzerEngine.js`)
- **Text Extraction**: pdf-parse + mammoth for PDF/DOCX files
- **Info Extraction**: Regex-based extraction of name, email, phone, LinkedIn, GitHub, location, education, experience, certifications, projects, skills (40+ tech skills), languages
- **Keyword Analysis**: Role-specific keyword categories (core/important/beneficial) with frequency counting, context detection (weak vs strong usage), and per-keyword improvement recommendations
- **ATS Scoring**: 6-component transparent model — keyword match (35pts), experience/projects (20pts), section completeness (15pts), structure (15pts), terminology (10pts), contact (5pts)
- **Job Description Matching**: Skill extraction from JD + bidirectional resume match with match score, matching/missing skills and keywords, and targeted recommendations
- **Improvement Suggestions**: Context-aware before/after examples per section

### Interview Evaluation
- **Heuristic**: Word count, STAR method detection, confidence phrases, filler word penalties, technical term detection
- **LLM (optional)**: JSON-structured prompts with automatic fallback to heuristic

### Skill Recommendations
- Uses actual DB performance metrics (not hardcoded) to generate targeted gaps and recommendations

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local installation or MongoDB Atlas free tier)

### Step 1: Install Dependencies

```bash
# Root (frontend)
cd interviewcoach
npm install

# Backend
cd backend
npm install
```

### Step 2: Configure Environment

**Backend** — `backend/.env` is already created with defaults:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/interview_coach
JWT_SECRET=supersecret_jwt_key_interview_coach_2026_change_this_in_production
JWT_EXPIRE=7d
USE_MOCK_AI=true
AI_API_KEY=
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
CLIENT_URL=http://localhost:5173
```

**Frontend** — `.env` is already created:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas — update MONGODB_URI in backend/.env
```

### Step 4: Run the Application

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd interviewcoach/backend
npm run dev
```
Server starts at: http://localhost:5000

**Terminal 2 — Frontend:**
```bash
cd interviewcoach
npm run dev
```
App opens at: http://localhost:5173

### Step 5: Verify

Visit http://localhost:5000/api/health — should return:
```json
{ "status": "online", "version": "2.0.0", "aiEngine": "Built-in Expert AI Engine" }
```

---

## Demo Flow (Viva / Project Presentation)

**Step 1** — Register / Login at `/register`

**Step 2** — Upload Resume at `/resume`
- See: name, email, phone extracted from resume
- See: Overall score + 10-category breakdown
- See: Keywords found, missing keywords, keywords to improve
- See: Improvement suggestions with before/after examples

**Step 3** — Check ATS Score at `/ats`
- Select target role
- See: ATS score out of 100 with 6-component transparent breakdown
- See: Matched keywords (green) and missing keywords (red)

**Step 4** — Match Job Description at `/job-match`
- Paste any job posting
- See: Match % score, matching skills vs missing skills
- See: Required experience, education, certification requirements
- See: Targeted improvement recommendations

**Step 5** — Mock Interview at `/mock-interview`
- Select role and type
- Answer questions (voice or text)
- See: Per-answer score, feedback, improved answer suggestion

**Step 6** — Dashboard at `/dashboard`
- See: Overall placement readiness score (weighted from real DB data)
- See: Skill radar chart with all 7 modules
- See: Personalized learning paths based on your scores
- See: Real weekly progress chart
- See: Recent activities feed

**Step 7** — Performance at `/performance`
- See: Score trend over time for each module
- See: All past attempts with details

---

## Security Features

- **Passwords**: bcryptjs with 10 salt rounds
- **JWT**: Signed tokens with 7-day expiry, secure verification
- **Rate Limiting**: 200 req/15min general, 20 req/15min for auth endpoints
- **Helmet**: HTTP security headers (XSS, clickjacking, MIME sniffing protection)
- **Auth**: Wrong password returns 401 (not a ghost session)
- **Error Handling**: Stack traces hidden in production
- **File Upload**: Type validation (PDF/DOC/DOCX only), 10MB size limit
- **Ownership Check**: Resume analysis only accessible by owner
- **Environment Variables**: No secrets hardcoded anywhere

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/profile | Get user profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |
| POST | /api/resume/upload | Upload + full analysis |
| POST | /api/resume/match-job/:id | Match saved resume to JD |
| GET | /api/resume/analysis/:id | Get saved analysis |
| GET | /api/resume | Get all user resumes |
| POST | /api/ats/analyze | ATS analysis |
| GET | /api/ats/history | ATS history |
| POST | /api/interview/start | Start interview session |
| POST | /api/interview/answer/:id | Submit + evaluate answer |
| GET | /api/interview/results/:id | Get full results |
| GET | /api/interview/history | Interview history |
| POST | /api/technical/generate | Generate tech questions |
| POST | /api/technical/submit | Evaluate tech answer |
| POST | /api/communication/evaluate | Evaluate communication |
| GET | /api/coding/problems | List coding problems |
| POST | /api/coding/run | Run code (visible tests) |
| POST | /api/coding/submit | Submit code (all tests) |
| POST | /api/aptitude/start | Start aptitude test |
| POST | /api/aptitude/submit | Submit test, get results |
| GET | /api/aptitude/history | Aptitude history |
| GET | /api/skills/recommendations | Skill gaps from DB metrics |
| GET | /api/learning-paths | Personalized learning paths |
| PUT | /api/learning-paths/:id/topics/:i/progress | Update topic completion |
| GET | /api/performance/dashboard | Dashboard metrics |
| GET | /api/performance/history/:type | Module history |
| GET | /api/health | Server health check |

---

## Files Changed / Created

### Backend — New or Significantly Updated
| File | Change |
|---|---|
| `backend/.env` | Created with all required variables |
| `backend/config/db.js` | Non-fatal connect, events for reconnect/error |
| `backend/models/User.js` | Added averageScores, weeklyProgress, indexes |
| `backend/models/Resume.js` | Full schema v2: extraction, keywords, jobMatch, indexes |
| `backend/models/Interview.js` | Fixed field names, added indexes, completedAt |
| `backend/models/CodingAttempt.js` | Added indexes |
| `backend/models/AptitudeAttempt.js` | Added indexes, cleaned schema |
| `backend/models/CommunicationAttempt.js` | Added indexes |
| `backend/models/LearningPath.js` | Added unique compound index (userId, pathKey) |
| `backend/models/SkillAssessment.js` | Full schema with scoreSnapshot, indexes |
| `backend/controllers/authController.js` | Fixed security: 401 on wrong password, no ghost sessions |
| `backend/controllers/resumeController.js` | Full analysis, job match, scoringBreakdown in response |
| `backend/controllers/dashboardController.js` | Real DB aggregation, weekly progress from DB |
| `backend/controllers/performanceController.js` | Real DB queries, proper deduplication |
| `backend/controllers/interviewController.js` | Fixed overallFeedback field, saves all answers |
| `backend/controllers/technicalController.js` | Now saves answers to DB |
| `backend/controllers/communicationController.js` | Added recordUserActivity call |
| `backend/controllers/skillController.js` | SkillAssessment now created/updated from real metrics |
| `backend/controllers/atsController.js` | Updated to new schema fields |
| `backend/services/activityStore.js` | Async DB sync of weeklyProgress |
| `backend/services/aiService.js` | generateSkillRecommendations uses real metrics |
| `backend/services/atsAnalyzerEngine.js` | Added extraction, keyword analysis, JD matching |
| `backend/middleware/authMiddleware.js` | Fixed offline fallback, proper JWT error handling |
| `backend/middleware/errorMiddleware.js` | Mongoose error normalisation, no stack in production |
| `backend/utils/learningPaths.js` | Added python-dsa path (fixes bug) |
| `backend/routes/skillRoutes.js` | Added /history endpoint |

### Frontend — New or Significantly Updated
| File | Change |
|---|---|
| `.env` | Created |
| `src/pages/ResumeAnalyzerPage.jsx` | Complete rewrite with tabs, score, keywords, suggestions |
| `src/pages/ATSScorePage.jsx` | 10 roles, scoring breakdown chart, matched keywords |
| `src/pages/JobMatchPage.jsx` | New page: JD matching with full results |
| `src/pages/DashboardPage.jsx` | Job match card, updated actions |
| `src/pages/PerformanceHistoryPage.jsx` | Complete rewrite, clean data, status badges |
| `src/context/AuthContext.jsx` | Security fix: network error vs auth error distinction |
| `src/pages/LoginPage.jsx` | Handles new auth return format |
| `src/pages/RegisterPage.jsx` | Toast validation, new auth return format |
| `src/services/api.js` | Added matchJob, analyzeText, skillsAPI.getHistory |
| `src/components/Sidebar.jsx` | Added Job Match nav link |
| `src/App.jsx` | Added /job-match route |
