export const aptitudeQuestions = {
  quantitative: [
    {
      id: 1,
      question: 'If a train travels 360 km in 4 hours, what is its average speed?',
      options: ['80 km/h', '90 km/h', '70 km/h', '100 km/h'],
      correctAnswer: '90 km/h',
      category: 'Quantitative Aptitude',
      explanation: 'Speed = Distance / Time = 360 km / 4 hours = 90 km/h.',
    },
    {
      id: 2,
      question: 'A product is sold at 20% profit. If the cost price is ₹500, what is the selling price?',
      options: ['₹550', '₹600', '₹650', '₹700'],
      correctAnswer: '₹600',
      category: 'Quantitative Aptitude',
      explanation: 'Selling Price = Cost Price + (20% of 500) = 500 + 100 = ₹600.',
    },
    {
      id: 3,
      question: 'What is the sum of the first 20 natural numbers?',
      options: ['200', '210', '190', '220'],
      correctAnswer: '210',
      category: 'Quantitative Aptitude',
      explanation: 'Sum = n(n + 1) / 2 = 20 × 21 / 2 = 210.',
    },
    {
      id: 4,
      question: 'If x + y = 10 and xy = 21, then x² + y² = ?',
      options: ['58', '52', '48', '62'],
      correctAnswer: '58',
      category: 'Quantitative Aptitude',
      explanation: 'x² + y² = (x + y)² - 2xy = 10² - 2(21) = 100 - 42 = 58.',
    },
    {
      id: 5,
      question: 'A can complete work in 12 days, and B in 15 days. Working together, how many days will they take?',
      options: ['6 2/3 days', '6 1/3 days', '7 days', '5 1/2 days'],
      correctAnswer: '6 2/3 days',
      category: 'Quantitative Aptitude',
      explanation: 'Combined rate = 1/12 + 1/15 = 9/60 = 3/20 work/day. Total days = 20 / 3 = 6 2/3 days.',
    },
    {
      id: 6,
      question: 'What is the compound interest on ₹10,000 at 10% per annum for 2 years compounded annually?',
      options: ['₹2,000', '₹2,100', '₹2,200', '₹1,900'],
      correctAnswer: '₹2,100',
      category: 'Quantitative Aptitude',
      explanation: 'Amount = 10,000 × (1 + 10/100)² = 10,000 × 1.21 = ₹12,100. CI = 12,100 - 10,000 = ₹2,100.',
    },
    {
      id: 7,
      question: 'The ratio of ages of A and B is 3:5. If the sum of their ages is 64 years, what is B\'s age?',
      options: ['40 years', '36 years', '24 years', '44 years'],
      correctAnswer: '40 years',
      category: 'Quantitative Aptitude',
      explanation: 'Total ratio parts = 3 + 5 = 8 parts. 8 parts = 64 => 1 part = 8. B\'s age = 5 × 8 = 40 years.',
    },
    {
      id: 8,
      question: 'A circular track has a circumference of 440 m. What is its radius? (π = 22/7)',
      options: ['70 m', '66 m', '72 m', '68 m'],
      correctAnswer: '70 m',
      category: 'Quantitative Aptitude',
      explanation: '2πr = 440 => 2 × (22/7) × r = 440 => r = (440 × 7) / 44 = 70 m.',
    },
    {
      id: 9,
      question: 'If the price of sugar rises by 25%, by what percentage must consumption be reduced to keep expenditure constant?',
      options: ['20%', '25%', '15%', '30%'],
      correctAnswer: '20%',
      category: 'Quantitative Aptitude',
      explanation: 'Reduction % = [r / (100 + r)] × 100 = (25 / 125) × 100 = 20%.',
    },
    {
      id: 10,
      question: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
      options: ['40', '42', '36', '44'],
      correctAnswer: '42',
      category: 'Quantitative Aptitude',
      explanation: 'Differences: +4, +6, +8, +10, +12. Next term = 30 + 12 = 42 (also n² + n for n = 1, 2, 3, 4, 5, 6).',
    },
  ],

  logical: [
    {
      id: 11,
      question: 'If FRIEND is coded as HUMJTL, how is CANDLE coded in that language?',
      options: ['EDRIRL', 'ESJFNG', 'ECPFMG', 'DCOEMF'],
      correctAnswer: 'EDRIRL',
      category: 'Logical Reasoning',
      explanation: 'Pattern of letter shifts: +2, +3, +4, +5, +6, +7. C(+2)=E, A(+3)=D, N(+4)=R, D(+5)=I, L(+6)=R, E(+7)=L => EDRIRL.',
    },
    {
      id: 12,
      question: 'Find the odd one out in the series: 2, 5, 10, 17, 26, 37, 50, 64',
      options: ['50', '64', '37', '26'],
      correctAnswer: '64',
      category: 'Logical Reasoning',
      explanation: 'Pattern is n² + 1: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26, 6²+1=37, 7²+1=50, 8²+1=65. But 64 is given instead of 65.',
    },
    {
      id: 13,
      question: 'If A is B\'s brother, C is A\'s mother, D is C\'s father, E is B\'s son, how is D related to B?',
      options: ['Grandfather', 'Father', 'Uncle', 'Brother'],
      correctAnswer: 'Grandfather',
      category: 'Logical Reasoning',
      explanation: 'C is mother of B (since B is sibling of A). D is father of C. Therefore, D is the maternal grandfather of B.',
    },
    {
      id: 14,
      question: 'Point A is 10 m North of B. Point C is 5 m East of A. What is the direction of C from point B?',
      options: ['North-East', 'North-West', 'South-East', 'East'],
      correctAnswer: 'North-East',
      category: 'Logical Reasoning',
      explanation: 'From point B, moving 10m North and then 5m East places C in the North-East direction from B.',
    },
    {
      id: 15,
      question: 'If APPLE is coded as 50, what is the code for BALL?',
      options: ['27', '30', '24', '26'],
      correctAnswer: '27',
      category: 'Logical Reasoning',
      explanation: 'Sum of alphabetical positions: B(2) + A(1) + L(12) + L(12) = 27 (APPLE = 1 + 16 + 16 + 12 + 5 = 50).',
    },
    {
      id: 16,
      question: 'Complete the analogy: Pen : Write :: Knife : ?',
      options: ['Cut', 'Sharp', 'Blade', 'Steel'],
      correctAnswer: 'Cut',
      category: 'Logical Reasoning',
      explanation: 'The primary function of a pen is to write; the primary function of a knife is to cut.',
    },
    {
      id: 17,
      question: 'How many triangles are there in a square with both diagonals drawn?',
      options: ['4', '6', '8', '10'],
      correctAnswer: '8',
      category: 'Logical Reasoning',
      explanation: 'A square with both diagonals contains 4 small individual triangles + 4 composite triangles formed by adjacent pairs = 8 total.',
    },
    {
      id: 18,
      question: 'If "P + Q" means P is father of Q, and "P - Q" means P is mother of Q, what does "A + B - C" mean?',
      options: ['A is maternal grandfather of C', 'A is father of C', 'A is uncle of C', 'A is brother of C'],
      correctAnswer: 'A is maternal grandfather of C',
      category: 'Logical Reasoning',
      explanation: 'A is father of B, and B is mother of C. Thus, A is the maternal grandfather of C.',
    },
    {
      id: 19,
      question: 'Statements: All cats are dogs. All dogs are birds. Conclusion: All cats are birds.',
      options: ['True', 'False', 'Uncertain', 'Cannot be determined'],
      correctAnswer: 'True',
      category: 'Logical Reasoning',
      explanation: 'By standard syllogism: Cats ⊆ Dogs ⊆ Birds, hence Cats ⊆ Birds. The conclusion is strictly True.',
    },
    {
      id: 20,
      question: 'Which number replaces the question mark? 3, 9, 27, 81, ?',
      options: ['162', '216', '243', '189'],
      correctAnswer: '243',
      category: 'Logical Reasoning',
      explanation: 'Each term is multiplied by 3 (powers of 3): 3¹=3, 3²=9, 3³=27, 3⁴=81, 3⁵=243.',
    },
  ],

  verbal: [
    {
      id: 21,
      question: 'Choose the correct synonym of "Ephemeral":',
      options: ['Permanent', 'Transient', 'Enduring', 'Constant'],
      correctAnswer: 'Transient',
      category: 'Verbal Ability',
      explanation: 'Ephemeral means lasting for a very short duration; its exact synonym is Transient.',
    },
    {
      id: 22,
      question: 'Choose the antonym of "Benevolent":',
      options: ['Kind', 'Generous', 'Malevolent', 'Sympathetic'],
      correctAnswer: 'Malevolent',
      category: 'Verbal Ability',
      explanation: 'Benevolent means well-meaning and kindly; Malevolent means having or showing a wish to do evil.',
    },
    {
      id: 23,
      question: 'Identify the error: "Each of the boys have completed their homework."',
      options: ['Each', 'have', 'their', 'completed'],
      correctAnswer: 'have',
      category: 'Verbal Ability',
      explanation: '"Each" is a singular distributive pronoun and requires the singular verb "has", not "have".',
    },
    {
      id: 24,
      question: 'Choose the word that best completes the sentence: "The manager was ___ about the team\'s poor performance."',
      options: ['ecstatic', 'indifferent', 'irate', 'euphoric'],
      correctAnswer: 'irate',
      category: 'Verbal Ability',
      explanation: '"Irate" means feeling or characterized by great anger, which fits the context of poor team performance.',
    },
    {
      id: 25,
      question: 'What is the meaning of the idiom: "To burn the midnight oil"?',
      options: ['To waste electricity', 'To work late into the night', 'To cook late at night', 'To be very angry'],
      correctAnswer: 'To work late into the night',
      category: 'Verbal Ability',
      explanation: '"To burn the midnight oil" is an idiom that means to read, study, or work late into the night.',
    },
    {
      id: 26,
      question: 'Choose the correctly spelled word:',
      options: ['Accomodate', 'Accommodate', 'Acommodate', 'Acomodate'],
      correctAnswer: 'Accommodate',
      category: 'Verbal Ability',
      explanation: 'The correct spelling is "Accommodate" with double \'c\' and double \'m\'.',
    },
    {
      id: 27,
      question: 'Select the grammatically correct sentence:',
      options: ['He don\'t know nothing.', 'She is more taller than him.', 'They have been working here since 2019.', 'I seen that movie yesterday.'],
      correctAnswer: 'They have been working here since 2019.',
      category: 'Verbal Ability',
      explanation: 'Present perfect continuous with "since" for a specific starting point in time is grammatically sound.',
    },
    {
      id: 28,
      question: 'What does the proverb "A stitch in time saves nine" mean?',
      options: ['Sewing clothes saves money', 'Timely effort prevents larger problems later', 'Nine stitches are standard', 'Time heals all wounds'],
      correctAnswer: 'Timely effort prevents larger problems later',
      category: 'Verbal Ability',
      explanation: 'It means dealing with a problem immediately saves a lot of extra work and trouble later.',
    },
    {
      id: 29,
      question: 'Choose the one-word substitute for "A person who is excessively fond of eating":',
      options: ['Cannibal', 'Glutton', 'Herbivore', 'Gourmet'],
      correctAnswer: 'Glutton',
      category: 'Verbal Ability',
      explanation: 'A "Glutton" is an excessively greedy eater.',
    },
    {
      id: 30,
      question: 'What is the plural form of "phenomenon"?',
      options: ['Phenomenons', 'Phenomenas', 'Phenomena', 'Phenomeni'],
      correctAnswer: 'Phenomena',
      category: 'Verbal Ability',
      explanation: '"Phenomenon" is a Greek loan word whose plural form is "Phenomena".',
    },
  ],
};

// Return all questions flattened across all categories
export const getAllQuestions = () => {
  return [
    ...aptitudeQuestions.quantitative,
    ...aptitudeQuestions.logical,
    ...aptitudeQuestions.verbal,
  ];
};

export const getQuestionsByCategory = (category = 'quantitative') => {
  const cat = category.toLowerCase();
  if (cat === 'all') return getAllQuestions();
  return aptitudeQuestions[cat] || aptitudeQuestions.quantitative;
};

export const findQuestionById = (id) => {
  const numId = Number(id);
  return getAllQuestions().find((q) => q.id === numId);
};

export default {
  aptitudeQuestions,
  getAllQuestions,
  getQuestionsByCategory,
  findQuestionById,
};
