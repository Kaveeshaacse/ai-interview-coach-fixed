export const codingProblems = [
  // 🟢 EASY – 5 Questions (1 - 5)
  {
    id: 1,
    title: 'Reverse a String',
    difficulty: 'Easy',
    category: 'Strings',
    acceptance: '92%',
    description: `Given a string, reverse the string and print the result.`,
    inputFormat: `Single line containing a string.`,
    outputFormat: `Print the reversed string.`,
    examples: [
      { input: 'hello', output: 'olleh' },
      { input: 'coding', output: 'gnidoc' },
    ],
    templates: {
      Java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine();
        System.out.println(new StringBuilder(s).reverse().toString());
    }
}`,
      Python: `import sys
input_str = sys.stdin.read().strip()
print(input_str[::-1])`,
      JavaScript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(input.split('').reverse().join(''));`,
      'C++': `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    if (getline(cin, s)) {
        reverse(s.begin(), s.end());
        cout << s << endl;
    }
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: 'hello', expected: 'olleh' },
      { id: 2, input: 'java', expected: 'avaj' },
      { id: 3, input: 'abc', expected: 'cba' },
      { id: 4, input: '', expected: '' },
      { id: 5, input: 'a', expected: 'a' },
    ],
    hiddenTestCases: [
      { id: 6, input: '12345', expected: '54321', isHidden: true },
      { id: 7, input: 'race car', expected: 'rac ecar', isHidden: true },
    ],
  },
  {
    id: 2,
    title: 'Check Palindrome',
    difficulty: 'Easy',
    category: 'Strings',
    acceptance: '88%',
    description: `Given a string, determine whether it is a palindrome.

Print \`Palindrome\` if the string reads the same forward and backward. Otherwise, print \`Not Palindrome\`.`,
    inputFormat: `Single line containing a string.`,
    outputFormat: `Print "Palindrome" or "Not Palindrome".`,
    examples: [
      { input: 'madam', output: 'Palindrome' },
      { input: 'hello', output: 'Not Palindrome' },
    ],
    templates: {
      Java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine();
        String rev = new StringBuilder(s).reverse().toString();
        if (s.equals(rev)) {
            System.out.println("Palindrome");
        } else {
            System.out.println("Not Palindrome");
        }
    }
}`,
      Python: `import sys
s = sys.stdin.read().strip()
if s == s[::-1]:
    print("Palindrome")
else:
    print("Not Palindrome")`,
      JavaScript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(input === input.split('').reverse().join('') ? "Palindrome" : "Not Palindrome");`,
      'C++': `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    if (cin >> s) {
        string rev = s;
        reverse(rev.begin(), rev.end());
        cout << (s == rev ? "Palindrome" : "Not Palindrome") << endl;
    }
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: 'madam', expected: 'Palindrome' },
      { id: 2, input: 'racecar', expected: 'Palindrome' },
      { id: 3, input: 'hello', expected: 'Not Palindrome' },
      { id: 4, input: 'a', expected: 'Palindrome' },
      { id: 5, input: 'abba', expected: 'Palindrome' },
    ],
    hiddenTestCases: [
      { id: 6, input: 'level', expected: 'Palindrome', isHidden: true },
      { id: 7, input: 'coding', expected: 'Not Palindrome', isHidden: true },
    ],
  },
  {
    id: 3,
    title: 'Find the Largest Element',
    difficulty: 'Easy',
    category: 'Arrays',
    acceptance: '90%',
    description: `Given an array of integers, find and print the largest element.`,
    inputFormat: `Line 1: N (number of elements)
Line 2: N space-separated integers`,
    outputFormat: `Print a single integer representing the largest element.`,
    examples: [
      { input: '4\n1 5 3 2', output: '5' },
      { input: '3\n10 20 5', output: '20' },
    ],
    templates: {
      Java: `import java.util.Scanner;

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
      Python: `import sys
lines = sys.stdin.read().strip().splitlines()
if len(lines) >= 2:
    nums = list(map(int, lines[1].split()))
    print(max(nums))`,
      JavaScript: `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\r?\\n/);
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  console.log(Math.max(...nums));
}`,
      'C++': `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    int maxVal = -1e9;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (x > maxVal) maxVal = x;
    }
    cout << maxVal << endl;
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: '4\n1 5 3 2', expected: '5' },
      { id: 2, input: '3\n10 20 5', expected: '20' },
      { id: 3, input: '3\n-1 -5 -2', expected: '-1' },
      { id: 4, input: '1\n7', expected: '7' },
    ],
    hiddenTestCases: [
      { id: 5, input: '5\n10 25 7 40 15', expected: '40', isHidden: true },
      { id: 6, input: '4\n-5 -2 -10 -1', expected: '-1', isHidden: true },
    ],
  },
  {
    id: 4,
    title: 'Count Vowels',
    difficulty: 'Easy',
    category: 'Strings',
    acceptance: '85%',
    description: `Given a string, count the number of vowels (\`a, e, i, o, u\`) and print the count.

Treat uppercase and lowercase vowels as the same.`,
    inputFormat: `Single line containing a string.`,
    outputFormat: `Print the total count of vowels.`,
    examples: [
      { input: 'hello', output: '2' },
      { input: 'programming', output: '3' },
    ],
    templates: {
      Java: `import java.util.Scanner;

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
      Python: `import sys
s = sys.stdin.read().strip().lower()
vowels = "aeiou"
print(sum(1 for c in s if c in vowels))`,
      JavaScript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const matches = input.match(/[aeiou]/gi) || [];
console.log(matches.length);`,
      'C++': `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (cin >> s) {
        int count = 0;
        string vowels = "aeiouAEIOU";
        for (char c : s) if (vowels.find(c) != string::npos) count++;
        cout << count << endl;
    }
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: 'hello', expected: '2' },
      { id: 2, input: 'programming', expected: '3' },
      { id: 3, input: 'aeiou', expected: '5' },
      { id: 4, input: 'xyz', expected: '0' },
      { id: 5, input: 'Java', expected: '2' },
    ],
    hiddenTestCases: [
      { id: 6, input: 'computer', expected: '3', isHidden: true },
      { id: 7, input: 'EDUCATION', expected: '5', isHidden: true },
    ],
  },
  {
    id: 5,
    title: 'Sum of Array Elements',
    difficulty: 'Easy',
    category: 'Arrays',
    acceptance: '95%',
    description: `Given an array of integers, calculate and print the sum of all elements.`,
    inputFormat: `Line 1: N (number of elements)
Line 2: N space-separated integers`,
    outputFormat: `Print the total sum.`,
    examples: [
      { input: '5\n1 2 3 4 5', output: '15' },
      { input: '2\n10 20', output: '30' },
    ],
    templates: {
      Java: `import java.util.Scanner;

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
      Python: `import sys
lines = sys.stdin.read().strip().splitlines()
if len(lines) >= 2:
    nums = list(map(int, lines[1].split()))
    print(sum(nums))`,
      JavaScript: `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\r?\\n/);
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  console.log(nums.reduce((a, b) => a + b, 0));
}`,
      'C++': `#include <iostream>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    long long sum = 0;
    for (int i = 0; i < n; i++) {
        long long x; cin >> x; sum += x;
    }
    cout << sum << endl;
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: '5\n1 2 3 4 5', expected: '15' },
      { id: 2, input: '2\n10 20', expected: '30' },
      { id: 3, input: '1\n5', expected: '5' },
      { id: 4, input: '3\n-1 2 -3', expected: '-2' },
      { id: 5, input: '3\n0 0 0', expected: '0' },
    ],
    hiddenTestCases: [
      { id: 6, input: '4\n10 20 30 40', expected: '100', isHidden: true },
      { id: 7, input: '3\n-100 -200 -300', expected: '-600', isHidden: true },
    ],
  },

  // 🟡 MEDIUM – 5 Questions (6 - 10)
  {
    id: 6,
    title: 'Two Sum',
    difficulty: 'Medium',
    category: 'Arrays',
    acceptance: '65%',
    description: `Given an array of integers and a target value, find two different elements whose sum equals the target.

Print their **0-based indices** separated by a space.

Assume exactly one valid pair exists.`,
    inputFormat: `Line 1: N
Line 2: N space-separated integers
Line 3: Target value`,
    outputFormat: `Print the two 0-based indices separated by a space (e.g., "0 1").`,
    examples: [
      { input: '4\n2 7 11 15\n9', output: '0 1' },
      { input: '3\n3 2 4\n6', output: '1 2' },
    ],
    templates: {
      Java: `import java.util.Scanner;
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
      Python: `import sys
lines = [l.strip() for l in sys.stdin.read().strip().splitlines() if l.strip()]
if len(lines) >= 3:
    nums = list(map(int, lines[1].split()))
    target = int(lines[2])
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            break
        seen[num] = i`,
      JavaScript: `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\r?\\n/).filter(line => line.trim() !== '');
if (lines.length >= 3) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const target = Number(lines[2].trim());
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      console.log(\`\${map.get(diff)} \${i}\`);
      break;
    }
    map.set(nums[i], i);
  }
}`,
      'C++': `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target; cin >> target;
    unordered_map<int, int> mp;
    for (int i = 0; i < n; i++) {
        int diff = target - nums[i];
        if (mp.count(diff)) {
            cout << mp[diff] << " " << i << endl;
            break;
        }
        mp[nums[i]] = i;
    }
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: '4\n2 7 11 15\n9', expected: '0 1' },
      { id: 2, input: '3\n3 2 4\n6', expected: '1 2' },
      { id: 3, input: '2\n3 3\n6', expected: '0 1' },
    ],
    hiddenTestCases: [
      { id: 4, input: '5\n1 5 3 7 9\n12', expected: '1 3', isHidden: true },
      { id: 5, input: '4\n-1 -2 -3 -4\n-5', expected: '1 2', isHidden: true },
    ],
  },
  {
    id: 7,
    title: 'Find the Second Largest Element',
    difficulty: 'Medium',
    category: 'Arrays',
    acceptance: '60%',
    description: `Given an array of integers, find the **second-largest distinct element**.

If fewer than two distinct elements exist, print:
\`No second largest element\``,
    inputFormat: `Line 1: N
Line 2: N space-separated integers`,
    outputFormat: `Print the second largest distinct integer or "No second largest element".`,
    examples: [
      { input: '4\n10 5 8 20', output: '10' },
      { input: '3\n1 2 3', output: '2' },
    ],
    templates: {
      Java: `import java.util.Scanner;
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
            set.pollLast(); // Remove max
            System.out.println(set.last());
        }
    }
}`,
      Python: `import sys
lines = sys.stdin.read().strip().splitlines()
if len(lines) >= 2:
    nums = list(map(int, lines[1].split()))
    unique = sorted(list(set(nums)), reverse=True)
    if len(unique) < 2:
        print("No second largest element")
    else:
        print(unique[1])`,
      JavaScript: `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\r?\\n/);
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const unique = Array.from(new Set(nums)).sort((a, b) => b - a);
  if (unique.length < 2) {
    console.log("No second largest element");
  } else {
    console.log(unique[1]);
  }
}`,
      'C++': `#include <iostream>
#include <set>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    set<int> st;
    for (int i = 0; i < n; i++) {
        int x; cin >> x; st.insert(x);
    }
    if (st.size() < 2) {
        cout << "No second largest element" << endl;
    } else {
        auto it = st.rbegin();
        it++;
        cout << *it << endl;
    }
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: '4\n10 5 8 20', expected: '10' },
      { id: 2, input: '3\n1 2 3', expected: '2' },
      { id: 3, input: '3\n10 10 5', expected: '5' },
      { id: 4, input: '3\n-1 -5 -2', expected: '-2' },
    ],
    hiddenTestCases: [
      { id: 5, input: '3\n5 5 5', expected: 'No second largest element', isHidden: true },
      { id: 6, input: '1\n10', expected: 'No second largest element', isHidden: true },
    ],
  },
  {
    id: 8,
    title: 'Remove Duplicates from Array',
    difficulty: 'Medium',
    category: 'Arrays',
    acceptance: '75%',
    description: `Given an array, remove duplicate elements while preserving the order of their **first occurrence**.

Print the resulting array elements separated by a space.`,
    inputFormat: `Line 1: N
Line 2: N space-separated integers`,
    outputFormat: `Print space-separated unique elements in original order.`,
    examples: [
      { input: '3\n1 1 2', output: '1 2' },
      { input: '6\n1 1 1 2 2 3', output: '1 2 3' },
    ],
    templates: {
      Java: `import java.util.Scanner;
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
      Python: `import sys
lines = sys.stdin.read().strip().splitlines()
if len(lines) >= 2:
    nums = list(map(int, lines[1].split()))
    seen = set()
    res = []
    for n in nums:
        if n not in seen:
            seen.add(n)
            res.append(n)
    print(" ".join(map(str, res)))`,
      JavaScript: `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\r?\\n/);
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const seen = new Set();
  const res = [];
  for (const n of nums) {
    if (!seen.has(n)) {
      seen.add(n);
      res.push(n);
    }
  }
  console.log(res.join(' '));
}`,
      'C++': `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    unordered_set<int> seen;
    vector<int> res;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (!seen.count(x)) {
            seen.insert(x);
            res.push_back(x);
        }
    }
    for (int i = 0; i < res.size(); i++) {
        cout << res[i] << (i == res.size() - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: '3\n1 1 2', expected: '1 2' },
      { id: 2, input: '6\n1 1 1 2 2 3', expected: '1 2 3' },
      { id: 3, input: '3\n1 2 3', expected: '1 2 3' },
    ],
    hiddenTestCases: [
      { id: 4, input: '6\n1 2 2 3 1 4', expected: '1 2 3 4', isHidden: true },
      { id: 5, input: '5\n5 5 5 5 5', expected: '5', isHidden: true },
    ],
  },
  {
    id: 9,
    title: 'Count Frequency of Elements',
    difficulty: 'Medium',
    category: 'Arrays & Maps',
    acceptance: '70%',
    description: `Given an array of integers, print the frequency of each distinct element.

The elements must be printed in the order of their **first occurrence**, with each element and its frequency on a new line (formatted as \`element count\`).`,
    inputFormat: `Line 1: N
Line 2: N space-separated integers`,
    outputFormat: `Print each distinct element and its frequency on a new line.`,
    examples: [
      { input: '6\n1 1 2 2 2 3', output: '1 2\n2 3\n3 1' },
      { input: '5\n4 4 5 4 5', output: '4 3\n5 2' },
    ],
    templates: {
      Java: `import java.util.Scanner;
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
      Python: `import sys
lines = sys.stdin.read().strip().splitlines()
if len(lines) >= 2:
    nums = list(map(int, lines[1].split()))
    counts = {}
    order = []
    for n in nums:
        if n not in counts:
            counts[n] = 0
            order.append(n)
        counts[n] += 1
    for n in order:
        print(f"{n} {counts[n]}")`,
      JavaScript: `const fs = require('fs');
const lines = fs.readFileSync(0, 'utf-8').trim().split(/\\r?\\n/);
if (lines.length >= 2) {
  const nums = lines[1].trim().split(/\\s+/).map(Number);
  const map = new Map();
  for (const n of nums) map.set(n, (map.get(n) || 0) + 1);
  for (const [k, v] of map.entries()) console.log(\`\${k} \${v}\`);
}`,
      'C++': `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    unordered_map<int, int> counts;
    vector<int> order;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (counts[x] == 0) order.push_back(x);
        counts[x]++;
    }
    for (int val : order) {
        cout << val << " " << counts[val] << endl;
    }
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: '6\n1 1 2 2 2 3', expected: '1 2\n2 3\n3 1' },
      { id: 2, input: '5\n4 4 5 4 5', expected: '4 3\n5 2' },
    ],
    hiddenTestCases: [
      { id: 3, input: '6\n1 2 2 3 1 2', expected: '1 2\n2 3\n3 1', isHidden: true },
      { id: 4, input: '4\n10 20 30 40', expected: '10 1\n20 1\n30 1\n40 1', isHidden: true },
    ],
  },
  {
    id: 10,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Strings & Sliding Window',
    acceptance: '55%',
    description: `Given a string, find the length of the longest substring that contains no repeated characters.`,
    inputFormat: `Single line containing a string.`,
    outputFormat: `Print the maximum length of a non-repeating substring.`,
    examples: [
      { input: 'abcabcbb', output: '3' },
      { input: 'bbbbb', output: '1' },
      { input: 'pwwkew', output: '3' },
    ],
    templates: {
      Java: `import java.util.Scanner;
import java.util.Map;
import java.util.HashMap;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) {
            System.out.println(0);
            return;
        }
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
      Python: `import sys
s = sys.stdin.read().strip()
max_len = 0
start = 0
seen = {}
for end, char in enumerate(s):
    if char in seen and seen[char] >= start:
        start = seen[char] + 1
    seen[char] = end
    max_len = max(max_len, end - start + 1)
print(max_len)`,
      JavaScript: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();
let maxLen = 0, start = 0;
const map = new Map();
for (let end = 0; end < s.length; end++) {
  const char = s[end];
  if (map.has(char) && map.get(char) >= start) start = map.get(char) + 1;
  map.set(char, end);
  maxLen = Math.max(maxLen, end - start + 1);
}
console.log(maxLen);`,
      'C++': `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) { cout << 0 << endl; return 0; }
    int maxLen = 0, start = 0;
    unordered_map<char, int> mp;
    for (int end = 0; end < s.length(); end++) {
        char c = s[end];
        if (mp.count(c) && mp[c] >= start) start = mp[c] + 1;
        mp[c] = end;
        maxLen = max(maxLen, end - start + 1);
    }
    cout << maxLen << endl;
    return 0;
}`,
    },
    visibleTestCases: [
      { id: 1, input: 'abcabcbb', expected: '3' },
      { id: 2, input: 'bbbbb', expected: '1' },
      { id: 3, input: 'pwwkew', expected: '3' },
      { id: 4, input: '', expected: '0' },
      { id: 5, input: ' ', expected: '1' },
      { id: 6, input: 'au', expected: '2' },
      { id: 7, input: 'dvdf', expected: '3' },
    ],
    hiddenTestCases: [
      { id: 8, input: 'abcdef', expected: '6', isHidden: true },
      { id: 9, input: 'tmmzuxt', expected: '5', isHidden: true },
    ],
  },
];

export const getProblemById = (id) => codingProblems.find((p) => p.id === Number(id));

export default {
  codingProblems,
  getProblemById,
};
