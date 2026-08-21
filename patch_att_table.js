const fs = require('fs');

// 1. Fix HTML headers
let html = fs.readFileSync('index.html', 'utf8');
const oldHeaderRegex = /<th style="padding: 12px 16px; text-align: center; font-family: var\(--font-display\); color: var\(--blue-900\);">อาชีพ \/ ค่าพลัง<\/th>/;
const newHeaders = `<th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--blue-900);">อาชีพ</th>
              <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--blue-900);">ค่าพลัง</th>`;

html = html.replace(oldHeaderRegex, newHeaders);
html = html.replace(/<td colspan="4"/g, '<td colspan="5"');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed HTML headers');

// 2. Fix JS rendering
let code = fs.readFileSync('auth_dungeon.js', 'utf8');
const oldRender = /<td style="text-align:center;">\$\{m\.job\} <br><small style="color:var\(--text-lo\)">\(\$\{m\.power\}\)<\/small><\/td>/;
const newRender = `<td style="text-align:center; font-weight: 500;">\${m.job}</td>
         <td style="text-align:center;"><small style="color:var(--text-lo)">\${m.power}</small></td>`;

code = code.replace(oldRender, newRender);
fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('Fixed JS rendering');
