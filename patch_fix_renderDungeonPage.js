const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

js = js.replace(/window\.currentDungeonTab\.split\(' '\)\[0\]/g, "currentTab.split(' ')[0]");
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Fixed undefined split error');
