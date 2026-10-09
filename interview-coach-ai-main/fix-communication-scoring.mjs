// Fix: in the Communication module, a non-answer like "I don't know why
// you should hire me" still scored Clarity 68, Professionalism 78,
// Conciseness 75 — only Relevance/Content/Specificity/Structure dropped.
// The formulas for those three sub-scores had a high baseline (78, 75, 45+)
// that nothing but a literal "yes"/"no" answer could pull down far, so any
// grammatically normal non-answer slipped through with inflated scores.
//
// Fix: detect "weak" answers (blank, near-blank, "I don't know"/"not sure",
// or any short answer that matches none of the question's expected themes
// and shows no personal contribution/evidence/result) and make every
// sub-score drop together for those, not just some of them.
//
// Run this from the interview-coach-ai-main project root:
//     node fix-communication-scoring.mjs

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

const f = "backend/services/aiService.js";

patch(
  f,
  `  const relevance = shortYesNo ? 5 : clampScore((matchedExpectations / Math.max(1, expectations.length)) * 75 + (hasPersonalContribution ? 15 : 0) + (hasResult ? 10 : 0));
  const content = shortYesNo ? 5 : clampScore(Math.min(100, words.length / 45 * 65 + matchedExpectations / Math.max(1, expectations.length) * 35));
  const clarity = shortYesNo ? 15 : clampScore(45 + Math.min(35, sentences.length * 8) + (uniqueRatio >= 0.55 ? 15 : 0) - grammarPenalty - (sentences.length === 1 && words.length > 35 ? 10 : 0));
  const specificity = shortYesNo ? 5 : clampScore((hasSpecificEvidence ? 45 : 10) + (hasPersonalContribution ? 30 : 0) + (hasResult ? 25 : 0));
  const structure = shortYesNo ? 10 : clampScore((sentences.length >= 2 ? 35 : 10) + (matchedExpectations >= 2 ? 20 : 5) + (hasPersonalContribution ? 25 : 0) + (hasResult ? 20 : 0));
  const professionalism = clampScore(78 - grammarPenalty - (shortYesNo ? 25 : 0) + (hasPersonalContribution ? 12 : 0));
  const conciseness = clampScore(words.length === 0 ? 0 : 75 - (words.length > 120 ? 20 : 0) - (repeatedPhrase ? 25 : 0) - fillerCount * 5);`,
  `  // A "weak" answer is one that doesn't substantively engage with the
  // question at all (a blank/near-blank answer, "I don't know", or any
  // short answer that matches none of the question's expected themes and
  // shows no personal contribution, evidence, or result). Every sub-score
  // must drop together for these — not just relevance/content — otherwise
  // a non-answer like "I don't know why you should hire me" still scores
  // 68/78/75 on clarity/professionalism/conciseness just for being
  // grammatically well-formed.
  const isWeakAnswer = shortYesNo
    || words.length < 6
    || /\\b(don'?t know|do\\s+not\\s+know|no\\s+idea|not\\s+sure)\\b/i.test(answer)
    || (words.length <= 20 && matchedExpectations === 0 && !hasPersonalContribution && !hasSpecificEvidence && !hasResult);

  const relevance = isWeakAnswer ? 5 : clampScore((matchedExpectations / Math.max(1, expectations.length)) * 75 + (hasPersonalContribution ? 15 : 0) + (hasResult ? 10 : 0));
  const content = isWeakAnswer ? 5 : clampScore(Math.min(100, words.length / 45 * 65 + matchedExpectations / Math.max(1, expectations.length) * 35));
  const clarity = isWeakAnswer ? 15 : clampScore(45 + Math.min(35, sentences.length * 8) + (uniqueRatio >= 0.55 ? 15 : 0) - grammarPenalty - (sentences.length === 1 && words.length > 35 ? 10 : 0));
  const specificity = isWeakAnswer ? 5 : clampScore((hasSpecificEvidence ? 45 : 10) + (hasPersonalContribution ? 30 : 0) + (hasResult ? 25 : 0));
  const structure = isWeakAnswer ? 10 : clampScore((sentences.length >= 2 ? 35 : 10) + (matchedExpectations >= 2 ? 20 : 5) + (hasPersonalContribution ? 25 : 0) + (hasResult ? 20 : 0));
  const professionalism = isWeakAnswer ? clampScore(20 - grammarPenalty) : clampScore(78 - grammarPenalty + (hasPersonalContribution ? 12 : 0));
  const conciseness = isWeakAnswer ? (words.length === 0 ? 0 : 20) : clampScore(75 - (words.length > 120 ? 20 : 0) - (repeatedPhrase ? 25 : 0) - fillerCount * 5);`,
  "aiService.js (weak/non-answers drop all communication sub-scores together)",
  "const isWeakAnswer ="
);

console.log("\nDone. Your backend terminal (running npm run dev) will auto-restart and pick this up.");
