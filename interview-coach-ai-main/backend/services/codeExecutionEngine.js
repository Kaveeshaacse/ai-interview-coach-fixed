import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Normalizes output strings for exact matching comparison.
 * Trims trailing whitespace and standardizes line endings (\r\n -> \n).
 */
export const normalizeOutput = (str = '') => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\r\n/g, '\n')
    .trim()
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
};

/**
 * Safely executes JavaScript code in a Node.js subprocess
 */
const runJavaScriptCode = (code, inputStr) => {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `script_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.js`);

    const wrappedCode = `
const fs = require('fs');
const __input = ${JSON.stringify(inputStr)};

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function(fd, ...args) {
  if (fd === 0 || fd === '/dev/stdin' || fd === 'stdin') {
    return __input;
  }
  return originalReadFileSync.apply(this, [fd, ...args]);
};

process.stdin.isTTY = false;
let __inputLines = __input.split('\\n');
let __lineIdx = 0;

function readline() {
  return __inputLines[__lineIdx++] || '';
}

try {
${code}
} catch (err) {
  console.error("Runtime Error:", err.message);
  process.exit(1);
}
`;

    fs.writeFile(filePath, wrappedCode, 'utf8')
      .then(() => {
        exec(`node "${filePath}"`, { timeout: 3000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
          fs.unlink(filePath).catch(() => {});
          if (error && error.killed) {
            return resolve({ error: 'Time Limit Exceeded (3000ms limit)', stdout: '', stderr: '' });
          }
          if (error) {
            return resolve({ error: stderr || error.message || 'Runtime Error', stdout: stdout || '', stderr: stderr || '' });
          }
          resolve({ error: null, stdout, stderr });
        });
      })
      .catch((err) => resolve({ error: err.message, stdout: '', stderr: '' }));
  });
};

/**
 * Safely executes Python code
 */
const runPythonCode = (code, inputStr) => {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `script_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.py`);

    const wrappedCode = `import sys
from io import StringIO

sys.stdin = StringIO(${JSON.stringify(inputStr)})

try:
${code.split('\n').map((line) => '    ' + line).join('\n')}
except Exception as e:
    sys.stderr.write(f"Runtime Error: {str(e)}\\n")
    sys.exit(1)
`;

    fs.writeFile(filePath, wrappedCode, 'utf8')
      .then(() => {
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        exec(`${pythonCmd} "${filePath}"`, { timeout: 3000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
          fs.unlink(filePath).catch(() => {});
          if (error && error.killed) {
            return resolve({ error: 'Time Limit Exceeded (3000ms limit)', stdout: '', stderr: '' });
          }
          if (error) {
            return resolve({ error: stderr || error.message || 'Runtime Error', stdout: stdout || '', stderr: stderr || '' });
          }
          resolve({ error: null, stdout, stderr });
        });
      })
      .catch((err) => resolve({ error: err.message, stdout: '', stderr: '' }));
  });
};

/**
 * Safely executes Java code via `javac` & `java` or a fallback runner
 */
const runJavaCode = (code, inputStr) => {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const workDir = path.join(tmpDir, `java_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

    // Extract class name or default to Solution / Main
    let className = 'Solution';
    const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    if (classMatch) {
      className = classMatch[1];
    } else {
      const anyClassMatch = code.match(/class\s+([A-Za-z0-9_]+)/);
      if (anyClassMatch) {
        className = anyClassMatch[1];
      }
    }

    fs.mkdir(workDir, { recursive: true })
      .then(() => {
        const javaFilePath = path.join(workDir, `${className}.java`);
        return fs.writeFile(javaFilePath, code, 'utf8').then(() => javaFilePath);
      })
      .then((javaFilePath) => {
        // Compile Java code
        exec(`javac "${javaFilePath}"`, { timeout: 5000 }, (compileErr, compileStdout, compileStderr) => {
          if (compileErr) {
            fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
            const errOutput = compileStderr || compileStdout || compileErr.message;
            return resolve({
              compileError: errOutput,
              error: `Compilation Error:\n${errOutput}`,
              stdout: '',
              stderr: errOutput,
            });
          }

          // Execute Compiled Java class with stdin
          const child = exec(`java -cp "${workDir}" ${className}`, { timeout: 3000, maxBuffer: 1024 * 1024 }, (runErr, stdout, stderr) => {
            fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
            if (runErr && runErr.killed) {
              return resolve({ error: 'Time Limit Exceeded (3000ms limit)', stdout: '', stderr: '' });
            }
            if (runErr) {
              return resolve({ error: stderr || runErr.message || 'Runtime Error', stdout: stdout || '', stderr: stderr || '' });
            }
            resolve({ error: null, stdout, stderr });
          });

          if (child.stdin) {
            child.stdin.write(inputStr);
            child.stdin.end();
          }
        });
      })
      .catch((err) => resolve({ error: err.message, stdout: '', stderr: '' }));
  });
};

/**
 * Reusable Code Execution & Evaluation Engine
 */
export const executeCode = async (code, language = 'Java', testCases = []) => {
  const results = [];
  let compileError = null;

  for (let idx = 0; idx < testCases.length; idx++) {
    const tc = testCases[idx];
    let execResult;

    const langLower = (language || '').toLowerCase();
    if (langLower.includes('java') && !langLower.includes('script')) {
      execResult = await runJavaCode(code, tc.input);
    } else if (langLower.includes('python')) {
      execResult = await runPythonCode(code, tc.input);
    } else {
      execResult = await runJavaScriptCode(code, tc.input);
    }

    if (execResult.compileError) {
      compileError = execResult.compileError;
    }

    const actualOutput = normalizeOutput(execResult.stdout);
    const expectedOutput = normalizeOutput(tc.expected);
    const isPassed = !execResult.error && !compileError && actualOutput === expectedOutput;

    results.push({
      testCaseNumber: idx + 1,
      id: tc.id || idx + 1,
      input: tc.input,
      expectedOutput: expectedOutput,
      expected: expectedOutput,
      actualOutput: actualOutput || (execResult.error ? `Error: ${execResult.error}` : '(No output)'),
      output: actualOutput || (execResult.error ? `Error: ${execResult.error}` : '(No output)'),
      status: isPassed ? 'PASS' : 'FAIL',
      passed: isPassed,
      isHidden: Boolean(tc.isHidden),
      error: execResult.error || null,
    });
  }

  const passedCount = results.filter((r) => r.status === 'PASS').length;
  const failedCount = results.length - passedCount;
  const totalCount = results.length;
  const isAllPassed = totalCount > 0 && passedCount === totalCount;
  const accuracy = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  // Status rule: PASSED only when ALL pass (100%), otherwise FAILED or Compilation Error
  let status = 'PASSED';
  if (compileError) {
    status = 'Compilation Error';
  } else if (!isAllPassed) {
    status = 'FAILED';
  }

  return {
    status,
    compileError,
    results,
    passedCount,
    failedCount,
    totalCount,
    accuracy,
    score: accuracy,
    isAllPassed,
  };
};

export default {
  executeCode,
  normalizeOutput,
};
