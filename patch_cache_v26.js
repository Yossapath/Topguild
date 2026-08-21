const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\?v=2\.\d+/g, '?v=2.6');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Cache version updated to v=2.6');
