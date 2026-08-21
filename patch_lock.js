const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');
code = code.replace(/'ล็อก':'ปลดล็อก'/g, "'ล็อก (Lock)':'ปลดล็อก (Unlock)'");
fs.writeFileSync('app.js', code, 'utf8');
console.log('Fixed lock button');
