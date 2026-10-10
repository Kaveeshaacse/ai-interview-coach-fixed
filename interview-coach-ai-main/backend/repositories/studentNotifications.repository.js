import { getSupabase } from '../config/supabase.js';

// ─────────────────────────────────────────────────────────────────────────────
// Student Notifications Repository — a broadcast feed (every student sees the
// same notifications), with read-state tracked per student via a join table
// rather than a single shared flag, since one student marking something read
// must not affect anyone else's unread count.
// ─────────────────────────────────────────────────────────────────────────────

export const studentNotificationsRepository = {
  async create({ title, message, type = 'info', link = null }) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('student_notifications')
      .insert({ title, message, type, link })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listForUser(userId, limit = 30) {
    const sb = getSupabase();
    const [{ data: notifications, error: nErr }, { data: reads, error: rErr }] = await Promise.all([
      sb.from('student_notifications').select('*').order('created_at', { ascending: false }).limit(limit),
      sb.from('student_notification_reads').select('notification_id').eq('user_id', userId),
    ]);
    if (nErr) throw nErr;
    if (rErr) throw rErr;
    const readIds = new Set((reads || []).map((r) => r.notification_id));
    return (notifications || []).map((n) => ({ ...n, is_read: readIds.has(n.id) }));
  },

  async unreadCount(userId) {
    const sb = getSupabase();
    const [{ count: total, error: tErr }, { data: reads, error: rErr }] = await Promise.all([
      sb.from('student_notifications').select('id', { count: 'exact', head: true }),
      sb.from('student_notification_reads').select('notification_id').eq('user_id', userId),
    ]);
    if (tErr) throw tErr;
    if (rErr) throw rErr;
    return Math.max(0, (total || 0) - (reads || []).length);
  },

  async markRead(userId, notificationId) {
    const sb = getSupabase();
    const { error } = await sb
      .from('student_notification_reads')
      .upsert({ notification_id: notificationId, user_id: userId }, { onConflict: 'notification_id,user_id' });
    if (error) throw error;
  },

  async markAllRead(userId) {
    const sb = getSupabase();
    const { data: notifications, error: nErr } = await sb.from('student_notifications').select('id');
    if (nErr) throw nErr;
    if (!notifications?.length) return;
    const rows = notifications.map((n) => ({ notification_id: n.id, user_id: userId }));
    const { error } = await sb
      .from('student_notification_reads')
      .upsert(rows, { onConflict: 'notification_id,user_id' });
    if (error) throw error;
  },
};

export default studentNotificationsRepository;
