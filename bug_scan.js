const fs = require('fs');
const files = ['module_auth.js','module_dungeon.js','module_attendance.js','module_leave.js','app.js'];

const issues = [];

files.forEach(f => {
  const txt = fs.readFileSync(f, 'utf8');

  // 1. onSnapshot listener leak check
  const snapshots = (txt.match(/onSnapshot\(/g) || []).length;
  const unsubVars = (txt.match(/unsub\w+\s*=/g) || []).length;
  const unsubLet = (txt.match(/let unsub\w+/g) || []).length;
  const totalUnsub = unsubVars + unsubLet;
  if (snapshots > 0 && totalUnsub < snapshots) {
    issues.push(`[LEAK] ${f} - onSnapshot: ${snapshots}, unsubscribe vars: ${totalUnsub} → POTENTIAL LISTENER LEAK`);
  }

  // 2. Security: plaintext passwords
  const pwdMatches = txt.match(/password:\s*'[^']+'/g);
  if (pwdMatches) {
    pwdMatches.forEach(m => issues.push(`[SECURITY-CRITICAL] ${f} - Hardcoded password in source: ${m}`));
  }

  // 3. Security: password in localStorage
  if (txt.includes('localStorage') && txt.includes('password')) {
    issues.push(`[SECURITY-HIGH] ${f} - localStorage may contain password field`);
  }

  // 4. Duplicate event listener guard
  const initFn = txt.match(/\(async function init\w+\(\)/g);
  const domCL = txt.match(/DOMContentLoaded/g);
  const addEv = txt.match(/addEventListener\(/g) || [];
  if (addEv.length > 3 && !domCL) {
    issues.push(`[DOUBLE-FIRE] ${f} - ${addEv.length} addEventListener calls without DOMContentLoaded guard — may fire multiple times`);
  }

  // 5. Missing null check on DOM elements
  const innerCalls = txt.match(/\w+\.innerHTML = /g) || [];
  if (innerCalls.length > 0) {
    issues.push(`[MEDIUM] ${f} - ${innerCalls.length} .innerHTML assignments — check null guards (if el)  before each`);
  }

  // 6. Check functions used in IIFE not exported to window
  const iife = txt.indexOf('(async function init');
  const windowFns = txt.match(/window\.(\w+)\s*=/g) || [];
  if (iife !== -1 && windowFns.length < 3) {
    issues.push(`[SCOPE] ${f} - Functions in IIFE may not be reachable from HTML onclick. window exports: ${windowFns.length}`);
  }

  // 7. Await without try-catch
  const awaitCalls = (txt.match(/await /g) || []).length;
  const tryCatch = (txt.match(/try\s*{/g) || []).length;
  if (awaitCalls > 5 && tryCatch < 2) {
    issues.push(`[HIGH] ${f} - ${awaitCalls} await calls but only ${tryCatch} try-catch blocks — unhandled promise rejections`);
  }
});

if (issues.length === 0) {
  console.log('No issues found.');
} else {
  issues.forEach(i => console.log(i));
}
