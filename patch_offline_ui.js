const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /if \(currentFieldIdx === 0\) \{/;
const replacementStr = `if (currentFieldIdx === 2) {
      let offlineCount = 0;
      let htmlRows = '';
      const cap = 100; // allow up to 100 offline people
      const fm = fieldMeta[2];
      const teamName = (fm && fm.teamNames && fm.teamNames[0]) ? fm.teamNames[0] : 'ทีม 1';
      for (let i = 0; i < cap; i++) {
        const key = '2|' + teamName + '|' + i;
        const a = teamsAssignments[key];
        if (a && a.name) offlineCount++;
        
        // Render 5 extra empty slots below the last filled one
        if (!a && i > offlineCount + 5) continue;

        const job = rowJobFilter[key] || (a ? a.job : '') || '';
        htmlRows += \`
        <tr>
          <td style="width: 40px; text-align: center; color:var(--text-lo); font-size:12px;">\${i+1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off">
          </td>
          <td style="width: 150px;">
            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}">
              \${jobSelectHtml(key, job)}
            </select>
          </td>
          <td class="cell-action"><button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button></td>
        </tr>\`;
      }

      teamsGrid.innerHTML = \`
        <div class="team-card" style="width:100%; grid-column: 1 / -1; max-width: 700px; margin: 0 auto; border: 2px solid #e11d48;">
          <div class="team-card-head" style="background:#e11d48; color:white; justify-content:center;">
            <h3 style="margin:0; font-size:16px;">⚠️ รายชื่อสมาชิกที่ออฟไลน์ (รวม \${offlineCount} คน)</h3>
          </div>
          <div class="team-card-body">
            <table class="team-table">
              <thead><tr><th>ลำดับ</th><th>ชื่อตัวละคร</th><th>อาชีพ (ถ้ามี)</th><th>ลบ</th></tr></thead>
              <tbody>\${htmlRows}</tbody>
            </table>
          </div>
        </div>
      \`;
    } else if (currentFieldIdx === 0) {`;

if (code.match(regex)) {
  code = code.replace(regex, replacementStr);
  fs.writeFileSync('app.js', code);
  console.log('Patched Offline UI successfully');
} else {
  console.log('Match failed for Offline UI patch');
}
