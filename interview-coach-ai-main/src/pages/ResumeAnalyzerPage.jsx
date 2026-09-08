import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { resumeAPI } from '../services/api';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, XCircle, Lightbulb,
  Loader2, Eye, Trash2, RefreshCw, Check, User, Mail, Phone,
  MapPin, Globe, BookOpen, Briefcase, Award, FolderOpen,
  Code2, Tag, TrendingUp, BarChart3, ChevronDown, ChevronUp, Star, Info
} from 'lucide-react';
import Button from '../components/Button';
import Card, { CardHeader, CardTitle } from '../components/Card';
import CircularProgress from '../components/CircularProgress';
import ProgressBar from '../components/ProgressBar';
import toast from 'react-hot-toast';

const TARGET_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Java Developer', 'Python Developer',
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer', 'Cloud Engineer',
];

const importanceColors = {
  high: 'bg-red-500/10 border-red-500/30 text-red-300',
  medium: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  low: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
};

const sectionBreakdownLabels = {
  atsCompatibility: 'ATS Compatibility',
  skills: 'Skills',
  keywords: 'Keywords',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  certifications: 'Certifications',
  formatting: 'Formatting',
  contentQuality: 'Content Quality',
  jobRelevance: 'Job Relevance',
};

const sectionColors = {
  atsCompatibility: '#3b82f6',
  skills: '#8b5cf6',
  keywords: '#06b6d4',
  education: '#10b981',
  experience: '#f59e0b',
  projects: '#f97316',
  certifications: '#ec4899',
  formatting: '#6366f1',
  contentQuality: '#14b8a6',
  jobRelevance: '#7c3aed',
};

function ScoreGauge({ score, label, color = '#7c3aed' }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <CircularProgress value={score} size={72} strokeWidth={7} color={color} />
      <span className="text-[11px] text-slate-400 text-center font-medium leading-tight">{label}</span>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, iconClass, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-[#2a2a5a] bg-[#0d0d20] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${iconClass || 'text-purple-400'}`} />}
          <span className="text-sm font-bold text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const steps = [
    'Uploading resume file...',
    'Extracting text content...',
    'Analyzing resume structure...',
    'Running keyword analysis...',
    'Generating improvement suggestions...',
  ];

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length > 0) {
      toast.error('Invalid file. Please upload PDF, DOC, or DOCX under 10MB.');
      return;
    }
    const f = accepted[0];
    if (f) {
      setFile(f);
      setData(null);
      setActiveTab('overview');
      if (f.type === 'application/pdf') setPreview(URL.createObjectURL(f));
      else setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload a resume file first');
    setAnalyzing(true);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 500);

    try {
      const res = await resumeAPI.upload(file, { jobRole: targetRole });
      clearInterval(interval);
      setStepIndex(steps.length);
      setData(res.data);
      setActiveTab('overview');
      toast.success('Resume analysis complete!');
    } catch (err) {
      clearInterval(interval);
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setPreview(null);
    setData(null);
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'score', label: 'Score Breakdown' },
    { id: 'keywords', label: 'Keyword Analysis' },
    { id: 'improvements', label: 'Suggestions' },
    { id: 'health', label: 'Resume Health' },
  ];

  const ei = data?.extractedInfo;
  const ka = data?.keywordAnalysis;
  const sb = data?.sectionBreakdown;
  const ra = data?.resumeAnalysis;
  const suggestions = data?.improvementSuggestions;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Resume Analyzer</h1>
        <p className="text-slate-400 mt-1 text-sm">Complete resume analysis — extracted info, score breakdown, keyword gaps, and improvement suggestions</p>
      </div>

      {/* Upload Card */}
      <Card hover={false} className="max-w-4xl">
        <CardHeader><CardTitle icon={Upload}>Upload Resume</CardTitle></CardHeader>
        <div className="space-y-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`p-10 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-200 ${
                isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-[#2a2a5a] bg-[#0f0f2a] hover:border-purple-500/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-white mb-1">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-xs text-slate-400 mb-3">or click to browse</p>
              <span className="text-[11px] px-3 py-1 rounded-full bg-[#1a1a3e] border border-[#2a2a5a] text-slate-400">
                PDF, DOC, DOCX · Max 10MB
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#0f0f2a] border border-[#2a2a5a] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {preview && (
                  <a href={preview} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-slate-300 text-xs font-semibold hover:border-purple-500/40 transition flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                )}
                <button type="button" onClick={resetFile}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition text-xs font-semibold flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Replace
                </button>
              </div>
            </div>
          )}

          {/* Role selector */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Role</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-sm text-white outline-none focus:border-purple-500 transition"
              >
                {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {file && (
            <Button onClick={handleAnalyze} loading={analyzing} icon={analyzing ? undefined : RefreshCw} className="w-full py-3">
              {analyzing ? 'Analyzing Resume...' : data ? 'Re-analyze Resume' : 'Analyze Resume'}
            </Button>
          )}
        </div>
      </Card>

      {/* Loading */}
      {analyzing && (
        <Card hover={false} className="max-w-4xl border-purple-500/30">
          <CardHeader><CardTitle icon={Loader2}>Analyzing Resume</CardTitle></CardHeader>
          <div className="space-y-2.5 py-2">
            {steps.map((st, idx) => (
              <div key={st} className="flex items-center gap-3 text-xs font-medium">
                {idx < stepIndex ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : idx === stepIndex ? <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />}
                <span className={idx <= stepIndex ? 'text-white' : 'text-slate-500'}>{st}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {data && !analyzing && (
        <div className="max-w-5xl space-y-5 animate-fade-in">
          {/* Score Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0d0d2a] to-[#141432] border border-purple-500/20 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <CircularProgress value={data.overallScore || 0} size={120} strokeWidth={10} color="#7c3aed" />
              <p className="text-center text-xs font-semibold text-slate-400 mt-2">Overall Score</p>
            </div>
            <div className="flex-1">
              <div className="mb-1">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 uppercase tracking-wider">RESUME ANALYSIS</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{ei?.name || file?.name || 'Resume'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Target: <span className="text-purple-300 font-medium">{targetRole}</span> · {ei?.wordCount || 0} words · ~{ei?.estimatedPages || 1} page{(ei?.estimatedPages || 1) > 1 ? 's' : ''}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {ei?.email && <span className="flex items-center gap-1.5 text-xs text-slate-300 px-2 py-1 rounded-lg bg-[#1a1a3e] border border-[#2a2a5a]"><Mail className="w-3 h-3 text-blue-400" />{ei.email}</span>}
                {ei?.phone && <span className="flex items-center gap-1.5 text-xs text-slate-300 px-2 py-1 rounded-lg bg-[#1a1a3e] border border-[#2a2a5a]"><Phone className="w-3 h-3 text-green-400" />{ei.phone}</span>}
                {ei?.location && <span className="flex items-center gap-1.5 text-xs text-slate-300 px-2 py-1 rounded-lg bg-[#1a1a3e] border border-[#2a2a5a]"><MapPin className="w-3 h-3 text-red-400" />{ei.location}</span>}
                {ei?.linkedIn && <a href={ei.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-400 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition"><Globe className="w-3 h-3" />LinkedIn</a>}
                {ei?.gitHub && <a href={ei.gitHub} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-slate-300 px-2 py-1 rounded-lg bg-[#1a1a3e] border border-[#2a2a5a] hover:border-purple-500/30 transition"><Code2 className="w-3 h-3 text-purple-400" />GitHub</a>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a] flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === tab.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Extracted Sections */}
              <div className="grid sm:grid-cols-2 gap-4">
                {ei?.education && (
                  <CollapsibleSection title="Education" icon={BookOpen} iconClass="text-blue-400">
                    <div className="space-y-1.5 mt-1">
                      {ei.education.map((e, i) => (
                        <p key={i} className="text-xs text-slate-300 leading-relaxed border-l-2 border-blue-500/40 pl-3">{e}</p>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
                {ei?.experience && (
                  <CollapsibleSection title="Experience" icon={Briefcase} iconClass="text-amber-400">
                    <div className="space-y-1.5 mt-1">
                      {ei.experience.slice(0, 5).map((e, i) => (
                        <p key={i} className="text-xs text-slate-300 leading-relaxed border-l-2 border-amber-500/40 pl-3">{e}</p>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
                {ei?.certifications && (
                  <CollapsibleSection title="Certifications" icon={Award} iconClass="text-emerald-400">
                    <div className="space-y-1.5 mt-1">
                      {ei.certifications.map((c, i) => (
                        <p key={i} className="text-xs text-slate-300 leading-relaxed border-l-2 border-emerald-500/40 pl-3">{c}</p>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
                {ei?.projects && (
                  <CollapsibleSection title="Projects" icon={FolderOpen} iconClass="text-orange-400">
                    <div className="space-y-1.5 mt-1">
                      {ei.projects.slice(0, 5).map((p, i) => (
                        <p key={i} className="text-xs text-slate-300 leading-relaxed border-l-2 border-orange-500/40 pl-3">{p}</p>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
              </div>

              {/* Skills Detected */}
              {ei?.skills?.length > 0 && (
                <Card hover={false}>
                  <CardHeader><CardTitle icon={Code2}>Skills Detected ({ei.skills.length})</CardTitle></CardHeader>
                  <div className="flex flex-wrap gap-2">
                    {ei.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Languages */}
              {ei?.languages?.length > 0 && (
                <Card hover={false}>
                  <CardHeader><CardTitle icon={Globe}>Languages</CardTitle></CardHeader>
                  <div className="flex flex-wrap gap-2">
                    {ei.languages.map(lang => (
                      <span key={lang} className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-medium">{lang}</span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Tab: Score Breakdown */}
          {activeTab === 'score' && sb && (
            <div className="space-y-4">
              {/* Mini gauges */}
              <Card hover={false}>
                <CardHeader><CardTitle icon={BarChart3}>Score by Category</CardTitle></CardHeader>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 py-2">
                  {Object.entries(sb).map(([key, val]) => (
                    <ScoreGauge
                      key={key}
                      score={Math.round(val)}
                      label={sectionBreakdownLabels[key] || key}
                      color={sectionColors[key] || '#7c3aed'}
                    />
                  ))}
                </div>
              </Card>

              {/* Progress bars */}
              <Card hover={false}>
                <CardHeader><CardTitle icon={TrendingUp}>Detailed Score Breakdown</CardTitle></CardHeader>
                <div className="space-y-3">
                  {Object.entries(sb).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">{sectionBreakdownLabels[key] || key}</span>
                        <span className="font-bold" style={{ color: sectionColors[key] || '#7c3aed' }}>{Math.round(val)}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#1a1a3e] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.round(val)}%`, backgroundColor: sectionColors[key] || '#7c3aed' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Tab: Keyword Analysis */}
          {activeTab === 'keywords' && ka && (
            <div className="space-y-4">
              {/* Keywords Found */}
              {ka.keywordsFound?.length > 0 && (
                <Card hover={false} className="border-emerald-500/20">
                  <CardHeader>
                    <CardTitle icon={CheckCircle2} className="text-emerald-400">
                      Keywords Found ({ka.keywordsFound.length})
                    </CardTitle>
                  </CardHeader>
                  <div className="flex flex-wrap gap-2">
                    {ka.keywordsFound.map(({ keyword, frequency, importance }) => (
                      <span
                        key={keyword}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                          importance === 'high' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                          importance === 'medium' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                          'bg-slate-500/10 border-slate-500/30 text-slate-300'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {keyword}
                        <span className="text-[10px] opacity-70">×{frequency}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>Frequency shows how many times each keyword appears in your resume.</span>
                  </p>
                </Card>
              )}

              {/* Keywords to Improve */}
              {ka.keywordsToImprove?.length > 0 && (
                <Card hover={false} className="border-amber-500/20">
                  <CardHeader>
                    <CardTitle icon={TrendingUp} className="text-amber-400">
                      Keywords to Improve ({ka.keywordsToImprove.length})
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-3">
                    {ka.keywordsToImprove.map(({ keyword, frequency, recommendation, importance }) => (
                      <div key={keyword} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-amber-300">{keyword}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${importanceColors[importance] || importanceColors.medium}`}>
                              {importance}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">Found: Yes · Freq: {frequency}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Missing Keywords */}
              {ka.missingKeywords?.length > 0 && (
                <Card hover={false} className="border-red-500/20">
                  <CardHeader>
                    <CardTitle icon={XCircle} className="text-red-400">
                      Missing Keywords ({ka.missingKeywords.length})
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-2.5">
                    {ka.missingKeywords.map(({ keyword, importance, suggestion }) => (
                      <div key={keyword} className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-red-300">{keyword}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${importanceColors[importance] || importanceColors.high}`}>
                            {importance}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-[#141432] border border-[#2a2a5a] text-[11px] text-slate-400">
                    <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Only add these keywords if you have genuine knowledge or experience. Do not fabricate skills.</span>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Tab: Suggestions */}
          {activeTab === 'improvements' && suggestions?.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Actionable suggestions to improve your resume quality and impact:</p>
              {suggestions.map((s, i) => (
                <Card key={i} hover={false} className={
                  s.type === 'missing' ? 'border-red-500/20' :
                  s.type === 'weak' ? 'border-amber-500/20' :
                  'border-blue-500/20'
                }>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                        s.type === 'missing' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                        s.type === 'weak' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      }`}>
                        {s.type === 'missing' ? 'Missing' : s.type === 'weak' ? 'Too Weak' : 'Improvement'}
                      </span>
                      <span className="text-sm font-bold text-white">{s.section}</span>
                    </div>

                    {s.reason && (
                      <p className="text-xs text-slate-400 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        {s.reason}
                      </p>
                    )}

                    {s.current && (
                      <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                        <p className="text-[11px] font-semibold text-red-400 mb-1">Current:</p>
                        <p className="text-xs text-slate-300 italic">"{s.current}"</p>
                      </div>
                    )}

                    {s.improved && (
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                        <p className="text-[11px] font-semibold text-emerald-400 mb-1">Suggested Improvement:</p>
                        <p className="text-xs text-slate-200 leading-relaxed">"{s.improved}"</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Tab: Resume Health */}
          {activeTab === 'health' && ra && (
            <div className="space-y-4">
              {ra.good?.length > 0 && (
                <Card hover={false} className="border-emerald-500/20">
                  <CardHeader><CardTitle icon={CheckCircle2} className="text-emerald-400">Strong Areas</CardTitle></CardHeader>
                  <div className="space-y-2">
                    {ra.good.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-200">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {ra.improvements?.length > 0 && (
                <Card hover={false} className="border-amber-500/20">
                  <CardHeader><CardTitle icon={AlertTriangle} className="text-amber-400">Areas Needing Improvement</CardTitle></CardHeader>
                  <div className="space-y-2">
                    {ra.improvements.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {ra.missing?.length > 0 && (
                <Card hover={false} className="border-red-500/20">
                  <CardHeader><CardTitle icon={XCircle} className="text-red-400">Missing Information</CardTitle></CardHeader>
                  <div className="space-y-2">
                    {ra.missing.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-xs text-red-200">
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {ra.recommendations?.length > 0 && (
                <Card hover={false} className="border-purple-500/30">
                  <CardHeader><CardTitle icon={Lightbulb} className="text-purple-300">Recommendations</CardTitle></CardHeader>
                  <div className="space-y-2">
                    {ra.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141432] border border-[#2a2a5a] text-xs text-slate-200">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px] border border-purple-500/40">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed pt-0.5">{rec}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Bottom Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a5a]">
            <Button onClick={handleAnalyze} icon={RefreshCw} variant="secondary">Re-analyze</Button>
            <Button onClick={resetFile} icon={Trash2} variant="secondary">Replace Resume</Button>
          </div>
        </div>
      )}
    </div>
  );
}
