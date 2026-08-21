const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

js = js.replace(
  "Role: ${window.currentUser.role === 'admin' ? '<span style=\"color: #f59e0b; font-weight: 700;\">👑 Admin</span>' : '🛡️ Member'}",
  "Role: ${(window.currentUser.role || '').toLowerCase() === 'admin' ? '<span style=\"color: #f59e0b; font-weight: 700;\">👑 Admin</span>' : '🛡️ Member'}"
);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
