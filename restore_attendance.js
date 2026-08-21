const fs = require('fs');

let attTxt = fs.readFileSync('module_attendance.js', 'utf8');

const start = attTxt.indexOf('window.renderAttendanceTable = function() {');
const end = attTxt.indexOf('window.updateAttendanceStatus = function');

if (start !== -1 && end !== -1) {
  const replacement = `window.renderAttendanceTable = function() {
  const tbody = document.getElementById('attendanceTbody');
  if (!tbody) return;
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  const selectedDate = select.value;
  
  if (!selectedDate) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกวันที่เพื่อดูข้อมูล</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
    if (summaryDiv) summaryDiv.innerHTML = '';
    const btnDelete = document.getElementById('btnDeleteAttendanceDate');
    if (btnDelete) btnDelete.style.display = 'none';
    return;
  }
  
  const btnDelete = document.getElementById('btnDeleteAttendanceDate');
  const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : ''; const isAdmin = window.isUserAdmin();
  if (btnDelete) btnDelete.style.display = (isAdmin && selectedDate) ? 'inline-block' : 'none';
  
  const dayData = attendanceData.dates[selectedDate] || {};
  
  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(job => {
      window.guildRoster[job].forEach(m => {
        allMembers.push({ name: m.name, job: job, power: m.power || 0 });
      });
    });
  }
  
  allMembers.sort((a,b) => b.power - a.power);
  
  const searchInput = document.getElementById('attendanceSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  let html = '';
  let joinedCount = 0;
  let leaveCount = 0;
  let absentCount = 0;
  let totalCount = 0;
  
  let idx = 1;
  allMembers.forEach(m => {
     if (query && !m.name.toLowerCase().includes(query)) return;
     const status = dayData[m.name] || 'none';
     totalCount++;
     if (status === 'attended') joinedCount++;
     else if (status === 'leave') leaveCount++;
     else absentCount++;
     
     const escapedName = window.escapeHtml ? window.escapeHtml(m.name) : m.name;
     html += \`<tr>
       <td class="cell-rank">\${idx++}</td>
       <td>\${escapedName}</td>
       <td style="text-align:center; font-weight: 600; color:\${window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : "var(--text-hi)"};">\${m.job}</td>
         <td style="text-align:center;"><small style="color:var(--text-lo)">\${m.power}</small></td>
       <td style="text-align:center;">
         <select class="form-control" style="width:100%; min-width:100px; padding:4px;" \${isAdmin ? '' : 'disabled'} onchange="updateAttendanceStatus('\${selectedDate}', '\${escapedName}', this.value)">
           <option value="none" \${!status || status === 'none' ? 'selected' : ''}>--- เว้นว่าง ---</option>
           <option value="attended" \${status === 'attended' ? 'selected' : ''}>เข้าร่วม</option>
           <option value="absent" \${status === 'absent' ? 'selected' : ''}>ขาด</option>
           <option value="leave" \${status === 'leave' ? 'selected' : ''}>ลา</option>
         </select>
       </td>
     </tr>\`;
  });
  
  if (html === '') {
    html = '<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--text-lo);">ไม่พบข้อมูลสมาชิก</td></tr>';
  }
  tbody.innerHTML = html;
  
  const summaryDiv = document.getElementById('attendanceSummary');
  if (summaryDiv) {
    summaryDiv.innerHTML = \`
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; text-align:center; margin-bottom: 10px; background:var(--bg-soft); padding: 12px; border-radius: 8px; border: 1px solid var(--line); font-size: 15px; font-weight: 600;">
        <span style="color:var(--text-hi);">ทั้งหมด : \${totalCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--ok);">มา : \${joinedCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--warn);">ลา : \${leaveCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--danger);">ขาด : \${absentCount} คน</span>
      </div>
    \`;
  }
};

`;
  attTxt = attTxt.substring(0, start) + replacement + attTxt.substring(end);
  fs.writeFileSync('module_attendance.js', attTxt, 'utf8');
  console.log('Restored attendance table logic perfectly!');
} else {
  console.log('Could not find boundaries for replacement.');
}
