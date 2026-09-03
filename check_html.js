const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const lines = h.split('\n');
console.log('total lines:', lines.length);
console.log('has id=page-dungeons:', h.indexOf('id="page-dungeons"') !== -1);
console.log('has dungeonTeamsArea:', h.indexOf('dungeonTeamsArea') !== -1);
console.log('has dqDungeon:', h.indexOf('dqDungeon') !== -1);
console.log('has copyDungeonBookingLink:', h.indexOf('copyDungeonBookingLink') !== -1);

// Find all section tags
lines.forEach((l, i) => {
  if (l.includes('<section id=')) console.log('section at line', i+1, ':', l.trim().substring(0,60));
});
