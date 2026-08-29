const fs = require('fs');
let html = fs.readFileSync('module_dungeon.js', 'utf8');

// Update logic
html = html.replace('if (isAdmin || isOwner) {', 'if (isAdmin) {');

// Update HTML 1
html = html.replace('cursor:${isAdmin || isOwner ? \'pointer\' : \'default\'};opacity:${isAdmin || isOwner ? \'1\' : \'0.7\'}', 'cursor:${isAdmin ? \'pointer\' : \'default\'};opacity:${isAdmin ? \'1\' : \'0.7\'}');

// Update HTML 2
html = html.replace('cursor:${isAdmin || isOwner ? \'pointer\' : \'default\'};opacity:${isAdmin || isOwner ? \'1\' : \'0.7\'}', 'cursor:${isAdmin ? \'pointer\' : \'default\'};opacity:${isAdmin ? \'1\' : \'0.7\'}');

fs.writeFileSync('module_dungeon.js', html);
console.log('Updated permissions');
