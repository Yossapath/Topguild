const fs = require('fs');
let text = fs.readFileSync('module_dungeon.js', 'utf8');

// 1. Remove the old loadDungeonSchedule IIFE block
const oldLoadFunc = `    await (async function loadDungeonSchedule() {`;
const oldLoadIndex = text.indexOf(oldLoadFunc);
if (oldLoadIndex !== -1) {
  const endMarker = `    })();`;
  const endIndex = text.indexOf(endMarker, oldLoadIndex);
  if (endIndex !== -1) {
    text = text.slice(0, oldLoadIndex) + text.slice(endIndex + endMarker.length);
    console.log('Removed old loadDungeonSchedule');
  }
} else {
  console.log('old loadDungeonSchedule not found');
}

// 2. Replace setupDungeonFirebase to include the real-time schedule listener
// Use regex to find it to handle any spacing/newline differences
const setupRegex = /async function setupDungeonFirebase\(\) \{[\s\S]*?unsubDungeonListener = onSnapshot\(dungRef, \(snapshot\) => \{[\s\S]*?renderDungeonPage\(\);\s*\}\s*\);\s*\} catch \(e\) \{[\s\S]*?console\.error\(e\);\s*\}/;

const newSetup = `async function setupDungeonFirebase() {
      if (!window.db) return;
      try {
        const dungRef = doc(window.db, "guild_system", "dungeons");

        const snap = await getDoc(dungRef);
        if (!snap.exists()) {
          await setDoc(dungRef, { queues: [], teams: [] });
        }

        unsubDungeonListener = onSnapshot(dungRef, (snapshot) => {
          if (snapshot.exists()) {
            const oldSchedule = dungeonData ? dungeonData._schedule : null;
            dungeonData = snapshot.data();
            dungeonData._schedule = oldSchedule; // Preserve schedule across queue updates
            window.dungeonData = dungeonData;
            if (!dungeonData.queues) dungeonData.queues = [];
            if (!dungeonData.teams) dungeonData.teams = [];
            renderDungeonPage();
          }
        });

        // -------------------------
        // Real-time Schedule Listener
        // -------------------------
        const schedRef = doc(window.db, 'guild_system', 'dungeon_schedule');
        onSnapshot(schedRef, (snap) => {
          if (snap.exists()) {
            const s = snap.data();
            dungeonData._schedule = s || null;
            const od = document.getElementById('dqOpenDate');
            const ot = document.getElementById('dqOpenTime');
            const ct = document.getElementById('dqCloseTime');
            if (s && (s.openDate || s.openTime)) {
              if (od) od.value = s.openDate || '';
              if (ot) ot.value = s.openTime || '06:00';
              if (ct) ct.value = s.closeTime || '23:59';
            } else {
              if (ot && !ot.value) ot.value = '06:00';
              if (ct && !ct.value) ct.value = '23:59';
            }
            if (typeof renderDungeonScheduleStatus === 'function') {
              renderDungeonScheduleStatus(window.isUserAdmin && window.isUserAdmin());
            }
          }
        });

      } catch (e) {
        console.error(e);
      }`;

if (setupRegex.test(text)) {
  text = text.replace(setupRegex, newSetup);
  console.log('Replaced setupDungeonFirebase successfully');
} else {
  console.log('Regex for setupDungeonFirebase did not match!');
}

fs.writeFileSync('module_dungeon.js', text);
