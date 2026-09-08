import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { resumeAPI } from "../services/api";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Loader2,
  Eye,
  Trash2,
  RefreshCw,
  Target,
  Info,
  Zap,
  BookOpen,
  Award,
  Clock,
  Check,
  ChevronRight,
} from "lucide-react";
import Button from "../components/Button";
import Card, { CardHeader, CardTitle } from "../components/Card";
import CircularProgress from "../components/CircularProgress";
import toast from "react-hot-toast";

export default function JobMatchPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState(null);

  const steps = [
    "Uploading resume...",
    "Extracting resume text...",
    "Parsing job description...",
    "Matching skills and keywords...",
    "Generating recommendations...",
  ];

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length > 0) {
      toast.error("Invalid file. Please upload PDF, DOC, or DOCX under 10MB.");
      return;
    }
    const f = accepted[0];
    if (f) {
      setFile(f);
      setData(null);
      if (f.type === "application/pdf") setPreview(URL.createObjectURL(f));
      else setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleMatch = async () => {
    if (!file) return toast.error("Please upload your resume first");
    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      return toast.error(
        "Please enter a job description (at least 30 characters)",
      );
    }
    setAnalyzing(true);
    setData(null);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 500);

    try {
      const res = await resumeAPI.upload(file, {
        jobDescription,
      });
      clearInterval(interval);
      setStepIndex(steps.length);
      setData(res.data);
      toast.success("Job match analysis complete!");
    } catch (err) {
      clearInterval(interval);
      toast.error(
        err.response?.data?.message || "Analysis failed. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setData(null);
    setJobDescription("");
  };

  const jm = data?.jobMatch;

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 65) return "#f59e0b";
    if (score >= 45) return "#f97316";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 65) return "Good Match";
    if (score >= 45) return "Moderate Match";
    return "Low Match";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Job Description Match
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Compare your resume against a job description to see matching skills,
          missing skills, and get targeted recommendations
        </p>
      </div>

      {/* Input Card */}
      <Card hover={false} className="max-w-4xl">
        <CardHeader>
          <CardTitle icon={Target}>Upload Resume & Job Description</CardTitle>
        </CardHeader>
        <div className="space-y-5">
          {/* Resume Upload */}
          {!file ? (
            <div
              {...getRootProps()}
              className={`p-8 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-200 ${
                isDragActive
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-[#2a2a5a] bg-[#0f0f2a] hover:border-purple-500/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-purple-400 mb-3" />
              <p className="text-sm font-bold text-white mb-1">
                {isDragActive ? "Drop resume here" : "Drag & drop your resume"}
              </p>
              <p className="text-xs text-slate-400">
                PDF, DOC, DOCX · Max 10MB
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {preview && (
                  <a
                    href={preview}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-[#1a1a3e] border border-[#2a2a5a] text-slate-300 text-xs font-medium hover:border-purple-500/40 transition flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> View
                  </a>
                )}
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Replace
                </button>
              </div>
            </div>
          )}

          {/* Job Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here. Include required skills, responsibilities, qualifications, and any other details from the job posting..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 transition resize-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {jobDescription.length} characters · Minimum 30 required
            </p>
          </div>

          {file && (
            <Button
              onClick={handleMatch}
              loading={analyzing}
              icon={analyzing ? undefined : Zap}
              className="w-full py-3"
            >
              {analyzing
                ? "Analyzing Job Match..."
                : data
                  ? "Re-analyze Match"
                  : "Analyze Job Match"}
            </Button>
          )}
        </div>
      </Card>

      {/* Loading */}
      {analyzing && (
        <Card hover={false} className="max-w-4xl border-blue-500/30">
          <CardHeader>
            <CardTitle icon={Loader2}>
              Matching Resume to Job Description
            </CardTitle>
          </CardHeader>
          <div className="space-y-2.5 py-2">
            {steps.map((st, idx) => (
              <div
                key={st}
                className="flex items-center gap-3 text-xs font-medium"
              >
                {idx < stepIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : idx === stepIndex ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                )}
                <span
                  className={idx <= stepIndex ? "text-white" : "text-slate-500"}
                >
                  {st}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {data && !analyzing && (
        <div className="max-w-4xl space-y-5 animate-fade-in">
          {/* Match Score Banner */}
          {jm ? (
            <>
              <div className="p-8 rounded-2xl bg-[#0f0f2a]/90 border border-[#2a2a5a] flex flex-col items-center text-center">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 uppercase tracking-wider mb-3">
                  JOB MATCH ANALYSIS
                </span>
                <CircularProgress
                  value={jm.matchScore}
                  size={150}
                  strokeWidth={12}
                  color={getScoreColor(jm.matchScore)}
                />
                <div className="mt-4 space-y-1">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border"
                    style={{
                      background: `${getScoreColor(jm.matchScore)}15`,
                      borderColor: `${getScoreColor(jm.matchScore)}40`,
                      color: getScoreColor(jm.matchScore),
                    }}
                  >
                    {getScoreLabel(jm.matchScore)}
                  </span>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mt-2">
                    {jm.summary}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Analysis confidence:{" "}
                    <span className="text-blue-300 font-semibold">
                      {jm.confidence || 0}%
                    </span>
                  </p>
                </div>
              </div>

              {jm.categories && (
                <Card hover={false}>
                  <CardHeader>
                    <CardTitle icon={Target}>Category Breakdown</CardTitle>
                  </CardHeader>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      ["Required Skills", "requiredTechnicalSkills"],
                      ["Responsibilities", "responsibilities"],
                      ["Experience", "experience"],
                      ["Education", "education"],
                      ["Preferred Skills", "preferredSkills"],
                      ["Tools & Domain", "domainTools"],
                    ].map(([label, key]) => (
                      <div
                        key={key}
                        className="p-3 rounded-xl bg-[#141432] border border-[#2a2a5a]"
                      >
                        <div className="flex justify-between gap-2 text-xs mb-1.5">
                          <span className="text-slate-300">{label}</span>
                          <span className="text-purple-300 font-bold">
                            {jm.categories[key] ?? 0}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#1a1a3e] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500"
                            style={{ width: `${jm.categories[key] ?? 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {jm.requirements?.length > 0 && (
                <Card hover={false}>
                  <CardHeader>
                    <CardTitle icon={Info}>Requirement Evidence</CardTitle>
                  </CardHeader>
                  <div className="space-y-2">
                    {jm.requirements.map((item) => (
                      <div
                        key={`${item.name}-${item.importance}`}
                        className="p-3 rounded-xl bg-[#141432] border border-[#2a2a5a]"
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-sm font-semibold text-white">
                            {item.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.match === "NO_MATCH" ? "text-red-300 border-red-500/30 bg-red-500/10" : item.match === "RELATED_MATCH" || item.match === "PARTIAL_MATCH" ? "text-amber-300 border-amber-500/30 bg-amber-500/10" : "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"}`}
                          >
                            {item.match} · {item.importance}
                          </span>
                        </div>
                        {item.evidence && (
                          <p className="text-xs text-slate-400 mt-1.5">
                            Evidence: {item.evidence}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {jm.responsibilities?.length > 0 && (
                <Card hover={false}>
                  <CardHeader>
                    <CardTitle icon={CheckCircle2}>
                      Responsibility Match
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-2">
                    {jm.responsibilities.map((item) => (
                      <div
                        key={item.responsibility}
                        className="p-3 rounded-xl bg-[#141432] border border-[#2a2a5a]"
                      >
                        <div className="flex items-start gap-2 text-xs">
                          <span
                            className={
                              item.score > 0
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }
                          >
                            {item.score > 0 ? "✓" : "⚠"}
                          </span>
                          <span className="text-slate-200">
                            {item.responsibility}
                          </span>
                        </div>
                        {item.evidence && (
                          <p className="text-xs text-slate-500 mt-1 pl-5">
                            Evidence: {item.evidence}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Matching Skills */}
                {jm.matchingSkills?.length > 0 && (
                  <Card hover={false} className="border-emerald-500/20">
                    <CardHeader>
                      <CardTitle
                        icon={CheckCircle2}
                        className="text-emerald-400"
                      >
                        Matching Skills ({jm.matchingSkills.length})
                      </CardTitle>
                    </CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {jm.matchingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold"
                        >
                          <Check className="w-3 h-3" /> {skill}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Missing Required Skills */}
                {(jm.missingRequiredSkills || jm.missingSkills)?.length > 0 && (
                  <Card hover={false} className="border-red-500/20">
                    <CardHeader>
                      <CardTitle icon={XCircle} className="text-red-400">
                        Missing Required Skills (
                        {(jm.missingRequiredSkills || jm.missingSkills).length})
                      </CardTitle>
                    </CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {(jm.missingRequiredSkills || jm.missingSkills).map(
                        (skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold"
                          >
                            <XCircle className="w-3 h-3" /> {skill}
                          </span>
                        ),
                      )}
                    </div>
                  </Card>
                )}
                {jm.missingPreferredSkills?.length > 0 && (
                  <Card hover={false} className="border-amber-500/20">
                    <CardHeader>
                      <CardTitle
                        icon={AlertTriangle}
                        className="text-amber-400"
                      >
                        Missing Preferred Skills (
                        {jm.missingPreferredSkills.length})
                      </CardTitle>
                    </CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {jm.missingPreferredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold"
                        >
                          <AlertTriangle className="w-3 h-3" /> {skill}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Matching Keywords */}
              {jm.matchingKeywords?.length > 0 && (
                <Card hover={false} className="border-blue-500/20">
                  <CardHeader>
                    <CardTitle icon={CheckCircle2} className="text-blue-400">
                      Matching Keywords ({jm.matchingKeywords.length})
                    </CardTitle>
                  </CardHeader>
                  <div className="flex flex-wrap gap-2">
                    {jm.matchingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Missing Keywords */}
              {jm.missingKeywords?.length > 0 && (
                <Card hover={false} className="border-amber-500/20">
                  <CardHeader>
                    <CardTitle icon={AlertTriangle} className="text-amber-400">
                      Missing Keywords ({jm.missingKeywords.length})
                    </CardTitle>
                  </CardHeader>
                  <div className="flex flex-wrap gap-2">
                    {jm.missingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Job Requirements */}
              {(jm.requiredExperience ||
                jm.educationRequirements?.length > 0 ||
                jm.certificationRequirements?.length > 0) && (
                <Card hover={false}>
                  <CardHeader>
                    <CardTitle icon={BookOpen}>
                      Job Requirements Detected
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-3">
                    {jm.requiredExperience && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141432] border border-[#2a2a5a]">
                        <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white">
                            Experience Required
                          </p>
                          <p className="text-xs text-slate-400">
                            {jm.requiredExperience}+ years
                          </p>
                        </div>
                      </div>
                    )}
                    {jm.educationRequirements?.length > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-[#141432] border border-[#2a2a5a]">
                        <BookOpen className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-white mb-1">
                            Education Requirements
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {jm.educationRequirements.map((e) => (
                              <span
                                key={e}
                                className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20"
                              >
                                {e}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {jm.certificationRequirements?.length > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-[#141432] border border-[#2a2a5a]">
                        <Award className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-white mb-1">
                            Certifications Required
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {jm.certificationRequirements.map((c) => (
                              <span
                                key={c}
                                className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Recommendations */}
              {jm.recommendations?.length > 0 && (
                <Card hover={false} className="border-purple-500/30">
                  <CardHeader>
                    <CardTitle icon={Lightbulb} className="text-purple-300">
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-2.5">
                    {jm.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141432] border border-[#2a2a5a] text-xs text-slate-200"
                      >
                        <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-[#0a0a1a] border border-[#2a2a5a] text-[11px] text-slate-400">
                    <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Only add skills you genuinely possess. Do not fabricate
                      experience or qualifications.
                    </span>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card hover={false} className="border-amber-500/20">
              <div className="flex items-center gap-3 p-4">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Job Description Analysis Unavailable
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Could not extract meaningful skills from the job
                    description. Please provide a more detailed description with
                    specific skills and requirements.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Bottom Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a5a]">
            <Button onClick={handleMatch} icon={RefreshCw} variant="secondary">
              Re-analyze
            </Button>
            <Button onClick={resetAll} icon={Trash2} variant="secondary">
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
