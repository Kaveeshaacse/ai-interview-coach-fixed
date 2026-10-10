import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Mic, Gauge, BookOpen, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card, { CardHeader, CardTitle } from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';

function StatTile({ icon: Icon, label, value }) {
  return (
    <Card hover={false} className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.getDashboard()
      .then((res) => setStats(res.data.stats))
      .catch((err) => setError(err.response?.data?.message || 'Could not load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">Platform-wide student performance at a glance</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile icon={Users} label="Total Students" value={stats.totalStudents} />
        <StatTile icon={UserCheck} label="Active Students" value={stats.activeStudents} />
        <StatTile icon={Mic} label="Interviews Completed" value={stats.interviewsCompleted} />
        <StatTile icon={Gauge} label="Avg Interview Score" value={`${stats.averageInterviewScore}/100`} />
        <StatTile icon={BookOpen} label="Active Questions" value={stats.activeQuestions} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Average Score — Last 30 Days</CardTitle></CardHeader>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={stats.performanceTrend}>
                <defs>
                  <linearGradient id="adminTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#141432', border: '1px solid #2a2a5a', borderRadius: '12px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="averageScore" stroke="#7c3aed" strokeWidth={2} fill="url(#adminTrend)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Interviews Completed — Per Week</CardTitle></CardHeader>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={stats.weeklyInterviews}>
                <XAxis dataKey="weekStarting" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#141432', border: '1px solid #2a2a5a', borderRadius: '12px', color: '#f1f5f9' }} />
                <Bar dataKey="interviews" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle icon={AlertTriangle}>Students Needing Attention (score below {stats.attentionThreshold})</CardTitle></CardHeader>
        {stats.studentsNeedingAttention.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No students currently flagged.</p>
        ) : (
          <div className="space-y-2">
            {stats.studentsNeedingAttention.map((s) => (
              <Link
                key={s.id}
                to={`/admin/students?search=${encodeURIComponent(s.email)}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a] hover:border-red-500/40 transition-colors"
              >
                <div>
                  <p className="text-white text-sm font-medium">{s.name}</p>
                  <p className="text-slate-500 text-xs">{s.email} {s.college ? `· ${s.college}` : ''}</p>
                </div>
                <span className="text-red-400 font-bold text-sm">{s.overallScore}/100</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
