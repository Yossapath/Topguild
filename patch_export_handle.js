const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const target = "window.guildRoster = guildRoster;";
const replacement = `window.guildRoster = guildRoster;
  window.handleNameChange = handleNameChange;`;

if (!code.includes('window.handleNameChange = handleNameChange;')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('app.js', code, 'utf8');
  console.log('Exported handleNameChange');
}
