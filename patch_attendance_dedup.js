const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const target = `  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(job => {
      (window.guildRoster[job] || []).forEach(m => {
        allMembers.push({ name: m.name, job, power: m.power });
      });
    });
  }`;

const replacement = `  let allMembers = [];
  if (window.guildRoster) {
    const seen = new Map();
    Object.keys(window.guildRoster).forEach(job => {
      (window.guildRoster[job] || []).forEach(m => {
        const key = (m.name || '').toLowerCase().trim();
        if (!key) return;
        const currentPower = Number(m.power) || 0;
        
        if (seen.has(key)) {
          const existing = seen.get(key);
          if (currentPower > (Number(existing.power) || 0)) {
            seen.set(key, { name: m.name, job, power: m.power });
          }
        } else {
          seen.set(key, { name: m.name, job, power: m.power });
        }
      });
    });
    allMembers = Array.from(seen.values());
  }`;

js = js.replace(target, replacement);
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched attendance deduplication');
