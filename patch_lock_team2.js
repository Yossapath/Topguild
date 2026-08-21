const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');
// Keep original line endings for matching
const origCode = code;

// ============================================================
// PATCH 1: Add lock button to team card head
// Strategy: find the button with class btn-delete-team-card in the renderTeams template
// and inject a lock button before it
// ============================================================

// Find by searching for the exact string that appears in the generated HTML
const deleteTeamBtnPattern = /(<button type="button" class="btn-delete-team-card"\s+data-team="\$\{escapeHtml\(teamName\)\}" title="ลบ\$\{escapeHtml\(teamName\)\}">✕<\/button>)/;
const lockBtnInject = `\${isAdmin ? \`<button type="button" onclick="window.toggleLockTeam(\${currentFieldIdx}, '\${escapeHtml(teamName)}')" style="background:\${locked?'#f59e0b':'transparent'};border:1px solid \${locked?'#f59e0b':'var(--line)'};color:\${locked?'white':'var(--text-lo)'};border-radius:8px;padding:2px 8px;cursor:pointer;font-size:12px;"\>\${locked?'🔒 ล็อก':'🔓 ล็อก'}</button>\` : ''}
              $1`;

// First inject locked variable before the return statement of the map
const mapReturnPattern = /(const cardDim = activeJobFilter && !matchInTeam \? 'dim' : '';)\s*\n(\s*return)/;
const mapReturnReplacement = `$1
      const locked = isTeamLocked(currentFieldIdx, teamName);
$2`;

if (mapReturnPattern.test(code)) {
  code = code.replace(mapReturnPattern, mapReturnReplacement);
  console.log('Added locked variable in map callback');
} else {
  console.log('WARNING: could not find cardDim line');
}

// Add locked-team class to team card div
code = code.replace(
  /return `\s*\n\s*<div class="team-card \$\{cardDim\}">/,
  `return \`
        <div class="team-card \${cardDim}\${locked?' locked-team':''}">`
);

// Add lock badge in title group
code = code.replace(
  '<span class="team-power-sum">⚡ ${teamPowerSum.toLocaleString(\'en-US\')}</span>',
  `\${locked ? '<span style="font-size:11px;background:#f59e0b;color:white;border-radius:8px;padding:2px 6px;margin-left:4px;">🔒</span>' : ''}
              <span class="team-power-sum">⚡ \${teamPowerSum.toLocaleString('en-US')}</span>`
);

// Add lock button before delete button
code = code.replace(
  '<button type="button" class="btn-delete-team-card"  data-team="${escapeHtml(teamName)}" title="ลบ${escapeHtml(teamName)}">✕</button>',
  `\${isAdmin ? \`<button type="button" onclick="window.toggleLockTeam(\${currentFieldIdx}, '\${escapeHtml(teamName)}')" style="background:\${locked?'#f59e0b':'transparent'};border:1px solid \${locked?'#f59e0b':'var(--line)'};color:\${locked?'white':'var(--text-lo)'};border-radius:8px;padding:2px 8px;cursor:pointer;font-size:12px;">\${locked?'🔒 ล็อก':'🔓 ล็อก'}</button>\` : ''}
              <button type="button" class="btn-delete-team-card"  data-team="\${escapeHtml(teamName)}" title="ลบ\${escapeHtml(teamName)}">✕</button>`
);

// ============================================================
// PATCH 2: Add job count to status bar
// ============================================================
const statusBarInsert = `    // Count jobs in current field assignments
    const jobCountInField = {};
    Object.keys(teamsAssignments).forEach(k => {
      if (k.startsWith(currentFieldIdx + '_')) {
        const a = teamsAssignments[k];
        if (a && a.job) jobCountInField[a.job] = (jobCountInField[a.job] || 0) + 1;
      }
    });

    const statusBar = document.getElementById('fieldStatusBar');`;

code = code.replace(
  '    const statusBar = document.getElementById(\'fieldStatusBar\');',
  statusBarInsert
);

// Add job count pill to the bar
code = code.replace(
  /bar \+= `<span class="pill">ทีมยังไม่ครบ <b>\$\{teamsIncomplete\}<\/b> ทีม<\/span>`;/,
  `bar += \`<span class="pill">ทีมยังไม่ครบ <b>\${teamsIncomplete}</b> ทีม</span>\`;
      if (Object.keys(jobCountInField).length > 0) {
        bar += '<span class="pill" style="background:var(--bg-soft);">อาชีพ: ' + Object.entries(jobCountInField).sort((a,b)=>b[1]-a[1]).map(([j,c])=>'<b>'+escapeHtml(j)+'</b> '+c+'คน').join(' | ') + '</span>';
      }`
);

// ============================================================
// PATCH 3: Auto-optimize skips locked teams
// ============================================================
// Skip locked teams in the forEach that fills teams
const sortedTeamsLoop = `sortedTeamNames.forEach(teamName => {
        const capacity = fm.capacity[teamName];`;

// There might be multiple — find the one in the auto-optimize section
// by looking for a broader pattern
const autoLoopPattern = /(sortedTeamNames\.forEach\(teamName => \{\s*\n\s*const capacity = fm\.capacity\[teamName\];)/g;
let matchCount = 0;
code = code.replace(autoLoopPattern, (match) => {
  matchCount++;
  if (matchCount === 1) {
    // First occurrence is in renderTeams — leave alone
    return match;
  }
  // Later occurrences are in auto-optimize — add skip
  return match.replace(
    'sortedTeamNames.forEach(teamName => {',
    `sortedTeamNames.forEach(teamName => {
        if (isTeamLocked(currentFieldIdx, teamName)) return; // Skip locked teams`
  );
});
console.log('Found forEach loops:', matchCount);

fs.writeFileSync('app.js', code, 'utf8');
console.log('All patches applied');
