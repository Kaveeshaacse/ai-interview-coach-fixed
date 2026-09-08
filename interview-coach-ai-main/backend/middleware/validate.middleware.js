// ─────────────────────────────────────────────────────────────────────────────
// Validation Middleware
// Validates request bodies before reaching controllers.
// Invalid data returns 400 with a clean error — never reaches DB queries.
// ─────────────────────────────────────────────────────────────────────────────

const UUID_RE  = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(val) {
  return UUID_RE.test(String(val || ''));
}

function fail(res, message, details = null) {
  return res.status(400).json({
    success:   false,
    message,
    errorCode: 'VALIDATION_ERROR',
    ...(details ? { details } : {}),
  });
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];
  if (!name  || typeof name  !== 'string' || name.trim().length < 2)  errors.push('name: required, min 2 characters');
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email: must be a valid email address');
  if (!password || typeof password !== 'string' || password.length < 6) errors.push('password: required, min 6 characters');
  if (errors.length) return fail(res, 'Validation failed', errors);
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];
  if (!email    || typeof email    !== 'string') errors.push('email: required');
  if (!password || typeof password !== 'string') errors.push('password: required');
  if (errors.length) return fail(res, 'Validation failed', errors);
  next();
}

// ── Resume ───────────────────────────────────────────────────────────────────

export function validateResumeUpload(req, res, next) {
  if (!req.file) {
    return fail(res, 'Please upload a resume file (PDF, DOC, DOCX)');
  }
  next();
}

export function validateResumeId(req, res, next) {
  const { resumeId, id } = req.params;
  const val = resumeId || id;
  if (!isValidUUID(val)) {
    return res.status(400).json({
      success:   false,
      message:   `Invalid resume ID: "${val}". Must be a valid UUID.`,
      errorCode: 'INVALID_ID',
    });
  }
  next();
}

export function validateJobDescription(req, res, next) {
  const { jobDescription } = req.body;
  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 30) {
    return fail(res, 'Please provide a valid job description (at least 30 characters)');
  }
  next();
}

// ── Interview ────────────────────────────────────────────────────────────────

export function validateInterviewStart(req, res, next) {
  const { role, type, difficulty } = req.body;
  const validTypes       = ['Behavioral', 'Technical', 'HR', 'Case Study'];
  const validDifficulties= ['Easy', 'Medium', 'Hard'];
  const errors = [];
  if (type       && !validTypes.includes(type))        errors.push(`type: must be one of ${validTypes.join(', ')}`);
  if (difficulty && !validDifficulties.includes(difficulty)) errors.push(`difficulty: must be one of ${validDifficulties.join(', ')}`);
  if (errors.length) return fail(res, 'Validation failed', errors);
  next();
}

export function validateInterviewId(req, res, next) {
  const { sessionId, id } = req.params;
  const val = sessionId || id;
  if (!isValidUUID(val)) {
    return res.status(400).json({
      success:   false,
      message:   `Invalid session ID: "${val}". Must be a valid UUID.`,
      errorCode: 'INVALID_ID',
    });
  }
  next();
}

export function validateAnswerSubmission(req, res, next) {
  const { answer } = req.body;
  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    return fail(res, 'Please provide an answer');
  }
  next();
}

// ── Aptitude ─────────────────────────────────────────────────────────────────

export function validateAptitudeSubmit(req, res, next) {
  const { category } = req.body;
  const valid = ['quantitative', 'logical', 'verbal', 'all'];
  if (category && !valid.includes(String(category).toLowerCase())) {
    return fail(res, `category must be one of: ${valid.join(', ')}`);
  }
  next();
}
