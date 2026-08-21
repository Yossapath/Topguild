const fs = require('fs');
const auth = fs.readFileSync('auth_dungeon.js', 'utf8');
const start = auth.indexOf("const tArea = document.getElementById('dungeonTeamsArea');");
console.log(auth.substring(start, start + 4000));
