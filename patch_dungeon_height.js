const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove min-height:520px from both the flex body and the queue list column
const old1 = 'display:flex; align-items:flex-start; min-height:520px;';
const new1 = 'display:flex; align-items:flex-start;';

const old2 = 'flex:1; display:flex; flex-direction:column; min-height:520px; background:white;';
const new2 = 'flex:1; display:flex; flex-direction:column; background:white;';

let count = 0;
if (html.includes(old1)) { html = html.replace(old1, new1); count++; console.log('Fixed: body min-height removed'); }
else console.log('NOT FOUND: body min-height');

if (html.includes(old2)) { html = html.replace(old2, new2); count++; console.log('Fixed: queue list min-height removed'); }
else console.log('NOT FOUND: queue list min-height');

if (count > 0) {
  fs.writeFileSync('index.html', html);
  console.log('Saved. Fixed', count, 'occurrences');
} else {
  console.log('Nothing changed');
}
