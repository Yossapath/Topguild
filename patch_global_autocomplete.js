const fs = require('fs');

// 1. Inject global HTML
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="globalMemberDropdown"')) {
  html = html.replace('</body>', `
  <div id="globalMemberDropdown" class="custom-dropdown" style="display:none; position:fixed; z-index:99999; max-height:250px; overflow-y:auto; width:200px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>
</body>`);
  fs.writeFileSync('index.html', html, 'utf8');
}

// 2. Add global JS logic to auth_dungeon.js (runs for all files)
let js = fs.readFileSync('auth_dungeon.js', 'utf8');
const globalLogic = `
window.activeAutocompleteInput = null;

function showGlobalDropdown(inputEl, filterText = '') {
  if (!window.guildRoster) return;
  const dropdown = document.getElementById('globalMemberDropdown');
  if (!dropdown) return;
  
  let allMembers = [];
  Object.keys(window.guildRoster).forEach(job => {
    window.guildRoster[job].forEach(m => {
      allMembers.push({ name: m.name, job: job, power: m.power || 0 });
    });
  });
  
  const val = filterText.toLowerCase();
  const filtered = allMembers.filter(m => m.name.toLowerCase().includes(val));
  
  if (filtered.length === 0) {
    dropdown.innerHTML = '<div style="padding: 10px; text-align:center; color:var(--text-lo); font-size: 13px;">ไม่พบชื่อตัวละคร</div>';
  } else {
    dropdown.innerHTML = filtered.map(m => 
      \`<div class="custom-dropdown-item" data-name="\${window.escapeHtml ? window.escapeHtml(m.name) : m.name}" data-job="\${m.job}" data-power="\${m.power}">
        <strong style="color:var(--blue-700);">\${window.escapeHtml ? window.escapeHtml(m.name) : m.name}</strong> 
        <span style="opacity:0.7; font-size:12px;">- \${m.job} (\${m.power})</span>
      </div>\`
    ).join('');
    
    dropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault(); 
        if (window.activeAutocompleteInput) {
          const newName = item.getAttribute('data-name');
          window.activeAutocompleteInput.value = newName;
          
          // Trigger the specific update logic
          const action = window.activeAutocompleteInput.getAttribute('data-action');
          if (action === 'mainField') {
             const slot = window.activeAutocompleteInput.getAttribute('data-slot');
             if (typeof handleNameChange === 'function') handleNameChange(slot, newName);
          } else if (action === 'dungeonTeam') {
             const teamId = window.activeAutocompleteInput.getAttribute('data-team-id');
             const slotIdx = window.activeAutocompleteInput.getAttribute('data-slot-idx');
             if (typeof updateDungeonTeamName === 'function') updateDungeonTeamName(teamId, parseInt(slotIdx), newName);
          }
        }
        dropdown.style.display = 'none';
      });
    });
  }
  
  // Position the dropdown
  const rect = inputEl.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
  dropdown.style.left = (rect.left + window.scrollX) + 'px';
  dropdown.style.width = Math.max(200, rect.width) + 'px';
  dropdown.style.display = 'block';
  window.activeAutocompleteInput = inputEl;
}

document.addEventListener('input', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusin', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusout', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    setTimeout(() => {
      const dropdown = document.getElementById('globalMemberDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }, 150);
  }
});

// Update window scroll to hide dropdown
window.addEventListener('scroll', () => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown && dropdown.style.display === 'block') dropdown.style.display = 'none';
}, true);
`;

if (!js.includes('window.activeAutocompleteInput = null;')) {
  js = js + '\n' + globalLogic;
  fs.writeFileSync('auth_dungeon.js', js, 'utf8');
}

// 3. Patch app.js Select -> Input
let appJs = fs.readFileSync('app.js', 'utf8');
const appTarget = /<select class="cell-input name-input [\s\S]*?<\/select>/g;
appJs = appJs.replace(appTarget, (match) => {
  // Extract slot from data-slot="${key}"
  const slotMatch = match.match(/data-slot="([^"]+)"/);
  const slotKey = slotMatch ? slotMatch[1] : '';
  
  const disabledMatch = match.match(/disabled/);
  const isDisabled = disabledMatch ? 'disabled' : '';
  
  // We need to get the current value to put it in the input. 
  // It's dynamically rendered via \${a && a.name ? a.name : ''} in the loop, wait.
  // Actually, in app.js it was: <select...>${nameSelectHtml(key, job)}</select>
  return `<input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="🔍 พิมพ์/คลิก..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>`;
});
fs.writeFileSync('app.js', appJs, 'utf8');

// 4. Patch auth_dungeon.js Select -> Input for dungeon teams
let authJs = fs.readFileSync('auth_dungeon.js', 'utf8');
const authTarget = /<select class="cell-input name-input [\s\S]*?<\/select>/g;
authJs = authJs.replace(authTarget, (match) => {
  // Extract teamId and i
  // updateDungeonTeamName('${t.id}', ${i}, this.value)
  return `<input type="text" class="cell-input name-input autocomplete-member" data-team-id="\${t.id}" data-slot-idx="\${i}" data-action="dungeonTeam" value="\${memberName ? escapedName : ''}" placeholder="🔍 พิมพ์/คลิก..." autocomplete="off" style="width:100%; min-width:140px; font-size:14px; padding:6px;" \${isAdmin ? '' : 'disabled'}>`;
});
fs.writeFileSync('auth_dungeon.js', authJs, 'utf8');

console.log('Patched global autocomplete');
