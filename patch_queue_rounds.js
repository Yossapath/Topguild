const fs = require('fs');
let html = fs.readFileSync('module_dungeon.js', 'utf8');

// Step 1: Add window.toggleDungeonQueueRound
const toggleFunc = `
    window.toggleDungeonQueueRound = function(id, roundNumber) {
      const isAdmin = typeof window.isUserAdmin === 'function' && window.isUserAdmin();
      const q = dungeonData.queues.find(x => x.id === id);
      if (q) {
        const isOwner = window.currentUser && window.currentUser.username && q.name && q.name.toLowerCase() === window.currentUser.username.toLowerCase();
        if (isAdmin || isOwner) {
          if (roundNumber === 1) q.round1 = !q.round1;
          if (roundNumber === 2) q.round2 = !q.round2;
          saveDungeonState();
        }
      }
    };
`;
if (!html.includes('toggleDungeonQueueRound')) {
  html = html.replace('window.deleteDungeonQueue = function (id) {', toggleFunc + '    window.deleteDungeonQueue = function (id) {');
}

// Step 2: Update map function to (q, index)
html = html.replace('qList.innerHTML = filteredQueues.map((q) => {', 'qList.innerHTML = filteredQueues.map((q, index) => {');

// Step 3: Update eName to include index
const nameSearch = `<strong style="font-size:14px;font-weight:700;color:var(--text-hi);line-height:30px;white-space:nowrap;">\${eName}</strong>`;
const nameReplace = `<strong style="font-size:14px;font-weight:700;color:var(--text-hi);line-height:30px;white-space:nowrap;"><span style="color:var(--text-lo);margin-right:4px;">\${index + 1}.</span>\${eName}</strong>`;
if(html.includes(nameSearch)) {
    html = html.replace(nameSearch, nameReplace);
    console.log('Injected index prefix');
} else {
    console.log('Could not find eName string');
}

// Step 4: Inject Round Buttons before adminCtrl
// First construct the buttons HTML string inside the template literal.
// We need to find the injection point.
const injectSearch = `<div style="display:flex;gap:6px;margin-left:auto;flex-shrink:0;">\${adminCtrl}\${memberCtrl}</div>`;
const injectReplace = `
                <!-- Round Buttons -->
                <div style="display:flex;gap:6px;margin-left:8px;">
                  <button onclick="window.toggleDungeonQueueRound('\${q.id}', 1)" style="font-size:12px;height:30px;padding:0 12px;border:none;background:\${q.round1 ? '#10b981' : '#f59e0b'};color:white;border-radius:6px;cursor:\${isAdmin || isOwner ? 'pointer' : 'default'};opacity:\${isAdmin || isOwner ? '1' : '0.7'};white-space:nowrap;font-weight:700;">รอบ 1</button>
                  <button onclick="window.toggleDungeonQueueRound('\${q.id}', 2)" style="font-size:12px;height:30px;padding:0 12px;border:none;background:\${q.round2 ? '#10b981' : '#f59e0b'};color:white;border-radius:6px;cursor:\${isAdmin || isOwner ? 'pointer' : 'default'};opacity:\${isAdmin || isOwner ? '1' : '0.7'};white-space:nowrap;font-weight:700;">รอบ 2</button>
                </div>
                ${injectSearch}`;
if(html.includes(injectSearch)) {
    html = html.replace(injectSearch, injectReplace);
    console.log('Injected round buttons');
} else {
    console.log('Could not find injectSearch string');
}

fs.writeFileSync('module_dungeon.js', html);
