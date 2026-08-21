const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('<section id="page-dungeons"');
const end = html.indexOf('</section>', start);
console.log(html.substring(start, end + 10));
