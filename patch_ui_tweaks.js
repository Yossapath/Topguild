const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update CSS for top bar buttons
const cssTarget = /\.btn-red-theme \{[\s\S]*?\[data-theme="dark"\] \.btn-blue-theme-outline\.active-mode \{[\s\S]*?\}/;
const newCss = `
.btn-blue-theme, .btn-blue-theme-outline {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-family: var(--font-display, 'Prompt', sans-serif) !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  text-decoration: none !important;
  background: #ffffff !important;
  color: #2563eb !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06) !important;
}

.btn-blue-theme:hover, .btn-blue-theme-outline:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15) !important;
}

.btn-blue-theme.active-mode, .btn-blue-theme-outline.active-mode {
  background: #2563eb !important;
  color: #ffffff !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1) !important;
}

#btnLogout {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-family: var(--font-display, 'Prompt', sans-serif) !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  text-decoration: none !important;
  background: #ef4444 !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2) !important;
}

#btnLogout:hover {
  background: #dc2626 !important;
  transform: translateY(-1px) !important;
}

[data-theme="dark"] .btn-blue-theme, [data-theme="dark"] .btn-blue-theme-outline {
  background: #1e293b !important;
  color: #60a5fa !important;
}
[data-theme="dark"] .btn-blue-theme.active-mode, [data-theme="dark"] .btn-blue-theme-outline.active-mode {
  background: #3b82f6 !important;
  color: #ffffff !important;
}
`;

if (html.match(cssTarget)) {
  html = html.replace(cssTarget, newCss);
} else {
  // Fallback if regex fails, append to head
  console.log("CSS Regex failed to match. Check styles.");
}

// Ensure the buttons don't have overlapping inline styles or rogue classes
html = html.replace(/class="btn-secondary btn-red-theme" id="btnLogout"/g, 'id="btnLogout"');
html = html.replace(/class="btn-red-theme" id="btnLogout"/g, 'id="btnLogout"');

// 2. Adjust Login Page Size and Centering
// Make sure it centers exactly in the middle.
const authStart = html.indexOf('<div id="authWrap"');
const authEnd = html.indexOf('<!-- MAIN APP WRAPPER -->');
if (authStart !== -1 && authEnd !== -1) {
    let authHtml = html.substring(authStart, authEnd);
    
    // Adjust layout for centering
    authHtml = authHtml.replace(
      /style="display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; background: #f4f7fb; z-index: 10000; overflow: hidden; box-sizing: border-box;/g,
      'style="display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; background: #f4f7fb; z-index: 10000; overflow-y: auto; box-sizing: border-box;'
    );
    authHtml = authHtml.replace(
      /<div style="display: flex; flex-direction: row; width: 100%; max-width: 900px; padding: 20px; gap: 60px; align-items: center; justify-content: center; flex-wrap: wrap; margin: 0 auto;">/,
      '<div style="display: flex; flex-direction: row; width: 100%; max-width: 1000px; padding: 40px 20px; gap: 80px; align-items: center; justify-content: center; flex-wrap: wrap; margin: auto;">'
    );
    
    // Increase sizes
    authHtml = authHtml.replace(/font-size: 52px;/g, 'font-size: 64px;');
    authHtml = authHtml.replace(/font-size: 32px;/g, 'font-size: 40px;');
    authHtml = authHtml.replace(/font-size: 12px;/g, 'font-size: 14px;');
    authHtml = authHtml.replace(/width: 60px; height: 60px;/g, 'width: 72px; height: 72px;');
    
    authHtml = authHtml.replace(/max-width: 380px;/g, 'max-width: 440px;');
    authHtml = authHtml.replace(/padding: 40px;/g, 'padding: 48px 40px;');
    authHtml = authHtml.replace(/font-size: 24px;/g, 'font-size: 28px;');
    
    authHtml = authHtml.replace(/padding: 14px 16px 14px 42px;/g, 'padding: 16px 20px 16px 46px;');
    authHtml = authHtml.replace(/font-size: 14px;/g, 'font-size: 16px;');
    authHtml = authHtml.replace(/padding: 14px 16px;/g, 'padding: 16px 20px;'); // for select/input without icon
    
    authHtml = authHtml.replace(/padding: 14px;/g, 'padding: 16px;'); // buttons
    
    html = html.substring(0, authStart) + authHtml + html.substring(authEnd);
}

fs.writeFileSync('index.html', html, 'utf8');

// 3. Fix app.js lock button style
let app = fs.readFileSync('app.js', 'utf8');
const lockBtnTarget = /<button type="button" onclick="window\.toggleLockTeam\(\${currentFieldIdx}, '\${escapeHtml\(teamName\)}'\)" style="[^"]*">\${locked\?'ล็อก \(Lock\)':'ปลดล็อก \(Unlock\)'}<\/button>/g;

const newLockBtn = `<button type="button" onclick="window.toggleLockTeam(\${currentFieldIdx}, '\${escapeHtml(teamName)}')" style="background:\${locked?'#ef4444':'#ffffff'};border:\${locked?'none':'1px solid #2563eb'};color:\${locked?'white':'#2563eb'};border-radius:20px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:700;box-shadow:0 2px 4px rgba(0,0,0,0.1);">\${locked?'ล็อก (Lock)':'ปลดล็อก (Unlock)'}</button>`;

app = app.replace(lockBtnTarget, newLockBtn);

fs.writeFileSync('app.js', app, 'utf8');

console.log('UI updates applied.');
