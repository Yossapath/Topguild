const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');
app = app.replace("border:${locked?'none':'1px solid #2563eb'};", "border:none;");
fs.writeFileSync('app.js', app, 'utf8');
console.log('Fixed unlock button border');
