const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// The string in app.js has "\`" and "\$" due to over-escaping.
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('app.js', code);
console.log('Fixed syntax error');
