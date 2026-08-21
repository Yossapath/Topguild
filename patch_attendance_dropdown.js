const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Fix attendance daily table colors
const targetDaily = `         <td style="text-align:center; font-weight: 500;">\${m.job}</td>`;
const replaceDaily = `         <td style="text-align:center; font-weight: 600; color:\${window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : 'var(--text-hi)'};">\${m.job}</td>`;

if (code.includes(targetDaily)) {
  code = code.replace(targetDaily, replaceDaily);
  console.log('Fixed attendance daily colors');
}

// 2. Fix attendance stats table colors
// Let's check how renderAttendanceStats generates html
const targetStats = `html += '<tr>' +
        '<td class="cell-rank">' + (i+1) + '</td>' +
        '<td>' + eName + '</td>' +
        '<td style="text-align:center;">' + m.job + '</td>'`;

const replaceStats = `const jColor = window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : 'var(--text-hi)';
      html += '<tr>' +
        '<td class="cell-rank">' + (i+1) + '</td>' +
        '<td>' + eName + '</td>' +
        '<td style="text-align:center; font-weight:600; color:' + jColor + ';">' + m.job + '</td>'`;

if (code.includes(targetStats)) {
  code = code.replace(targetStats, replaceStats);
  console.log('Fixed attendance stats colors');
}

// 3. Fix dropdown scrolling
const dropdownScrollFix = `
// Fix scrollbar clicking stealing focus and closing dropdown
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown) {
    dropdown.addEventListener('mousedown', (e) => {
      // If clicking inside the custom-dropdown-item, it already preventDefaults
      // If clicking on the scrollbar, we also need to preventDefault so focus isn't lost
      e.preventDefault();
    });
  }
});
`;

if (!code.includes('// Fix scrollbar clicking stealing focus')) {
  code += dropdownScrollFix;
  console.log('Added scroll fix');
}

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('Done');
