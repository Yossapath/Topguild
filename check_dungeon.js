const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const lines = h.split('\n');
const idx = lines.findIndex(l => l.includes('page-dungeons') && l.includes('section'));
console.log('dungeon section at line:', idx + 1);
if (idx >= 0) {
  console.log(lines.slice(idx, idx + 15).join('\n'));
} else {
  console.log('NOT FOUND - checking all occurrences of page-dungeons:');
  lines.forEach((l, i) => { if (l.includes('page-dungeons')) console.log(i+1, l.trim()); });
}
