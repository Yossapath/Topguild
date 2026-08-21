const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const buggyBlock = `  const dqNameInput = document.getElementById('dqName');
  if (dqNameInput) {
    dqNameInput.addEventListener('change', (e) => {
      const val = e.target.value.trim().toLowerCase();
      if (!val) return;
      if (window.guildRoster) {
        for (let job in window.guildRoster) {
          const found = window.guildRoster[job].find(m => m.name.toLowerCase() === val);
          if (found) {
            const dqClass = document.getElementById('dqClass');
            if (dqClass) dqClass.value = job;
            break;
          }
        }
      }
    });
  }`;

js = js.replace(buggyBlock, '');

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Fixed syntax error');
