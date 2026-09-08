import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { performanceAPI, learningPathsAPI } from '../services/api';
import {
  FileText, Target, Mic, Code2, Brain, Lightbulb, TrendingUp, ArrowRight,
  CheckCircle2, AlertCircle, Clock, Zap, Star, BarChart3, BookOpen,
  Sparkles, Play, ChevronRight, Layers,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../components/Card';
import ScoreCard from '../components/ScoreCard';
import CircularProgress from '../components/CircularProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const defaultDashboard = {
  overallScore: 72,
  resumeScore: 78,
  atsScore: 65,
  interviewScore: 70,
  communicationScore: 74,
  codingScore: 68,
  aptitudeScore: 80,
  strengths: ['Data Structures', 'Communication', 'Problem Solving', 'Resume Format'],
  weaknesses: ['System Design', 'SQL Queries', 'Aptitude Speed', 'ATS Keywords'],
  recommendedActions: [
    { text: 'Analyze your resume', priority: 'high', link: '/resume' },
    { text: 'Match resume to job description', priority: 'high', link: '/job-match' },
    { text: 'Optimize resume with ATS keywords', priority: 'high', link: '/ats' },
    { text: 'Practice system design questions', priority: 'medium', link: '/technical' },
    { text: 'Complete 5 more coding problems', priority: 'medium', link: '/coding' },
    { text: 'Take a mock interview', priority: 'medium', link: '/mock-interview' },
  ],
  recentActivities: [
    { type: 'interview', text: 'Completed Mock Interview — Software Engineer', time: '2 hours ago', score: 78 },
    { type: 'coding', text: 'Solved "Two Sum" — Easy', time: '5 hours ago', score: 100 },
    { type: 'resume', text: 'Resume analyzed — v3.pdf', time: '1 day ago', score: 78 },
    { type: 'aptitude', text: 'Quantitative Aptitude test completed', time: '2 days ago', score: 82 },
  ],
  weeklyProgress: [
    { day: 'Mon', score: 60 }, { day: 'Tue', score: 65 }, { day: 'Wed', score: 62 },
    { day: 'Thu', score: 70 }, { day: 'Fri', score: 72 }, { day: 'Sat', score: 75 }, { day: 'Sun', score: 72 },
  ],
};

const priorityStyles = {
  High: 'bg-red-500/15 border-red-500/30 text-red-300',
  Medium: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  Low: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(defaultDashboard);
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, pathRes] = await Promise.allSettled([
        performanceAPI.getDashboard(),
        learningPathsAPI.getAll(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data) {
        setData({ ...defaultDashboard, ...dashRes.value.data });
      }

      if (pathRes.status === 'fulfilled' && pathRes.value.data?.paths) {
        setLearningPaths(pathRes.value.data.paths);
      }
    } catch (_) {
      // fallback silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard & learning paths..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const scores = [
    { title: 'Resume', score: data.resumeScore, icon: FileText, color: 'purple', link: '/resume' },
    { title: 'ATS', score: data.atsScore, icon: Target, color: 'blue', link: '/ats' },
    { title: 'Job Match', score: data.jobMatchScore || 0, icon: Layers, color: 'cyan', link: '/job-match' },
    { title: 'Interview', score: data.interviewScore, icon: Mic, color: 'green', link: '/mock-interview' },
    { title: 'Communication', score: data.communicationScore, icon: BookOpen, color: 'green', link: '/communication' },
    { title: 'Coding', score: data.codingScore, icon: Code2, color: 'yellow', link: '/coding' },
    { title: 'Aptitude', score: data.aptitudeScore, icon: Brain, color: 'pink', link: '/aptitude' },
  ];

  const radarData = [
    { subject: 'Resume', A: data.resumeScore || 70 },
    { subject: 'ATS', A: data.atsScore || 65 },
    { subject: 'Interview', A: data.interviewScore || 70 },
    { subject: 'Communication', A: data.communicationScore || 74 },
    { subject: 'Coding', A: data.codingScore || 68 },
    { subject: 'Aptitude', A: data.aptitudeScore || 80 },
  ];

  const priorityColors = { high: 'text-red-400 bg-red-500/10', medium: 'text-yellow-400 bg-yellow-500/10', low: 'text-green-400 bg-green-500/10' };
  const activityIcons = { interview: Mic, coding: Code2, resume: FileText, aptitude: Brain };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here's your personalized placement readiness overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">+5% this week</span>
        </div>
      </div>

      {/* Overall Score + Skill Radar */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center py-8">
          <p className="text-sm font-medium text-slate-400 mb-3">Overall Placement Readiness</p>
          <CircularProgress value={data.overallScore} size={160} strokeWidth={12} color="#7c3aed" />
          <p className="mt-4 text-sm text-slate-400 text-center">
            {data.overallScore >= 80 ? 'Excellent! You\'re ready.' : data.overallScore >= 60 ? 'Good progress. Keep going!' : 'Needs improvement. Stay focused!'}
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle icon={BarChart3}>Skill Radar Analysis</CardTitle></CardHeader>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#2a2a5a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Module Scores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {scores.map(({ title, score, icon, color, link }, i) => (
          <Link key={title} to={link} className={`animate-fade-in stagger-${i + 1}`}>
            <ScoreCard title={title} score={score} icon={icon} color={color} size={80} />
          </Link>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SECTION: RECOMMENDED LEARNING PATHS (PERSONALIZED BASED ON USER SCORE)
          ───────────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Recommended Learning Paths</h2>
              <p className="text-xs text-slate-400">Tailored dynamically to address your specific skill gaps & performance scores</p>
            </div>
          </div>
          <Link to="/skill-recommendations" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
            View All Paths <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {learningPaths.slice(0, 3).map((path) => {
            const completedTopics = path.topics?.filter((t) => t.completed).length ?? path.completedTopics ?? 0;
            const totalTopics = path.topics?.length ?? path.totalTopics ?? 0;
            const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : path.progress || 0;

            return (
              <Card key={path._id || path.pathKey} className="flex flex-col justify-between group hover:border-purple-500/40 transition-all">
                <div>
                  {/* Top Bar: Icon + Title + Priority */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${path.color || '#7c3aed'}20`, border: `1px solid ${path.color || '#7c3aed'}40` }}
                      >
                        {path.icon || '📚'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition leading-tight">
                          {path.title}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">Level: {path.level || 'Beginner'}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${priorityStyles[path.priority] || priorityStyles['Medium']}`}>
                      {path.priority?.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{path.description}</p>

                  {/* Why Card Box */}
                  <div className="p-2.5 rounded-lg bg-[#0a0a1a] border border-[#2a2a5a] mb-3">
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      <span className="text-purple-400 font-semibold">Why: </span>{path.reason}
                    </p>
                  </div>

                  {/* Topics Count + Level */}
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-purple-400" /> {totalTopics} Topics</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {completedTopics} Done</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-purple-300">{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1a1a3e] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/skill-recommendations/${path._id}`)}
                  icon={progress > 0 ? ChevronRight : Play}
                  className="w-full"
                  variant={progress > 0 ? 'secondary' : 'primary'}
                  size="sm"
                >
                  {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Weekly Progress & Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle icon={TrendingUp}>Weekly Progress</CardTitle></CardHeader>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={data.weeklyProgress}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#141432', border: '1px solid #2a2a5a', borderRadius: '12px', color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recommended Actions */}
        <Card>
          <CardHeader><CardTitle icon={Zap}>Recommended Actions</CardTitle></CardHeader>
          <div className="space-y-3">
            {data.recommendedActions.map((a, i) => (
              <Link
                key={i}
                to={a.link}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a] hover:border-purple-500/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${priorityColors[a.priority]}`}>
                    {a.priority}
                  </span>
                  <span className="text-sm text-slate-300">{a.text}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Strengths & Skill Gaps */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle icon={CheckCircle2}>Strengths</CardTitle></CardHeader>
          <div className="space-y-2">
            {data.strengths.map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {s}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle icon={AlertCircle}>Skill Gaps Identified</CardTitle></CardHeader>
          <div className="space-y-2">
            {data.weaknesses.map((w) => (
              <div key={w} className="flex items-center gap-2 text-sm text-orange-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {w}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader><CardTitle icon={Clock}>Recent Activities</CardTitle></CardHeader>
        <div className="space-y-3">
          {data.recentActivities.map((a, i) => {
            const Icon = activityIcons[a.type] || Star;
            return (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{a.text}</p>
                    <p className="text-xs text-slate-500">{a.time}</p>
                  </div>
                </div>
                {a.score != null && (
                  <span className="text-sm font-semibold text-purple-300">{a.score}%</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
