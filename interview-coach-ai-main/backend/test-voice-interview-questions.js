async function testVoiceInterviewQuestions() {
  console.log('=====================================================');
  console.log('🧪 VERIFYING AI VOICE INTERVIEW QUESTION SELECTION');
  console.log('=====================================================\n');

  const token = 'demo-jwt-token-voice-interview';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Step 1: Generate Technical Interview Session (Java, SQL, Data Structures)
  console.log('Step 1: Generating Technical Session (Technologies: Java, SQL, Data Structures)...');
  const techRes = await fetch('http://localhost:5000/api/technical/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      role: 'Software Engineer',
      technologies: ['Java', 'SQL', 'Data Structures'],
      difficulty: 'Medium',
      count: 5,
    }),
  });
  const techData = await techRes.json();

  console.log(`  Session ID: ${techData.sessionId}`);
  console.log(`  Technologies Configured: ${techData.technology}`);
  console.log(`  Generated Questions Count: ${techData.questions?.length}\n`);

  techData.questions.forEach((q, i) => {
    console.log(`  [Q${i + 1}] ID: ${q.id} | Tech: ${q.technology} | Difficulty: ${q.difficulty}`);
    console.log(`       Question: "${q.question}"`);
  });

  const techsRepresented = new Set(techData.questions.map((q) => q.technology));
  console.log(`\n  Unique Technologies Represented: ${Array.from(techsRepresented).join(', ')}\n`);

  if (techData.questions.length >= 3 && techsRepresented.size > 1) {
    console.log('✅ MULTI-TECHNOLOGY TECHNICAL QUESTION SELECTION PASSED!\n');
  } else {
    console.error('❌ Multi-technology selection failed:', techData);
    process.exit(1);
  }

  // Step 2: Generate Mock Interview Session (AWS, Docker)
  console.log('Step 2: Generating Mock Interview Session (DevOps Engineer: AWS, Docker)...');
  const mockRes = await fetch('http://localhost:5000/api/interview/start', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      role: 'DevOps Engineer',
      type: 'Behavioral',
      technologies: ['AWS', 'Docker'],
      difficulty: 'Hard',
      count: 5,
    }),
  });
  const mockData = await mockRes.json();

  console.log(`  Mock Session ID: ${mockData.sessionId}`);
  console.log(`  Total Questions (HR + Tech): ${mockData.questions?.length}\n`);

  mockData.questions.forEach((q, i) => {
    console.log(`  [Q${i + 1}] Tech/Category: ${q.technology || 'HR'} | Question: "${q.question || q}"`);
  });

  if (mockData.questions.length >= 3) {
    console.log('\n✅ MOCK INTERVIEW VOICE SYSTEM SETUP PASSED!\n');
  } else {
    console.error('❌ Mock interview setup failed:', mockData);
    process.exit(1);
  }

  console.log('=====================================================');
  console.log('🎉 ALL AI VOICE INTERVIEW TESTS PASSED 100%!');
  console.log('=====================================================');
}

testVoiceInterviewQuestions().catch(console.error);
