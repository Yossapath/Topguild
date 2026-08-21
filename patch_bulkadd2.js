const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Normalize line endings
code = code.replace(/\r\n/g, '\n');

// Find processBulkAdd and replace entirely using brace counting
const startMarker = 'window.processBulkAdd = function() {';
const idx = code.indexOf(startMarker);
if (idx === -1) { console.log('processBulkAdd not found'); process.exit(1); }

let depth = 0;
let start = idx + startMarker.length - 1; // point to the opening {
let end = -1;
for (let i = start; i < code.length; i++) {
  if (code[i] === '{') depth++;
  if (code[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end === -1) { console.log('Could not find end of processBulkAdd'); process.exit(1); }

const newFn = `window.processBulkAdd = function() {
  const text = document.getElementById('bulkAddText').value.trim();
  if (!text) {
    showToast("กรุณาวางข้อมูลรายชื่อก่อน", "warning");
    return;
  }

  const lines = text.split('\\n');
  let addedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  const jobMap = {};
  JOB_LIST.forEach(j => {
    jobMap[j.toLowerCase()] = j;
    jobMap[j.replace(/\\s+/g, '').toLowerCase()] = j;
  });

  lines.forEach(line => {
    if (!line.trim()) return;

    // Split by tab, comma, or multiple spaces
    let parts = line.split(/\\t|,| {2,}/).map(p => p.trim()).filter(Boolean);
    if (parts.length < 3) {
      parts = line.split(/\\s+/).map(p => p.trim()).filter(Boolean);
    }
    if (parts.length < 3) { errorCount++; return; }

    const name = parts[0];

    // Detect power: last numeric part
    let powerIndex = -1;
    for (let i = parts.length - 1; i >= 1; i--) {
      const n = parseInt(parts[i].replace(/,/g, ''), 10);
      if (!isNaN(n) && n > 0) { powerIndex = i; break; }
    }
    if (powerIndex === -1) { errorCount++; return; }

    // Job = everything between name and power
    const jobRaw = parts.slice(1, powerIndex).join(' ').trim();
    const normalizedJob = jobRaw.toLowerCase().replace(/\\s+/g, '');
    const job = jobMap[normalizedJob] || jobMap[jobRaw.toLowerCase()];
    const power = parseInt(parts[powerIndex].replace(/,/g, ''), 10);

    if (!name || !job || isNaN(power)) { errorCount++; return; }

    const nameLower = name.toLowerCase();

    // Find if member exists anywhere in roster
    let existingJob = null;
    let existingIdx = -1;
    Object.keys(guildRoster).forEach(j => {
      const arr = guildRoster[j] || [];
      const i = arr.findIndex(m => m.name.trim().toLowerCase() === nameLower);
      if (i !== -1) { existingJob = j; existingIdx = i; }
    });

    if (existingJob !== null) {
      // UPDATE existing member
      if (existingJob === job) {
        // Same job — update power and name casing
        guildRoster[existingJob][existingIdx].power = power;
        guildRoster[existingJob][existingIdx].name = name;
      } else {
        // Changed job — move to new job group
        const old = guildRoster[existingJob].splice(existingIdx, 1)[0];
        if (!guildRoster[job]) guildRoster[job] = [];
        guildRoster[job].push({ name, power, requirement: old.requirement || 'all' });
      }
      updatedCount++;
    } else {
      // ADD new member
      if (!guildRoster[job]) guildRoster[job] = [];
      guildRoster[job].push({ name, power, requirement: 'all' });
      addedCount++;
    }
  });

  saveState();
  renderJobGrid();
  updateSummaryStrip();
  closeBulkAddModal();

  const parts2 = [];
  if (addedCount > 0) parts2.push(\`เพิ่มใหม่ \${addedCount} คน\`);
  if (updatedCount > 0) parts2.push(\`อัปเดต \${updatedCount} คน\`);
  if (errorCount > 0) parts2.push(\`(ข้ามข้อมูลผิดพลาด \${errorCount} รายการ)\`);
  showToast(parts2.join(' | ') || 'ไม่มีการเปลี่ยนแปลง', (addedCount + updatedCount > 0) ? 'success' : 'warning');
};`;

code = code.slice(0, idx) + newFn + code.slice(end);
fs.writeFileSync('app.js', code, 'utf8');
console.log('SUCCESS: patched processBulkAdd');
