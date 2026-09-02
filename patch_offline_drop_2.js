const fs = require('fs');
let lines = fs.readFileSync('app.js', 'utf8').split('\n');
lines[905] = "        <tr ondragover=\"window.onSlotDragOver(event)\" ondragleave=\"window.onSlotDragLeave(event)\" ondrop=\"window.onTeamSlotDrop(event, '${key}')\">";
fs.writeFileSync('app.js', lines.join('\n'));
console.log('Fixed offline TR');
