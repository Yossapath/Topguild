const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  '<input type="text" id="dqName" class="form-control" placeholder="ชื่อตัวละคร..." style="margin-bottom: 8px;">',
  '<input type="text" id="dqName" class="form-control" placeholder="ชื่อตัวละคร..." style="margin-bottom: 8px;" list="rosterDatalist">'
);

fs.writeFileSync('index.html', html, 'utf8');

let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const s1 = `document.addEventListener('DOMContentLoaded', () => {`;
const r1 = `document.addEventListener('DOMContentLoaded', () => {
  const dqNameInput = document.getElementById('dqName');
  if (dqNameInput) {
    dqNameInput.addEventListener('input', (e) => {
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
  }
`;

js = js.replace(s1, r1);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('patched dqName');
