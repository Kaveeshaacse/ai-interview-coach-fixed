// Fix: the separate "Role-Specific ATS Score" page uses its own scoring
// function (calculateATS in aiService.js) which never checks whether the
// text is actually a resume — so a non-resume document (or an old stored
// resume record from before the first fix) still gets a plausible ATS score.
//
// Run this from the interview-coach-ai-main project root:
//     node fix-ats-validation.mjs

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

const f = "backend/controllers/atsController.js";

patch(
  f,
  `import * as resumeService from '../services/resume.service.js';
import { resumeRepository } from '../repositories/resume.repository.js';
import { calculateATS     } from '../services/aiService.js';`,
  `import * as resumeService from '../services/resume.service.js';
import { resumeRepository } from '../repositories/resume.repository.js';
import { calculateATS     } from '../services/aiService.js';
import { isLikelyResume   } from '../services/atsAnalyzerEngine.js';`,
  "atsController.js (import isLikelyResume)",
  "import { isLikelyResume"
);

patch(
  f,
  `    if (!text) {
      return res.status(400).json({ success: false, message: 'No resume text available. Please upload a resume first.', errorCode: 'NO_RESUME_TEXT' });
    }

    const atsResult = await calculateATS(text, jobRole);`,
  `    if (!text) {
      return res.status(400).json({ success: false, message: 'No resume text available. Please upload a resume first.', errorCode: 'NO_RESUME_TEXT' });
    }

    const resumeCheck = isLikelyResume(text);
    if (!resumeCheck.isResume) {
      return res.status(400).json({
        success: false,
        message: "This doesn't look like a resume. Please upload a resume with sections like Experience, Education, Skills, or Projects.",
        errorCode: 'NOT_A_RESUME',
      });
    }

    const atsResult = await calculateATS(text, jobRole);`,
  "atsController.js (reject non-resumes before ATS scoring)"
);

console.log("\nDone. Your backend terminal (running npm run dev) will auto-restart and pick this up.");
