const fs = require('fs');

// --- 1. Modify index.html ---
let html = fs.readFileSync('index.html', 'utf8');

const exportMainBtnStr = `<button class="btn-primary" id="btnExportPDF" onclick="window.exportMainFieldPDF()" style="background:linear-gradient(135deg, #e53e3e, #c53030);box-shadow: 0 3px 10px rgba(229,62,62,0.25); white-space: nowrap;">📄 Export PDF สนามหลัก</button>`;

const exportSubBtnStr = `<button class="btn-primary" id="btnExportSubPDF" onclick="window.exportSubFieldPDF()" style="background:linear-gradient(135deg, #e53e3e, #c53030);box-shadow: 0 3px 10px rgba(229,62,62,0.25); white-space: nowrap; display: none;">📄 Export PDF สนามรอง</button>`;

if (html.includes('id="btnExportSubPDF"')) {
    console.log('btnExportSubPDF already exists in index.html');
} else if (html.includes(exportMainBtnStr)) {
    html = html.replace(exportMainBtnStr, exportMainBtnStr + '\n        ' + exportSubBtnStr);
    fs.writeFileSync('index.html', html);
    console.log('Added btnExportSubPDF to index.html');
} else {
    // Try regex
    const btnRegex = /<button class="btn-primary" id="btnExportPDF"[^>]*>.*?<\/button>/;
    const match = html.match(btnRegex);
    if (match) {
        html = html.replace(match[0], match[0] + '\n        ' + exportSubBtnStr);
        fs.writeFileSync('index.html', html);
        console.log('Added btnExportSubPDF to index.html using regex');
    } else {
        console.log('Could not find btnExportPDF in index.html');
    }
}

// --- 2. Modify app.js ---
let appJs = fs.readFileSync('app.js', 'utf8');

// A. Inject window.exportSubFieldPDF at the end of app.js
if (!appJs.includes('window.exportSubFieldPDF = function()')) {
    const exportSubCode = `
window.exportSubFieldPDF = function() {
  const subFm = fieldMeta && fieldMeta[1];
  if (!subFm) return alert('ไม่พบข้อมูลสนามรอง');

  const teamNames = subFm.teamNames || [];
  const assignments = teamsAssignments || {};

  const getTeamLeader = (tName) => {
    let members = [];
    for(let j = 0; j < 5; j++) {
      const k = '1|' + tName + '|' + j;
      if (assignments[k] && assignments[k].name) members.push(assignments[k].name);
    }
    if (members.length === 0) return 'ว่าง';
    
    if (tName.includes('1')) {
      const top = members.find(m => m.toLowerCase() === 'topgameth');
      if (top) return top;
    }
    if (tName.includes('2')) {
      const lin = members.find(m => m.toLowerCase() === 'linping');
      if (lin) return lin;
    }
    return members[0];
  };

  const block1Teams = [];
  const block2Teams = [];
  teamNames.forEach(tName => {
    let hasMembers = false;
    for(let j = 0; j < 5; j++) {
      if (assignments['1|' + tName + '|' + j]?.name) {
        hasMembers = true;
        break;
      }
    }
    if (!hasMembers) return; // Skip empty teams

    const numMatch = tName.match(/\\d+/);
    const num = numMatch ? parseInt(numMatch[0]) : 0;
    if (num % 2 === 0 && num !== 0) {
      block2Teams.push(tName);
    } else {
      block1Teams.push(tName);
    }
  });

  let htmlContent = \`
    <html>
      <head>
        <title>สนามรอง</title>
        <style> @media print { @page { size: landscape; margin: 5mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          body { font-family: 'Sarabun', 'Prompt', sans-serif; padding: 20px; color: #333; }
          h2 { text-align: center; color: #1e3a8a; }
          .container { display: flex; gap: 20px; justify-content: center; align-items: flex-start; }
          .main-team { flex: 1; border: 2px solid #2563eb; border-radius: 8px; padding: 10px; background: #f8fafc; }
          .main-team-title { text-align: center; font-size: 18px; font-weight: bold; background: #2563eb; color: white; padding: 8px; border-radius: 6px; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; page-break-inside: avoid; background: white; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 3px 6px; text-align: center; }
          th { background: #e2e8f0; font-weight: bold; }
          .party-title { background: #bfdbfe; font-weight: bold; text-align: left; padding: 3px 6px; }
        </style>
      </head>
      <body>
        <h2>รายชื่อทีมสนามรอง</h2>
        <div class="container">
  \`;

  const renderBlock = (teamsArray, mainTeamTitle) => {
    let result = \\\`<div class="main-team"><h3 class="main-team-title">\\\${mainTeamTitle}</h3>\\\`;
    teamsArray.forEach(tName => {
      const cap = subFm.capacity[tName] || 5;
      let leaderName = getTeamLeader(tName);

      result += \\\`<table>
        <tr><td colspan="3" class="party-title">\\\${tName} (ปาร์ตี้: \\\${leaderName})</td></tr>
        <tr><th>ลำดับ</th><th>ชื่อตัวละคร</th><th>อาชีพ</th></tr>\\\`;
        
      for (let j = 0; j < cap; j++) {
        const key = '1|' + tName + '|' + j;
        const member = assignments[key];
        result += \\\`<tr>
          <td style="width: 40px;">\\\${j + 1}</td>
          <td>\\\${member && member.name ? window.escapeHtml(member.name) : '-'}</td>
          <td>\\\${member && member.job ? member.job : '-'}</td>
        </tr>\\\`;
      }
      result += \\\`</table>\\\`;
    });
    result += '</div>';
    return result;
  };

  const leader1 = block1Teams.length > 0 ? getTeamLeader(block1Teams[0]) : 'ว่าง';
  const leader2 = block2Teams.length > 0 ? getTeamLeader(block2Teams[0]) : 'ว่าง';

  const count1 = block1Teams.reduce((sum, t) => sum + (subFm.capacity[t]||5), 0);
  const count2 = block2Teams.reduce((sum, t) => sum + (subFm.capacity[t]||5), 0);

  if (block1Teams.length > 0) htmlContent += renderBlock(block1Teams, \\\`โซน 1 (ซ้าย) - ผู้นำ: \\\${leader1}) (\\\${count1} คน)\\\`);
  if (block2Teams.length > 0) htmlContent += renderBlock(block2Teams, \\\`โซน 2 (ขวา) - ผู้นำ: \\\${leader2}) (\\\${count2} คน)\\\`);

  htmlContent += \`
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  \`;

  const printWin = window.open('', '_blank');
  if (!printWin) {
    alert('กรุณาอนุญาต Pop-up (Pop-up Blocker) สำหรับไซต์นี้ เพื่อดู PDF');
    return;
  }
  printWin.document.open();
  printWin.document.write(htmlContent);
  printWin.document.close();
};
`;
    appJs += '\n' + exportSubCode;
    console.log('Appended window.exportSubFieldPDF to app.js');
} else {
    console.log('window.exportSubFieldPDF already exists in app.js');
}

// B. Toggle visibility in renderAll()
const displayCodeSearch = `  const btnAutoMain = document.getElementById('btnAutoOptimizeMain');
  const btnAutoSub = document.getElementById('btnAutoOptimizeSub');
  if (btnAutoMain) btnAutoMain.style.display = currentFieldIdx === 0 ? 'inline-block' : 'none';
  if (btnAutoSub) btnAutoSub.style.display = currentFieldIdx === 1 ? 'inline-block' : 'none';`;

const displayCodeReplace = `  const btnAutoMain = document.getElementById('btnAutoOptimizeMain');
  const btnAutoSub = document.getElementById('btnAutoOptimizeSub');
  if (btnAutoMain) btnAutoMain.style.display = currentFieldIdx === 0 ? 'inline-block' : 'none';
  if (btnAutoSub) btnAutoSub.style.display = currentFieldIdx === 1 ? 'inline-block' : 'none';

  const btnPdfMain = document.getElementById('btnExportPDF');
  const btnPdfSub = document.getElementById('btnExportSubPDF');
  if (btnPdfMain) btnPdfMain.style.display = currentFieldIdx === 0 ? 'inline-block' : 'none';
  if (btnPdfSub) btnPdfSub.style.display = currentFieldIdx === 1 ? 'inline-block' : 'none';`;

if (appJs.includes('const btnPdfSub = document.getElementById')) {
    console.log('Visibility toggle already exists in app.js');
} else if (appJs.includes(displayCodeSearch)) {
    appJs = appJs.replace(displayCodeSearch, displayCodeReplace);
    console.log('Injected visibility toggle into renderAll()');
} else {
    console.log('Could not find displayCodeSearch in app.js');
}

fs.writeFileSync('app.js', appJs);
