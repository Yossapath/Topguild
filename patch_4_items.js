const fs = require('fs');

// 1. STYLES.CSS
let css = fs.readFileSync('styles.css', 'utf8');
const newCss = `
.dungeon-tab {
  padding: 12px 24px !important;
  border: 2px solid var(--blue-300, #93c5fd) !important;
  background: transparent !important;
  color: var(--text-lo) !important;
  border-radius: 8px !important; /* Square-ish rectangle */
  font-weight: 700 !important;
  font-size: 15px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}
.dungeon-tab:hover {
  background: var(--bg-soft) !important;
}
.dungeon-tab.active {
  background: var(--blue-600, #2563eb) !important;
  color: #ffffff !important;
  border-color: var(--blue-600, #2563eb) !important;
  box-shadow: 0 2px 4px rgba(37,99,235,0.2) !important;
}
[data-theme="dark"] .dungeon-tab {
  border-color: var(--blue-700, #1d4ed8) !important;
}
`;
if (!css.includes('.dungeon-tab {')) {
  css += '\n' + newCss;
}
fs.writeFileSync('styles.css', css, 'utf8');

// 2. INDEX.HTML
let index = fs.readFileSync('index.html', 'utf8');
// Clean up inline styles for tabs
index = index.replace(/style="padding: 6px 16px; border: none; background: #[0-9a-fA-F]+; color: white; border-radius: 20px; font-weight: 600; cursor: pointer; transition: 0\.2s;"/g, '');
index = index.replace(/style="padding: 6px 16px; border: none; background: transparent; color: var\(--text-lo\); border-radius: 20px; font-weight: 600; cursor: pointer; transition: 0\.2s;"/g, '');
// Also fix the flex container spacing
index = index.replace('id="dungeonTabsContainer" style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid var(--line); padding-bottom: 8px;"', 'id="dungeonTabsContainer" style="display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid var(--line); padding-bottom: 16px;"');
fs.writeFileSync('index.html', index, 'utf8');

// 3. AUTH_DUNGEON.JS
let auth = fs.readFileSync('auth_dungeon.js', 'utf8');
// Clean up switchDungeonTab inline styling
auth = auth.replace(/btn\.style\.background = 'transparent';\s*btn\.style\.color = 'var\(--text-lo\)';/g, '');
auth = auth.replace(/btn\.style\.background = '#2563eb';\s*btn\.style\.color = 'white';/g, '');

// Modify Queue list to check team assignment
const qListRegex = /const sColor = q\.status === 'done' \? 'var\(--ok\)' : \(q\.status === 'active' \? 'var\(--blue-500\)' : 'var\(--warn\)'\);\s*const sText = q\.status === 'done' \? 'สำเร็จ' : \(q\.status === 'active' \? 'กำลังลงดัน' : 'รอลงดัน'\);/;

const newQListLogic = `
          // Check if in team
          const currentTeams = dungeonData.teams.filter(t => t.type === currentTab);
          let inTeamIndex = -1;
          currentTeams.forEach((team, tIdx) => {
            if (team.members.some(m => m && m.name && m.name.toLowerCase() === q.name.toLowerCase())) {
              inTeamIndex = tIdx + 1;
            }
          });

          let sColor, sText;
          if (inTeamIndex !== -1) {
            sColor = '#8b5cf6'; // Purple
            sText = 'อยู่ในทีม ' + inTeamIndex;
          } else {
            sColor = q.status === 'done' ? 'var(--ok)' : (q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)');
            sText = q.status === 'done' ? 'สำเร็จ' : (q.status === 'active' ? 'กำลังลงดัน' : 'รอลงดัน');
          }
`;
auth = auth.replace(qListRegex, newQListLogic);

// Add team number to the team card
const teamMapRegex = /tArea\.innerHTML = teamsForTab\.map\(t => \{/g;
auth = auth.replace(teamMapRegex, 'tArea.innerHTML = teamsForTab.map((t, teamIdx) => {');

const teamTitleRegex = /<span style="font-size:16px;">\$\{window\.escapeHtml \? window\.escapeHtml\(t\.dungeonName \|\| t\.type\) : \(t\.dungeonName \|\| t\.type\)\}<\/span>/;
const newTeamTitle = `<span style="font-size:16px;">\${window.escapeHtml ? window.escapeHtml(t.dungeonName || t.type) : (t.dungeonName || t.type)} <span style="color:var(--text-lo); font-size:14px; font-weight:normal; margin-left:8px;">(ทีมที่ \${teamIdx + 1})</span></span>`;
auth = auth.replace(teamTitleRegex, newTeamTitle);

// 4. Attendance spacing
const oldAttSpacing = /<div style="display:flex; justify-content:space-around; align-items:center; margin-bottom: 10px; background:var\(--bg-soft\); padding: 12px; border-radius: 8px; border: 1px solid var\(--line\); font-size: 15px; font-weight: 600;">\s*<span style="color:var\(--text-hi\);">ทั้งหมด: \$\{totalCount\} คน<\/span>\s*<span style="color:var\(--line\);">\|<\/span>\s*<span style="color:var\(--ok\);">มา: \$\{joinedCount\} คน<\/span>\s*<span style="color:var\(--line\);">\|<\/span>\s*<span style="color:var\(--warn\);">ลา: \$\{leaveCount\} คน<\/span>\s*<span style="color:var\(--line\);">\|<\/span>\s*<span style="color:var\(--danger\);">ขาด: \$\{absentCount\} คน<\/span>\s*<\/div>/;

const newAttSpacing = `<div style="display:flex; justify-content:center; align-items:center; margin-bottom: 10px; background:var(--bg-soft); padding: 12px; border-radius: 8px; border: 1px solid var(--line); font-size: 15px; font-weight: 600;">
        <span style="color:var(--text-hi);">ทั้งหมด : \${totalCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--ok);">มา : \${joinedCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--warn);">ลา : \${leaveCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--danger);">ขาด : \${absentCount} คน</span>
      </div>`;
auth = auth.replace(oldAttSpacing, newAttSpacing);


fs.writeFileSync('auth_dungeon.js', auth, 'utf8');

// 5. App.js Lock button Yellow
let app = fs.readFileSync('app.js', 'utf8');
// Replace eab308 with facc15 and adjust text color so it's black for better contrast on bright yellow
const oldLockBtn = `style="background:\${locked?'#ffffff':'#eab308'};border:none;color:\${locked?'#2563eb':'#ffffff'};`;
const newLockBtn = `style="background:\${locked?'#ffffff':'#facc15'};border:none;color:\${locked?'#2563eb':'#000000'};`;
app = app.replace(oldLockBtn, newLockBtn);
// Also for the other condition if we missed it
app = app.replace(/background:\$\{locked\?'#ffffff':'#[a-f0-9]+'\};border:none;color:\$\{locked\?'#2563eb':'#ffffff'\};/g, `background:\${locked?'#ffffff':'#facc15'};border:none;color:\${locked?'#2563eb':'#000000'};`);

fs.writeFileSync('app.js', app, 'utf8');

console.log('Update applied');
