const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace(/ทีมที่ 1 \(หัวตี้:/g, 'โซน 1 (ซ้าย) - หัวตี้:');
code = code.replace(/ทีมที่ 2 \(หัวตี้:/g, 'โซน 2 (ขวา) - หัวตี้:');

fs.writeFileSync('app.js', code);
console.log('Patched PDF labels');
