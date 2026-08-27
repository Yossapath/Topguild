const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldRenderAll = `function renderAll() {
  const activeEl = document.activeElement;
  if (activeEl && activeEl.tagName === 'INPUT' && activeEl.classList.contains('name-input')) {
    window.guildRoster = guildRoster;
    window.teamsAssignments = teamsAssignments;
    if (typeof renderRoster === 'function') renderRoster();
    return; 
  }
  if (typeof buildFieldTabs === "function") buildFieldTabs();
  window.guildRoster = guildRoster;
  window.handleNameChange = handleNameChange;
  window.occupiedMap = occupiedMap;
  window.rowJobFilter = rowJobFilter;
  window.teamsAssignments = teamsAssignments;
  renderRoster();
  renderTeams();
}`;

const newRenderAll = `function renderAll() {
  const activeEl = document.activeElement;
  // Guard: user กำลังพิมพ์ใน autocomplete input → อัปเดต memory เท่านั้น ไม่ render DOM ทับ
  if (activeEl && activeEl.tagName === 'INPUT' && activeEl.classList.contains('autocomplete-member')) {
    window.guildRoster = guildRoster;
    window.teamsAssignments = teamsAssignments;
    window.occupiedMap = occupiedMap;
    if (typeof renderRoster === 'function') renderRoster();
    if (typeof renderSidebar === 'function') renderSidebar();
    if (typeof renderLeavePanel === 'function') renderLeavePanel();
    return;
  }

  // Rebuild occupiedMap จาก teamsAssignments เพื่อให้ถูกต้องหลัง Firebase sync
  occupiedMap.clear();
  Object.keys(teamsAssignments).forEach(function(key) {
    var a = teamsAssignments[key];
    if (a && a.name) {
      occupiedMap.set(a.name.trim().toLowerCase(), key);
    }
  });

  if (typeof buildFieldTabs === "function") buildFieldTabs();
  window.guildRoster = guildRoster;
  window.handleNameChange = handleNameChange;
  window.occupiedMap = occupiedMap;
  window.rowJobFilter = rowJobFilter;
  window.teamsAssignments = teamsAssignments;
  renderRoster();
  renderTeams();
  if (typeof renderLeavePanel === 'function') renderLeavePanel();
}`;

if (code.includes('function renderAll()')) {
  // Find and replace using index-based approach
  const start = code.indexOf('function renderAll()');
  const end = code.indexOf('\n}', start) + 2;
  const before = code.substring(0, start);
  const after = code.substring(end);
  code = before + newRenderAll + after;
  fs.writeFileSync('app.js', code);
  console.log('renderAll replaced successfully');
} else {
  console.log('ERROR: renderAll not found');
}
