import assert from "node:assert/strict";
import { matchResumeToJobDescription } from "./services/atsAnalyzerEngine.js";

const strong = matchResumeToJobDescription(
  "Professional Experience: Developed and deployed machine learning models using Python, SQL, TensorFlow and Docker. B.E. Computer Science.",
  "Required: Python, SQL, Machine Learning, TensorFlow. Responsibilities: develop and deploy machine learning models. Bachelor degree required. Preferred: Kubernetes.",
  "Machine Learning Engineer",
);
assert.ok(strong.matchScore >= 70);
assert.deepEqual(strong.missingPreferredSkills, ["Kubernetes"]);
assert.ok(strong.matchingSkills.includes("Python"));

const weak = matchResumeToJobDescription(
  "Frontend developer experienced with React and CSS.",
  "Required: Python, SQL, Machine Learning, TensorFlow. Responsibilities: develop and deploy machine learning models. Master degree required.",
  "Machine Learning Engineer",
);
assert.ok(weak.matchScore < 45);
assert.equal(weak.categories.education, 0);

const related = matchResumeToJobDescription(
  "Built models with Python and TensorFlow.",
  "Required: PyTorch. Responsibilities: develop deep learning models.",
  "Machine Learning Engineer",
);
assert.equal(
  related.requirements.find((item) => item.name === "PyTorch")?.match,
  "RELATED_MATCH",
);
assert.ok(!related.matchingSkills.includes("PyTorch"));

const wrongExperience = matchResumeToJobDescription(
  "Professional Experience: 3 years frontend development using React.",
  "Required: 3+ years of machine learning experience and Python. Responsibilities: develop machine learning models.",
  "Machine Learning Engineer",
);
assert.equal(wrongExperience.relevantExperienceYears, 0);
assert.ok(wrongExperience.categories.experience < 50);

const repeatable = matchResumeToJobDescription(
  "Python Python Python and SQL.",
  "Required: Python and SQL. Responsibilities: build software.",
  "Software Engineer",
);
assert.equal(
  repeatable.matchScore,
  matchResumeToJobDescription(
    "Python and SQL.",
    "Required: Python and SQL. Responsibilities: build software.",
    "Software Engineer",
  ).matchScore,
);

console.log("Job Match regression tests passed");
