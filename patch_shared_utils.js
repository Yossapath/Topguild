const fs = require('fs');

const authDungeonTxt = fs.readFileSync('auth_dungeon.js', 'utf8');
const IMPORT_LINE = `import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";`;

// Extract showGlobalDropdown function + autocomplete listeners block
// These are shared utilities used by ALL pages (dungeon name input, leave form, queue)
const autoStart = authDungeonTxt.indexOf('// Fix scrollbar clicking stealing focus');
const autoEnd   = authDungeonTxt.indexOf('// ==========================================\n  // ====== LEAVE SYSTEM', autoStart);

const sharedDropdownCode = authDungeonTxt.substring(autoStart, autoEnd);

// Also extract showGlobalDropdown function itself which appears slightly before
const dropdownFuncStart = authDungeonTxt.indexOf('function showGlobalDropdown(');
const dropdownFuncEnd = authDungeonTxt.indexOf('\n  // ==========================================\n  // ====== LEAVE SYSTEM');
const dropdownFuncCode = authDungeonTxt.substring(dropdownFuncStart, dropdownFuncEnd);

// Read current module_auth.js
let authModule = fs.readFileSync('module_auth.js', 'utf8');

// Append shared dropdown code at end (before last closing)
const appendCode = `
// ==========================================
// SHARED: Global Autocomplete Dropdown (used by Dungeon, Leave, Main Team pages)
// ==========================================
window.activeAutocompleteInput = null;

${dropdownFuncCode}

document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown) {
    dropdown.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
  }
});

document.addEventListener('input', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    if (typeof showGlobalDropdown === 'function') showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusin', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    if (typeof showGlobalDropdown === 'function') showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusout', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    setTimeout(() => {
      const dropdown = document.getElementById('globalMemberDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }, 150);
  }
});

window.addEventListener('scroll', (e) => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown && dropdown.style.display === 'block') {
    if (!dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  }
}, true);
`;

authModule += appendCode;
fs.writeFileSync('module_auth.js', authModule, 'utf8');

// Verify syntax check
const { execSync } = require('child_process');
try {
  execSync('node -c module_auth.js', { stdio: 'pipe' });
  console.log('module_auth.js: OK');
} catch(e) {
  console.error('module_auth.js SYNTAX ERROR:', e.stderr.toString());
}

try {
  execSync('node -c module_dungeon.js', { stdio: 'pipe' });
  console.log('module_dungeon.js: OK');
} catch(e) {
  console.error('module_dungeon.js SYNTAX ERROR:', e.stderr.toString());
}

try {
  execSync('node -c module_attendance.js', { stdio: 'pipe' });
  console.log('module_attendance.js: OK');
} catch(e) {
  console.error('module_attendance.js SYNTAX ERROR:', e.stderr.toString());
}

try {
  execSync('node -c module_leave.js', { stdio: 'pipe' });
  console.log('module_leave.js: OK');
} catch(e) {
  console.error('module_leave.js SYNTAX ERROR:', e.stderr.toString());
}

console.log('All modules verified.');
