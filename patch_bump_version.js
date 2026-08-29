const fs = require('fs');
// Bump version to force Vercel to invalidate cache
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('module_dungeon.js?v=7.0', 'module_dungeon.js?v=7.1');
fs.writeFileSync('index.html', html);
console.log('Bumped module_dungeon version to 7.1');

// Also verify module_dungeon.js has no real issues by checking the area around line 800
const code = fs.readFileSync('module_dungeon.js', 'utf8');
const lines = code.split('\n');
console.log('\nLines 798-810:');
for (let i = 797; i <= 810; i++) {
  console.log(i+1 + ': ' + lines[i]);
}
