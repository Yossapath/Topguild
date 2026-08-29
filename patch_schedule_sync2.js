const fs = require('fs');
let text = fs.readFileSync('module_dungeon.js', 'utf8');

const targetStr = `    async function setupDungeonFirebase() {
      if (!window.db) return;
      try {
        const dungRef = doc(window.db, "guild_system", "dungeons");

        const snap = await getDoc(dungRef);
        if (!snap.exists()) {
          await setDoc(dungRef, { queues: [], teams: [] });
        }

        unsubDungeonListener = onSnapshot(dungRef, (snapshot) => {
          if (snapshot.exists()) {
            dungeonData = snapshot.data();
            window.dungeonData = dungeonData;
            if (!dungeonData.queues) dungeonData.queues = [];
            if (!dungeonData.teams) dungeonData.teams = [];
            renderDungeonPage();
          }
        });
      } catch (e) {
        console.error(e);
      }
    }`;

const newSetup = `    async function setupDungeonFirebase() {
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
      }
    }`;

// Use normalizing replacement
const normalizedText = text.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');

if (normalizedText.includes(normalizedTarget)) {
  text = normalizedText.replace(normalizedTarget, newSetup);
  fs.writeFileSync('module_dungeon.js', text);
  console.log('Successfully replaced setupDungeonFirebase!');
} else {
  console.log('Could not find the target string exactly.');
}
