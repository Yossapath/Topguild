const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// We will inject autoGenerateAttendance next to createAttendanceDate
const autoAttCode = `
window.autoGenerateAttendance = function() {
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
  if (!confirm('ต้องการสร้างตารางเช็คชื่อสำหรับ อังคาร พฤหัส อาทิตย์ ของสัปดาห์นี้อัตโนมัติหรือไม่?')) return;
  
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  
  // Calculate Monday of this week
  const monday = new Date(today);
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  monday.setDate(today.getDate() + diffToMonday);
  
  const getFmtDate = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const datesToCreate = [];

  // Tuesday
  const tuesday = new Date(monday);
  tuesday.setDate(monday.getDate() + 1);
  datesToCreate.push(getFmtDate(tuesday) + " (อังคาร รอบ 1)");
  datesToCreate.push(getFmtDate(tuesday) + " (อังคาร รอบ 2)");

  // Thursday
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  datesToCreate.push(getFmtDate(thursday) + " (พฤหัสบดี)");

  // Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  datesToCreate.push(getFmtDate(sunday) + " (อาทิตย์)");

  let createdCount = 0;
  datesToCreate.forEach(d => {
    if (!attendanceData.dates[d]) {
      attendanceData.dates[d] = {};
      createdCount++;
    }
  });

  if (createdCount > 0) {
    saveAttendanceState();
    window.showToast('สร้างตารางอัตโนมัติสำเร็จ!', 'success');
    setTimeout(renderAttendanceOptions, 500);
  } else {
    window.showToast('ตารางสัปดาห์นี้ถูกสร้างไว้แล้ว', 'warning');
  }
};
`;

if (!code.includes('window.autoGenerateAttendance')) {
  code = code.replace(/window\.createAttendanceDate = function\(\) \{/, autoAttCode + '\nwindow.createAttendanceDate = function() {');
  fs.writeFileSync('auth_dungeon.js', code, 'utf8');
  console.log('Added autoGenerateAttendance');
} else {
  console.log('autoGenerateAttendance already exists');
}
