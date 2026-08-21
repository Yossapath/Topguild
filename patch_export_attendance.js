const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Find and replace the old setupAttendanceFirebase function (no window export)
//    and add window.setupAttendanceFirebase = setupAttendanceFirebase; right after it.

// Check if already exported
if (code.includes('window.setupAttendanceFirebase = setupAttendanceFirebase')) {
  console.log('Already exported. No change needed.');
  process.exit(0);
}

// Add localStorage fast-render before Firebase listener inside setupAttendanceFirebase
const oldSetup = `async function setupAttendanceFirebase() {
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

const newSetup = `async function setupAttendanceFirebase() {
    // Load from localStorage FIRST for instant rendering
    try {
      const localAtt = localStorage.getItem('guild_attendance_data');
      if (localAtt) {
        const parsed = JSON.parse(localAtt);
        if (parsed && parsed.dates) {
          attendanceData = parsed;
          renderAttendanceOptions();
        }
      }
    } catch(e) {}

    if (!window.db) return;
    try {
      const attRef = doc(window.db, 'guild_system', 'attendance');
      
      const snap = await getDoc(attRef);
      if (!snap.exists()) {
        await setDoc(attRef, { dates: {} });
      }
  
      // Real-time Firebase listener (overwrites local cache)
      unsubAttendanceListener = onSnapshot(attRef, (snapshot) => {
        if (snapshot.exists()) {
          attendanceData = snapshot.data();
          if (!attendanceData.dates) attendanceData.dates = {};
          try { localStorage.setItem('guild_attendance_data', JSON.stringify(attendanceData)); } catch(e) {}
          renderAttendanceOptions();
        }
      });
    } catch(e) {
      console.error('setupAttendanceFirebase error:', e);
    }
  }
  // CRITICAL export - app.js calls window.setupAttendanceFirebase()
  window.setupAttendanceFirebase = setupAttendanceFirebase;`;

if (code.includes(oldSetup)) {
  code = code.replace(oldSetup, newSetup);
  fs.writeFileSync('auth_dungeon.js', code, 'utf8');
  console.log('Successfully patched setupAttendanceFirebase and added window export');
} else {
  // Fallback: just append the export line after the function
  const fallbackSearch = `  } catch(e) {
      console.error(e);
    }
  }
  
  async function saveAttendanceState()`;
  const fallbackReplace = `  } catch(e) {
      console.error('setupAttendanceFirebase error:', e);
    }
  }
  // CRITICAL export - app.js calls window.setupAttendanceFirebase()
  window.setupAttendanceFirebase = setupAttendanceFirebase;
  
  async function saveAttendanceState()`;
  
  if (code.includes(fallbackSearch)) {
    code = code.replace(fallbackSearch, fallbackReplace);
    fs.writeFileSync('auth_dungeon.js', code, 'utf8');
    console.log('Fallback patch applied: added window export');
  } else {
    console.log('ERROR: Could not find pattern to patch. Need manual inspection.');
  }
}
