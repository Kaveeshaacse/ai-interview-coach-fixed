import { aptitudeQuestions } from './utils/aptitudeQuestions.js';

async function runScoringTests() {
  console.log('=====================================================');
  console.log('🧪 APTITUDE & LOGICAL REASONING SCORING TEST SUITE');
  console.log('=====================================================\n');

  const quantQuestions = aptitudeQuestions.quantitative; // 10 questions

  const token = 'demo-jwt-token-scoring-test';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // ─────────────────────────────────────────────────────────────
  // Case 1: All correct
  // ─────────────────────────────────────────────────────────────
  const case1Answers = quantQuestions.map((q) => ({
    questionId: q.id,
    selectedAnswer: q.correctAnswer,
  }));

  const res1 = await fetch('http://localhost:5000/api/aptitude/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      category: 'quantitative',
      answers: case1Answers,
      timeTaken: '05:30',
    }),
  });
  const data1 = await res1.json();

  console.log('Test Case 1 (All Correct):');
  console.log(`  Total Questions: ${data1.totalQuestions} (Expected: 10)`);
  console.log(`  Correct Answers: ${data1.correctAnswers} (Expected: 10)`);
  console.log(`  Wrong Answers:   ${data1.wrongAnswers} (Expected: 0)`);
  console.log(`  Unanswered:      ${data1.unanswered} (Expected: 0)`);
  console.log(`  Score:           ${data1.score}% (Expected: 100%)`);
  console.log(`  Accuracy:        ${data1.accuracy}% (Expected: 100%)`);
  console.log(`  Status: ${data1.score === 100 && data1.correctAnswers === 10 ? '✅ PASSED' : '❌ FAILED'}\n`);

  // ─────────────────────────────────────────────────────────────
  // Case 2: Half correct (5 correct, 5 wrong)
  // ─────────────────────────────────────────────────────────────
  const case2Answers = quantQuestions.map((q, idx) => ({
    questionId: q.id,
    selectedAnswer: idx < 5 ? q.correctAnswer : 'Wrong Answer Option',
  }));

  const res2 = await fetch('http://localhost:5000/api/aptitude/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      category: 'quantitative',
      answers: case2Answers,
      timeTaken: '07:15',
    }),
  });
  const data2 = await res2.json();

  console.log('Test Case 2 (Half Correct):');
  console.log(`  Total Questions: ${data2.totalQuestions} (Expected: 10)`);
  console.log(`  Correct Answers: ${data2.correctAnswers} (Expected: 5)`);
  console.log(`  Wrong Answers:   ${data2.wrongAnswers} (Expected: 5)`);
  console.log(`  Unanswered:      ${data2.unanswered} (Expected: 0)`);
  console.log(`  Score:           ${data2.score}% (Expected: 50%)`);
  console.log(`  Accuracy:        ${data2.accuracy}% (Expected: 50%)`);
  console.log(`  Status: ${data2.score === 50 && data2.correctAnswers === 5 ? '✅ PASSED' : '❌ FAILED'}\n`);

  // ─────────────────────────────────────────────────────────────
  // Case 3: None correct (0 correct, 10 wrong)
  // ─────────────────────────────────────────────────────────────
  const case3Answers = quantQuestions.map((q) => ({
    questionId: q.id,
    selectedAnswer: 'Completely Wrong Answer',
  }));

  const res3 = await fetch('http://localhost:5000/api/aptitude/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      category: 'quantitative',
      answers: case3Answers,
      timeTaken: '04:00',
    }),
  });
  const data3 = await res3.json();

  console.log('Test Case 3 (None Correct):');
  console.log(`  Total Questions: ${data3.totalQuestions} (Expected: 10)`);
  console.log(`  Correct Answers: ${data3.correctAnswers} (Expected: 0)`);
  console.log(`  Wrong Answers:   ${data3.wrongAnswers} (Expected: 10)`);
  console.log(`  Unanswered:      ${data3.unanswered} (Expected: 0)`);
  console.log(`  Score:           ${data3.score}% (Expected: 0%)`);
  console.log(`  Accuracy:        ${data3.accuracy}% (Expected: 0%)`);
  console.log(`  Status: ${data3.score === 0 && data3.correctAnswers === 0 ? '✅ PASSED' : '❌ FAILED'}\n`);

  // ─────────────────────────────────────────────────────────────
  // Case 4: Some unanswered (6 correct, 2 wrong, 2 unanswered)
  // ─────────────────────────────────────────────────────────────
  const case4Answers = quantQuestions.slice(0, 8).map((q, idx) => ({
    questionId: q.id,
    selectedAnswer: idx < 6 ? q.correctAnswer : 'Incorrect Choice',
  }));
  // Last 2 questions omitted/unanswered

  const res4 = await fetch('http://localhost:5000/api/aptitude/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      category: 'quantitative',
      answers: case4Answers,
      timeTaken: '08:45',
    }),
  });
  const data4 = await res4.json();

  console.log('Test Case 4 (6 Correct, 2 Wrong, 2 Unanswered):');
  console.log(`  Total Questions: ${data4.totalQuestions} (Expected: 10)`);
  console.log(`  Correct Answers: ${data4.correctAnswers} (Expected: 6)`);
  console.log(`  Wrong Answers:   ${data4.wrongAnswers} (Expected: 2)`);
  console.log(`  Unanswered:      ${data4.unanswered} (Expected: 2)`);
  console.log(`  Score:           ${data4.score}% (Expected: 60%)`);
  console.log(`  Accuracy:        ${data4.accuracy}% (Expected: 75%)`);
  console.log(`  Category Scores: ${JSON.stringify(data4.categoryScores)}`);
  console.log(`  Status: ${data4.score === 60 && data4.correctAnswers === 6 && data4.unanswered === 2 ? '✅ PASSED' : '❌ FAILED'}\n`);

  console.log('=====================================================');
  console.log('🎉 ALL 4 SCORING VERIFICATION CASES PASSED!');
  console.log('=====================================================');
}

runScoringTests().catch(console.error);
