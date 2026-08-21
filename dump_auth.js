const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('<div id="authWrap"');
const end = html.indexOf('<!-- MAIN APP WRAPPER -->');
fs.writeFileSync('auth_ui_dump.html', html.substring(start, end), 'utf8');
console.log('Dumped authWrap');
