const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\?v=2\.3/g, '?v=2.4');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Cache version updated to v=2.4');
