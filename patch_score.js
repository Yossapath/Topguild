const fs = require('fs');

// Patch module_dungeon.js
let md = fs.readFileSync('module_dungeon.js', 'utf8');

const scoreDisplayScript = `
    window.updateDungeonScoreDisplay = function(nameStr) {
      var display = document.getElementById('dqScoreDisplay');
      if (!display) return;
      var name = (nameStr || '').trim();
      if (!name) {
        display.style.display = 'none';
        return;
      }
      if (typeof window.getUserScore === 'function') {
        var score = window.getUserScore(name);
        var color = score < 0 ? 'var(--danger)' : 'var(--ok)';
        var text = score <= -2 ? ' (ไม่มีสิทธิ์จองคิว)' : '';
        display.innerHTML = 'คะแนนกิจกรรม: <span style="color:' + color + ';">' + score + text + '</span>';
        display.style.display = 'block';
      }
    };

    var dqNameEl = document.getElementById('dqName');
    if (dqNameEl) {
      dqNameEl.addEventListener('input', function(e) {
        window.updateDungeonScoreDisplay(e.target.value);
      });
    }
`;

if (!md.includes('window.updateDungeonScoreDisplay')) {
  md = md.replace('window.bookDungeonQueue = async function', scoreDisplayScript + '\n    window.bookDungeonQueue = async function');
  
  // Update dqName clear to also clear score
  md = md.replace('document.getElementById("dqName").value = "";', 'document.getElementById("dqName").value = "";\n      window.updateDungeonScoreDisplay("");');
  fs.writeFileSync('module_dungeon.js', md);
  console.log('module_dungeon.js patched with score display');
}

// Patch module_auth.js
let ma = fs.readFileSync('module_auth.js', 'utf8');
if (!ma.includes('updateDungeonScoreDisplay')) {
  ma = ma.replace(
    'if (dqClass) dqClass.value = job;',
    'if (dqClass) dqClass.value = job;\n              if (typeof window.updateDungeonScoreDisplay === "function") window.updateDungeonScoreDisplay(newName);'
  );
  fs.writeFileSync('module_auth.js', ma);
  console.log('module_auth.js patched with updateDungeonScoreDisplay');
}

