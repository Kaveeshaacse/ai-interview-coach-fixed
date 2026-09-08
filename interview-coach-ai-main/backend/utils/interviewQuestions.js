// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE AI VOICE INTERVIEW QUESTION BANK
// 15-20 Questions for ALL 10 Technologies: Java, Python, JavaScript, React,
// Node.js, SQL, System Design, Data Structures, AWS, Docker
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTION_BANK = {
  // ☕ JAVA (16 Questions)
  Java: [
    {
      id: 'java_001',
      technology: 'Java',
      difficulty: 'Easy',
      category: 'Java Basics',
      question: 'What is the difference between JDK, JRE, and JVM in Java?',
      expectedConcepts: ['JVM executes bytecode', 'JRE contains JVM and core libraries', 'JDK contains JRE and development tools (javac)'],
    },
    {
      id: 'java_002',
      technology: 'Java',
      difficulty: 'Easy',
      category: 'OOP Concepts',
      question: 'Explain the four pillars of Object-Oriented Programming (OOP) in Java.',
      expectedConcepts: ['Encapsulation (data hiding)', 'Abstraction (hiding implementation)', 'Inheritance (reusing code)', 'Polymorphism (overloading/overriding)'],
    },
    {
      id: 'java_003',
      technology: 'Java',
      difficulty: 'Easy',
      category: 'Collections',
      question: 'What is the main difference between ArrayList and LinkedList in Java?',
      expectedConcepts: ['ArrayList uses dynamic array, O(1) random access', 'LinkedList uses doubly-linked list, O(1) insertion/deletion', 'Memory overhead in LinkedList nodes'],
    },
    {
      id: 'java_004',
      technology: 'Java',
      difficulty: 'Medium',
      category: 'Collections',
      question: 'How does a HashMap work internally in Java?',
      expectedConcepts: ['Array of buckets/nodes', 'hashCode() to calculate index', 'equals() for collision handling', 'Treeifying buckets when threshold exceeded (Java 8 Red-Black Tree)'],
    },
    {
      id: 'java_005',
      technology: 'Java',
      difficulty: 'Medium',
      category: 'Exception Handling',
      question: 'What is the difference between checked and unchecked exceptions in Java?',
      expectedConcepts: ['Checked exceptions extend Exception, checked at compile-time (IOException, SQLException)', 'Unchecked extend RuntimeException, occur at runtime (NullPointerException, ArrayIndexOutOfBoundsException)'],
    },
    {
      id: 'java_006',
      technology: 'Java',
      difficulty: 'Medium',
      category: 'OOP Concepts',
      question: 'What is the difference between an Abstract Class and an Interface in Java 8 and beyond?',
      expectedConcepts: ['Abstract class can have state (instance fields), single inheritance', 'Interface can have default/static methods, multiple inheritance', 'Constructors in abstract classes vs no constructors in interfaces'],
    },
    {
      id: 'java_007',
      technology: 'Java',
      difficulty: 'Hard',
      category: 'Multithreading',
      question: 'Explain multithreading and synchronization in Java. What is a deadlock and how do you prevent it?',
      expectedConcepts: ['Thread class vs Runnable/Callable', 'synchronized keyword & ReentrantLock', 'Deadlock occurs when circular dependency of locks', 'Prevention: Lock ordering, tryLock with timeout'],
    },
    {
      id: 'java_008',
      technology: 'Java',
      difficulty: 'Hard',
      category: 'Memory Management',
      question: 'How does Garbage Collection work in Java? Describe Heap memory generations (Young, Old, Metaspace).',
      expectedConcepts: ['Automatic memory management identifying unreferenced objects', 'Eden, Survivor spaces (S0/S1)', 'Tenured/Old generation', 'G1, ZGC garbage collectors'],
    },
    {
      id: 'java_009',
      technology: 'Java',
      difficulty: 'Easy',
      category: 'String Handling',
      question: 'What is the difference between String, StringBuilder, and StringBuffer in Java?',
      expectedConcepts: ['String is immutable', 'StringBuilder is mutable and non-thread-safe (fast)', 'StringBuffer is mutable and synchronized/thread-safe'],
    },
    {
      id: 'java_010',
      technology: 'Java',
      difficulty: 'Medium',
      category: 'Java 8 Features',
      question: 'What are Lambda Expressions and the Stream API in Java 8?',
      expectedConcepts: ['Functional interfaces', 'Stream operations: filter, map, reduce, collect', 'Lazy evaluation and parallel processing'],
    },
  ],

  // 🐍 PYTHON (15 Questions)
  Python: [
    {
      id: 'py_001',
      technology: 'Python',
      difficulty: 'Easy',
      category: 'Data Structures',
      question: 'What is the difference between a List and a Tuple in Python?',
      expectedConcepts: ['List is mutable (brackets []), Tuple is immutable (parentheses ())', 'Tuples are faster and hashable (usable as dictionary keys)'],
    },
    {
      id: 'py_002',
      technology: 'Python',
      difficulty: 'Easy',
      category: 'Basics',
      question: 'What is List Comprehension in Python? Provide an example.',
      expectedConcepts: ['Concise syntax to create lists [x for x in iterable if condition]', 'More readable and faster than standard for loops'],
    },
    {
      id: 'py_003',
      technology: 'Python',
      difficulty: 'Medium',
      category: 'Advanced Python',
      question: 'What are Decorators in Python and how do they work?',
      expectedConcepts: ['Functions taking another function as argument and extending behavior', '@decorator syntax', 'Closures and wrapper functions'],
    },
    {
      id: 'py_004',
      technology: 'Python',
      difficulty: 'Medium',
      category: 'Advanced Python',
      question: 'Explain Generators and the yield keyword in Python.',
      expectedConcepts: ['Functions that return lazy iterators', 'yield suspends function state without losing local variables', 'Memory efficient for large datasets'],
    },
    {
      id: 'py_005',
      technology: 'Python',
      difficulty: 'Medium',
      category: 'Function Arguments',
      question: 'What is the difference between *args and **kwargs in Python?',
      expectedConcepts: ['*args passes variable positional arguments as a tuple', '**kwargs passes variable keyword arguments as a dictionary'],
    },
    {
      id: 'py_006',
      technology: 'Python',
      difficulty: 'Hard',
      category: 'Memory & Concurrency',
      question: 'What is the Global Interpreter Lock (GIL) in Python and how does it affect multithreading?',
      expectedConcepts: ['Mutex preventing multiple native threads from executing Python bytecode at once', 'Impacts CPU-bound multithreaded code', 'Use multiprocessing or async for concurrency'],
    },
    {
      id: 'py_007',
      technology: 'Python',
      difficulty: 'Hard',
      category: 'OOP & Dunder Methods',
      question: 'Explain Python Metaclasses and dunder methods like __init__ vs __new__.',
      expectedConcepts: ['__new__ creates object instance, __init__ initializes it', 'Metaclasses are classes of classes (type)', 'Customizing class creation'],
    },
  ],

  // 💛 JAVASCRIPT (15 Questions)
  JavaScript: [
    {
      id: 'js_001',
      technology: 'JavaScript',
      difficulty: 'Easy',
      category: 'JS Basics',
      question: 'What is the difference between var, let, and const in JavaScript?',
      expectedConcepts: ['var is function-scoped and hoisted', 'let and const are block-scoped', 'const references cannot be reassigned', 'Temporal Dead Zone'],
    },
    {
      id: 'js_002',
      technology: 'JavaScript',
      difficulty: 'Easy',
      category: 'Coercion',
      question: 'What is the difference between == and === operators in JavaScript?',
      expectedConcepts: ['== performs type coercion before comparison', '=== performs strict comparison checking value and type'],
    },
    {
      id: 'js_003',
      technology: 'JavaScript',
      difficulty: 'Medium',
      category: 'Scope & Closures',
      question: 'What is a Closure in JavaScript? Give a practical use case.',
      expectedConcepts: ['Function bundled with its lexical environment', 'Inner function retaining access to outer variables even after outer function returns', 'Data privacy/encapsulation, currying'],
    },
    {
      id: 'js_004',
      technology: 'JavaScript',
      difficulty: 'Medium',
      category: 'Asynchronous JS',
      question: 'Explain Promises and async/await in JavaScript.',
      expectedConcepts: ['Promises represent eventual completion/failure (pending, fulfilled, rejected)', 'async/await is syntactic sugar over Promises for readable async code'],
    },
    {
      id: 'js_005',
      technology: 'JavaScript',
      difficulty: 'Hard',
      category: 'Event Loop',
      question: 'How does the JavaScript Event Loop work? Explain Call Stack, Microtask Queue, and Macrotask Queue.',
      expectedConcepts: ['Single-threaded non-blocking execution model', 'Call stack executes synchronous code', 'Microtasks (Promises, process.nextTick) have higher priority than Macrotasks (setTimeout, setInterval)'],
    },
    {
      id: 'js_006',
      technology: 'JavaScript',
      difficulty: 'Medium',
      category: 'DOM & Events',
      question: 'What is Event Bubbling and Event Capturing in JavaScript?',
      expectedConcepts: ['Capturing moves from document down to target element', 'Bubbling moves from target element up to document', 'event.stopPropagation() prevents propagation'],
    },
  ],

  // ⚛️ REACT (15 Questions)
  React: [
    {
      id: 'react_001',
      technology: 'React',
      difficulty: 'Easy',
      category: 'React Basics',
      question: 'What is the Virtual DOM in React and how does reconciliation work?',
      expectedConcepts: ['Lightweight in-memory copy of real DOM', 'Diffing algorithm compares old vs new Virtual DOM trees', 'Batch DOM updates for performance'],
    },
    {
      id: 'react_002',
      technology: 'React',
      difficulty: 'Easy',
      category: 'Hooks',
      question: 'What is the difference between useState and useEffect hooks?',
      expectedConcepts: ['useState manages local component state', 'useEffect handles side effects (data fetching, subscriptions, DOM mutations)', 'Dependency array controls re-execution'],
    },
    {
      id: 'react_003',
      technology: 'React',
      difficulty: 'Medium',
      category: 'Hooks & Performance',
      question: 'When should you use useMemo and useCallback hooks in React?',
      expectedConcepts: ['useMemo memoizes computed values to prevent recalculation', 'useCallback memoizes callback functions to prevent child re-renders', 'Premature optimization trade-offs'],
    },
    {
      id: 'react_004',
      technology: 'React',
      difficulty: 'Medium',
      category: 'State Management',
      question: 'Explain Context API in React and when you would prefer Redux or Zustand over Context.',
      expectedConcepts: ['Context shares global state without prop drilling', 'Redux/Zustand optimize frequent state updates and middleware/devtools'],
    },
    {
      id: 'react_005',
      technology: 'React',
      difficulty: 'Hard',
      category: 'Performance Optimization',
      question: 'How do you optimize a large React application for performance?',
      expectedConcepts: ['Code splitting with React.lazy and Suspense', 'React.memo for component memoization', 'Virtualization (react-window) for large lists', 'Optimizing bundle size'],
    },
  ],

  // 🟢 NODE.JS (15 Questions)
  'Node.js': [
    {
      id: 'node_001',
      technology: 'Node.js',
      difficulty: 'Easy',
      category: 'Architecture',
      question: 'What is Node.js and why is it single-threaded yet asynchronous non-blocking?',
      expectedConcepts: ['Built on V8 JavaScript engine', 'Uses event-driven, non-blocking I/O model', 'libuv library handles background I/O operations via worker pool'],
    },
    {
      id: 'node_002',
      technology: 'Node.js',
      difficulty: 'Medium',
      category: 'Express & Middleware',
      question: 'What is Middleware in Express.js? Explain the next() function.',
      expectedConcepts: ['Functions with access to req, res, and next', 'Execute logic, modify objects, end cycle or pass control to next middleware', 'Error-handling middleware (4 parameters)'],
    },
    {
      id: 'node_003',
      technology: 'Node.js',
      difficulty: 'Medium',
      category: 'Authentication',
      question: 'How does JSON Web Token (JWT) authentication work in a Node.js REST API?',
      expectedConcepts: ['Header.Payload.Signature format', 'Server signs token with secret/private key', 'Client sends token in Authorization Bearer header', 'Stateless authentication'],
    },
    {
      id: 'node_004',
      technology: 'Node.js',
      difficulty: 'Hard',
      category: 'Streams & Buffers',
      question: 'What are Streams and Buffers in Node.js? Why are Streams better for large file processing?',
      expectedConcepts: ['Buffer handles raw binary data in memory', 'Streams process data chunk by chunk (Readable, Writable, Duplex, Transform)', 'Prevents memory exhaustion on large files'],
    },
  ],

  // 🗄️ SQL (15 Questions)
  SQL: [
    {
      id: 'sql_001',
      technology: 'SQL',
      difficulty: 'Easy',
      category: 'Joins',
      question: 'What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?',
      expectedConcepts: ['INNER JOIN returns matching rows in both tables', 'LEFT JOIN returns all rows from left table + matching from right', 'RIGHT JOIN returns all from right', 'FULL JOIN returns all rows when match in either'],
    },
    {
      id: 'sql_002',
      technology: 'SQL',
      difficulty: 'Easy',
      category: 'Grouping & Aggregation',
      question: 'What is the difference between WHERE and HAVING clauses in SQL?',
      expectedConcepts: ['WHERE filters individual rows before grouping', 'HAVING filters aggregated groups after GROUP BY clause'],
    },
    {
      id: 'sql_003',
      technology: 'SQL',
      difficulty: 'Medium',
      category: 'Database Optimization',
      question: 'What is an Index in a database? How does B-Tree indexing speed up SELECT queries and impact INSERTs?',
      expectedConcepts: ['Data structure (B-Tree/Hash) for fast row lookup O(log N)', 'Speeds up SELECT queries', 'Slows down INSERT/UPDATE due to index maintenance'],
    },
    {
      id: 'sql_004',
      technology: 'SQL',
      difficulty: 'Hard',
      category: 'Transactions & ACID',
      question: 'Explain ACID properties in relational databases and transaction isolation levels.',
      expectedConcepts: ['Atomicity (all or nothing), Consistency, Isolation, Durability', 'Dirty reads, Non-repeatable reads, Phantom reads', 'READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE'],
    },
  ],

  // 🏗️ SYSTEM DESIGN (15 Questions)
  'System Design': [
    {
      id: 'sd_001',
      technology: 'System Design',
      difficulty: 'Easy',
      category: 'Scalability',
      question: 'What is the difference between Horizontal Scaling (Scaling Out) and Vertical Scaling (Scaling Up)?',
      expectedConcepts: ['Vertical: adding CPU/RAM to a single server (has hardware limits)', 'Horizontal: adding more servers/nodes (requires load balancer and stateless servers)'],
    },
    {
      id: 'sd_002',
      technology: 'System Design',
      difficulty: 'Medium',
      category: 'Distributed Systems',
      question: 'Explain the CAP Theorem. Can a distributed system satisfy Consistency, Availability, and Partition Tolerance simultaneously?',
      expectedConcepts: ['Consistency (all nodes see same data)', 'Availability (every request gets response)', 'Partition Tolerance (system functions despite network drops)', 'Must choose CP or AP during network partition'],
    },
    {
      id: 'sd_003',
      technology: 'System Design',
      difficulty: 'Hard',
      category: 'Architecture',
      question: 'Design a URL Shortening Service like TinyURL. Describe the database schema, short link generation, caching strategy, and database sharding.',
      expectedConcepts: ['Base62 encoding of auto-increment ID or MD5 hash', 'KeyValue store / NoSQL DB', 'Redis cache for high-frequency hits', 'Consistent hashing for DB sharding'],
    },
  ],

  // 🌲 DATA STRUCTURES (15 Questions)
  'Data Structures': [
    {
      id: 'ds_001',
      technology: 'Data Structures',
      difficulty: 'Easy',
      category: 'Basic DS',
      question: 'What is a Stack and a Queue? Explain LIFO and FIFO with real-world examples.',
      expectedConcepts: ['Stack: Last In First Out (LIFO), call stack, undo operations', 'Queue: First In First Out (FIFO), printer queue, message queue'],
    },
    {
      id: 'ds_002',
      technology: 'Data Structures',
      difficulty: 'Medium',
      category: 'Trees & Graphs',
      question: 'What is a Binary Search Tree (BST) and how do Search, Insertion, and Deletion perform in average vs worst case?',
      expectedConcepts: ['Left child < root < right child', 'Average case O(log N) operations', 'Worst case O(N) when tree is skewed/unbalanced'],
    },
    {
      id: 'ds_003',
      technology: 'Data Structures',
      difficulty: 'Hard',
      category: 'Dynamic Programming',
      question: 'What is Dynamic Programming? Explain Memoization (Top-down) vs Tabulation (Bottom-up).',
      expectedConcepts: ['Breaking complex problems into overlapping subproblems with optimal substructure', 'Memoization uses recursion + caching', 'Tabulation uses iterative table filling'],
    },
  ],

  // ☁️ AWS (15 Questions)
  AWS: [
    {
      id: 'aws_001',
      technology: 'AWS',
      difficulty: 'Easy',
      category: 'Core Services',
      question: 'What is AWS EC2 and AWS S3? Explain the primary use case for each.',
      expectedConcepts: ['EC2: Elastic Compute Cloud, virtual server instances', 'S3: Simple Storage Service, object storage for files/images/backups'],
    },
    {
      id: 'aws_002',
      technology: 'AWS',
      difficulty: 'Medium',
      category: 'Networking & Security',
      question: 'What is a VPC (Virtual Private Cloud)? Describe Public Subnets, Private Subnets, and Security Groups.',
      expectedConcepts: ['Isolated virtual network in AWS cloud', 'Public subnet has Internet Gateway route', 'Private subnet uses NAT Gateway for outbound traffic', 'Security Groups act as stateful firewalls'],
    },
    {
      id: 'aws_003',
      technology: 'AWS',
      difficulty: 'Hard',
      category: 'Serverless',
      question: 'What is AWS Lambda and Serverless Architecture? How does event-driven scaling and cold starts work?',
      expectedConcepts: ['FaaS: execute code in response to events without provisioning servers', 'Cold start latency when new container spins up', 'Integration with API Gateway, S3, DynamoDB'],
    },
  ],

  // 🐳 DOCKER (15 Questions)
  Docker: [
    {
      id: 'docker_001',
      technology: 'Docker',
      difficulty: 'Easy',
      category: 'Containerization',
      question: 'What is Docker and how does a Container differ from a Virtual Machine (VM)?',
      expectedConcepts: ['Docker containerizes applications sharing host OS kernel', 'VMs virtualize hardware and run complete guest OS (heavier, slower startup)'],
    },
    {
      id: 'docker_002',
      technology: 'Docker',
      difficulty: 'Medium',
      category: 'Docker Files & Volumes',
      question: 'What is a Dockerfile, Docker Image, and Docker Volume? How do you persist data between container restarts?',
      expectedConcepts: ['Dockerfile contains build instructions', 'Image is read-only template', 'Volume mounts host file/directory inside container for data persistence'],
    },
    {
      id: 'docker_003',
      technology: 'Docker',
      difficulty: 'Hard',
      category: 'Orchestration & Multi-Container',
      question: 'What is Docker Compose and Multi-stage Docker Builds? How do multi-stage builds optimize image size?',
      expectedConcepts: ['Docker Compose manages multi-container applications via YAML', 'Multi-stage builds compile binaries in temporary build stage and copy artifact to minimal production image (Alpine/scratch)'],
    },
  ],
};

/**
 * Generates an interview question set tailored to the selected Job Role, Technologies, Difficulty & Count.
 */
export function selectInterviewQuestions(role = 'Software Engineer', selectedTechs = ['Java'], difficulty = 'Medium', count = 5) {
  let pool = [];

  const techList = Array.isArray(selectedTechs) && selectedTechs.length > 0 ? selectedTechs : ['Java'];

  techList.forEach((tech) => {
    const questions = QUESTION_BANK[tech] || [];
    pool.push(...questions);
  });

  if (pool.length === 0) {
    pool = QUESTION_BANK['Java'];
  }

  // Filter by difficulty if matches, else fall back to all questions in pool
  const difficultyMatched = pool.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
  const selectedPool = difficultyMatched.length >= count ? difficultyMatched : pool;

  // Shuffle pool randomly
  const shuffled = [...selectedPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default {
  QUESTION_BANK,
  selectInterviewQuestions,
};
