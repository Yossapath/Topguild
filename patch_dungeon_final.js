const fs = require('fs');

// 1. Fix index.html: header text, tab styling, background, label
let html = fs.readFileSync('index.html', 'utf8');

// Change "รายคิวจอง" -> "รายชื่อคิว"
html = html.replace('📋 รายคิวจอง', 'รายชื่อคิว');

// Change tab styling to square no-border style
html = html.replace(
  `<div id="dungeonTabsContainer" style="display: flex; border-bottom: 2px solid var(--line); background: var(--bg-card);">
        <button type="button" class="dungeon-tab active" data-type="มายา (Maya)" onclick="switchDungeonTab('มายา (Maya)')" style="flex:1; padding:14px; font-size:15px; font-weight:700; border-radius:0;">มายา (Maya)</button>
        <button type="button" class="dungeon-tab" data-type="บับเบิ้ล (Bubble)" onclick="switchDungeonTab('บับเบิ้ล (Bubble)')" style="flex:1; padding:14px; font-size:15px; font-weight:700; border-radius:0;">บับเบิ้ล (Bubble)</button>
        <button type="button" class="dungeon-tab" data-type="กระจก (Mirror)" onclick="switchDungeonTab('กระจก (Mirror)')" style="flex:1; padding:14px; font-size:15px; font-weight:700; border-radius:0;">กระจก (Mirror)</button>
      </div>`,
  `<div id="dungeonTabsContainer" style="display: flex; background: var(--bg-card);">
        <button type="button" class="dungeon-tab active" data-type="มายา (Maya)" onclick="switchDungeonTab('มายา (Maya)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid var(--blue-700); background:white; cursor:pointer;">มายา (Maya)</button>
        <button type="button" class="dungeon-tab" data-type="บับเบิ้ล (Bubble)" onclick="switchDungeonTab('บับเบิ้ล (Bubble)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid transparent; background:white; cursor:pointer;">บับเบิ้ล (Bubble)</button>
        <button type="button" class="dungeon-tab" data-type="กระจก (Mirror)" onclick="switchDungeonTab('กระจก (Mirror)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid transparent; background:white; cursor:pointer;">กระจก (Mirror)</button>
      </div>`
);

// Remove emoji from header title
html = html.replace('🏰 ระบบจองคิวลงดันเจี้ยน', 'ระบบจองคิวลงดันเจี้ยน');
// Remove emoji from booking form header
html = html.replace('📋 จองคิวลงดัน', 'จองคิวลงดัน');
// Remove emoji from save/clear admin buttons
html = html.replace('💾 บันทึกตั้งค่า', 'บันทึกตั้งค่า');
html = html.replace('🔓 เปิดจองไม่จำกัดเวลา', 'เปิดจองไม่จำกัดเวลา');
// Remove emoji from booking button
html = html.replace('🎯 จองคิวลงดันเจี้ยน', 'จองคิวลงดันเจี้ยน');
// Remove emoji from admin panel header
html = html.replace('⚙️ ตั้งค่าช่วงเวลาเปิดจอง', 'ตั้งค่าช่วงเวลาเปิดจอง');
// Remove emoji from schedule status icon (handled in JS)

// Change queue list area background to white
html = html.replace(
  '<div id="dqList" style="flex:1; overflow-y:auto; max-height:600px;"></div>',
  '<div id="dqList" style="flex:1; overflow-y:auto; max-height:600px; background:white;"></div>'
);

// Change queue list panel bg to white
html = html.replace(
  'flex:1; display:flex; flex-direction:column; min-height:520px; background:var(--bg-card);',
  'flex:1; display:flex; flex-direction:column; min-height:520px; background:white;'
);

fs.writeFileSync('index.html', html);
console.log('Patched index.html');

// 2. Fix schedule: use Thai time 06:00-24:00 as default values
// Also fix renderDungeonScheduleStatus to use Asia/Bangkok time properly
let code = fs.readFileSync('module_dungeon.js', 'utf8');

// Remove emojis from schedule status messages
code = code.replace(/🟢 เปิดรับจองอยู่/g, 'เปิดรับจองอยู่');
code = code.replace(/🔒 จะเปิดจองวันที่/g, 'จะเปิดจองวันที่');
code = code.replace(/🔒 ปิดรับการจองแล้ว/g, 'ปิดรับการจองแล้ว');

// Fix time input defaults in HTML for admin (set default open/close time)
// Actually set default values in loadDungeonSchedule fallback
const loadFallback = `if (snap.exists()) {
          const s = snap.data();
          if (s && (s.openDate || s.openTime)) {
            dungeonData._schedule = s;
            const od = document.getElementById('dqOpenDate');
            const ot = document.getElementById('dqOpenTime');
            const ct = document.getElementById('dqCloseTime');
            if (od) od.value = s.openDate || '';
            if (ot) ot.value = s.openTime || '';
            if (ct) ct.value = s.closeTime || '';
            renderDungeonScheduleStatus(window.isUserAdmin && window.isUserAdmin());
          }
        }`;

const loadFallbackNew = `if (snap.exists()) {
          const s = snap.data();
          if (s && (s.openDate || s.openTime)) {
            dungeonData._schedule = s;
            const od = document.getElementById('dqOpenDate');
            const ot = document.getElementById('dqOpenTime');
            const ct = document.getElementById('dqCloseTime');
            if (od) od.value = s.openDate || '';
            if (ot) ot.value = s.openTime || '06:00';
            if (ct) ct.value = s.closeTime || '23:59';
            renderDungeonScheduleStatus(window.isUserAdmin && window.isUserAdmin());
          }
        } else {
          // No schedule set yet - pre-fill default times for admin
          const ot = document.getElementById('dqOpenTime');
          const ct = document.getElementById('dqCloseTime');
          if (ot && !ot.value) ot.value = '06:00';
          if (ct && !ct.value) ct.value = '23:59';
        }`;

code = code.replace(loadFallback, loadFallbackNew);

// Fix renderDungeonScheduleStatus to properly handle 24:00 as 23:59
// The time comparison needs Thai timezone
const oldTimeCheck = `const isOpen = nowDateStr === sched.openDate && nowTimeStr >= sched.openTime && nowTimeStr <= sched.closeTime;`;
const newTimeCheck = `// Handle midnight/23:59 as end of day
      const effectiveClose = sched.closeTime === '24:00' ? '23:59' : sched.closeTime;
      const isOpen = nowDateStr === sched.openDate && nowTimeStr >= sched.openTime && nowTimeStr <= effectiveClose;`;
code = code.replace(oldTimeCheck, newTimeCheck);

fs.writeFileSync('module_dungeon.js', code);
console.log('Patched module_dungeon.js');
