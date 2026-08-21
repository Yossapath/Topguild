const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// The line is: <div class="team-card" style="min-width: 420px; max-width: 100%;">
js = js.replace(/<div class="team-card" style="min-width: 420px; max-width: 100%;">/g, '<div class="team-card" style="width: 100%;">');

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched JS for responsiveness');
