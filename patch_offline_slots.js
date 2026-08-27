const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /if \(\!a && i > offlineCount \+ 5\) continue;/;
const replace = `if (!a && i > offlineCount + 15) continue;`;

if (code.match(regex)) {
  code = code.replace(regex, replace);
  fs.writeFileSync('app.js', code);
  console.log('Patched Offline slots count to +15');
} else {
  console.log('Match failed for offline slot count');
}
