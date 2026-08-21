const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

js = js.replace(
  '<span style="opacity:0.7; margin:0 6px;">|</span> ยศ:',
  '<span style="opacity:0.7; margin:0 6px;">|</span> Role:'
);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('patched Role');
