import { useState, useRef } from 'react';
import { communicationAPI } from '../services/api';
import {
  MessageSquare, Send, CheckCircle2, AlertCircle, Lightbulb,
  Star, Mic, MicOff, Trash2,
} from 'lucide-react';
import Button from '../components/Button';
import Card, { CardHeader, CardTitle } from '../components/Card';
import CircularProgress from '../components/CircularProgress';
import useSpeechToText from '../hooks/useSpeechToText';
import toast from 'react-hot-toast';

const SAMPLE_PROMPTS = [
  'Tell me about yourself.',
  'Describe a challenging project you worked on.',
  'Why should we hire you?',
  'What are your strengths and weaknesses?',
  'Where do you see yourself in 5 years?',
];

export default function CommunicationPage() {
  const [question, setQuestion] = useState(SAMPLE_PROMPTS[0]);
  const [text, setText]     = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Ref to capture the ACTUAL current text at submit time (avoids stale state)
  const textRef = useRef('');

  // STT hook
  const {
    isListening,
    isSupported: sttSupported,
    error: sttError,
    startListening,
    stopListening,
  } = useSpeechToText();

  const handleTextChange = (val) => {
    setText(val);
    textRef.current = val;
    setResult((previous) => previous ? { ...previous, _outdated: true } : null);
  };

  const handleQuestionChange = (nextQuestion) => {
    setQuestion(nextQuestion);
    setResult(null);
  };

  const handleStartVoice = () => {
    startListening(textRef.current, (updated) => {
      setText(updated);
      textRef.current = updated;
    });
  };

  const handleStopVoice = () => {
    stopListening();
  };

  const handleClear = () => {
    stopListening();
    setText('');
    textRef.current = '';
    setResult(null);
  };

  const handleEvaluate = async () => {
    stopListening();

    // Use ref — NOT state — to get the actual current text
    const currentText = textRef.current.trim();

    if (!currentText) {
      return toast.error('Please provide your answer before evaluating.');
    }
    if (!question.trim()) return toast.error('Please select an interview question before evaluating.');

    setLoading(true);
    setResult(null); // Clear previous result before new evaluation

    try {
      // Pass the ACTUAL current text — not stale state
      const res = await communicationAPI.evaluate({ question, answer: currentText });

      if (!res.data || typeof res.data.overallScore === 'undefined') {
        throw new Error('Invalid response from server');
      }

      setResult({
        ...res.data,
        _evaluatedQuestion: question,
        _evaluatedText: currentText, // store for verification
        _wordCount:     currentText.split(/\s+/).filter(Boolean).length,
      });
      toast.success('Evaluation complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scoreCards = result
    ? [
        { label: 'Overall', score: result.overallScore || 0, color: '#ec4899', icon: Star },
        ...Object.entries(result.evaluation || {}).map(([key, item]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1), score: item.score || 0, color: '#7c3aed', icon: MessageSquare,
        })),
      ]
    : [];

  const severityColors = {
    high:   'bg-red-500/10 border-red-500/20 text-red-300',
    medium: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
    low:    'bg-blue-500/10 border-blue-500/20 text-blue-300',
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Communication Evaluator</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Type or speak your interview answer — get dynamic scoring based on your actual response.
        </p>
      </div>

      <Card hover={false}>
        <CardHeader><CardTitle icon={MessageSquare}>Selected Interview Question</CardTitle></CardHeader>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt) => (
            <button key={prompt} type="button" onClick={() => handleQuestionChange(prompt)} className={`text-[11px] px-3 py-1.5 rounded-lg border transition ${question === prompt ? 'bg-purple-600/20 border-purple-500 text-purple-200' : 'bg-[#1a1a3e] border-[#2a2a5a] text-slate-400 hover:border-purple-500/40'}`}>
              {prompt}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-white font-medium">{question}</p>
      </Card>

      {/* Sample prompts */}

      {/* Input Card */}
      <Card>
        <CardHeader><CardTitle icon={MessageSquare}>Your Interview Answer</CardTitle></CardHeader>

        <textarea
          id="communication-input"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={7}
          placeholder="Type or speak your answer here. For example: 'Tell me about yourself' — write your full response. The evaluation scores your ACTUAL answer, so different responses will produce different scores..."
          className="w-full px-4 py-3 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition resize-none"
        />

        {/* Word count + voice controls */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{wordCount} words</span>
            {wordCount > 0 && wordCount < 20 && (
              <span className="text-xs text-amber-400">Too short — aim for 50+ words for accurate scoring</span>
            )}

            {/* Voice input button */}
            {sttSupported ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? handleStopVoice : handleStartVoice}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    isListening
                      ? 'bg-red-500/20 border-red-500/40 text-red-300 animate-pulse'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                  }`}
                >
                  {isListening ? <><MicOff className="w-3.5 h-3.5" /> Stop</> : <><Mic className="w-3.5 h-3.5" /> Speak</>}
                </button>
                {text && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#2a2a5a] bg-[#1a1a3e] text-slate-400 hover:text-red-400 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-500">Voice not supported in this browser</span>
            )}

            {sttError && <span className="text-xs text-red-400">{sttError}</span>}
          </div>

          <Button onClick={handleEvaluate} loading={loading} icon={Send} disabled={!text.trim()}>
            Evaluate Answer
          </Button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">

          {/* Evaluated text confirmation */}
          <div className="p-3 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a] text-xs text-slate-400 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Question: <span className="text-slate-300">"{result._evaluatedQuestion}"</span><br />
              Answer: <span className="text-slate-300">"{(result._evaluatedText || '').slice(0, 80)}{(result._evaluatedText || '').length > 80 ? '...' : ''}"</span>
              {' '}({result._wordCount} words)
              {result._outdated && <span className="text-amber-400 ml-1">(outdated - re-evaluate after editing)</span>}
            </span>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {scoreCards.map(({ label, score, color, icon: Icon }) => (
              <Card key={label} className="flex flex-col items-center py-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <CircularProgress value={score} size={80} color={color} />
                <p className="text-xs font-medium text-slate-300 mt-2">{label}</p>
                <p className="text-[10px] text-slate-500">{score}/100</p>
              </Card>
            ))}
          </div>

          {/* Dynamic feedback bar */}
          <Card hover={false}>
            <CardHeader><CardTitle icon={Star}>Score Summary</CardTitle></CardHeader>
            <div className="space-y-3">
              {Object.entries(result.evaluation || {}).map(([key, item]) => {
                const label = key.charAt(0).toUpperCase() + key.slice(1);
                const score = item.score || 0;
                const color = '#7c3aed';
                return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{label}</span>
                    <span className="font-bold" style={{ color }}>{score}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1a1a3e] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{item.reason}</p>
                </div>
                );
              })}
            </div>
          </Card>

          <Card hover={false}>
            <CardHeader><CardTitle icon={CheckCircle2}>Strengths & Improvements</CardTitle></CardHeader>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div><p className="text-emerald-400 font-semibold mb-2">Strengths</p>{(result.strengths || []).map((item) => <p key={item} className="text-slate-300 mb-1">✓ {item}</p>)}</div>
              <div><p className="text-amber-400 font-semibold mb-2">Improvements</p>{(result.improvements || []).map((item) => <p key={item} className="text-slate-300 mb-1">⚠ {item}</p>)}</div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#141432] border border-[#2a2a5a] text-sm text-slate-300">{result.overallFeedback}</div>
          </Card>

          {/* Mistakes */}
          {result.mistakes && result.mistakes.length > 0 && (
            <Card hover={false}>
              <CardHeader><CardTitle icon={AlertCircle}>Issues Found</CardTitle></CardHeader>
              <div className="space-y-2.5">
                {result.mistakes.map((m, i) => (
                  <div key={i} className={`flex items-start justify-between p-3 rounded-xl border ${severityColors[m.severity] || severityColors.low}`}>
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed">{m.text}</span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 uppercase ml-2 flex-shrink-0">{m.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Improved answer */}
          {result.improvedAnswer && (
            <Card hover={false}>
              <CardHeader><CardTitle icon={Lightbulb}>How to Improve</CardTitle></CardHeader>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <p className="text-sm text-slate-300 leading-relaxed">{result.improvedAnswer}</p>
              </div>
            </Card>
          )}

          {/* Re-evaluate button */}
          <div className="flex gap-3">
            <Button onClick={handleClear} variant="secondary" icon={Trash2}>
              Clear & Start Over
            </Button>
            <Button onClick={handleEvaluate} loading={loading} icon={Send} variant="secondary">
              Re-evaluate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

