const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const oldRenderOps = `    if (dates.length === 0) {
      select.innerHTML = '<option value="">-- ไม่มีข้อมูล --</option>';
    } else {
      select.innerHTML = '<option value="">-- กรุณาเลือกวันที่ --</option>' + dates.map(d => \`<option value="\${d}">\${d}</option>\`).join('');
      if (dates.includes(currentVal)) {
        select.value = currentVal;
      }
    }`;

const newRenderOps = `    if (dates.length === 0) {
      select.innerHTML = '<option value="">-- ไม่มีข้อมูล --</option>';
    } else {
      select.innerHTML = '<option value="">-- กรุณาเลือกวันที่ --</option>' + dates.map(d => \`<option value="\${d}">\${d}</option>\`).join('');
      if (dates.includes(currentVal) && currentVal !== '') {
        select.value = currentVal;
      } else {
        // Auto-select the most recent date (dates are sorted descending)
        select.value = dates[0];
      }
    }`;

if (code.includes(oldRenderOps)) {
    code = code.replace(oldRenderOps, newRenderOps);
    fs.writeFileSync('auth_dungeon.js', code, 'utf8');
    console.log('Fixed auto-select dropdown');
} else {
    console.log('Could not find renderAttendanceOptions string match.');
}
