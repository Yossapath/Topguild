const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const regex = /function showGlobalDropdown\(inputEl, filterText = ''\) \{[\s\S]*?window\.activeAutocompleteInput = inputEl;\s*\}/;

const replacement = `function showGlobalDropdown(inputEl, filterText = '') {
  if (!window.guildRoster) return;
  const dropdown = document.getElementById('globalMemberDropdown');
  if (!dropdown) return;
  
  let allMembers = [];
  Object.keys(window.guildRoster).forEach(job => {
    window.guildRoster[job].forEach(m => {
      allMembers.push({ name: m.name, job: job, power: m.power || 0 });
    });
  });
  
  const action = inputEl.getAttribute('data-action');
  
  // Apply specific filters
  if (action === 'mainField') {
    const slotKey = inputEl.getAttribute('data-slot');
    const requiredJob = window.rowJobFilter ? window.rowJobFilter[slotKey] : '';
    
    allMembers = allMembers.filter(m => {
      if (requiredJob && m.job !== requiredJob) return false;
      const lowerName = m.name.toLowerCase();
      if (window.occupiedMap && window.occupiedMap.has(lowerName)) {
        if (window.occupiedMap.get(lowerName) !== slotKey) return false;
      }
      return true;
    });
  } else if (action === 'dungeonTeam' && typeof window.dungeonData !== 'undefined') {
    const currentTab = window.currentDungeonTab;
    const teamId = inputEl.getAttribute('data-team-id');
    const slotIdx = parseInt(inputEl.getAttribute('data-slot-idx'));
    const inUseNames = new Set();
    
    window.dungeonData.teams.forEach(t => {
      if (t.type === currentTab) {
        t.members.forEach((m, idx) => {
          if (m && m.name) {
             if (t.id === teamId && idx === slotIdx) return; // Allow current occupant
             inUseNames.add(m.name.toLowerCase());
          }
        });
      }
    });
    allMembers = allMembers.filter(m => !inUseNames.has(m.name.toLowerCase()));
  }
  
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
          
          const action = window.activeAutocompleteInput.getAttribute('data-action');
          if (action === 'mainField') {
             const slot = window.activeAutocompleteInput.getAttribute('data-slot');
             if (typeof handleNameChange === 'function') handleNameChange(slot, newName);
          } else if (action === 'dungeonTeam') {
             const teamId = window.activeAutocompleteInput.getAttribute('data-team-id');
             const slotIdx = window.activeAutocompleteInput.getAttribute('data-slot-idx');
             if (typeof updateDungeonTeamName === 'function') updateDungeonTeamName(teamId, parseInt(slotIdx), newName);
          } else if (action === 'leaveForm') {
             const job = item.getAttribute('data-job');
             const leaveJob = document.getElementById('leaveJob');
             if (leaveJob) leaveJob.value = job;
          } else if (action === 'dungeonQueue') {
             const job = item.getAttribute('data-job');
             const dqClass = document.getElementById('dqClass');
             if (dqClass) dqClass.value = job;
          }
        }
        dropdown.style.display = 'none';
      });
    });
  }
  
  const rect = inputEl.getBoundingClientRect();
  dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
  dropdown.style.left = (rect.left + window.scrollX) + 'px';
  dropdown.style.width = Math.max(200, rect.width) + 'px';
  dropdown.style.display = 'block';
  window.activeAutocompleteInput = inputEl;
}`;

if (js.match(regex)) {
  js = js.replace(regex, replacement);
  fs.writeFileSync('auth_dungeon.js', js, 'utf8');
  console.log('Fixed showGlobalDropdown');
} else {
  console.log('Could not match showGlobalDropdown');
}
