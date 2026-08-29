const fs = require('fs');
let html = fs.readFileSync('module_dungeon.js', 'utf8');

// We need to actually remove them from dungeonData.queues so we don't leak memory in Firestore.
const searchChangeStatus = `    window.changeDungeonQueueStatus = function (id, newStatus) {
      const q = dungeonData.queues.find((x) => x.id === id);
      if (q) {
        q.status = newStatus;
        saveDungeonState();
      }
    };`;

const replaceChangeStatus = `    window.changeDungeonQueueStatus = function (id, newStatus) {
      const q = dungeonData.queues.find((x) => x.id === id);
      if (q) {
        if (newStatus === 'done') {
           // Delete it from the array instead of keeping it hidden
           dungeonData.queues = dungeonData.queues.filter(x => x.id !== id);
        } else {
           q.status = newStatus;
        }
        saveDungeonState();
      }
    };`;

html = html.replace(searchChangeStatus, replaceChangeStatus);

const searchToggleRound = `          if (roundNumber === 2) {
            q.round2 = !q.round2;
            if (q.round2) q.status = 'done';
          }`;

const replaceToggleRound = `          if (roundNumber === 2) {
            q.round2 = !q.round2;
            if (q.round2) {
               // Auto delete it instead of just marking as done and hiding
               dungeonData.queues = dungeonData.queues.filter(x => x.id !== id);
            }
          }`;
html = html.replace(searchToggleRound, replaceToggleRound);

fs.writeFileSync('module_dungeon.js', html);
console.log('Patched to auto-delete done queues');
