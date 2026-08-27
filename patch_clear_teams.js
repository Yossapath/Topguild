const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regexClear = /function clearCurrentFieldTeams\(\) \{\s*if \(currentFieldIdx === 0\) \{\s*clearMainFieldTeams\(\);\s*\} else \{\s*clearSubFieldTeams\(\);\s*\}\s*\}/;
const replaceClear = `function clearCurrentFieldTeams() {
    if (currentFieldIdx === 0) {
      clearMainFieldTeams();
    } else if (currentFieldIdx === 1) {
      clearSubFieldTeams();
    } else if (currentFieldIdx === 2) {
      if (!window.isUserAdmin()) return;
      if (!confirm("⚠️ ยืนยันการล้างข้อมูลตาราง 'ออฟไลน์' ทั้งหมด?")) return;
      const fm = fieldMeta[2];
      if (!fm) return;
      let clearedCount = 0;
      fm.teamNames.forEach(teamName => {
        const cap = 100;
        for (let i = 0; i < cap; i++) {
          const key = slotKey(2, teamName, i);
          if (teamsAssignments[key]) {
            delete teamsAssignments[key];
            delete rowJobFilter[key];
            clearedCount++;
          }
        }
      });
      occupiedMap.clear();
      Object.keys(teamsAssignments).forEach(key => {
        const a = teamsAssignments[key];
        if (a && a.name) occupiedMap.set(a.name.trim().toLowerCase(), key);
      });
      renderAll();
      saveState();
      showToast("ล้างตารางออฟไลน์เรียบร้อยแล้ว (" + clearedCount + " ตำแหน่ง)", "info");
    }
  }`;

if (code.match(regexClear)) {
  code = code.replace(regexClear, replaceClear);
  fs.writeFileSync('app.js', code);
  console.log('Patched clearCurrentFieldTeams');
} else {
  console.log('Match failed for clearCurrentFieldTeams');
}
