import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';

export default function AdminEvaluationsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.listEvaluations()
      .then((res) => setEvaluations(res.data.evaluations))
      .catch((err) => setError(err.response?.data?.message || 'Could not load evaluations'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Evaluations</h1>
        <p className="text-slate-400 mt-1 text-sm">Recent AI-scored interview responses, newest first</p>
      </div>

      <div className="space-y-3">
        {evaluations.length === 0 && (
          <Card><p className="text-slate-500 italic">No evaluations yet.</p></Card>
        )}
        {evaluations.map((ev) => (
          <Card key={ev.id} hover={false}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-slate-500">{ev.studentName} · {ev.studentEmail} · {ev.interviewType} · {ev.role}</p>
                <p className="text-white text-sm font-medium mt-1">{ev.questionText}</p>
                <p className="text-slate-400 text-sm mt-1 line-clamp-3">{ev.userAnswer}</p>
                {ev.feedback && <p className="text-slate-500 text-xs mt-2 italic">{ev.feedback}</p>}
              </div>
              <span className="text-lg font-bold text-purple-300 flex-shrink-0">{Math.round(ev.score || 0)}/100</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
