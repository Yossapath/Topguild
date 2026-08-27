const fs = require('fs');

let code = fs.readFileSync('module_attendance.js', 'utf8');

const target = `if (window.occupiedMap && window.occupiedMap.has(lowerName)) {
            if (window.occupiedMap.get(lowerName) !== slotKey) return false;
          }`;

const replace = `if (window.occupiedMap && window.occupiedMap.has(lowerName)) {
            const occKey = window.occupiedMap.get(lowerName);
            if (occKey !== slotKey && !(slotKey && slotKey.startsWith('2|'))) return false;
          }`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('module_attendance.js', code);
  console.log('Patched module_attendance.js occupied check');
} else {
  console.log('Could not find target in module_attendance.js');
}
