const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// ===== Task 12: Add renderLeavePanel function =====
const leavePanelFn = `
/* ============================
   LEAVE PANEL — แสดงคนลาวันนี้
   ============================ */
function renderLeavePanel() {
  var panel = document.getElementById('leavePanelTeams');
  if (!panel) return;

  var todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  var todayDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];

  var leaveList = window.leaveData && Array.isArray(window.leaveData)
    ? window.leaveData.filter(function(l) {
        return l.date === todayStr || l.day === todayDay;
      })
    : [];

  if (leaveList.length === 0) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  panel.style.display = 'flex';
  panel.innerHTML = '<div class="leave-panel-header">🏖️ คนลาวันนี้ (' + leaveList.length + ' คน) — <small style="font-weight:400;">รายชื่อเหล่านี้จะไม่ถูกจัดทีมอัตโนมัติ</small></div>' +
    leaveList.map(function(l) {
      var name = window.escapeHtml ? window.escapeHtml(l.name) : l.name;
      var reason = l.reason ? (' — ' + (window.escapeHtml ? window.escapeHtml(l.reason) : l.reason)) : '';
      return '<span class="leave-badge">🔴 ' + name + '<small>' + reason + '</small></span>';
    }).join('');
}
window.renderLeavePanel = renderLeavePanel;
`;

// Inject before renderRoster function
const injectBefore = 'function renderRoster()';
const idx = code.indexOf(injectBefore);
if (idx !== -1) {
  code = code.substring(0, idx) + leavePanelFn + '\n' + code.substring(idx);
  console.log('renderLeavePanel injected successfully');
} else {
  console.log('ERROR: renderRoster not found');
}

// ===== Task 13: Add Sidebar Search =====
const oldSidebarHead = 'function renderSidebar() {';
const sidebarStart = code.indexOf(oldSidebarHead);
if (sidebarStart !== -1) {
  const bodyStart = code.indexOf('const sidebarBody = document.getElementById(\'sidebarBody\');', sidebarStart);
  if (bodyStart !== -1) {
    const insertPos = bodyStart + 'const sidebarBody = document.getElementById(\'sidebarBody\');'.length;
    const sidebarSearchInject = `
  if (!sidebarBody) return;

  // Build or update sidebar search
  var searchWrap = document.getElementById('sidebarSearchWrap');
  if (!searchWrap) {
    searchWrap = document.createElement('div');
    searchWrap.id = 'sidebarSearchWrap';
    searchWrap.style.cssText = 'padding:8px 12px;border-bottom:1px solid var(--line);';
    var searchInp = document.createElement('input');
    searchInp.type = 'text';
    searchInp.id = 'sidebarSearchInput';
    searchInp.placeholder = '🔍 ค้นหาชื่อ...';
    searchInp.style.cssText = 'width:100%;box-sizing:border-box;padding:6px 10px;border:1px solid var(--line);border-radius:8px;font-size:13px;';
    searchInp.addEventListener('input', function() { renderSidebar(); });
    searchWrap.appendChild(searchInp);
    if (sidebarBody.parentNode) sidebarBody.parentNode.insertBefore(searchWrap, sidebarBody);
  }
  var sidebarSearchQuery = (document.getElementById('sidebarSearchInput') || {}).value || '';
`;
    // Replace old guard
    code = code.replace(
      'const sidebarBody = document.getElementById(\'sidebarBody\');\n  if (!sidebarBody) return;',
      'const sidebarBody = document.getElementById(\'sidebarBody\');' + sidebarSearchInject
    );
    console.log('Sidebar search inject attempted');
  }
}

// ===== Task 13: Filter sidebar by sidebarSearchQuery =====
// After missing = allMembers.filter...
code = code.replace(
  /let missing = allMembers\.filter\(m => !occupiedMap\.has\(m\.name/,
  'let missing = allMembers.filter(m => !occupiedMap.has(m.name'
);

// Add search filter after missing.sort
const missingSortStr = 'missing.sort((a, b) => (b.power || 0) - (a.power || 0));';
const sortIdx = code.indexOf(missingSortStr);
if (sortIdx !== -1) {
  code = code.substring(0, sortIdx + missingSortStr.length) +
    '\n  if (sidebarSearchQuery) { missing = missing.filter(function(m) { return m.name && m.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase()); }); }' +
    code.substring(sortIdx + missingSortStr.length);
  console.log('Sidebar search filter added');
}

fs.writeFileSync('app.js', code);
console.log('Patches done');
