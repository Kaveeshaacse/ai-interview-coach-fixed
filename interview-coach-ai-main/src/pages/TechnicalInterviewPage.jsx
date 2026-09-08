import { useState, useEffect, useRef } from 'react';
import { technicalAPI } from '../services/api';
import {
  Monitor, Play, Send, CheckCircle2, AlertCircle, Lightbulb,
  Settings, Hash, ArrowRight, Info,
} from 'lucide-react';
import Button from '../components/Button';
import Card, { CardHeader, CardTitle } from '../components/Card';
import CircularProgress from '../components/CircularProgress';
import VoiceInputControls from '../components/VoiceInputControls';
import VoiceQuestionControls from '../components/VoiceQuestionControls';
import useSpeechToText from '../hooks/useSpeechToText';
import useTextToSpeech from '../hooks/useTextToSpeech';
import toast from 'react-hot-toast';

// Job roles — technical questions are derived automatically from the role
const TECHNICAL_ROLES = [
  'Software Engineer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Data Analyst',
];

// What skills each role covers (shown in the UI — derived from role, not selected by user)
const ROLE_SKILL_PREVIEW = {
  'Software Engineer':       'Data Structures, Algorithms, OOP, System Design, REST API',
  'Java Developer':          'Core Java, OOP, Spring Boot, Collections, JVM, Multithreading, SQL',
  'Python Developer':        'Python, OOP, Data Structures, Decorators, Generators, REST API, Testing',
  'Frontend Developer':      'JavaScript, HTML, CSS, React, DOM, Async JS, Web Performance',
  'Backend Developer':       'REST API, Databases, Authentication, SQL, Caching, Scalability, Security',
  'Full Stack Developer':    'JavaScript, React, Node.js, REST API, Databases, Authentication, Git',
  'Data Scientist':          'Python, Machine Learning, Statistics, Data Analysis, Feature Engineering',
  'Machine Learning Engineer':'Python, Deep Learning, TensorFlow, PyTorch, Model Deployment, MLOps, NLP',
  'DevOps Engineer':         'Linux, Docker, Kubernetes, CI/CD, Terraform, Cloud, Monitoring',
  'Cloud Engineer':          'AWS, Cloud Architecture, VPC, Networking, IAM, Serverless, Kubernetes, Security',
  'Data Analyst':            'SQL, Data Analysis, Statistics, Data Visualisation, Tableau, Power BI, ETL',
};

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_DESC = {
  Easy:   'Definitions, basic concepts, fundamental questions.',
  Medium: 'Practical scenarios, implementation reasoning, intermediate concepts.',
  Hard:   'Architecture, optimisation, edge cases, advanced trade-offs.',
};

export default function TechnicalInterviewPage() {
  const [role, setRole]           = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [started, setStarted]     = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading]     = useState(false);

  // Ref to avoid stale state in async handlers
  const answersRef = useRef({});
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const { isListening, isSupported: sttSupported, error: sttError, startListening, stopListening } = useSpeechToText();
  const { isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech();

  // Auto-read question aloud when it changes
  useEffect(() => {
    if (started && questions.length > 0 && questions[currentQ]) {
      speak(questions[currentQ].question || questions[currentQ]);
    }
    return () => stopSpeaking();
  }, [started, currentQ]); // eslint-disable-line

  const handleGenerate = async () => {
    if (!role) return toast.error('Please select a job role');
    setLoading(true);
    try {
      const res = await technicalAPI.generate({
        role,
        difficulty,
        count: 5,
        // No technologies — derived from role on the backend
      });
      const qs = res.data?.questions || [];
      setQuestions(qs.length > 0 ? qs : getFallbackQuestions(role, difficulty));
      setSessionId(res.data?.sessionId || null);
    } catch {
      setQuestions(getFallbackQuestions(role, difficulty));
      setSessionId(null);
      toast('Using built-in question bank', { icon: 'ℹ️' });
    } finally {
      setStarted(true);
      setCurrentQ(0);
      setAnswers({});
      answersRef.current = {};
      setEvaluations({});
      setLoading(false);
      toast.success(`${role} technical interview started!`);
    }
  };

  const qKey = (idx) => questions[idx]?.id || `q_${idx}`;

  const handleStartVoice = () => {
    stopSpeaking();
    const key = qKey(currentQ);
    const current = answersRef.current[key] || '';
    startListening(current, (updated) => {
      setAnswers(prev => {
        const next = { ...prev, [key]: updated };
        answersRef.current = next;
        return next;
      });
    });
  };

  const handleClearAnswer = () => {
    stopListening();
    const key = qKey(currentQ);
    setAnswers(prev => {
      const next = { ...prev, [key]: '' };
      answersRef.current = next;
      return next;
    });
  };

  const handleSubmit = async (idx) => {
    stopListening();
    stopSpeaking();
    const key   = qKey(idx);
    const q     = questions[idx];
    // Use ref to get latest answer (avoids stale state bug)
    const userAns = (answersRef.current[key] || '').trim();
    if (!userAns) return toast.error('Please write or speak your answer first');

    setLoading(true);
    try {
      const payload = {
        sessionId,
        questionIndex: idx,
        question:      q.question || q,
        answer:        userAns,         // ← actual current answer
        role,
        technology:    q.topic || role, // topic from question, not user selection
      };

      const res = sessionId
        ? await technicalAPI.submit({ ...payload, sessionId })
        : await technicalAPI.submit(payload);

      setEvaluations(prev => ({ ...prev, [key]: res.data || {} }));
    } catch {
      // Local fallback evaluation
      setEvaluations(prev => ({ ...prev, [key]: localEvaluate(userAns) }));
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    stopListening();
    stopSpeaking();
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    }
  };

  // ── Setup Screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Technical Mock Interview</h1>
          <p className="text-slate-400 mt-1 text-sm">Select your job role — relevant technical questions are generated automatically.</p>
        </div>

        <Card className="max-w-3xl">
          <CardHeader><CardTitle icon={Settings}>Configure Technical Interview</CardTitle></CardHeader>
          <div className="space-y-5">

            {/* Job Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Job Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-sm text-white outline-none focus:border-purple-500 transition cursor-pointer"
              >
                <option value="">Select job role...</option>
                {TECHNICAL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Skills preview — auto-derived from role */}
            {role && (
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-300 mb-1">Topics covered for {role}:</p>
                  <p className="text-xs text-slate-400">{ROLE_SKILL_PREVIEW[role] || 'Technical fundamentals for this role'}</p>
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-3 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                      difficulty === d
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-[#1a1a3e] border-[#2a2a5a] text-slate-400 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="font-bold mb-0.5">{d}</div>
                    <div className="text-[10px] opacity-70 font-normal">{DIFFICULTY_DESC[d].split(',')[0]}</div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">{DIFFICULTY_DESC[difficulty]}</p>
            </div>

            <Button onClick={handleGenerate} loading={loading} icon={Play} className="w-full py-3" disabled={!role}>
              Start Technical Interview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Active Interview Screen ───────────────────────────────────────────────
  const q    = questions[currentQ] || {};
  const key  = qKey(currentQ);
  const ev   = evaluations[key];
  const qText = q.question || q;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Technical Interview</h1>
          <p className="text-slate-400 text-xs mt-0.5">{role} — {difficulty}</p>
        </div>
        <Button
          onClick={() => { stopListening(); stopSpeaking(); setStarted(false); }}
          variant="secondary" size="sm"
        >
          New Session
        </Button>
      </div>

      {/* Question Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {questions.map((qq, i) => (
          <button
            key={qKey(i)}
            onClick={() => { stopListening(); stopSpeaking(); setCurrentQ(i); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap transition cursor-pointer ${
              currentQ === i
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-[#1a1a3e] border-[#2a2a5a] text-slate-400 hover:border-purple-500/40'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />Q{i + 1}
            {evaluations[qKey(i)] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {q.topic && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
              {q.topic}
            </span>
          )}
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 uppercase">
            {q.difficulty || difficulty}
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400">
            {role}
          </span>
        </div>

        <h2 className="text-xl text-white font-semibold leading-relaxed mb-3">{qText}</h2>

        <VoiceQuestionControls
          isSpeaking={isSpeaking}
          onReplay={() => speak(qText)}
          onStop={stopSpeaking}
        />

        {/* Answer */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>🎙 Your Answer</span>
            <span className="text-slate-500 text-[11px]">{(answers[key] || '').split(/\s+/).filter(Boolean).length} words</span>
          </label>
          <textarea
            value={answers[key] || ''}
            onChange={(e) => {
              const val = e.target.value;
              setAnswers(prev => {
                const next = { ...prev, [key]: val };
                answersRef.current = next;
                return next;
              });
            }}
            rows={6}
            placeholder="Type your answer or use voice. Explain concepts clearly, give examples, mention trade-offs..."
            className="w-full px-4 py-3 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition resize-none"
            disabled={!!ev}
          />
        </div>

        {!ev && (
          <VoiceInputControls
            isListening={isListening}
            isSupported={sttSupported}
            error={sttError}
            onStart={handleStartVoice}
            onStop={stopListening}
            onClear={handleClearAnswer}
            disabled={!!ev || loading}
          />
        )}

        <div className="flex gap-3 mt-4">
          {!ev ? (
            <Button onClick={() => handleSubmit(currentQ)} loading={loading} icon={Send}>
              Submit Answer
            </Button>
          ) : (
            currentQ < questions.length - 1 && (
              <Button onClick={handleNextQuestion} icon={ArrowRight} variant="secondary">
                Next Question
              </Button>
            )
          )}
        </div>
      </Card>

      {/* Evaluation Card */}
      {ev && (
        <div className="grid sm:grid-cols-3 gap-4 animate-fade-in">
          <Card hover={false} className="flex flex-col items-center py-5">
            <CircularProgress value={ev.score || 0} size={100} color="#7c3aed" />
            <p className="text-xs text-slate-400 mt-2 font-medium">Technical Score</p>
            <p className="text-[10px] text-slate-500 mt-1">
              {(ev.score || 0) >= 80 ? '🌟 Excellent' : (ev.score || 0) >= 60 ? '👍 Good' : '📝 Needs work'}
            </p>
          </Card>
          <Card hover={false}>
            <CardHeader><CardTitle icon={CheckCircle2}>Strengths</CardTitle></CardHeader>
            <div className="space-y-1.5">
              {(ev.strengths || ['Answer submitted']).map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{s}
                </div>
              ))}
            </div>
          </Card>
          <Card hover={false}>
            <CardHeader><CardTitle icon={Lightbulb}>To Improve</CardTitle></CardHeader>
            <div className="space-y-1.5">
              {(ev.improvements || ev.weaknesses || ['Add more detail']).map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-yellow-300">
                  <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{s}
                </div>
              ))}
            </div>
          </Card>
          {ev.feedback && (
            <Card hover={false} className="sm:col-span-3">
              <CardHeader><CardTitle icon={AlertCircle}>Feedback</CardTitle></CardHeader>
              <p className="text-xs text-slate-300 leading-relaxed">{ev.feedback}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback questions when API is unavailable
// ─────────────────────────────────────────────────────────────────────────────
function getFallbackQuestions(role, difficulty) {
  const FALLBACK = {
    'Java Developer': {
      Easy:   [{ id: 'f1', question: 'What is the difference between JDK, JRE, and JVM?', topic: 'Java Basics', difficulty }],
      Medium: [{ id: 'f1', question: 'How does a HashMap work internally in Java? How does it handle collisions?', topic: 'Collections', difficulty }],
      Hard:   [{ id: 'f1', question: 'Explain the difference between optimistic and pessimistic locking in JPA/Hibernate.', topic: 'Database', difficulty }],
    },
    'Frontend Developer': {
      Easy:   [{ id: 'f1', question: 'What is the difference between let, const, and var in JavaScript?', topic: 'JavaScript', difficulty }],
      Medium: [{ id: 'f1', question: 'Explain the JavaScript event loop, call stack, and microtask queue.', topic: 'JavaScript', difficulty }],
      Hard:   [{ id: 'f1', question: 'How does React reconciliation work? What is the Virtual DOM?', topic: 'React', difficulty }],
    },
  };
  const roleQ = FALLBACK[role] || {
    Easy:   [{ id: 'f1', question: `Explain a fundamental concept relevant to a ${role} role.`, topic: 'Fundamentals', difficulty }],
    Medium: [{ id: 'f1', question: `Describe a common challenge faced by a ${role} and how you would solve it.`, topic: 'Problem Solving', difficulty }],
    Hard:   [{ id: 'f1', question: `Design a scalable solution for a real-world problem relevant to a ${role} role.`, topic: 'System Design', difficulty }],
  };
  return roleQ[difficulty] || roleQ['Medium'];
}

function localEvaluate(answer) {
  const wc = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasDetail = /\b(because|for example|specifically|which means|this allows|trade-off|complexity|advantage|disadvantage)\b/i.test(answer);
  let score = 30;
  if (wc > 10) score += 15;
  if (wc > 30) score += 15;
  if (wc > 60) score += 10;
  if (hasDetail) score += 15;
  score = Math.min(88, Math.max(10, score));
  return {
    score,
    strengths:    score >= 60 ? ['Answer covers the topic area'] : ['Attempt recorded'],
    improvements: wc < 30 ? ['Provide more detail and explain your reasoning'] : ['Add examples and mention trade-offs'],
    feedback:     wc < 15
      ? 'Answer is too brief. Explain the concept, give an example, and mention any trade-offs or limitations.'
      : 'Score estimated locally (API unavailable). Aim for clear explanations with concrete examples.',
  };
}
