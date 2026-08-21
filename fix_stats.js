const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// Find and fix the broken tail of renderAttendanceStats
// The broken region: from "// Prepare member list..." to the stray catch block
const brokenStart = code.indexOf('  // Prepare member list from guildRoster');
const brokenEnd = code.indexOf("   catch(e) {\n    console.error('Dropdown Error:', e);\n  }\n}") + "   catch(e) {\n    console.error('Dropdown Error:', e);\n  }\n}".length;

if (brokenStart === -1 || brokenEnd < brokenStart) {
  console.log('Could not find broken section, dumping context:');
  const catchIdx = code.indexOf("catch(e)");
  console.log(code.slice(catchIdx - 200, catchIdx + 100));
  process.exit(1);
}

const fixedSection = `  // Build stats table from guildRoster
  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(function(job) {
      window.guildRoster[job].forEach(function(m) {
        allMembers.push({ name: m.name, job: job, power: m.power || 0 });
      });
    });
  }

  allMembers.sort(function(a,b) { return b.power - a.power; });
  if (query) allMembers = allMembers.filter(function(m) { return m.name.toLowerCase().includes(query); });

  let html = '';
  allMembers.forEach(function(m, i) {
    const s = statsMap[m.name] || { joined: 0, leave: 0, absent: 0 };
    const total = dates.length;
    const pct = total > 0 ? Math.round((s.joined / total) * 100) : 0;
    const eName = window.escapeHtml ? window.escapeHtml(m.name) : m.name;
    html += '<tr>' +
      '<td class="cell-rank">' + (i+1) + '</td>' +
      '<td>' + eName + '</td>' +
      '<td style="text-align:center;">' + m.job + '</td>' +
      '<td style="text-align:center; color:var(--ok)">' + s.joined + '</td>' +
      '<td style="text-align:center; color:var(--warn)">' + s.leave + '</td>' +
      '<td style="text-align:center; color:var(--danger)">' + s.absent + '</td>' +
      '<td style="text-align:center;">' + pct + '%</td>' +
      '</tr>';
  });
  tbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-lo);">ไม่มีข้อมูลสถิติ</td></tr>';
};
`;

code = code.slice(0, brokenStart) + fixedSection + code.slice(brokenEnd);
fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('Fixed renderAttendanceStats successfully');
