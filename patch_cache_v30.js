const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\?v=2\.\d+/g, '?v=3.0');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Cache updated to v=3.0');
