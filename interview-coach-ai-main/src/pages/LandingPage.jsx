import { Link } from 'react-router-dom';
import {
  FileText,
  Target,
  Mic,
  Code2,
  Brain,
  Lightbulb,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import Button from '../components/Button';

const features = [
  {
    icon: FileText,
    title: 'Resume Analysis',
    desc: 'Get instant AI-powered feedback on your resume with actionable suggestions to stand out.',
    color: '#7c3aed',
  },
  {
    icon: Target,
    title: 'ATS Optimization',
    desc: 'Check your resume against ATS systems and ensure it passes automated screening filters.',
    color: '#3b82f6',
  },
  {
    icon: Mic,
    title: 'AI Mock Interview',
    desc: 'Practice with realistic interview questions and receive instant AI feedback on your answers.',
    color: '#10b981',
  },
  {
    icon: Code2,
    title: 'Coding Practice',
    desc: 'Sharpen your coding skills with curated problems in Java, Python, and C++ with instant evaluation.',
    color: '#f59e0b',
  },
  {
    icon: Brain,
    title: 'Aptitude Practice',
    desc: 'Master quantitative aptitude, logical reasoning, and verbal ability with timed practice tests.',
    color: '#ec4899',
  },
  {
    icon: Lightbulb,
    title: 'Skill Recommendations',
    desc: 'Discover skill gaps and get personalized learning paths based on your target job roles.',
    color: '#06b6d4',
  },
];

const stats = [
  { value: '10K+', label: 'Students Prepared' },
  { value: '95%', label: 'Placement Rate' },
  { value: '500+', label: 'Companies' },
  { value: '50K+', label: 'Mock Interviews' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] overflow-hidden">
      {/* ── Navbar ──────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-[#2a2a5a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Interview Coach</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" icon={Sparkles}>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* bg glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-600/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium animate-fade-in">
            <Sparkles className="w-4 h-4" /> AI-Powered Placement Preparation
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in stagger-1">
            Ace Your Next Interview with{' '}
            <span className="gradient-text">AI-Powered</span> Coaching
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in stagger-2">
            Prepare smarter with intelligent resume analysis, mock interviews, coding practice,
            and personalized skill recommendations — all powered by cutting-edge AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-3">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight} className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                I have an account
              </Button>
            </Link>
          </div>

          {/* trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-in stagger-4">
            {[
              { icon: Shield, text: 'Free to use' },
              { icon: Zap, text: 'AI-Powered' },
              { icon: Users, text: 'Trusted by students' },
            ].map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-slate-500">
                <I className="w-4 h-4 text-purple-400" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────── */}
      <section className="py-12 border-y border-[#2a2a5a]/50 bg-[#0c0c24]/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={s.label} className={`text-center animate-fade-in stagger-${i + 1}`}>
              <p className="text-3xl font-extrabold gradient-text">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Everything You Need to <span className="gradient-text">Get Placed</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A comprehensive suite of AI-powered tools designed to help you crack any placement drive.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={title}
                className={`glass-card p-7 group animate-fade-in stagger-${i + 1}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-purple-400 group-hover:gap-3 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────── */}
      <section className="py-24 px-4 bg-[#0c0c24]/50 border-y border-[#2a2a5a]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload & Analyze', desc: 'Upload your resume and get instant AI analysis with improvement suggestions.' },
              { step: '02', title: 'Practice & Prepare', desc: 'Take mock interviews, solve coding problems, and practice aptitude tests.' },
              { step: '03', title: 'Track & Improve', desc: 'Monitor your progress, identify weaknesses, and follow personalized plans.' },
            ].map((item, i) => (
              <div key={item.step} className={`text-center animate-fade-in stagger-${i + 1}`}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-5 text-lg font-bold shadow-lg shadow-purple-500/20">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 pointer-events-none" />
          <div className="relative z-10">
            <Star className="w-10 h-10 text-yellow-400 mx-auto mb-5" />
            <h2 className="text-3xl font-extrabold mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Join thousands of students who boosted their placement readiness with our AI-powered tools.
            </p>
            <Link to="/register">
              <Button size="lg" icon={ArrowRight} className="px-10">
                Start Preparing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="py-8 border-t border-[#2a2a5a]/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">Interview Coach AI</span>
          </div>
          <p className="text-xs text-slate-500">© 2026 Interview Coach AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
