const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const search = `  if (btnMain) btnMain.style.display = (isAdmin && currentFieldIdx === 0) ? 'block' : 'none';
  if (btnSub) btnSub.style.display = (isAdmin && currentFieldIdx === 1) ? 'block' : 'none';`;

const replace = `  if (btnMain) btnMain.style.display = (isAdmin && currentFieldIdx === 0) ? 'inline-block' : 'none';
  if (btnSub) btnSub.style.display = (isAdmin && currentFieldIdx === 1) ? 'inline-block' : 'none';

  const btnPdfMain = document.getElementById('btnExportPDF');
  const btnPdfSub = document.getElementById('btnExportSubPDF');
  if (btnPdfMain) btnPdfMain.style.display = currentFieldIdx === 0 ? 'inline-block' : 'none';
  if (btnPdfSub) btnPdfSub.style.display = currentFieldIdx === 1 ? 'inline-block' : 'none';`;

if (appJs.includes(search)) {
    appJs = appJs.replace(search, replace);
    fs.writeFileSync('app.js', appJs);
    console.log('Successfully injected toggle logic');
} else {
    // try line by line match because of whitespace
    const r2 = /if \(btnMain\) btnMain\.style\.display = \(isAdmin && currentFieldIdx === 0\) \? 'block' : 'none';\s*if \(btnSub\) btnSub\.style\.display = \(isAdmin && currentFieldIdx === 1\) \? 'block' : 'none';/m;
    if (r2.test(appJs)) {
        appJs = appJs.replace(r2, replace);
        fs.writeFileSync('app.js', appJs);
        console.log('Successfully injected toggle logic using regex');
    } else {
        console.log('Could not find search string');
    }
}
