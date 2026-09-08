// ─────────────────────────────────────────────────────────────────────────────
// ACCURATE & DETERMINISTIC ROLE-SPECIFIC ATS SCORING ENGINE
//
// 100-Point Transparent Mathematical Model:
// 1. Role-Specific Keyword / Skill Match      35 points
// 2. Relevant Projects / Experience           20 points
// 3. Resume Section Completeness             15 points
// 4. ATS-Readable Structure & Formatting      15 points
// 5. Relevant Technical Terminology          10 points
// 6. Contact Information                      5 points
// TOTAL                                      100 points
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// RESUME INFORMATION EXTRACTOR
// Extracts structured personal/professional data from raw resume text
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract name from resume text (first line or name pattern)
 */
function extractName(rawText) {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && l.length < 80);
  for (const line of lines.slice(0, 6)) {
    // Skip lines that look like contact info or section headers
    if (
      /[@\d|http|linkedin|github|objective|summary|education|experience|skill]/i.test(
        line,
      )
    )
      continue;
    if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line))
      return line.replace(/[^a-zA-Z .-]/g, "").trim();
  }
  return null;
}

/**
 * Extract email address
 */
function extractEmail(rawText) {
  const match = rawText.match(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
  );
  return match ? match[0] : null;
}

/**
 * Extract phone number
 */
function extractPhone(rawText) {
  const match = rawText.match(/(\+?\d[\d\s\-().]{7,16}\d)/);
  return match ? match[0].trim() : null;
}

/**
 * Extract LinkedIn URL
 */
function extractLinkedIn(rawText) {
  const match = rawText.match(
    /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([\w\-%.]+)/i,
  );
  return match ? `https://linkedin.com/in/${match[1]}` : null;
}

/**
 * Extract GitHub URL
 */
function extractGitHub(rawText) {
  const match = rawText.match(/(?:github\.com\/)([\w\-%.]+)/i);
  return match ? `https://github.com/${match[1]}` : null;
}

/**
 * Extract location (city, state pattern)
 */
function extractLocation(rawText) {
  const match = rawText.match(
    /\b([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*),\s*([A-Z]{2}|\b[A-Z][a-z]+\b)/,
  );
  if (match) return match[0];
  // Try "City, Country" pattern
  const match2 = rawText.match(
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z][a-z]+)\b/,
  );
  return match2 ? match2[0] : null;
}

/**
 * Extract education information (degree, institution, year)
 */
function extractEducation(rawText) {
  const results = [];
  const lines = rawText.split("\n").map((l) => l.trim());

  let inEducationSection = false;
  const educationKeywords = ["education", "academic", "qualification"];
  const degreeKeywords = [
    "b.tech",
    "b.e.",
    "bachelor",
    "master",
    "m.tech",
    "mba",
    "b.sc",
    "m.sc",
    "phd",
    "b.com",
    "engineering",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationKeywords.some((k) => line.includes(k))) {
      inEducationSection = true;
      continue;
    }
    // Stop at next major section
    if (
      inEducationSection &&
      /^(experience|work|project|skill|certif|publication|award|language)/i.test(
        lines[i],
      )
    ) {
      inEducationSection = false;
    }
    if (inEducationSection && lines[i].length > 5) {
      results.push(lines[i]);
      if (results.length >= 6) break;
    }
    // Also pick up degree lines outside section headers
    if (!inEducationSection && degreeKeywords.some((k) => line.includes(k))) {
      results.push(lines[i]);
    }
  }
  return results.length ? results.slice(0, 4) : null;
}

/**
 * Extract work experience entries
 */
function extractExperience(rawText) {
  const results = [];
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3);
  let inExperienceSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (
      /\b(experience|employment|work history|internship|position)\b/.test(
        line,
      ) &&
      lines[i].length < 30
    ) {
      inExperienceSection = true;
      continue;
    }
    if (
      inExperienceSection &&
      /^(education|project|skill|certif|award|language|publication)/i.test(
        lines[i],
      )
    ) {
      inExperienceSection = false;
    }
    if (inExperienceSection && lines[i].length > 8 && results.length < 6) {
      results.push(lines[i]);
    }
  }
  return results.length ? results : null;
}

/**
 * Extract certifications
 */
function extractCertifications(rawText) {
  const results = [];
  const lines = rawText.split("\n").map((l) => l.trim());
  let inCertSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      /certif|credential|license|achievement|award|hackathon/i.test(lower) &&
      line.length < 30
    ) {
      inCertSection = true;
      continue;
    }
    if (
      inCertSection &&
      /^(education|project|skill|experience|language|publication)/i.test(line)
    ) {
      inCertSection = false;
    }
    if (inCertSection && line.length > 5 && results.length < 5) {
      results.push(line);
    }
    // Inline certifications
    if (
      !inCertSection &&
      /coursera|udemy|aws certified|google certified|microsoft certified|oracle certified|cisco|comptia/i.test(
        lower,
      )
    ) {
      results.push(line);
    }
  }
  return results.length ? [...new Set(results)].slice(0, 5) : null;
}

/**
 * Extract projects section
 */
function extractProjects(rawText) {
  const results = [];
  const lines = rawText.split("\n").map((l) => l.trim());
  let inProjectSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/\bproject(s)?\b/.test(lower) && line.length < 25) {
      inProjectSection = true;
      continue;
    }
    if (
      inProjectSection &&
      /^(education|experience|skill|certif|award|language|publication|summary|objective)/i.test(
        line,
      )
    ) {
      inProjectSection = false;
    }
    if (inProjectSection && line.length > 5 && results.length < 8) {
      results.push(line);
    }
  }
  return results.length ? results : null;
}

/**
 * Extract skills from text
 */
function extractSkillsList(rawText) {
  const text = rawText.toLowerCase();
  const techSkills = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "php",
    "ruby",
    "go",
    "rust",
    "kotlin",
    "swift",
    "react",
    "angular",
    "vue",
    "next.js",
    "node.js",
    "express",
    "django",
    "flask",
    "spring boot",
    "laravel",
    "html",
    "css",
    "sass",
    "tailwind",
    "bootstrap",
    "jquery",
    "mongodb",
    "mysql",
    "postgresql",
    "sqlite",
    "redis",
    "oracle",
    "dynamodb",
    "firebase",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "terraform",
    "jenkins",
    "github actions",
    "git",
    "linux",
    "bash",
    "rest api",
    "graphql",
    "microservices",
    "agile",
    "scrum",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "pandas",
    "numpy",
    "data analysis",
    "data visualization",
    "tableau",
    "power bi",
    "android",
    "ios",
    "react native",
    "flutter",
    "selenium",
    "jest",
    "junit",
    "pytest",
  ];
  return techSkills.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`).test(text) || text.includes(skill);
  });
}

/**
 * Extract languages spoken
 */
function extractLanguages(rawText) {
  const humanLanguages = [
    "english",
    "hindi",
    "spanish",
    "french",
    "german",
    "chinese",
    "japanese",
    "arabic",
    "portuguese",
    "russian",
    "korean",
    "italian",
    "dutch",
    "tamil",
    "telugu",
    "kannada",
    "marathi",
    "bengali",
    "gujarati",
  ];
  const text = rawText.toLowerCase();
  const found = humanLanguages.filter((lang) => {
    const regex = new RegExp(`\\b${lang}\\b`);
    return regex.test(text);
  });
  return found.length
    ? found.map((l) => l.charAt(0).toUpperCase() + l.slice(1))
    : null;
}

/**
 * Full structured extraction from resume text
 */
export function extractResumeInfo(rawText) {
  const skills = extractSkillsList(rawText);
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;

  // Count pages approximation
  const estimatedPages = wordCount < 350 ? 1 : wordCount < 700 ? 2 : 3;

  return {
    name: extractName(rawText),
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    location: extractLocation(rawText),
    linkedIn: extractLinkedIn(rawText),
    gitHub: extractGitHub(rawText),
    education: extractEducation(rawText),
    experience: extractExperience(rawText),
    certifications: extractCertifications(rawText),
    projects: extractProjects(rawText),
    skills,
    languages: extractLanguages(rawText),
    wordCount,
    estimatedPages,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD ANALYSIS ENGINE
// Evaluates keywords: found, missing, and needs improvement
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_KEYWORD_CATEGORIES = {
  "Software Engineer": {
    core: ["Java", "Python", "C++", "Data Structures", "Algorithms", "OOP"],
    important: [
      "SQL",
      "Git",
      "REST API",
      "Problem Solving",
      "Software Development",
      "System Design",
    ],
    beneficial: [
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Unit Testing",
      "Agile",
      "AWS",
    ],
  },
  "Frontend Developer": {
    core: ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
    important: ["TypeScript", "REST API", "Git", "UI/UX", "Web Development"],
    beneficial: [
      "Vue",
      "Angular",
      "Webpack",
      "Performance Optimization",
      "Testing",
    ],
  },
  "Backend Developer": {
    core: ["Java", "Python", "Node.js", "REST API", "SQL"],
    important: [
      "Spring Boot",
      "NoSQL",
      "Database Design",
      "Authentication",
      "Git",
    ],
    beneficial: ["Docker", "Microservices", "Redis", "Cloud", "Security"],
  },
  "Data Scientist": {
    core: ["Python", "SQL", "Machine Learning", "Statistics", "Data Analysis"],
    important: [
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "Data Visualization",
      "Feature Engineering",
    ],
    beneficial: ["TensorFlow", "PyTorch", "NLP", "Deep Learning", "Tableau"],
  },
  "DevOps Engineer": {
    core: ["Linux", "Docker", "Kubernetes", "CI/CD", "Git"],
    important: ["AWS", "Jenkins", "Terraform", "Monitoring", "Infrastructure"],
    beneficial: [
      "Azure",
      "Ansible",
      "Security",
      "Bash Scripting",
      "Networking",
    ],
  },
  "Full Stack Developer": {
    core: ["JavaScript", "React", "Node.js", "HTML", "CSS"],
    important: ["TypeScript", "MongoDB", "REST API", "Git", "SQL"],
    beneficial: ["Docker", "AWS", "GraphQL", "Testing", "System Design"],
  },
  "Java Developer": {
    core: ["Java", "Spring Boot", "OOP", "Data Structures", "Algorithms"],
    important: ["SQL", "REST API", "Git", "Maven", "JUnit"],
    beneficial: ["Microservices", "Docker", "AWS", "Hibernate", "Kafka"],
  },
  "Python Developer": {
    core: ["Python", "Django", "Flask", "REST API", "SQL"],
    important: ["Git", "Data Structures", "OOP", "Testing", "Linux"],
    beneficial: ["Docker", "AWS", "Celery", "Redis", "GraphQL"],
  },
  "Machine Learning Engineer": {
    core: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
    ],
    important: [
      "SQL",
      "Statistics",
      "Feature Engineering",
      "Model Deployment",
      "Git",
    ],
    beneficial: ["MLOps", "Docker", "AWS", "NLP", "Computer Vision"],
  },
  "Cloud Engineer": {
    core: ["AWS", "Azure", "GCP", "Linux", "Docker"],
    important: ["Kubernetes", "Terraform", "CI/CD", "Security", "Networking"],
    beneficial: [
      "Ansible",
      "Monitoring",
      "Cost Optimization",
      "Serverless",
      "IAM",
    ],
  },
};

/**
 * Analyze keyword presence with frequency and recommendations
 */
export function analyzeKeywords(rawText, targetRole = "Software Engineer") {
  const text = rawText.toLowerCase();
  const roleCategories =
    ROLE_KEYWORD_CATEGORIES[targetRole] ||
    ROLE_KEYWORD_CATEGORIES["Software Engineer"];
  const allKeywords = [
    ...roleCategories.core,
    ...roleCategories.important,
    ...roleCategories.beneficial,
  ];

  const keywordsFound = [];
  const missingKeywords = [];
  const keywordsToImprove = [];

  for (const keyword of allKeywords) {
    const escaped = keyword
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .toLowerCase();
    const regex = new RegExp(
      escaped.includes(" ") ? escaped : `\\b${escaped}\\b`,
      "gi",
    );
    const matches = text.match(regex);
    const frequency = matches ? matches.length : 0;

    const isCore = roleCategories.core.includes(keyword);
    const isImportant = roleCategories.important.includes(keyword);

    if (frequency > 0) {
      // Check if it appears weakly (mentioned only once in a skills list)
      const isWeak =
        frequency === 1 &&
        !/(project|experience|intern|built|developed|implemented|deployed|used)/i.test(
          rawText.substring(
            Math.max(
              0,
              rawText.toLowerCase().indexOf(keyword.toLowerCase()) - 150,
            ),
            Math.min(
              rawText.length,
              rawText.toLowerCase().indexOf(keyword.toLowerCase()) + 200,
            ),
          ),
        );

      if (isWeak && (isCore || isImportant)) {
        keywordsToImprove.push({
          keyword,
          frequency,
          found: true,
          recommendation: buildKeywordRecommendation(keyword, targetRole),
          importance: isCore ? "high" : "medium",
        });
      } else {
        keywordsFound.push({
          keyword,
          frequency,
          importance: isCore ? "high" : isImportant ? "medium" : "low",
        });
      }
    } else {
      if (isCore || isImportant) {
        missingKeywords.push({
          keyword,
          importance: isCore ? "high" : "medium",
          suggestion: `Add ${keyword} to your skills section and reference it in project descriptions if you have genuine experience.`,
        });
      }
    }
  }

  return { keywordsFound, missingKeywords, keywordsToImprove };
}

function buildKeywordRecommendation(keyword, role) {
  const templates = {
    Java: `Mention Java in a project description. Example: "Developed REST APIs using Java 17 and Spring Boot, handling 10K+ daily requests."`,
    Python: `Add Python to a project or experience entry. Example: "Built a data pipeline using Python (Pandas, NumPy) to automate reporting."`,
    "Machine Learning": `Reference ML work specifically. Example: "Trained a classification model using Scikit-learn achieving 92% accuracy."`,
    Docker: `Describe containerization context. Example: "Containerized the application using Docker and Docker Compose for consistent deployments."`,
    "REST API": `Describe API work. Example: "Designed and implemented RESTful APIs following OpenAPI specification."`,
    SQL: `Add database work. Example: "Designed normalized schemas in MySQL, wrote complex JOINs and optimized slow queries."`,
    Git: `Mention version control. Example: "Managed feature branches and pull requests using Git and GitHub."`,
    React: `Describe frontend work. Example: "Built responsive SPA using React 18 with hooks, Context API, and React Router."`,
    "Spring Boot": `Describe Java backend work. Example: "Built microservices using Spring Boot 3, JPA/Hibernate, and RESTful endpoints."`,
  };
  return (
    templates[keyword] ||
    `Expand on your ${keyword} experience with a concrete project example and measurable outcome in your resume.`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB DESCRIPTION MATCHING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const JOB_MATCH_SKILLS = [
  ["JavaScript", "technical_skill"],
  ["TypeScript", "technical_skill"],
  ["Python", "technical_skill"],
  ["Java", "technical_skill"],
  ["C++", "technical_skill"],
  ["C#", "technical_skill"],
  ["React", "framework"],
  ["Angular", "framework"],
  ["Vue", "framework"],
  ["Next.js", "framework"],
  ["Node.js", "framework"],
  ["Express", "framework"],
  ["Django", "framework"],
  ["Flask", "framework"],
  ["FastAPI", "framework"],
  ["Spring Boot", "framework"],
  ["HTML", "technical_skill"],
  ["CSS", "technical_skill"],
  ["Tailwind", "tool"],
  ["MongoDB", "database"],
  ["MySQL", "database"],
  ["PostgreSQL", "database"],
  ["SQLite", "database"],
  ["Redis", "database"],
  ["Docker", "tool"],
  ["Kubernetes", "tool"],
  ["AWS", "cloud"],
  ["Azure", "cloud"],
  ["GCP", "cloud"],
  ["Terraform", "tool"],
  ["Jenkins", "tool"],
  ["Git", "tool"],
  ["Linux", "tool"],
  ["REST API", "concept"],
  ["GraphQL", "concept"],
  ["Microservices", "concept"],
  ["Machine Learning", "domain"],
  ["Deep Learning", "domain"],
  ["TensorFlow", "library"],
  ["PyTorch", "library"],
  ["Scikit-learn", "library"],
  ["Pandas", "library"],
  ["NumPy", "library"],
  ["Data Analysis", "domain"],
  ["Data Visualization", "domain"],
  ["Tableau", "tool"],
  ["Power BI", "tool"],
  ["Spark", "tool"],
  ["Kafka", "tool"],
  ["Selenium", "tool"],
  ["Jest", "library"],
  ["JUnit", "library"],
  ["Pytest", "library"],
  ["CI/CD", "concept"],
  ["DevOps", "domain"],
  ["MLOps", "domain"],
  ["Data Structures", "concept"],
  ["Algorithms", "concept"],
  ["OOP", "concept"],
  ["System Design", "concept"],
  ["SQL", "technical_skill"],
  ["NoSQL", "technical_skill"],
];

const JOB_MATCH_ALIASES = {
  "Node.js": ["node", "node js"],
  "Next.js": ["next js"],
  "REST API": ["restful api", "rest apis"],
  "Machine Learning": ["machine learning", "ml", "predictive modeling"],
  "Deep Learning": ["deep learning", "neural networks"],
  "Scikit-learn": ["scikit learn", "sklearn"],
  "CI/CD": ["continuous integration", "continuous delivery", "ci cd"],
  "Data Structures": ["data structure"],
  "System Design": ["system designing"],
  SQL: ["structured query language"],
};

const RELATED_SKILLS = {
  PyTorch: ["TensorFlow"],
  TensorFlow: ["PyTorch"],
  React: ["Angular", "Vue"],
  Angular: ["React", "Vue"],
  Vue: ["React", "Angular"],
  AWS: ["Azure", "GCP"],
  Azure: ["AWS", "GCP"],
  GCP: ["AWS", "Azure"],
  MongoDB: ["NoSQL"],
  PostgreSQL: ["MySQL", "SQL"],
  "Machine Learning": ["Deep Learning"],
  "Deep Learning": ["Machine Learning"],
};

const SOFT_SKILLS = [
  "communication",
  "leadership",
  "teamwork",
  "problem solving",
  "collaboration",
  "adaptability",
  "time management",
];
const STOP_WORDS =
  /^(and|the|with|this|that|from|have|will|your|their|they|about|which|when|where|what|should|would|could|also|more|than|into|some|been|were|those|then|only|such|using|work|working|develop|development|software|technology|teamwork|communication)$/i;

function escapeJobMatchTerm(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function hasTerm(text, term) {
  const pattern = escapeJobMatchTerm(term).replace(/\\ /g, "\\s+");
  return new RegExp(`(?:^|\\W)${pattern}(?:$|\\W)`, "i").test(text);
}
function unique(values) {
  return [...new Set(values)];
}
function sentences(text) {
  return text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}
function requirementImportance(sentence) {
  return /\b(required|must[- ]have|mandatory|essential|minimum|need to|required skills?)\b/i.test(
    sentence,
  )
    ? "required"
    : /\b(preferred|nice to have|bonus|plus|desirable|advantage)\b/i.test(
          sentence,
        )
      ? "preferred"
      : "required";
}
function sourceForEvidence(evidence) {
  if (
    /\b(experience|employment|professional|work history|developer|engineer)\b/i.test(
      evidence,
    )
  )
    return "PROFESSIONAL_EXPERIENCE";
  if (/\bintern(ship)?\b/i.test(evidence)) return "INTERNSHIP";
  if (/\b(project|built|developed|implemented|created)\b/i.test(evidence))
    return "PROJECT";
  if (/\b(certif|credential|license)\b/i.test(evidence)) return "CERTIFICATION";
  if (
    /\b(education|degree|coursework|university|college|bachelor|master)\b/i.test(
      evidence,
    )
  )
    return "EDUCATION";
  return "SKILLS_SECTION";
}
function findEvidence(resumeText, term) {
  const lines = sentences(resumeText);
  const aliases = [term, ...(JOB_MATCH_ALIASES[term] || [])];
  const index = lines.findIndex((line) =>
    aliases.some((alias) => hasTerm(line, alias)),
  );
  if (index < 0) return null;
  const evidence = lines[index].slice(0, 300);
  return { evidence, source: sourceForEvidence(evidence) };
}

/** Extract structured, de-duplicated JD requirements without treating generic prose as skills. */
export function extractJobDescriptionRequirements(jobDescText) {
  const text = jobDescText || "";
  const lower = text.toLowerCase();
  const requirements = [];
  for (const [name, category] of JOB_MATCH_SKILLS) {
    const aliases = [name, ...(JOB_MATCH_ALIASES[name] || [])];
    const position = aliases
      .map((alias) => lower.indexOf(alias.toLowerCase()))
      .find((index) => index >= 0);
    if (position >= 0) {
      const sentence =
        sentences(text).find((line) =>
          aliases.some((alias) => hasTerm(line, alias)),
        ) || text.slice(Math.max(0, position - 80), position + 160);
      requirements.push({
        name,
        category,
        importance: requirementImportance(sentence),
        evidence: sentence.slice(0, 300),
      });
    }
  }
  for (const skill of SOFT_SKILLS) {
    const position = lower.indexOf(skill);
    if (position >= 0) {
      const sentence =
        sentences(text).find((line) => hasTerm(line, skill)) ||
        text.slice(Math.max(0, position - 80), position + 160);
      requirements.push({
        name: skill.replace(/\b\w/g, (c) => c.toUpperCase()),
        category: "soft_skill",
        importance: requirementImportance(sentence),
        evidence: sentence.slice(0, 300),
      });
    }
  }
  const requiredExperienceMatch = lower.match(
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:relevant\s+|professional\s+)?(?:[a-z][a-z -]{0,45}\s+)?experience/,
  );
  const educationRequirements = [];
  if (/\b(master|m\.tech|m\.sc|mba|postgraduate|post graduate)\b/i.test(text))
    educationRequirements.push("Master's degree");
  else if (
    /\b(bachelor|b\.tech|b\.e\.?|b\.sc|undergraduate|degree)\b/i.test(text)
  )
    educationRequirements.push("Bachelor's degree");
  const certificationRequirements = [];
  if (/aws certified|aws certification/i.test(text))
    certificationRequirements.push("AWS Certification");
  if (/google cloud certified|gcp certified/i.test(text))
    certificationRequirements.push("GCP Certification");
  if (/azure certified/i.test(text))
    certificationRequirements.push("Azure Certification");
  if (/pmp\b/i.test(text)) certificationRequirements.push("PMP");
  const responsibilityLines = sentences(text)
    .filter(
      (line) =>
        /\b(develop|design|build|implement|deploy|maintain|lead|analy[sz]e|optimi[sz]e|collaborate|manage|test|automate|integrate)\w*\b/i.test(
          line,
        ) && line.length > 20,
    )
    .slice(0, 12);
  return {
    requirements: unique(requirements.map((item) => JSON.stringify(item))).map(
      (item) => JSON.parse(item),
    ),
    responsibilities: unique(responsibilityLines),
    requiredExperience: requiredExperienceMatch
      ? Number(requiredExperienceMatch[1])
      : null,
    educationRequirements,
    certificationRequirements,
  };
}

/** Backward-compatible JD summary used by the existing resume and ATS screens. */
export function extractJobDescriptionKeywords(jobDescText) {
  const parsed = extractJobDescriptionRequirements(jobDescText);
  const requiredSkills = parsed.requirements
    .filter(
      (item) =>
        item.category !== "soft_skill" && item.importance === "required",
    )
    .map((item) => item.name);
  return {
    requiredSkills,
    preferredSkills: parsed.requirements
      .filter((item) => item.importance === "preferred")
      .map((item) => item.name),
    requiredExperience: parsed.requiredExperience,
    educationRequirements: parsed.educationRequirements,
    certificationRequirements: parsed.certificationRequirements,
  };
}

function matchRequirement(requirement, resumeText) {
  const exact =
    hasTerm(resumeText, requirement.name) ||
    (JOB_MATCH_ALIASES[requirement.name] || []).some((alias) =>
      hasTerm(resumeText, alias),
    );
  const evidence = findEvidence(resumeText, requirement.name);
  if (exact)
    return { ...requirement, match: "EXACT_MATCH", score: 1, ...evidence };
  const related = (RELATED_SKILLS[requirement.name] || []).find((skill) =>
    hasTerm(resumeText, skill),
  );
  if (related)
    return {
      ...requirement,
      match: "RELATED_MATCH",
      score: 0.3,
      evidence: `Related technology found: ${related}`,
      source: "RELATED_TECHNOLOGY",
    };
  const tokens = requirement.name
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 3 && !STOP_WORDS.test(token));
  const partial =
    tokens.length > 1 &&
    tokens.filter((token) => hasTerm(resumeText, token)).length >=
      Math.ceil(tokens.length / 2);
  if (partial)
    return {
      ...requirement,
      match: "PARTIAL_MATCH",
      score: 0.6,
      evidence: "Some requirement terms appear in the resume.",
      source: "PARTIAL_EVIDENCE",
    };
  return {
    ...requirement,
    match: "NO_MATCH",
    score: 0,
    evidence: null,
    source: null,
  };
}

function matchResponsibility(responsibility, resumeText) {
  const terms =
    responsibility
      .toLowerCase()
      .match(/[a-z][a-z-]{4,}/g)
      ?.filter((word) => !STOP_WORDS.test(word)) || [];
  const evidenceLine = sentences(resumeText).find(
    (line) =>
      terms.filter((term) => hasTerm(line, term)).length >=
      Math.min(2, terms.length),
  );
  const score = evidenceLine
    ? terms.filter((term) => hasTerm(evidenceLine, term)).length >= 3
      ? 0.85
      : 0.6
    : 0;
  return {
    responsibility,
    match:
      score >= 0.85 ? "STRONG_MATCH" : score ? "PARTIAL_MATCH" : "NO_MATCH",
    score,
    evidence: evidenceLine || null,
  };
}

function categoryScore(items) {
  return items.length
    ? Math.round(
        (items.reduce((sum, item) => sum + item.score, 0) / items.length) * 100,
      )
    : 100;
}

function educationScore(requirements, resumeText) {
  if (!requirements.length) return 100;
  const masterRequired = requirements.some((item) => /master/i.test(item));
  if (masterRequired)
    return /\b(master|m\.tech|m\.sc|mba|postgraduate)\b/i.test(resumeText)
      ? 100
      : 0;
  return /\b(bachelor|b\.tech|b\.e\.?|b\.sc|undergraduate|degree|master|m\.tech|m\.sc|mba)\b/i.test(
    resumeText,
  )
    ? 100
    : 0;
}

function relevantExperienceScore(requiredYears, resumeText, requiredSkills) {
  if (!requiredYears) return null;
  const relevantTerms = requiredSkills.flatMap((item) => [
    item.name,
    ...(JOB_MATCH_ALIASES[item.name] || []),
  ]);
  const yearsMatches = [...resumeText.matchAll(/(\d+)\+?\s*(?:years?|yrs?)/gi)];
  const relevantYears = yearsMatches.reduce((highest, match) => {
    const context = resumeText.slice(
      Math.max(0, match.index - 100),
      Math.min(resumeText.length, match.index + 150),
    );
    return relevantTerms.some((term) => hasTerm(context, term))
      ? Math.max(highest, Number(match[1]))
      : highest;
  }, 0);
  if (relevantYears >= requiredYears)
    return { score: 100, years: relevantYears };
  if (relevantYears > 0)
    return {
      score: Math.round((relevantYears / requiredYears) * 100),
      years: relevantYears,
    };
  return {
    score: requiredSkills.some(
      (item) => item.score > 0 && item.source !== "SKILLS_SECTION",
    )
      ? 50
      : 0,
    years: 0,
  };
}

/** Deterministic, evidence-based JD matcher. The final score is calculated here, never supplied by an LLM. */
export function matchResumeToJobDescription(
  rawResumeText,
  jobDescText,
  targetRole = "Software Engineer",
) {
  if (
    !rawResumeText?.trim() ||
    !jobDescText?.trim() ||
    jobDescText.trim().length < 30
  ) {
    return {
      matchScore: 0,
      error:
        "A readable resume and a job description of at least 30 characters are required.",
    };
  }
  const parsed = extractJobDescriptionRequirements(jobDescText);
  const resumeText = rawResumeText.trim();
  const matchedRequirements = parsed.requirements.map((requirement) =>
    matchRequirement(requirement, resumeText),
  );
  const requiredTechnical = matchedRequirements.filter(
    (item) => item.importance === "required" && item.category !== "soft_skill",
  );
  const preferredSkills = matchedRequirements.filter(
    (item) => item.importance === "preferred",
  );
  const responsibilities = parsed.responsibilities.map((item) =>
    matchResponsibility(item, resumeText),
  );
  const relevantExperience = requiredTechnical.filter(
    (item) => item.score > 0 && item.source !== "SKILLS_SECTION",
  );
  const requiredTechnicalSkills = categoryScore(requiredTechnical);
  const responsibilityScore = categoryScore(responsibilities);
  const experienceEvidenceScore = requiredTechnical.length
    ? Math.round((relevantExperience.length / requiredTechnical.length) * 100)
    : 100;
  const experienceRequirement = relevantExperienceScore(
    parsed.requiredExperience,
    resumeText,
    requiredTechnical,
  );
  const experienceScore = experienceRequirement
    ? Math.min(experienceEvidenceScore, experienceRequirement.score)
    : experienceEvidenceScore;
  const education = educationScore(parsed.educationRequirements, resumeText);
  const preferredScore = categoryScore(preferredSkills);
  const domainTools = categoryScore(
    matchedRequirements.filter((item) =>
      ["tool", "cloud", "database", "domain", "concept"].includes(
        item.category,
      ),
    ),
  );
  const categories = {
    requiredTechnicalSkills,
    responsibilities: responsibilityScore,
    experience: experienceScore,
    education,
    preferredSkills: preferredScore,
    domainTools,
  };
  const matchScore = Math.round(
    requiredTechnicalSkills * 0.35 +
      responsibilityScore * 0.25 +
      experienceScore * 0.15 +
      education * 0.1 +
      preferredScore * 0.1 +
      domainTools * 0.05,
  );
  const strong = matchedRequirements
    .filter((item) => item.score >= 0.85)
    .map((item) => item.name);
  const partial = matchedRequirements
    .filter(
      (item) =>
        item.match === "PARTIAL_MATCH" || item.match === "RELATED_MATCH",
    )
    .map((item) => item.name);
  const missingRequiredSkills = matchedRequirements
    .filter((item) => item.importance === "required" && item.score === 0)
    .map((item) => item.name);
  const missingPreferredSkills = matchedRequirements
    .filter((item) => item.importance === "preferred" && item.score === 0)
    .map((item) => item.name);
  const matchingKeywords = matchedRequirements
    .filter((item) => item.score > 0)
    .map((item) => item.name);
  const missingKeywords = matchedRequirements
    .filter((item) => item.score === 0)
    .map((item) => item.name);
  const recommendations = [
    ...missingRequiredSkills
      .slice(0, 4)
      .map(
        (skill) =>
          `Address the required ${skill} gap with genuine experience, coursework, or a relevant project.`,
      ),
    ...responsibilities
      .filter((item) => item.score === 0)
      .slice(0, 2)
      .map(
        (item) =>
          `Add resume evidence for this responsibility: ${item.responsibility}`,
      ),
  ];
  if (
    parsed.requiredExperience &&
    !/\b(?:19|20)\d{2}\b/.test(resumeText) &&
    experienceScore < 100
  )
    recommendations.push(
      `Show relevant experience duration for the ${parsed.requiredExperience}+ year requirement.`,
    );
  if (!recommendations.length)
    recommendations.push(
      "Your resume covers the detected requirements. Strengthen the evidence with measurable outcomes.",
    );
  const evidenceCount =
    matchedRequirements.filter((item) => item.evidence).length +
    responsibilities.filter((item) => item.evidence).length;
  const confidence = Math.round(
    Math.min(
      100,
      55 +
        (parsed.requirements.length
          ? (evidenceCount /
              (parsed.requirements.length + responsibilities.length)) *
            45
          : 0),
    ),
  );
  return {
    matchScore,
    targetRole,
    categories,
    confidence,
    requirements: matchedRequirements,
    responsibilities,
    matchingSkills: strong,
    partialMatches: partial,
    missingSkills: missingRequiredSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    matchingKeywords: matchingKeywords.slice(0, 30),
    missingKeywords: missingKeywords.slice(0, 30),
    requiredSkillsFromJD: requiredTechnical.map((item) => item.name),
    preferredSkills: preferredSkills.map((item) => item.name),
    requiredExperience: parsed.requiredExperience,
    relevantExperienceYears: experienceRequirement?.years ?? null,
    educationRequirements: parsed.educationRequirements,
    certificationRequirements: parsed.certificationRequirements,
    recommendations,
    summary:
      matchScore >= 80
        ? "Excellent match. The resume provides strong evidence for this job description."
        : matchScore >= 65
          ? "Good match with targeted gaps to address."
          : matchScore >= 45
            ? "Moderate match. Several requirements need stronger evidence."
            : "Low match. Critical job requirements are not demonstrated clearly in the resume.",
  };
}

/**
 * Generate resume improvement suggestions based on extracted info + keyword analysis
 */
export function generateImprovementSuggestions(
  rawText,
  keywordAnalysis,
  targetRole = "Software Engineer",
) {
  const suggestions = [];
  const text = rawText.toLowerCase();

  // Summary improvement
  const hasSummary = /summary|objective|profile|about me/i.test(rawText);
  if (!hasSummary) {
    suggestions.push({
      section: "Professional Summary",
      type: "missing",
      current: null,
      improved: `Results-driven ${targetRole} with strong foundations in ${keywordAnalysis.keywordsFound
        .slice(0, 3)
        .map((k) => k.keyword)
        .join(
          ", ",
        )}. Seeking to leverage technical skills and hands-on project experience to deliver impactful solutions.`,
      reason:
        "A professional summary immediately tells recruiters who you are and why you are a strong candidate.",
    });
  } else {
    // Find the summary lines
    const summaryMatch = rawText.match(
      /(?:summary|objective|profile)[:\s]*(.{20,300}?)(?:\n\n|\n[A-Z]|$)/is,
    );
    if (summaryMatch && summaryMatch[1].trim().length < 80) {
      suggestions.push({
        section: "Professional Summary",
        type: "weak",
        current: summaryMatch[1].trim(),
        improved: `${targetRole} with hands-on experience in ${keywordAnalysis.keywordsFound
          .slice(0, 4)
          .map((k) => k.keyword)
          .join(
            ", ",
          )}. Demonstrated ability to design, develop, and deploy production-quality applications. Looking to contribute technical expertise and problem-solving skills to drive impactful outcomes.`,
        reason:
          "Your current summary is too brief. Expand it to highlight your core skills and career direction.",
      });
    }
  }

  // Metrics suggestion
  const hasMetrics =
    /%|improved|reduced|increased|\d+x|\$\d+|\d+\s*percent|\d+\s*users/i.test(
      rawText,
    );
  if (!hasMetrics) {
    suggestions.push({
      section: "Project / Experience Descriptions",
      type: "improvement",
      current: "Developed an attendance management system.",
      improved:
        "Developed a web-based attendance management system using Java and MySQL that automated daily tracking for 200+ students, reducing manual record maintenance by 80%.",
      reason:
        "Quantifiable results make your experience more compelling to recruiters. Use the Action + Technology + Result formula.",
    });
  }

  // Missing skills section
  if (keywordAnalysis.missingKeywords.length > 0) {
    const topMissing = keywordAnalysis.missingKeywords
      .filter((k) => k.importance === "high")
      .slice(0, 3);
    if (topMissing.length > 0) {
      suggestions.push({
        section: "Skills Section",
        type: "missing",
        current: null,
        improved: `Add these high-priority skills if you have genuine experience: ${topMissing.map((k) => k.keyword).join(", ")}`,
        reason:
          "These skills are core requirements for a " +
          targetRole +
          " role and their absence reduces your ATS score significantly.",
      });
    }
  }

  // GitHub/LinkedIn suggestion
  const hasLinks = /github\.com|linkedin\.com/i.test(rawText);
  if (!hasLinks) {
    suggestions.push({
      section: "Contact Information",
      type: "missing",
      current: null,
      improved:
        "Add GitHub profile URL and LinkedIn profile URL to your contact section.",
      reason:
        "Professional links allow recruiters to verify your work and significantly increase credibility.",
    });
  }

  // Certifications
  const hasCerts =
    /certif|credential|coursera|udemy|aws|google|microsoft/i.test(rawText);
  if (!hasCerts) {
    suggestions.push({
      section: "Certifications",
      type: "missing",
      current: null,
      improved:
        "Add any online certifications from Coursera, edX, Udemy, AWS, or Google Cloud to demonstrate continuous learning.",
      reason:
        "Certifications validate your skills and show commitment to professional growth.",
    });
  }

  return suggestions;
}

// Semantic keyword definitions with alias matching
export const ROLE_SKILL_DEFINITIONS = {
  "Software Engineer": [
    { name: "Java", aliases: ["java"] },
    { name: "Python", aliases: ["python", "py"] },
    { name: "C++", aliases: ["c++", "cpp"] },
    { name: "Data Structures", aliases: ["data structures", "dsa"] },
    { name: "Algorithms", aliases: ["algorithms", "algorithmic"] },
    {
      name: "OOP",
      aliases: [
        "oop",
        "object oriented programming",
        "object-oriented programming",
      ],
    },
    {
      name: "SQL",
      aliases: ["sql", "mysql", "postgresql", "postgres", "sqlite", "ms sql"],
    },
    { name: "Git", aliases: ["git", "github", "gitlab", "version control"] },
    {
      name: "REST API",
      aliases: [
        "rest api",
        "restful api",
        "rest apis",
        "restful apis",
        "web api",
      ],
    },
    {
      name: "Problem Solving",
      aliases: ["problem solving", "analytical skills", "troubleshooting"],
    },
    {
      name: "Software Development",
      aliases: ["software development", "software engineering", "sdlc"],
    },
  ],
  "Frontend Developer": [
    { name: "HTML", aliases: ["html", "html5"] },
    {
      name: "CSS",
      aliases: ["css", "css3", "sass", "scss", "tailwind", "bootstrap"],
    },
    { name: "JavaScript", aliases: ["javascript", "js", "es6", "ecmascript"] },
    {
      name: "React",
      aliases: ["react", "react.js", "reactjs", "next.js", "nextjs"],
    },
    { name: "TypeScript", aliases: ["typescript", "ts"] },
    {
      name: "Responsive Design",
      aliases: [
        "responsive design",
        "responsive web design",
        "mobile-first",
        "mobile responsive",
      ],
    },
    {
      name: "REST API",
      aliases: [
        "rest api",
        "restful api",
        "api integration",
        "fetch api",
        "axios",
      ],
    },
    { name: "Git", aliases: ["git", "github", "gitlab"] },
    {
      name: "UI/UX",
      aliases: ["ui/ux", "ui ux", "user interface", "user experience", "figma"],
    },
    {
      name: "Web Development",
      aliases: [
        "web development",
        "frontend development",
        "web applications",
        "spa",
      ],
    },
    {
      name: "Frontend Development",
      aliases: ["frontend development", "client-side", "frontend architecture"],
    },
  ],
  "Backend Developer": [
    { name: "Java", aliases: ["java"] },
    { name: "Python", aliases: ["python", "django", "flask", "fastapi"] },
    {
      name: "Node.js",
      aliases: ["node.js", "node", "nodejs", "express", "express.js"],
    },
    {
      name: "Spring Boot",
      aliases: ["spring boot", "spring", "spring framework"],
    },
    {
      name: "REST API",
      aliases: [
        "rest api",
        "restful api",
        "restful apis",
        "api design",
        "graphql",
      ],
    },
    {
      name: "SQL",
      aliases: [
        "sql",
        "mysql",
        "postgresql",
        "postgres",
        "oracle sql",
        "ms sql",
      ],
    },
    {
      name: "NoSQL",
      aliases: ["nosql", "mongodb", "redis", "cassandra", "dynamodb"],
    },
    {
      name: "Database",
      aliases: [
        "database",
        "databases",
        "rdbms",
        "dbms",
        "orm",
        "mongoose",
        "hibernate",
      ],
    },
    {
      name: "Authentication",
      aliases: ["authentication", "auth", "jwt", "oauth", "session management"],
    },
    { name: "Git", aliases: ["git", "github", "gitlab"] },
    {
      name: "Backend Development",
      aliases: [
        "backend development",
        "server-side",
        "microservices",
        "distributed systems",
      ],
    },
    { name: "Cloud", aliases: ["cloud", "aws", "azure", "gcp", "docker"] },
  ],
  "Data Scientist": [
    { name: "Python", aliases: ["python", "py"] },
    {
      name: "SQL",
      aliases: ["sql", "mysql", "postgresql", "postgres", "sqlite"],
    },
    {
      name: "Machine Learning",
      aliases: ["machine learning", "ml", "deep learning", "neural networks"],
    },
    {
      name: "Statistics",
      aliases: [
        "statistics",
        "statistical modeling",
        "probability",
        "hypothesis testing",
      ],
    },
    { name: "Pandas", aliases: ["pandas"] },
    { name: "NumPy", aliases: ["numpy"] },
    { name: "Scikit-learn", aliases: ["scikit-learn", "sklearn"] },
    {
      name: "Data Analysis",
      aliases: [
        "data analysis",
        "data analytics",
        "eda",
        "exploratory data analysis",
      ],
    },
    {
      name: "Data Visualization",
      aliases: [
        "data visualization",
        "matplotlib",
        "seaborn",
        "tableau",
        "powerbi",
        "plotly",
      ],
    },
    {
      name: "Feature Engineering",
      aliases: [
        "feature engineering",
        "feature extraction",
        "feature selection",
        "data preprocessing",
      ],
    },
  ],
  "DevOps Engineer": [
    {
      name: "Linux",
      aliases: [
        "linux",
        "ubuntu",
        "centos",
        "redhat",
        "bash",
        "shell scripting",
      ],
    },
    { name: "Git", aliases: ["git", "github", "gitlab", "bitbucket"] },
    { name: "Docker", aliases: ["docker", "containers", "containerization"] },
    { name: "Kubernetes", aliases: ["kubernetes", "k8s", "helm"] },
    {
      name: "AWS",
      aliases: ["aws", "amazon web services", "ec2", "s3", "iam", "lambda"],
    },
    { name: "Azure", aliases: ["azure", "microsoft azure", "gcp"] },
    {
      name: "CI/CD",
      aliases: [
        "ci/cd",
        "ci cd",
        "continuous integration",
        "continuous deployment",
      ],
    },
    { name: "Jenkins", aliases: ["jenkins", "github actions", "gitlab ci"] },
    {
      name: "Terraform",
      aliases: ["terraform", "ansible", "infrastructure as code", "iac"],
    },
    {
      name: "Cloud",
      aliases: ["cloud", "cloud infrastructure", "cloud architecture"],
    },
    {
      name: "Monitoring",
      aliases: [
        "monitoring",
        "prometheus",
        "grafana",
        "datadog",
        "cloudwatch",
        "logging",
        "elk",
      ],
    },
    {
      name: "Infrastructure",
      aliases: ["infrastructure", "networking", "load balancer", "vpc", "dns"],
    },
  ],
};

const GENERAL_TECH_TERMS = [
  "git",
  "github",
  "api",
  "database",
  "testing",
  "unit test",
  "deployment",
  "debug",
  "clean code",
  "agile",
  "scrum",
  "microservices",
  "cloud",
  "linux",
  "security",
  "optimization",
  "performance",
  "refactoring",
  "architecture",
  "ci/cd",
];

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Checks whether text contains a skill alias with context validation
 * (filters out aspirational phrases like "interested in learning X")
 */
function containsSkillMeaningfully(text, aliases) {
  for (const alias of aliases) {
    const aliasEscaped = escapeRegExp(alias.toLowerCase());
    let regex;
    if (alias.includes(" ") || alias.includes("/") || alias.includes(".")) {
      regex = new RegExp(aliasEscaped, "i");
    } else {
      regex = new RegExp(`\\b${aliasEscaped}\\b`, "i");
    }

    if (regex.test(text)) {
      // Exclude matches that appear solely inside "interested in learning / looking to learn"
      const aspirationalRegex = new RegExp(
        `(?:interested in|looking to learn|want to learn|plans to learn|beginner in)\\s+[^.\\n]*?${aliasEscaped}`,
        "i",
      );
      if (aspirationalRegex.test(text)) {
        // If the only occurrence is aspirational, verify if there's another occurrence outside
        const nonAspirationalText = text.replace(aspirationalRegex, "");
        if (regex.test(nonAspirationalText)) {
          return true;
        }
        continue;
      }
      return true;
    }
  }
  return false;
}

export function getAtsStatusLabel(score) {
  if (score >= 90) return "EXCELLENT ATS MATCH";
  if (score >= 80) return "STRONG ATS MATCH";
  if (score >= 70) return "GOOD ATS MATCH";
  if (score >= 60) return "MODERATE ATS MATCH";
  return "NEEDS IMPROVEMENT";
}

/**
 * Deterministic, measurable ATS score calculation
 */
export function analyzeResumeText(
  rawText = "",
  targetRole = "Software Engineer",
) {
  const text = rawText.toLowerCase();

  if (!text || text.trim().length < 20) {
    throw new Error(
      "No readable text found in this resume. Please upload a valid PDF or DOCX file.",
    );
  }

  const wordCount = text.split(/\s+/).length;

  // ── 1. Contact Information Analysis (5 Points Max) ──────────────────────────
  const hasEmail = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(
    rawText,
  );
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(rawText);
  const hasLinkedIn = /linkedin\.com/i.test(rawText);
  const hasGitHub = /github\.com/i.test(rawText);

  let contactScore = 0;
  if (hasEmail) contactScore += 2;
  if (hasPhone) contactScore += 2;
  if (hasLinkedIn || hasGitHub) contactScore += 1;
  contactScore = Math.min(5, contactScore);

  // ── 2. Resume Section Completeness (15 Points Max) ─────────────────────────
  const summaryMatches =
    text.includes("summary") ||
    text.includes("objective") ||
    text.includes("profile") ||
    text.includes("about me");
  const educationMatches =
    text.includes("education") ||
    text.includes("university") ||
    text.includes("college") ||
    text.includes("degree") ||
    text.includes("b.tech") ||
    text.includes("b.e.") ||
    text.includes("bachelor") ||
    text.includes("master") ||
    text.includes("gpa");
  const experienceMatches =
    text.includes("experience") ||
    text.includes("employment") ||
    text.includes("work history") ||
    text.includes("internship") ||
    text.includes("developer") ||
    text.includes("engineer") ||
    text.includes("intern");
  const projectMatches =
    text.includes("project") ||
    text.includes("developed") ||
    text.includes("built") ||
    text.includes("implemented");
  const skillsHeaderMatches =
    text.includes("skills") ||
    text.includes("technical skills") ||
    text.includes("technologies") ||
    text.includes("competencies");
  const certMatches =
    text.includes("certif") ||
    text.includes("credential") ||
    text.includes("license") ||
    text.includes("coursera") ||
    text.includes("udemy") ||
    text.includes("award") ||
    text.includes("achievement") ||
    text.includes("hackathon");

  let sectionScore = 0;
  if (educationMatches) sectionScore += 5;
  if (summaryMatches) sectionScore += 4;
  if (skillsHeaderMatches) sectionScore += 4;
  if (certMatches) sectionScore += 2;
  sectionScore = Math.min(15, sectionScore);

  // ── 3. Role-Specific Keyword & Skill Match (35 Points Max) ───────────────────
  const roleSkillDefs =
    ROLE_SKILL_DEFINITIONS[targetRole] ||
    ROLE_SKILL_DEFINITIONS["Software Engineer"];
  const matchedSkills = [];
  const missingKeywords = [];

  roleSkillDefs.forEach((skill) => {
    if (containsSkillMeaningfully(text, skill.aliases)) {
      matchedSkills.push(skill.name);
    } else {
      missingKeywords.push(skill.name);
    }
  });

  const skillMatchRatio = matchedSkills.length / (roleSkillDefs.length || 1);
  const keywordMatchScore = Math.min(35, Math.round(skillMatchRatio * 35));

  // ── 4. Relevant Projects & Experience (20 Points Max) ───────────────────────
  const hasMetrics =
    /%|improved|reduced|increased|\d+x|\$\d+|\d+\s*percent|\d+\s*users|\d+\s*requests|\d+\s*qps/i.test(
      rawText,
    );

  // Check if role-matched skills appear in experience/projects sections
  let roleSkillsInExperience = false;
  if (matchedSkills.length > 0 && (experienceMatches || projectMatches)) {
    roleSkillsInExperience = true;
  }

  let experienceProjectScore = 0;
  if (experienceMatches) experienceProjectScore += 5;
  if (projectMatches) experienceProjectScore += 5;
  if (roleSkillsInExperience) experienceProjectScore += 5;
  if (hasMetrics) experienceProjectScore += 5;
  experienceProjectScore = Math.min(20, experienceProjectScore);

  // ── 5. ATS-Readable Structure & Formatting (15 Points Max) ──────────────────
  const actionVerbs = [
    "developed",
    "built",
    "created",
    "implemented",
    "designed",
    "optimized",
    "reduced",
    "increased",
    "led",
    "managed",
    "engineered",
    "deployed",
    "architected",
    "configured",
    "tested",
  ];
  let actionVerbCount = 0;
  actionVerbs.forEach((verb) => {
    if (text.includes(verb)) actionVerbCount += 1;
  });

  let structureScore = 0;
  if (
    summaryMatches &&
    educationMatches &&
    (experienceMatches || projectMatches)
  )
    structureScore += 5;
  else if (educationMatches || experienceMatches) structureScore += 3;

  if (wordCount >= 150 && wordCount <= 1200) structureScore += 4;
  else if (wordCount >= 80) structureScore += 2;

  if (
    rawText.includes("•") ||
    rawText.includes("- ") ||
    rawText.includes("* ") ||
    rawText.includes("\n")
  )
    structureScore += 3;

  if (actionVerbCount >= 3) structureScore += 3;
  else if (actionVerbCount >= 1) structureScore += 1;

  structureScore = Math.min(15, structureScore);

  // ── 6. Relevant Technical Terminology (10 Points Max) ───────────────────────
  let generalTechCount = 0;
  GENERAL_TECH_TERMS.forEach((term) => {
    if (text.includes(term)) generalTechCount += 1;
  });
  const terminologyScore = Math.min(
    10,
    Math.round((generalTechCount / 6) * 10),
  );

  // ── Final ATS Score Calculation (Out of 100) ─────────────────────────────────
  const rawTotal =
    keywordMatchScore +
    experienceProjectScore +
    sectionScore +
    structureScore +
    terminologyScore +
    contactScore;
  const atsScore = Math.min(98, Math.max(30, rawTotal));
  const statusLabel = getAtsStatusLabel(atsScore);

  // ── Role-Specific Improvements (Accurate & Contextual) ──────────────────────
  const roleImprovements = [];

  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 3).join(", ");
    roleImprovements.push(
      `Incorporate key ${targetRole} technical skills such as ${topMissing} if you have genuine working experience with them.`,
    );
  }

  if (targetRole === "Frontend Developer") {
    if (
      !matchedSkills.includes("Responsive Design") &&
      !matchedSkills.includes("UI/UX")
    ) {
      roleImprovements.push(
        "Highlight responsive web design, mobile-first layouts, and UI/UX implementation in your project descriptions.",
      );
    }
    if (
      !matchedSkills.includes("React") &&
      !matchedSkills.includes("JavaScript")
    ) {
      roleImprovements.push(
        "Add modern JavaScript/React web interface development experience to your projects if applicable.",
      );
    }
  } else if (targetRole === "Backend Developer") {
    if (!matchedSkills.includes("REST API")) {
      roleImprovements.push(
        "Clearly describe REST API architecture, endpoint design, and request routing in your project descriptions.",
      );
    }
    if (!matchedSkills.includes("SQL") && !matchedSkills.includes("Database")) {
      roleImprovements.push(
        "Highlight database schema design, indexing, and query optimization experience.",
      );
    }
  } else if (targetRole === "Data Scientist") {
    if (!matchedSkills.includes("Machine Learning")) {
      roleImprovements.push(
        "Detail machine learning model development, training pipelines, and evaluation metrics used in your projects.",
      );
    }
    if (!matchedSkills.includes("Pandas") && !matchedSkills.includes("NumPy")) {
      roleImprovements.push(
        "Mention data manipulation and statistical analysis workflows utilizing Pandas or NumPy.",
      );
    }
  } else if (targetRole === "DevOps Engineer") {
    if (
      !matchedSkills.includes("Docker") &&
      !matchedSkills.includes("Kubernetes")
    ) {
      roleImprovements.push(
        "Describe containerization with Docker and orchestration with Kubernetes in your experience.",
      );
    }
    if (!matchedSkills.includes("CI/CD")) {
      roleImprovements.push(
        "Highlight automated CI/CD pipeline configuration and deployment automation workflows.",
      );
    }
  } else if (targetRole === "Software Engineer") {
    if (
      !matchedSkills.includes("Data Structures") &&
      !matchedSkills.includes("Algorithms")
    ) {
      roleImprovements.push(
        "Emphasize core computer science fundamentals, data structures, and algorithm complexity optimization in your projects.",
      );
    }
  }

  if (!hasMetrics && (experienceMatches || projectMatches)) {
    roleImprovements.push(
      'Include quantifiable results and measurable metrics (e.g. "Improved query performance by 30%") in your project descriptions.',
    );
  }

  if (roleImprovements.length === 0) {
    roleImprovements.push(
      `Your resume demonstrates strong technical alignment with ${targetRole} requirements.`,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GENERAL RESUME HEALTH (For Resume Analyzer page)
  // ───────────────────────────────────────────────────────────────────────────
  const good = [];
  const improvements = [];
  const missing = [];
  const generalRecommendations = [];

  if (hasEmail && hasPhone) {
    good.push("Contact information is complete with email and phone number.");
  } else if (hasEmail) {
    improvements.push(
      "Contact information includes email, but a phone number is missing.",
    );
  } else {
    missing.push(
      "Essential contact details (email and phone number) are missing.",
    );
    generalRecommendations.push(
      "Add complete contact details (full name, email address, and phone number) at the top of your resume.",
    );
  }

  if (hasLinkedIn) {
    good.push("Professional LinkedIn profile link is included.");
  } else {
    missing.push("LinkedIn profile link is missing.");
    generalRecommendations.push(
      "Add a professional LinkedIn profile URL to your contact header.",
    );
  }

  if (hasGitHub) {
    good.push(
      "GitHub portfolio link is included to showcase code repositories.",
    );
  }

  if (summaryMatches) {
    good.push(
      "Professional summary is present and clearly sets career context.",
    );
  } else {
    missing.push(
      "Professional summary or career objective section is missing.",
    );
    generalRecommendations.push(
      "Add a concise 2-3 sentence professional summary at the top outlining your background and core capabilities.",
    );
  }

  if (educationMatches) {
    good.push(
      "Education section is clearly presented with degree and institution details.",
    );
  } else {
    missing.push("Education section is missing or incomplete.");
    generalRecommendations.push(
      "Add an Education section specifying your degree, institution, department, and graduation year.",
    );
  }

  if (matchedSkills.length >= 4) {
    good.push(
      `Technical skills are clearly listed (${matchedSkills.slice(0, 5).join(", ")}).`,
    );
  } else {
    improvements.push(
      "Technical skills section is brief. Group your skills into clear categories.",
    );
    generalRecommendations.push(
      "Organize skills into distinct categories like Languages, Frameworks, and Tools.",
    );
  }

  if (projectMatches) {
    if (hasMetrics) {
      good.push(
        "Projects and experience demonstrate quantifiable impact and measurable results.",
      );
    } else {
      improvements.push(
        "Project descriptions list technologies but lack measurable outcomes or metrics.",
      );
      generalRecommendations.push(
        'Add measurable outcomes to project descriptions (e.g. "Optimized query response time by 30%").',
      );
    }
  } else {
    missing.push(
      "Projects section is missing. Practical projects are essential to demonstrate hands-on experience.",
    );
    generalRecommendations.push(
      "Add a Projects section featuring 2-3 applications describing technologies used and your contribution.",
    );
  }

  if (certMatches) {
    good.push(
      "Certifications and continuous learning credentials are included.",
    );
  } else {
    improvements.push("No certifications or credentials listed.");
    generalRecommendations.push(
      "Consider adding relevant certifications or coursework to validate your domain expertise.",
    );
  }

  if (wordCount >= 150 && wordCount <= 1200) {
    good.push("Resume length and overall structure are balanced and readable.");
  }

  return {
    extractedLength: wordCount,

    // Mathematical breakdown (for auditing & verification)
    scoringBreakdown: {
      keywordMatchScore, // max 35
      experienceProjectScore, // max 20
      sectionScore, // max 15
      structureScore, // max 15
      terminologyScore, // max 10
      contactScore, // max 5
      totalScore: atsScore,
    },

    // MODULE 1: GENERAL RESUME HEALTH ONLY
    resumeAnalysis: {
      good:
        good.length > 0
          ? good
          : ["Clean text structure and readable formatting."],
      improvements:
        improvements.length > 0
          ? improvements
          : ["No major general improvement areas detected."],
      missing: missing.length > 0 ? missing : [],
      recommendations:
        generalRecommendations.length > 0
          ? generalRecommendations
          : ["Your resume meets all general completeness requirements."],
    },

    // MODULE 2: ROLE-SPECIFIC ATS SCORE ONLY
    ats: {
      score: atsScore,
      targetRole,
      statusLabel,
      roleMatchedKeywords: matchedSkills,
      missingKeywords,
      roleImprovements,
    },
  };
}

/**
 * Full resume analysis: ATS + keywords + extracted info + improvement suggestions
 */
export function fullResumeAnalysis(
  rawText = "",
  targetRole = "Software Engineer",
  jobDescription = "",
) {
  const base = analyzeResumeText(rawText, targetRole);
  const extractedInfo = extractResumeInfo(rawText);
  const keywordAnalysis = analyzeKeywords(rawText, targetRole);
  const improvementSuggestions = generateImprovementSuggestions(
    rawText,
    keywordAnalysis,
    targetRole,
  );

  // Compute overall resume score (weighted blend)
  const atsWeight = 0.35;
  const kwWeight = 0.25;
  const sectionWeight = 0.25;
  const infoWeight = 0.15;

  const kwScore = Math.round(
    (keywordAnalysis.keywordsFound.length /
      Math.max(
        1,
        keywordAnalysis.keywordsFound.length +
          keywordAnalysis.missingKeywords.length +
          keywordAnalysis.keywordsToImprove.length,
      )) *
      100,
  );
  const infoScore =
    [
      extractedInfo.email,
      extractedInfo.phone,
      extractedInfo.education,
      extractedInfo.skills?.length > 0,
      extractedInfo.projects,
    ].filter(Boolean).length * 20;

  const sectionBreakdown = {
    atsCompatibility: base.ats.score,
    skills: Math.min(100, extractedInfo.skills?.length * 5 || 50),
    keywords: kwScore,
    education: extractedInfo.education ? 85 : 40,
    experience: extractedInfo.experience ? 80 : 45,
    projects: extractedInfo.projects ? 80 : 45,
    certifications: extractedInfo.certifications ? 85 : 40,
    formatting: base.scoringBreakdown.structureScore * (100 / 15),
    contentQuality: base.scoringBreakdown.terminologyScore * 10,
    jobRelevance: base.ats.score,
  };

  const overallScore = Math.round(
    atsWeight * base.ats.score +
      kwWeight * kwScore +
      sectionWeight *
        (Object.values(sectionBreakdown).reduce((a, b) => a + b, 0) /
          Object.values(sectionBreakdown).length) +
      infoWeight * Math.min(100, infoScore),
  );

  let jobMatch = null;
  if (jobDescription && jobDescription.trim().length > 30) {
    jobMatch = matchResumeToJobDescription(rawText, jobDescription, targetRole);
  }

  return {
    ...base,
    overallScore: Math.min(98, Math.max(35, overallScore)),
    sectionBreakdown,
    extractedInfo,
    keywordAnalysis,
    improvementSuggestions,
    jobMatch,
  };
}

export default {
  analyzeResumeText,
  fullResumeAnalysis,
  extractResumeInfo,
  analyzeKeywords,
  matchResumeToJobDescription,
  extractJobDescriptionKeywords,
  generateImprovementSuggestions,
  ROLE_SKILL_DEFINITIONS,
  ROLE_KEYWORD_CATEGORIES,
  getAtsStatusLabel,
};
