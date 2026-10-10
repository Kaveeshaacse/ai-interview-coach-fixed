import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card, { CardHeader, CardTitle } from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.getAnalytics()
      .then((res) => setAnalytics(res.data.analytics))
      .catch((err) => setError(err.response?.data?.message || 'Could not load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!analytics) return null;

  const categoryData = Object.entries(analytics.averageByCategory).map(([category, score]) => ({ category, score }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Across {analytics.studentsCounted} students · Weakest area overall: <span className="text-red-300 font-medium capitalize">{analytics.weakestCategory || 'n/a'}</span>
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Average Score by Category</CardTitle></CardHeader>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={categoryData}>
              <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#141432', border: '1px solid #2a2a5a', borderRadius: '12px', color: '#f1f5f9' }} />
              <Bar dataKey="score" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
