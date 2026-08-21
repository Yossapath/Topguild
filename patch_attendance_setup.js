const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// Normalize line endings to LF for consistent matching
code = code.replace(/\r\n/g, '\n');

// Replace the old function
const oldFn = `async function setupAttendanceFirebase() {
  if (!window.db) return;
  try {
    const attRef = doc(window.db, 'guild_system', 'attendance');
    
    const snap = await getDoc(attRef);
    if (!snap.exists()) {
      await setDoc(attRef, { dates: {} });
    }

    unsubAttendanceListener = onSnapshot(attRef, (snapshot) => {
      if (snapshot.exists()) {
        attendanceData = snapshot.data();
        if (!attendanceData.dates) attendanceData.dates = {};
        renderAttendanceOptions();
      }
    });
  } catch(e) {
    console.error(e);
  }
}`;

const newFn = `async function setupAttendanceFirebase() {
  // STEP 1: Render from localStorage instantly (avoids blank screen on refresh)
  try {
    const localAtt = localStorage.getItem('guild_attendance_data');
    if (localAtt) {
      const parsed = JSON.parse(localAtt);
      if (parsed && parsed.dates && Object.keys(parsed.dates).length > 0) {
        attendanceData = parsed;
        setTimeout(renderAttendanceOptions, 50);
      }
    }
  } catch(e) {}

  // STEP 2: Firebase real-time listener (authoritative source)
  if (!window.db) return;
  try {
    const attRef = doc(window.db, 'guild_system', 'attendance');
    const snap = await getDoc(attRef);
    if (!snap.exists()) {
      await setDoc(attRef, { dates: {} });
    }
    unsubAttendanceListener = onSnapshot(attRef, (snapshot) => {
      if (snapshot.exists()) {
        attendanceData = snapshot.data();
        if (!attendanceData.dates) attendanceData.dates = {};
        // Keep localStorage in sync
        try { localStorage.setItem('guild_attendance_data', JSON.stringify(attendanceData)); } catch(e2) {}
        renderAttendanceOptions();
      }
    });
  } catch(e) {
    console.error('setupAttendanceFirebase error:', e);
  }
}
// CRITICAL: Export so app.js can call window.setupAttendanceFirebase()
window.setupAttendanceFirebase = setupAttendanceFirebase;`;

if (code.includes(oldFn)) {
  code = code.replace(oldFn, newFn);
  fs.writeFileSync('auth_dungeon.js', code, 'utf8');
  console.log('SUCCESS: patched setupAttendanceFirebase + window export');
} else {
  console.log('Exact match failed. Trying partial match...');
  // Try without trailing whitespace/newlines - look for the function by key lines
  const idx = code.indexOf('async function setupAttendanceFirebase()');
  if (idx === -1) { console.log('Function not found at all!'); process.exit(1); }
  
  // Find the end of the function (closing brace after catch block)
  let depth = 0;
  let start = idx;
  let inFunction = false;
  let end = -1;
  for (let i = start; i < code.length; i++) {
    if (code[i] === '{') { depth++; inFunction = true; }
    if (code[i] === '}') { depth--; }
    if (inFunction && depth === 0) { end = i + 1; break; }
  }
  
  if (end === -1) { console.log('Could not find end of function'); process.exit(1); }
  
  const before = code.slice(0, start);
  const after = code.slice(end);
  code = before + newFn + after;
  fs.writeFileSync('auth_dungeon.js', code, 'utf8');
  console.log('SUCCESS: patched via brace-counting method');
}
