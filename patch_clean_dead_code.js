const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// Remove the old leaveNameInput event listeners
const deadCodeRegex = /const leaveNameInput = document\.getElementById\('leaveName'\);[\s\S]*?setTimeout\(\(\) => \{ leaveNameDropdown\.style\.display = 'none'; \}, 150\);\s*\}\);\s*\}/;
js = js.replace(deadCodeRegex, '// Cleaned old leave dropdown');
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Cleaned dead code');
