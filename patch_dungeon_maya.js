/**
 * Patch dungeon section in index.html:
 * 1. Remove Bubble/Mirror tab buttons
 * 2. Remove dungeon dropdown (replace with hidden fixed Maya input)
 * 3. Update header title + add share link button
 * 4. Add copyDungeonBookingLink to app.js
 */
const fs = require('fs');

// =================== PATCH index.html ===================
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the tabs (Bubble/Mirror buttons) - keep only Maya in header text
const OLD_TABS = `      <!-- Tabs -->
      <div id="dungeonTabsContainer" style="display: flex; background: white; border-bottom: 2px solid var(--line);">
        <button type="button" class="dungeon-tab active" data-type="มายา (Maya)" onclick="switchDungeonTab('มายา (Maya)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-right:1px solid var(--line); border-bottom:3px solid var(--blue-700); background:white; cursor:pointer;">มายา (Maya)</button>
        <button type="button" class="dungeon-tab" data-type="บับเบิ้ล (Bubble)" onclick="switchDungeonTab('บับเบิ้ล (Bubble)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-right:1px solid var(--line); border-bottom:3px solid transparent; background:white; cursor:pointer;">บับเบิ้ล (Bubble)</button>
        <button type="button" class="dungeon-tab" data-type="กระจก (Mirror)" onclick="switchDungeonTab('กระจก (Mirror)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid transparent; background:white; cursor:pointer;">กระจก (Mirror)</button>
      </div>`;

const NEW_TABS = `      <!-- Maya only - no tab bar needed, init tab via script -->
      <div id="dungeonTabsContainer" style="display:none;"></div>`;

if (html.includes(OLD_TABS)) {
  html = html.replace(OLD_TABS, NEW_TABS);
  console.log('[OK] Removed Bubble/Mirror tabs');
} else {
  console.log('[FAIL] Could not find tabs block');
}

// 2. Update header title + add share link button
const OLD_HEADER_H2 = `        <h2 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">ระบบจองคิวลงดันเจี้ยน</h2>
        <div id="dungeonAdminControls" style="display:flex; gap:8px; align-items:center;"></div>`;

const NEW_HEADER_H2 = `        <div>
          <h2 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">ระบบจองคิว ดันมายา (Maya)</h2>
          <div style="font-size:12px; opacity:0.8; margin-top:2px;">5 คนต่อทีม · ฟรีคิว 1 ตัวละครต่อรอบ</div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <button onclick="window.copyDungeonBookingLink()" style="background:rgba(255,255,255,0.18); border:1.5px solid rgba(255,255,255,0.5); color:white; border-radius:8px; padding:8px 14px; cursor:pointer; font-size:13px; font-weight:700;">🔗 แชร์ลิงค์จองคิว</button>
          <div id="dungeonAdminControls" style="display:flex; gap:8px; align-items:center;"></div>
        </div>`;

if (html.includes(OLD_HEADER_H2)) {
  html = html.replace(OLD_HEADER_H2, NEW_HEADER_H2);
  console.log('[OK] Updated header');
} else {
  console.log('[FAIL] Could not find header h2');
}

// 3. Update booking form title
const OLD_FORM_TITLE = `          <h3 style="margin:0 0 20px 0; font-size:16px; color:var(--blue-700); font-weight:700;">จองคิวลงดัน</h3>`;
const NEW_FORM_TITLE = `          <h3 style="margin:0 0 4px 0; font-size:16px; color:var(--blue-700); font-weight:700;">จองคิวดันมายา</h3>
          <div style="font-size:12px; color:var(--text-lo); margin-bottom:20px;">จองได้ 1 ตัวละคร ต่อ 1 รอบการจอง</div>`;

if (html.includes(OLD_FORM_TITLE)) {
  html = html.replace(OLD_FORM_TITLE, NEW_FORM_TITLE);
  console.log('[OK] Updated form title');
} else {
  console.log('[FAIL] Could not find form title');
}

// 4. Replace dungeon dropdown + its label with hidden input
const OLD_DUNGEON_SELECT = `          <label style="font-size:11px; font-weight:700; color:var(--text-lo); display:block; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">ดันเจี้ยน</label>
          <select id="dqDungeon" class="form-control" style="font-size:15px; padding:12px 14px; height:48px; width:100%; box-sizing:border-box; margin-bottom:20px;">
            <option value="มายา (Maya)">ดันมายา (5 คน)</option>
            <option value="บับเบิ้ล (Bubble)">ดันบับเบิ้ล (10 คน)</option>
            <option value="กระจก (Mirror)">ดันกระจก (10 คน)</option>
          </select>`;

const NEW_DUNGEON_SELECT = `          <!-- Fixed to Maya only -->
          <input type="hidden" id="dqDungeon" value="มายา (Maya)">`;

if (html.includes(OLD_DUNGEON_SELECT)) {
  html = html.replace(OLD_DUNGEON_SELECT, NEW_DUNGEON_SELECT);
  console.log('[OK] Replaced dungeon dropdown with hidden input');
} else {
  console.log('[FAIL] Could not find dungeon dropdown');
}

// 5. Update book button text
const OLD_BTN = `onclick="bookDungeonQueue()">จองคิวลงดันเจี้ยน</button>`;
const NEW_BTN = `onclick="bookDungeonQueue()">✅ จองคิวดันมายา</button>`;
if (html.includes(OLD_BTN)) {
  html = html.replace(OLD_BTN, NEW_BTN);
  console.log('[OK] Updated button text');
} else {
  console.log('[FAIL] Could not find button');
}

// 6. Update class select margin (was margin-bottom:12px, now 20px since no dungeon label below)
html = html.replace(
  `height:48px; width:100%; box-sizing:border-box; margin-bottom:12px;">
            <option value="" disabled selected>-- เลือกอาชีพ --</option>`,
  `height:48px; width:100%; box-sizing:border-box; margin-bottom:20px;">
            <option value="" disabled selected>-- เลือกอาชีพ --</option>`
);
console.log('[OK] Fixed class select margin');

// 7. Bump version
html = html.replace(/\?v=7\.23/g, '?v=7.24');
console.log('[OK] Bumped to v7.24');

fs.writeFileSync('index.html', html);
console.log('Done writing index.html');

// =================== PATCH app.js: add copyDungeonBookingLink + fix bookDungeonQueue ===================
let app = fs.readFileSync('app.js', 'utf8');

// Add copyDungeonBookingLink near the end (before last line or at a safe spot)
const COPY_LINK_FN = `
// =============================================
// Share Link for Dungeon Booking
// =============================================
window.copyDungeonBookingLink = function() {
  const url = window.location.origin + window.location.pathname.replace('index.html', '') + 'booking.html';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      if (window.showToast) window.showToast('คัดลอกลิงค์จองคิวสำเร็จ! ส่งให้เพื่อนได้เลย 🔗', 'success');
    }).catch(() => {
      prompt('คัดลอกลิงค์นี้:', url);
    });
  } else {
    prompt('คัดลอกลิงค์นี้:', url);
  }
};
`;

// Insert before the last closing line of the file
const lastIdx = app.lastIndexOf('})();');
if (lastIdx !== -1) {
  app = app.substring(0, lastIdx) + COPY_LINK_FN + '\n' + app.substring(lastIdx);
  console.log('[OK] Added copyDungeonBookingLink to app.js');
} else {
  app += COPY_LINK_FN;
  console.log('[OK] Appended copyDungeonBookingLink to app.js');
}

fs.writeFileSync('app.js', app);
console.log('Done writing app.js');
