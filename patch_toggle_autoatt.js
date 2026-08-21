const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const regex = /const btnAdminCreateAtt = document.getElementById\('btnAdminCreateAttendance'\);\s*if \(btnAdminCreateAtt\) btnAdminCreateAtt\.style\.display = isAdmin \? 'block' : 'none';/;
const replace = `$&
  const btnAdminAutoAtt = document.getElementById('btnAdminAutoAttendance');
  if (btnAdminAutoAtt) btnAdminAutoAtt.style.display = isAdmin ? 'block' : 'none';`;
  
js = js.replace(regex, replace);
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched Auto Att UI Toggle');
