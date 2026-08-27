const fs = require('fs');

let lines = fs.readFileSync('module_attendance.js', 'utf8').split('\n');
let i = lines.findIndex(l => l.includes('window.occupiedMap.has(lowerName)'));
if (i > -1) {
  lines[i] = `          if (window.occupiedMap && window.occupiedMap.has(lowerName)) {`;
  lines[i+1] = `            const occKey = window.occupiedMap.get(lowerName);`;
  lines.splice(i+2, 0, `            if (occKey !== slotKey && !(slotKey && slotKey.startsWith('2|'))) return false;`);
  // we just need to replace lines[i+1] which was `if (window.occupiedMap.get(lowerName) !== slotKey) return false;`
  // so we can just replace lines[i+1] entirely.
  // wait, I'll just do it carefully.
  
  if (lines[i+2].includes('!== slotKey) return false;')) {
    // wait, splice shifts things.
    // let's do:
    lines[i+1] = `            const occKey = window.occupiedMap.get(lowerName);`;
    lines[i+2] = `            if (occKey !== slotKey && !(slotKey && slotKey.startsWith('2|'))) return false;`;
  } else if (lines[i+1].includes('!== slotKey) return false;')) {
    lines[i+1] = `            const occKey = window.occupiedMap.get(lowerName);`;
    lines.splice(i+2, 0, `            if (occKey !== slotKey && !(slotKey && slotKey.startsWith('2|'))) return false;`);
  }

  fs.writeFileSync('module_attendance.js', lines.join('\n'));
  console.log('Patched!');
} else {
  console.log('Not found');
}
