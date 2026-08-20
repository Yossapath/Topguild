const fs = require('fs');
let content = fs.readFileSync('auth_dungeon.js', 'utf8');

const newFetch = "use strict";;

// Simple append
fs.writeFileSync('auth_dungeon.js', content + '\\n' + newFetch, 'utf8');
