// Removes the fake-score fallback entirely. It was still firing for ANY
// upload error other than NOT_A_RESUME (e.g. a text-extraction failure),
// computing a fabricated score from the filename/file size and showing a
// fake "success" toast. Now any failure shows the real error instead.
// Run from interview-coach-ai-main root: node fix-ats-fake-fallback.mjs
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
const f = "src/pages/ATSScorePage.jsx";
patch(f,
`    } catch (err) {
      clearInterval(interval);

      if (err?.response?.data?.errorCode === 'NOT_A_RESUME') {
        setData(null);
        toast.error(err.response.data.message || "This doesn't look like a resume.");
        return;
      }

      console.warn('API upload fallback:', err);

      const textLen = currentFile.name.length * 14 + Math.round(currentFile.size / 1024);

      let roleMultiplier = 1.0;
      if (role === 'Frontend Developer') roleMultiplier = 1.08;
      else if (role === 'Backend Developer') roleMultiplier = 0.88;
      else if (role === 'Data Scientist') roleMultiplier = 0.78;
      else if (role === 'DevOps Engineer') roleMultiplier = 0.68;

      const computedScore = Math.min(96, Math.max(42, Math.round(((textLen % 30) + 65) * roleMultiplier)));
      const statusLabel = computedScore >= 90 ? 'EXCELLENT ATS MATCH'
        : computedScore >= 80 ? 'STRONG ATS MATCH'
        : computedScore >= 70 ? 'GOOD ATS MATCH'
        : computedScore >= 60 ? 'MODERATE ATS MATCH'
        : 'NEEDS IMPROVEMENT';

      const allRoleKeywords = fallbackKeywords[role] || fallbackKeywords['Software Engineer'];
      const missingKw = allRoleKeywords.slice(2, 6);

      setData({
        fileName: currentFile.name,
        targetRole: role,
        ats: {
          score: computedScore,
          targetRole: role,
          statusLabel,
          missingKeywords: missingKw,
          roleImprovements: [
            \`Add stronger \${role.toLowerCase()}-related project descriptions highlighting core technologies.\`,
            \`Include key technical competencies such as \${missingKw.slice(0, 2).join(', ')} where relevant.\`,
            \`Emphasize hands-on implementation and domain problem solving targeted for \${role}.\`,
          ],
        },
      });
      toast.success(\`ATS score calculated for \${role}!\`);
    } finally {`,
`    } catch (err) {
      clearInterval(interval);
      setData(null);
      const serverMessage = err?.response?.data?.message;
      toast.error(serverMessage || 'Could not analyze this resume. Please try again or use a different file.');
      console.warn('ATS analysis failed:', err);
    } finally {`,
  "remove fake-score fallback entirely",
  "console.warn('ATS analysis failed:', err);"
);
console.log("\nDone. Frontend terminal will auto-reload.");
