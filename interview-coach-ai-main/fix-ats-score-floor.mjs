// Removes hardcoded score floors so weak resumes can score low.
// Run from interview-coach-ai-main root: node fix-ats-score-floor.mjs
import { readFileSync, writeFileSync } from "fs";
function patch(path, oldStr, newStr, label, skipIfPresent = null) {
  const content = readFileSync(path, "utf-8");
  if (skipIfPresent && content.includes(skipIfPresent)) { console.log(`SKIP  ${label}: already applied.`); return; }
  const count = content.split(oldStr).length - 1;
  if (count === 0) { console.log(`SKIP  ${label}: anchor not found.`); return; }
  if (count > 1) { console.log(`ABORT ${label}: anchor found ${count} times.`); process.exit(1); }
  writeFileSync(path, content.replace(oldStr, newStr), "utf-8");
  console.log(`OK    ${label}: patched.`);
}
const f = "backend/services/atsAnalyzerEngine.js";
patch(f,
  `  const atsScore = Math.min(98, Math.max(30, rawTotal));`,
  `  const atsScore = Math.min(98, Math.max(0, rawTotal));`,
  "remove 30pt ATS floor",
  "Math.min(98, Math.max(0, rawTotal))"
);
patch(f,
`  const sectionBreakdown = {
    atsCompatibility: base.ats.score,
    skills: Math.min(100, extractedInfo.skills?.length * 5 || 50),
    keywords: kwScore,
    education: extractedInfo.education ? 85 : 40,
    experience: extractedInfo.experience ? 80 : 45,
    projects: extractedInfo.projects ? 80 : 45,
    certifications: extractedInfo.certifications ? 85 : 40,
    formatting: base.scoringBreakdown.structureScore * (100 / 15),
    contentQuality: base.scoringBreakdown.terminologyScore * 10,
    jobRelevance: base.ats.score,
  };`,
`  const sectionBreakdown = {
    atsCompatibility: base.ats.score,
    skills: extractedInfo.skills?.length ? Math.min(100, extractedInfo.skills.length * 5) : 0,
    keywords: kwScore,
    education: extractedInfo.education ? 85 : 5,
    experience: extractedInfo.experience ? 80 : 5,
    projects: extractedInfo.projects ? 80 : 5,
    certifications: extractedInfo.certifications ? 85 : 5,
    formatting: base.scoringBreakdown.structureScore * (100 / 15),
    contentQuality: base.scoringBreakdown.terminologyScore * 10,
    jobRelevance: base.ats.score,
  };`,
  "missing sections score near 0, not 40-50",
  "skills: extractedInfo.skills?.length ? Math.min(100, extractedInfo.skills.length * 5) : 0"
);
patch(f,
  `    overallScore: Math.min(98, Math.max(35, overallScore)),`,
  `    overallScore: Math.min(98, Math.max(0, overallScore)),`,
  "remove 35pt overall floor",
  "Math.min(98, Math.max(0, overallScore))"
);
console.log("\nDone. Backend terminal will auto-restart and pick this up.");
