import { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';

const ACTION_LABELS = {
  deactivate_student: 'Deactivated a student',
  reactivate_student: 'Reactivated a student',
  add_question: 'Added a question',
  edit_question: 'Edited a question',
  activate_question: 'Activated a question',
  deactivate_question: 'Deactivated a question',
  add_staff: 'Added a staff account',
  deactivate_staff: 'Deactivated a staff account',
  reactivate_staff: 'Reactivated a staff account',
  update_evaluation_settings: 'Updated evaluation settings',
  update_interview_settings: 'Updated interview settings',
};

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.getAuditLog()
      .then((res) => setEntries(res.data.entries))
      .catch((err) => setError(err.response?.data?.message || 'Could not load audit log'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!entries) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-slate-400 mt-1 text-sm">Every admin/staff action that changes data, newest first. Admin-only.</p>
      </div>

      {entries.length === 0 ? (
        <Card><p className="text-sm text-slate-500 italic">No actions recorded yet.</p></Card>
      ) : (
        <Card hover={false} className="!p-0 overflow-hidden">
          <div className="divide-y divide-[#2a2a5a]">
            {entries.map((e) => (
              <div key={e.id} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <History className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{e.admin_name || 'Unknown'}</span>{' '}
                    {(ACTION_LABELS[e.action] || e.action).toLowerCase()}
                  </p>
                  {e.target && <p className="text-slate-500 text-xs truncate">target: {e.target}</p>}
                </div>
                <p className="text-slate-500 text-xs flex-shrink-0">{new Date(e.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
