const fs = require('fs');
let code = fs.readFileSync('module_dungeon.js', 'utf8');

// 1. Update badge count when queue renders
const target1 = 'qList.innerHTML = filteredQueues';
const replace1 = `const badge = document.getElementById('dqCountBadge'); if (badge) badge.textContent = filteredQueues.filter(q => q.status !== 'done').length + ' คน';
        qList.innerHTML = filteredQueues`;
code = code.replace(target1, replace1);

// 2. Show dungeonRunControls for admins + admin controls area
const target2 = `// ---- QUEUE PANEL ----`;
const replace2 = `// Show/hide run controls for admin
      const runCtrl = document.getElementById('dungeonRunControls');
      if (runCtrl) runCtrl.style.display = isAdmin ? 'block' : 'none';

      // Admin controls area
      const adminCtrlArea = document.getElementById('dungeonAdminControls');
      if (adminCtrlArea && isAdmin) {
        adminCtrlArea.innerHTML = '';
      }

      // ---- QUEUE PANEL ----`;
code = code.replace(target2, replace2);

fs.writeFileSync('module_dungeon.js', code);
console.log('Patched module_dungeon.js!');
