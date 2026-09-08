import assert from 'node:assert/strict';
import { analyzeCommunication } from './services/aiService.js';

const question = 'Describe a challenging project you worked on.';
const answers = [
  'I worked on a driver drowsiness detection system. The main challenge was detecting drowsiness in real time. I implemented REST APIs and focused on system reliability and responsiveness. This helped me understand real-time application development.',
  'I worked on a project.',
  'A project was challenging and I learned a lot.',
  'Yes.',
  'I like watching movies and playing games.',
];
const results = await Promise.all(answers.map(answer => analyzeCommunication(question, answer)));
const scores = results.map(result => result.overallScore);
assert.equal(new Set(scores).size, scores.length, `Expected distinct scores, got ${scores}`);
assert.ok(scores[0] > scores[1] && scores[1] > scores[2] && scores[2] > scores[3]);
assert.ok(scores[4] < scores[1]);
assert.equal(results[0].question, question);
assert.equal(results[0].answer, answers[0]);
assert.ok(results[0].evaluation.relevance.score > results[4].evaluation.relevance.score);
console.log('Communication evaluator ranking tests passed:', scores.join(', '));