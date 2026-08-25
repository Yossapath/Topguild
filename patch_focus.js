const fs = require('fs');

// Patch app.js
let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Popup Blocker Alert
appJs = appJs.replace(
  /const printWin = window\.open\('', '_blank'\);/g,
  `const printWin = window.open('', '_blank');\n  if (!printWin) {\n    alert('กรุณาอนุญาต Pop-up (Pop-up Blocker) สำหรับเว็บไซต์นี้ เพื่อดู PDF');\n    return;\n  }`
);

// 2. Prevent renderAll() from stealing focus
appJs = appJs.replace(
  /function renderAll\(\) \{/g,
  `function renderAll() {
  const activeEl = document.activeElement;
  if (activeEl && activeEl.tagName === 'INPUT' && activeEl.classList.contains('name-input')) {
    window.guildRoster = guildRoster;
    window.teamsAssignments = teamsAssignments;
    if (typeof renderRoster === 'function') renderRoster();
    return; 
  }`
);

fs.writeFileSync('app.js', appJs);

// Patch module_auth.js
if (fs.existsSync('module_auth.js')) {
  let authJs = fs.readFileSync('module_auth.js', 'utf8');
  authJs = authJs.replace(
    /window\.activeAutocompleteInput\.value = newName;/g,
    `window.activeAutocompleteInput.value = newName; window.activeAutocompleteInput.blur();`
  );
  fs.writeFileSync('module_auth.js', authJs);
}

// Patch module_attendance.js
if (fs.existsSync('module_attendance.js')) {
  let attJs = fs.readFileSync('module_attendance.js', 'utf8');
  attJs = attJs.replace(
    /window\.activeAutocompleteInput\.value = newName;/g,
    `window.activeAutocompleteInput.value = newName; window.activeAutocompleteInput.blur();`
  );
  fs.writeFileSync('module_attendance.js', attJs);
}

console.log('Patches applied successfully.');
