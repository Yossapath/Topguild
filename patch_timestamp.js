const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Add Timestamp
const targetRegex = /\$\{q\.power \? `<span style="font-size:11px; color:var\(--text-lo\);">⚡\$\{Number\(q\.power\)\.toLocaleString\('en-US'\)}<\/span>` : ''\}\s*<\/div>/;

const replacement = `\${q.power ? \`<span style="font-size:11px; color:var(--text-lo);">⚡\${Number(q.power).toLocaleString('en-US')}</span>\` : ''}
              \${q.timestamp ? \`<div style="font-size: 10.5px; color: var(--text-lo); margin-top: 5px; display: flex; align-items: center; gap: 4px;"><span style="opacity: 0.6;">🕒</span> \${new Date(q.timestamp).toLocaleString('th-TH', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})} น.</div>\` : ''}
            </div>`;

js = js.replace(targetRegex, replacement);

// 2. Fix handleRegister duplication
const targetRegRegex = /\/\/ Auto-add to Roster[\s\S]*?if \(typeof window\.renderAll === 'function'\) window\.renderAll\(\);\s*\}/;

const replaceReg = `// Auto-add to Roster
    if (window.guildRoster && window.saveState) {
        let found = false;
        Object.keys(window.guildRoster).forEach(jobKey => {
            const existing = (window.guildRoster[jobKey] || []).find(m => m.name.toLowerCase() === u.toLowerCase());
            if (existing) {
                found = true;
            }
        });
        
        if (!found) {
            if (!window.guildRoster[j]) window.guildRoster[j] = [];
            window.guildRoster[j].push({ name: u, power: 0, fieldPref: 'any' });
            window.saveState();
            if (typeof window.renderAll === 'function') window.renderAll();
        }
    }`;

js = js.replace(targetRegRegex, replaceReg);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched with Regex');
