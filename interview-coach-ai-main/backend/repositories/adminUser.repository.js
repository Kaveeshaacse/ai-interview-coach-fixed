import { getSupabase } from '../config/supabase.js';

// ─────────────────────────────────────────────────────────────────────────────
// Admin User Repository — all database operations for admin_users.
// Completely separate table from students (`users`) — by design, so a bug
// or compromise on one side can never grant access to the other.
// ─────────────────────────────────────────────────────────────────────────────

export const adminUserRepository = {

  async findByEmail(email) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async findById(id) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create({ email, passwordHash, name, role = 'staff' }) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('admin_users')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        name: name.trim(),
        role,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async list() {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('admin_users')
      .select('id, email, name, role, is_active, created_at, last_login_at')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async setActive(id, isActive) {
    const sb = getSupabase();
    const { error } = await sb.from('admin_users').update({ is_active: isActive }).eq('id', id);
    if (error) throw error;
  },

  async recordLogin(id) {
    const sb = getSupabase();
    await sb.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', id);
  },
};

export default adminUserRepository;
