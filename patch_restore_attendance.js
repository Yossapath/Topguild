const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const renderAttendanceCode = `
window.renderAttendanceTable = function() {
  const tbody = document.getElementById('attTbody');
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
  const isAdmin = window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin';
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
  
  const searchInput = document.getElementById('attSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  let html = '';
  let joinedCount = 0;
  let leaveCount = 0;
  let absentCount = 0;
  let totalCount = 0;
  
  let idx = 1;
  allMembers.forEach(m => {
     if (query && !m.name.toLowerCase().includes(query)) return;
     const status = dayData[m.name] || 'absent';
     totalCount++;
     if (status === 'attended') joinedCount++;
     else if (status === 'leave') leaveCount++;
     else absentCount++;
     
     const escapedName = window.escapeHtml ? window.escapeHtml(m.name) : m.name;
     html += \`<tr>
       <td class="cell-rank">\${idx++}</td>
       <td>\${escapedName}</td>
       <td style="text-align:center;">\${m.job} <br><small style="color:var(--text-lo)">(\${m.power})</small></td>
       <td style="text-align:center;">
         <select class="form-control" style="width:100%; min-width:100px; padding:4px;" \${isAdmin ? '' : 'disabled'} onchange="updateAttendanceStatus('\${selectedDate}', '\${escapedName}', this.value)">
           <option value="absent" \${status === 'absent' ? 'selected' : ''}>❌ ขาด</option>
           <option value="attended" \${status === 'attended' ? 'selected' : ''}>✅ มา</option>
           <option value="leave" \${status === 'leave' ? 'selected' : ''}>🟡 ลา</option>
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
      <div style="display:flex; justify-content:space-between; margin-bottom: 10px; background:var(--bg-soft); padding: 10px; border-radius: 8px;">
        <span style="color:var(--text-hi);">ทั้งหมด: \${totalCount} คน</span>
        <span style="color:var(--ok);">✅ มา: \${joinedCount} คน</span>
        <span style="color:var(--warn);">🟡 ลา: \${leaveCount} คน</span>
        <span style="color:var(--danger);">❌ ขาด: \${absentCount} คน</span>
      </div>
    \`;
  }
};

window.updateAttendanceStatus = function(dateStr, name, status) {
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
  if (!attendanceData.dates[dateStr]) attendanceData.dates[dateStr] = {};
  attendanceData.dates[dateStr][name] = status;
  saveAttendanceState();
};
`;

if (!js.includes('window.renderAttendanceTable =')) {
  js = js.replace(/window\.renderAttendanceStats = function\(\) \{/, renderAttendanceCode + '\nwindow.renderAttendanceStats = function() {');
}
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Restored attendance table');
