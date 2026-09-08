import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { learningPathsAPI } from '../services/api';
import {
  ChevronLeft, CheckCircle2, Circle, PlayCircle, BookOpen,
  HelpCircle, ArrowRight, Award, RotateCcw, ExternalLink,
  ChevronDown, ChevronUp, Loader2, AlertCircle, Video, FileText, Globe,
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import CircularProgress from '../components/CircularProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function LearningPathDetailPage() {
  const { pathId } = useParams();
  const navigate = useNavigate();

  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingIdx, setMarkingIdx] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const loadPath = async () => {
    setLoading(true);
    try {
      const res = await learningPathsAPI.getById(pathId);
      if (res.data?.path) setPath(res.data.path);
    } catch (err) {
      console.error('Failed to load learning path:', err);
      toast.error('Could not load learning path details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPath(); }, [pathId]);

  // Toggle completion status (Mark as Complete / Mark as Incomplete)
  const handleToggleTopic = async (idx) => {
    if (!path || !path.topics?.[idx]) return;
    const topic = path.topics[idx];
    const currentCompleted = Boolean(topic.completed);
    const targetCompleted = !currentCompleted;

    setMarkingIdx(idx);

    try {
      const res = await learningPathsAPI.markTopicComplete(pathId, idx, targetCompleted);

      if (res.data?.success) {
        const updatedTopics = [...path.topics];
        updatedTopics[idx] = {
          ...updatedTopics[idx],
          completed: targetCompleted,
          completedAt: targetCompleted ? new Date() : null,
        };

        const completedCount = updatedTopics.filter((t) => t.completed).length;
        const totalCount = updatedTopics.length;
        const newProgress = res.data.progress?.percentage ?? Math.round((completedCount / totalCount) * 100);

        setPath((prev) => ({
          ...prev,
          topics: updatedTopics,
          progress: newProgress,
        }));

        toast.success(targetCompleted ? '✓ Topic marked as completed!' : 'Topic marked as incomplete');
      } else {
        toast.error('Unable to update topic progress');
      }
    } catch (err) {
      console.error('Failed to update topic:', err);
      toast.error('Unable to update topic progress');
    } finally {
      setMarkingIdx(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading learning path..." />;
  if (!path) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Path not found</h3>
        <Button onClick={() => navigate('/skill-recommendations')} icon={ChevronLeft}>Back to Paths</Button>
      </div>
    );
  }

  const completedTopics = path.topics?.filter((t) => t.completed).length ?? 0;
  const totalTopics = path.topics?.length ?? 0;
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : path.progress || 0;
  const progressColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : path.color || '#7c3aed';

  const firstIncompleteIdx = path.topics?.findIndex((t) => !t.completed) ?? -1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/skill-recommendations')}
          className="p-2 rounded-xl hover:bg-white/5 border border-[#2a2a5a] transition cursor-pointer text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs text-slate-500">Learning Path Roadmap</p>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>{path.icon || '📚'}</span> {path.title}
          </h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN: Progress Summary ─────────────────────────────────── */}
        <div className="space-y-5">
          {/* Progress Card */}
          <Card hover={false} className="text-center py-6">
            <p className="text-xs text-slate-400 mb-4 font-medium">Overall Progress</p>
            <div className="flex justify-center mb-4">
              <CircularProgress value={progress} size={110} color={progressColor} />
            </div>
            <div className="text-sm text-white font-semibold mb-1">{completedTopics} of {totalTopics} topics done</div>
            <p className="text-xs text-slate-400">{path.description}</p>

            {progress === 100 && (
              <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4" /> Path Completed! 🎉
              </div>
            )}
          </Card>

          {/* Metadata Card */}
          <Card hover={false}>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#2a2a5a]">
                <span className="text-slate-400">Priority</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  path.priority === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  path.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>{path.priority?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#2a2a5a]">
                <span className="text-slate-400">Level</span>
                <span className="text-white font-semibold">{path.level}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#2a2a5a]">
                <span className="text-slate-400">Total Topics</span>
                <span className="text-white font-semibold">{totalTopics}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Completed</span>
                <span className="text-emerald-400 font-semibold">{completedTopics} / {totalTopics} ({progress}%)</span>
              </div>
            </div>

            {path.reason && (
              <div className="mt-4 p-3 rounded-xl bg-[#0a0a1a] border border-[#2a2a5a]">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-purple-400 font-semibold">Why recommended: </span>{path.reason}
                </p>
              </div>
            )}
          </Card>

          {/* Continue Button */}
          {firstIncompleteIdx !== -1 && (
            <Button
              onClick={() => setExpandedIdx(firstIncompleteIdx)}
              icon={PlayCircle}
              className="w-full"
            >
              Continue from Topic {firstIncompleteIdx + 1}
            </Button>
          )}

          {firstIncompleteIdx === -1 && (
            <Button onClick={() => navigate('/skill-recommendations')} icon={RotateCcw} variant="secondary" className="w-full">
              Back to All Paths
            </Button>
          )}
        </div>

        {/* ── RIGHT COLUMN: Topics Roadmap ───────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Topics Roadmap</span>
            <span className="text-xs text-purple-400 font-normal">{completedTopics} of {totalTopics} completed</span>
          </h2>

          {path.topics?.map((topic, idx) => {
            const isExpanded = expandedIdx === idx;
            const isCurrent = !topic.completed && idx === firstIncompleteIdx;
            const isMarking = markingIdx === idx;
            const isCompleted = Boolean(topic.completed);

            return (
              <Card
                key={topic._id || topic.topicId || idx}
                hover={false}
                className={`transition-all duration-300 ${
                  isCurrent ? 'border-purple-500/50 bg-purple-500/[0.04] ring-1 ring-purple-500/20' :
                  isCompleted ? 'border-emerald-500/30 bg-emerald-500/[0.03]' :
                  'border-[#2a2a5a]'
                }`}
              >
                {/* Topic Header Row */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                  {/* Checkmark / Circle Icon */}
                  <div className="flex-shrink-0">
                    {isMarking ? (
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : isCurrent ? (
                      <ArrowRight className="w-6 h-6 text-purple-400 animate-pulse" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
                      <span className={`text-sm font-semibold transition-all ${
                        isCompleted ? 'text-emerald-300 opacity-90' :
                        isCurrent ? 'text-purple-200' : 'text-white'
                      }`}>
                        {topic.title}
                      </span>

                      {/* Status Badges */}
                      {isCompleted && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1">
                          ✓ Done
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold">
                          NEXT UP
                        </span>
                      )}
                    </div>
                    {topic.description && !isExpanded && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{topic.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#2a2a5a] space-y-4 animate-fade-in">
                    {topic.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">{topic.description}</p>
                    )}

                    {/* Learning Resources List (Accessible Clickable Links) */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-2.5">
                        <BookOpen className="w-3.5 h-3.5" /> Learning Resources
                      </div>
                      {topic.resources && topic.resources.length > 0 ? (
                        <ul className="space-y-2">
                          {topic.resources.map((res, i) => {
                            const title = typeof res === 'object' ? res.title : String(res);
                            const url = typeof res === 'object' ? res.url : (String(res).startsWith('http') ? String(res) : null);
                            const isValidUrl = Boolean(url && (url.startsWith('http://') || url.startsWith('https://')));
                            const type = typeof res === 'object' ? res.type : 'link';

                            return (
                              <li key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0a1a] border border-[#2a2a5a] text-xs">
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  {type === 'video' ? <Video className="w-3.5 h-3.5 text-red-400 flex-shrink-0" /> :
                                   type === 'doc' ? <FileText className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> :
                                   <Globe className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}

                                  {isValidUrl ? (
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-300 hover:text-purple-200 hover:underline font-medium truncate flex items-center gap-1.5"
                                    >
                                      <span>{title}</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-400 italic flex items-center gap-1.5">
                                      <span>{title || 'Resource'}</span>
                                      <span className="text-[10px] text-slate-500">(Resource unavailable)</span>
                                    </span>
                                  )}
                                </div>

                                {isValidUrl ? (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 transition"
                                  >
                                    <span>Open</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-500 italic flex-shrink-0">Unavailable</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No resources available for this topic</p>
                      )}
                    </div>

                    {/* Practice Questions */}
                    {topic.practiceQuestions?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
                          <HelpCircle className="w-3.5 h-3.5" /> Practice Questions
                        </div>
                        <ul className="space-y-2">
                          {topic.practiceQuestions.map((q, i) => (
                            <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#0a0a1a] border border-[#2a2a5a] text-xs text-slate-300">
                              <span className="text-purple-400 font-bold flex-shrink-0">{i + 1}.</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Toggle Completion Button */}
                    <div className="pt-2">
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleToggleTopic(idx); }}
                        loading={isMarking}
                        variant={isCompleted ? 'secondary' : 'primary'}
                        icon={isCompleted ? RotateCcw : CheckCircle2}
                        size="sm"
                      >
                        {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
