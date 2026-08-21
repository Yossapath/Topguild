const fs = require('fs');
const js = fs.readFileSync('auth_dungeon.js', 'utf8');
const start = js.indexOf("const tArea = document.getElementById('dungeonTeamsArea');");
console.log(js.substring(start, start + 3000));
