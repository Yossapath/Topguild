const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const r = /if \(btnMain\) btnMain\.style\.display = \(isAdmin && currentFieldIdx === 0\) \? 'block' : 'none';/m;

const replace = `if (btnMain) btnMain.style.display = (isAdmin && currentFieldIdx === 0) ? 'inline-block' : 'none';
  if (btnSub) btnSub.style.display = (isAdmin && currentFieldIdx === 1) ? 'inline-block' : 'none';

  const btnPdfMain = document.getElementById('btnExportPDF');
  const btnPdfSub = document.getElementById('btnExportSubPDF');
  if (btnPdfMain) btnPdfMain.style.display = currentFieldIdx === 0 ? 'inline-block' : 'none';
  if (btnPdfSub) btnPdfSub.style.display = currentFieldIdx === 1 ? 'inline-block' : 'none';`;

if (r.test(appJs)) {
    appJs = appJs.replace(r, replace);
    fs.writeFileSync('app.js', appJs);
    console.log('Successfully injected toggle logic');
} else {
    console.log('Failed');
}
