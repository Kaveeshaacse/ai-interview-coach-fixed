import { getSupabase } from '../config/supabase.js';

export const adminAuditLogRepository = {
  async log({ adminId, adminName, action, target, details = {} }) {
    const sb = getSupabase();
    // Audit logging must never block or break the action it's recording.
    const { error } = await sb.from('admin_audit_log').insert({
      admin_id: adminId, admin_name: adminName, action, target, details,
    });
    if (error) console.error('Audit log write failed:', error.message);
  },

  async list(limit = 100) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },
};

export default adminAuditLogRepository;
