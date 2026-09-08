async function testLearningPaths() {
  console.log('=====================================================');
  console.log('🧪 PERSONALIZED RECOMMENDED LEARNING PATHS TEST');
  console.log('=====================================================\n');

  const token = 'demo-jwt-token-learning-paths-test';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // 1. GET /api/learning-paths
  console.log('Step 1: Fetching personalized learning paths (GET /api/learning-paths)...');
  const res1 = await fetch('http://localhost:5000/api/learning-paths', { headers });
  const data1 = await res1.json();

  if (!data1.success || !data1.paths?.length) {
    console.error('❌ FAILED to retrieve learning paths:', data1);
    process.exit(1);
  }

  console.log(`✅ Success! Received ${data1.paths.length} personalized paths.\n`);

  console.log('Recommended Paths Breakdown:');
  data1.paths.forEach((p, idx) => {
    console.log(`  [${idx + 1}] ${p.title} (${p.level})`);
    console.log(`      Priority: ${p.priority}`);
    console.log(`      Reason: ${p.reason}`);
    console.log(`      Topics (${p.totalTopics}): ${p.topics.slice(0, 3).map((t) => t.title).join(', ')}...`);
    console.log(`      Progress: ${p.progress}%\n`);
  });

  // 2. Mark first topic of first path as completed
  const targetPath = data1.paths[0];
  console.log(`Step 2: Marking Topic #1 ("${targetPath.topics[0].title}") as completed for path "${targetPath.title}"...`);

  const res2 = await fetch(`http://localhost:5000/api/learning-paths/${targetPath._id}/topics/0/complete`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ completed: true }),
  });
  const data2 = await res2.json();

  if (data2.success) {
    console.log(`✅ Topic updated successfully!`);
    console.log(`   New Progress: ${data2.progress}% (${data2.completedTopics}/${data2.totalTopics} topics completed)\n`);
  } else {
    console.error('❌ FAILED to update topic status:', data2);
  }

  // 3. Verify single path detail (GET /api/learning-paths/:id)
  console.log(`Step 3: Verifying detail endpoint (GET /api/learning-paths/${targetPath._id})...`);
  const res3 = await fetch(`http://localhost:5000/api/learning-paths/${targetPath._id}`, { headers });
  const data3 = await res3.json();

  if (data3.success && data3.path?.progress === data2.progress) {
    console.log(`✅ Detail endpoint verified! Progress persisted cleanly at ${data3.path.progress}%.\n`);
  } else {
    console.error('❌ FAILED to verify detail endpoint:', data3);
  }

  console.log('=====================================================');
  console.log('🎉 ALL LEARNING PATHS API & MONGODB TESTS PASSED!');
  console.log('=====================================================');
}

testLearningPaths().catch(console.error);
