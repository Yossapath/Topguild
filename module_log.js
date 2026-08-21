import { doc, collection, addDoc, getDocs, query, orderBy, limit, setDoc, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// MODULE: SYSTEM LOG + DUNGEON BACKUP
// Admin-only visibility
// ==========================================

(async function initLogModule() {
  try {

    // ---- WRITE LOG ----
    window.writeSystemLog = async function(category, action, targetName, dungeonName, detailText, rollbackData = null) {
      if (!window.db) return;
      try {
        const actor = window.currentUser ? (window.currentUser.name || window.currentUser.username || 'System') : 'System';
        const logRef = collection(window.db, 'guild_system_logs');
        await addDoc(logRef, {
          timestamp: Date.now(),
          actor: actor,
          category: category || 'system',
          action: action,
          targetName: targetName || '',
          dungeonName: dungeonName || '',
          detailText: detailText || '',
          rollbackData: rollbackData ? JSON.stringify(rollbackData) : null
        });
      } catch(e) {
        console.warn('[Log] Failed to write log:', e);
      }
    };

    // ---- RESTORE LOG ITEM ----
    window.restoreLogItem = async function(logId, logStr) {
      if (!window.db) return;
      if (!confirm('ยืนยันการกู้คืนข้อมูลรายการนี้?')) return;
      try {
        const log = JSON.parse(decodeURIComponent(logStr));
        if (!log.rollbackData) return window.showToast('ไม่มีข้อมูลสำหรับกู้คืน', 'error');
        const rb = JSON.parse(log.rollbackData);

        if (log.category === 'dungeon') {
          if (!window.dungeonData) return window.showToast('ข้อมูลดันเจี้ยนยังไม่พร้อม', 'error');
          if (log.action === 'DELETE_QUEUE') {
            if (window.dungeonData.queues.find(q => q.id === rb.id)) {
              return window.showToast('คิวนี้มีอยู่ในระบบแล้ว ไม่สามารถกู้ซ้ำได้', 'warning');
            }
            window.dungeonData.queues.push(rb);
          } else if (log.action === 'CLEAR_TEAM') {
            const t = window.dungeonData.teams.find(x => x.id === rb.teamId);
            if (t) {
              t.members = rb.members;
            } else {
              return window.showToast('ไม่พบทีมดังกล่าว (อาจถูกลบไปแล้ว)', 'error');
            }
          } else {
            return window.showToast('รายการนี้ไม่รองรับการกู้คืน', 'error');
          }
          const dungRef = doc(window.db, 'guild_system', 'dungeons');
          await setDoc(dungRef, window.dungeonData);
          await window.writeSystemLog('dungeon', 'RESTORE_ITEM', log.targetName, log.dungeonName, 'กู้คืนข้อมูล: ' + log.detailText, null);
          window.showToast('กู้คืนข้อมูลสำเร็จ', 'success');
          window.renderLogPage(window._currentLogTab);
        } else if (log.category === 'leave') {
           // Will implement leave logic similarly if needed
           if (log.action === 'DELETE_LEAVE') {
               const leaveRef = doc(window.db, 'guild_system', 'leaves');
               const currentLeaves = window.leavesData || [];
               if (currentLeaves.find(x => x.id === rb.id)) {
                   return window.showToast('ใบลาฉบับนี้มีอยู่ในระบบแล้ว', 'warning');
               }
               currentLeaves.push(rb);
               await setDoc(leaveRef, { data: currentLeaves });
               await window.writeSystemLog('leave', 'RESTORE_ITEM', log.targetName, '', 'กู้คืนใบลา', null);
               window.showToast('กู้คืนใบลาสำเร็จ', 'success');
               window.renderLogPage(window._currentLogTab);
           }
        }

      } catch(e) {
        window.showToast('กู้คืนล้มเหลว: ' + e.message, 'error');
      }
    };


    // ---- BACKUP DUNGEON DATA ----
    window.backupDungeonData = async function(reason = '') {
      if (!window.db || !window.dungeonData) return;
      try {
        const snap = JSON.parse(JSON.stringify(window.dungeonData));
        const backupRef = collection(window.db, 'guild_dungeon_backups');
        const actor = window.currentUser ? (window.currentUser.name || window.currentUser.username || 'System') : 'System';
        await addDoc(backupRef, {
          timestamp: Date.now(),
          actor: actor,
          reason: reason,
          data: snap
        });
      } catch(e) {}
    };

    // ---- RESTORE BACKUP ----
    window.restoreDungeonBackup = async function(backupId, backupDataStr) {
      if (!window.db) return;
      if (!confirm('คำเตือน! ยืนยันการกู้คืนข้อมูลทีมและคิวทั้งหมด? ข้อมูลปัจจุบันจะถูกแทนที่ด้วย Backup ชุดนี้')) return;
      try {
        const backupData = JSON.parse(decodeURIComponent(backupDataStr));
        const dungRef = doc(window.db, 'guild_system', 'dungeons');
        await setDoc(dungRef, backupData);
        await window.writeSystemLog('dungeon', 'RESTORE_BACKUP', '', '', 'กู้คืน Backup แบบเต็มรูปแบบ', null);
        window.showToast('กู้คืนข้อมูลสำเร็จ! ระบบจะโหลดข้อมูลใหม่', 'success');
      } catch(e) {
        window.showToast('กู้คืนล้มเหลว: ' + e.message, 'error');
      }
    };

    // ---- RENDER LOG PAGE ----
    window.renderLogPage = async function(tab = 'dungeon') {
      if (!window.isUserAdmin || !window.isUserAdmin()) return;
      window._currentLogTab = tab;

      const body = document.getElementById('logPageBody');
      if (!body) return;

      const searchInput = document.getElementById('logSearchInput');
      const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';

      // Set active tab styles
      const tabIds = ['logPageTabDungeon', 'logPageTabLeave', 'logPageTabBackups'];
      tabIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const isMatch = (id === 'logPageTabDungeon' && tab === 'dungeon') || 
                          (id === 'logPageTabLeave' && tab === 'leave') || 
                          (id === 'logPageTabBackups' && tab === 'backups');
          el.style.borderBottom = isMatch ? '3px solid var(--blue-500)' : '3px solid transparent';
          el.style.color = isMatch ? 'var(--blue-500)' : 'var(--text-lo)';
          el.style.fontWeight = isMatch ? '700' : '600';
        }
      });

      body.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-lo);">กำลังโหลดข้อมูล...</div>';

      if (tab === 'dungeon' || tab === 'leave') {
        try {
          // Fetch logs based on category
          const q = query(collection(window.db, 'guild_system_logs'), where('category', '==', tab), orderBy('timestamp', 'desc'), limit(300));
          const snap = await getDocs(q);
          
          let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

          // Apply Search Filter locally
          if (searchText) {
            docs = docs.filter(d => 
              (d.targetName && d.targetName.toLowerCase().includes(searchText)) ||
              (d.dungeonName && d.dungeonName.toLowerCase().includes(searchText)) ||
              (d.detailText && d.detailText.toLowerCase().includes(searchText)) ||
              (d.actor && d.actor.toLowerCase().includes(searchText))
            );
          }

          if (docs.length === 0) {
            body.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-lo);">ไม่พบข้อมูล</div>';
            return;
          }

          const actionLabel = {
            BOOK_QUEUE:     { label: 'จองคิวดันเจี้ยน', color: '#2563eb' },
            DELETE_QUEUE:   { label: 'ลบคิว', color: '#ef4444' },
            CREATE_TEAM:    { label: 'สร้างทีม', color: '#16a34a' },
            DELETE_TEAM:    { label: 'ลบทีม', color: '#ef4444' },
            DROP_TO_TEAM:   { label: 'เพิ่มสมาชิกเข้าทีม', color: '#7c3aed' },
            CLEAR_TEAM:     { label: 'ลงดันเจี้ยนสำเร็จ (เคลียร์ทีม)', color: '#16a34a' },
            CLEAR_SLOT:     { label: 'ถอดสมาชิกออกจากช่อง', color: '#ef4444' },
            SUBMIT_LEAVE:   { label: 'แจ้งลาวอ', color: '#2563eb' },
            DELETE_LEAVE:   { label: 'ลบใบลา', color: '#ef4444' },
            RESTORE_ITEM:   { label: 'กู้คืนข้อมูล', color: '#d97706' },
            RESTORE_BACKUP: { label: 'กู้คืน Backup', color: '#d97706' }
          };

          body.innerHTML = `
            <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <span style="font-size:13px;color:var(--text-lo);">แสดงผล ${docs.length} รายการ</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${docs.map(log => {
                const al = actionLabel[log.action] || { label: log.action, color: '#64748b' };
                const dt = new Date(log.timestamp).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                // Show Restore Button only for certain destructive actions
                let restoreBtn = '';
                if (log.rollbackData && (log.action === 'DELETE_QUEUE' || log.action === 'CLEAR_TEAM' || log.action === 'DELETE_LEAVE')) {
                  const safeLog = encodeURIComponent(JSON.stringify(log));
                  restoreBtn = \`<button onclick="window.restoreLogItem('\${log.id}', '\${safeLog}')" style="background:#fef3c7;color:#d97706;border:1px solid #fcd34d;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">กู้คืนข้อมูลนี้</button>\`;
                }

                return \`
                  <div style="background:var(--surface,#fff);border-radius:8px;padding:14px;border-left:4px solid \${al.color};display:flex;justify-content:space-between;align-items:flex-start;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                    <div style="flex:1;min-width:0;">
                      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:6px;">
                        <span style="background:\${al.color}22;color:\${al.color};font-size:12px;font-weight:700;padding:3px 10px;border-radius:12px;">\${al.label}</span>
                        <span style="font-size:12px;color:var(--text-hi);">ผู้บันทึก: <b>\${log.actor}</b></span>
                        <span style="font-size:12px;color:var(--text-lo);">\${dt}</span>
                      </div>
                      <div style="display:flex;flex-direction:column;gap:4px;">
                        \${log.dungeonName ? \`<div style="font-size:13px;color:var(--text-hi);"><b>ดันเจี้ยน:</b> \${log.dungeonName}</div>\` : ''}
                        \${log.targetName ? \`<div style="font-size:13px;color:var(--text-hi);"><b>เป้าหมาย:</b> \${log.targetName}</div>\` : ''}
                        <div style="font-size:13px;color:var(--text-hi);"><b>รายละเอียด:</b> \${log.detailText}</div>
                      </div>
                    </div>
                    \${restoreBtn ? \`<div>\${restoreBtn}</div>\` : ''}
                  </div>
                \`;
              }).join('')}
            </div>
          `;
        } catch(e) {
          body.innerHTML = `<div style="text-align:center;padding:60px;color:var(--danger);">โหลดล้มเหลว: ${e.message}</div>`;
        }
      } else if (tab === 'backups') {
        try {
          const q = query(collection(window.db, 'guild_dungeon_backups'), orderBy('timestamp', 'desc'), limit(50));
          const snap = await getDocs(q);
          if (snap.empty) { body.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-lo);">ยังไม่มี Backup ในระบบ</div>'; return; }

          body.innerHTML = `
            <div style="margin-bottom:12px;font-size:13px;color:var(--text-lo);">แสดง ${snap.size} Backup ล่าสุด (ใช้กู้คืนทั้งระบบดันเจี้ยน)</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${snap.docs.map(d => {
                const bk = d.data();
                const dt = new Date(bk.timestamp).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
                const qCount = (bk.data && bk.data.queues) ? bk.data.queues.length : 0;
                const tCount = (bk.data && bk.data.teams) ? bk.data.teams.length : 0;
                const totalMembers = (bk.data && bk.data.teams) ? bk.data.teams.reduce((sum, t) => sum + (t.members || []).filter(m => m && m.name).length, 0) : 0;
                const safeData = encodeURIComponent(JSON.stringify(bk.data));
                return \`
                  <div style="background:var(--surface,#fff);border-radius:8px;padding:16px;border:1px solid var(--line);box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
                      <div style="flex:1;min-width:0;">
                        <div style="font-size:14px;font-weight:700;color:var(--text-hi);">Backup เมื่อ \${dt}</div>
                        <div style="font-size:13px;color:var(--text-lo);margin-top:6px;">
                          ผู้บันทึก: <b style="color:var(--text-hi);">\${bk.actor || 'System'}</b>
                          &nbsp;|&nbsp; สาเหตุ: <b style="color:var(--text-hi);">\${bk.reason || '-'}</b>
                        </div>
                        <div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap;">
                          <span style="background:#eff6ff;color:#2563eb;font-size:12px;padding:4px 12px;border-radius:12px;font-weight:600;">คิว \${qCount} คน</span>
                          <span style="background:#f0fdf4;color:#16a34a;font-size:12px;padding:4px 12px;border-radius:12px;font-weight:600;">\${tCount} ทีม (\${totalMembers} คน)</span>
                        </div>
                      </div>
                      <button onclick="window.restoreDungeonBackup('\${d.id}', '\${safeData}')" style="background:#7c3aed;color:white;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;">กู้คืนทั้งระบบ</button>
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          `;
        } catch(e) {
          body.innerHTML = `<div style="text-align:center;padding:60px;color:var(--danger);">โหลด Backup ล้มเหลว: ${e.message}</div>`;
        }
      }
    };

    console.log('[Module Log] ระบบ Log และ Backup พร้อมใช้งาน (No Emoji Edition)');

  } catch(err) {
    console.error('[Module Log] ระบบ Log มีปัญหา:', err);
  }
})();
