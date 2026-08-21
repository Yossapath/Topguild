const fs = require('fs');

let auth = fs.readFileSync('auth_dungeon.js', 'utf8');
let app = fs.readFileSync('app.js', 'utf8');

const regex = /const isAdmin = [^;]+;/g;
const replace = "const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : ''; const isAdmin = (userRole === 'admin' || userRole === 'owner' || userRole === 'หัวหน้ากิลด์');";

auth = auth.replace(regex, replace);
app = app.replace(regex, replace);

fs.writeFileSync('auth_dungeon.js', auth, 'utf8');
fs.writeFileSync('app.js', app, 'utf8');
console.log('Fixed all isAdmin occurrences');
