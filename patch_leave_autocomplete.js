const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetHtml = `<input type="text" id="leaveName" class="form-control" placeholder="พิมพ์ชื่อ...">`;
const replaceHtml = `<div style="position:relative;">
            <input type="text" id="leaveName" class="form-control" placeholder="🔍 พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off">
            <div id="leaveNameDropdown" class="custom-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:100;"></div>
          </div>`;
html = html.replace(targetHtml, replaceHtml);
fs.writeFileSync('index.html', html, 'utf8');

let js = fs.readFileSync('auth_dungeon.js', 'utf8');
const leaveLogic = `
  const leaveNameInput = document.getElementById('leaveName');
  const leaveNameDropdown = document.getElementById('leaveNameDropdown');
  
  if (leaveNameInput && leaveNameDropdown) {
    function populateLeaveDropdown(filterText = '') {
      if (!window.guildRoster) return;
      let allMembers = [];
      Object.keys(window.guildRoster).forEach(job => {
        window.guildRoster[job].forEach(m => {
          allMembers.push({ name: m.name, job: job });
        });
      });
      
      const val = filterText.toLowerCase();
      const filtered = allMembers.filter(m => m.name.toLowerCase().includes(val));
      
      if (filtered.length === 0) {
        leaveNameDropdown.innerHTML = '<div style="padding: 10px; text-align:center; color:var(--text-lo); font-size: 13px;">ไม่พบชื่อตัวละคร</div>';
        return;
      }
      
      leaveNameDropdown.innerHTML = filtered.map(m => 
        \`<div class="custom-dropdown-item" data-name="\${window.escapeHtml ? window.escapeHtml(m.name) : m.name}" data-job="\${m.job}">
          <strong style="color:var(--blue-700);">\${window.escapeHtml ? window.escapeHtml(m.name) : m.name}</strong> 
          <span style="opacity:0.7; font-size:12px;">- \${m.job}</span>
        </div>\`
      ).join('');
      
      leaveNameDropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
          e.preventDefault(); 
          leaveNameInput.value = item.getAttribute('data-name');
          const leaveJob = document.getElementById('leaveJob');
          if (leaveJob) leaveJob.value = item.getAttribute('data-job');
          leaveNameDropdown.style.display = 'none';
        });
      });
    }
    
    leaveNameInput.addEventListener('focus', () => {
      populateLeaveDropdown(leaveNameInput.value.trim());
      leaveNameDropdown.style.display = 'block';
    });
    
    leaveNameInput.addEventListener('input', (e) => {
      populateLeaveDropdown(e.target.value.trim());
      leaveNameDropdown.style.display = 'block';
      
      const val = e.target.value.trim().toLowerCase();
      let exactJob = '';
      Object.keys(window.guildRoster || {}).forEach(job => {
        (window.guildRoster[job]||[]).forEach(m => {
          if (m.name.toLowerCase() === val) exactJob = job;
        });
      });
      if (exactJob) {
        const leaveJob = document.getElementById('leaveJob');
        if (leaveJob) leaveJob.value = exactJob;
      }
    });
    
    leaveNameInput.addEventListener('blur', () => {
      setTimeout(() => { leaveNameDropdown.style.display = 'none'; }, 150);
    });
  }
`;

js = js.replace('const dqNameInput = document.getElementById(\'dqName\');', leaveLogic + '\n  const dqNameInput = document.getElementById(\'dqName\');');
fs.writeFileSync('auth_dungeon.js', js, 'utf8');

console.log('Patched Leave Autocomplete');
