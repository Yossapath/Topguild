const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/position:fixed; z-index:99999;/, 'position:absolute; z-index:99999;');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed position:absolute');
