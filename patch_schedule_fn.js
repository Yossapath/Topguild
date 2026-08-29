const fs = require('fs');
let code = fs.readFileSync('module_dungeon.js', 'utf8');

// Add schedule functions + renderDungeonScheduleStatus to the end of the module
// Find the closing of initDungeonModule
const insertBefore = `  } catch (err) {
    console.error("[Module Dungeon] Error:", err);
  }
})();`;

const scheduleCode = `
    // ====== DUNGEON BOOKING SCHEDULE ======
    window.saveDungeonSchedule = async function() {
      if (!window.isUserAdmin || !window.isUserAdmin()) return;
      const openDate = document.getElementById('dqOpenDate')?.value || '';
      const openTime = document.getElementById('dqOpenTime')?.value || '';
      const closeTime = document.getElementById('dqCloseTime')?.value || '';
      if (!openDate || !openTime || !closeTime) {
        return window.showToast('กรุณากรอกวันที่และเวลาให้ครบ', 'error');
      }
      try {
        const scheduleRef = doc(window.db, 'guild_system', 'dungeon_schedule');
        await setDoc(scheduleRef, { openDate, openTime, closeTime, updatedAt: Date.now() });
        dungeonData._schedule = { openDate, openTime, closeTime };
        window.showToast('บันทึกตั้งค่าช่วงเวลาเปิดจองเรียบร้อยแล้ว', 'success');
        renderDungeonScheduleStatus(true);
      } catch(e) {
        console.error(e);
        window.showToast('เกิดข้อผิดพลาด', 'error');
      }
    };

    window.clearDungeonSchedule = async function() {
      if (!window.isUserAdmin || !window.isUserAdmin()) return;
      try {
        const scheduleRef = doc(window.db, 'guild_system', 'dungeon_schedule');
        await setDoc(scheduleRef, { openDate: '', openTime: '', closeTime: '', updatedAt: Date.now() });
        dungeonData._schedule = null;
        window.showToast('เปิดจองไม่จำกัดเวลาแล้ว', 'success');
        renderDungeonScheduleStatus(window.isUserAdmin && window.isUserAdmin());
      } catch(e) {
        window.showToast('เกิดข้อผิดพลาด', 'error');
      }
    };

    function renderDungeonScheduleStatus(isAdmin) {
      const statusEl = document.getElementById('dqScheduleStatus');
      const bookBtn = document.getElementById('btnBookDungeon');
      if (!statusEl) return;
      const sched = dungeonData._schedule;
      if (!sched || !sched.openDate || !sched.openTime || !sched.closeTime) {
        statusEl.style.display = 'none';
        if (bookBtn) { bookBtn.disabled = false; bookBtn.style.opacity = '1'; }
        return;
      }
      const now = new Date();
      const nowDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
      const nowTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' });
      const isOpen = nowDateStr === sched.openDate && nowTimeStr >= sched.openTime && nowTimeStr <= sched.closeTime;
      if (isOpen) {
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(22,163,74,0.12)';
        statusEl.style.color = 'var(--ok)';
        statusEl.style.border = '1px solid var(--ok)';
        statusEl.textContent = '🟢 เปิดรับจองอยู่ (ถึง ' + sched.closeTime + ' น.)';
        if (bookBtn) { bookBtn.disabled = false; bookBtn.style.opacity = '1'; }
      } else {
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(239,68,68,0.08)';
        statusEl.style.color = 'var(--danger)';
        statusEl.style.border = '1px solid var(--danger)';
        const futureOpen = nowDateStr < sched.openDate || (nowDateStr === sched.openDate && nowTimeStr < sched.openTime);
        statusEl.textContent = futureOpen
          ? '🔒 จะเปิดจองวันที่ ' + sched.openDate + ' เวลา ' + sched.openTime + ' – ' + sched.closeTime + ' น.'
          : '🔒 ปิดรับการจองแล้ว (เปิดวันที่ ' + sched.openDate + ' ' + sched.openTime + '–' + sched.closeTime + ' น.)';
        if (bookBtn && !isAdmin) { bookBtn.disabled = true; bookBtn.style.opacity = '0.5'; }
      }
    }
    window.renderDungeonScheduleStatus = renderDungeonScheduleStatus;

    // Load schedule on init
    (async function loadDungeonSchedule() {
      if (!window.db) return;
      try {
        const schedRef = doc(window.db, 'guild_system', 'dungeon_schedule');
        const snap = await getDoc(schedRef);
        if (snap.exists()) {
          const s = snap.data();
          if (s.openDate || s.openTime) {
            dungeonData._schedule = s;
            const od = document.getElementById('dqOpenDate');
            const ot = document.getElementById('dqOpenTime');
            const ct = document.getElementById('dqCloseTime');
            if (od) od.value = s.openDate || '';
            if (ot) ot.value = s.openTime || '';
            if (ct) ct.value = s.closeTime || '';
            renderDungeonScheduleStatus(window.isUserAdmin && window.isUserAdmin());
          }
        }
      } catch(e) { console.error('loadDungeonSchedule:', e); }
    })();

`;

// Also update renderDungeonPage to call renderDungeonScheduleStatus
// Find and add that call
code = code.replace(
  `      // Show/hide admin panel
      const adminPanel = document.getElementById('dungeonAdminPanel');
      if (adminPanel) adminPanel.style.display = isAdmin ? 'block' : 'none';

      // Update booking schedule status bar
      renderDungeonScheduleStatus(isAdmin);`,
  `      // Show/hide admin panel
      const adminPanel = document.getElementById('dungeonAdminPanel');
      if (adminPanel) adminPanel.style.display = isAdmin ? 'block' : 'none';

      // Update booking schedule status bar
      if (typeof renderDungeonScheduleStatus === 'function') renderDungeonScheduleStatus(isAdmin);`
);

if (code.includes(insertBefore)) {
  code = code.replace(insertBefore, scheduleCode + '\n' + insertBefore);
  fs.writeFileSync('module_dungeon.js', code);
  console.log('Added schedule system to module_dungeon.js');
} else {
  console.log('Could not find closing block');
}
