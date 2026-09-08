# 🧠 AI-Powered Interview Preparation & Resume Coach — Backend API

A complete, production-ready Node.js / Express.js REST API with MongoDB, JWT Authentication, Multer file uploads, PDF/DOCX text extraction, and an intelligent AI evaluation engine.

---

## 📁 Architecture Overview

```text
backend/
├── config/
│   └── db.js                       # MongoDB connection with Mongoose
├── controllers/
│   ├── authController.js           # Registration, Login, Profile & Passwords
│   ├── resumeController.js         # Resume upload, text extraction, analysis
│   ├── atsController.js            # ATS score calculation & role matching
│   ├── interviewController.js      # AI mock interview generation & evaluation
│   ├── communicationController.js  # Grammar, clarity, confidence analysis
│   ├── technicalController.js      # Tech question generator & evaluator
│   ├── codingController.js         # Problem catalog & code test runner
│   ├── aptitudeController.js       # MCQ tests, timing, scoring, weak areas
│   ├── skillController.js          # Skill recommendations & gap analysis
│   ├── dashboardController.js      # Placement readiness aggregation
│   └── performanceController.js    # Historical charting data
├── models/
│   ├── User.js                     # User account & credentials
│   ├── Resume.js                   # Resume text, scores, ATS breakdown
│   ├── Interview.js                # Mock & technical interview Q&A logs
│   ├── CodingAttempt.js            # Code submissions & test runs
│   ├── AptitudeAttempt.js          # Aptitude quiz attempts & results
│   ├── CommunicationAttempt.js     # Communication test evaluations
│   └── SkillAssessment.js          # Skill profiles & recommendations
├── routes/                         # Express REST route endpoints
├── middleware/
│   ├── authMiddleware.js           # JWT Bearer token authentication
│   ├── uploadMiddleware.js         # Multer PDF / DOCX file validator
│   └── errorMiddleware.js          # Centralized error handler & 404 router
├── services/
│   ├── aiService.js                # LLM API connector & heuristic AI engine
│   └── textExtractionService.js    # PDF & Word text extractor
├── utils/
│   ├── codingProblems.js           # Curated problem database with test cases
│   ├── aptitudeQuestions.js        # Quantitative, Logical, Verbal question bank
│   └── scoringUtils.js             # Placement readiness calculation
├── uploads/                        # Document upload storage
├── .env.example                    # Sample environment variables
├── package.json                    # Backend dependencies & scripts
└── server.js                       # Express server entry point
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/interview_coach
JWT_SECRET=supersecret_jwt_key_interview_coach_2026_secure
JWT_EXPIRE=7d
USE_MOCK_AI=true
CLIENT_URL=http://localhost:5173
```

> **Note on AI Engine:** By default, `USE_MOCK_AI=true` runs the built-in intelligent heuristic engine with zero external dependencies. To use a live LLM (OpenAI, Gemini, etc.), set `USE_MOCK_AI=false` and provide your `AI_API_KEY`.

### 3. Start the Server
```bash
# Development mode with auto-reload:
npm run dev

# Or standard start:
npm start
```

---

## 📚 Complete API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register user (name, email, password, college, degree, graduationYear) | Public |
| `POST` | `/api/auth/login` | Login user & return JWT token | Public |
| `GET` | `/api/auth/profile` | Get current user profile | Bearer Token |
| `PUT` | `/api/auth/profile` | Update profile information | Bearer Token |
| `PUT` | `/api/auth/change-password` | Update account password | Bearer Token |

---

### 📄 Resume & ATS (`/api/resume`, `/api/ats`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/resume/upload` | Upload PDF/DOCX resume file & extract text | Bearer Token |
| `POST` | `/api/resume/analyze` | Run AI analysis on resume text | Bearer Token |
| `POST` | `/api/ats/analyze` | Calculate ATS score and missing keywords for target job role | Bearer Token |
| `GET` | `/api/resume/analysis/:id` | Get specific resume analysis | Bearer Token |
| `GET` | `/api/resume` | List all user resumes | Bearer Token |
| `GET` | `/api/ats/history` | Get past ATS evaluations | Bearer Token |

---

### 🎙️ AI Mock Interview (`/api/interview`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/interview/start` | Start session and generate AI questions for role/type/difficulty | Bearer Token |
| `GET` | `/api/interview/question/:sessionId` | Get current question | Bearer Token |
| `POST` | `/api/interview/answer/:sessionId` | Submit answer for AI scoring, feedback & rewritten answer | Bearer Token |
| `GET` | `/api/interview/results/:sessionId` | Get complete session scorecard | Bearer Token |
| `GET` | `/api/interview/history` | Get past interview history | Bearer Token |

---

### 💬 Communication Evaluation (`/api/communication`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/communication/evaluate` | Evaluate grammar, clarity, vocabulary, confidence, and mistakes | Bearer Token |
| `GET` | `/api/communication/history` | List communication test records | Bearer Token |

---

### 💻 Technical Interview (`/api/technical`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/technical/generate` | Generate role & technology-specific questions | Bearer Token |
| `POST` | `/api/technical/submit` | Evaluate technical answer against architectural concepts | Bearer Token |
| `GET` | `/api/technical/history` | List previous technical interview sessions | Bearer Token |

---

### 🧩 Coding Practice (`/api/coding`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/coding/problems` | List problems with search, category & difficulty filters | Public |
| `GET` | `/api/coding/problems/:id` | Get problem details, examples, constraints & starter code | Public |
| `POST` | `/api/coding/run` | Run solution against sample test cases | Bearer Token |
| `POST` | `/api/coding/submit` | Submit solution for evaluation & score recording | Bearer Token |
| `GET` | `/api/coding/submissions/:id`| Get user submissions for a problem | Bearer Token |

---

### 🧠 Aptitude Practice (`/api/aptitude`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/aptitude/categories` | Get Quantitative, Logical & Verbal categories | Public |
| `POST` | `/api/aptitude/start` | Start timed test with question list | Bearer Token |
| `POST` | `/api/aptitude/submit` | Submit test answers, calculate accuracy, time & weak areas | Bearer Token |
| `GET` | `/api/aptitude/history` | Get past aptitude test scores | Bearer Token |

---

### 💡 Skills & Recommendations (`/api/skills`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/skills/recommendations` | Get personalized skill gaps, priorities & learning paths | Bearer Token |
| `GET` | `/api/skills/current` | Get user's current skill proficiencies | Bearer Token |
| `PUT` | `/api/skills/current` | Update user skill levels | Bearer Token |

---

### 📊 Dashboard & Performance (`/api/dashboard`, `/api/performance`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/dashboard` | Overall placement readiness, category scores, radar metrics | Bearer Token |
| `GET` | `/api/performance/history/:type`| Historical time-series progress charts | Bearer Token |

---

## 🔒 Security Features
1. **Password Hashing**: Salted bcrypt (10 rounds) before DB persistence.
2. **JWT Authentication**: 7-day signed JSON Web Tokens for route authorization.
3. **File Validation**: Strict MIME type verification and 10MB limits on resume uploads.
4. **Sandboxed Code Evaluation**: Secure execution and matching against predefined test suites.
5. **CORS Control**: Restricts API calls to authorized frontend origins (`http://localhost:5173`).
