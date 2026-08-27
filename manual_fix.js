const fs = require('fs');

function manualFix(filename) {
  let lines = fs.readFileSync(filename, 'utf8').split('\n');
  let i = lines.findIndex(l => l.includes('return !isOnLeave;'));
  if (i > -1) {
    // lines[i] is return !isOnLeave;
    // lines[i+1] is });
    // lines[i+2] is }
    // lines[i+3] is }
    // Wait, where did the extra brace go? 
    // Let me print them out
    console.log(filename, 'found at', i);
    console.log(lines[i]);
    console.log(lines[i+1]);
    console.log(lines[i+2]);
    console.log(lines[i+3]);
    console.log(lines[i+4]);
    
    // If lines[i+4] is empty or val = filterText, then we have:
    // return !isOnLeave;
    // });
    // }
    // }
    
    // In my patch I did:
    // const targetLeaveEnd = `return !isOnLeave;\n          });\n        }`;
    // const replaceLeaveEnd = `return !isOnLeave;\n          });\n        }\n        }`;
    
    // If I just remove the extra brace:
    if (lines[i+3].trim() === '}') {
      if (lines[i+4].trim() === '}') {
        lines.splice(i+4, 1);
        console.log('Removed extra brace at', i+4);
      } else if (lines[i+2].trim() === '}') {
        if (lines[i+3].trim() === '}') {
          lines.splice(i+3, 1);
          console.log('Removed extra brace at', i+3);
        }
      }
    }
    fs.writeFileSync(filename, lines.join('\n'));
  }
}

manualFix('module_auth.js');
