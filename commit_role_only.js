const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Temporarily revert responsive change
js = js.replace('<div class="team-card" style="width: 100%;">', '<div class="team-card" style="min-width: 420px; max-width: 100%;">');
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
