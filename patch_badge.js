const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');
code = code.replace(/margin-left:4px;"><\/span>/g, 'margin-left:4px;">ล็อก</span>');
fs.writeFileSync('app.js', code, 'utf8');
console.log('Fixed empty lock badge');
