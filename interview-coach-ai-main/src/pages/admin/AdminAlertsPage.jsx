import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, Clock3 } from 'lucide-react';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';

const ICONS = { low_score: TrendingDown, inactive: Clock3 };
const SEVERITY_STYLE = {
  high: 'border-red-500/30 hover:border-red-500/50',
  medium: 'border-amber-500/30 hover:border-amber-500/50',
  low: 'border-[#2a2a5a] hover:border-purple-500/40',
};

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.getAlerts()
      .then((res) => setAlerts(res.data.alerts))
      .catch((err) => setError(err.response?.data?.message || 'Could not load alerts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!alerts) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="text-slate-400 mt-1 text-sm">
          {alerts.length} active — computed live from real score and login data, not stored or cached.
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card><p className="text-sm text-slate-500 italic">No active alerts right now.</p></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a, i) => {
            const Icon = ICONS[a.type] || TrendingDown;
            return (
              <Link
                key={`${a.studentId}-${a.type}-${i}`}
                to={`/admin/students?search=${encodeURIComponent(a.email)}`}
                className={`block p-4 rounded-xl bg-[#141432] border transition-colors ${SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.low}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{a.name}</p>
                    <p className="text-slate-500 text-xs truncate">{a.email}{a.college ? ` · ${a.college}` : ''}</p>
                    <p className="text-slate-400 text-sm mt-1">{a.detail}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
