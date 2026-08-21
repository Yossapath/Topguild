const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const target = "window.guildRoster = guildRoster;";
const replacement = `window.guildRoster = guildRoster;
  window.occupiedMap = occupiedMap;
  window.rowJobFilter = rowJobFilter;
  window.teamsAssignments = teamsAssignments;`;

if (code.includes(target) && !code.includes('window.occupiedMap = occupiedMap;')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('app.js', code, 'utf8');
  console.log('Exported missing variables to window');
} else {
  console.log('Target not found or already exported');
}
