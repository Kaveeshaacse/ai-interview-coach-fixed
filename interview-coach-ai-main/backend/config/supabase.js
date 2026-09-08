import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// Supabase client — lazy singleton.
// Reads env vars at first call so dotenv.config() has already run.
// ─────────────────────────────────────────────────────────────────────────────

let _client = null;

function initClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  });

  console.log('✅ Supabase client initialized →', url);
  return client;
}

/**
 * Returns the Supabase client.
 * Throws a clear error if credentials are missing.
 */
export function getSupabase() {
  if (!_client) {
    _client = initClient();
  }
  if (!_client) {
    throw new Error(
      'Database not configured. ' +
      'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env'
    );
  }
  return _client;
}

export default { getSupabase };
