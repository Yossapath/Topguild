const fs = require('fs');

function fixFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // replace .toLowerCase() on names with robust trim
  // \b([a-zA-Z0-9_]+)\.name\??\.toLowerCase\(\) -> ( $1.name || '' ).trim().toLowerCase()
  content = content.replace(/\b([a-zA-Z0-9_]+)\.name\??\.toLowerCase\(\)/g, "($1.name || '').trim().toLowerCase()");
  
  // Also fix Object.keys(statsMap).find(k => k.toLowerCase() === name.toLowerCase())
  content = content.replace(/k\.toLowerCase\(\) === name\.toLowerCase\(\)/g, "(k || '').trim().toLowerCase() === (name || '').trim().toLowerCase()");
  
  // What if it is just name?.toLowerCase() ?
  content = content.replace(/\bname\??\.toLowerCase\(\)/g, "(name || '').trim().toLowerCase()");
  
  // n.toLowerCase() -> (n || '').trim().toLowerCase() where it's used in booking.html: n.toLowerCase()
  content = content.replace(/\bn\.toLowerCase\(\)/g, "(n || '').trim().toLowerCase()");
  
  // val.toLowerCase()
  content = content.replace(/\bval\.toLowerCase\(\)/g, "(val || '').trim().toLowerCase()");

  // memberName.toLowerCase()
  content = content.replace(/\bmemberName\??\.toLowerCase\(\)/g, "(memberName || '').trim().toLowerCase()");

  fs.writeFileSync(file, content);
}

['booking.html', 'app.js', 'index.html', 'module_attendance.js', 'module_dungeon.js', 'module_auth.js', 'module_leave.js'].forEach(fixFile);
console.log('Fixed names to include trim()');
