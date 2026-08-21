const fs = require('fs');

// 1. STYLES.CSS Fixes
let css = fs.readFileSync('styles.css', 'utf8');

const newButtonStyles = `
/* Modern Button Styles for Top Bar */
.btn-solid-blue {
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
  background: var(--blue-600, #2563eb) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}
.btn-solid-blue:hover {
  background: var(--blue-700, #1d4ed8) !important;
  transform: translateY(-1px) !important;
}

.btn-switch {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-family: var(--font-display, 'Prompt', sans-serif) !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  border-radius: 16px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  padding: 6px 16px !important;
  text-decoration: none !important;
  background: transparent !important;
  color: var(--blue-600, #2563eb) !important;
  border: none !important;
  box-shadow: none !important;
}
.btn-switch.active {
  background: var(--blue-600, #2563eb) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}
#btnLogout:hover {
  background: #dc2626 !important;
}

/* Header Tabs Border */
.main-tabs {
  border: 1px solid var(--blue-300, #93c5fd);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  background: #ffffff;
  padding: 4px;
}
.main-tab-btn {
  border-radius: 8px !important;
  margin: 0 2px;
}
[data-theme="dark"] .main-tabs {
  border-color: var(--blue-700, #1d4ed8);
  background: var(--surface);
}
`;

// Append new styles if not already present
if (!css.includes('.btn-solid-blue')) {
  css += '\n' + newButtonStyles;
} else {
  // If present, replace it to update to this version
  css = css.replace(/\/\* Modern Button Styles[\s\S]*?\[data-theme="dark"\] \.main-tabs \{[^}]+\}/, newButtonStyles);
}
fs.writeFileSync('styles.css', css, 'utf8');


// 2. INDEX.HTML Fixes
let html = fs.readFileSync('index.html', 'utf8');

// Switch buttons class
html = html.replace(/<button type="button" class="btn-blue-theme-outline"(.*?)id="btnStyleSolid"/g, '<button type="button" class="btn-switch" id="btnStyleSolid"');
html = html.replace(/<button type="button" class="btn-blue-theme-outline"(.*?)id="btnStyleOutline"/g, '<button type="button" class="btn-switch" id="btnStyleOutline"');

// Rewrite setJobStyle
const setJobStyleMatch = /function setJobStyle\(style\) \{[\s\S]*?\}\s*\}/;
const newSetJobStyle = `function setJobStyle(style) {
      document.documentElement.setAttribute('data-job-style', style);
      localStorage.setItem('guild_job_style', style);
      var bSolid = document.getElementById('btnStyleSolid');
      var bOutline = document.getElementById('btnStyleOutline');
      if (bSolid && bOutline) {
        bSolid.style = ""; bOutline.style = ""; // Clear inline styles
        if (style === 'outline') {
          bOutline.classList.add('active');
          bSolid.classList.remove('active');
        } else {
          bSolid.classList.add('active');
          bOutline.classList.remove('active');
        }
      }
    }`;
html = html.replace(setJobStyleMatch, newSetJobStyle);

// Make sure top controls background matches switch style
html = html.replace(/<div style="display: flex; background: var\(--bg-soft\); border: 1\.5px solid var\(--line\); border-radius: 20px; padding: 2px;"/g, '<div style="display: flex; background: #ffffff; border: 1px solid #d1d5db; border-radius: 20px; padding: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);" class="switch-container"');
// Dark theme adjustment for switch container can be handled by normal CSS, but let's keep it simple.

fs.writeFileSync('index.html', html, 'utf8');


// 3. APP.JS Fixes (Lock Button Color)
let app = fs.readFileSync('app.js', 'utf8');

// The lock button logic currently:
// background:${locked?'#ffffff':'#2563eb'};border:none;color:${locked?'#2563eb':'#ffffff'};
// The user wants the lock button (action to lock, i.e., unlocked state) to be red.
// locked = true  => button says "ปลดล็อก (Unlock)" => should it be blue/white? Let's make it White background, Blue text.
// locked = false => button says "ล็อก (Lock)"     => should be Red background, White text.
// Let's replace the style completely.
const lockTarget = /<button type="button" onclick="window\.toggleLockTeam\([^)]+\)" style="background:\$\{locked\?'#[a-f0-9]+':'#[a-f0-9]+'\};border:none;color:\$\{locked\?'#[a-f0-9]+':'#[a-f0-9]+'\};border-radius:20px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:700;box-shadow:0 2px 4px rgba\(0,0,0,0\.1\);\">\$\{locked\?'ปลดล็อก \(Unlock\)':'ล็อก \(Lock\)'\}<\/button>/g;

const newLockBtnStr = `<button type="button" onclick="window.toggleLockTeam(\${currentFieldIdx}, '\${escapeHtml(teamName)}')" style="background:\${locked?'#ffffff':'#ef4444'};border:none;color:\${locked?'#2563eb':'#ffffff'};border-radius:20px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:700;box-shadow:0 2px 4px rgba(0,0,0,0.1);">\${locked?'ปลดล็อก (Unlock)':'ล็อก (Lock)'}</button>`;

app = app.replace(lockTarget, newLockBtnStr);

fs.writeFileSync('app.js', app, 'utf8');

console.log('All patches generated.');
