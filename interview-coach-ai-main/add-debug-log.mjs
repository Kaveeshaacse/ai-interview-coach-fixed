// Temporary diagnostic — prints what text was extracted and what score was
// computed for every resume upload, directly in the backend terminal.
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
const f = "backend/services/resume.service.js";
patch(f,
  `  // 2. Run analysis engine
  const analysis = fullResumeAnalysis(
    extractedText,
    targetRole,
    jobDescription,
  );`,
  `  // 2. Run analysis engine
  const analysis = fullResumeAnalysis(
    extractedText,
    targetRole,
    jobDescription,
  );
  console.log("[DEBUG] file:", file.originalname, "| extractedText length:", extractedText.length);
  console.log("[DEBUG] extractedText preview:", JSON.stringify(extractedText.slice(0, 300)));
  console.log("[DEBUG] ats.score:", analysis.ats?.score, "| overallScore:", analysis.overallScore);`,
  "add debug log after analysis",
  "[DEBUG] file:"
);
console.log("\nDone. Upload the test resume again and check this terminal's output.");
