const fs = require('fs');

function patchFile(filename) {
  let js = fs.readFileSync(filename, 'utf8');
  
  // Replace equality checks
  js = js.replace(/window\.currentUser\.role === 'admin'/g, "(window.currentUser.role || '').toLowerCase() === 'admin'");
  
  // Replace inequality checks
  js = js.replace(/window\.currentUser\.role !== 'admin'/g, "(window.currentUser.role || '').toLowerCase() !== 'admin'");
  
  fs.writeFileSync(filename, js, 'utf8');
}

patchFile('app.js');
patchFile('auth_dungeon.js');

console.log('Patched role checks');
