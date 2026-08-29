const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// Find the exact position: after "renderAll();" that is followed by "// Step 2"
// File has CRLF line endings
const marker = 'renderAll();\r\n\r\n    // Step 2: Real-time listener for live updates';
const idx = app.indexOf(marker);
console.log('Found marker at:', idx);

if (idx === -1) {
  console.log('Not found, trying LF version...');
  const marker2 = 'renderAll();\n\n    // Step 2: Real-time listener for live updates';
  const idx2 = app.indexOf(marker2);
  console.log('LF version at:', idx2);
} else {
  const insertAfter = 'renderAll();\r\n';
  const restoreCode = `
    // Restore last active tab after initial data load
    setTimeout(function() {
      try {
        var last = localStorage.getItem('guild_active_tab');
        if (last && document.getElementById(last) && typeof window.switchTab === 'function') {
          window.switchTab(last);
        }
      } catch(e) {}
    }, 400);\r\n`;

  // Insert after the first renderAll() followed by Step 2 comment
  const insertPoint = idx + insertAfter.length;
  app = app.slice(0, insertPoint) + restoreCode + app.slice(insertPoint);
  fs.writeFileSync('app.js', app);
  console.log('Done! Inserted restore code at position', insertPoint);
}
