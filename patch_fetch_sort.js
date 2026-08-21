const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const fetchTarget = `cachedAdminUsers.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return (a.username || '').localeCompare(b.username || '');
      });`;
      
const fetchReplace = `cachedAdminUsers.sort((a, b) => {
        const rA = (a.role || 'member').toLowerCase();
        const rB = (b.role || 'member').toLowerCase();
        if (rA === 'admin' && rB !== 'admin') return -1;
        if (rA !== 'admin' && rB === 'admin') return 1;
        return (a.username || '').localeCompare(b.username || '');
      });`;

if (code.includes(fetchTarget)) {
  code = code.replace(fetchTarget, fetchReplace);
  fs.writeFileSync('auth_dungeon.js', code, 'utf8');
  console.log('Replaced fetch logic!');
} else {
  console.log('Fetch target not found, already applied?');
}
