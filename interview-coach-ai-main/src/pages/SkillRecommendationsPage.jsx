import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { learningPathsAPI } from '../services/api';
import {
  BookOpen, Play, ChevronRight, BarChart3, Target, Sparkles,
  Clock, Star, TrendingUp, Award, RefreshCw, Brain,
  AlertCircle, CheckCircle2,
} from 'lucide-react';
import Button from '../components/Button';
import Card, { CardHeader, CardTitle } from '../components/Card';
import CircularProgress from '../components/CircularProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const PRIORITY_STYLES = {
  High: 'bg-red-500/15 border-red-500/30 text-red-300',
  Medium: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
  Low: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
};

const LEVEL_STYLES = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-red-400',
};

export default function SkillRecommendationsPage() {
  const navigate = useNavigate();
  const [paths, setPaths] = useState([]);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPaths = async () => {
    setLoading(true);
    try {
      const res = await learningPathsAPI.getAll();
      if (res.data?.paths) {
        setPaths(res.data.paths);
        setPerformanceSummary(res.data.performanceSummary || null);
      }
    } catch (err) {
      toast.error('Could not load learning paths');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPaths(); }, []);

  if (loading) return <LoadingSpinner text="Generating your personalized learning paths..." />;

  const highPriority = paths.filter((p) => p.priority === 'High');
  const medPriority = paths.filter((p) => p.priority === 'Medium');
  const lowPriority = paths.filter((p) => p.priority === 'Low');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI-Personalized Paths
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Recommended Learning Paths</h1>
          <p className="text-slate-400 mt-1 text-sm">Generated based on your actual performance data across all modules</p>
        </div>
        <Button onClick={loadPaths} icon={RefreshCw} variant="secondary" size="sm">
          Refresh Recommendations
        </Button>
      </div>

      {/* Performance Snapshot Banner */}
      {performanceSummary && (
        <Card hover={false} className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardHeader><CardTitle icon={BarChart3}>Your Performance Snapshot</CardTitle></CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Coding', value: performanceSummary.codingScore, icon: '💻' },
              { label: 'Aptitude', value: performanceSummary.aptitudeScore, icon: '📊' },
              { label: 'Logical', value: performanceSummary.logicalScore, icon: '🧠' },
              { label: 'Verbal', value: performanceSummary.verbalScore, icon: '📝' },
              { label: 'Communication', value: performanceSummary.communicationScore, icon: '🗣️' },
              { label: 'Language', value: performanceSummary.primaryLanguage, icon: '⌨️', isText: true },
            ].map(({ label, value, icon, isText }) => (
              <div key={label} className="p-3 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a] text-center">
                <div className="text-lg mb-1">{icon}</div>
                <div className={`font-bold text-sm ${
                  isText ? 'text-purple-300' :
                  value === null ? 'text-slate-500' :
                  value >= 70 ? 'text-emerald-400' : value >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {isText ? (value || '—') : value !== null ? `${value}%` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          {performanceSummary.weakAreas?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-orange-400" /> Weak Areas:</span>
              {performanceSummary.weakAreas.slice(0, 5).map((a, i) => (
                <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 font-medium">{a}</span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* HIGH PRIORITY PATHS */}
      {highPriority.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-bold text-white">High Priority</h2>
            <span className="text-xs text-slate-500">— Recommended for immediate attention</span>
          </div>
          <PathGrid paths={highPriority} navigate={navigate} onRefresh={loadPaths} />
        </section>
      )}

      {/* MEDIUM PRIORITY PATHS */}
      {medPriority.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Medium Priority</h2>
            <span className="text-xs text-slate-500">— Worth working on in parallel</span>
          </div>
          <PathGrid paths={medPriority} navigate={navigate} onRefresh={loadPaths} />
        </section>
      )}

      {/* LOW PRIORITY */}
      {lowPriority.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Low Priority</h2>
            <span className="text-xs text-slate-500">— Explore when you have time</span>
          </div>
          <PathGrid paths={lowPriority} navigate={navigate} onRefresh={loadPaths} />
        </section>
      )}

      {paths.length === 0 && (
        <Card hover={false} className="text-center py-12">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">You're crushing it!</h3>
          <p className="text-slate-400 text-sm">No weak areas detected right now. Keep practicing to maintain your streak!</p>
        </Card>
      )}
    </div>
  );
}

function PathGrid({ paths, navigate }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {paths.map((path) => (
        <PathCard key={path._id} path={path} navigate={navigate} />
      ))}
    </div>
  );
}

function PathCard({ path, navigate }) {
  const completedTopics = path.topics?.filter((t) => t.completed).length ?? path.completedTopics ?? 0;
  const totalTopics = path.topics?.length ?? path.totalTopics ?? 0;
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : path.progress || 0;

  const progressColor =
    progress >= 70 ? '#10b981' :
    progress >= 40 ? '#f59e0b' : path.color || '#7c3aed';

  return (
    <Card className="flex flex-col justify-between group hover:border-purple-500/40 transition-all">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${path.color}20`, border: `1px solid ${path.color}40` }}
            >
              {path.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition leading-tight">
                {path.title}
              </h3>
              <span className={`text-[10px] font-semibold ${LEVEL_STYLES[path.level] || 'text-slate-400'}`}>
                {path.level}
              </span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${PRIORITY_STYLES[path.priority]}`}>
            {path.priority?.toUpperCase()}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-3">{path.description}</p>

        {/* Why Recommended */}
        <div className="p-2.5 rounded-lg bg-[#0a0a1a] border border-[#2a2a5a] mb-3">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <span className="text-purple-400 font-semibold">Why: </span>{path.reason}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>{totalTopics} Topics</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{completedTopics} Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
            <span>Progress</span>
            <span className="font-semibold" style={{ color: progressColor }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#1a1a3e] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: progressColor }}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => navigate(`/skill-recommendations/${path._id}`)}
        icon={progress > 0 ? ChevronRight : Play}
        className="w-full"
        variant={progress > 0 ? 'secondary' : 'primary'}
      >
        {progress === 100 ? 'Review Path' : progress > 0 ? 'Continue Learning' : 'Start Learning'}
      </Button>
    </Card>
  );
}
