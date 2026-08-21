const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const s1 = `window.renderAttendanceTable = function() {`;
const r1 = `
window.switchAttTab = function(tab) {
  const dailyBtn = document.getElementById('btnAttTabDaily');
  const statsBtn = document.getElementById('btnAttTabStats');
  const dailyView = document.getElementById('attDailyView');
  const statsView = document.getElementById('attStatsView');
  
  if (tab === 'daily') {
    if (dailyBtn) dailyBtn.classList.add('active');
    if (statsBtn) statsBtn.classList.remove('active');
    if (dailyView) dailyView.style.display = 'block';
    if (statsView) statsView.style.display = 'none';
    window.renderAttendanceTable();
  } else {
    if (dailyBtn) dailyBtn.classList.remove('active');
    if (statsBtn) statsBtn.classList.add('active');
    if (dailyView) dailyView.style.display = 'none';
    if (statsView) statsView.style.display = 'block';
    window.renderAttendanceStats();
  }
};

window.deleteAttendanceDate = function() {
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  const dateStr = select.value;
  if (!dateStr) return;
  
  if (confirm('คุณต้องการลบข้อมูลเช็คชื่อของวันที่ ' + dateStr + ' ใช่หรือไม่?')) {
    delete attendanceData.dates[dateStr];
    saveAttendanceState();
    select.value = '';
    renderAttendanceOptions();
  }
};

window.renderAttendanceStats = function() {
  const tbody = document.getElementById('attStatsTbody');
  if (!tbody) return;
  
  const searchInput = document.getElementById('attStatsSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  // Aggregate stats
  const statsMap = {}; // { name: { joined:0, leave:0, absent:0 } }
  const dates = Object.keys(attendanceData.dates);
  
  dates.forEach(d => {
    const dayData = attendanceData.dates[d];
    Object.keys(dayData).forEach(name => {
      const status = dayData[name];
      if (!statsMap[name]) statsMap[name] = { joined: 0, leave: 0, absent: 0 };
      if (status === 'attended') statsMap[name].joined++;
      if (status === 'leave') statsMap[name].leave++;
      if (status === 'absent') statsMap[name].absent++;
    });
  });
  
  // Prepare member list from guildRoster to show everyone (or those with stats)
  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(j => {
      allMembers.push(...window.guildRoster[j]);
    });
  }
  
  // If a member has no record, they will have 0/0/0
  let rowsHtml = '';
  let idx = 1;
  allMembers.sort((a,b) => a.name.localeCompare(b.name)).forEach(m => {
    const nameLower = m.name.toLowerCase();
    if (query && !nameLower.includes(query)) return;
    
    const st = statsMap[m.name] || { joined: 0, leave: 0, absent: 0 };
    rowsHtml += '<tr>';
    rowsHtml += '<td class="cell-rank">' + (idx++) + '</td>';
    rowsHtml += '<td>' + (window.escapeHtml ? window.escapeHtml(m.name) : m.name) + '</td>';
    rowsHtml += '<td style="text-align:center; font-weight:600; color:var(--ok);">' + st.joined + '</td>';
    rowsHtml += '<td style="text-align:center; font-weight:600; color:var(--warn);">' + st.leave + '</td>';
    rowsHtml += '<td style="text-align:center; font-weight:600; color:var(--danger);">' + st.absent + '</td>';
    rowsHtml += '</tr>';
  });
  
  if (rowsHtml === '') {
    rowsHtml = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">ไม่พบข้อมูล</td></tr>';
  }
  
  tbody.innerHTML = rowsHtml;
};

window.renderAttendanceTable = function() {`;

js = js.replace(s1, r1);

// Add delete button visibility toggle
const s2 = `const summaryDiv = document.getElementById('attendanceSummary');`;
const r2 = `const summaryDiv = document.getElementById('attendanceSummary');
  const btnDelete = document.getElementById('btnDeleteAttendanceDate');
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  if (btnDelete) btnDelete.style.display = (isAdmin && selectedDate) ? 'inline-block' : 'none';`;

js = js.replace(s2, r2);

// Also hide btnDelete if no date is selected
const s3 = `tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกหรือสร้างวันที่เพื่อดูข้อมูล</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
    if (summaryDiv) summaryDiv.innerHTML = '';
    return;`;
const r3 = `tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกหรือสร้างวันที่เพื่อดูข้อมูล</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
    if (summaryDiv) summaryDiv.innerHTML = '';
    const btnDelete = document.getElementById('btnDeleteAttendanceDate');
    if (btnDelete) btnDelete.style.display = 'none';
    return;`;

js = js.replace(s3, r3);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('auth_dungeon patched');
