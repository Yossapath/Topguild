const fs = require('fs');

function checkExports(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const onclicks = txt.match(/onclick=\"(window\.)?(\w+)\(/g) || [];
  const missing = [];
  onclicks.forEach(o => {
    let f = o.replace('onclick="', '').replace('window.', '').replace('(', '');
    // Ignore inline js
    if (f === 'event' || f === 'console' || f === 'document') return;
    
    const definedWindow = txt.indexOf('window.' + f + ' =') !== -1;
    const definedFunc = txt.indexOf('function ' + f) !== -1;
    if (!definedWindow && !definedFunc) {
      // It might be in another file. Let's check other files.
      missing.push(f);
    }
  });
  return [...new Set(missing)];
}

const allMissing = {};
['app.js', 'module_auth.js', 'module_dungeon.js', 'module_attendance.js', 'module_leave.js'].forEach(f => {
  allMissing[f] = checkExports(f);
});

console.log(allMissing);
