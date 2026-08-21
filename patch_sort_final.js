const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

code = code.replace(
  "if (a.role === 'admin' && b.role !== 'admin') return -1;",
  "const rA = (a.role || 'member').toLowerCase(); const rB = (b.role || 'member').toLowerCase(); if (rA === 'admin' && rB !== 'admin') return -1;"
);

code = code.replace(
  "if (a.role !== 'admin' && b.role === 'admin') return 1;",
  "if (rA !== 'admin' && rB === 'admin') return 1;"
);

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
