import { getSupabase } from '../config/supabase.js';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Notifications Repository — a simple staff-wide feed (no per-admin
// read tracking: with a small staff team, "read by anyone" marking it read
// for everyone is a reasonable trade-off). Notification creation must never
// block or break the action that triggered it, so `create` swallows its own
// errors — callers fire-and-forget it the same way they do audit logging.
// ─────────────────────────────────────────────────────────────────────────────

export const adminNotificationsRepository = {
  async create({ title, message, type = 'info' }) {
    const sb = getSupabase();
    const { error } = await sb.from('admin_notifications').insert({ title, message, type });
    if (error) console.error('Notification create failed:', error.message);
  },

  async list(limit = 30) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async markRead(id) {
    const sb = getSupabase();
    const { error } = await sb.from('admin_notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },

  async markAllRead() {
    const sb = getSupabase();
    const { error } = await sb.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
    if (error) throw error;
  },

  async unreadCount() {
    const sb = getSupabase();
    const { count, error } = await sb
      .from('admin_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  },
};

export default adminNotificationsRepository;
