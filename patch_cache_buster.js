const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/\?v=2\.2/g, '?v=2.3');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated cache buster to v=2.3');
