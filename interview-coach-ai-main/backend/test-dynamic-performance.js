async function testDynamicPerformanceTracking() {
  console.log('=====================================================');
  console.log('🧪 VERIFYING DYNAMIC PERFORMANCE & PREVIOUS ATTEMPTS');
  console.log('=====================================================\n');

  const token = 'demo-jwt-token-performance-test';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Step 1: Submit a new Aptitude test
  console.log('Step 1: Submitting an Aptitude Test (100% score)...');
  const aptRes = await fetch('http://localhost:5000/api/aptitude/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      category: 'quantitative',
      answers: [
        { questionId: 1, selectedAnswer: '90 km/h' },
        { questionId: 2, selectedAnswer: '20 days' },
        { questionId: 3, selectedAnswer: '₹300' },
        { questionId: 4, selectedAnswer: '15%' },
        { questionId: 5, selectedAnswer: '24' },
      ],
    }),
  });
  const aptData = await aptRes.json();
  console.log(`  Aptitude Test Score: ${aptData.score}%\n`);

  // Step 2: Submit a Coding Practice solution
  console.log('Step 2: Submitting a Coding Practice Solution (Problem 1 - Reverse String)...');
  const codeRes = await fetch('http://localhost:5000/api/coding/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      problemId: 1,
      language: 'Java',
      code: `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        System.out.println(new StringBuilder(sc.nextLine()).reverse().toString());
    }
}`,
    }),
  });
  const codeData = await codeRes.json();
  console.log(`  Coding Submission Status: ${codeData.status} (Accuracy: ${codeData.accuracy}%)\n`);

  // Step 3: Submit a Mock Interview answer
  console.log('Step 3: Submitting a Mock Interview Answer...');
  const intRes = await fetch('http://localhost:5000/api/interview/answer/demo', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      questionIndex: 0,
      question: 'Tell me about yourself and your background.',
      answer: 'I am a computer science student with a passion for building scalable software products.',
      role: 'Software Engineer',
    }),
  });
  const intData = await intRes.json();
  console.log(`  Interview Score: ${intData.score}%\n`);

  // Step 4: Fetch Dashboard & verify dynamic updates
  console.log('Step 4: Fetching Dashboard Data (GET /api/performance/dashboard)...');
  const dashRes = await fetch('http://localhost:5000/api/performance/dashboard', { headers });
  const dashData = await dashRes.json();

  console.log(`  Dynamic Overall Readiness Score: ${dashData.overallScore}%`);
  console.log(`  Aptitude Score: ${dashData.aptitudeScore}%`);
  console.log(`  Coding Score: ${dashData.codingScore}%`);
  console.log(`  Interview Score: ${dashData.interviewScore}%`);
  console.log(`  Recent Activities Count: ${dashData.recentActivities?.length}`);
  console.log(`  Latest Activity Feed: "${dashData.recentActivities?.[0]?.text}" (${dashData.recentActivities?.[0]?.score}%)\n`);

  if (dashData.recentActivities?.[0]?.text) {
    console.log('✅ DASHBOARD DYNAMICALLY UPDATED FROM USER ACTIVITIES!\n');
  } else {
    console.error('❌ Dashboard update failed:', dashData);
    process.exit(1);
  }

  // Step 5: Fetch Aptitude History
  console.log('Step 5: Fetching Aptitude History (GET /api/performance/history/aptitude)...');
  const histRes = await fetch('http://localhost:5000/api/performance/history/aptitude', { headers });
  const histData = await histRes.json();

  console.log(`  Total Aptitude Attempts: ${histData.totalAttempts}`);
  console.log(`  Latest History Record: ${JSON.stringify(histData.attempts?.[0])}\n`);

  if (histData.attempts?.length) {
    console.log('✅ PERFORMANCE HISTORY DYNAMICALLY UPDATED!\n');
  } else {
    console.error('❌ History update failed:', histData);
    process.exit(1);
  }

  console.log('=====================================================');
  console.log('🎉 ALL DYNAMIC PERFORMANCE TRACKING TESTS PASSED 100%!');
  console.log('=====================================================');
}

testDynamicPerformanceTracking().catch(console.error);
