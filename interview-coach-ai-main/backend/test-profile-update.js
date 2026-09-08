async function testProfileUpdate() {
  console.log('=====================================================');
  console.log('🧪 VERIFYING USER PROFILE API & PERSISTENCE');
  console.log('=====================================================\n');

  const token = 'demo-jwt-token-profile-test';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Step 1: Fetch initial profile
  console.log('Step 1: Fetching initial user profile (GET /api/auth/profile)...');
  const res1 = await fetch('http://localhost:5000/api/auth/profile', { headers });
  const data1 = await res1.json();

  console.log(`  Initial User Name: "${data1.user?.name}"`);
  console.log(`  Initial College: "${data1.user?.college}"`);
  console.log(`  Initial Skills: ${JSON.stringify(data1.user?.skills)}\n`);

  // Step 2: Update Profile
  console.log('Step 2: Updating profile fields (PUT /api/auth/profile)...');
  const updatePayload = {
    name: 'Kriths08',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    college: 'IIT Madras',
    degree: 'B.Tech',
    branch: 'Computer Science & AI',
    graduationYear: '2026',
    jobPreference: 'Senior Full Stack Engineer',
    bio: 'Passionate developer building AI interview tools.',
    linkedIn: 'https://linkedin.com/in/kriths08',
    github: 'https://github.com/kriths08',
    resumeUrl: 'https://drive.google.com/resume.pdf',
    skills: ['Java', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB', 'System Design'],
  };

  const res2 = await fetch('http://localhost:5000/api/auth/profile', {
    method: 'PUT',
    headers,
    body: JSON.stringify(updatePayload),
  });
  const data2 = await res2.json();

  if (data2.success && data2.user?.name === 'Kriths08') {
    console.log('✅ Profile update request succeeded!');
    console.log(`   Updated Name: ${data2.user.name}`);
    console.log(`   Updated College: ${data2.user.college}`);
    console.log(`   Updated Job Preference: ${data2.user.jobPreference}`);
    console.log(`   Updated Skills (${data2.user.skills.length}): ${data2.user.skills.join(', ')}\n`);
  } else {
    console.error('❌ Profile update failed:', data2);
    process.exit(1);
  }

  // Step 3: Refresh & Verify Persistence
  console.log('Step 3: Refreshing profile (GET /api/auth/profile) to verify persistence...');
  const res3 = await fetch('http://localhost:5000/api/auth/profile', { headers });
  const data3 = await res3.json();

  if (data3.user?.name === 'Kriths08' && data3.user?.jobPreference === 'Senior Full Stack Engineer') {
    console.log('✅ PERSISTENCE VERIFIED! Profile changes persisted across requests.\n');
  } else {
    console.error('❌ Persistence verification failed:', data3);
    process.exit(1);
  }

  console.log('=====================================================');
  console.log('🎉 ALL PROFILE FUNCTIONALITY TESTS PASSED 100%!');
  console.log('=====================================================');
}

testProfileUpdate().catch(console.error);
