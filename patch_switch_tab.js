const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

js = js.replace(/document\.querySelectorAll\('\.dungeon-tab-btn'\)\.forEach\(btn => \{[\s\S]*?\}\);/, `document.querySelectorAll('.dungeon-tab').forEach(btn => {
      btn.classList.remove('active');
      btn.style.background = 'transparent';
      btn.style.color = 'var(--text-lo)';
      if (btn.getAttribute('data-type') === tabName) {
        btn.classList.add('active');
        btn.style.background = '#2563eb';
        btn.style.color = 'white';
      }
    });`);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Fixed switchDungeonTab styles');
