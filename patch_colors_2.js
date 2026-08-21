const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const target1 = '<td style="text-align:center; font-weight: 500;">${m.job}</td>';
const replace1 = '<td style="text-align:center; font-weight: 600; color:${window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : "var(--text-hi)"};">${m.job}</td>';

if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  console.log('Fixed target 1');
}

const target2 = `'<td style="text-align:center;">' + m.job + '</td>'`;
const replace2 = `'<td style="text-align:center; font-weight: 600; color:' + (window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : 'var(--text-hi)') + ';">' + m.job + '</td>'`;

if (code.includes(target2)) {
  code = code.replace(target2, replace2);
  console.log('Fixed target 2');
}

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
