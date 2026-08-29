const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove max-height from #dqList and let flex:1 fill the right column naturally
// Also ensure the right column itself stretches (align-items:stretch already set)
const old1 = 'flex:1; overflow-y:auto; max-height:600px; background:white;';
const new1 = 'flex:1; overflow-y:auto; background:white;';

if (html.includes(old1)) {
  html = html.replace(old1, new1);
  console.log('Fixed: removed max-height from dqList');
} else {
  console.log('NOT FOUND: dqList max-height pattern');
  // show what dqList looks like
  const idx = html.indexOf('id="dqList"');
  if (idx !== -1) console.log('dqList context:', html.slice(idx, idx+120));
}

fs.writeFileSync('index.html', html);
console.log('Done');
