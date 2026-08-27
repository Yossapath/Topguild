const fs = require('fs');
let lines = fs.readFileSync('module_attendance.js', 'utf8').split('\n');
let i = lines.findIndex(l => l.includes('return !isOnLeave;'));
if (i > -1) {
  // Check if lines[i+3] is }
  if (lines[i+3].trim() === 'if (action === \'mainField\') {') {
    lines.splice(i+3, 0, '    }');
    fs.writeFileSync('module_attendance.js', lines.join('\n'));
    console.log('Added 3rd brace to module_attendance.js');
  } else {
    // maybe it already has 3?
    console.log('line i+3 is', lines[i+3]);
    if (lines[i+4].trim() === 'if (action === \'mainField\') {') {
        console.log('It already has 3 braces.');
    }
  }
}
