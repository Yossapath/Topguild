const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix 1: change align-items:stretch back to flex-start so each column is its natural height
const old1 = 'display:flex; align-items:stretch;';
const new1 = 'display:flex; align-items:flex-start;';
if (html.includes(old1)) { html = html.replace(old1, new1); console.log('Fixed: reverted align-items to flex-start'); }
else console.log('NOT FOUND: align-items:stretch');

// Fix 2: change outer dungeon card background from var(--surface) to white
// so the area below the right column (white) blends seamlessly
const old2 = 'background: var(--surface); border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;';
const new2 = 'background: white; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;';
if (html.includes(old2)) { html = html.replace(old2, new2); console.log('Fixed: outer card background -> white'); }
else console.log('NOT FOUND: outer card style');

// Fix 3: also change left column background to white so it matches
const old3 = 'width:340px; flex-shrink:0; border-right:2px solid var(--line); padding:24px; background:var(--surface);';
const new3 = 'width:340px; flex-shrink:0; border-right:2px solid var(--line); padding:24px; background:white;';
if (html.includes(old3)) { html = html.replace(old3, new3); console.log('Fixed: left column background -> white'); }
else console.log('NOT FOUND: left column style');

fs.writeFileSync('index.html', html);
console.log('Done');
