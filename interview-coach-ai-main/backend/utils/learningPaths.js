// ─────────────────────────────────────────────────────────────────────────────
// Canonical Learning Path Catalog with Valid Structured Resource Links
// Each resource has: title, type ('video'|'article'|'doc'|'course'), url
// ─────────────────────────────────────────────────────────────────────────────

export const PATH_CATALOG = {
  'java-dsa': {
    pathKey: 'java-dsa',
    title: 'Java & Data Structures',
    description: 'Master Java programming and core data structures needed for technical interviews.',
    icon: '☕',
    color: '#f59e0b',
    level: 'Beginner',
    topics: [
      {
        topicId: 'java-basics',
        title: 'Java Basics',
        description: 'Variables, data types, operators, control flow (if/else, loops), and I/O.',
        resources: [
          { title: 'Java Tutorial for Beginners – Programming with Mosh', type: 'video', url: 'https://www.youtube.com/watch?v=eIrMbAQSU34' },
          { title: 'W3Schools Java Syntax & Basics', type: 'article', url: 'https://www.w3schools.com/java/java_syntax.asp' },
          { title: 'Oracle Official Java Basics Documentation', type: 'doc', url: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/' },
        ],
        practiceQuestions: ['Write a Java program to print 1 to 100.', 'Write a Java program to find if a number is even or odd.'],
      },
      {
        topicId: 'oop-concepts',
        title: 'OOP Concepts',
        description: 'Classes, objects, inheritance, polymorphism, abstraction, and encapsulation.',
        resources: [
          { title: 'Java OOP Crash Course – FreeCodeCamp', type: 'video', url: 'https://www.youtube.com/watch?v=SiBw785e2n0' },
          { title: 'GeeksforGeeks Object Oriented Programming in Java', type: 'article', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/' },
        ],
        practiceQuestions: ['Create a BankAccount class with deposit/withdraw methods.', 'Demonstrate polymorphism using a Shape hierarchy.'],
      },
      {
        topicId: 'arrays-strings',
        title: 'Arrays & Strings',
        description: 'Declaring, traversing, sorting arrays. String manipulation and common patterns.',
        resources: [
          { title: 'Java Arrays Guide – W3Schools', type: 'article', url: 'https://www.w3schools.com/java/java_arrays.asp' },
          { title: 'GeeksforGeeks Java String Methods Reference', type: 'doc', url: 'https://www.geeksforgeeks.org/strings-in-java/' },
        ],
        practiceQuestions: ['Reverse an array in-place.', 'Check if two strings are anagrams.', 'Find the first non-repeating character.'],
      },
      {
        topicId: 'searching-sorting',
        title: 'Searching & Sorting',
        description: 'Linear search, binary search, bubble sort, selection sort, insertion sort, merge sort, quick sort.',
        resources: [
          { title: 'Sorting Algorithms Visualized – GeeksforGeeks', type: 'video', url: 'https://www.geeksforgeeks.org/sorting-algorithms/' },
          { title: 'Binary Search Implementation in Java', type: 'article', url: 'https://www.geeksforgeeks.org/binary-search/' },
        ],
        practiceQuestions: ['Implement binary search.', 'Sort an array of 0s, 1s, and 2s.'],
      },
      {
        topicId: 'collections-framework',
        title: 'Collections Framework',
        description: 'ArrayList, LinkedList, HashMap, HashSet, Stack, Queue, PriorityQueue.',
        resources: [
          { title: 'Java Collections Tutorial – Oracle Docs', type: 'doc', url: 'https://docs.oracle.com/javase/tutorial/collections/' },
          { title: 'Java Collections Framework Complete Guide – GeeksforGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/collections-in-java-2/' },
        ],
        practiceQuestions: ['Use HashMap to count word frequency.', 'Implement a stack using ArrayList.'],
      },
      {
        topicId: 'linked-list',
        title: 'Linked List',
        description: 'Singly and doubly linked lists, reversal, cycle detection, merging sorted lists.',
        resources: [
          { title: 'Linked List Data Structure – GeeksforGeeks', type: 'article', url: 'https://www.geeksforgeeks.org/data-structures/linked-list/' },
          { title: 'LeetCode Top Linked List Interview Questions', type: 'course', url: 'https://leetcode.com/tag/linked-list/' },
        ],
        practiceQuestions: ['Detect cycle in a linked list.', 'Merge two sorted linked lists.', 'Find the middle of a linked list.'],
      },
      {
        topicId: 'stack-queue',
        title: 'Stack & Queue',
        description: 'Stack (LIFO), Queue (FIFO), Deque, monotonic stack patterns.',
        resources: [
          { title: 'Java Stack Class Documentation – Oracle', type: 'doc', url: 'https://docs.oracle.com/javase/8/docs/api/java/util/Stack.html' },
          { title: 'GeeksforGeeks Queue Data Structure Guide', type: 'article', url: 'https://www.geeksforgeeks.org/queue-data-structure/' },
        ],
        practiceQuestions: ['Valid parentheses using stack.', 'Implement a queue using two stacks.'],
      },
      {
        topicId: 'recursion',
        title: 'Recursion & Backtracking',
        description: 'Recursive thinking, base/recursive case, backtracking, N-Queens, permutations.',
        resources: [
          { title: 'Recursion Explained with Examples – FreeCodeCamp', type: 'video', url: 'https://www.youtube.com/watch?v=IJDJ0kBx2LM' },
          { title: 'GeeksforGeeks Backtracking Algorithms', type: 'article', url: 'https://www.geeksforgeeks.org/backtracking-algorithms/' },
        ],
        practiceQuestions: ['Generate all permutations of a string.', 'Solve N-Queens problem.'],
      },
      {
        topicId: 'dynamic-programming',
        title: 'Dynamic Programming',
        description: 'Memoization, tabulation, classic problems: Fibonacci, Knapsack, LCS, LIS.',
        resources: [
          { title: 'Dynamic Programming Patterns – LeetCode Discuss', type: 'article', url: 'https://leetcode.com/discuss/general-discussion/458695/Dynamic-Programming-Patterns' },
          { title: 'GeeksforGeeks Dynamic Programming Tutorials', type: 'article', url: 'https://www.geeksforgeeks.org/dynamic-programming/' },
        ],
        practiceQuestions: ['0/1 Knapsack problem.', 'Longest Common Subsequence.', 'Coin change problem.'],
      },
      {
        topicId: 'interview-problems',
        title: 'Interview Practice Problems',
        description: 'Top 50 interview coding problems combining all data structures.',
        resources: [
          { title: 'LeetCode Top 150 Interview Questions', type: 'course', url: 'https://leetcode.com/studyplan/top-interview-150/' },
          { title: 'GeeksforGeeks Must Do Coding Questions', type: 'article', url: 'https://www.geeksforgeeks.org/must-do-coding-questions-for-companies-like-amazon-microsoft-adobe/' },
        ],
        practiceQuestions: ['Two Sum', 'Longest Substring Without Repeating', 'Binary Tree Level Order Traversal'],
      },
    ],
  },

  communication: {
    pathKey: 'communication',
    title: 'Communication & Interview Skills',
    description: 'Build strong verbal communication, articulation, and interview presence.',
    icon: '🗣️',
    color: '#10b981',
    level: 'Beginner',
    topics: [
      {
        topicId: 'grammar-basics',
        title: 'Grammar Fundamentals',
        description: 'Tenses, subject-verb agreement, punctuation, common mistakes.',
        resources: [
          { title: 'Grammarly Blog – Grammar Rules & Guide', type: 'article', url: 'https://www.grammarly.com/blog/category/handbook/' },
          { title: 'BBC Learning English Grammar Course', type: 'course', url: 'https://www.bbc.co.uk/learningenglish/english/basic-grammar' },
        ],
        practiceQuestions: ['Write 5 sentences in simple past tense correctly.'],
      },
      {
        topicId: 'vocabulary-building',
        title: 'Vocabulary Building',
        description: 'Root words, prefixes/suffixes, context learning, daily word habits.',
        resources: [
          { title: 'Merriam-Webster Word of the Day', type: 'article', url: 'https://www.merriam-webster.com/word-of-the-day' },
          { title: 'Vocabulary.com Learn Words', type: 'course', url: 'https://www.vocabulary.com/' },
        ],
        practiceQuestions: ['Use 10 new words in a paragraph.'],
      },
      {
        topicId: 'sentence-formation',
        title: 'Sentence Formation & Clarity',
        description: 'Structuring concise, clear sentences. Avoiding filler words.',
        resources: [
          { title: 'Harvard Writing Center Strategies', type: 'article', url: 'https://writingcenter.fas.harvard.edu/pages/strategies-essay-writing' },
        ],
        practiceQuestions: ['Rewrite 5 complex sentences in simple English.'],
      },
      {
        topicId: 'speaking-practice',
        title: 'Speaking Practice',
        description: 'Pronunciation, pace, intonation. Eliminating umms and fillers.',
        resources: [
          { title: 'TED Talks on Effective Communication & Speaking', type: 'video', url: 'https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen' },
        ],
        practiceQuestions: ['Record yourself answering "Tell me about yourself" for 2 minutes.'],
      },
      {
        topicId: 'common-hr-questions',
        title: 'Common HR Interview Questions',
        description: 'Top 20 HR questions with model answers and structure.',
        resources: [
          { title: 'Indeed HR Interview Questions and Sample Answers', type: 'article', url: 'https://www.indeed.com/career-advice/interviewing/top-interview-questions-and-answers' },
        ],
        practiceQuestions: ['Answer: Why should we hire you?', 'Answer: What are your weaknesses?'],
      },
      {
        topicId: 'star-method',
        title: 'STAR Method for Behavioral Questions',
        description: 'Situation–Task–Action–Result framework for structured answers.',
        resources: [
          { title: 'The STAR Method Explained – The Muse', type: 'article', url: 'https://www.themuse.com/advice/star-interview-method' },
        ],
        practiceQuestions: ['Describe a time you solved a conflict using STAR method.'],
      },
      {
        topicId: 'mock-interviews',
        title: 'Mock HR Interviews',
        description: 'Full 30-minute mock HR interview simulation.',
        resources: [
          { title: 'Pramp Free Peer Mock Interviews', type: 'course', url: 'https://www.pramp.com/' },
        ],
        practiceQuestions: ['Complete one full mock HR interview.'],
      },
    ],
  },

  aptitude: {
    pathKey: 'aptitude',
    title: 'Quantitative Aptitude',
    description: 'Strengthen math and reasoning skills for aptitude tests and campus placements.',
    icon: '📊',
    color: '#8b5cf6',
    level: 'Beginner',
    topics: [
      {
        topicId: 'number-systems',
        title: 'Number Systems & Simplification',
        description: 'Divisibility, HCF, LCM, factors, fractions, BODMAS.',
        resources: [
          { title: 'IndiaBIX Quantitative Aptitude – Number System', type: 'article', url: 'https://www.indiabix.com/aptitude/numbers/' },
          { title: 'GeeksforGeeks Number System Aptitude Questions', type: 'article', url: 'https://www.geeksforgeeks.org/number-system-aptitude-questions/' },
        ],
        practiceQuestions: ['Find LCM of 12, 15, 18.'],
      },
      {
        topicId: 'percentages',
        title: 'Percentages',
        description: 'Calculation, increase/decrease, successive percentages.',
        resources: [
          { title: 'IndiaBIX Percentage Aptitude Questions', type: 'article', url: 'https://www.indiabix.com/aptitude/percentage/' },
        ],
        practiceQuestions: ['A number increased by 20% becomes 360. Find the original.'],
      },
      {
        topicId: 'ratio-proportion',
        title: 'Ratio & Proportion',
        description: 'Direct/inverse proportion, partnership problems.',
        resources: [
          { title: 'IndiaBIX Ratio and Proportion Questions', type: 'article', url: 'https://www.indiabix.com/aptitude/ratio-and-proportion/' },
        ],
        practiceQuestions: ['If 3:5 = x:40, find x.'],
      },
      {
        topicId: 'profit-loss',
        title: 'Profit & Loss',
        description: 'Cost price, selling price, discounts, marked price.',
        resources: [
          { title: 'IndiaBIX Profit and Loss Problems', type: 'article', url: 'https://www.indiabix.com/aptitude/profit-and-loss/' },
        ],
        practiceQuestions: ['A shopkeeper buys for ₹200 and sells for ₹250. Find profit %.'],
      },
      {
        topicId: 'time-work',
        title: 'Time, Work & Wages',
        description: 'Work done, pipes & cisterns, efficiency problems.',
        resources: [
          { title: 'IndiaBIX Time and Work Practice Questions', type: 'article', url: 'https://www.indiabix.com/aptitude/time-and-work/' },
        ],
        practiceQuestions: ['A can do a job in 10 days, B in 15 days. Together?'],
      },
      {
        topicId: 'speed-distance',
        title: 'Time, Speed & Distance',
        description: 'Average speed, relative speed, trains, boats & streams.',
        resources: [
          { title: 'IndiaBIX Time Speed Distance Problems', type: 'article', url: 'https://www.indiabix.com/aptitude/time-and-distance/' },
        ],
        practiceQuestions: ['A train 120m long passes a pole in 12s. Find speed.'],
      },
      {
        topicId: 'averages',
        title: 'Averages & Statistics',
        description: 'Mean, median, mode, weighted average.',
        resources: [
          { title: 'IndiaBIX Averages Formulas and Examples', type: 'article', url: 'https://www.indiabix.com/aptitude/averages/' },
        ],
        practiceQuestions: ['Average of 5 numbers is 10. If one is removed (value=15), new average?'],
      },
      {
        topicId: 'probability',
        title: 'Probability & Permutation',
        description: 'Basic probability, nPr, nCr.',
        resources: [
          { title: 'Khan Academy Probability Basics Course', type: 'video', url: 'https://www.khanacademy.org/math/statistics-probability/probability-library' },
        ],
        practiceQuestions: ['Probability of drawing 2 aces from a deck.'],
      },
    ],
  },

  'logical-reasoning': {
    pathKey: 'logical-reasoning',
    title: 'Logical Reasoning',
    description: 'Improve critical thinking, pattern recognition, and logical deduction.',
    icon: '🧠',
    color: '#ec4899',
    level: 'Beginner',
    topics: [
      {
        topicId: 'number-series',
        title: 'Number & Letter Series',
        description: 'Identify patterns in sequences, missing terms.',
        resources: [
          { title: 'IndiaBIX Series Completion Questions', type: 'article', url: 'https://www.indiabix.com/logical-reasoning/number-series/' },
        ],
        practiceQuestions: ['Complete the series: 2, 6, 12, 20, 30, ?'],
      },
      {
        topicId: 'coding-decoding',
        title: 'Coding & Decoding',
        description: 'Letter/number substitution, word coding patterns.',
        resources: [
          { title: 'IndiaBIX Coding Decoding Puzzles', type: 'article', url: 'https://www.indiabix.com/logical-reasoning/coding-and-decoding/' },
        ],
        practiceQuestions: ['If CAT = 24, DOG = ?, find the pattern.'],
      },
      {
        topicId: 'blood-relations',
        title: 'Blood Relations',
        description: 'Family tree problems, relation derivation.',
        resources: [
          { title: 'IndiaBIX Blood Relation Tests', type: 'article', url: 'https://www.indiabix.com/logical-reasoning/blood-relation-test/' },
        ],
        practiceQuestions: ['A is the father of B. B is the sister of C. How is C related to A?'],
      },
      {
        topicId: 'direction-sense',
        title: 'Direction & Distance',
        description: 'Navigation problems, final direction/distance.',
        resources: [
          { title: 'IndiaBIX Direction Sense Test', type: 'article', url: 'https://www.indiabix.com/logical-reasoning/direction-sense-test/' },
        ],
        practiceQuestions: ['Facing north, turn left twice. Which direction now?'],
      },
      {
        topicId: 'analogy',
        title: 'Analogy & Classification',
        description: 'Word/number analogies, odd-one-out.',
        resources: [
          { title: 'IndiaBIX Analogy Test Questions', type: 'article', url: 'https://www.indiabix.com/verbal-reasoning/analogy/' },
        ],
        practiceQuestions: ['Book : Library :: Painting : ?'],
      },
      {
        topicId: 'syllogisms',
        title: 'Syllogisms',
        description: 'Premises, conclusions, Venn diagrams.',
        resources: [
          { title: 'GeeksforGeeks Syllogism Questions and Tricks', type: 'article', url: 'https://www.geeksforgeeks.org/syllogism-questions/' },
        ],
        practiceQuestions: ['All dogs are animals. All animals have tails. Conclusion?'],
      },
      {
        topicId: 'puzzles',
        title: 'Puzzles & Seating Arrangement',
        description: 'Circular/linear arrangements, floor puzzles.',
        resources: [
          { title: 'IndiaBIX Seating Arrangement Puzzles', type: 'article', url: 'https://www.indiabix.com/logical-reasoning/seating-arrangement/' },
        ],
        practiceQuestions: ['5 people sit in a circle. A sits left of B...'],
      },
      {
        topicId: 'critical-reasoning',
        title: 'Critical Reasoning',
        description: 'Arguments, assumptions, inference questions.',
        resources: [
          { title: 'GMAT Critical Reasoning Basics – Magoosh', type: 'article', url: 'https://magoosh.com/gmat/gmat-critical-reasoning-tips/' },
        ],
        practiceQuestions: ['Identify the assumption in the given argument.'],
      },
    ],
  },

  'system-design': {
    pathKey: 'system-design',
    title: 'System Design Fundamentals',
    description: 'Learn to design scalable distributed systems for senior-level interviews.',
    icon: '🏗️',
    color: '#f97316',
    level: 'Intermediate',
    topics: [
      {
        topicId: 'basics-system-design',
        title: 'Basics of System Design',
        description: 'Scalability, reliability, availability, consistency.',
        resources: [
          { title: 'System Design Primer Repository on GitHub', type: 'doc', url: 'https://github.com/donnemartin/system-design-primer' },
        ],
        practiceQuestions: ['What is horizontal vs vertical scaling?'],
      },
      {
        topicId: 'database-design',
        title: 'Database Design',
        description: 'SQL vs NoSQL, indexing, sharding, replication.',
        resources: [
          { title: 'MongoDB University Free Courses', type: 'course', url: 'https://learn.mongodb.com/' },
        ],
        practiceQuestions: ['Design a DB schema for Twitter.'],
      },
      {
        topicId: 'caching',
        title: 'Caching',
        description: 'Redis, CDN, cache invalidation strategies.',
        resources: [
          { title: 'Redis Official Documentation & Getting Started', type: 'doc', url: 'https://redis.io/documentation' },
        ],
        practiceQuestions: ['How would you cache search results?'],
      },
      {
        topicId: 'load-balancing',
        title: 'Load Balancing',
        description: 'Algorithms, reverse proxy, health checks.',
        resources: [
          { title: 'NGINX Reverse Proxy and Load Balancing Guide', type: 'article', url: 'https://www.nginx.com/resources/glossary/load-balancing/' },
        ],
        practiceQuestions: ['Design load balancing for a video streaming service.'],
      },
      {
        topicId: 'message-queues',
        title: 'Message Queues',
        description: 'Kafka, RabbitMQ, async communication patterns.',
        resources: [
          { title: 'Apache Kafka Official Quickstart Guide', type: 'doc', url: 'https://kafka.apache.org/quickstart' },
        ],
        practiceQuestions: ['When would you use a message queue vs REST?'],
      },
      {
        topicId: 'rest-api-design',
        title: 'REST API Design',
        description: 'HTTP methods, status codes, versioning, authentication.',
        resources: [
          { title: 'RESTful API Design Best Practices – FreeCodeCamp', type: 'article', url: 'https://www.freecodecamp.org/news/rest-api-design-best-practices/' },
        ],
        practiceQuestions: ['Design a REST API for a food delivery app.'],
      },
    ],
  },

  'verbal-ability': {
    pathKey: 'verbal-ability',
    title: 'Verbal Ability',
    description: 'Improve reading comprehension, vocabulary, and verbal reasoning for campus tests.',
    icon: '📝',
    color: '#14b8a6',
    level: 'Beginner',
    topics: [
      {
        topicId: 'reading-comprehension',
        title: 'Reading Comprehension',
        description: 'Main idea, inference, tone, vocabulary in context.',
        resources: [
          { title: 'IndiaBIX Reading Comprehension Tests', type: 'article', url: 'https://www.indiabix.com/verbal-ability/comprehension/' },
        ],
        practiceQuestions: ['Read a passage and identify the author\'s main argument.'],
      },
      {
        topicId: 'vocabulary-antonyms',
        title: 'Vocabulary & Synonyms/Antonyms',
        description: 'Word meaning, usage, GRE word lists.',
        resources: [
          { title: 'IndiaBIX Synonyms Practice Questions', type: 'article', url: 'https://www.indiabix.com/verbal-ability/synonyms/' },
        ],
        practiceQuestions: ['Find synonyms for: Eloquent, Ambiguous, Tenacious.'],
      },
      {
        topicId: 'sentence-correction',
        title: 'Sentence Correction',
        description: 'Grammar errors, verb agreement, modifiers.',
        resources: [
          { title: 'IndiaBIX Spotting Errors Questions', type: 'article', url: 'https://www.indiabix.com/verbal-ability/spotting-errors/' },
        ],
        practiceQuestions: ['Correct: "Everyone have their own opinion."'],
      },
      {
        topicId: 'para-jumbles',
        title: 'Para Jumbles',
        description: 'Rearranging sentences to form coherent paragraphs.',
        resources: [
          { title: 'IndiaBIX Paragraph Formation Tests', type: 'article', url: 'https://www.indiabix.com/verbal-ability/paragraph-formation/' },
        ],
        practiceQuestions: ['Arrange the given 5 sentences in logical order.'],
      },
      {
        topicId: 'idioms-phrases',
        title: 'Idioms & Phrases',
        description: 'Common English idioms and their correct usage.',
        resources: [
          { title: 'IndiaBIX Idioms and Phrases Questions', type: 'article', url: 'https://www.indiabix.com/verbal-ability/idioms-and-phrases/' },
        ],
        practiceQuestions: ['Use "bite the bullet" in a sentence correctly.'],
      },
      {
        topicId: 'fill-blanks',
        title: 'Fill in the Blanks',
        description: 'Contextual vocabulary, cloze test patterns.',
        resources: [
          { title: 'IndiaBIX Sentence Completion Questions', type: 'article', url: 'https://www.indiabix.com/verbal-ability/sentence-completion/' },
        ],
        practiceQuestions: ['Complete: "The scientist was known for her __ research."'],
      },
    ],
  },

  'python-dsa': {
    pathKey: 'python-dsa',
    title: 'Python & Data Structures',
    description: 'Master Python programming and core data structures needed for technical interviews.',
    icon: '🐍',
    color: '#3b82f6',
    level: 'Beginner',
    topics: [
      {
        topicId: 'python-basics',
        title: 'Python Basics',
        description: 'Variables, data types, control flow, functions, and file I/O.',
        resources: [
          { title: 'Python for Beginners – Programming with Mosh', type: 'video', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
          { title: 'W3Schools Python Tutorial', type: 'article', url: 'https://www.w3schools.com/python/' },
          { title: 'Python Official Documentation', type: 'doc', url: 'https://docs.python.org/3/tutorial/' },
        ],
        practiceQuestions: ['Write a Python function to find the factorial of a number.', 'Create a list comprehension to filter even numbers.'],
      },
      {
        topicId: 'python-oop',
        title: 'Python OOP',
        description: 'Classes, objects, inheritance, dunder methods, properties.',
        resources: [
          { title: 'Python OOP Tutorial – Corey Schafer', type: 'video', url: 'https://www.youtube.com/watch?v=ZDa-Z5JzLYM' },
          { title: 'GeeksforGeeks Python Classes and Objects', type: 'article', url: 'https://www.geeksforgeeks.org/python-classes-and-objects/' },
        ],
        practiceQuestions: ['Create a Vehicle class hierarchy with inheritance.'],
      },
      {
        topicId: 'python-collections',
        title: 'Python Collections & Built-ins',
        description: 'Lists, tuples, sets, dicts, collections module, itertools.',
        resources: [
          { title: 'Python Collections Module Documentation', type: 'doc', url: 'https://docs.python.org/3/library/collections.html' },
          { title: 'Real Python Data Structures Guide', type: 'article', url: 'https://realpython.com/python-data-structures/' },
        ],
        practiceQuestions: ['Count word frequency using Counter.', 'Use defaultdict to group items.'],
      },
      {
        topicId: 'arrays-strings-py',
        title: 'Arrays & Strings in Python',
        description: 'List operations, slicing, string manipulation, common patterns.',
        resources: [
          { title: 'GeeksforGeeks Python Array Problems', type: 'article', url: 'https://www.geeksforgeeks.org/array-in-python-set-1/' },
        ],
        practiceQuestions: ['Reverse a list in place.', 'Check if a string is a palindrome.'],
      },
      {
        topicId: 'linked-list-py',
        title: 'Linked Lists in Python',
        description: 'Implementing singly/doubly linked lists, common interview problems.',
        resources: [
          { title: 'GeeksforGeeks Linked List in Python', type: 'article', url: 'https://www.geeksforgeeks.org/linked-list-in-python/' },
          { title: 'LeetCode Linked List Problems', type: 'course', url: 'https://leetcode.com/tag/linked-list/' },
        ],
        practiceQuestions: ['Detect cycle in linked list.', 'Reverse a linked list.'],
      },
      {
        topicId: 'recursion-py',
        title: 'Recursion & Backtracking',
        description: 'Recursive solutions, memoization, backtracking patterns.',
        resources: [
          { title: 'Python Recursion Tutorial – Real Python', type: 'article', url: 'https://realpython.com/python-recursion/' },
        ],
        practiceQuestions: ['Generate all permutations of a list.', 'Solve Sudoku using backtracking.'],
      },
      {
        topicId: 'dp-py',
        title: 'Dynamic Programming in Python',
        description: 'Memoization with functools, tabulation, common DP patterns.',
        resources: [
          { title: 'LeetCode DP Pattern Collection', type: 'article', url: 'https://leetcode.com/discuss/general-discussion/458695/Dynamic-Programming-Patterns' },
          { title: 'GeeksforGeeks Python DP Examples', type: 'article', url: 'https://www.geeksforgeeks.org/dynamic-programming/' },
        ],
        practiceQuestions: ['Fibonacci with memoization.', 'Coin change problem.', '0/1 Knapsack.'],
      },
      {
        topicId: 'interview-problems-py',
        title: 'Interview Practice Problems',
        description: 'Top 50 Python interview coding problems.',
        resources: [
          { title: 'LeetCode Top 150 Interview Questions', type: 'course', url: 'https://leetcode.com/studyplan/top-interview-150/' },
          { title: 'GeeksforGeeks Must Do Coding Problems', type: 'article', url: 'https://www.geeksforgeeks.org/must-do-coding-questions-for-companies-like-amazon-microsoft-adobe/' },
        ],
        practiceQuestions: ['Two Sum', 'Best Time to Buy and Sell Stock', 'Maximum Subarray'],
      },
    ],
  },

  'resume-optimization': {
    pathKey: 'resume-optimization',
    title: 'Resume & ATS Optimization',
    description: 'Craft an ATS-beating resume that gets you shortlisted for top companies.',
    icon: '📄',
    color: '#6366f1',
    level: 'Beginner',
    topics: [
      {
        topicId: 'resume-structuring',
        title: 'Resume Structuring',
        description: 'Sections, ordering, length, font, margins.',
        resources: [
          { title: 'Harvard University Extension Resume Guide (PDF)', type: 'doc', url: 'https://exts.harvard.edu/wp-content/uploads/sites/8/2020/08/hes-resume-cover-letter-guide.pdf' },
        ],
        practiceQuestions: ['Create a one-page resume structure outline.'],
      },
      {
        topicId: 'bullet-points',
        title: 'Writing Bullet Points',
        description: 'Action verbs, quantifying achievements, STAR format.',
        resources: [
          { title: 'Google Resume Formula – XYZ Rule Guide', type: 'article', url: 'https://www.inc.com/bill-murphy-jr/google-recruiters-say-this-is-how-to-write-a-perfect-resume.html' },
        ],
        practiceQuestions: ['Rewrite 3 vague resume bullet points with metrics.'],
      },
      {
        topicId: 'ats-keywords',
        title: 'ATS Keywords',
        description: 'Job description keyword matching, tools like Jobscan.',
        resources: [
          { title: 'Jobscan ATS Resume Optimization Guide', type: 'article', url: 'https://www.jobscan.co/blog/ats-resume-guide/' },
        ],
        practiceQuestions: ['Scan your resume against a job description using Jobscan.'],
      },
      {
        topicId: 'technical-skills-section',
        title: 'Technical Skills Section',
        description: 'Listing skills strategically, avoiding fluff.',
        resources: [
          { title: 'ResumeWorded Technical Resume Examples', type: 'article', url: 'https://resumeworded.com/skills-section' },
        ],
        practiceQuestions: ['List 10 technical skills relevant to a Java Developer role.'],
      },
      {
        topicId: 'projects-internship',
        title: 'Projects & Internship Section',
        description: 'Describing projects with impact and tech stack.',
        resources: [
          { title: 'Reddit r/Resumes Project Section Guide', type: 'article', url: 'https://www.reddit.com/r/resumes/' },
        ],
        practiceQuestions: ['Write a compelling 3-line project description.'],
      },
    ],
  },
};

export const ALL_PATH_KEYS = Object.keys(PATH_CATALOG);

/**
 * Determine which learning paths to recommend for a user based on their performance data.
 */
export function generatePersonalizedPaths(performanceData = {}) {
  const {
    codingScore = null,
    aptitudeScore = null,
    communicationScore = null,
    technicalScore = null,
    resumeScore = null,
    atsScore = null,
    weakAreas = [],
    primaryLanguage = 'Java',
    logicalScore = null,
    verbalScore = null,
  } = performanceData;

  const recommendations = [];

  const addPath = (pathKey, reason, priority, level = null, triggerScore = 0) => {
    const template = PATH_CATALOG[pathKey];
    if (!template) return;
    recommendations.push({
      ...template,
      reason,
      priority,
      level: level || template.level,
      triggerScore,
    });
  };

  // ── CODING ──────────────────────────────────────────────────────────────────
  if (codingScore !== null) {
    const langPath = primaryLanguage?.toLowerCase().includes('python') ? 'python-dsa' : 'java-dsa';
    if (codingScore < 50) {
      addPath(langPath, `Your coding score is ${codingScore}% — below the 50% threshold. Strong DSA skills are essential for technical rounds.`, 'High', 'Beginner', codingScore);
    } else if (codingScore < 75) {
      addPath(langPath, `Your coding score is ${codingScore}%. Improving DSA skills will push you into the top tier.`, 'Medium', 'Intermediate', codingScore);
    }
  }

  // ── TECHNICAL INTERVIEW ─────────────────────────────────────────────────────
  if (technicalScore !== null && technicalScore < 60) {
    addPath('system-design', `Your technical interview score is ${technicalScore}%. System design and architecture knowledge is frequently tested.`, technicalScore < 40 ? 'High' : 'Medium', 'Intermediate', technicalScore);
  }

  // ── APTITUDE (QUANTITATIVE) ─────────────────────────────────────────────────
  if (aptitudeScore !== null && aptitudeScore < 70) {
    addPath('aptitude', `Your aptitude score is ${aptitudeScore}%. Quantitative aptitude is tested in most placement assessments.`, aptitudeScore < 50 ? 'High' : 'Medium', 'Beginner', aptitudeScore);
  }

  // ── LOGICAL REASONING ──────────────────────────────────────────────────────
  if (logicalScore !== null && logicalScore < 70) {
    addPath('logical-reasoning', `Your logical reasoning score is ${logicalScore}%. This area directly impacts aptitude test performance.`, logicalScore < 50 ? 'High' : 'Medium', 'Beginner', logicalScore);
  } else if (weakAreas.some((a) => a.toLowerCase().includes('logic'))) {
    addPath('logical-reasoning', 'Logical Reasoning was flagged as a weak area in your recent assessment.', 'Medium', 'Beginner', 0);
  }

  // ── VERBAL / COMMUNICATION ──────────────────────────────────────────────────
  if (communicationScore !== null && communicationScore < 65) {
    addPath('communication', `Your communication score is ${communicationScore}%. Strong communication is the #1 differentiator in HR and behavioural rounds.`, communicationScore < 45 ? 'High' : 'Medium', 'Beginner', communicationScore);
  }

  // ── VERBAL ABILITY ──────────────────────────────────────────────────────────
  if (verbalScore !== null && verbalScore < 60) {
    addPath('verbal-ability', `Your verbal ability score is ${verbalScore}%. Improving comprehension and vocabulary directly boosts aptitude test scores.`, verbalScore < 45 ? 'High' : 'Medium', 'Beginner', verbalScore);
  } else if (weakAreas.some((a) => a.toLowerCase().includes('verbal'))) {
    addPath('verbal-ability', 'Verbal Ability was identified as a weak area in your assessment.', 'Medium', 'Beginner', 0);
  }

  // ── RESUME / ATS ────────────────────────────────────────────────────────────
  const resumeOrAts = resumeScore ?? atsScore;
  if (resumeOrAts !== null && resumeOrAts < 70) {
    addPath('resume-optimization', `Your resume/ATS score is ${resumeOrAts}%. A strong resume is the gateway to getting interview calls.`, resumeOrAts < 50 ? 'High' : 'Medium', 'Beginner', resumeOrAts);
  }

  // ── FALLBACK: If user is new or has no data ─────────────────────────────────
  if (recommendations.length === 0) {
    addPath('java-dsa', 'Welcome! We recommend starting with Java & DSA — the foundation of all technical interviews.', 'High', 'Beginner', 0);
    addPath('communication', 'Soft skills matter as much as technical skills. Start building interview communication skills.', 'Medium', 'Beginner', 0);
    addPath('aptitude', 'Quantitative aptitude is tested in every campus placement round.', 'Medium', 'Beginner', 0);
  }

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}
