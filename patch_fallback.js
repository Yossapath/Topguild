const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /if \(!safeTeamsData \|\| safeTeamsData\.length === 0\) \{\s*safeTeamsData = \[\];\s*\}/;
const replace = `if (!safeTeamsData || safeTeamsData.length === 0) {
    safeTeamsData = [{
      "title": "สนามหลัก",
      "teams": { "ทีม 1": [{},{},{},{},{}] }
    }];
  }`;

code = code.replace(regex, replace);
fs.writeFileSync('app.js', code);
console.log('Patched fallback');
