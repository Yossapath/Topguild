const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');
code = code.replace(/\r\n/g, '\n');

// ============================================================
// 1. ADD: lockedTeams data structure (per field, per teamName)
// ============================================================
// Find guildRoster variable declaration to inject lockedTeams nearby
const rosterDecl = 'let guildRoster = {};';
if (!code.includes(rosterDecl)) {
  console.log('Could not find guildRoster declaration, trying alternate...');
}

// Add lockedTeams object after guildRoster
if (!code.includes('let lockedTeams =')) {
  code = code.replace(rosterDecl, rosterDecl + '\n  let lockedTeams = {}; // { "0_TeamA": true }');
  console.log('Added lockedTeams variable');
}

// ============================================================
// 2. ADD: toggleLockTeam and isTeamLocked functions
// ============================================================
const lockFunctions = `
window.toggleLockTeam = function(fieldIdx, teamName) {
  const key = fieldIdx + '_' + teamName;
  lockedTeams[key] = !lockedTeams[key];
  // Save to localStorage
  try { localStorage.setItem('guild_locked_teams', JSON.stringify(lockedTeams)); } catch(e) {}
  renderTeams();
};

function isTeamLocked(fieldIdx, teamName) {
  return !!lockedTeams[fieldIdx + '_' + teamName];
}

// Load locked teams from localStorage
(function() {
  try {
    const saved = localStorage.getItem('guild_locked_teams');
    if (saved) lockedTeams = JSON.parse(saved);
  } catch(e) {}
})();
`;

// Inject before renderTeams function
const renderTeamsMarker = 'function renderTeams() {';
const rtIdx = code.indexOf(renderTeamsMarker);
if (rtIdx !== -1 && !code.includes('window.toggleLockTeam')) {
  code = code.slice(0, rtIdx) + lockFunctions + '\n  ' + code.slice(rtIdx);
  console.log('Added lock team functions');
}

// ============================================================
// 3. MODIFY: renderTeams to show lock button and job count
// ============================================================

// A) Add lock button in team card header (after the delete button)
const oldDeleteBtn = `<button type="button" class="btn-delete-team-card"  data-team="\${escapeHtml(teamName)}" title="ลบ\${escapeHtml(teamName)}">✕</button>`;
const newDeleteBtn = `<button type="button" class="btn-delete-team-card"  data-team="\${escapeHtml(teamName)}" title="ลบ\${escapeHtml(teamName)}">✕</button>
              \${isAdmin ? '<button type="button" onclick="window.toggleLockTeam(' + currentFieldIdx + ', \\'' + escapeHtml(teamName) + '\\')" title="' + (isTeamLocked(currentFieldIdx, teamName) ? 'ปลดล็อกทีม' : 'ล็อกทีม') + '" style="background:' + (isTeamLocked(currentFieldIdx, teamName) ? '#f59e0b' : 'transparent') + ';border:1px solid ' + (isTeamLocked(currentFieldIdx, teamName) ? '#f59e0b' : 'var(--line)') + ';color:' + (isTeamLocked(currentFieldIdx, teamName) ? 'white' : 'var(--text-lo)') + ';border-radius:8px;padding:3px 8px;cursor:pointer;font-size:12px;">' + (isTeamLocked(currentFieldIdx, teamName) ? '🔒 ล็อก' : '🔓 ล็อก') + '</button>' : ''}`;

if (code.includes(oldDeleteBtn)) {
  // We'll do it differently - inject lock info into the renderTeams map
  console.log('Found delete button, injecting lock button...');
}

// Simpler approach: modify the team-card-head to include lock info
// Find the team card head template and add lock button
const oldCardHead = `return \`
        <div class="team-card \${cardDim}">
          <div class="team-card-head">
            <div class="team-title-group">
              <span>\${escapeHtml(teamName)}</span>
              <span class="team-power-sum">⚡ \${teamPowerSum.toLocaleString('en-US')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="status-badge \${badgeClass}">\${badgeText}</span>
              <button type="button" class="btn-delete-team-card"  data-team="\${escapeHtml(teamName)}" title="ลบ\${escapeHtml(teamName)}">✕</button>
            </div>
          </div>`;

const newCardHead = `const locked = isTeamLocked(currentFieldIdx, teamName);
      return \`
        <div class="team-card \${cardDim}\${locked ? ' locked-team' : ''}">
          <div class="team-card-head">
            <div class="team-title-group">
              <span>\${escapeHtml(teamName)}</span>
              \${locked ? '<span style="font-size:11px;background:#f59e0b;color:white;border-radius:8px;padding:2px 6px;">🔒 ล็อก</span>' : ''}
              <span class="team-power-sum">⚡ \${teamPowerSum.toLocaleString('en-US')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="status-badge \${badgeClass}">\${badgeText}</span>
              \${isAdmin ? '<button type="button" onclick="window.toggleLockTeam(' + currentFieldIdx + ',\\'' + escapeHtml(teamName) + '\\')" style="background:' + (locked ? '#f59e0b' : 'transparent') + ';border:1px solid ' + (locked ? '#f59e0b' : 'var(--line)') + ';color:' + (locked ? 'white' : 'var(--text-lo)') + ';border-radius:8px;padding:2px 8px;cursor:pointer;font-size:12px;transition:0.2s;">' + (locked ? '🔒 ล็อก' : '🔓 ล็อก') + '</button>' : ''}
              <button type="button" class="btn-delete-team-card"  data-team="\${escapeHtml(teamName)}" title="ลบ\${escapeHtml(teamName)}">✕</button>
            </div>
          </div>`;

if (code.includes(oldCardHead)) {
  code = code.replace(oldCardHead, newCardHead);
  console.log('Added lock button to team card header');
} else {
  console.log('WARNING: Could not find old card head template');
}

// ============================================================
// 4. MODIFY: updateSummaryStrip to show job counts
// ============================================================
// Find the updateSummaryStrip or fieldStatusBar and add job count
const oldStatusBar = `let bar = \`<span class="pill">กรอกแล้ว <b>\${fieldFilled}</b> / \${displayTotal} คน</span>\`;
      bar += \`<span class="pill">ทีมยังไม่ครบ <b>\${teamsIncomplete}</b> ทีม</span>\`;`;

const newStatusBar = `// Count jobs in this field
      const jobCountInField = {};
      Object.keys(teamsAssignments).forEach(k => {
        if (k.startsWith(currentFieldIdx + '_')) {
          const a = teamsAssignments[k];
          if (a && a.job) jobCountInField[a.job] = (jobCountInField[a.job] || 0) + 1;
        }
      });
      const jobSummaryHtml = Object.keys(jobCountInField).length > 0
        ? '<span class="pill" style="background:var(--bg-soft);">อาชีพ: ' +
          Object.entries(jobCountInField)
            .sort((a,b) => b[1]-a[1])
            .map(([j,c]) => '<b>' + escapeHtml(j) + '</b> ' + c + 'คน')
            .join(' | ') + '</span>'
        : '';

      let bar = \`<span class="pill">กรอกแล้ว <b>\${fieldFilled}</b> / \${displayTotal} คน</span>\`;
      bar += \`<span class="pill">ทีมยังไม่ครบ <b>\${teamsIncomplete}</b> ทีม</span>\`;
      bar += jobSummaryHtml;`;

if (code.includes(oldStatusBar)) {
  code = code.replace(oldStatusBar, newStatusBar);
  console.log('Added job count to status bar');
} else {
  console.log('WARNING: Could not find status bar template');
}

// ============================================================
// 5. MODIFY: Auto-match to respect lockedTeams
// ============================================================
// Find where auto-optimize assigns teams and skip locked teams
const oldAutoFill = `const allRemaining = masterList.filter(m => {
        const lower = m.name.trim().toLowerCase();
        if (assignedSet.has(lower)) return false;`;

const newAutoFill = `const allRemaining = masterList.filter(m => {
        const lower = m.name.trim().toLowerCase();
        if (assignedSet.has(lower)) return false;
        // Skip members already in locked teams
        if (isTeamLocked(currentFieldIdx, teamName)) return false;`;

// Better: skip filling locked teams during auto-optimize
// Find the auto-optimize loop that fills teams
const oldTeamFillLoop = `sortedTeamNames.forEach(teamName => {
        const capacity = fm.capacity[teamName];`;

const newTeamFillLoop = `sortedTeamNames.forEach(teamName => {
        // Skip locked teams in auto-optimize
        if (isTeamLocked(currentFieldIdx, teamName)) return;
        const capacity = fm.capacity[teamName];`;

if (code.includes(oldTeamFillLoop)) {
  code = code.replace(oldTeamFillLoop, newTeamFillLoop);
  console.log('Auto-optimize now skips locked teams');
} else {
  console.log('WARNING: Could not find team fill loop');
}

// Also mark locked team members as pre-assigned so they are not moved
// Find where assigned set is built before auto-optimize
const oldAssignedBuild = `const assignedSet = new Set();
      sortedTeamNames.forEach(teamName => {
        const cap = fm.capacity[teamName];
        for (let i = 0; i < cap; i++) {`;

const newAssignedBuild = `const assignedSet = new Set();
      // Pre-populate assignedSet with members from LOCKED teams so they won't be moved
      sortedTeamNames.forEach(teamName => {
        if (isTeamLocked(currentFieldIdx, teamName)) {
          const cap = fm.capacity[teamName];
          for (let i = 0; i < cap; i++) {
            const k = slotKey(currentFieldIdx, teamName, i);
            const a = teamsAssignments[k];
            if (a && a.name) assignedSet.add(a.name.trim().toLowerCase());
          }
        }
      });
      sortedTeamNames.forEach(teamName => {
        const cap = fm.capacity[teamName];
        for (let i = 0; i < cap; i++) {`;

if (code.includes(oldAssignedBuild)) {
  code = code.replace(oldAssignedBuild, newAssignedBuild);
  console.log('Pre-populated assignedSet with locked team members');
} else {
  console.log('WARNING: Could not find assignedSet build');
}

fs.writeFileSync('app.js', code, 'utf8');
console.log('DONE: All features patched');
