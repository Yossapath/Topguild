const fs = require('fs');
const authDungeonTxt = fs.readFileSync('auth_dungeon.js', 'utf8');

// Section boundaries
const authEnd   = authDungeonTxt.indexOf('// ====== DUNGEON SYSTEM');
const authSection   = authDungeonTxt.substring(0, authEnd);

const IMPORT_LINE = `import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";`;

const isUserAdminHelper = `
window.isUserAdmin = function() {
  const r = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : '';
  return r === 'admin' || r === 'owner' || r === 'หัวหน้ากิลด์';
};
`;

let authModule = `${IMPORT_LINE}
${isUserAdminHelper}
${authSection.replace(/^\s*\n*window\.isUserAdmin[\s\S]*?\};\s*\n/, '').replace(IMPORT_LINE, '')}
`;

// Extract dropdown code properly
const dropdownFuncStart = authDungeonTxt.indexOf('function showGlobalDropdown(');
// Use a reliable string to find the end of the dropdown function
const endStr = 'window.onDungeonQueueDragStart = function(event)';
const dropdownFuncEnd = authDungeonTxt.indexOf(endStr);

if (dropdownFuncStart !== -1 && dropdownFuncEnd !== -1) {
  let dropdownFuncCode = authDungeonTxt.substring(dropdownFuncStart, dropdownFuncEnd);
  // It contains some scrollbar fix code which we also want
  
  const appendCode = `
// ==========================================
// SHARED: Global Autocomplete Dropdown
// ==========================================
window.activeAutocompleteInput = null;

${dropdownFuncCode}

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
} else {
  console.log('Could not find dropdown function bounds.');
}

fs.writeFileSync('module_auth.js', authModule, 'utf8');
console.log('module_auth.js rebuilt correctly.');
