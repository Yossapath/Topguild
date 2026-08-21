// ==========================================
// SPLIT SCRIPT: Reads auth_dungeon.js and produces 3 module files
// ==========================================
const fs = require('fs');

const txt = fs.readFileSync('auth_dungeon.js', 'utf8');

const IMPORT_LINE = `import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";`;

// Section boundaries
const authEnd   = txt.indexOf('// ====== DUNGEON SYSTEM');
const dungEnd   = txt.indexOf('// ====== ATTENDANCE SYSTEM');
const attEnd    = txt.indexOf('// ====== LEAVE SYSTEM');

// Extract sections
// Auth (shared: authentication helpers, login, register, role, roster setup, drag-drop globals, showGlobalDropdown)
const authSection   = txt.substring(0, authEnd);
// Dungeon section
const dungSection   = txt.substring(authEnd, dungEnd);
// Attendance section
const attSection    = txt.substring(dungEnd, attEnd);
// Leave section
const leaveSection  = txt.substring(attEnd);

// Shared isUserAdmin helper
const isUserAdminHelper = `
window.isUserAdmin = function() {
  const r = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : '';
  return r === 'admin' || r === 'owner' || r === 'หัวหน้ากิลด์';
};
`;

// ---- module_auth.js (authentication + shared utilities: login, register, showGlobalDropdown, etc.) ----
const authModule = `${IMPORT_LINE}
${isUserAdminHelper}
${authSection.replace(/^\s*\n*window\.isUserAdmin[\s\S]*?\};\s*\n/, '').replace(IMPORT_LINE, '')}
`;

// ---- module_dungeon.js ----
const dungeonModule = `${IMPORT_LINE}
// ==========================================
// MODULE: DUNGEON SYSTEM
// ==========================================
(async function initDungeonModule() {
  try {
    ${dungSection}
    // Initialize
    if (typeof setupDungeonFirebase === 'function' && !window._dungeonReady) {
      window._dungeonReady = true;
      await setupDungeonFirebase();
    }
  } catch(err) {
    console.error('[Module Dungeon] ระบบดันเจี้ยนมีปัญหา:', err);
    const area = document.getElementById('dungeonTeamsArea');
    if (area) area.innerHTML = '<div style="padding:24px;text-align:center;color:var(--danger);">ระบบดันเจี้ยนขัดข้อง กรุณารีเฟรชหน้าจอ</div>';
  }
})();
`;

// ---- module_attendance.js ----
const attendanceModule = `${IMPORT_LINE}
// ==========================================
// MODULE: ATTENDANCE SYSTEM
// ==========================================
(async function initAttendanceModule() {
  try {
    ${attSection}
    if (typeof setupAttendanceFirebase === 'function' && !window._attendanceReady) {
      window._attendanceReady = true;
      await setupAttendanceFirebase();
    }
  } catch(err) {
    console.error('[Module Attendance] ระบบเช็คชื่อมีปัญหา:', err);
    const area = document.getElementById('attendanceTbody');
    if (area) area.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--danger);">ระบบเช็คชื่อขัดข้อง กรุณารีเฟรชหน้าจอ</td></tr>';
  }
})();
`;

// ---- module_leave.js ----
const leaveModule = `${IMPORT_LINE}
// ==========================================
// MODULE: LEAVE SYSTEM
// ==========================================
(async function initLeaveModule() {
  try {
    ${leaveSection}
    if (typeof setupLeaveFirebase === 'function' && !window._leaveReady) {
      window._leaveReady = true;
      await setupLeaveFirebase();
    }
  } catch(err) {
    console.error('[Module Leave] ระบบแจ้งลามีปัญหา:', err);
  }
})();
`;

fs.writeFileSync('module_auth.js', authModule, 'utf8');
fs.writeFileSync('module_dungeon.js', dungeonModule, 'utf8');
fs.writeFileSync('module_attendance.js', attendanceModule, 'utf8');
fs.writeFileSync('module_leave.js', leaveModule, 'utf8');

console.log('Split complete:');
console.log('  module_auth.js:', Math.round(authModule.length/1024), 'KB');
console.log('  module_dungeon.js:', Math.round(dungeonModule.length/1024), 'KB');
console.log('  module_attendance.js:', Math.round(attendanceModule.length/1024), 'KB');
console.log('  module_leave.js:', Math.round(leaveModule.length/1024), 'KB');
