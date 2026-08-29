const fs = require('fs');

// 1. Remove _restoreLastTab from applyRolePermissions in module_auth.js (avoid double restore)
let auth = fs.readFileSync('module_auth.js', 'utf8');
auth = auth.replace(
  `  // Restore last visited tab after login/role applied (delay to let renderAll complete)
  setTimeout(() => {
    if (typeof window._restoreLastTab === 'function') window._restoreLastTab();
  }, 600);`,
  ``
);
fs.writeFileSync('module_auth.js', auth);
console.log('Removed from applyRolePermissions');

// 2. In app.js, add restore AFTER renderAll() at line 370 (first Firebase load)
let app = fs.readFileSync('app.js', 'utf8');
const target = `    renderAll();

    // Step 2: Real-time listener for live updates`;
const replacement = `    renderAll();

    // Restore last active tab after initial load
    setTimeout(() => {
      try {
        const last = localStorage.getItem('guild_active_tab');
        if (last && document.getElementById(last) && typeof window.switchTab === 'function') {
          window.switchTab(last);
        }
      } catch(e) {}
    }, 400);

    // Step 2: Real-time listener for live updates`;

if (app.includes(target)) {
  app = app.replace(target, replacement);
  fs.writeFileSync('app.js', app);
  console.log('Added restore after renderAll() in app.js');
} else {
  console.log('Target not found in app.js');
}
