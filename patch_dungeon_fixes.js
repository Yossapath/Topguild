const fs = require('fs');
let lines = fs.readFileSync('module_dungeon.js', 'utf8').split('\n');

// Fix 1: Show dungeonAdminPanel (the correct ID from index.html)
// Line 589 says: dungeonRunControls which is OLD. Replace with dungeonAdminPanel
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("// Show/hide run controls for admin")) {
    lines[i] = `      // Show/hide admin booking panel`;
  }
  if (lines[i].includes("document.getElementById('dungeonRunControls')")) {
    lines[i] = `      const runCtrl = document.getElementById('dungeonAdminPanel');`;
  }
  // Fix 2: Shrink button size and remove emoji from "ลงเสร็จ" and "ลบ" buttons
  if (lines[i].includes("✅ ลงเสร็จ") && lines[i].includes("btn-primary")) {
    lines[i] = `                <button class="btn-primary" onclick="changeDungeonQueueStatus('\${q.id}','done')" style="font-size:12px;padding:5px 12px;background:var(--ok);border:none;">ลงเสร็จ</button>`;
  }
  if (lines[i].includes("🗑 ลบ") && lines[i].includes("btn-secondary") && lines[i].includes("adminCtrl")) {
    lines[i] = `                <button class="btn-secondary" onclick="deleteDungeonQueue('\${q.id}')" style="font-size:12px;padding:5px 12px;color:var(--danger);border-color:var(--danger);">ลบ</button>`;
  }
  if (lines[i].includes("🗑 ยกเลิกการจอง") && lines[i].includes("memberCtrl")) {
    lines[i] = `                <button class="btn-secondary" onclick="deleteDungeonQueue('\${q.id}')" style="font-size:12px;padding:5px 12px;color:var(--danger);border-color:var(--danger);flex:1;">ยกเลิกการจอง</button>`;
  }
  // Fix margins on control divs to be smaller
  if (lines[i].includes('display:flex;gap:8px;margin-top:12px;') && (lines[i].includes('adminCtrl') || lines[i].includes('memberCtrl'))) {
    lines[i] = lines[i].replace('display:flex;gap:8px;margin-top:12px;', 'display:flex;gap:6px;margin-top:8px;');
  }
}

fs.writeFileSync('module_dungeon.js', lines.join('\n'));
console.log('Patched admin panel and button sizes');
