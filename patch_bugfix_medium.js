const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

// Remove onclick from the HTML string in renderTeams
js = js.replace(/onclick="removeSpecificTeam\('\$\{escapeHtml\(teamName\)\}'\)"/g, '');
console.log('Removed duplicate removeSpecificTeam onclick');

fs.writeFileSync('app.js', js, 'utf8');
console.log('Medium priority patches done!');
