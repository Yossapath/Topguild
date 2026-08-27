const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regexAutoAssign = /if \(mode === 'both'\) \{\s*teamsAssignments = \{\};\s*occupiedMap\.clear\(\);\s*\}/;
const replaceAutoAssign = `if (mode === 'both') {
    // Only clear Field 0 (Main) and Field 1 (Sub), preserve Field 2 (Offline)
    Object.keys(teamsAssignments).forEach(key => {
      if (key.startsWith('0|') || key.startsWith('1|')) {
        delete teamsAssignments[key];
        delete rowJobFilter[key];
      }
    });
    // Rebuild occupiedMap
    occupiedMap.clear();
    Object.keys(teamsAssignments).forEach(key => {
       const a = teamsAssignments[key];
       if (a && a.name) occupiedMap.set(a.name.trim().toLowerCase(), key);
    });
  }`;

if(code.match(regexAutoAssign)) {
  code = code.replace(regexAutoAssign, replaceAutoAssign);
  fs.writeFileSync('app.js', code);
  console.log('Patched autoOptimizeTeams');
} else {
  console.log('autoOptimizeTeams match failed');
}
