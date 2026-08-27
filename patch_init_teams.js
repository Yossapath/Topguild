const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regexInit = /if \(safeTeamsData\.length === 1\) \{\s*safeTeamsData\.push\(\{\s*"title": "สนามรอง",\s*"teams": \{ "ทีม 1": \[\{\},\{\},\{\},\{\},\{\}\] \}\s*\}\);\s*\}/;
const replaceInit = `if (safeTeamsData.length === 1) {
    safeTeamsData.push({
      "title": "สนามรอง",
      "teams": { "ทีม 1": [{},{},{},{},{}] }
    });
  }
  if (safeTeamsData.length === 2) {
    safeTeamsData.push({
      "title": "ออฟไลน์",
      "teams": { "ทีม 1": [{},{},{},{},{}] }
    });
  }`;

if (code.match(regexInit)) {
  code = code.replace(regexInit, replaceInit);
  fs.writeFileSync('app.js', code);
  console.log('Patched initTeamStructure');
} else {
  console.log('initTeamStructure match failed');
}
