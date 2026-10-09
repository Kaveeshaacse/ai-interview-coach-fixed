// Fixes two "fake success" bugs:
// 1) Aptitude Test: submit failure claimed fake "scored locally" + fake
//    "evaluated successfully", leaving a blank results screen.
// 2) Profile Save: failed server save still said "saved successfully".
// Run from interview-coach-ai-main root: node fix-aptitude-profile-honesty.mjs
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

const aptitude = "src/pages/AptitudePage.jsx";
patch(aptitude,
`    try {
      const res = await aptitudeAPI.submitTest({
        category: category?.id || 'quantitative',
        timeTaken: formattedTimeTaken,
        answers: answersPayload,
        userAnswers: answers,
      });

      if (res.data) {
        setResults(res.data);
      }
    } catch {
      toast.error('Network error during submission. Test scored locally.');
    } finally {
      setSubmitted(true);
      setLoading(false);
      toast.success('Test evaluated successfully!');
    }`,
`    try {
      const res = await aptitudeAPI.submitTest({
        category: category?.id || 'quantitative',
        timeTaken: formattedTimeTaken,
        answers: answersPayload,
        userAnswers: answers,
      });

      if (res.data) {
        setResults(res.data);
        setSubmitted(true);
        toast.success('Test evaluated successfully!');
      } else {
        toast.error('Could not evaluate test. Please try again.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit test. Please try again.');
    } finally {
      setLoading(false);
    }`,
  "aptitude: stop fake success on submit failure",
  "Could not evaluate test. Please try again."
);

const profile = "src/pages/ProfilePage.jsx";
patch(profile,
`    } catch (err) {
      console.warn('API error, saving locally:', err);
      const updatedUserPayload = { ...user, ...profile };
      updateUser(updatedUserPayload);
      toast.success('Profile changes saved!');
    } finally {
      setSavingProfile(false);
    }`,
`    } catch (err) {
      console.warn('Profile save failed:', err);
      toast.error(err?.response?.data?.message || 'Could not save profile changes. Please try again.');
    } finally {
      setSavingProfile(false);
    }`,
  "profile: stop fake success on save failure",
  "Could not save profile changes. Please try again."
);

console.log("\nDone. Frontend terminal will auto-reload.");
