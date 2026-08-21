const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const regex = /async function saveAttendanceState\(\) \{[\s\S]*?await setDoc\(attRef, attendanceData\);\s*\}/;

const newSave = `async function saveAttendanceState() {
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

if (regex.test(code)) {
    code = code.replace(regex, newSave);
    fs.writeFileSync('auth_dungeon.js', code, 'utf8');
    console.log('Fixed saveAttendanceState with regex');
} else {
    console.log('Regex did not match');
}
