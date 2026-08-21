const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
let app = fs.readFileSync('app.js', 'utf8');
let auth = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Manage Users Scrollable
index = index.replace('<div id="adminUsersList" style="flex: 1; overflow-y: auto; padding: 16px;">', '<div id="adminUsersList" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding: 16px; max-height: calc(100vh - 120px);">');

// 2. Lock button in Main/Sub field -> Yellow
app = app.replace(/background:\$\{locked\?'#ffffff':'#ef4444'\};/g, "background:${locked?'#ffffff':'#eab308'};");

// 3. Attendance metrics & emojis
const attSummaryRegex = /summaryDiv\.innerHTML = `[\s\S]*?`;/;
const newAttSummary = `summaryDiv.innerHTML = \`
      <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom: 10px; background:var(--bg-soft); padding: 12px; border-radius: 8px; border: 1px solid var(--line); font-size: 15px; font-weight: 600;">
        <span style="color:var(--text-hi);">ทั้งหมด: \${totalCount} คน</span>
        <span style="color:var(--line);">|</span>
        <span style="color:var(--ok);">มา: \${joinedCount} คน</span>
        <span style="color:var(--line);">|</span>
        <span style="color:var(--warn);">ลา: \${leaveCount} คน</span>
        <span style="color:var(--line);">|</span>
        <span style="color:var(--danger);">ขาด: \${absentCount} คน</span>
      </div>
    \`;`;
auth = auth.replace(attSummaryRegex, newAttSummary);

auth = auth.replace(/<option value="leave" \$\{status === 'leave' \? 'selected' : ''\}>🟡 ลา<\/option>/g, `<option value="leave" \${status === 'leave' ? 'selected' : ''}>ลา</option>`);
index = index.replace(/✨ ออโต้สร้างตารางสัปดาห์นี้/g, 'ออโต้สร้างตารางสัปดาห์นี้');

// 4. Header bar borders
// Top controls bar separation
index = index.replace(/<div style="display: flex; background: #ffffff; border: 1px solid #d1d5db; border-radius: 20px; padding: 2px; box-shadow: inset 0 2px 4px rgba\(0,0,0,0\.05\);" class="switch-container"/, '<span style="color: var(--line); font-size: 20px;">|</span>\n      <div style="display: flex; background: #ffffff; border: 1px solid #d1d5db; border-radius: 20px; padding: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);" class="switch-container"');
index = index.replace(/<button type="button" class="btn-solid-blue" id="btnThemeToggle"/, '<span style="color: var(--line); font-size: 20px;">|</span>\n      <button type="button" class="btn-solid-blue" id="btnThemeToggle"');

// 5. Auto Team emojis
app = app.replace(/✨ จัดทีมออโต้/g, 'จัดทีมออโต้');

// 6. Dungeon Team headers sizing and borders
auth = auth.replace(/padding:10px 20px;border-radius:20px;border:1px solid var\(--line\);/g, 'padding:12px 28px;border-radius:12px;border:2px solid var(--blue-500);font-size:16px;');
// Need to find in index.html too if it exists
index = index.replace(/padding: 8px 16px; border-radius: 20px; border: 1px solid var\(--line\); background: transparent; color: var\(--text-lo\); font-weight: 600; font-size: 14px; cursor: pointer;/g, 'padding: 12px 28px; border-radius: 12px; border: 2px solid var(--line); background: transparent; color: var(--text-lo); font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s;');
index = index.replace(/padding: 8px 16px; border-radius: 20px; border: 1px solid var\(--line\); background: var\(--blue-600\); color: white; font-weight: 600; font-size: 14px; cursor: pointer;/g, 'padding: 12px 28px; border-radius: 12px; border: 2px solid var(--blue-600); background: var(--blue-600); color: white; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s;');

// 7. Dropdown scroll fix
// Change blur / scroll behavior
// It was already fixed by removing useCapture `true` or checking e.target. Wait, my previous patch did NOT rewrite the scroll listener because I didn't run it! I only wrote it in thought. Let's fix it now!
const scrollListenerRegex = /window\.addEventListener\('scroll', \(\) => \{[\s\S]*?\}, true\);/;
const newScrollListener = `window.addEventListener('scroll', (e) => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown && dropdown.style.display === 'block') {
    if (!dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  }
}, true);`;
auth = auth.replace(scrollListenerRegex, newScrollListener);

// 8. Emojis in Guide Modal
index = index.replace(/👋 /g, '');
index = index.replace(/📌 /g, '');
index = index.replace(/🏰 /g, '');
index = index.replace(/👍/g, '');

fs.writeFileSync('index.html', index, 'utf8');
fs.writeFileSync('app.js', app, 'utf8');
fs.writeFileSync('auth_dungeon.js', auth, 'utf8');
console.log('User requests patched.');
