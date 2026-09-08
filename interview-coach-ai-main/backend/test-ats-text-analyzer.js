import { analyzeResumeText, ROLE_SKILL_DEFINITIONS } from './services/atsAnalyzerEngine.js';

function testAll5RolesOnSameResume() {
  console.log('=====================================================');
  console.log('🧪 VERIFYING DYNAMIC ATS SCORING ACROSS ALL 5 ROLES');
  console.log('=====================================================\n');

  // Candidate Resume (Specialized in Java, Spring Boot, SQL, REST APIs, Microservices, Git)
  const candidateResume = `
    Krithika Sharma
    Email: krithika@example.com | Phone: +91 98765 43210
    LinkedIn: linkedin.com/in/krithika | GitHub: github.com/krithika

    PROFESSIONAL SUMMARY
    Backend Software Engineer with 2 years of experience building scalable backend microservices
    using Java, Spring Boot, SQL, and RESTful APIs.

    EDUCATION
    B.Tech Computer Science & Engineering, IIT Madras, 2026. GPA: 8.9/10.

    TECHNICAL SKILLS
    Java, Python, Spring Boot, REST APIs, SQL, MySQL, PostgreSQL,
    NoSQL, MongoDB, Git, Authentication, JWT, Docker, Cloud

    WORK EXPERIENCE
    Backend Engineering Intern | TechCorp (2025 - Present)
    - Engineered high-throughput REST APIs using Java and Spring Boot.
    - Optimized database indexes, reducing query latency by 40%.
    - Implemented JWT authentication and secure session management.

    PROJECTS
    Enterprise E-Commerce Backend (Java, Spring Boot, MySQL, Docker)
    - Developed order processing service handling 500+ requests per second.
  `;

  const allRoles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Data Scientist',
    'DevOps Engineer',
  ];

  const results = {};

  allRoles.forEach((role) => {
    const analysis = analyzeResumeText(candidateResume, role);
    results[role] = analysis.ats;
    console.log(`📌 ROLE: [ ${role.toUpperCase()} ]`);
    console.log(`   ATS Score:            ${analysis.ats.score} / 100 (${analysis.ats.statusLabel})`);
    console.log(`   Matched Skills (${analysis.ats.roleMatchedKeywords.length}):    ${analysis.ats.roleMatchedKeywords.join(', ')}`);
    console.log(`   Missing Skills (${analysis.ats.missingKeywords.length}):    ${analysis.ats.missingKeywords.join(', ')}`);
    console.log(`   Role Improvements:    ${analysis.ats.roleImprovements[0]}`);
    console.log('-----------------------------------------------------');
  });

  // Verify all 5 roles were calculated with their own profiles
  console.log('\n── Dynamic Verification ──');
  let allPassed = true;

  // 1. Backend Developer should have highest score for this Java/Spring backend resume
  if (results['Backend Developer'].score >= 85) {
    console.log(`✅ Backend Developer score is strong (${results['Backend Developer'].score}/100)`);
  } else {
    console.log(`❌ Backend Developer score is unexpectedly low (${results['Backend Developer'].score}/100)`);
    allPassed = false;
  }

  // 2. Software Engineer should also score well (CS fundamentals, Java, SQL, Git)
  if (results['Software Engineer'].score >= 75) {
    console.log(`✅ Software Engineer score is strong (${results['Software Engineer'].score}/100)`);
  } else {
    console.log(`❌ Software Engineer score is unexpectedly low (${results['Software Engineer'].score}/100)`);
    allPassed = false;
  }

  // 3. Frontend Developer should score significantly lower (no HTML/CSS/React/TS)
  if (results['Frontend Developer'].score < results['Backend Developer'].score - 15) {
    console.log(`✅ Frontend Developer score is properly lower (${results['Frontend Developer'].score}/100)`);
  } else {
    console.log(`❌ Frontend Developer score failed differentiation (${results['Frontend Developer'].score}/100 vs Backend ${results['Backend Developer'].score}/100)`);
    allPassed = false;
  }

  // 4. Data Scientist should score lower (no Pandas, NumPy, ML, Scikit-learn)
  if (results['Data Scientist'].score < results['Backend Developer'].score - 15) {
    console.log(`✅ Data Scientist score is properly lower (${results['Data Scientist'].score}/100)`);
  } else {
    console.log(`❌ Data Scientist score failed differentiation (${results['Data Scientist'].score}/100 vs Backend ${results['Backend Developer'].score}/100)`);
    allPassed = false;
  }

  // 5. DevOps Engineer should reflect partial overlap (Docker, Cloud, Git) but missing K8s, CI/CD, Terraform
  if (results['DevOps Engineer'].missingKeywords.includes('Kubernetes') && results['DevOps Engineer'].missingKeywords.includes('Terraform')) {
    console.log(`✅ DevOps Engineer accurately detected missing tools (Kubernetes, Terraform)`);
  } else {
    console.log(`❌ DevOps Engineer missing keywords check failed`);
    allPassed = false;
  }

  console.log('\n=====================================================');
  if (allPassed) {
    console.log('🎉 ALL 5 ROLES TESTED AND DYNAMICALLY VERIFIED 100%!');
  } else {
    console.log('❌ SOME ROLE TESTS FAILED');
    process.exit(1);
  }
  console.log('=====================================================');
}

testAll5RolesOnSameResume();
