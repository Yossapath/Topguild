const fs = require('fs');

function fixBraces(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  
  // Find where I added the extra }
  const regex = /return !isOnLeave;\s*\}\);\s*\}\s*\}\s*\}/g;
  const match = code.match(regex);
  if (match) {
    code = code.replace(regex, `return !isOnLeave;\n        });\n      }\n    }`);
    fs.writeFileSync(filename, code);
    console.log('Fixed braces in ' + filename);
  } else {
    console.log('Regex did not match in ' + filename);
  }
}

fixBraces('module_auth.js');
fixBraces('module_attendance.js');
