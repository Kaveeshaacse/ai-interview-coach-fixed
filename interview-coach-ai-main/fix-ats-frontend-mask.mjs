// REAL root cause of "ATS score still shows for non-resumes": the backend
// IS correctly rejecting non-resume documents now (NOT_A_RESUME, status
// 400) — but ATSScorePage.jsx's catch block silently swallows ANY failed
// API call and fabricates a fake plausible score instead, always showing
// a success toast. That's why the fix looked like it "wasn't working."
//
// Run this from the interview-coach-ai-main project root:
//     node fix-ats-frontend-mask.mjs

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

const f = "src/pages/ATSScorePage.jsx";

patch(
  f,
  `    } catch (err) {
      clearInterval(interval);
      console.warn('API upload fallback:', err);

      const textLen = currentFile.name.length * 14 + Math.round(currentFile.size / 1024);`,
  `    } catch (err) {
      clearInterval(interval);

      if (err?.response?.data?.errorCode === 'NOT_A_RESUME') {
        setData(null);
        toast.error(err.response.data.message || "This doesn't look like a resume.");
        return;
      }

      console.warn('API upload fallback:', err);

      const textLen = currentFile.name.length * 14 + Math.round(currentFile.size / 1024);`,
  "ATSScorePage.jsx (don't mask NOT_A_RESUME rejection with a fake score)",
  "errorCode === 'NOT_A_RESUME'"
);

console.log("\nDone. Your FRONTEND terminal (npm run dev) will auto-reload and pick this up.");
