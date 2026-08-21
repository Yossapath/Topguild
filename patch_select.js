const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  '<input type="text" id="dqName" class="form-control" placeholder="ชื่อตัวละคร..." style="margin-bottom: 8px;" list="rosterDatalist">',
  '<select id="dqName" class="form-control" style="margin-bottom: 8px;">\n              <option value="" disabled selected>-- เลือกชื่อตัวละคร --</option>\n            </select>'
);
fs.writeFileSync('index.html', html, 'utf8');

// 2. Update app.js renderRoster
let jsApp = fs.readFileSync('app.js', 'utf8');
const s1 = `const datalist = document.getElementById('rosterDatalist');
  if (datalist) {
    datalist.innerHTML = masterList.map(m => \`<option value="\${escapeHtml(m.name)}">\${escapeHtml(m.job)} (Power: \${m.power || 0})</option>\`).join('');
  }`;
const r1 = `const datalist = document.getElementById('rosterDatalist');
  if (datalist) {
    datalist.innerHTML = masterList.map(m => \`<option value="\${escapeHtml(m.name)}">\${escapeHtml(m.job)} (Power: \${m.power || 0})</option>\`).join('');
  }
  
  const dqNameSelect = document.getElementById('dqName');
  if (dqNameSelect && dqNameSelect.tagName.toLowerCase() === 'select') {
    const currentVal = dqNameSelect.value;
    let options = '<option value="" disabled selected>-- เลือกชื่อตัวละคร --</option>';
    options += masterList.map(m => \`<option value="\${escapeHtml(m.name)}">\${escapeHtml(m.name)} - \${escapeHtml(m.job)} (\${m.power || 0})</option>\`).join('');
    dqNameSelect.innerHTML = options;
    if (masterList.find(m => m.name === currentVal)) {
      dqNameSelect.value = currentVal;
    }
  }`;
jsApp = jsApp.replace(s1, r1);
fs.writeFileSync('app.js', jsApp, 'utf8');

// 3. Update auth_dungeon.js listener (from 'input' to 'change' just in case)
let jsAuth = fs.readFileSync('auth_dungeon.js', 'utf8');
jsAuth = jsAuth.replace(`dqNameInput.addEventListener('input', (e) => {`, `dqNameInput.addEventListener('change', (e) => {`);
fs.writeFileSync('auth_dungeon.js', jsAuth, 'utf8');

console.log('patched select');
