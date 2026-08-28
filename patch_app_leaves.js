const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

// 1. Add window.isLeaveToday helper if not exists
if (!code.includes('window.isLeaveToday')) {
  const helper = `
window.isLeaveToday = function(name) {
  if (!window.leaveData || window.leaveData.length === 0) return false;
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  const todayDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const lowerName = name?.trim()?.toLowerCase();
  return window.leaveData.some(l => 
    l.name?.trim()?.toLowerCase() === lowerName && 
    (l.date === todayStr || l.day === todayDay)
  );
};
`;
  // Put it after window.saveState = saveState;
  code = code.replace('window.saveState = saveState;', 'window.saveState = saveState;' + helper);
}

// 2. Replace occurrences in app.js
const target1 = `window.leaveData && window.leaveData.some(l => l.name?.trim()?.toLowerCase() === m.name?.trim()?.toLowerCase())`;
const replace1 = `window.isLeaveToday(m.name)`;
code = code.split(target1).join(replace1);

// 3. Patch renderLeavePanel
const oldLeavePanel = `function renderLeavePanel() {
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
}`;

const newLeavePanel = `function renderLeavePanel() {
  var panel = document.getElementById('leavePanelTeams');
  if (!panel) return;

  var todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  var todayDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];

  if (!window.leaveData || !Array.isArray(window.leaveData) || window.leaveData.length === 0) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  var todayLeaves = [];
  var advanceLeaves = [];

  window.leaveData.forEach(l => {
    if (l.date === todayStr || l.day === todayDay) {
      todayLeaves.push(l);
    } else {
      advanceLeaves.push(l);
    }
  });

  if (todayLeaves.length === 0 && advanceLeaves.length === 0) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  var html = '';
  if (todayLeaves.length > 0) {
    html += '<div class="leave-panel-header" style="width:100%;">🏖️ คนลาวันนี้ (' + todayLeaves.length + ' คน) — <small style="font-weight:400;">รายชื่อเหล่านี้จะไม่ถูกจัดทีมอัตโนมัติ</small></div>';
    html += todayLeaves.map(l => {
      var name = window.escapeHtml ? window.escapeHtml(l.name) : l.name;
      var reason = l.reason ? (' — ' + (window.escapeHtml ? window.escapeHtml(l.reason) : l.reason)) : '';
      return '<span class="leave-badge">🔴 ' + name + '<small>' + reason + '</small></span>';
    }).join('');
  }

  if (advanceLeaves.length > 0) {
    if (todayLeaves.length > 0) html += '<div style="width:100%; height:8px;"></div>'; // spacer
    html += '<div class="leave-panel-header" style="width:100%; color:var(--text-md); border-color:var(--border);">⏳ คนลาล่วงหน้า (' + advanceLeaves.length + ' คน)</div>';
    html += advanceLeaves.map(l => {
      var name = window.escapeHtml ? window.escapeHtml(l.name) : l.name;
      var dateTxt = l.date || l.day;
      var reason = l.reason ? (' — ' + (window.escapeHtml ? window.escapeHtml(l.reason) : l.reason)) : '';
      return '<span class="leave-badge" style="background:var(--bg-card); color:var(--text-md); border:1px solid var(--border);">⌛ ' + name + ' (ลาวันที่ ' + dateTxt + ')<small>' + reason + '</small></span>';
    }).join('');
  }

  panel.style.display = 'flex';
  panel.style.flexWrap = 'wrap';
  panel.innerHTML = html;
}`;

// I will use regex or careful split to replace renderLeavePanel because it might have whitespace diffs.
code = code.replace(/function renderLeavePanel\(\) \{[\s\S]*?\}\)\.join\(''\);\s*\}/, newLeavePanel);

fs.writeFileSync('app.js', code);
console.log('Patched app.js leaves logic');
