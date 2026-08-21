const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<th[^>]*>อาชีพ<\/th>\s*<th[^>]*>ค่าพลัง<\/th>/;
const newHeaders = `<th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--blue-900);">อาชีพ / ค่าพลัง</th>`;

if (regex.test(html)) {
    html = html.replace(regex, newHeaders);
    console.log('Fixed headers via regex');
} else {
    console.log('Regex did not match');
}
fs.writeFileSync('index.html', html, 'utf8');
