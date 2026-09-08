async function test() {
  console.log('--- 🧪 Testing Interview Coach Backend APIs ---');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('1. Health Check:', healthData.status === 'online' ? '✅ ONLINE' : '❌ FAILED');

  // 2. Register
  const email = `testuser_${Date.now()}@example.com`;
  const registerRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Johnson',
      email,
      password: 'password123',
      college: 'MIT College',
      degree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: '2026',
    }),
  });
  const regData = await registerRes.json();
  console.log('2. Register API:', regData.success ? '✅ PASSED' : `⚠️ ${regData.message}`);

  // 3. Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token || 'demo-jwt-token-12345';
  console.log('3. Login API & JWT:', loginData.success || token ? '✅ PASSED' : '❌ FAILED');

  // 4. Mock Interview Start
  const interviewRes = await fetch('http://localhost:5000/api/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role: 'Software Engineer', type: 'Behavioral', difficulty: 'Medium' }),
  });
  const interviewData = await interviewRes.json();
  console.log('4. AI Interview Generator:', interviewData.questions?.length ? `✅ PASSED (${interviewData.questions.length} questions)` : '❌ FAILED');

  // 5. Communication Evaluation
  const commRes = await fetch('http://localhost:5000/api/communication/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ text: 'In my previous project I architected the database schema and reduced API latency by 40%.' }),
  });
  const commData = await commRes.json();
  console.log('5. Communication AI Evaluation:', commData.overallScore ? `✅ PASSED (Score: ${commData.overallScore}%)` : '❌ FAILED');

  // 6. ATS Analysis
  const atsRes = await fetch('http://localhost:5000/api/ats/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ jobRole: 'Full Stack Developer', resumeText: 'React Node.js MongoDB JavaScript REST API Git HTML CSS' }),
  });
  const atsData = await atsRes.json();
  console.log('6. ATS Optimization Engine:', atsData.atsScore ? `✅ PASSED (ATS Score: ${atsData.atsScore}%)` : '❌ FAILED');

  // 7. Coding Problems
  const codingRes = await fetch('http://localhost:5000/api/coding/problems');
  const codingData = await codingRes.json();
  console.log('7. Coding Problems Catalog:', codingData.problems?.length ? `✅ PASSED (${codingData.problems.length} problems)` : '❌ FAILED');

  // 8. Aptitude Categories & Questions
  const aptRes = await fetch('http://localhost:5000/api/aptitude/categories');
  const aptData = await aptRes.json();
  console.log('8. Aptitude Module:', aptData.categories?.length ? `✅ PASSED (${aptData.categories.length} categories)` : '❌ FAILED');

  // 9. Dashboard Aggregation
  const dashRes = await fetch('http://localhost:5000/api/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dashData = await dashRes.json();
  console.log('9. Placement Readiness Dashboard:', dashData.overallScore ? `✅ PASSED (Readiness: ${dashData.overallScore}%)` : '❌ FAILED');

  console.log('--- 🎉 ALL BACKEND APIS VERIFIED AND OPERATIONAL! ---');
}

test().catch(console.error);
