const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
let app = fs.readFileSync('app.js', 'utf8');
let auth = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Lock/Unlock Swap
app = app.replace(/\$\{locked\?'ล็อก \(Lock\)':'ปลดล็อก \(Unlock\)'\}/g, "${locked?'ปลดล็อก (Unlock)':'ล็อก (Lock)'}");
app = app.replace(/\background:\$\{locked\?'#ef4444':'#ffffff'\}/g, "background:${locked?'#ffffff':'#2563eb'}");
app = app.replace(/color:\$\{locked\?'white':'#2563eb'\}/g, "color:${locked?'#2563eb':'white'}");
// Wait, if it's locked, the button is "Unlock" -> so background white, color blue.
// If it's unlocked, the button is "Lock" -> so background blue, color white.
// Let's rewrite the whole button string for clarity!
const lockBtnTarget = /<button type="button" onclick="window\.toggleLockTeam[^>]*>[^<]*<\/button>/g;
const newLockBtn = `<button type="button" onclick="window.toggleLockTeam(\${currentFieldIdx}, '\${escapeHtml(teamName)}')" style="background:\${locked?'#ffffff':'#2563eb'};border:none;color:\${locked?'#2563eb':'#ffffff'};border-radius:20px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:700;box-shadow:0 2px 4px rgba(0,0,0,0.1);">\${locked?'ปลดล็อก (Unlock)':'ล็อก (Lock)'}</button>`;
app = app.replace(lockBtnTarget, newLockBtn);


// 2. Admin Logic fix
const adminLogicSearch = "const isAdmin = window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin';";
const adminLogicReplace = "const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : ''; const isAdmin = (userRole === 'admin' || userRole === 'owner' || userRole === 'หัวหน้ากิลด์');";
auth = auth.split(adminLogicSearch).join(adminLogicReplace);
app = app.split(adminLogicSearch).join(adminLogicReplace);


// 3. Subtitle Removal
index = index.replace(/<div class="subtitle">รายชื่อสมาชิกแยกตามอาชีพ และการจัดทีมลงสนามหลัก \/ สนามรอง \(ซิงค์ข้อมูล Real-time\)<\/div>/g, '<div class="subtitle" style="display:none;"></div>');


// 4. Styles for buttons (Solid Blue for Admin, Guide, Theme)
// Add CSS for .btn-solid-blue
const cssAdd = `
.btn-solid-blue {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-family: var(--font-display, 'Prompt', sans-serif) !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  text-decoration: none !important;
  background: #2563eb !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06) !important;
}
.btn-solid-blue:hover {
  background: #1d4ed8 !important;
  transform: translateY(-1px) !important;
}
`;
index = index.replace('/* Header */', cssAdd + '\n/* Header */');

// Apply .btn-solid-blue
index = index.replace(/<button type="button" class="btn-secondary btn-blue-theme" id="btnAdminUsers"/g, '<button type="button" class="btn-solid-blue" id="btnAdminUsers"');
index = index.replace(/<button type="button" class="btn-secondary btn-blue-theme" id="btnThemeToggle"/g, '<button type="button" class="btn-solid-blue" id="btnThemeToggle"');
index = index.replace(/<button type="button" class="btn-secondary btn-blue-theme" id="btnOpenGuideModal"/g, '<button type="button" class="btn-solid-blue" id="btnOpenGuideModal"');


// 5. Perfect Center Login
const authWrapMatch = /<div id="authWrap"[^>]*>/;
const newAuthWrap = `<div id="authWrap" style="display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; background: #f4f7fb; z-index: 10000; overflow-y: auto; box-sizing: border-box; font-family: var(--font-display, 'Prompt', sans-serif);">`;
index = index.replace(authWrapMatch, newAuthWrap);

const innerFlexMatch = /<div style="display: flex; flex-direction: row; width: 100%; max-width: 1000px; padding: 40px 20px; gap: 80px; align-items: center; justify-content: center; flex-wrap: wrap;">/;
const newInnerFlex = `<div style="display: flex; flex-direction: row; width: 100%; max-width: 1000px; padding: 40px 20px; gap: 80px; align-items: center; justify-content: center; flex-wrap: wrap; margin: auto; position: relative;">`;
index = index.replace(/<div style="display: flex; flex-direction: row; width: 100%; max-width: 1000px; padding: 40px 20px; gap: 80px; align-items: center; justify-content: center; flex-wrap: wrap;">/g, newInnerFlex);
// In case the previous margin: auto removal missed something:
index = index.replace(/margin: auto;/g, 'margin: auto; ');


// 6. Logout Loading State
const logoutFuncMatch = /window\.handleLogout = function\(\) \{[\s\S]*?loginPassword'\)\.value = '';\s*\};/;
const newLogoutFunc = `window.handleLogout = function() {
  const btn = document.getElementById('btnLogout');
  if (btn) {
    btn.innerHTML = 'กำลังออกจากระบบ...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }
  setTimeout(() => {
    window.currentUser = null;
    localStorage.removeItem('guild_current_user');
    window.location.reload();
  }, 600);
};`;
auth = auth.replace(logoutFuncMatch, newLogoutFunc);


// 7. Attendance Table | Separator
// Look for renderAttendanceTable in auth_dungeon.js
const attTableThMatch = /<th style="width:140px;position:sticky;left:0;background:var\(--surface\);z-index:2;">ชื่อ<\/th>\s*<th style="width:100px;">อาชีพ<\/th>\s*<th>รวม \(%\)<\/th>/;
const newAttTableTh = `<th style="width:140px;position:sticky;left:0;background:var(--surface);z-index:2;border-right:2px solid var(--line);">ชื่อ</th>
            <th style="width:100px;border-right:2px solid var(--line);">อาชีพ</th>
            <th style="border-right:2px solid var(--line);">รวม (%)</th>`;
auth = auth.replace(attTableThMatch, newAttTableTh);

const attTableTdMatch = /<td style="position:sticky;left:0;background:var\(--surface\);z-index:1;font-weight:600;">\$\{m\.name\}<\/td>\s*<td style="color:\$\{jobColor\}">\$\{m\.job || '-'\}<\/td>\s*<td style="font-weight:700;color:\$\{pctColor\}">\$\{pctStr\}<\/td>/g;
const newAttTableTd = `<td style="position:sticky;left:0;background:var(--surface);z-index:1;font-weight:600;border-right:2px solid var(--line);">${m.name}</td>
          <td style="color:${jobColor};border-right:2px solid var(--line);">${m.job || '-'}</td>
          <td style="font-weight:700;color:${pctColor};border-right:2px solid var(--line);">${pctStr}</td>`;
// Note: because the replace string has variables like ${m.name}, we have to do it exactly if we use regex.
// Wait, the easiest way is to inject `border-right: 2px solid var(--line);` into those TDs dynamically.
// Let's write a targeted replace.
auth = auth.replace(/<td style="position:sticky;left:0;background:var\(--surface\);z-index:1;font-weight:600;">\$\{m\.name\}<\/td>/g, '<td style="position:sticky;left:0;background:var(--surface);z-index:1;font-weight:600;border-right:2px solid var(--line);">${m.name}</td>');
auth = auth.replace(/<td style="color:\$\{jobColor\}">\$\{m\.job \|\| '-'\}<\/td>/g, '<td style="color:${jobColor};border-right:2px solid var(--line);">${m.job || \'-\'}</td>');
auth = auth.replace(/<td style="font-weight:700;color:\$\{pctColor\}">\$\{pctStr\}<\/td>/g, '<td style="font-weight:700;color:${pctColor};border-right:2px solid var(--line);">${pctStr}</td>');

// Separator for the dates too:
auth = auth.replace(/<th style="min-width:100px;">\$\{formatDateShort\(d\)\}<\/th>/g, '<th style="min-width:100px;border-right:1px solid var(--line);">${formatDateShort(d)}</th>');
auth = auth.replace(/<td class="\$\{statusClass\}" title="\$\{d\}">\$\{statusText\}<\/td>/g, '<td class="${statusClass}" title="${d}" style="border-right:1px solid var(--line);">${statusText}</td>');


fs.writeFileSync('index.html', index, 'utf8');
fs.writeFileSync('app.js', app, 'utf8');
fs.writeFileSync('auth_dungeon.js', auth, 'utf8');
console.log('Patch complete.');
