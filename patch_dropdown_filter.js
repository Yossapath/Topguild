const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// We need to inject the filtering logic into showGlobalDropdown right before:
// const val = filterText.toLowerCase();

const targetRegex = /let allMembers = \[\];[\s\S]*?const val = filterText\.toLowerCase\(\);/;

const replacement = `let allMembers = [];
  Object.keys(window.guildRoster).forEach(job => {
    window.guildRoster[job].forEach(m => {
      allMembers.push({ name: m.name, job: job, power: m.power || 0 });
    });
  });
  
  const action = inputEl.getAttribute('data-action');
  if (action === 'mainField') {
    const slotKey = inputEl.getAttribute('data-slot');
    const requiredJob = window.rowJobFilter ? window.rowJobFilter[slotKey] : '';
    
    allMembers = allMembers.filter(m => {
      // 1. Filter by selected job for this row (if any)
      if (requiredJob && m.job !== requiredJob) return false;
      
      // 2. Filter out already occupied members
      const lowerName = m.name.toLowerCase();
      if (window.occupiedMap && window.occupiedMap.has(lowerName)) {
        // Allow them if they are occupying THIS exact slot
        if (window.occupiedMap.get(lowerName) !== slotKey) return false;
      }
      return true;
    });
  }
  
  const val = filterText.toLowerCase();`;

js = js.replace(targetRegex, replacement);
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched dropdown filter');
