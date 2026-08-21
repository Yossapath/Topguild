const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

const oldSelect = `<select id="dqName" class="form-control" style="margin-bottom: 8px;">\r\n              <option value="" disabled selected>-- เลือกชื่อตัวละคร --</option>\r\n            </select>`;
const oldSelectAlt = `<select id="dqName" class="form-control" style="margin-bottom: 8px;">\n              <option value="" disabled selected>-- เลือกชื่อตัวละคร --</option>\n            </select>`;

const newCombobox = `<div style="position: relative;">
              <input type="text" id="dqName" class="form-control" placeholder="🔍 พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off" style="margin-bottom: 8px; cursor: text;">
              <div id="dqNameDropdown" class="custom-dropdown" style="display:none; position:absolute; top: 38px; left:0; right:0; max-height:220px; overflow-y:auto; background:var(--surface); border:1px solid var(--blue-500); border-radius:8px; z-index:9999; box-shadow:0 6px 16px rgba(0,0,0,0.12);">
              </div>
            </div>`;

if (html.includes(oldSelect)) {
  html = html.replace(oldSelect, newCombobox);
} else if (html.includes(oldSelectAlt)) {
  html = html.replace(oldSelectAlt, newCombobox);
} else {
  // Try regex
  html = html.replace(/<select id="dqName"[\s\S]*?<\/select>/, newCombobox);
}

// Ensure CSS for custom-dropdown-item exists
if (!html.includes('custom-dropdown-item')) {
  const css = `
  <style>
    .custom-dropdown-item { padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--line); font-size: 13.5px; color: var(--text-hi); font-family: var(--font-ui); transition: background 0.1s; }
    .custom-dropdown-item:hover { background: var(--bg-soft); }
    .custom-dropdown-item:last-child { border-bottom: none; }
    .custom-dropdown-item.selected { background: rgba(47,143,214,0.1); border-left: 3px solid var(--blue-500); }
  </style>
  `;
  html = html.replace('</head>', css + '</head>');
}

fs.writeFileSync('index.html', html, 'utf8');


// 2. Update auth_dungeon.js
let jsAuth = fs.readFileSync('auth_dungeon.js', 'utf8');

// Remove old change listener
jsAuth = jsAuth.replace(/const dqNameInput = document\.getElementById\('dqName'\);[\s\S]*?\}\);[\s\S]*?\}\);[\s\S]*?\}/, `// Old listener removed`);

// Add combobox logic
const comboboxLogic = `
  const dqNameInput = document.getElementById('dqName');
  const dqNameDropdown = document.getElementById('dqNameDropdown');
  
  if (dqNameInput && dqNameDropdown) {
    let allMembers = [];
    
    function populateDropdown(filterText = '') {
      if (!window.guildRoster) return;
      allMembers = [];
      Object.keys(window.guildRoster).forEach(job => {
        window.guildRoster[job].forEach(m => {
          allMembers.push({ name: m.name, job: job, power: m.power || 0 });
        });
      });
      
      allMembers.sort((a,b) => b.power - a.power);
      
      let filtered = allMembers;
      if (filterText) {
        const lower = filterText.toLowerCase();
        filtered = allMembers.filter(m => m.name.toLowerCase().includes(lower));
      }
      
      if (filtered.length === 0) {
        dqNameDropdown.innerHTML = '<div style="padding: 10px; text-align:center; color:var(--text-lo); font-size: 13px;">ไม่พบชื่อตัวละคร</div>';
        return;
      }
      
      dqNameDropdown.innerHTML = filtered.map(m => 
        \`<div class="custom-dropdown-item" data-name="\${window.escapeHtml ? window.escapeHtml(m.name) : m.name}" data-job="\${m.job}">
          <strong style="color:var(--blue-700);">\${window.escapeHtml ? window.escapeHtml(m.name) : m.name}</strong> 
          <span style="opacity:0.7; font-size:12px;">- \${m.job} (\${m.power})</span>
        </div>\`
      ).join('');
      
      // Bind clicks
      dqNameDropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
        item.addEventListener('mousedown', (e) => { // mousedown fires before blur
          e.preventDefault(); 
          dqNameInput.value = item.getAttribute('data-name');
          const job = item.getAttribute('data-job');
          const dqClass = document.getElementById('dqClass');
          if (dqClass) dqClass.value = job;
          dqNameDropdown.style.display = 'none';
        });
      });
    }
    
    dqNameInput.addEventListener('focus', () => {
      populateDropdown(dqNameInput.value.trim());
      dqNameDropdown.style.display = 'block';
    });
    
    dqNameInput.addEventListener('input', (e) => {
      populateDropdown(e.target.value.trim());
      dqNameDropdown.style.display = 'block';
      
      // Auto match job if typing exact name
      const val = e.target.value.trim().toLowerCase();
      const exactMatch = allMembers.find(m => m.name.toLowerCase() === val);
      if (exactMatch) {
        const dqClass = document.getElementById('dqClass');
        if (dqClass) dqClass.value = exactMatch.job;
      }
    });
    
    dqNameInput.addEventListener('blur', () => {
      setTimeout(() => { dqNameDropdown.style.display = 'none'; }, 150);
    });
  }
`;

jsAuth = jsAuth.replace(`document.addEventListener('DOMContentLoaded', () => {`, `document.addEventListener('DOMContentLoaded', () => {\n` + comboboxLogic);

fs.writeFileSync('auth_dungeon.js', jsAuth, 'utf8');

// 3. Remove dqName updating in app.js
let jsApp = fs.readFileSync('app.js', 'utf8');
jsApp = jsApp.replace(/const dqNameSelect = document\.getElementById\('dqName'\);[\s\S]*?\}\s*\}/, `// removed dqName select logic`);
fs.writeFileSync('app.js', jsApp, 'utf8');

console.log('patched combobox');
