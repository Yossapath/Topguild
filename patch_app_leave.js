const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const targetCall = `if (window.setupAttendanceFirebase) window.setupAttendanceFirebase();`;
const replacement = `if (window.setupAttendanceFirebase) window.setupAttendanceFirebase();
    if (window.setupLeaveFirebase) window.setupLeaveFirebase();`;
appJs = appJs.replace(targetCall, replacement);

fs.writeFileSync('app.js', appJs, 'utf8');

let authJs = fs.readFileSync('auth_dungeon.js', 'utf8');
authJs += `\nwindow.setupLeaveFirebase = setupLeaveFirebase;\n`;
fs.writeFileSync('auth_dungeon.js', authJs, 'utf8');

console.log('Hooked setupLeaveFirebase');
