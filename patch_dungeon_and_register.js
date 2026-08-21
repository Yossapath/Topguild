const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Fix handleRegister to prevent duplicates
const targetRegister = `    // Auto-add to Roster
    if (window.guildRoster && window.saveState) {
        if (!window.guildRoster[j]) window.guildRoster[j] = [];
        window.guildRoster[j].push({ name: u, power: 0, fieldPref: 'any' });
        window.saveState();
        if (typeof window.renderAll === 'function') window.renderAll();
    }`;

const replaceRegister = `    // Auto-add to Roster
    if (window.guildRoster && window.saveState) {
        let found = false;
        Object.keys(window.guildRoster).forEach(jobKey => {
            const existing = (window.guildRoster[jobKey] || []).find(m => m.name.toLowerCase() === u.toLowerCase());
            if (existing) {
                found = true;
                // If they registered with a different job, we can optionally update it, but let's just keep their original roster entry
            }
        });
        
        if (!found) {
            if (!window.guildRoster[j]) window.guildRoster[j] = [];
            window.guildRoster[j].push({ name: u, power: 0, fieldPref: 'any' });
            window.saveState();
            if (typeof window.renderAll === 'function') window.renderAll();
        }
    }`;

js = js.replace(targetRegister, replaceRegister);

// 2. Add Timestamp to Dungeon Queue rendering
const targetQueueRender = `              <span style="font-size:11px; color:var(--text-lo); margin-left:6px;">\${q.job}</span>
              \${q.power ? \`<span style="font-size:11px; color:var(--text-lo);">⚡\${Number(q.power).toLocaleString('en-US')}</span>\` : ''}
            </div>`;

const replaceQueueRender = `              <span style="font-size:11px; color:var(--text-lo); margin-left:6px;">\${q.job}</span>
              \${q.power ? \`<span style="font-size:11px; color:var(--text-lo);">⚡\${Number(q.power).toLocaleString('en-US')}</span>\` : ''}
              \${q.timestamp ? \`<div style="font-size: 10px; color: var(--text-lo); margin-top: 4px; display: flex; align-items: center; gap: 4px;"><span style="opacity: 0.7;">🕒</span> \${new Date(q.timestamp).toLocaleString('th-TH', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})} น.</div>\` : ''}
            </div>`;

js = js.replace(targetQueueRender, replaceQueueRender);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched register duplicate bug and dungeon queue timestamp');
