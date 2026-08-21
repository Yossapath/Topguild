const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Save and load from localStorage as fallback
const setupRegex = /async function setupAttendanceFirebase\(\) \{[\s\S]*?unsubAttendanceListener = onSnapshot[\s\S]*?renderAttendanceOptions\(\);\s*\}\);\s*\} catch\(e\) \{\s*console\.error\(e\);\s*\}\s*\}/;

const newSetup = `async function setupAttendanceFirebase() {
  // Load from local storage first as fallback
  const localAtt = localStorage.getItem('guild_attendance_data');
  if (localAtt) {
    try {
      attendanceData = JSON.parse(localAtt);
      if (!attendanceData.dates) attendanceData.dates = {};
      renderAttendanceOptions();
    } catch(e) {}
  }

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
        localStorage.setItem('guild_attendance_data', JSON.stringify(attendanceData));
        renderAttendanceOptions();
      }
    });
  } catch(e) {
    console.error(e);
  }
}`;

code = code.replace(setupRegex, newSetup);

// 2. Modify saveAttendanceState to also save to localStorage
const saveRegex = /async function saveAttendanceState\(\) \{[\s\S]*?console\.log\('Saved attendance data to Firebase successfully'\);[\s\S]*?\}\s*\}/;

const newSave = `async function saveAttendanceState() {
  localStorage.setItem('guild_attendance_data', JSON.stringify(attendanceData));
  if (!window.db) return;
  try {
    const attRef = doc(window.db, 'guild_system', 'attendance');
    await setDoc(attRef, attendanceData, { merge: true });
    console.log('Saved attendance data to Firebase successfully');
  } catch(err) {
    console.error('Failed to save attendance data:', err);
    window.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล (เช็คสิทธิ์ Database)', 'error');
  }
}`;

code = code.replace(saveRegex, newSave);

// 3. Save last selected date to localStorage and restore it
const renderOptionsRegex = /function renderAttendanceOptions\(\) \{[\s\S]*?window\.renderAttendanceTable\(\);\s*\}/;

const newRenderOptions = `function renderAttendanceOptions() {
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  
  const currentVal = select.value;
  const dates = Object.keys(attendanceData.dates).sort((a, b) => b.localeCompare(a));
  
  if (dates.length === 0) {
    select.innerHTML = '<option value="">-- ไม่มีข้อมูล --</option>';
  } else {
    select.innerHTML = '<option value="">-- กรุณาเลือกวันที่ --</option>' + dates.map(d => \`<option value="\${d}">\${d}</option>\`).join('');
    
    const lastSelected = localStorage.getItem('guild_attendance_last_date');
    
    if (dates.includes(currentVal) && currentVal !== '') {
      select.value = currentVal;
    } else if (lastSelected && dates.includes(lastSelected)) {
      select.value = lastSelected;
    } else {
      select.value = dates[0];
    }
  }
  
  // Attach onchange to save to localStorage
  select.onchange = function() {
    localStorage.setItem('guild_attendance_last_date', this.value);
    window.renderAttendanceTable();
  };
  
  window.renderAttendanceTable();
}`;

code = code.replace(renderOptionsRegex, newRenderOptions);

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('Added localStorage fallback and state memory');
