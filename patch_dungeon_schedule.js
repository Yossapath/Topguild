const fs = require('fs');

// ======= 1. Patch index.html: Replace admin controls section =======
let html = fs.readFileSync('index.html', 'utf8');

const oldRunControls = `          <!-- Admin run queue controls -->
          <div id="dungeonRunControls" style="margin-top:16px; display:none;">
            <hr style="border:none; border-top:1px solid var(--line); margin:16px 0;">
            <button class="btn-secondary" style="width:100%; font-size:14px; padding:12px; font-weight:700; border-color:var(--ok); color:var(--ok);" onclick="window.runDungeonQueue && window.runDungeonQueue()">▶️ รันคิว (จัดทีมอัตโนมัติ)</button>
            <button class="btn-secondary" style="width:100%; font-size:14px; padding:10px; margin-top:8px; font-weight:600; border-color:var(--danger); color:var(--danger);" onclick="window.clearDungeonQueues && window.clearDungeonQueues()">🗑️ ล้างคิวทั้งหมด</button>
          </div>`;

const newAdminControls = `          <!-- Admin booking schedule panel -->
          <div id="dungeonAdminPanel" style="margin-top:16px; display:none;">
            <hr style="border:none; border-top:1px solid var(--line); margin:16px 0;">
            <div style="background:var(--blue-50,#eff6ff); border:1.5px solid var(--blue-200,#bfdbfe); border-radius:10px; padding:16px;">
              <div style="font-size:13px; font-weight:700; color:var(--blue-700); margin-bottom:12px;">⚙️ ตั้งค่าช่วงเวลาเปิดจอง</div>
              <label style="font-size:11px; font-weight:700; color:var(--text-lo); display:block; margin-bottom:4px; text-transform:uppercase;">วันที่เปิดจอง</label>
              <input type="date" id="dqOpenDate" class="form-control" style="width:100%; margin-bottom:10px; font-size:14px; padding:10px; box-sizing:border-box;">
              <div style="display:flex; gap:8px; margin-bottom:10px;">
                <div style="flex:1;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-lo); display:block; margin-bottom:4px; text-transform:uppercase;">เวลาเปิด</label>
                  <input type="time" id="dqOpenTime" class="form-control" style="width:100%; font-size:14px; padding:10px; box-sizing:border-box;">
                </div>
                <div style="flex:1;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-lo); display:block; margin-bottom:4px; text-transform:uppercase;">เวลาปิด</label>
                  <input type="time" id="dqCloseTime" class="form-control" style="width:100%; font-size:14px; padding:10px; box-sizing:border-box;">
                </div>
              </div>
              <button class="btn-primary" style="width:100%; font-size:14px; padding:12px; font-weight:700;" onclick="window.saveDungeonSchedule && window.saveDungeonSchedule()">💾 บันทึกตั้งค่า</button>
              <button class="btn-secondary" style="width:100%; font-size:13px; padding:9px; margin-top:8px; font-weight:600; border-color:var(--danger); color:var(--danger);" onclick="window.clearDungeonSchedule && window.clearDungeonSchedule()">🔓 เปิดจองไม่จำกัดเวลา</button>
            </div>
          </div>`;

if (html.includes(oldRunControls)) {
  html = html.replace(oldRunControls, newAdminControls);
  console.log('Replaced admin controls in HTML');
} else {
  console.log('Could not find oldRunControls in HTML');
}

// Also add a booking status bar below the booking button
const oldBookBtn = `          <button class="btn-primary" style="width:100%; font-size:17px; padding:16px; font-weight:700; border-radius:10px;" onclick="bookDungeonQueue()">🎯 จองคิวลงดันเจี้ยน</button>`;
const newBookBtn = `          <div id="dqScheduleStatus" style="margin-bottom:12px; padding:10px 14px; border-radius:8px; font-size:13px; font-weight:600; display:none;"></div>
          <button class="btn-primary" id="btnBookDungeon" style="width:100%; font-size:17px; padding:16px; font-weight:700; border-radius:10px;" onclick="bookDungeonQueue()">🎯 จองคิวลงดันเจี้ยน</button>`;

if (html.includes(oldBookBtn)) {
  html = html.replace(oldBookBtn, newBookBtn);
  console.log('Added schedule status bar to HTML');
} else {
  console.log('Could not find book button in HTML');
}

fs.writeFileSync('index.html', html);

// ======= 2. Patch module_dungeon.js: Update queue rendering + add schedule system =======
let code = fs.readFileSync('module_dungeon.js', 'utf8');

// 2a. Replace the admin controls / run controls section in renderDungeonPage
const oldRunCtrl = `      // Show/hide run controls for admin
      const runCtrl = document.getElementById('dungeonRunControls');
      if (runCtrl) runCtrl.style.display = isAdmin ? 'block' : 'none';

      // Admin controls area
      const adminCtrlArea = document.getElementById('dungeonAdminControls');
      if (adminCtrlArea && isAdmin) {
        adminCtrlArea.innerHTML = '';
      }`;

const newAdminCtrl = `      // Show/hide admin panel
      const adminPanel = document.getElementById('dungeonAdminPanel');
      if (adminPanel) adminPanel.style.display = isAdmin ? 'block' : 'none';

      // Update booking schedule status bar
      renderDungeonScheduleStatus(isAdmin);`;

code = code.replace(oldRunCtrl, newAdminCtrl);

// 2b. Replace queue item HTML rendering (adminCtrl with full/half status buttons → only Done + Delete)
const oldAdminCtrl = `const memberCtrl = (!isAdmin && window.currentUser && q.name?.toLowerCase() === window.currentUser.username?.toLowerCase()) ? \`<div style="display:flex;margin-top:8px;"><button class="btn-secondary" onclick="deleteDungeonQueue('${q.id}')" style="font-size:11px;padding:2px 8px;color:var(--danger);border-color:var(--danger);">ยกเลิกการจอง</button></div>\` : '';
              const adminCtrl = isAdmin ? \`<div style="display:flex;gap:4px;margin-top:8px;">
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','waiting')" style="font-size:11px;padding:2px 4px;">รอ</button>
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','active')" style="font-size:11px;padding:2px 4px;">กำลังลง</button>
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','done')" style="font-size:11px;padding:2px 4px;">เสร็จ</button>
          <button class="btn-secondary" onclick="deleteDungeonQueue('${q.id}')" style="font-size:11px;padding:2px 4px;color:var(--danger);border-color:var(--danger);">ลบ</button>
        </div>\`
                : "";`;

const newAdminCtrl2 = `const isOwner = window.currentUser && q.name?.toLowerCase() === window.currentUser.username?.toLowerCase();
              const memberCtrl = (!isAdmin && isOwner) ? \`<div style="display:flex;gap:8px;margin-top:12px;">
                <button class="btn-secondary" onclick="deleteDungeonQueue('\${q.id}')" style="font-size:13px;padding:8px 16px;color:var(--danger);border-color:var(--danger);flex:1;">🗑 ยกเลิกการจอง</button>
              </div>\` : '';
              const adminCtrl = isAdmin ? \`<div style="display:flex;gap:8px;margin-top:12px;">
                <button class="btn-primary" onclick="changeDungeonQueueStatus('\${q.id}','done')" style="font-size:13px;padding:8px 16px;flex:1;background:var(--ok);border:none;">✅ ลงเสร็จ</button>
                <button class="btn-secondary" onclick="deleteDungeonQueue('\${q.id}')" style="font-size:13px;padding:8px 16px;color:var(--danger);border-color:var(--danger);">🗑 ลบ</button>
              </div>\` : '';`;

code = code.replace(oldAdminCtrl, newAdminCtrl2);

// 2c. Upgrade queue card UI (bigger)
const oldCardHtml = `return \`<div \${dragAttr} style="padding:10px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;\${isAdmin ? "cursor:grab;" : ""}" ondragstart="window.onDungeonQueueDragStart(event)">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <strong style="color:var(--text-hi);font-size:14px;">\${eName}</strong>
              <span style="font-size:11px;color:\${q.job && window.JOB_COLORS && window.JOB_COLORS[q.job] ? window.JOB_COLORS[q.job] : "var(--text-lo)"};margin-left:6px;font-weight:600;">\${q.job || ""}</span>
              \${q.power ? '<span style="font-size:11px;color:var(--text-lo);">' + Number(q.power).toLocaleString("en-US") + "</span>" : ""}
              \${q.timestamp ? '<div style="font-size:10.5px;color:var(--text-lo);margin-top:4px;">🕒 ' + new Date(q.timestamp).toLocaleString("th-TH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + " น.</div>" : ""}
            </div>
            <span style="font-size:11px;padding:2px 6px;border-radius:12px;font-weight:600;color:\${sColor};">\${sText}</span>
          </div>
          \${adminCtrl}\${memberCtrl}
              </div>\`;`;

const newCardHtml = `const jobColor = q.job && window.JOB_COLORS && window.JOB_COLORS[q.job] ? window.JOB_COLORS[q.job] : 'var(--text-lo)';
              const statusBg = q.status === 'done' ? 'rgba(22,163,74,0.12)' : q.status === 'active' ? 'rgba(37,99,235,0.10)' : 'rgba(245,158,11,0.10)';
              const statusBorder = q.status === 'done' ? 'var(--ok)' : q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)';
              return \`<div \${dragAttr} style="padding:16px 20px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;background:\${statusBg};border-left:4px solid \${statusBorder};\${isAdmin ? 'cursor:grab;' : ''}" ondragstart="window.onDungeonQueueDragStart(event)">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div>
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                      <strong style="color:var(--text-hi);font-size:16px;font-weight:700;">\${eName}</strong>
                      <span style="font-size:12px;color:\${jobColor};font-weight:700;background:rgba(0,0,0,0.06);padding:2px 8px;border-radius:10px;">\${q.job || ''}</span>
                      \${q.power ? '<span style="font-size:12px;color:var(--text-lo);font-weight:600;">' + Number(q.power).toLocaleString('en-US') + '</span>' : ''}
                    </div>
                    \${q.timestamp ? '<div style="font-size:11px;color:var(--text-lo);">🕒 ' + new Date(q.timestamp).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + ' น.</div>' : ''}
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                    <span style="font-size:12px;padding:4px 12px;border-radius:20px;font-weight:700;color:\${sColor};border:1.5px solid \${sColor};background:white;white-space:nowrap;">\${sText}</span>
                  </div>
                </div>
                \${adminCtrl}\${memberCtrl}
              </div>\`;`;

code = code.replace(oldCardHtml, newCardHtml);

// 2d. Add schedule functions before the closing of the module
const scheduleInsertBefore = `    // ====== END DUNGEON MODULE ======`;
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
        renderDungeonScheduleStatus(false);
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
      const nowStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
      const nowTime = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' });
      const isOpen = nowStr === sched.openDate && nowTime >= sched.openTime && nowTime <= sched.closeTime;
      const openDt = sched.openDate + ' ' + sched.openTime + ' น.';
      const closeDt = sched.closeTime + ' น.';
      if (isOpen) {
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(22,163,74,0.12)';
        statusEl.style.color = 'var(--ok)';
        statusEl.style.border = '1px solid var(--ok)';
        statusEl.textContent = '🟢 เปิดจองอยู่ถึงเวลา ' + closeDt;
        if (bookBtn) { bookBtn.disabled = false; bookBtn.style.opacity = '1'; }
      } else {
        statusEl.style.display = 'block';
        statusEl.style.background = 'rgba(239,68,68,0.08)';
        statusEl.style.color = 'var(--danger)';
        statusEl.style.border = '1px solid var(--danger)';
        const futureOpen = nowStr < sched.openDate || (nowStr === sched.openDate && nowTime < sched.openTime);
        statusEl.textContent = futureOpen ? '🔒 จะเปิดจองวันที่ ' + openDt + ' – ' + closeDt : '🔒 ปิดรับการจองแล้ว (ช่วงวันที่ ' + sched.openDate + ' ' + sched.openTime + '–' + sched.closeTime + ')';
        if (bookBtn && !isAdmin) { bookBtn.disabled = true; bookBtn.style.opacity = '0.5'; }
      }
    }

    // Load schedule on init
    async function loadDungeonSchedule() {
      if (!window.db) return;
      try {
        const schedRef = doc(window.db, 'guild_system', 'dungeon_schedule');
        const snap = await getDoc(schedRef);
        if (snap.exists()) {
          const s = snap.data();
          dungeonData._schedule = s;
          // Pre-fill admin inputs
          const od = document.getElementById('dqOpenDate');
          const ot = document.getElementById('dqOpenTime');
          const ct = document.getElementById('dqCloseTime');
          if (od) od.value = s.openDate || '';
          if (ot) ot.value = s.openTime || '';
          if (ct) ct.value = s.closeTime || '';
          renderDungeonScheduleStatus(window.isUserAdmin && window.isUserAdmin());
        }
      } catch(e) { console.error('loadDungeonSchedule:', e); }
    }
    loadDungeonSchedule();

`;

// Insert before end of module
code = code.replace(scheduleInsertBefore, scheduleCode + scheduleInsertBefore);

fs.writeFileSync('module_dungeon.js', code);
console.log('Patched module_dungeon.js');
