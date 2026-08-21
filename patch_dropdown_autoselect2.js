const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const regex = /function renderAttendanceOptions\(\) \{[\s\S]*?window\.renderAttendanceTable\(\);\s*\}/;

const newFn = `function renderAttendanceOptions() {
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  
  const currentVal = select.value;
  const dates = Object.keys(attendanceData.dates).sort((a, b) => b.localeCompare(a));
  
  if (dates.length === 0) {
    select.innerHTML = '<option value="">-- ไม่มีข้อมูล --</option>';
  } else {
    select.innerHTML = '<option value="">-- กรุณาเลือกวันที่ --</option>' + dates.map(d => \`<option value="\${d}">\${d}</option>\`).join('');
    if (dates.includes(currentVal) && currentVal !== '') {
      select.value = currentVal;
    } else {
      select.value = dates[0]; // Auto-select the most recent date
    }
  }
  window.renderAttendanceTable();
}`;

if (regex.test(code)) {
    code = code.replace(regex, newFn);
    fs.writeFileSync('auth_dungeon.js', code, 'utf8');
    console.log('Fixed auto-select dropdown with regex');
} else {
    console.log('Regex did not match');
}
