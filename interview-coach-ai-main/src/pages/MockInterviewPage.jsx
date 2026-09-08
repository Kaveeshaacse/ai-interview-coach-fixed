import { useState, useEffect, useRef } from "react";
import { interviewAPI } from "../services/api";
import {
  Mic,
  Play,
  Send,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Settings,
  Hash,
  BarChart3,
  MessageSquare,
  Users,
} from "lucide-react";
import Button from "../components/Button";
import Card, { CardHeader, CardTitle } from "../components/Card";
import CircularProgress from "../components/CircularProgress";
import ProgressBar from "../components/ProgressBar";
import VoiceInputControls from "../components/VoiceInputControls";
import VoiceQuestionControls from "../components/VoiceQuestionControls";
import useSpeechToText from "../hooks/useSpeechToText";
import useTextToSpeech from "../hooks/useTextToSpeech";
import toast from "react-hot-toast";

const BEHAVIOURAL_TOPICS = [
  "Leadership",
  "Teamwork",
  "Communication",
  "Problem Solving",
  "Conflict Resolution",
  "Adaptability",
  "Time Management",
  "Decision Making",
  "Motivation",
  "General Behavioural",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const DIFFICULTY_DESC = {
  Easy: "Basic behavioural questions — suitable for entry-level interviews.",
  Medium: "Scenario-based questions — requires specific examples.",
  Hard: "Complex situations — requires depth, reflection, and measurable outcomes.",
};

export default function MockInterviewPage() {
  const [behaviouralTopic, setBehaviouralTopic] = useState(
    "General Behavioural",
  );
  const [difficulty, setDifficulty] = useState("Medium");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [allAnswered, setAllAnswered] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [allEvaluations, setAllEvaluations] = useState([]);

  // Capture the current answer in a ref to avoid stale state in async handlers
  const answerRef = useRef("");

  const {
    isListening,
    isSupported: sttSupported,
    error: sttError,
    startListening,
    stopListening,
  } = useSpeechToText();
  const { isSpeaking, speak, stop: stopSpeaking } = useTextToSpeech();

  // Sync answer state to ref (fixes stale state closure bug)
  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  // Auto-read question aloud when question changes
  useEffect(() => {
    if (started && questions.length > 0 && questions[currentQ]) {
      const qText = questions[currentQ].question || questions[currentQ];
      speak(qText);
    }
    return () => stopSpeaking();
  }, [started, currentQ]); // eslint-disable-line

  const handleStart = async () => {
    try {
      const res = await interviewAPI.start({
        behaviouralTopic,
        difficulty,
        count: 5,
        // Preserve backend compat fields
        type: "Behavioral",
        role: `Behavioural — ${behaviouralTopic}`,
      });

      const qs = res.data?.questions || [];
      setQuestions(
        qs.length > 0 ? qs : getFallbackQuestions(behaviouralTopic, difficulty),
      );
      setSessionId(res.data?.sessionId || null);
    } catch {
      setQuestions(getFallbackQuestions(behaviouralTopic, difficulty));
      setSessionId(null);
      toast("Using built-in question bank", { icon: "ℹ️" });
    } finally {
      setStarted(true);
      setCurrentQ(0);
      setAnswer("");
      answerRef.current = "";
      setEvaluation(null);
      setAllAnswered(false);
      setSessionSummary(null);
      setAllEvaluations([]);
      toast.success(`${behaviouralTopic} interview started!`);
    }
  };

  const handleStartVoice = () => {
    stopSpeaking();
    startListening(answerRef.current, (updatedText) => {
      setAnswer(updatedText);
      answerRef.current = updatedText;
    });
  };

  const handleClearAnswer = () => {
    stopListening();
    setAnswer("");
    answerRef.current = "";
  };

  const handleSubmitAnswer = async () => {
    stopListening();
    stopSpeaking();

    // Use ref to get the latest answer (avoids stale state bug)
    const currentAnswer = answerRef.current.trim();
    if (!currentAnswer)
      return toast.error("Please speak or type your answer before submitting");

    setSubmitting(true);
    const q = questions[currentQ];
    const qText = q?.question || q || "";

    try {
      const payload = {
        questionIndex: currentQ,
        question: qText,
        answer: currentAnswer, // ← actual current answer, not stale state
        role: `Behavioural — ${behaviouralTopic}`,
      };

      const res = sessionId
        ? await interviewAPI.submitAnswer(sessionId, payload)
        : await interviewAPI.evaluate(payload);

      const ev = res.data || {};
      setEvaluation(ev);
      setAllEvaluations((prev) => [
        ...prev,
        { question: qText, answer: currentAnswer, ...ev },
      ]);
    } catch (err) {
      // Fallback: local heuristic so the user still gets feedback
      const ev = localEvaluate(currentAnswer);
      setEvaluation(ev);
      setAllEvaluations((prev) => [
        ...prev,
        { question: qText, answer: currentAnswer, ...ev },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    stopListening();
    stopSpeaking();
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer("");
      answerRef.current = "";
      setEvaluation(null);
    } else {
      // Build session summary from all evaluations
      const evals = [...allEvaluations];
      const avgScore =
        evals.length > 0
          ? Math.round(
              evals.reduce((s, e) => s + (e.score || 0), 0) / evals.length,
            )
          : 0;
      setSessionSummary({ score: avgScore, evaluations: evals });
      setAllAnswered(true);
    }
  };

  const resetInterview = () => {
    stopListening();
    stopSpeaking();
    setStarted(false);
    setCurrentQ(0);
    setAnswer("");
    answerRef.current = "";
    setEvaluation(null);
    setAllAnswered(false);
    setSessionSummary(null);
    setAllEvaluations([]);
  };

  // ── Configuration Screen ──────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            AI Mock Interview
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Behavioural interview practice. Choose a topic and difficulty — the
            AI will ask STAR-style questions.
          </p>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle icon={Settings}>Configure Mock Interview</CardTitle>
          </CardHeader>
          <div className="space-y-6">
            {/* Behavioural Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Behavioural
                Topic *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {BEHAVIOURAL_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setBehaviouralTopic(topic)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer text-left flex items-start gap-1.5 ${
                      behaviouralTopic === topic
                        ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10"
                        : "bg-[#1a1a3e] border-[#2a2a5a] text-slate-400 hover:border-purple-500/40"
                    }`}
                  >
                    <span className="leading-tight">{topic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-3 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                      difficulty === d
                        ? "bg-purple-600/20 border-purple-500 text-purple-300"
                        : "bg-[#1a1a3e] border-[#2a2a5a] text-slate-400 hover:border-purple-500/40"
                    }`}
                  >
                    <div className="font-bold mb-0.5">{d}</div>
                    <div className="text-[10px] opacity-70 font-normal">
                      {DIFFICULTY_DESC[d].split(" — ")[0]}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {DIFFICULTY_DESC[difficulty]}
              </p>
            </div>

            {/* Summary */}
            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-slate-300 space-y-1">
              <p>
                <span className="text-purple-400 font-semibold">Topic:</span>{" "}
                {behaviouralTopic}
              </p>
              <p>
                <span className="text-purple-400 font-semibold">
                  Difficulty:
                </span>{" "}
                {difficulty}
              </p>
              <p>
                <span className="text-purple-400 font-semibold">Format:</span>{" "}
                STAR-style behavioural questions (5 questions)
              </p>
            </div>

            <Button onClick={handleStart} icon={Play} className="w-full py-3">
              Start Mock Interview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Final Result Screen ───────────────────────────────────────────────────
  if (allAnswered && sessionSummary) {
    const avgStrengths = [
      ...new Set(sessionSummary.evaluations.flatMap((e) => e.strengths || [])),
    ].slice(0, 4);
    const avgWeaknesses = [
      ...new Set(sessionSummary.evaluations.flatMap((e) => e.weaknesses || [])),
    ].slice(0, 3);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Interview Complete! 🎉
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {behaviouralTopic} — {difficulty}
            </p>
          </div>
          <Button onClick={resetInterview} variant="secondary">
            New Interview
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card hover={false} className="flex flex-col items-center py-8">
            <p className="text-xs text-slate-400 font-medium mb-3">
              Overall Score
            </p>
            <CircularProgress
              value={sessionSummary.score}
              size={140}
              strokeWidth={12}
              color="#7c3aed"
            />
            <p className="text-xs text-slate-500 mt-3 text-center">
              {sessionSummary.score >= 80
                ? "Excellent performance!"
                : sessionSummary.score >= 60
                  ? "Good — keep practicing."
                  : "Practice with the STAR method."}
            </p>
          </Card>
          <Card hover={false}>
            <CardHeader>
              <CardTitle icon={CheckCircle2}>Strengths</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {avgStrengths.length > 0 ? (
                avgStrengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-emerald-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{" "}
                    {s}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">
                  Complete questions to see strengths.
                </p>
              )}
            </div>
          </Card>
          <Card hover={false}>
            <CardHeader>
              <CardTitle icon={AlertCircle}>Areas to Improve</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {avgWeaknesses.length > 0 ? (
                avgWeaknesses.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-orange-300"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{" "}
                    {w}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">
                  Great job — no major areas flagged.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Per-question breakdown */}
        {sessionSummary.evaluations.length > 0 && (
          <Card hover={false}>
            <CardHeader>
              <CardTitle icon={BarChart3}>
                Question-by-Question Breakdown
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {sessionSummary.evaluations.map((ev, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Question {i + 1}
                    </span>
                    <span
                      className={`text-sm font-bold ${ev.score >= 70 ? "text-emerald-400" : ev.score >= 45 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {ev.score || 0}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 italic mb-1">
                    {ev.question}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Your answer: {ev.answer?.slice(0, 80)}
                    {ev.answer?.length > 80 ? "..." : ""}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ── Active Interview Screen ───────────────────────────────────────────────
  const q = questions[currentQ] || {};
  const currentQuestionText = q.question || q;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Mock Interview</h1>
          <p className="text-slate-400 text-xs">
            {behaviouralTopic} — {difficulty}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
            <Hash className="w-4 h-4 text-purple-400" /> Question {currentQ + 1}{" "}
            of {questions.length}
          </span>
          <Button onClick={resetInterview} variant="ghost" size="sm">
            End
          </Button>
        </div>
      </div>

      <ProgressBar
        value={currentQ + 1}
        max={questions.length}
        label="Interview Progress"
        color="purple"
      />

      {/* Question Card */}
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
            {behaviouralTopic}
          </span>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 uppercase">
            {q.difficulty || difficulty}
          </span>
        </div>
        <p className="text-lg text-white font-semibold leading-relaxed mb-2">
          {currentQuestionText}
        </p>
        <VoiceQuestionControls
          isSpeaking={isSpeaking}
          onReplay={() => speak(currentQuestionText)}
          onStop={stopSpeaking}
        />
      </Card>

      {/* Answer Card */}
      <Card hover={false}>
        <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span>🎙 Your Answer</span>
          <span className="text-slate-500 text-[11px]">
            Type or use voice dictation ·{" "}
            {answer.split(/\s+/).filter(Boolean).length} words
          </span>
        </label>
        <textarea
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            answerRef.current = e.target.value;
          }}
          rows={6}
          placeholder="Speak your answer or type here. Use the STAR method: describe the Situation, Task, Action you took, and the Result..."
          className="w-full px-4 py-3 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition resize-none"
          disabled={!!evaluation}
        />

        {!evaluation && (
          <VoiceInputControls
            isListening={isListening}
            isSupported={sttSupported}
            error={sttError}
            onStart={handleStartVoice}
            onStop={stopListening}
            onClear={handleClearAnswer}
            disabled={!!evaluation || submitting}
          />
        )}

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleSubmitAnswer}
            loading={submitting}
            icon={Send}
            disabled={!!evaluation}
          >
            Submit Answer
          </Button>
          {evaluation && (
            <Button onClick={handleNext} icon={ArrowRight} variant="secondary">
              {currentQ < questions.length - 1
                ? "Next Question"
                : "Finish Interview"}
            </Button>
          )}
        </div>
      </Card>

      {/* Evaluation Card */}
      {evaluation && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card hover={false} className="flex flex-col items-center py-4">
              <CircularProgress
                value={evaluation.score || 0}
                size={90}
                color="#7c3aed"
              />
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Answer Score
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {(evaluation.score || 0) >= 80
                  ? "🌟 Excellent"
                  : (evaluation.score || 0) >= 60
                    ? "👍 Good"
                    : "📝 Needs work"}
              </p>
            </Card>
            <Card hover={false}>
              <CardHeader>
                <CardTitle icon={CheckCircle2}>Strengths</CardTitle>
              </CardHeader>
              <div className="space-y-1.5">
                {(evaluation.strengths || []).slice(0, 3).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-emerald-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{" "}
                    {s}
                  </div>
                ))}
              </div>
            </Card>
            <Card hover={false}>
              <CardHeader>
                <CardTitle icon={AlertCircle}>Improvements</CardTitle>
              </CardHeader>
              <div className="space-y-1.5">
                {(evaluation.weaknesses || []).map((w, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-orange-300"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{" "}
                    {w}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card hover={false}>
            <CardHeader>
              <CardTitle icon={MessageSquare}>AI Feedback</CardTitle>
            </CardHeader>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {evaluation.feedback}
            </p>
            {evaluation.improvedAnswer && (
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> How to Improve
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation.improvedAnswer}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Local fallback questions (used when API is unavailable)
// ─────────────────────────────────────────────────────────────────────────────
function getFallbackQuestions(topic, difficulty) {
  const FALLBACK = {
    Leadership: {
      Easy: [
        {
          question:
            "Tell me about a time you took responsibility for a task or project.",
          topic,
          difficulty,
        },
      ],
      Medium: [
        {
          question:
            "Tell me about a time you had to lead a team through a difficult situation.",
          topic,
          difficulty,
        },
      ],
      Hard: [
        {
          question:
            "Tell me about a time you led a team through significant disagreement while maintaining performance.",
          topic,
          difficulty,
        },
      ],
    },
    Teamwork: {
      Easy: [
        {
          question:
            "Tell me about a time you worked effectively as part of a team.",
          topic,
          difficulty,
        },
      ],
      Medium: [
        {
          question:
            "Tell me about a time your team had different opinions. How did you reach consensus?",
          topic,
          difficulty,
        },
      ],
      Hard: [
        {
          question:
            "Tell me about a time a team project was failing and how you personally turned it around.",
          topic,
          difficulty,
        },
      ],
    },
    "General Behavioural": {
      Easy: [
        {
          question:
            "Tell me about yourself — your background, your strengths, and what you are most proud of.",
          topic,
          difficulty,
        },
      ],
      Medium: [
        {
          question:
            "Tell me about a time you failed to meet a goal. What happened and what did you do about it?",
          topic,
          difficulty,
        },
      ],
      Hard: [
        {
          question:
            "Tell me about the most challenging professional situation you have faced. How did you handle it?",
          topic,
          difficulty,
        },
      ],
    },
  };
  const topicQ = FALLBACK[topic] || FALLBACK["General Behavioural"];
  return topicQ[difficulty] || topicQ["Medium"];
}

// ─────────────────────────────────────────────────────────────────────────────
// Local evaluation fallback (used when API fails)
// ─────────────────────────────────────────────────────────────────────────────
function localEvaluate(answer) {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasStar =
    /\b(i |my |me |situation|task|result|outcome|achieved|completed)\b/i.test(
      answer,
    );
  let score = 30;
  if (wordCount > 10) score += 15;
  if (wordCount > 30) score += 15;
  if (wordCount > 60) score += 10;
  if (wordCount > 100) score += 5;
  if (hasStar) score += 15;
  score = Math.min(90, Math.max(10, score));
  return {
    score,
    strengths:
      score >= 60 ? ["Answer provided and evaluated"] : ["Attempt recorded"],
    weaknesses:
      wordCount < 30
        ? ["Answer is too brief — provide a full example"]
        : ["Add more specific details and outcomes"],
    feedback:
      wordCount < 15
        ? "Your answer is very brief. Please provide a complete example using the STAR method."
        : `Score estimated locally (API unavailable). Aim for 80+ words with a clear situation, your actions, and the result.`,
    improvedAnswer:
      "Use the STAR format: Situation → Task → Action → Result. Be specific about what YOU did.",
  };
}
