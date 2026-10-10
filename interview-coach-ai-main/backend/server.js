import express   from 'express';
import cors      from 'cors';
import path      from 'path';

// Note: dotenv is loaded by index.js BEFORE this file is imported.
// process.env is already fully populated here.



// ── Validate required env vars before anything else ──────────────────────────
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Copy backend/.env.example → backend/.env and fill in the values.\n');
  process.exit(1);
}

// ── Routes ───────────────────────────────────────────────────────────────────
import authRoutes         from './routes/authRoutes.js';
import resumeRoutes       from './routes/resumeRoutes.js';
import atsRoutes          from './routes/atsRoutes.js';
import interviewRoutes    from './routes/interviewRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import technicalRoutes    from './routes/technicalRoutes.js';
import codingRoutes       from './routes/codingRoutes.js';
import aptitudeRoutes     from './routes/aptitudeRoutes.js';
import skillRoutes        from './routes/skillRoutes.js';
import dashboardRoutes    from './routes/dashboardRoutes.js';
import performanceRoutes  from './routes/performanceRoutes.js';
import learningPathRoutes from './routes/learningPathRoutes.js';
import studentNotificationsRoutes from './routes/studentNotificationsRoutes.js';
import adminAuthRoutes    from './routes/adminAuthRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';

// ── Middleware ────────────────────────────────────────────────────────────────
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// ── Security headers (Helmet) ─────────────────────────────────────────────────
try {
  const { default: helmet } = await import('helmet');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
  console.log('✅ Helmet security headers enabled');
} catch {
  console.warn('⚠️  helmet not installed — run: npm install');
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
try {
  const { rateLimit } = await import('express-rate-limit');
  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000, max: 200,
    message: { success: false, message: 'Too many requests. Please try again after 15 minutes.', errorCode: 'RATE_LIMITED' },
    standardHeaders: true, legacyHeaders: false,
  }));
  app.use('/api/auth/login',    rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/auth/register', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false }));
  console.log('✅ Rate limiting enabled');
} catch {
  console.warn('⚠️  express-rate-limit not installed — run: npm install');
}

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:       process.env.CLIENT_URL || 'http://localhost:5173',
  credentials:  true,
  methods:      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:['Content-Type', 'Authorization'],
}));

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static uploads ────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'online',
    version:   '3.0.0',
    database:  'Supabase PostgreSQL',
    aiEngine:  process.env.USE_MOCK_AI === 'false' ? 'Live LLM' : 'Built-in Heuristic',
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/resume',        resumeRoutes);
app.use('/api/ats',           atsRoutes);
app.use('/api/interview',     interviewRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/technical',     technicalRoutes);
app.use('/api/coding',        codingRoutes);
app.use('/api/aptitude',      aptitudeRoutes);
app.use('/api/skills',        skillRoutes);
app.use('/api/recommendations', skillRoutes);   // alias kept for frontend compat
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/performance',   performanceRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/notifications', studentNotificationsRoutes);
app.use('/api/admin-auth',     adminAuthRoutes);
app.use('/api/admin',          adminRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 ═══════════════════════════════════════════════════════
   AI Interview Coach — Backend v3.0 (Supabase)
   ➜ Port:      ${PORT}
   ➜ API:       http://localhost:${PORT}/api
   ➜ Health:    http://localhost:${PORT}/api/health
   ➜ DB:        Supabase PostgreSQL
   ➜ AI:        ${process.env.USE_MOCK_AI === 'false' ? 'Live LLM' : 'Built-in Heuristic Engine'}
   ➜ Env:       ${process.env.NODE_ENV || 'development'}

   Architecture: Routes → Controllers → Services → Repositories → Supabase
═══════════════════════════════════════════════════════ 🚀
  `);
});

export default app;
