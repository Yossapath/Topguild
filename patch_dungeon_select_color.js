const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const targetSelect = `color:\${jobColor};font-weight:600;"`;
const replaceSelect = `--job-color:\${jobColor};"`;

if (code.includes(targetSelect)) {
  code = code.replace(targetSelect, replaceSelect);
  console.log('Fixed dungeon select job color CSS var');
}

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
