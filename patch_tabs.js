const fs = require('fs');

// 1. Update index.html tab text
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<button type="button" class="main-tab-btn" data-page="page-settings" onclick="switchTab(\'page-settings\')" id="tabSettings">📦 จัดการข้อมูล (Data Management)</button>',
  '<button type="button" class="main-tab-btn" data-page="page-settings" onclick="switchTab(\'page-settings\')" id="tabSettings">📦 จัดการข้อมูล</button>'
);
fs.writeFileSync('index.html', html, 'utf8');

// 2. Update styles.css
let css = fs.readFileSync('styles.css', 'utf8');

const targetTabs = `.main-tabs {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 26px auto 24px;
  background: var(--surface);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid var(--line);
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(20,88,143,0.06);
}`;

const replacementTabs = `.main-tabs {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 26px auto 24px;
  background: var(--surface);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid var(--line);
  max-width: 750px;
  box-shadow: 0 2px 10px rgba(20,88,143,0.06);
  flex-wrap: nowrap;
}`;

const targetBtn = `.main-tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 11px 14px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 13.5px;
  color: var(--text-lo);
  cursor: pointer;
  border-radius: 8px;
  transition: all .18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}`;

const replacementBtn = `.main-tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 11px 14px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 13.5px;
  color: var(--text-lo);
  cursor: pointer;
  border-radius: 8px;
  transition: all .18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}`;

// regex replace ignoring spaces
const regexTabs = targetTabs.replace(/\s+/g, '\\s+').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
css = css.replace(new RegExp(regexTabs), replacementTabs);

const regexBtn = targetBtn.replace(/\s+/g, '\\s+').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
css = css.replace(new RegExp(regexBtn), replacementBtn);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('patched tabs and css');
