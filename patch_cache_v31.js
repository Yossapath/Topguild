const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\?v=3\.\d+/g, '?v=3.1');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Cache updated to v=3.1');
