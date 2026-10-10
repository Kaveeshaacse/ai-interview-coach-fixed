import { getSupabase } from '../config/supabase.js';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Settings Repository — key/value config rows in `admin_settings`.
// Falls back to sane defaults only if a row hasn't been created yet (the
// admin_module migration inserts both rows, so this is just a safety net).
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS = {
  evaluation: { passingScore: 60, attentionThreshold: 50 },
  interview: { defaultDurationMinutes: 15, questionsPerInterview: 5 },
};

export const adminSettingsRepository = {
  async get(key) {
    const sb = getSupabase();
    const { data, error } = await sb.from('admin_settings').select('*').eq('key', key).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? data.value : (DEFAULTS[key] || {});
  },

  async set(key, value, updatedBy) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('admin_settings')
      .upsert({ key, value, updated_by: updatedBy, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single();
    if (error) throw error;
    return data.value;
  },
};

export default adminSettingsRepository;
