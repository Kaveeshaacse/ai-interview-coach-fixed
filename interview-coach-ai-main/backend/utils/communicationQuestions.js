// Built-in Communication Evaluator prompts — the baseline set the student
// Communication page always shows. Merged with any active admin-added
// "communication" questions by questionBankBridge.service.js, the same way
// aptitude/technical/coding/behavioural merge their built-in banks with the
// admin Question Bank.

export const COMMUNICATION_PROMPTS = [
  { id: 1, question: 'Tell me about yourself.', topic: 'General' },
  { id: 2, question: 'Describe a challenging project you worked on.', topic: 'General' },
  { id: 3, question: 'Why should we hire you?', topic: 'General' },
  { id: 4, question: 'What are your strengths and weaknesses?', topic: 'General' },
  { id: 5, question: 'Where do you see yourself in 5 years?', topic: 'General' },
];

export function getCommunicationPrompts() {
  return COMMUNICATION_PROMPTS;
}

export default { COMMUNICATION_PROMPTS, getCommunicationPrompts };
