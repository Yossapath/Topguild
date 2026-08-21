const fs = require('fs');

let authJs = fs.readFileSync('auth_dungeon.js', 'utf8');
// It currently looks like: <input type="text" class="cell-input name-input autocomplete-member" data-team-id="${t.id}" data-slot-idx="${i}" data-action="dungeonTeam" ...
authJs = authJs.replace(/<input type="text" class="cell-input name-input autocomplete-member"/g, `<input type="text" class="cell-input name-input autocomplete-member" onchange="updateDungeonTeamName('\${t.id}', \${i}, this.value)"`);
fs.writeFileSync('auth_dungeon.js', authJs, 'utf8');

console.log('Restored onchange attribute in auth_dungeon.js');
