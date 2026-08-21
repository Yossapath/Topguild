const fs = require('fs');

// --- index.html patches ---
let html = fs.readFileSync('index.html', 'utf8');

// 1. Move btnDeleteAttendanceDate
const btnDeleteHTML = `<button id="btnDeleteAttendanceDate" class="btn-danger" style="display:none; padding:4px 8px; font-size:12px;" onclick="window.deleteAttendanceDate()">🗑️ ลบวันที่นี้</button>`;
html = html.replace(btnDeleteHTML, ''); // Remove from old location
// Insert after attendanceDateSelect
html = html.replace(/(<select id="attendanceDateSelect"[^>]*><\/select>)/, `$1\n            ${btnDeleteHTML}`);
console.log('Moved btnDeleteAttendanceDate');

// 2. Remove inline openAutoMatchModal script
const inlineModalScript = /<script>[\s\S]*?function openAutoMatchModal\(target\) \{[\s\S]*?\}[\s\S]*?<\/script>/;
html = html.replace(inlineModalScript, '');
console.log('Removed inline openAutoMatchModal from index.html');

fs.writeFileSync('index.html', html, 'utf8');

// --- app.js patches ---
let js = fs.readFileSync('app.js', 'utf8');

// 3. Remove btnRemoveTeamBtn reference (since it doesn't exist)
js = js.replace(/const btnRemoveTeamBtn = document\.getElementById\('btnRemoveTeamBtn'\);\s*if \(btnRemoveTeamBtn\) btnRemoveTeamBtn\.addEventListener\('click', removeLastTeam\);/, '');
console.log('Removed btnRemoveTeamBtn from app.js');

// 4. Remove duplicate importFileInput event listener
const dupImportListener = /const importInput = document\.getElementById\('importFileInput'\);\s*if \(importInput\) \{\s*importInput\.addEventListener\('change', \(e\) => \{[\s\S]*?\}\);\s*\}/;
js = js.replace(dupImportListener, `const importInput = document.getElementById('importFileInput');`);
console.log('Removed duplicate importFileInput listener from app.js');

// 5. Expose handleImportFileChange globally if not already (it's used by onchange in HTML)
if (!js.includes('window.handleImportFileChange =')) {
    js = js.replace(/function handleImportFileChange\(e\) \{/, 'window.handleImportFileChange = function(e) {');
}

fs.writeFileSync('app.js', js, 'utf8');

console.log('High priority patches done!');
