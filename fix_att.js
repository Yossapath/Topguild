const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

js = js.replace(
`  if (!selectedDate) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกหรือสร้างวันที่เพื่อดูข้อมูล</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
  const btnDelete = document.getElementById('btnDeleteAttendanceDate');
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  if (btnDelete) btnDelete.style.display = (isAdmin && selectedDate) ? 'inline-block' : 'none';
    if (summaryDiv) summaryDiv.innerHTML = '';
    return;
  }`,
`  if (!selectedDate) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกหรือสร้างวันที่เพื่อดูข้อมูล</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
    if (summaryDiv) summaryDiv.innerHTML = '';
    const btnDelete = document.getElementById('btnDeleteAttendanceDate');
    if (btnDelete) btnDelete.style.display = 'none';
    return;
  }`
);

// Add the logic to the correct place (after `const isAdmin = window.currentUser && window.currentUser.role === 'admin';` which is around line 802)
js = js.replace(
`  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  const records = attendanceData.dates[selectedDate] || {};`,
`  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  const btnDelete = document.getElementById('btnDeleteAttendanceDate');
  if (btnDelete) btnDelete.style.display = isAdmin ? 'inline-block' : 'none';
  const records = attendanceData.dates[selectedDate] || {};`
);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Fixed button display');
