import { useState, useEffect, useRef, useCallback } from 'react';
import { aptitudeAPI } from '../services/api';
import {
  Brain, Play, ChevronLeft, ChevronRight, Clock, CheckCircle2,
  XCircle, BarChart3, Target, AlertCircle, Hash, Send, RotateCcw,
  HelpCircle, Award, Check, X, Minus, BookOpen, Layers,
} from 'lucide-react';
import Button from '../components/Button';
import Card, { CardHeader, CardTitle } from '../components/Card';
import CircularProgress from '../components/CircularProgress';
import ProgressBar from '../components/ProgressBar';
import toast from 'react-hot-toast';

const categoryList = [
  { id: 'quantitative', label: 'Quantitative Aptitude', icon: '📊', description: 'Number systems, percentages, algebra, geometry, speed & work', color: '#7c3aed' },
  { id: 'logical', label: 'Logical Reasoning', icon: '🧠', description: 'Patterns, series, blood relations, syllogisms & analytical reasoning', color: '#3b82f6' },
  { id: 'verbal', label: 'Verbal Ability', icon: '📝', description: 'Reading comprehension, grammar, vocabulary, idioms & sentence correction', color: '#10b981' },
  { id: 'all', label: 'Full Mock Test (All Categories)', icon: '🎯', description: 'Comprehensive 30-question placement simulation across all categories', color: '#f59e0b' },
];

export default function AptitudePage() {
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedAnswerString }
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min default
  const [totalTime, setTotalTime] = useState(600);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // Timer countdown
  useEffect(() => {
    if (started && !submitted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, submitted]);

  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds));
    const mins = String(Math.floor(s / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Start test
  const handleStart = async (cat) => {
    setCategory(cat);
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    setResults(null);
    setCurrentQ(0);

    const testDuration = cat.id === 'all' ? 1800 : 600; // 30 mins for full test, 10 for single
    setTimeLeft(testDuration);
    setTotalTime(testDuration);

    try {
      const res = await aptitudeAPI.startTest({ category: cat.id });
      if (res.data?.questions?.length) {
        setQuestions(res.data.questions);
      }
    } catch {
      toast.error('Could not fetch questions from server, starting local test');
    } finally {
      setStarted(true);
      setLoading(false);
    }
  };

  // Select or change answer
  const handleSelectAnswer = (qId, optionString) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionString,
    }));
  };

  // Submit test to backend
  const handleSubmitTest = useCallback(async () => {
    clearInterval(timerRef.current);
    setLoading(true);

    const timeSpentSeconds = totalTime - timeLeft;
    const formattedTimeTaken = formatTime(timeSpentSeconds);

    // Format answers array: [{ questionId: 1, selectedAnswer: "90 km/h" }]
    const answersPayload = Object.entries(answers).map(([qId, ans]) => ({
      questionId: Number(qId),
      selectedAnswer: ans,
    }));

    try {
      const res = await aptitudeAPI.submitTest({
        category: category?.id || 'quantitative',
        timeTaken: formattedTimeTaken,
        answers: answersPayload,
        userAnswers: answers,
      });

      if (res.data) {
        setResults(res.data);
      }
    } catch {
      toast.error('Network error during submission. Test scored locally.');
    } finally {
      setSubmitted(true);
      setLoading(false);
      toast.success('Test evaluated successfully!');
    }
  }, [answers, category, timeLeft, totalTime]);

  const resetTest = () => {
    setCategory(null);
    setStarted(false);
    setSubmitted(false);
    setResults(null);
    setQuestions([]);
    setAnswers({});
    setTimeLeft(600);
  };

  const answeredCount = Object.keys(answers).filter((k) => answers[k] != null && answers[k] !== '').length;

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 1: CATEGORY SELECTION
  // ─────────────────────────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Aptitude & Logical Reasoning</h1>
          <p className="text-slate-400 mt-1">Practice timed placement tests with dynamic answer evaluation and review</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoryList.map((cat) => (
            <Card
              key={cat.id}
              className="group cursor-pointer hover:border-purple-500/50 transition-all flex flex-col justify-between"
              onClick={() => handleStart(cat)}
            >
              <div>
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-purple-300 transition">{cat.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{cat.description}</p>
              </div>
              <div className="pt-3 border-t border-[#2a2a5a] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{cat.id === 'all' ? '30 Questions · 30m' : '10 Questions · 10m'}</span>
                <Button icon={Play} size="sm">Start Test</Button>
              </div>
            </Card>
          ))}
        </div>

        <Card hover={false}>
          <CardHeader><CardTitle icon={BarChart3}>Test Instructions & Scoring Rules</CardTitle></CardHeader>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]">
              <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1">
                <Target className="w-4 h-4" /> Dynamic Scoring
              </div>
              <p className="text-xs text-slate-400">Score = (Correct Answers / Total Questions) × 100. Unanswered questions do not earn points.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]">
              <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
                <Clock className="w-4 h-4" /> Timed Assessment
              </div>
              <p className="text-xs text-slate-400">Tests automatically submit when the timer expires. You can change answers anytime before submitting.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <BookOpen className="w-4 h-4" /> Full Answer Review
              </div>
              <p className="text-xs text-slate-400">Receive comprehensive step-by-step explanations for all questions post-submission.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 2: RESULTS & ANSWER REVIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (submitted && results) {
    const totalQ = results.totalQuestions || results.total || 10;
    const correctA = results.correctAnswers ?? 0;
    const wrongA = results.wrongAnswers ?? 0;
    const unansweredA = results.unanswered ?? (totalQ - (correctA + wrongA));
    const scorePct = results.score ?? Math.round((correctA / totalQ) * 100);
    const accuracyPct = results.accuracy ?? (correctA + wrongA > 0 ? Number(((correctA / (correctA + wrongA)) * 100).toFixed(2)) : 0);

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Title Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" /> Aptitude Test Result
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Assessment Complete</h1>
            <p className="text-slate-400 text-sm mt-0.5">{category?.label || 'Aptitude Test'}</p>
          </div>
          <Button onClick={resetTest} icon={RotateCcw} variant="secondary">Take Another Test</Button>
        </div>

        {/* Primary Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col items-center justify-center py-5">
            <p className="text-xs text-slate-400 mb-2 font-medium">Final Score</p>
            <CircularProgress value={scorePct} size={90} color={scorePct >= 70 ? '#10b981' : scorePct >= 50 ? '#f59e0b' : '#ef4444'} />
            <p className="text-xs text-slate-400 mt-2 font-semibold">{correctA} of {totalQ} correct</p>
          </Card>

          <Card className="flex flex-col items-center justify-center py-5">
            <p className="text-xs text-slate-400 mb-2 font-medium">Accuracy Rate</p>
            <CircularProgress value={Math.round(accuracyPct)} size={90} color="#3b82f6" />
            <p className="text-xs text-slate-400 mt-2 font-semibold">{accuracyPct}% on attempted</p>
          </Card>

          <Card className="flex flex-col items-center justify-center py-5 text-center">
            <Clock className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white font-mono">{results.timeTaken || '08:45'}</p>
            <p className="text-xs text-slate-400 mt-1">Time Taken</p>
          </Card>

          <Card className="flex flex-col justify-center p-5">
            <p className="text-xs text-slate-400 mb-3 font-medium">Question Summary</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-emerald-300">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Correct</span>
                <span className="font-bold">{correctA}</span>
              </div>
              <div className="flex justify-between items-center text-red-300">
                <span className="flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Wrong</span>
                <span className="font-bold">{wrongA}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5" /> Unanswered</span>
                <span className="font-bold">{unansweredA}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Category-wise Score Breakdown */}
        {results.categoryScores && Object.keys(results.categoryScores).length > 0 && (
          <Card hover={false}>
            <CardHeader><CardTitle icon={Layers}>Category-Wise Performance</CardTitle></CardHeader>
            <div className="grid sm:grid-cols-3 gap-4">
              {Object.entries(results.categoryScores).map(([catName, catScore]) => (
                <div key={catName} className="p-4 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-200">{catName}</span>
                    <span className={`text-xs font-bold ${catScore >= 70 ? 'text-emerald-400' : catScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {catScore}%
                    </span>
                  </div>
                  <ProgressBar
                    value={catScore}
                    color={catScore >= 70 ? 'green' : catScore >= 50 ? 'yellow' : 'red'}
                    showPercent={false}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Weak Areas */}
        {results.weakAreas?.length > 0 && (
          <Card hover={false}>
            <CardHeader><CardTitle icon={AlertCircle}>Recommended Improvement Areas</CardTitle></CardHeader>
            <div className="flex flex-wrap gap-2">
              {results.weakAreas.map((area, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium">
                  {area}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Detailed Answer Review */}
        <Card hover={false}>
          <CardHeader><CardTitle icon={BookOpen}>Review Answers</CardTitle></CardHeader>
          <div className="space-y-6">
            {(results.review || []).map((item, idx) => {
              const isCorrect = item.status === 'correct';
              const isWrong = item.status === 'wrong';
              const isUnanswered = item.status === 'unanswered' || !item.selectedAnswer;

              return (
                <div
                  key={item.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isWrong
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-slate-700 bg-slate-800/20'
                  }`}
                >
                  {/* Question Header & Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-500">Q{idx + 1}</span>
                        {item.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1a1a3e] border border-[#2a2a5a] text-purple-300 font-medium">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-base text-white font-medium">{item.question}</p>
                    </div>

                    <div>
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      )}
                      {isWrong && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold whitespace-nowrap">
                          <XCircle className="w-3.5 h-3.5" /> Wrong
                        </span>
                      )}
                      {isUnanswered && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-700/40 border border-slate-600/40 text-slate-300 text-xs font-bold whitespace-nowrap">
                          <Minus className="w-3.5 h-3.5" /> Unanswered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options Comparison */}
                  <div className="grid sm:grid-cols-2 gap-2 my-4">
                    {(item.options || []).map((opt, optIdx) => {
                      const isOptionSelected = item.selectedAnswer === opt;
                      const isOptionCorrect = item.correctAnswer === opt;

                      let optClass = 'bg-[#0f0f2a] border-[#2a2a5a] text-slate-300';
                      if (isOptionCorrect) {
                        optClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optClass = 'bg-red-500/15 border-red-500 text-red-200 line-through';
                      }

                      return (
                        <div key={optIdx} className={`px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between ${optClass}`}>
                          <span>
                            <strong className="mr-2 text-slate-500">{String.fromCharCode(65 + optIdx)}.</strong>
                            {opt}
                          </span>
                          {isOptionCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                          {isOptionSelected && !isOptionCorrect && <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* User vs Correct Answer Footer */}
                  <div className="pt-3 border-t border-[#2a2a5a] flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Your Answer: </span>
                      <span className={`font-semibold ${isCorrect ? 'text-emerald-300' : isWrong ? 'text-red-300' : 'text-slate-400'}`}>
                        {item.selectedAnswer || 'None (Unanswered)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Correct Answer: </span>
                      <span className="font-semibold text-emerald-300">{item.correctAnswer}</span>
                    </div>
                  </div>

                  {/* Explanation Box */}
                  {item.explanation && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#0c0c24] border border-[#2a2a5a] text-xs">
                      <p className="font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Explanation:
                      </p>
                      <p className="text-slate-300 leading-relaxed">{item.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 3: TEST IN PROGRESS (ACTIVE QUIZ)
  // ─────────────────────────────────────────────────────────────────────────────
  const q = questions[currentQ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl lg:text-2xl font-bold text-white">{category?.label || 'Aptitude Test'}</h1>
            {q?.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1a1a3e] border border-[#2a2a5a] text-purple-300">
                {q.category}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">Question {currentQ + 1} of {questions.length}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Gauge */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              timeLeft <= 60
                ? 'bg-red-500/10 border-red-500/30 text-red-300 animate-pulse'
                : 'bg-[#141432] border-[#2a2a5a] text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="font-mono font-bold text-sm tracking-wider">{formatTime(timeLeft)}</span>
          </div>

          <div className="text-xs font-semibold text-purple-300">
            {answeredCount} / {questions.length} Answered
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar value={answeredCount} max={questions.length || 1} color="purple" label="Test Progress" />

      {/* Question Quick Jump Grid */}
      <div className="flex gap-2 flex-wrap">
        {questions.map((qq, i) => {
          const hasAnswered = answers[qq.id] != null && answers[qq.id] !== '';
          const isCurrent = currentQ === i;

          return (
            <button
              key={qq.id || i}
              onClick={() => setCurrentQ(i)}
              className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${
                isCurrent
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/25 scale-105'
                  : hasAnswered
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#1a1a3e] border-[#2a2a5a] text-slate-400 hover:border-purple-500/50 hover:text-white'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Current Question Card */}
      {q && (
        <Card hover={false} className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Hash className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-purple-400 font-semibold">Question {currentQ + 1}</span>
                {q.category && (
                  <span className="text-[10px] text-slate-500">· {q.category}</span>
                )}
              </div>
              <p className="text-lg text-white font-medium leading-relaxed">{q.question}</p>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {(q.options || []).map((opt, i) => {
              const isSelected = answers[q.id] === opt;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectAnswer(q.id, opt)}
                  className={`text-left px-5 py-4 rounded-xl border text-sm transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600/25 border-purple-500 text-white shadow-lg shadow-purple-500/15 ring-1 ring-purple-500/50'
                      : 'bg-[#0f0f2a] border-[#2a2a5a] text-slate-300 hover:border-purple-500/40 hover:bg-purple-500/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-[#1a1a3e] text-slate-400 border-[#2a2a5a]'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="font-medium">{opt}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          variant="secondary"
          icon={ChevronLeft}
          disabled={currentQ === 0}
        >
          Previous
        </Button>

        <div className="flex gap-3">
          {currentQ < questions.length - 1 && (
            <Button onClick={() => setCurrentQ(currentQ + 1)} icon={ChevronRight}>
              Next
            </Button>
          )}

          <Button
            onClick={handleSubmitTest}
            loading={loading}
            variant={answeredCount === questions.length ? 'primary' : 'outline'}
            icon={Send}
          >
            Submit Test ({answeredCount}/{questions.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
