// Fix: resume analyzer scores ANY uploaded document, even ones that aren't
// resumes at all (e.g. an MLOps practical report), instead of first checking
// whether the document actually looks like a resume.
//
// Run this from the interview-coach-ai-main project root:
//     node fix-resume-validation.mjs

import { readFileSync, writeFileSync } from "fs";

function patch(path, oldStr, newStr, label, skipIfPresent = null) {
  const content = readFileSync(path, "utf-8");
  if (skipIfPresent && content.includes(skipIfPresent)) {
    console.log(`SKIP  ${label}: already applied.`);
    return;
  }
  const count = content.split(oldStr).length - 1;
  if (count === 0) {
    console.log(`SKIP  ${label}: anchor text not found (already patched, or file changed) — leaving file untouched.`);
    return;
  }
  if (count > 1) {
    console.log(`ABORT ${label}: anchor text found ${count} times (expected 1) — refusing to guess, no changes made to this file.`);
    process.exit(1);
  }
  writeFileSync(path, content.replace(oldStr, newStr), "utf-8");
  console.log(`OK    ${label}: patched.`);
}

// ─────────────────────────────────────────────────────────────────────────
// 1. backend/services/atsAnalyzerEngine.js — add isLikelyResume()
// ────────────────────────────────────────────────────────────────────────
const f1 = "backend/services/atsAnalyzerEngine.js";

patch(
  f1,
  `/**
 * Full resume analysis: ATS + keywords + extracted info + improvement suggestions
 */
export function fullResumeAnalysis(`,
  `/**
 * Does this document contain short, resume-style section headers
 * (Experience, Education, Skills, Projects, ...)? Headers are matched as
 * standalone short lines, the same way the section extractors above detect
 * them — a random sentence that merely contains the word "experience"
 * does not count.
 */
function countResumeSectionHeaders(rawText) {
  const headerPatterns = [
    /^(work\\s+)?experience$/i,
    /^employment(\\s+history)?$/i,
    /^education$/i,
    /^(technical\\s+)?skills?$/i,
    /^projects?$/i,
    /^(career\\s+)?objective$/i,
    /^(professional\\s+)?summary$/i,
    /^profile$/i,
    /^certifications?$/i,
    /^achievements?$/i,
    /^internships?$/i,
  ];
  const lines = rawText
    .split("\\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l.length <= 35);

  let count = 0;
  for (const line of lines) {
    if (headerPatterns.some((p) => p.test(line))) count++;
  }
  return count;
}

/**
 * Heuristic resume detector. Runs BEFORE scoring so a non-resume document
 * (an assignment, a report, random text, ...) is rejected instead of being
 * given a plausible-looking score. Scores a handful of resume signals and
 * requires a minimum combined total — no single signal is enough on its
 * own, since e.g. a doc can mention a tech term without being a resume.
 */
export function isLikelyResume(rawText = "") {
  const text = rawText || "";
  if (text.trim().length < 50) {
    return {
      isResume: false,
      confidence: 0,
      reason: "Document is too short to be a resume.",
    };
  }

  const headerCount = countResumeSectionHeaders(text);
  const hasEmail = !!extractEmail(text);
  const hasPhone = !!extractPhone(text);
  const hasEducation = !!extractEducation(text);
  const hasExperienceOrProjects =
    !!extractExperience(text) || !!extractProjects(text);

  let signals = 0;
  if (headerCount >= 2) signals += 2;
  else if (headerCount === 1) signals += 1;
  if (hasEmail || hasPhone) signals += 1;
  if (hasEducation) signals += 1;
  if (hasExperienceOrProjects) signals += 1;

  const isResume = signals >= 3;
  const confidence = Math.min(100, signals * 20);

  return {
    isResume,
    confidence,
    reason: isResume
      ? null
      : "This document doesn't look like a resume — it's missing clear sections like Experience, Education, Skills, or Projects, and/or contact details.",
    signals: { headerCount, hasEmail, hasPhone, hasEducation, hasExperienceOrProjects },
  };
}

/**
 * Full resume analysis: ATS + keywords + extracted info + improvement suggestions
 */
export function fullResumeAnalysis(`,
  "atsAnalyzerEngine.js (add isLikelyResume)",
  "export function isLikelyResume"
);

patch(
  f1,
  `export default {
  analyzeResumeText,
  fullResumeAnalysis,
  extractResumeInfo,
  analyzeKeywords,
  matchResumeToJobDescription,
  extractJobDescriptionKeywords,
  generateImprovementSuggestions,
  ROLE_SKILL_DEFINITIONS,
  ROLE_KEYWORD_CATEGORIES,
  getAtsStatusLabel,
};`,
  `export default {
  analyzeResumeText,
  fullResumeAnalysis,
  extractResumeInfo,
  analyzeKeywords,
  matchResumeToJobDescription,
  extractJobDescriptionKeywords,
  generateImprovementSuggestions,
  ROLE_SKILL_DEFINITIONS,
  ROLE_KEYWORD_CATEGORIES,
  getAtsStatusLabel,
  isLikelyResume,
};`,
  "atsAnalyzerEngine.js (export isLikelyResume)"
);

// ─────────────────────────────────────────────────────────────────────────
const f2 = "backend/services/resume.service.js";

patch(
  f2,
  `import {
  fullResumeAnalysis,
  matchResumeToJobDescription,
} from "./atsAnalyzerEngine.js";`,
  `import {
  fullResumeAnalysis,
  matchResumeToJobDescription,
  isLikelyResume,
} from "./atsAnalyzerEngine.js";`,
  "resume.service.js (import isLikelyResume)"
);

patch(
  f2,
  `  if (!extractedText || extractedText.trim().length < 15) {
    throw Object.assign(
      new Error(
        "No readable text found in this resume. Ensure the file is not empty or password-protected.",
      ),
      { statusCode: 400 },
    );
  }

  // 2. Run analysis engine`,
  `  if (!extractedText || extractedText.trim().length < 15) {
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

  // 2. Run analysis engine`,
  "resume.service.js (reject non-resumes on upload)"
);

// ─────────────────────────────────────────────────────────────────────────
// 3. backend/controllers/resumeController.js — same check on text-only path
// ─────────────────────────────────────────────────────────────────────────
const f3 = "backend/controllers/resumeController.js";

patch(
  f3,
  `    if (!text || text.trim().length < 15) {
      return res.status(400).json({ success: false, message: 'No readable text provided for analysis.', errorCode: 'EMPTY_TEXT' });
    }
    // For text-only analysis, run the engine without file upload
    const { fullResumeAnalysis } = await import('../services/atsAnalyzerEngine.js');
    const analysis = fullResumeAnalysis(text, role, jd);`,
  `    if (!text || text.trim().length < 15) {
      return res.status(400).json({ success: false, message: 'No readable text provided for analysis.', errorCode: 'EMPTY_TEXT' });
    }
    // For text-only analysis, run the engine without file upload
    const { fullResumeAnalysis, isLikelyResume } = await import('../services/atsAnalyzerEngine.js');
    const resumeCheck = isLikelyResume(text);
    if (!resumeCheck.isResume) {
      return res.status(400).json({
        success: false,
        message: "This doesn't look like a resume. Please provide text with sections like Experience, Education, Skills, or Projects.",
        errorCode: 'NOT_A_RESUME',
      });
    }
    const analysis = fullResumeAnalysis(text, role, jd);`,
  "resumeController.js (reject non-resumes on text analysis)"
);

console.log("\nDone. Your backend terminal (running npm run dev) will auto-restart and pick this up.");
