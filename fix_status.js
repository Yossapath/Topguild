const fs = require('fs');

let content = fs.readFileSync('module_dungeon.js', 'utf8');

// Find the isAlreadyInQueue logic and add && q.status !== 'done'
content = content.replace(
  /(const isAlreadyInQueue = dungeonData\.queues\.some\(\(q\) =>\s+)(.*)(q\.dungeon === dungeon)(\s+\);)/,
  "$1$2$3 && q.status !== 'done'$4"
);

fs.writeFileSync('module_dungeon.js', content);
console.log('Fixed module_dungeon.js');
