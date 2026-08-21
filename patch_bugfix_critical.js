const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// --- FIX 1 & 2: Wrong IDs in renderAttendanceTable ---
js = js.replace(/getElementById\('attTbody'\)/g, "getElementById('attendanceTbody')");
js = js.replace(/getElementById\('attSearch'\)/g, "getElementById('attendanceSearch')");
console.log('Fix 1+2: Wrong IDs patched');

// --- FIX 4: Expose dungeonData to window ---
js = js.replace(
  /let dungeonData = \{ queues: \[\], teams: \[\] \};/,
  `let dungeonData = { queues: [], teams: [] };\nwindow.dungeonData = dungeonData;`
);
// Also sync window.dungeonData when data updates from Firebase
js = js.replace(
  /dungeonData = snapshot\.data\(\);/,
  `dungeonData = snapshot.data();\n          window.dungeonData = dungeonData;`
);
js = js.replace(
  /dungeonData = \{ queues: \[\], teams: \[\] \};/g,
  `dungeonData = { queues: [], teams: [] };\n    window.dungeonData = dungeonData;`
);
console.log('Fix 4: window.dungeonData exposed');

// --- FIX 5 & 6: Define switchDungeonTab and initialize currentDungeonTab ---
const switchTabFn = `
window.currentDungeonTab = window.currentDungeonTab || 'มายา (Maya)';

window.switchDungeonTab = function(tabName) {
  window.currentDungeonTab = tabName;
  // Sync the dqDungeon dropdown
  const dq = document.getElementById('dqDungeon');
  if (dq) {
    Array.from(dq.options).forEach(opt => {
      if (opt.value === tabName) dq.value = opt.value;
    });
  }
  // Highlight tabs
  document.querySelectorAll('.dungeon-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabName) btn.classList.add('active');
  });
  renderDungeonPage();
};
`;

if (!js.includes('window.switchDungeonTab =')) {
  // Insert before renderDungeonPage definition
  js = js.replace(/function renderDungeonPage\(\) \{/, switchTabFn + '\nfunction renderDungeonPage() {');
}
console.log('Fix 5+6: switchDungeonTab defined and currentDungeonTab initialized');

// --- FIX 7: Remove the setInterval that forces leaveName every second ---
const intervalRegex = /\/\/ Ensure the form gets populated with the current user's name\/job\s*setInterval\(\(\) => \{[\s\S]*?\}, 1000\);/;
js = js.replace(intervalRegex, `// Auto-fill leaveName once on page ready (not setInterval)
function fillLeaveFormFromUser() {
  const nameEl = document.getElementById('leaveName');
  const jobEl = document.getElementById('leaveJob');
  if (nameEl && window.currentUser && window.currentUser.username && !nameEl.value) {
    nameEl.value = window.currentUser.username;
    if (jobEl && !jobEl.value && window.guildRoster) {
      Object.keys(window.guildRoster).forEach(job => {
        const found = (window.guildRoster[job]||[]).find(m => m.name.toLowerCase() === window.currentUser.username.toLowerCase());
        if (found && !jobEl.value) jobEl.value = job;
      });
    }
  }
}
// Fill once when page-leave is shown
document.addEventListener('DOMContentLoaded', () => {
  const leaveTab = document.getElementById('page-leave');
  if (leaveTab) {
    const observer = new MutationObserver(() => {
      if (leaveTab.style.display !== 'none') fillLeaveFormFromUser();
    });
    observer.observe(leaveTab, { attributes: true, attributeFilter: ['style'] });
  }
});
`);
console.log('Fix 7: setInterval removed, replaced with MutationObserver');

// --- FIX 3: Remove orphaned leaveNameDropdown code inside renderAttendanceStats ---
// It starts right after the stats data aggregation ends and before the statsMap rendering
const orphanedRegex = /\/\/ Cleaned old leave dropdown[\s\S]*?\/\/ Old dqName dropdown removed/;
if (js.match(orphanedRegex)) {
  js = js.replace(orphanedRegex, '');
  console.log('Fix 3: Removed orphaned dropdown code');
} else {
  // Try a different approach - find the orphaned block inside renderAttendanceStats
  const orphanedInStats = /const action = inputEl\.getAttribute\('data-action'\);[\s\S]*?window\.activeAutocompleteInput = inputEl;\s*\}/;
  if (js.match(orphanedInStats)) {
    js = js.replace(orphanedInStats, '');
    console.log('Fix 3: Removed orphaned inputEl block');
  } else {
    console.log('Fix 3: Could not find orphaned block (may already be clean)');
  }
}

// --- FIX 10: Remove duplicate removeSpecificTeam onclick from rendered HTML ---
// Change the rendered delete button to use class only (no onclick)
js = js.replace(
  /onclick="removeSpecificTeam\('\${teamId}'\)"/g,
  'data-delete-team="${teamId}"'
);
console.log('Fix 10: Remove duplicate onclick from deleteSpecificTeam');

// --- Also fix saveDungeonState to sync window.dungeonData ---
js = js.replace(
  /async function saveDungeonState\(\) \{[\s\S]*?await setDoc\(dungRef, dungeonData\);/,
  `async function saveDungeonState() {
    if (!window.db) return;
    const dungRef = doc(window.db, 'guild_system', 'dungeons');
    window.dungeonData = dungeonData;
    await setDoc(dungRef, dungeonData);`
);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('All critical patches done!');
