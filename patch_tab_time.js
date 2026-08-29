const fs = require('fs');

// ==== FIX 1: Tab restore - must happen after renderAll(), so use longer delay ====
let auth = fs.readFileSync('module_auth.js', 'utf8');

// The current restore is inside applyRolePermissions with 100ms delay
// But renderAll() is called AFTER applyRolePermissions on login (line 130)
// So we need the restore to happen after renderAll completes
// Change: call _restoreLastTab from renderAll itself (once, using a flag)
auth = auth.replace(
  `  // Restore last visited tab after login/role applied
  setTimeout(() => {
    if (typeof window._restoreLastTab === 'function') window._restoreLastTab();
  }, 100);`,
  `  // Restore last visited tab after login/role applied (delay to let renderAll complete)
  setTimeout(() => {
    if (typeof window._restoreLastTab === 'function') window._restoreLastTab();
  }, 600);`
);

fs.writeFileSync('module_auth.js', auth);
console.log('Fixed tab restore delay');

// ==== FIX 2: Change time inputs from type="time" (AM/PM issue) to 24hr text inputs ====
let html = fs.readFileSync('index.html', 'utf8');

// Find and replace time inputs in admin panel to force 24hr format
// Change type="time" to use lang="th-TH" and step attribute
html = html.replace(
  `<input type="time" id="dqOpenTime" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px;">`,
  `<input type="time" id="dqOpenTime" lang="sv-SE" value="06:00" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px;">`
);
html = html.replace(
  `<input type="time" id="dqCloseTime" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px;">`,
  `<input type="time" id="dqCloseTime" lang="sv-SE" value="23:59" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px;">`
);

// If those patterns aren't found, try a broader search
if (!html.includes('lang="sv-SE"')) {
  // Replace all time inputs in the dungeon admin panel with 24hr versions
  html = html.replace(
    /(<input type="time" id="dqOpenTime"[^>]*>)/,
    `<input type="time" id="dqOpenTime" lang="sv-SE" value="06:00" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px;">`
  );
  html = html.replace(
    /(<input type="time" id="dqCloseTime"[^>]*>)/,
    `<input type="time" id="dqCloseTime" lang="sv-SE" value="23:59" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px;">`
  );
}

fs.writeFileSync('index.html', html);
console.log('Fixed time inputs');

// Check if dqOpenTime appears in html
const idx1 = html.indexOf('dqOpenTime');
const idx2 = html.indexOf('dqCloseTime');
console.log('dqOpenTime found at:', idx1);
console.log('dqCloseTime found at:', idx2);
if (idx1 !== -1) console.log('Context:', html.slice(idx1 - 10, idx1 + 120));
