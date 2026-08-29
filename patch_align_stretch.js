const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Change align-items:flex-start to stretch so both columns fill the full card height
const old = 'display:flex; align-items:flex-start;';
const newStyle = 'display:flex; align-items:stretch;';

if (html.includes(old)) {
  html = html.replace(old, newStyle);
  fs.writeFileSync('index.html', html);
  console.log('Fixed: align-items changed to stretch');
} else {
  console.log('Pattern not found, checking raw content...');
  // Show surrounding context
  const idx = html.indexOf('align-items:flex-start');
  if (idx !== -1) {
    console.log('Found at:', idx);
    console.log('Context:', html.slice(idx-50, idx+80));
  }
}
