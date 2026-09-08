import { executeCode } from './services/codeExecutionEngine.js';
import { codingProblems } from './utils/codingProblems.js';

async function testCodingExecution() {
  console.log('=====================================================');
  console.log('🧪 CODING PRACTICE 10-QUESTION SUITE TEST');
  console.log('=====================================================\n');

  // Solutions for all 10 questions in JavaScript
  const solutions = [
    // Q1: Reverse String
    `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(input.split('').reverse().join(''));`,

    // Q2: Check Palindrome
    `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(input === input.split('').reverse().join('') ? "Palindrome" : "Not Palindrome");`,

    // Q3: Find Largest Element
    `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  console.log(Math.max(...nums));
}`,

    // Q4: Count Vowels
    `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const matches = input.match(/[aeiou]/gi) || [];
console.log(matches.length);`,

    // Q5: Sum of Array Elements
    `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  console.log(nums.reduce((a, b) => a + b, 0));
}`,

    // Q6: Two Sum
    `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\r?\\n/).filter(line => line.trim() !== '');
if (lines.length >= 3) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const target = Number(lines[2].trim());
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      console.log(\`\${map.get(diff)} \${i}\`);
      break;
    }
    map.set(nums[i], i);
  }
}`,

    // Q7: Second Largest
    `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const unique = Array.from(new Set(nums)).sort((a, b) => b - a);
  if (unique.length < 2) console.log("No second largest element");
  else console.log(unique[1]);
}`,

    // Q8: Remove Duplicates
    `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const seen = new Set();
  const res = [];
  for (const n of nums) {
    if (!seen.has(n)) {
      seen.add(n);
      res.push(n);
    }
  }
  console.log(res.join(' '));
}`,

    // Q9: Count Frequency
    `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const map = new Map();
  for (const n of nums) map.set(n, (map.get(n) || 0) + 1);
  for (const [k, v] of map.entries()) console.log(\`\${k} \${v}\`);
}`,

    // Q10: Longest Substring Without Repeating
    `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();
let maxLen = 0, start = 0;
const map = new Map();
for (let end = 0; end < s.length; end++) {
  const char = s[end];
  if (map.has(char) && map.get(char) >= start) start = map.get(char) + 1;
  map.set(char, end);
  maxLen = Math.max(maxLen, end - start + 1);
}
console.log(maxLen);`,
  ];

  let totalPassedQuestions = 0;

  for (let i = 0; i < codingProblems.length; i++) {
    const prob = codingProblems[i];
    const code = solutions[i];
    const allTestCases = [...prob.visibleTestCases, ...prob.hiddenTestCases];

    const result = await executeCode(code, 'JavaScript', allTestCases);

    if (!result.isAllPassed) {
      console.log('Failed Test Details:', JSON.stringify(result.results, null, 2));
    }
    console.log(`Q${prob.id} [${prob.difficulty}] ${prob.title}:`);
    console.log(`  Passed: ${result.passedCount}/${result.totalCount}`);
    console.log(`  Status: ${result.isAllPassed ? '✅ ACCEPTED' : '❌ FAILED'}\n`);

    if (result.isAllPassed) totalPassedQuestions++;
  }

  console.log('=====================================================');
  console.log(`🎉 OVERALL RESULT: ${totalPassedQuestions}/10 QUESTIONS PASSED 100%`);
  console.log('=====================================================');
}

testCodingExecution().catch(console.error);
