const fs = require('fs');
let lines = fs.readFileSync('index.html', 'utf8').split('\n');

// === 1. Remove tabs (lines 583-588, 0-indexed: 582-587), replace with hidden div + set Maya tab ===
// Line 583 = "      <!-- Tabs -->\r"  (index 582)
// Line 588 = "      </div>\r"         (index 587)
const tabStart = 582; // 0-indexed
const tabEnd = 587;   // 0-indexed inclusive

lines.splice(tabStart, tabEnd - tabStart + 1,
  `      <!-- Maya only - hidden tab container; JS will call switchDungeonTab automatically -->\r`,
  `      <div id="dungeonTabsContainer" style="display:none;"></div>\r`
);
console.log('[OK] Replaced tabs block');

// Re-read with adjusted indices
// === 2. Find and update header: line 580 area
const headerIdx = lines.findIndex(l => l.includes('ระบบจองคิวลงดันเจี้ยน'));
console.log('header at:', headerIdx + 1);
if (headerIdx >= 0) {
  // Also find the dungeonAdminControls div on the next line
  const adminCtrlIdx = lines.findIndex((l, i) => i > headerIdx && l.includes('dungeonAdminControls'));
  console.log('adminCtrl at:', adminCtrlIdx + 1);
  
  // Replace lines from h2 to closing of its flex container div
  lines.splice(headerIdx, adminCtrlIdx - headerIdx + 1,
    `        <div>\r`,
    `          <h2 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">ระบบจองคิว ดันมายา (Maya)</h2>\r`,
    `          <div style="font-size:12px; opacity:0.8; margin-top:2px;">5 คนต่อทีม · จองได้ 1 ตัวละคร ต่อรอบ</div>\r`,
    `        </div>\r`,
    `        <div style="display:flex; gap:8px; align-items:center;">\r`,
    `          <button onclick="window.copyDungeonBookingLink()" style="background:rgba(255,255,255,0.18); border:1.5px solid rgba(255,255,255,0.5); color:white; border-radius:8px; padding:8px 14px; cursor:pointer; font-size:13px; font-weight:700;">🔗 แชร์ลิงค์จองคิว</button>\r`,
    `          <div id="dungeonAdminControls" style="display:flex; gap:8px; align-items:center;"></div>\r`,
    `        </div>\r`
  );
  console.log('[OK] Updated header');
}

// === 3. Find and remove dungeon dropdown (label + select)
const dungeonLabelIdx = lines.findIndex(l => l.includes('text-transform:uppercase; letter-spacing:0.5px;">ดันเจี้ยน'));
console.log('dungeon label at:', dungeonLabelIdx + 1);
if (dungeonLabelIdx >= 0) {
  // Find the closing </select>
  let selectEnd = -1;
  for (let i = dungeonLabelIdx; i < dungeonLabelIdx + 10; i++) {
    if (lines[i] && lines[i].includes('</select>')) {
      selectEnd = i;
      break;
    }
  }
  console.log('select end at:', selectEnd + 1);
  if (selectEnd >= 0) {
    lines.splice(dungeonLabelIdx, selectEnd - dungeonLabelIdx + 1,
      `          <!-- Fixed to Maya only -->\r`,
      `          <input type="hidden" id="dqDungeon" value="มายา (Maya)">\r`
    );
    console.log('[OK] Replaced dungeon dropdown');
  }
}

fs.writeFileSync('index.html', lines.join('\n'));
console.log('Done');
