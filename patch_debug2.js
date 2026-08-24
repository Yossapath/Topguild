const fs = require('fs');
let txt = fs.readFileSync('module_log.js', 'utf8');

txt = txt.replace(
  "console.warn('[Log] Failed to write log:', e);",
  "console.warn('[Log] Failed to write log:', e);\n        if (window.showToast) window.showToast('Debug: ไม่สามารถเขียน Log ได้: ' + e.message, 'error');"
);

fs.writeFileSync('module_log.js', txt, 'utf8');
console.log('Added toast for write error');
