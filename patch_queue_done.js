const fs = require('fs');
let txt = fs.readFileSync('module_dungeon.js', 'utf8');

const oldCode = `      if (window.writeSystemLog) window.writeSystemLog('dungeon', 'CLEAR_TEAM', memberStr, t.type, 'ลงดันเจี้ยนสำเร็จ (ทีม ' + (t.dungeonName || t.type) + ') | สมาชิก: ' + memberStr, { teamId: t.id, members: JSON.parse(JSON.stringify(t.members)) });
      t.members = Array(t.capacity).fill(null);`;

const newCode = `      if (window.writeSystemLog) window.writeSystemLog('dungeon', 'CLEAR_TEAM', memberStr, t.type, 'ลงดันเจี้ยนสำเร็จ (ทีม ' + (t.dungeonName || t.type) + ') | สมาชิก: ' + memberStr, { teamId: t.id, members: JSON.parse(JSON.stringify(t.members)) });
      
      // Auto update queue status to 'done' for all team members
      memberNames.forEach(name => {
        const q = dungeonData.queues.find(q => q.name.toLowerCase() === name.toLowerCase() && q.dungeon === t.type && q.status !== 'done');
        if (q) q.status = 'done';
      });

      t.members = Array(t.capacity).fill(null);`;

txt = txt.replace(oldCode, newCode);
fs.writeFileSync('module_dungeon.js', txt, 'utf8');
console.log('Added auto queue update on clear team');
