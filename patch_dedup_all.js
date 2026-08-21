const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const targetRegex = /let allMembers = \[\];\s*if \(window\.guildRoster\) \{\s*Object\.keys\(window\.guildRoster\)\.forEach\([^)]+\) => \{\s*\(window\.guildRoster\[[^\]]+\] \|\| \[\]\)\.forEach\(m => \{\s*allMembers\.push\(\{ name: m\.name, job(?:, power: m\.power)? \}\);\s*\}\);\s*\}\);\s*\}/g;

const replaceStr = `let allMembers = [];
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

js = js.replace(targetRegex, replaceStr);

// There is a second occurrence in renderAttendanceStats that looks slightly different:
// allMembers.push(...window.guildRoster[j]);
const targetRegex2 = /let allMembers = \[\];\s*if \(window\.guildRoster\) \{\s*Object\.keys\(window\.guildRoster\)\.forEach\(j => \{\s*allMembers\.push\(\.\.\.window\.guildRoster\[j\]\);\s*\}\);\s*\}/g;

js = js.replace(targetRegex2, replaceStr);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched all dedup');
