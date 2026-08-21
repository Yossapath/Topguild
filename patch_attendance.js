const fs = require('fs');
let auth = fs.readFileSync('auth_dungeon.js', 'utf8');

// We just replace the entire block manually inside renderAttendanceTable.
// Let's find it reliably by looking for attendanceSummary
const blockStart = auth.indexOf("const summaryDiv = document.getElementById('attendanceSummary');");
if (blockStart !== -1) {
    const nextFuncStart = auth.indexOf("window.updateAttendanceStatus", blockStart);
    let block = auth.substring(blockStart, nextFuncStart);
    
    // Replace the innerHTML block inside
    const newBlock = `const summaryDiv = document.getElementById('attendanceSummary');
  if (summaryDiv) {
    summaryDiv.innerHTML = \`
      <div style="display:flex; justify-content:center; align-items:center; margin-bottom: 10px; background:var(--bg-soft); padding: 12px; border-radius: 8px; border: 1px solid var(--line); font-size: 15px; font-weight: 600;">
        <span style="color:var(--text-hi);">ทั้งหมด : \${totalCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--ok);">มา : \${joinedCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--warn);">ลา : \${leaveCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--danger);">ขาด : \${absentCount} คน</span>
      </div>
    \`;
  }
};
`;
    auth = auth.substring(0, blockStart) + newBlock + "\n" + auth.substring(nextFuncStart);
    fs.writeFileSync('auth_dungeon.js', auth, 'utf8');
    console.log('Fixed attendance metrics');
} else {
    console.log('Block not found');
}
