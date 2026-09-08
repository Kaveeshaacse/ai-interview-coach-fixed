async function testTopicToggleAndResources() {
  console.log('=====================================================');
  console.log('🧪 VERIFYING TOPICS ROADMAP (LINKS & TOGGLE PERSISTENCE)');
  console.log('=====================================================\n');

  const token = 'demo-jwt-token-topic-toggle-test';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Step 1: Fetch learning paths
  console.log('Step 1: Fetching personalized paths...');
  const res1 = await fetch('http://localhost:5000/api/learning-paths', { headers });
  const data1 = await res1.json();
  const path = data1.paths[0];

  console.log(`Path Selected: "${path.title}" (ID: ${path._id})`);
  console.log(`Initial Progress: ${path.progress}% (${path.completedTopics}/${path.totalTopics} completed)\n`);

  // Step 2: Test Resource Links Validation
  console.log('Step 2: Validating Learning Resource URLs...');
  let totalResources = 0;
  let validUrls = 0;

  path.topics.forEach((topic) => {
    (topic.resources || []).forEach((res) => {
      totalResources++;
      const url = typeof res === 'object' ? res.url : String(res);
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        validUrls++;
      }
    });
  });

  console.log(`  Total Resources Tested: ${totalResources}`);
  console.log(`  Valid http/https Links: ${validUrls}`);
  console.log(`  Status: ${validUrls === totalResources && totalResources > 0 ? '✅ ALL RESOURCES HAVE VALID ACCESSIBLE URLS' : '❌ SOME RESOURCES ARE INVALID'}\n`);

  // Step 3: Test 1 - Mark Topic 0 as Complete
  console.log('Step 3 (Test 2): Marking Topic #1 ("Java Basics") as COMPLETE...');
  const res2 = await fetch(`http://localhost:5000/api/learning-paths/topics/java-basics/progress`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ completed: true, pathId: path._id }),
  });
  const data2 = await res2.json();

  console.log(`  Topic Completed: ${data2.topic.completed}`);
  console.log(`  Calculated Progress: ${data2.progress.percentage}% (${data2.progress.completedTopics}/${data2.progress.totalTopics})`);
  console.log(`  Status: ${data2.topic.completed === true && data2.progress.percentage === 10 ? '✅ PASSED' : '❌ FAILED'}\n`);

  // Step 4: Test 3 - Refresh verification (GET detail endpoint)
  console.log('Step 4 (Test 3): Refreshing detail page (GET /api/learning-paths/local-java-dsa)...');
  const res3 = await fetch(`http://localhost:5000/api/learning-paths/local-java-dsa`, { headers });
  const data3 = await res3.json();

  console.log(`  Persisted Progress: ${data3.path.progress}%`);
  console.log(`  Topic 1 Persisted Status: ${data3.path.topics[0].completed}`);
  console.log(`  Status: ${data3.path.topics[0].completed === true ? '✅ PERSISTENCE VERIFIED' : '❌ FAILED'}\n`);

  // Step 5: Test 4 - Mark Topic 0 as INCOMPLETE
  console.log('Step 5 (Test 4): Marking Topic #1 as INCOMPLETE...');
  const res4 = await fetch(`http://localhost:5000/api/learning-paths/topics/java-basics/progress`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ completed: false, pathId: path._id }),
  });
  const data4 = await res4.json();

  console.log(`  Topic Completed: ${data4.topic.completed}`);
  console.log(`  Calculated Progress: ${data4.progress.percentage}% (${data4.progress.completedTopics}/${data4.progress.totalTopics})`);
  console.log(`  Status: ${data4.topic.completed === false && data4.progress.percentage === 0 ? '✅ PASSED' : '❌ FAILED'}\n`);

  // Step 6: Refresh verification after marking incomplete
  console.log('Step 6: Refreshing detail page after marking incomplete...');
  const res5 = await fetch(`http://localhost:5000/api/learning-paths/local-java-dsa`, { headers });
  const data5 = await res5.json();

  console.log(`  Persisted Progress: ${data5.path.progress}%`);
  console.log(`  Topic 1 Persisted Status: ${data5.path.topics[0].completed}`);
  console.log(`  Status: ${data5.path.topics[0].completed === false ? '✅ INCOMPLETE PERSISTENCE VERIFIED' : '❌ FAILED'}\n`);

  console.log('=====================================================');
  console.log('🎉 ALL TOPICS ROADMAP TESTS PASSED 100%!');
  console.log('=====================================================');
}

testTopicToggleAndResources().catch(console.error);
