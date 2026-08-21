const fs = require('fs');
let txt = fs.readFileSync('module_dungeon.js', 'utf8');

// Strip out invalid auth exports
txt = txt.replace('window.ensureDefaultAdmin = ensureDefaultAdmin;', '');
txt = txt.replace('window.checkAuth = checkAuth;', '');
txt = txt.replace('window.handleLogin = handleLogin;', '');
txt = txt.replace('window.handleLogout = handleLogout;', '');

fs.writeFileSync('module_dungeon.js', txt, 'utf8');
console.log('Cleaned up dungeon exports!');
