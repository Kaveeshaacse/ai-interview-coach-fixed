import { useState, useEffect, useCallback } from 'react';
import { performanceAPI } from '../services/api';
import {
  TrendingUp, Mic, Code2, Brain, Target, MessageSquare,
  Clock, Award, RefreshCw,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/Card';
import CircularProgress from '../components/CircularProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const tabs = [
  { id: 'interview',     label: 'Interview',    icon: Mic,           color: '#7c3aed' },
  { id: 'coding',        label: 'Coding',        icon: Code2,         color: '#f59e0b' },
  { id: 'aptitude',      label: 'Aptitude',      icon: Brain,         color: '#ec4899' },
  { id: 'communication', label: 'Communication', icon: MessageSquare, color: '#10b981' },
  { id: 'ats',           label: 'ATS',           icon: Target,        color: '#3b82f6' },
];

const diffColors = {
  Easy:   'text-emerald-400',
  Medium: 'text-yellow-400',
  Hard:   'text-red-400',
};

const statusColors = {
  Accepted:            'text-emerald-400 bg-emerald-500/10',
  PASSED:              'text-emerald-400 bg-emerald-500/10',
  FAILED:              'text-red-400 bg-red-500/10',
  'Wrong Answer':      'text-red-400 bg-red-500/10',
  'Compilation Error': 'text-orange-400 bg-orange-500/10',
  completed:           'text-emerald-400 bg-emerald-500/10',
  'in-progress':       'text-yellow-400 bg-yellow-500/10',
};

const defaultData = {
  chartData:     [{ date: 'Start', score: 0 }],
  avgScore:      0,
  bestScore:     0,
  totalAttempts: 0,
  improvement:   'N/A',
  attempts:      [],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-2.5 rounded-xl bg-[#141432] border border-[#2a2a5a] shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">Score: {payload[0].value}%</p>
    </div>
  );
};

export default function PerformanceHistoryPage() {
  const [activeTab, setActiveTab] = useState('interview');
  const [data,      setData]      = useState({});
  const [loading,   setLoading]   = useState(false);

  const fetchHistory = useCallback(async (tab) => {
    setLoading(true);
    try {
      const res = await performanceAPI.getHistory(tab);
      if (res.data) setData((prev) => ({ ...prev, [tab]: res.data }));
    } catch { /* keep defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(activeTab); }, [activeTab, fetchHistory]);

  const current = data[activeTab] || defaultData;
  const tabMeta = tabs.find((t) => t.id === activeTab);
  const TabIcon = tabMeta.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Performance History</h1>
          <p className="text-slate-400 mt-1 text-sm">Track your progress across all preparation modules</p>
        </div>
        <button
          onClick={() => fetchHistory(activeTab)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141432] border border-[#2a2a5a] text-slate-300 text-sm font-medium hover:border-purple-500/40 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border whitespace-nowrap transition cursor-pointer ${
              activeTab === id
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-[#141432] border-[#2a2a5a] text-slate-400 hover:border-purple-500/40'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text={`Loading ${tabMeta.label} history...`} />
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Average Score',
                node:  <CircularProgress value={current.avgScore || 0} size={80} color={tabMeta.color} />,
              },
              {
                label: 'Best Score',
                node:  <CircularProgress value={current.bestScore || 0} size={80} color="#10b981" />,
              },
              {
                label: 'Total Attempts',
                node: (
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{current.totalAttempts || 0}</span>
                  </div>
                ),
              },
              {
                label: 'Improvement',
                node: (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    <span className={`text-xl font-bold ${current.improvement !== 'N/A' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {current.improvement || 'N/A'}
                    </span>
                  </div>
                ),
              },
            ].map(({ label, node }) => (
              <Card key={label} className="flex flex-col items-center justify-center py-5 gap-2">
                <p className="text-xs text-slate-400">{label}</p>
                {node}
              </Card>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle icon={TrendingUp}>{tabMeta.label} Score Over Time</CardTitle>
            </CardHeader>
            {current.chartData?.length > 1 ? (
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={current.chartData}>
                    <defs>
                      <linearGradient id={`grad-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={tabMeta.color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={tabMeta.color} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#2a2a5a" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke={tabMeta.color}
                      strokeWidth={2.5}
                      fill={`url(#grad-${activeTab})`}
                      dot={{ fill: tabMeta.color, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                title="No chart data yet"
                description={`Complete a few ${tabMeta.label.toLowerCase()} sessions to see your trend.`}
              />
            )}
          </Card>

          {/* Attempts list */}
          <Card>
            <CardHeader>
              <CardTitle icon={Clock}>
                Previous Attempts
                {current.totalAttempts > 0 && (
                  <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {current.totalAttempts}
                  </span>
                )}
              </CardTitle>
            </CardHeader>

            {!current.attempts?.length ? (
              <EmptyState
                title="No attempts yet"
                description={`Start a ${tabMeta.label.toLowerCase()} session to see your history here.`}
              />
            ) : (
              <div className="divide-y divide-[#2a2a5a]">
                {current.attempts.map((a, i) => {
                  const score = a.score ?? a.atsScore ?? a.overall ?? 0;
                  return (
                    <div key={a.id || i} className="flex items-center justify-between py-3.5 px-1 hover:bg-white/[0.02] transition">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${tabMeta.color}15` }}
                        >
                          <TabIcon className="w-4 h-4" style={{ color: tabMeta.color }} />
                        </div>
                        <div>
                          {activeTab === 'interview' && (
                            <>
                              <p className="text-sm font-medium text-slate-200">{a.role} — {a.type}</p>
                              <p className="text-xs text-slate-500">
                                {a.date} · {a.duration} ·{' '}
                                <span className={diffColors[a.difficulty]}>{a.difficulty}</span>
                                {a.status && <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors[a.status] || ''}`}>{a.status}</span>}
                              </p>
                            </>
                          )}
                          {activeTab === 'coding' && (
                            <>
                              <p className="text-sm font-medium text-slate-200">{a.title}</p>
                              <p className="text-xs text-slate-500">
                                {a.date} · {a.language} · <span className={diffColors[a.difficulty]}>{a.difficulty}</span>
                                {a.status && <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors[a.status] || ''}`}>{a.status}</span>}
                              </p>
                            </>
                          )}
                          {activeTab === 'aptitude' && (
                            <>
                              <p className="text-sm font-medium text-slate-200">{a.category}</p>
                              <p className="text-xs text-slate-500">
                                {a.date} · Accuracy: {a.accuracy} · {a.duration}
                                {a.totalQuestions && ` · ${a.correctAnswers}/${a.totalQuestions} correct`}
                              </p>
                            </>
                          )}
                          {activeTab === 'communication' && (
                            <>
                              <p className="text-sm font-medium text-slate-200">{a.text}</p>
                              <p className="text-xs text-slate-500">
                                {a.date} · Grammar: {a.grammar}% · Clarity: {a.clarity}%
                                {a.vocabulary && ` · Vocab: ${a.vocabulary}%`}
                              </p>
                            </>
                          )}
                          {activeTab === 'ats' && (
                            <>
                              <p className="text-sm font-medium text-slate-200">{a.role}</p>
                              <p className="text-xs text-slate-500">
                                {a.date}{a.fileName && ` · ${a.fileName}`}{a.keywords && ` · Keywords: ${a.keywords}`}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <span className={`text-sm font-bold px-3 py-1 rounded-xl border ${
                        score >= 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : score >= 50 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                        : 'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>
                        {score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
