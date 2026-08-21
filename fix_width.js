const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

js = js.replace(
  '<div class="team-card" style="min-width: 320px;">',
  '<div class="team-card" style="min-width: 420px; max-width: 100%;">'
);

// Add immediate auth check to avoid login screen flash
js += `
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('guild_current_user');
  if (saved) {
    try {
      window.currentUser = JSON.parse(saved);
      if (typeof showMainApp === 'function') showMainApp();
      if (typeof applyRolePermissions === 'function') applyRolePermissions();
    } catch(e) {}
  }
});
`;

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('patched');
