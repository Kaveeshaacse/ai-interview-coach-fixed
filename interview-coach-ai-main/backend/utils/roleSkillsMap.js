// ─────────────────────────────────────────────────────────────────────────────
// ROLE → TECHNICAL SKILLS MAPPING
// Used by Technical Interview to derive relevant topics from Job Role alone.
// Users no longer need to manually select technologies.
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_SKILLS_MAP = {
  'Software Engineer': {
    primaryTopics: ['Data Structures', 'Algorithms', 'OOP', 'System Design'],
    secondaryTopics: ['Java', 'Python', 'SQL', 'REST API', 'Git', 'Testing'],
    description: 'Core software engineering fundamentals, data structures, and system design.',
  },
  'Java Developer': {
    primaryTopics: ['Java', 'OOP', 'Spring Boot', 'Collections'],
    secondaryTopics: ['SQL', 'REST API', 'Exception Handling', 'Multithreading', 'JVM', 'Maven', 'Testing'],
    description: 'Core Java, Spring Boot, OOP, database, and API design.',
  },
  'Python Developer': {
    primaryTopics: ['Python', 'OOP', 'Data Structures', 'REST API'],
    secondaryTopics: ['Django', 'Flask', 'SQL', 'Testing', 'Exception Handling', 'Decorators', 'Generators'],
    description: 'Python fundamentals, frameworks, OOP, and API development.',
  },
  'Frontend Developer': {
    primaryTopics: ['JavaScript', 'HTML', 'CSS', 'React'],
    secondaryTopics: ['DOM', 'Async JavaScript', 'Web Performance', 'Responsive Design', 'Accessibility', 'TypeScript', 'State Management'],
    description: 'Frontend fundamentals, JavaScript, React, and web performance.',
  },
  'Backend Developer': {
    primaryTopics: ['REST API', 'Databases', 'Authentication', 'System Design'],
    secondaryTopics: ['Node.js', 'SQL', 'NoSQL', 'Caching', 'Security', 'Microservices', 'Testing', 'Error Handling'],
    description: 'Backend architecture, APIs, databases, security, and scalability.',
  },
  'Full Stack Developer': {
    primaryTopics: ['JavaScript', 'React', 'Node.js', 'REST API'],
    secondaryTopics: ['HTML', 'CSS', 'SQL', 'MongoDB', 'Authentication', 'System Design', 'Testing', 'Git'],
    description: 'Full-stack development covering frontend, backend, and databases.',
  },
  'Data Scientist': {
    primaryTopics: ['Python', 'Machine Learning', 'Statistics', 'Data Analysis'],
    secondaryTopics: ['Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Feature Engineering', 'Model Evaluation', 'Data Visualization'],
    description: 'Data science, machine learning, statistics, and Python data tools.',
  },
  'Machine Learning Engineer': {
    primaryTopics: ['Python', 'Machine Learning', 'Deep Learning', 'Model Deployment'],
    secondaryTopics: ['TensorFlow', 'PyTorch', 'Feature Engineering', 'SQL', 'MLOps', 'Statistics', 'NLP', 'Computer Vision'],
    description: 'ML algorithms, deep learning, model deployment, and MLOps.',
  },
  'DevOps Engineer': {
    primaryTopics: ['Linux', 'Docker', 'CI/CD', 'Cloud'],
    secondaryTopics: ['Kubernetes', 'Terraform', 'AWS', 'Jenkins', 'Monitoring', 'Bash Scripting', 'Networking', 'Security'],
    description: 'DevOps practices, containerisation, CI/CD, and cloud infrastructure.',
  },
  'Cloud Engineer': {
    primaryTopics: ['AWS', 'Cloud Architecture', 'Security', 'Networking'],
    secondaryTopics: ['Docker', 'Kubernetes', 'Terraform', 'IAM', 'Serverless', 'Cost Optimisation', 'Monitoring'],
    description: 'Cloud infrastructure, architecture, security, and cost optimisation.',
  },
  'Data Analyst': {
    primaryTopics: ['SQL', 'Data Analysis', 'Statistics', 'Data Visualisation'],
    secondaryTopics: ['Python', 'Excel', 'Tableau', 'Power BI', 'ETL', 'Reporting', 'Business Intelligence'],
    description: 'SQL, data analysis, visualisation, and business intelligence.',
  },
};

export const TECHNICAL_QUESTION_BANK = {
  'Software Engineer': {
    Easy: [
      { id: 'se_e1', question: 'What is the difference between a stack and a queue? Give a real-world example of each.', topic: 'Data Structures', difficulty: 'Easy' },
      { id: 'se_e2', question: 'Explain the concept of Object-Oriented Programming. What are its four main principles?', topic: 'OOP', difficulty: 'Easy' },
      { id: 'se_e3', question: 'What is the time complexity of binary search? When can you use it?', topic: 'Algorithms', difficulty: 'Easy' },
      { id: 'se_e4', question: 'What is version control and why is it important in software development?', topic: 'Git', difficulty: 'Easy' },
      { id: 'se_e5', question: 'Explain the difference between a list and a dictionary (or HashMap).', topic: 'Data Structures', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'se_m1', question: 'Explain how a hash table works internally. What happens during a collision?', topic: 'Data Structures', difficulty: 'Medium' },
      { id: 'se_m2', question: 'What is the difference between breadth-first search and depth-first search? When would you choose each?', topic: 'Algorithms', difficulty: 'Medium' },
      { id: 'se_m3', question: 'What are SOLID principles? Explain each with a brief example.', topic: 'OOP', difficulty: 'Medium' },
      { id: 'se_m4', question: 'Explain the concept of recursion. What is a base case and why is it important?', topic: 'Algorithms', difficulty: 'Medium' },
      { id: 'se_m5', question: 'What is a REST API? What are the key principles of RESTful design?', topic: 'REST API', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'se_h1', question: 'Design a URL shortening service like bit.ly. What components would you use and how would you handle scalability?', topic: 'System Design', difficulty: 'Hard' },
      { id: 'se_h2', question: 'What is dynamic programming? Explain with a real problem like the knapsack problem or longest common subsequence.', topic: 'Algorithms', difficulty: 'Hard' },
      { id: 'se_h3', question: 'What are the trade-offs between microservices and monolithic architectures? When would you choose one over the other?', topic: 'System Design', difficulty: 'Hard' },
      { id: 'se_h4', question: 'How would you design a caching strategy for a high-traffic web application? What invalidation strategies would you use?', topic: 'System Design', difficulty: 'Hard' },
    ],
  },

  'Java Developer': {
    Easy: [
      { id: 'java_e1', question: 'What is the difference between JDK, JRE, and JVM?', topic: 'Java Basics', difficulty: 'Easy' },
      { id: 'java_e2', question: 'What is the difference between ArrayList and LinkedList in Java?', topic: 'Collections', difficulty: 'Easy' },
      { id: 'java_e3', question: 'What is the difference between == and .equals() in Java?', topic: 'Java Basics', difficulty: 'Easy' },
      { id: 'java_e4', question: 'What are checked and unchecked exceptions in Java?', topic: 'Exception Handling', difficulty: 'Easy' },
      { id: 'java_e5', question: 'What is the difference between an abstract class and an interface in Java?', topic: 'OOP', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'java_m1', question: 'How does a HashMap work internally in Java? How does it handle hash collisions?', topic: 'Collections', difficulty: 'Medium' },
      { id: 'java_m2', question: 'Explain Java\'s memory model — heap, stack, and garbage collection.', topic: 'JVM', difficulty: 'Medium' },
      { id: 'java_m3', question: 'What are Java 8 lambda expressions and Stream API? Give a practical example.', topic: 'Java 8+', difficulty: 'Medium' },
      { id: 'java_m4', question: 'What is synchronization in Java? How do you prevent race conditions in multithreaded code?', topic: 'Multithreading', difficulty: 'Medium' },
      { id: 'java_m5', question: 'What are Spring Boot starters? How does auto-configuration work in Spring Boot?', topic: 'Spring Boot', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'java_h1', question: 'How would you design a thread pool in Java? What are the trade-offs between different pool sizes?', topic: 'Multithreading', difficulty: 'Hard' },
      { id: 'java_h2', question: 'Explain the difference between optimistic and pessimistic locking in JPA/Hibernate. When would you use each?', topic: 'Database', difficulty: 'Hard' },
      { id: 'java_h3', question: 'How does the Java Garbage Collector work? Explain different GC algorithms like G1 and ZGC.', topic: 'JVM', difficulty: 'Hard' },
      { id: 'java_h4', question: 'Design a REST API using Spring Boot for a library management system. What endpoints, error handling, and security measures would you include?', topic: 'Spring Boot', difficulty: 'Hard' },
    ],
  },

  'Python Developer': {
    Easy: [
      { id: 'py_e1', question: 'What is the difference between a list and a tuple in Python?', topic: 'Python Basics', difficulty: 'Easy' },
      { id: 'py_e2', question: 'What are Python decorators? Give a simple example.', topic: 'Python Advanced', difficulty: 'Easy' },
      { id: 'py_e3', question: 'What is the difference between deep copy and shallow copy in Python?', topic: 'Python Basics', difficulty: 'Easy' },
      { id: 'py_e4', question: 'How does Python handle exceptions? Explain try, except, else, and finally.', topic: 'Exception Handling', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'py_m1', question: 'Explain Python generators and how they differ from regular functions. What are the memory advantages?', topic: 'Python Advanced', difficulty: 'Medium' },
      { id: 'py_m2', question: 'What is the Global Interpreter Lock (GIL) in Python? How does it affect multithreading?', topic: 'Python Internals', difficulty: 'Medium' },
      { id: 'py_m3', question: 'How would you build a REST API using Flask or FastAPI? Explain the key components.', topic: 'Web Frameworks', difficulty: 'Medium' },
      { id: 'py_m4', question: 'What are context managers in Python? When and how would you create a custom one?', topic: 'Python Advanced', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'py_h1', question: 'Explain Python\'s memory management, reference counting, and cyclic garbage collection.', topic: 'Python Internals', difficulty: 'Hard' },
      { id: 'py_h2', question: 'How would you design an asynchronous web scraper using asyncio in Python? What challenges would you face at scale?', topic: 'Async Python', difficulty: 'Hard' },
      { id: 'py_h3', question: 'What are metaclasses in Python? When would you use one and what are the risks?', topic: 'Python Advanced', difficulty: 'Hard' },
    ],
  },

  'Frontend Developer': {
    Easy: [
      { id: 'fe_e1', question: 'What is the difference between HTML, CSS, and JavaScript? How do they work together?', topic: 'Web Fundamentals', difficulty: 'Easy' },
      { id: 'fe_e2', question: 'Explain the CSS box model. What are margin, padding, border, and content?', topic: 'CSS', difficulty: 'Easy' },
      { id: 'fe_e3', question: 'What is the difference between let, const, and var in JavaScript?', topic: 'JavaScript', difficulty: 'Easy' },
      { id: 'fe_e4', question: 'What is the DOM and how does JavaScript interact with it?', topic: 'DOM', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'fe_m1', question: 'Explain the JavaScript event loop, call stack, and microtask queue. How does asynchronous code work?', topic: 'JavaScript', difficulty: 'Medium' },
      { id: 'fe_m2', question: 'What is the difference between useMemo, useCallback, and React.memo? When would you use each?', topic: 'React', difficulty: 'Medium' },
      { id: 'fe_m3', question: 'How do CSS Flexbox and Grid work? When would you choose one over the other?', topic: 'CSS', difficulty: 'Medium' },
      { id: 'fe_m4', question: 'What are closures in JavaScript? Give a practical example of where they are useful.', topic: 'JavaScript', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'fe_h1', question: 'How does React reconciliation work? What is the Virtual DOM and why does it improve performance?', topic: 'React', difficulty: 'Hard' },
      { id: 'fe_h2', question: 'Explain Core Web Vitals and how you would optimise a web application for LCP, FID, and CLS.', topic: 'Web Performance', difficulty: 'Hard' },
      { id: 'fe_h3', question: 'How would you architect the state management of a large React application? Compare Context API, Redux, and Zustand.', topic: 'State Management', difficulty: 'Hard' },
    ],
  },

  'Backend Developer': {
    Easy: [
      { id: 'be_e1', question: 'What is a REST API? What are the main HTTP methods and when do you use each?', topic: 'REST API', difficulty: 'Easy' },
      { id: 'be_e2', question: 'What is the difference between SQL and NoSQL databases? When would you choose each?', topic: 'Databases', difficulty: 'Easy' },
      { id: 'be_e3', question: 'What is authentication vs authorisation? How are they different?', topic: 'Security', difficulty: 'Easy' },
      { id: 'be_e4', question: 'What is an HTTP status code? Give examples of 2xx, 4xx, and 5xx codes.', topic: 'REST API', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'be_m1', question: 'What is database indexing? How does it improve query performance and what are the trade-offs?', topic: 'Databases', difficulty: 'Medium' },
      { id: 'be_m2', question: 'How does JWT authentication work? What are its advantages and potential security risks?', topic: 'Security', difficulty: 'Medium' },
      { id: 'be_m3', question: 'What is caching and when should you use it? Explain cache invalidation strategies.', topic: 'Caching', difficulty: 'Medium' },
      { id: 'be_m4', question: 'What is the difference between horizontal and vertical scaling? When would you use each?', topic: 'Scalability', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'be_h1', question: 'Design the backend for a real-time notification system at scale. What technologies, patterns, and trade-offs would you consider?', topic: 'System Design', difficulty: 'Hard' },
      { id: 'be_h2', question: 'What are database transactions and ACID properties? How do you handle distributed transactions?', topic: 'Databases', difficulty: 'Hard' },
      { id: 'be_h3', question: 'How would you secure a REST API against common attacks like SQL injection, XSS, CSRF, and rate limiting abuse?', topic: 'Security', difficulty: 'Hard' },
    ],
  },

  'Full Stack Developer': {
    Easy: [
      { id: 'fs_e1', question: 'Explain the client-server model. What happens when you type a URL in your browser?', topic: 'Web Fundamentals', difficulty: 'Easy' },
      { id: 'fs_e2', question: 'What is the difference between frontend and backend development? How do they communicate?', topic: 'Architecture', difficulty: 'Easy' },
      { id: 'fs_e3', question: 'What is CORS? Why does it occur and how do you fix it?', topic: 'Web Fundamentals', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'fs_m1', question: 'How would you implement user authentication in a full stack app? Describe the complete flow from registration to protected routes.', topic: 'Authentication', difficulty: 'Medium' },
      { id: 'fs_m2', question: 'What is the difference between server-side rendering (SSR), client-side rendering (CSR), and static site generation (SSG)?', topic: 'Architecture', difficulty: 'Medium' },
      { id: 'fs_m3', question: 'How do you manage application state in a React application that communicates with a Node.js backend?', topic: 'State Management', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'fs_h1', question: 'Design a full-stack e-commerce application. Describe your component structure, API design, database schema, and deployment approach.', topic: 'System Design', difficulty: 'Hard' },
      { id: 'fs_h2', question: 'How would you optimise the performance of a full-stack application experiencing high latency? Walk through your diagnostic and optimisation process.', topic: 'Performance', difficulty: 'Hard' },
    ],
  },

  'Data Scientist': {
    Easy: [
      { id: 'ds_e1', question: 'What is the difference between supervised and unsupervised learning? Give an example of each.', topic: 'Machine Learning', difficulty: 'Easy' },
      { id: 'ds_e2', question: 'What is overfitting and underfitting? How do you detect and prevent them?', topic: 'Machine Learning', difficulty: 'Easy' },
      { id: 'ds_e3', question: 'What is the purpose of train/test split and cross-validation?', topic: 'Model Evaluation', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'ds_m1', question: 'Explain the bias-variance trade-off. How does it affect model selection?', topic: 'Machine Learning', difficulty: 'Medium' },
      { id: 'ds_m2', question: 'What is feature engineering? Give examples of common techniques.', topic: 'Feature Engineering', difficulty: 'Medium' },
      { id: 'ds_m3', question: 'How do you handle missing data in a dataset? What are the pros and cons of different strategies?', topic: 'Data Analysis', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'ds_h1', question: 'Explain gradient descent and its variants (SGD, Adam). How do learning rate and batch size affect training?', topic: 'Deep Learning', difficulty: 'Hard' },
      { id: 'ds_h2', question: 'How would you build an end-to-end ML pipeline? Describe feature engineering, model selection, training, evaluation, and deployment.', topic: 'ML Pipeline', difficulty: 'Hard' },
    ],
  },

  'DevOps Engineer': {
    Easy: [
      { id: 'dv_e1', question: 'What is CI/CD? What is the difference between continuous integration and continuous delivery?', topic: 'CI/CD', difficulty: 'Easy' },
      { id: 'dv_e2', question: 'What is Docker? What is the difference between a container and a virtual machine?', topic: 'Docker', difficulty: 'Easy' },
      { id: 'dv_e3', question: 'What is the purpose of version control in a DevOps pipeline?', topic: 'DevOps Basics', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'dv_m1', question: 'How does Kubernetes orchestrate containers? Explain pods, services, and deployments.', topic: 'Kubernetes', difficulty: 'Medium' },
      { id: 'dv_m2', question: 'What is Infrastructure as Code? Explain how Terraform works and its advantages.', topic: 'Infrastructure', difficulty: 'Medium' },
      { id: 'dv_m3', question: 'What is a blue-green deployment? How does it differ from a canary deployment?', topic: 'Deployment Strategies', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'dv_h1', question: 'How would you design a highly available, fault-tolerant CI/CD pipeline for a microservices application?', topic: 'CI/CD', difficulty: 'Hard' },
      { id: 'dv_h2', question: 'Explain the key security considerations in a DevOps pipeline. How do you implement DevSecOps practices?', topic: 'Security', difficulty: 'Hard' },
    ],
  },

  'Machine Learning Engineer': {
    Easy: [
      { id: 'mle_e1', question: 'What is the difference between supervised, unsupervised, and reinforcement learning?', topic: 'ML Fundamentals', difficulty: 'Easy' },
      { id: 'mle_e2', question: 'What is a neural network? Explain layers, neurons, and activation functions.', topic: 'Deep Learning', difficulty: 'Easy' },
      { id: 'mle_e3', question: 'What is overfitting? How do you detect and prevent it?', topic: 'Model Training', difficulty: 'Easy' },
      { id: 'mle_e4', question: 'What is the purpose of train/validation/test split in machine learning?', topic: 'Model Evaluation', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'mle_m1', question: 'Explain backpropagation and gradient descent. How do learning rate and batch size affect training?', topic: 'Deep Learning', difficulty: 'Medium' },
      { id: 'mle_m2', question: 'What is the difference between a CNN and an RNN? When would you use each?', topic: 'Neural Networks', difficulty: 'Medium' },
      { id: 'mle_m3', question: 'How would you handle class imbalance in a dataset? What techniques would you use?', topic: 'Data Engineering', difficulty: 'Medium' },
      { id: 'mle_m4', question: 'What is transfer learning? Give an example of when it is beneficial.', topic: 'Deep Learning', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'mle_h1', question: 'Design an end-to-end ML pipeline for a production recommendation system. Cover data ingestion, training, evaluation, deployment, and monitoring.', topic: 'MLOps', difficulty: 'Hard' },
      { id: 'mle_h2', question: 'What is model drift? How do you detect and handle it in a production ML system?', topic: 'MLOps', difficulty: 'Hard' },
      { id: 'mle_h3', question: 'Compare BERT, GPT, and traditional RNN architectures for NLP tasks. What are the trade-offs in terms of performance, compute, and use-case suitability?', topic: 'NLP', difficulty: 'Hard' },
    ],
  },

  'Cloud Engineer': {
    Easy: [
      { id: 'ce_e1', question: 'What is cloud computing? Explain IaaS, PaaS, and SaaS with examples.', topic: 'Cloud Basics', difficulty: 'Easy' },
      { id: 'ce_e2', question: 'What is the difference between AWS EC2 and AWS Lambda? When would you use each?', topic: 'AWS', difficulty: 'Easy' },
      { id: 'ce_e3', question: 'What is an IAM role in AWS? How does it differ from an IAM user?', topic: 'Security', difficulty: 'Easy' },
      { id: 'ce_e4', question: 'What is an S3 bucket? What are its common use cases?', topic: 'Storage', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'ce_m1', question: 'What is a VPC in AWS? Explain subnets, route tables, internet gateways, and security groups.', topic: 'Networking', difficulty: 'Medium' },
      { id: 'ce_m2', question: 'What is auto-scaling? How does it work with a load balancer to handle variable traffic?', topic: 'Scalability', difficulty: 'Medium' },
      { id: 'ce_m3', question: 'Explain the difference between RDS, DynamoDB, and Aurora. When would you choose each?', topic: 'Databases', difficulty: 'Medium' },
      { id: 'ce_m4', question: 'What is serverless architecture? What are the benefits and limitations of AWS Lambda?', topic: 'Serverless', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'ce_h1', question: 'Design a highly available, multi-region cloud architecture for a global web application. Cover DNS failover, data replication, and cost optimisation.', topic: 'Architecture', difficulty: 'Hard' },
      { id: 'ce_h2', question: 'How would you implement a zero-trust security model in a cloud environment? What AWS services and patterns would you use?', topic: 'Security', difficulty: 'Hard' },
      { id: 'ce_h3', question: 'A production cloud environment is experiencing high costs. Walk through your approach to diagnosing and optimising cloud spend without impacting performance.', topic: 'Cost Optimisation', difficulty: 'Hard' },
    ],
  },

  'Data Analyst': {
    Easy: [
      { id: 'da_e1', question: 'What is the difference between SQL\'s WHERE and HAVING clauses?', topic: 'SQL', difficulty: 'Easy' },
      { id: 'da_e2', question: 'What is a JOIN in SQL? Explain INNER JOIN, LEFT JOIN, and RIGHT JOIN.', topic: 'SQL', difficulty: 'Easy' },
      { id: 'da_e3', question: 'What is the difference between mean, median, and mode? When would you use each?', topic: 'Statistics', difficulty: 'Easy' },
      { id: 'da_e4', question: 'What is a pivot table? When is it useful in data analysis?', topic: 'Data Analysis', difficulty: 'Easy' },
    ],
    Medium: [
      { id: 'da_m1', question: 'How would you identify and handle outliers in a dataset? What are the risks of removing them?', topic: 'Data Cleaning', difficulty: 'Medium' },
      { id: 'da_m2', question: 'Write a SQL query to find the top 3 products by revenue in each region.', topic: 'SQL', difficulty: 'Medium' },
      { id: 'da_m3', question: 'What is the difference between correlation and causation? Give an example where correlation is misleading.', topic: 'Statistics', difficulty: 'Medium' },
      { id: 'da_m4', question: 'How do you choose the right chart type for a given dataset? Compare bar, line, scatter, and pie charts.', topic: 'Data Visualisation', difficulty: 'Medium' },
    ],
    Hard: [
      { id: 'da_h1', question: 'You are given a dataset with 1 million rows and multiple missing value patterns. Describe your complete data cleaning and imputation strategy before analysis.', topic: 'Data Engineering', difficulty: 'Hard' },
      { id: 'da_h2', question: 'A business stakeholder says "our conversion rate dropped by 10% last week". Walk through your complete diagnostic approach — what data would you gather and what hypotheses would you test?', topic: 'Business Analysis', difficulty: 'Hard' },
      { id: 'da_h3', question: 'How would you design a dashboard that tracks KPIs for a SaaS product? What metrics matter, how would you handle real-time vs batch data, and what visualisation tool would you choose?', topic: 'BI & Reporting', difficulty: 'Hard' },
    ],
  },
};

/**
 * Get technical questions for a role + difficulty.
 * Questions are derived automatically from the role — no technology selection needed.
 */
export function getTechnicalQuestionsByRole(role = 'Software Engineer', difficulty = 'Medium', count = 5) {
  const roleBank = TECHNICAL_QUESTION_BANK[role] || TECHNICAL_QUESTION_BANK['Software Engineer'];
  const diffQuestions = roleBank[difficulty] || roleBank.Medium || [];

  const shuffled = [...diffQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get skill topics for a role (used in AI prompts and UI display).
 */
export function getSkillsForRole(role) {
  const mapping = ROLE_SKILLS_MAP[role];
  if (!mapping) return ['Software Engineering', 'Problem Solving'];
  return [...mapping.primaryTopics, ...mapping.secondaryTopics.slice(0, 3)];
}

export const ALL_TECHNICAL_ROLES = Object.keys(TECHNICAL_QUESTION_BANK);
