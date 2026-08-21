const fs = require('fs');

let auth = fs.readFileSync('auth_dungeon.js', 'utf8');

const helper = `\nwindow.isUserAdmin = function() {
  const r = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : '';
  return r === 'admin' || r === 'owner' || r === 'หัวหน้ากิลด์';
};\n`;

if (!auth.includes('window.isUserAdmin =')) {
  auth = helper + auth;
}

// Replace inlined checks
// (window.currentUser.role || '').toLowerCase() === 'admin'
auth = auth.replace(/\(window\.currentUser\.role \|\| ''\)\.toLowerCase\(\) === 'admin'/g, 'window.isUserAdmin()');

// (window.currentUser.role || '').toLowerCase() !== 'admin'
auth = auth.replace(/\(window\.currentUser\.role \|\| ''\)\.toLowerCase\(\) !== 'admin'/g, '!window.isUserAdmin()');

// There might be some with spaces:
auth = auth.replace(/\(window\.currentUser\.role \|\| ''\)\s*\.\s*toLowerCase\(\)\s*===\s*'admin'/g, 'window.isUserAdmin()');
auth = auth.replace(/\(window\.currentUser\.role \|\| ''\)\s*\.\s*toLowerCase\(\)\s*!==\s*'admin'/g, '!window.isUserAdmin()');

fs.writeFileSync('auth_dungeon.js', auth, 'utf8');

// Do the same for app.js just in case, and also for the defined `const isAdmin`
let app = fs.readFileSync('app.js', 'utf8');
if (!app.includes('window.isUserAdmin =')) {
  app = helper + app;
}

// Replace the previous long line:
// const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : ''; const isAdmin = (userRole === 'admin' || userRole === 'owner' || userRole === 'หัวหน้ากิลด์');
app = app.replace(/const userRole = [^;]+; const isAdmin = [^;]+;/g, 'const isAdmin = window.isUserAdmin();');
auth = auth.replace(/const userRole = [^;]+; const isAdmin = [^;]+;/g, 'const isAdmin = window.isUserAdmin();');

fs.writeFileSync('app.js', app, 'utf8');
fs.writeFileSync('auth_dungeon.js', auth, 'utf8');

console.log('Admin logic helper applied.');
