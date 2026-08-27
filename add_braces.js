const fs = require('fs');

function addBraces(filename) {
  let lines = fs.readFileSync(filename, 'utf8').split('\n');
  let i = lines.findIndex(l => l.includes('return !isOnLeave;'));
  if (i > -1) {
    // lines[i] is return !isOnLeave;
    // lines[i+1] is });
    // lines[i+2] is }
    lines.splice(i+3, 0, '        }', '    }');
    fs.writeFileSync(filename, lines.join('\n'));
    console.log('Added 2 braces back to ' + filename);
  }
}

addBraces('module_auth.js');
