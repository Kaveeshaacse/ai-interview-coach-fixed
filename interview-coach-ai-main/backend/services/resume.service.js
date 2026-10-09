import { resumeRepository } from "../repositories/resume.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import {
  fullResumeAnalysis,
  matchResumeToJobDescription,
  isLikelyResume,
} from "./atsAnalyzerEngine.js";
import { extractTextFromFile } from "./textExtractionService.js";
import { recordActivity } from "./activity.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// Resume Service — all business logic for resume upload, analysis, retrieval
// No HTTP. No direct DB calls (delegated to repository).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload + full analysis pipeline.
 * Called by resumeController after Multer saves the file.
 */
export async function uploadAndAnalyze(userId, file, options = {}) {
  const { targetRole = "Software Engineer", jobDescription = "" } = options;

  // 1. Extract text
  let extractedText = "";
  try {
    extractedText = await extractTextFromFile(file.path, file.mimetype);
  } catch (err) {
    throw Object.assign(
      new Error(
        "Unable to read this resume. Please upload a valid PDF, DOC, or DOCX file.",
      ),
      { statusCode: 400 },
    );
  }

  if (!extractedText || extractedText.trim().length < 15) {
    throw Object.assign(
      new Error(
        "No readable text found in this resume. Ensure the file is not empty or password-protected.",
      ),
      { statusCode: 400 },
    );
  }

  // 1.5 Reject documents that don't actually look like a resume (wrong
  // file uploaded, assignment/report, etc.) before scoring them.
  const resumeCheck = isLikelyResume(extractedText);
  if (!resumeCheck.isResume) {
    throw Object.assign(
      new Error(
        "This doesn't look like a resume. Please upload a resume with sections like Experience, Education, Skills, or Projects.",
      ),
      { statusCode: 400, errorCode: "NOT_A_RESUME" },
    );
  }

  // 2. Run analysis engine
  const analysis = fullResumeAnalysis(
    extractedText,
    targetRole,
    jobDescription,
  );
  console.log("[DEBUG] file:", file.originalname, "| extractedText length:", extractedText.length);
  console.log("[DEBUG] extractedText preview:", JSON.stringify(extractedText.slice(0, 300)));
  console.log("[DEBUG] ats.score:", analysis.ats?.score, "| overallScore:", analysis.overallScore);

  // 3. Determine version
  const existingCount = await resumeRepository.countByUser(userId);

  // 4. Persist resume record
  const resume = await resumeRepository.create(userId, {
    fileName: file.originalname,
    fileUrl: `/uploads/${file.filename}`,
    fileSize: file.size,
    mimeType: file.mimetype,
    extractedText,
    overallScore: analysis.overallScore,
    atsScore: analysis.ats?.score || 0,
    targetRole,
    version: existingCount + 1,
  });

  // 5. Persist all analysis sub-tables in parallel
  await Promise.all([
    resumeRepository.saveExtractedInfo(resume.id, analysis.extractedInfo || {}),
    resumeRepository.saveSectionScores(
      resume.id,
      analysis.sectionBreakdown || {},
    ),
    resumeRepository.saveResumeHealth(resume.id, analysis.resumeAnalysis || {}),
    resumeRepository.saveKeywords(resume.id, analysis.keywordAnalysis || {}),
    resumeRepository.saveImprovementSuggestions(
      resume.id,
      analysis.improvementSuggestions || [],
    ),
    resumeRepository.saveAtsScore(resume.id, {
      ...analysis.ats,
      scoringBreakdown: analysis.scoringBreakdown,
    }),
  ]);

  // 6. Save job match if JD provided
  let jobMatch = null;
  if (analysis.jobMatch) {
    jobMatch = await resumeRepository.saveJobMatch(resume.id, {
      ...analysis.jobMatch,
      jobDescriptionText: jobDescription,
    });
  }

  // 7. Record activity (fire-and-forget)
  recordActivity(userId, "resume", {
    fileName: file.originalname,
    resumeScore: analysis.overallScore,
    atsScore: analysis.ats?.score || 0,
    jobMatchScore: analysis.jobMatch?.matchScore || null,
    targetRole,
  }).catch(() => {});

  // 8. Update user score averages
  _updateUserAverages(userId).catch(() => {});

  return buildAnalysisResponse(resume, analysis, jobMatch);
}

/**
 * Match a saved resume against a new job description (no re-upload needed).
 */
export async function matchJobDescription(
  userId,
  resumeId,
  jobDescription,
  targetRole,
) {
  if (!jobDescription || jobDescription.trim().length < 30) {
    throw Object.assign(
      new Error(
        "Please provide a valid job description (at least 30 characters).",
      ),
      { statusCode: 400 },
    );
  }

  const resume = await resumeRepository.findById(resumeId);
  if (!resume) {
    throw Object.assign(
      new Error("Resume not found. Please re-upload your resume."),
      { statusCode: 404 },
    );
  }
  if (resume.user_id !== userId) {
    throw Object.assign(new Error("Not authorized to access this resume."), {
      statusCode: 403,
    });
  }
  if (!resume.extracted_text) {
    throw Object.assign(
      new Error("Resume text not available. Please re-upload your resume."),
      { statusCode: 400 },
    );
  }

  const role = targetRole || resume.target_role || "Software Engineer";
  const matchResult = matchResumeToJobDescription(
    resume.extracted_text,
    jobDescription,
    role,
  );

  const saved = await resumeRepository.saveJobMatch(resumeId, {
    ...matchResult,
    jobDescriptionText: jobDescription,
  });

  return { jobMatch: formatJobMatch(saved, matchResult), targetRole: role };
}

/**
 * Get saved full analysis by resume ID.
 */
export async function getResumeAnalysis(userId, resumeId) {
  const full = await resumeRepository.getFullAnalysis(resumeId);
  if (!full.resume) {
    throw Object.assign(new Error("Resume analysis not found"), {
      statusCode: 404,
    });
  }
  if (full.resume.user_id !== userId) {
    throw Object.assign(new Error("Not authorized to access this resume."), {
      statusCode: 403,
    });
  }
  return buildFullAnalysisResponse(full);
}

/**
 * Get all resumes for a user.
 */
export async function getUserResumes(userId) {
  return resumeRepository.findByUser(userId);
}

/**
 * Get ATS score history for a user.
 */
export async function getAtsHistory(userId) {
  return resumeRepository.getAtsHistory(userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildAnalysisResponse(resume, analysis, savedJobMatch) {
  return {
    resumeId: resume.id,
    fileName: resume.file_name,
    targetRole: resume.target_role,
    overallScore: analysis.overallScore,
    sectionBreakdown: analysis.sectionBreakdown,
    extractedInfo: analysis.extractedInfo,
    keywordAnalysis: analysis.keywordAnalysis,
    improvementSuggestions: analysis.improvementSuggestions,
    resumeAnalysis: analysis.resumeAnalysis,
    ats: analysis.ats,
    jobMatch: savedJobMatch ? formatJobMatch(savedJobMatch, analysis.jobMatch) : null,
    scoringBreakdown: analysis.scoringBreakdown,
    atsScore: analysis.ats?.score || 0,
    detectedSkills: analysis.extractedInfo?.skills || [],
    missingSkills: (analysis.keywordAnalysis?.missingKeywords || []).map(
      (k) => k.keyword,
    ),
    recommendations: analysis.resumeAnalysis?.recommendations || [],
  };
}

function buildFullAnalysisResponse(full) {
  const {
    resume,
    extractedInfo,
    sectionScores,
    health,
    keywords,
    suggestions,
    latestAts,
    latestJobMatch,
  } = full;

  // Re-shape keywords from DB rows back to expected frontend format
  const keywordsFound = keywords
    .filter((k) => k.status === "found")
    .map((k) => ({
      keyword: k.keyword,
      frequency: k.frequency,
      importance: k.importance,
    }));
  const missingKeywords = keywords
    .filter((k) => k.status === "missing")
    .map((k) => ({
      keyword: k.keyword,
      importance: k.importance,
      suggestion: k.suggestion,
    }));
  const keywordsToImprove = keywords
    .filter((k) => k.status === "needs_improvement")
    .map((k) => ({
      keyword: k.keyword,
      frequency: k.frequency,
      importance: k.importance,
      recommendation: k.recommendation,
      found: true,
    }));

  return {
    resumeId: resume.id,
    fileName: resume.file_name,
    targetRole: resume.target_role,
    overallScore: resume.overall_score,
    atsScore: resume.ats_score,
    version: resume.version,
    createdAt: resume.created_at,

    sectionBreakdown: sectionScores
      ? {
          atsCompatibility: sectionScores.ats_compatibility,
          skills: sectionScores.skills,
          keywords: sectionScores.keywords,
          education: sectionScores.education,
          experience: sectionScores.experience,
          projects: sectionScores.projects,
          certifications: sectionScores.certifications,
          formatting: sectionScores.formatting,
          contentQuality: sectionScores.content_quality,
          jobRelevance: sectionScores.job_relevance,
        }
      : null,

    extractedInfo: extractedInfo
      ? {
          name: extractedInfo.candidate_name,
          email: extractedInfo.email,
          phone: extractedInfo.phone,
          location: extractedInfo.location,
          linkedIn: extractedInfo.linkedin_url,
          gitHub: extractedInfo.github_url,
          education: extractedInfo.education,
          experience: extractedInfo.experience,
          certifications: extractedInfo.certifications,
          projects: extractedInfo.projects,
          skills: extractedInfo.skills,
          languages: extractedInfo.languages,
          wordCount: extractedInfo.word_count,
          estimatedPages: extractedInfo.estimated_pages,
        }
      : null,

    keywordAnalysis: { keywordsFound, missingKeywords, keywordsToImprove },
    improvementSuggestions: suggestions,
    resumeAnalysis: health
      ? {
          good: health.good_points,
          improvements: health.improvements,
          missing: health.missing_items,
          recommendations: health.recommendations,
        }
      : null,

    ats: latestAts
      ? {
          score: latestAts.overall_score,
          targetRole: latestAts.target_role,
          statusLabel: latestAts.status_label,
          roleMatchedKeywords: latestAts.role_matched_keywords,
          missingKeywords: latestAts.missing_keywords,
          roleImprovements: latestAts.role_improvements,
          scoringBreakdown: {
            keywordMatchScore: latestAts.keyword_match_score,
            experienceProjectScore: latestAts.experience_project_score,
            sectionScore: latestAts.section_score,
            structureScore: latestAts.structure_score,
            terminologyScore: latestAts.terminology_score,
            contactScore: latestAts.contact_score,
            totalScore: latestAts.overall_score,
          },
        }
      : null,

    jobMatch: latestJobMatch ? formatJobMatch(latestJobMatch) : null,
  };
}

function formatJobMatch(row, computed = null) {
  if (!row) return null;
  return {
    matchScore: computed?.matchScore ?? row.match_score,
    matchingSkills: computed?.matchingSkills ?? row.matching_skills,
    missingSkills: computed?.missingSkills ?? row.missing_skills,
    matchingKeywords: computed?.matchingKeywords ?? row.matching_keywords,
    missingKeywords: computed?.missingKeywords ?? row.missing_keywords,
    recommendations: computed?.recommendations ?? row.recommendations,
    summary: computed?.summary ?? row.summary,
    requiredExperience: computed?.requiredExperience ?? row.required_experience,
    educationRequirements: computed?.educationRequirements ?? row.education_requirements,
    certificationRequirements: computed?.certificationRequirements ?? row.certification_requirements,
    requirements: computed?.requirements ?? row.requirements ?? [],
    responsibilities: computed?.responsibilities ?? row.responsibilities ?? [],
    categories: computed?.categories ?? row.categories ?? {},
    confidence: computed?.confidence ?? row.confidence ?? 0,
    missingRequiredSkills: computed?.missingRequiredSkills ?? row.missing_required_skills ?? [],
    missingPreferredSkills: computed?.missingPreferredSkills ?? row.missing_preferred_skills ?? [],
  };
}

async function _updateUserAverages(userId) {
  const { resumeRepository: rr } =
    await import("../repositories/resume.repository.js");
  const { interviewRepository: ir } =
    await import("../repositories/interview.repository.js");
  const { codingRepository: cr } =
    await import("../repositories/coding.repository.js");
  const { aptitudeRepository: ar } =
    await import("../repositories/aptitude.repository.js");
  const { communicationRepository: comm } =
    await import("../repositories/communication.repository.js");

  const [latest, interviewAvg, codingAvg, aptitudeAvg, commAvg] =
    await Promise.all([
      rr.findLatestByUser(userId),
      ir.getAverageScore(userId),
      cr.getAverageScore(userId),
      ar.getAverageScore(userId),
      comm.getAverageScore(userId),
    ]);

  const scores = {
    resumeScore: latest?.overall_score || 0,
    atsScore: latest?.ats_score || 0,
    interviewScore: interviewAvg || 0,
    communicationScore: commAvg || 0,
    codingScore: codingAvg || 0,
    aptitudeScore: aptitudeAvg || 0,
  };
  const vals = Object.values(scores).filter((v) => v > 0);
  scores.overallScore =
    vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;

  await userRepository.upsertScoreAverages(userId, scores);
}
