// ─────────────────────────────────────────────────────────────────────────────
// BEHAVIOURAL INTERVIEW QUESTION BANK
// Organised by topic and difficulty.
// All questions are STAR-friendly behavioural questions.
// No technical/programming questions here.
// ─────────────────────────────────────────────────────────────────────────────

export const BEHAVIOURAL_TOPICS = [
  'Leadership',
  'Teamwork',
  'Communication',
  'Problem Solving',
  'Conflict Resolution',
  'Adaptability',
  'Time Management',
  'Decision Making',
  'Motivation',
  'General Behavioural',
];

export const BEHAVIOURAL_QUESTIONS = {

  Leadership: {
    Easy: [
      { id: 'lead_e1', question: 'Tell me about a time you took responsibility for a task or project.', topic: 'Leadership', difficulty: 'Easy' },
      { id: 'lead_e2', question: 'Describe a situation where you helped your team achieve a common goal.', topic: 'Leadership', difficulty: 'Easy' },
      { id: 'lead_e3', question: 'Tell me about a time you stepped up to help when no one else volunteered.', topic: 'Leadership', difficulty: 'Easy' },
      { id: 'lead_e4', question: 'Describe a situation where you took ownership of a mistake and corrected it.', topic: 'Leadership', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'lead_m1', question: 'Tell me about a time you had to lead a team through a difficult situation.', topic: 'Leadership', difficulty: 'Medium' },
      { id: 'lead_m2', question: 'Describe a situation where you had to make an important decision as a team lead.', topic: 'Leadership', difficulty: 'Medium' },
      { id: 'lead_m3', question: 'Tell me about a time you motivated a discouraged or struggling team member.', topic: 'Leadership', difficulty: 'Medium' },
      { id: 'lead_m4', question: 'Describe a time you had to delegate tasks effectively under pressure.', topic: 'Leadership', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'lead_h1', question: 'Tell me about a time you led a team through significant disagreement while maintaining performance and morale.', topic: 'Leadership', difficulty: 'Hard' },
      { id: 'lead_h2', question: 'Describe a situation where your leadership decision initially failed. What did you do next and what did you learn?', topic: 'Leadership', difficulty: 'Hard' },
      { id: 'lead_h3', question: 'Tell me about a time you had to lead a high-stakes project under extreme time or resource constraints.', topic: 'Leadership', difficulty: 'Hard' },
      { id: 'lead_h4', question: 'Describe a situation where you had to manage competing priorities and conflicting stakeholder expectations as a leader.', topic: 'Leadership', difficulty: 'Hard' },
    ],
  },

  Teamwork: {
    Easy: [
      { id: 'team_e1', question: 'Tell me about a time you worked effectively as part of a team.', topic: 'Teamwork', difficulty: 'Easy' },
      { id: 'team_e2', question: 'Describe a situation where you supported a teammate who was struggling.', topic: 'Teamwork', difficulty: 'Easy' },
      { id: 'team_e3', question: 'Tell me about a team project you are proud of. What was your contribution?', topic: 'Teamwork', difficulty: 'Easy' },
      { id: 'team_e4', question: 'Describe a time you shared knowledge or skills with a team member to help the team succeed.', topic: 'Teamwork', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'team_m1', question: 'Tell me about a time your team had different opinions on how to approach a problem. How did you reach consensus?', topic: 'Teamwork', difficulty: 'Medium' },
      { id: 'team_m2', question: 'Describe a situation where you had to work closely with someone who had a very different working style.', topic: 'Teamwork', difficulty: 'Medium' },
      { id: 'team_m3', question: 'Tell me about a time when your team was behind schedule. What did you personally do to help?', topic: 'Teamwork', difficulty: 'Medium' },
      { id: 'team_m4', question: 'Describe a time you disagreed with a team decision but still committed to making it work.', topic: 'Teamwork', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'team_h1', question: 'Tell me about a time a team project was failing and how you personally turned it around.', topic: 'Teamwork', difficulty: 'Hard' },
      { id: 'team_h2', question: 'Describe a situation where you had to rebuild trust within a team after a serious breakdown.', topic: 'Teamwork', difficulty: 'Hard' },
      { id: 'team_h3', question: 'Tell me about a time you had to collaborate across teams or departments under conflicting priorities. How did you manage it?', topic: 'Teamwork', difficulty: 'Hard' },
      { id: 'team_h4', question: 'Describe a situation where you had to deliver results with a team where key members were underperforming. What did you do?', topic: 'Teamwork', difficulty: 'Hard' },
    ],
  },

  Communication: {
    Easy: [
      { id: 'comm_e1', question: 'Tell me about a time you clearly explained a complex idea to someone unfamiliar with the topic.', topic: 'Communication', difficulty: 'Easy' },
      { id: 'comm_e2', question: 'Describe a situation where your communication helped prevent a misunderstanding.', topic: 'Communication', difficulty: 'Easy' },
      { id: 'comm_e3', question: 'Tell me about a time you received constructive feedback. How did you respond?', topic: 'Communication', difficulty: 'Easy' },
      { id: 'comm_e4', question: 'Describe a time you actively listened and it improved the outcome of a situation.', topic: 'Communication', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'comm_m1', question: 'Tell me about a time you had to deliver difficult news to a colleague, manager, or client. How did you handle it?', topic: 'Communication', difficulty: 'Medium' },
      { id: 'comm_m2', question: 'Describe a situation where poor communication caused a problem. What did you do to fix it?', topic: 'Communication', difficulty: 'Medium' },
      { id: 'comm_m3', question: 'Tell me about a time you had to present or explain your work to a non-technical audience.', topic: 'Communication', difficulty: 'Medium' },
      { id: 'comm_m4', question: 'Describe a time you had to persuade or influence someone who initially disagreed with your approach.', topic: 'Communication', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'comm_h1', question: 'Tell me about a time you managed communication during a high-pressure situation or crisis where clear messaging was critical.', topic: 'Communication', difficulty: 'Hard' },
      { id: 'comm_h2', question: 'Describe a situation where you had to manage communication between stakeholders with conflicting expectations. How did you ensure everyone was aligned?', topic: 'Communication', difficulty: 'Hard' },
      { id: 'comm_h3', question: 'Tell me about a time your communication strategy changed the outcome of a difficult project or negotiation.', topic: 'Communication', difficulty: 'Hard' },
      { id: 'comm_h4', question: 'Describe a time when you had to communicate a major change that was not well-received. How did you handle the pushback?', topic: 'Communication', difficulty: 'Hard' },
    ],
  },

  'Problem Solving': {
    Easy: [
      { id: 'prob_e1', question: 'Tell me about a problem you encountered in a project and how you solved it.', topic: 'Problem Solving', difficulty: 'Easy' },
      { id: 'prob_e2', question: 'Describe a situation where you found a simpler or smarter way to complete a task.', topic: 'Problem Solving', difficulty: 'Easy' },
      { id: 'prob_e3', question: 'Tell me about a time you used creative thinking to overcome an obstacle.', topic: 'Problem Solving', difficulty: 'Easy' },
      { id: 'prob_e4', question: 'Describe a time you identified a problem before it became serious. What did you do?', topic: 'Problem Solving', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'prob_m1', question: 'Tell me about a time you solved a problem that no one else had been able to solve.', topic: 'Problem Solving', difficulty: 'Medium' },
      { id: 'prob_m2', question: 'Describe a situation where you had to make a decision with incomplete information. What approach did you take?', topic: 'Problem Solving', difficulty: 'Medium' },
      { id: 'prob_m3', question: 'Tell me about a time you had to break down a complex problem into manageable parts to find a solution.', topic: 'Problem Solving', difficulty: 'Medium' },
      { id: 'prob_m4', question: 'Describe a time a solution you implemented had an unexpected consequence. How did you respond?', topic: 'Problem Solving', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'prob_h1', question: 'Tell me about the most challenging problem you have solved. Walk me through your entire thought process, the obstacles you faced, and the outcome.', topic: 'Problem Solving', difficulty: 'Hard' },
      { id: 'prob_h2', question: 'Describe a situation where multiple solutions existed but had significant trade-offs. How did you evaluate them and justify your choice?', topic: 'Problem Solving', difficulty: 'Hard' },
      { id: 'prob_h3', question: 'Tell me about a time a long-standing process or system was failing. How did you diagnose the root cause and propose a fix?', topic: 'Problem Solving', difficulty: 'Hard' },
      { id: 'prob_h4', question: 'Describe a time when you had to solve a problem under significant time pressure with limited resources. What was your strategy?', topic: 'Problem Solving', difficulty: 'Hard' },
    ],
  },

  'Conflict Resolution': {
    Easy: [
      { id: 'conf_e1', question: 'Tell me about a disagreement you had with a teammate and how you resolved it.', topic: 'Conflict Resolution', difficulty: 'Easy' },
      { id: 'conf_e2', question: 'Describe a time you had a difference of opinion with someone. How did you handle it?', topic: 'Conflict Resolution', difficulty: 'Easy' },
      { id: 'conf_e3', question: 'Tell me about a time you helped resolve a conflict between two other people.', topic: 'Conflict Resolution', difficulty: 'Easy' },
      { id: 'conf_e4', question: 'Describe a situation where you had to set aside your personal feelings to work effectively with someone you disagreed with.', topic: 'Conflict Resolution', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'conf_m1', question: 'Tell me about a serious conflict within your team and how you resolved it. What was the outcome?', topic: 'Conflict Resolution', difficulty: 'Medium' },
      { id: 'conf_m2', question: 'Describe a situation where you had to work with someone whose approach differed significantly from yours. How did you find common ground?', topic: 'Conflict Resolution', difficulty: 'Medium' },
      { id: 'conf_m3', question: 'Tell me about a time you disagreed with your manager or a senior colleague. How did you raise your concern?', topic: 'Conflict Resolution', difficulty: 'Medium' },
      { id: 'conf_m4', question: 'Describe a time a conflict in your team was affecting project delivery. What did you do to address it?', topic: 'Conflict Resolution', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'conf_h1', question: 'Describe a high-impact conflict where both sides had valid and strong arguments. How did you facilitate a resolution that both parties could accept?', topic: 'Conflict Resolution', difficulty: 'Hard' },
      { id: 'conf_h2', question: 'Tell me about a conflict that could have seriously damaged a project or relationship. How did you manage it and what was the long-term outcome?', topic: 'Conflict Resolution', difficulty: 'Hard' },
      { id: 'conf_h3', question: 'Describe a situation where you had to mediate between two strong-willed individuals under significant pressure. What was your strategy?', topic: 'Conflict Resolution', difficulty: 'Hard' },
      { id: 'conf_h4', question: 'Tell me about a time you had to address a conflict between team members that stemmed from a structural or process-level issue. How did you resolve the root cause?', topic: 'Conflict Resolution', difficulty: 'Hard' },
    ],
  },

  Adaptability: {
    Easy: [
      { id: 'adap_e1', question: 'Tell me about a time you had to adjust to a significant change in your work environment or project.', topic: 'Adaptability', difficulty: 'Easy' },
      { id: 'adap_e2', question: 'Describe a situation where you had to quickly learn something new to complete a task.', topic: 'Adaptability', difficulty: 'Easy' },
      { id: 'adap_e3', question: 'Tell me about a time your plans changed unexpectedly. How did you respond?', topic: 'Adaptability', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'adap_m1', question: 'Tell me about a time you were asked to work on something completely outside your comfort zone. How did you approach it?', topic: 'Adaptability', difficulty: 'Medium' },
      { id: 'adap_m2', question: 'Describe a situation where project requirements changed significantly mid-way. How did you adapt without losing momentum?', topic: 'Adaptability', difficulty: 'Medium' },
      { id: 'adap_m3', question: 'Tell me about a time you had to abandon a plan and pivot to a completely different approach under time pressure.', topic: 'Adaptability', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'adap_h1', question: 'Tell me about the most significant change you have had to adapt to in your professional life. What made it challenging and how did you succeed?', topic: 'Adaptability', difficulty: 'Hard' },
      { id: 'adap_h2', question: 'Describe a situation where external factors beyond your control caused a major disruption to your work. How did you lead yourself and others through the uncertainty?', topic: 'Adaptability', difficulty: 'Hard' },
      { id: 'adap_h3', question: 'Tell me about a time your fundamental assumptions about a project or problem turned out to be wrong. How did you adjust your thinking and approach?', topic: 'Adaptability', difficulty: 'Hard' },
    ],
  },

  'Time Management': {
    Easy: [
      { id: 'time_e1', question: 'Tell me about a time you had to manage multiple tasks at the same time. How did you prioritise?', topic: 'Time Management', difficulty: 'Easy' },
      { id: 'time_e2', question: 'Describe a situation where you successfully met a deadline by planning your time effectively.', topic: 'Time Management', difficulty: 'Easy' },
      { id: 'time_e3', question: 'Tell me about a time you were running behind on a task or project. What did you do?', topic: 'Time Management', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'time_m1', question: 'Tell me about a time you had to manage competing deadlines with limited time. How did you decide what to prioritise?', topic: 'Time Management', difficulty: 'Medium' },
      { id: 'time_m2', question: 'Describe a situation where an unexpected task disrupted your schedule. How did you reorganise your work?', topic: 'Time Management', difficulty: 'Medium' },
      { id: 'time_m3', question: 'Tell me about a long-term project you managed. How did you break it into milestones and ensure consistent progress?', topic: 'Time Management', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'time_h1', question: 'Tell me about a time you had to deliver high-quality work across several high-priority projects simultaneously. How did you manage this without compromising quality?', topic: 'Time Management', difficulty: 'Hard' },
      { id: 'time_h2', question: 'Describe a situation where you had to say no or push back on a request because of time constraints. How did you handle the conversation and manage expectations?', topic: 'Time Management', difficulty: 'Hard' },
      { id: 'time_h3', question: 'Tell me about a time a project significantly overran its timeline. What caused it, how did you manage the situation, and what did you learn?', topic: 'Time Management', difficulty: 'Hard' },
    ],
  },

  'Decision Making': {
    Easy: [
      { id: 'dec_e1', question: 'Tell me about a decision you made that you are proud of.', topic: 'Decision Making', difficulty: 'Easy' },
      { id: 'dec_e2', question: 'Describe a time you had to make a quick decision. What was the outcome?', topic: 'Decision Making', difficulty: 'Easy' },
      { id: 'dec_e3', question: 'Tell me about a time you chose between two reasonable options. How did you decide?', topic: 'Decision Making', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'dec_m1', question: 'Tell me about a time you had to make an important decision without all the information you needed. What did you do?', topic: 'Decision Making', difficulty: 'Medium' },
      { id: 'dec_m2', question: 'Describe a situation where you made a decision that was unpopular but turned out to be correct.', topic: 'Decision Making', difficulty: 'Medium' },
      { id: 'dec_m3', question: 'Tell me about a time you changed your mind about a decision after receiving new information. How did you handle it?', topic: 'Decision Making', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'dec_h1', question: 'Tell me about the most difficult decision you have had to make professionally. What was at stake, how did you approach it, and what happened?', topic: 'Decision Making', difficulty: 'Hard' },
      { id: 'dec_h2', question: 'Describe a time you made a decision that had significant unintended consequences. What did you do and what did you learn?', topic: 'Decision Making', difficulty: 'Hard' },
      { id: 'dec_h3', question: 'Tell me about a time you had to make a high-stakes decision under extreme time pressure with multiple stakeholders depending on the outcome.', topic: 'Decision Making', difficulty: 'Hard' },
    ],
  },

  Motivation: {
    Easy: [
      { id: 'motiv_e1', question: 'Tell me about a time you went above and beyond what was required. What motivated you?', topic: 'Motivation', difficulty: 'Easy' },
      { id: 'motiv_e2', question: 'Describe a project or task that genuinely excited you. What made it engaging?', topic: 'Motivation', difficulty: 'Easy' },
      { id: 'motiv_e3', question: 'Tell me about a time you kept going when things were difficult. What kept you motivated?', topic: 'Motivation', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'motiv_m1', question: 'Tell me about a time you were working on something with very little external recognition or reward but stayed motivated. How did you sustain your energy?', topic: 'Motivation', difficulty: 'Medium' },
      { id: 'motiv_m2', question: 'Describe a period when you felt demotivated at work. How did you overcome it?', topic: 'Motivation', difficulty: 'Medium' },
      { id: 'motiv_m3', question: 'Tell me about a time you motivated others who were struggling to stay engaged or committed.', topic: 'Motivation', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'motiv_h1', question: 'Tell me about a time you had to sustain motivation through a long, difficult project where progress was slow and results were uncertain.', topic: 'Motivation', difficulty: 'Hard' },
      { id: 'motiv_h2', question: 'Describe a situation where you had to reinvent your sense of purpose or direction after a significant setback. How did you rebuild your motivation?', topic: 'Motivation', difficulty: 'Hard' },
      { id: 'motiv_h3', question: 'Tell me about a time you kept a team motivated through sustained adversity, repeated failures, or major uncertainty.', topic: 'Motivation', difficulty: 'Hard' },
    ],
  },

  'General Behavioural': {
    Easy: [
      { id: 'gen_e1', question: 'Tell me about yourself — your background, your strengths, and what you are most proud of professionally.', topic: 'General Behavioural', difficulty: 'Easy' },
      { id: 'gen_e2', question: 'Describe a time you made a mistake. What did you learn from it?', topic: 'General Behavioural', difficulty: 'Easy' },
      { id: 'gen_e3', question: 'Tell me about a significant achievement in your academic or professional life. What made it challenging?', topic: 'General Behavioural', difficulty: 'Easy' },
      { id: 'gen_e4', question: 'Describe a time you received feedback that changed your approach to something.', topic: 'General Behavioural', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'gen_m1', question: 'Tell me about a time you failed to meet a goal or expectation. What happened and what did you do about it?', topic: 'General Behavioural', difficulty: 'Medium' },
      { id: 'gen_m2', question: 'Describe a time you worked on something that required significant personal growth or stepping outside your comfort zone.', topic: 'General Behavioural', difficulty: 'Medium' },
      { id: 'gen_m3', question: 'Tell me about a time you had to balance personal interests or principles with professional obligations.', topic: 'General Behavioural', difficulty: 'Medium' },
      { id: 'gen_m4', question: 'Describe a situation where you built a strong professional relationship with someone you initially found difficult to work with.', topic: 'General Behavioural', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'gen_h1', question: 'Tell me about the most challenging professional situation you have faced. How did you handle it and what was the long-term outcome?', topic: 'General Behavioural', difficulty: 'Hard' },
      { id: 'gen_h2', question: 'Describe a time your values or ethics were tested in a professional context. What did you do and what were the consequences?', topic: 'General Behavioural', difficulty: 'Hard' },
      { id: 'gen_h3', question: 'Tell me about a time you had to advocate for something you believed in despite strong resistance. What was the outcome?', topic: 'General Behavioural', difficulty: 'Hard' },
      { id: 'gen_h4', question: 'Describe a career-defining moment that significantly shaped who you are as a professional. What happened and what did it teach you?', topic: 'General Behavioural', difficulty: 'Hard' },
    ],
  },
};

/**
 * Get behavioural questions for a topic + difficulty.
 * Returns a shuffled subset to avoid repetition.
 */
export function getBehaviouralQuestions(topic = 'General Behavioural', difficulty = 'Medium', count = 5) {
  const topicBank = BEHAVIOURAL_QUESTIONS[topic] || BEHAVIOURAL_QUESTIONS['General Behavioural'];
  const diffQuestions = topicBank[difficulty] || topicBank.Medium || [];

  // Shuffle and pick `count` questions
  const shuffled = [...diffQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
