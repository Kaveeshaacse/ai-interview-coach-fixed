import { executeCode } from './services/codeExecutionEngine.js';
import { codingProblems } from './utils/codingProblems.js';

async function verifyAll10Problems() {
  console.log('=====================================================');
  console.log('🧪 VERIFYING REUSABLE CODING JUDGE FOR ALL 10 PROBLEMS');
  console.log('=====================================================\n');

  // Correct Java solutions for all 10 problems
  const correctJavaSolutions = [
    // 1. Reverse String
    `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        System.out.println(new StringBuilder(sc.nextLine()).reverse().toString());
    }
}`,
    // 2. Check Palindrome
    `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine();
        String rev = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(rev) ? "Palindrome" : "Not Palindrome");
    }
}`,
    // 3. Find Largest
    `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int max = Integer.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            int val = sc.nextInt();
            if (val > max) max = val;
        }
        System.out.println(max);
    }
}`,
    // 4. Count Vowels
    `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) { System.out.println(0); return; }
        String s = sc.nextLine().toLowerCase();
        int count = 0;
        for (char c : s.toCharArray()) {
            if ("aeiou".indexOf(c) != -1) count++;
        }
        System.out.println(count);
    }
}`,
    // 5. Sum of Array Elements
    `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long sum = 0;
        for (int i = 0; i < n; i++) sum += sc.nextInt();
        System.out.println(sum);
    }
}`,
    // 6. Two Sum
    `import java.util.Scanner;
import java.util.Map;
import java.util.HashMap;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < n; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                System.out.println(map.get(diff) + " " + i);
                break;
            }
            map.put(nums[i], i);
        }
    }
}`,
    // 7. Find Second Largest
    `import java.util.Scanner;
import java.util.TreeSet;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        TreeSet<Integer> set = new TreeSet<>();
        for (int i = 0; i < n; i++) set.add(sc.nextInt());
        if (set.size() < 2) {
            System.out.println("No second largest element");
        } else {
            set.pollLast();
            System.out.println(set.last());
        }
    }
}`,
    // 8. Remove Duplicates
    `import java.util.Scanner;
import java.util.Set;
import java.util.LinkedHashSet;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Set<Integer> set = new LinkedHashSet<>();
        for (int i = 0; i < n; i++) set.add(sc.nextInt());
        StringBuilder sb = new StringBuilder();
        for (int val : set) sb.append(val).append(" ");
        System.out.println(sb.toString().trim());
    }
}`,
    // 9. Count Frequency
    `import java.util.Scanner;
import java.util.Map;
import java.util.LinkedHashMap;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Map<Integer, Integer> map = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            map.put(x, map.getOrDefault(x, 0) + 1);
        }
        for (Map.Entry<Integer, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + " " + entry.getValue());
        }
    }
}`,
    // 10. Longest Substring Without Repeating
    `import java.util.Scanner;
import java.util.Map;
import java.util.HashMap;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) { System.out.println(0); return; }
        String s = sc.nextLine();
        int maxLen = 0, start = 0;
        Map<Character, Integer> map = new HashMap<>();
        for (int end = 0; end < s.length(); end++) {
            char c = s.charAt(end);
            if (map.containsKey(c) && map.get(c) >= start) {
                start = map.get(c) + 1;
            }
            map.put(c, end);
            maxLen = Math.max(maxLen, end - start + 1);
        }
        System.out.println(maxLen);
    }
}`,
  ];

  // Intentionally incorrect solution (returns constant dummy output)
  const incorrectSolution = `public class Solution {
    public static void main(String[] args) {
        System.out.println("Incorrect Dummy Output");
    }
}`;

  let passedProblems = 0;

  console.log('--- PART 1: TESTING ALL 10 PROBLEMS WITH CORRECT SOLUTIONS ---\n');

  for (let i = 0; i < codingProblems.length; i++) {
    const prob = codingProblems[i];
    const code = correctJavaSolutions[i];
    const allTestCases = [...prob.visibleTestCases, ...prob.hiddenTestCases];

    const result = await executeCode(code, 'Java', allTestCases);

    console.log(`Q${prob.id} [${prob.difficulty}] ${prob.title}:`);
    console.log(`  Passed: ${result.passedCount}/${result.totalCount}`);
    console.log(`  Accuracy: ${result.accuracy}%`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Verdict: ${result.status === 'PASSED' ? '✅ PASSED 100%' : '❌ FAILED'}\n`);

    if (result.status === 'PASSED') passedProblems++;
  }

  console.log('--- PART 2: TESTING WITH INTENTIONALLY INCORRECT SOLUTION ---\n');

  const prob1 = codingProblems[0];
  const allTests1 = [...prob1.visibleTestCases, ...prob1.hiddenTestCases];
  const incorrectResult = await executeCode(incorrectSolution, 'Java', allTests1);

  console.log(`Testing Q1 with Intentionally Incorrect Solution:`);
  console.log(`  Passed: ${incorrectResult.passedCount}/${incorrectResult.totalCount}`);
  console.log(`  Failed: ${incorrectResult.failedCount}/${incorrectResult.totalCount}`);
  console.log(`  Accuracy: ${incorrectResult.accuracy}%`);
  console.log(`  Status: ${incorrectResult.status}`);
  console.log(`  Verdict: ${incorrectResult.status === 'FAILED' ? '✅ CORRECTLY MARKED AS FAILED (NOT SOLVED)' : '❌ ERROR: SHOWED PASSED'}\n`);

  console.log('=====================================================');
  console.log(`🎉 VERIFICATION RESULT: ${passedProblems}/10 PROBLEMS PASSED 100%!`);
  console.log('=====================================================');
}

verifyAll10Problems().catch(console.error);
