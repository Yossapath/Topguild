const fs = require('fs');

// 1. Rewrite the button CSS in styles.css
let css = fs.readFileSync('styles.css', 'utf8');

// First, remove old btn-blue-theme blocks if they exist so we can cleanly inject
css = css.replace(/\.btn-blue-theme, \.btn-blue-theme-outline \{[\s\S]*?\[data-theme="dark"\] \.btn-blue-theme-outline:hover \{[\s\S]*?\}/, '');

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

css = css.replace('/* Header */', newCss + '\n/* Header */');
fs.writeFileSync('styles.css', css, 'utf8');

// 2. Clean up classes in index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/class="[^"]*btnLogout[^"]*"/g, '');
html = html.replace(/class="btn-secondary btn-red-theme"/g, '');
html = html.replace(/id="btnLogout" onclick="handleLogout\(\)"\s*class="[^"]*"/, 'id="btnLogout" onclick="handleLogout()"');
html = html.replace(/id="btnLogout" onclick="handleLogout\(\)"\s*>/, 'id="btnLogout" onclick="handleLogout()">');
// Ensure it has NO btn-secondary class overriding it
html = html.replace(/class="[^"]*btnLogout[^"]*"/g, '');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Fixed CSS and button classes');
