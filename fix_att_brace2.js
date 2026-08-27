const fs = require('fs');

function fixModule(filename) {
  let lines = fs.readFileSync(filename, 'utf8').split('\n');
  let i = lines.findIndex(l => l.includes('return !isOnLeave;'));
  if (i > -1) {
    if (lines[i+3].trim() === '}') {
      if (lines[i+4].trim() === '') {
        if (lines[i+5].includes('if (action === \'mainField\')')) {
          lines.splice(i+4, 0, '    }'); // Add the 3rd brace
          fs.writeFileSync(filename, lines.join('\n'));
          console.log('Fixed ' + filename);
        }
      }
    }
  }
}

fixModule('module_attendance.js');
