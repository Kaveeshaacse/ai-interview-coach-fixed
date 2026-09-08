// ─────────────────────────────────────────────────────────────────────────────
// Centralized Error Handler
// All errors thrown anywhere in the stack land here.
// Never exposes stack traces or DB internals to clients.
// ─────────────────────────────────────────────────────────────────────────────

export const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  err.errorCode  = 'NOT_FOUND';
  next(err);
};

export const errorHandler = (err, req, res, next) => {
  const isProd     = process.env.NODE_ENV === 'production';
  let statusCode   = err.statusCode || err.status || 500;
  let message      = err.message    || 'Internal Server Error';
  let errorCode    = err.errorCode  || 'INTERNAL_ERROR';

  // ── Supabase / PostgREST errors ────────────────────────────────────────────
  if (err.code === '23505') {               // unique_violation
    statusCode = 400;
    errorCode  = 'DUPLICATE_ENTRY';
    message    = 'A record with this value already exists.';
  } else if (err.code === '23503') {        // foreign_key_violation
    statusCode = 400;
    errorCode  = 'FOREIGN_KEY_VIOLATION';
    message    = 'Referenced record does not exist.';
  } else if (err.code === 'PGRST116') {     // PostgREST row not found
    statusCode = 404;
    errorCode  = 'NOT_FOUND';
    message    = 'Record not found.';
  }

  // ── JWT errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401; errorCode = 'INVALID_TOKEN';
    message    = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401; errorCode = 'TOKEN_EXPIRED';
    message    = 'Session expired. Please log in again.';
  }

  // ── Multer file errors ─────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400; errorCode = 'FILE_TOO_LARGE';
    message    = 'File is too large. Maximum allowed size is 10MB.';
  }

  // ── Log 5xx on server, not 4xx client mistakes ─────────────────────────────
  if (statusCode >= 500) {
    console.error(`[${statusCode}] ${req.method} ${req.originalUrl} — ${message}`);
    if (!isProd) console.error(err.stack);
  }

  res.status(statusCode).json({
    success:   false,
    message:   isProd && statusCode >= 500 ? 'Something went wrong. Please try again later.' : message,
    errorCode,
    ...(isProd ? {} : { stack: err.stack }),
  });
};

export default { notFound, errorHandler };
