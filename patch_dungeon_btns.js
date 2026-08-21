const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// We want to replace the buttons at the bottom of the dungeon team card
const oldBtnsRegex = /<div style="display:flex; gap:8px; margin-top:8px;">\s*\$\{\!isAdmin \? `<button class="btn-primary" style="flex:1; border-radius:8px; padding:6px; font-size:13px;" onclick="memberJoinTeam\('\$\{t.id\}'\)">เข้าร่วมทีม<\/button>` : ''\}\s*<button class="btn-secondary" style="\$\{\!isAdmin \? 'flex:0 0 auto;' : 'flex:1;'\} border-radius:8px; padding:6px; font-size:13px; border-color: var\(--ok\); color: var\(--ok\);" onclick="clearDungeonTeam\('\$\{t.id\}'\)">✅ ลงสำเร็จ<\/button>\s*<\/div>/g;

const newBtns = `<div style="display:flex; gap:8px; margin-top:8px;">
          \${!isAdmin ? \`<button class="btn-primary" style="flex:1; border-radius:8px; padding:6px; font-size:13px;" onclick="memberJoinTeam('\${t.id}')">เข้าร่วมทีม</button>\` : ''}
          \${isAdmin ? \`<button class="btn-secondary" style="flex:1; border-radius:8px; padding:6px; font-size:13px; border-color: var(--ok); color: var(--ok);" onclick="clearDungeonTeam('\${t.id}')">✅ ลงสำเร็จ</button>\` : ''}
        </div>`;

if (oldBtnsRegex.test(code)) {
    code = code.replace(oldBtnsRegex, newBtns);
    fs.writeFileSync('auth_dungeon.js', code, 'utf8');
    console.log('Fixed dungeon buttons');
} else {
    console.log('Regex did not match. Let us try manual replace.');
    // Let's do a more robust string replace
}
