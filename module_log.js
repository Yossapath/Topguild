import { doc, collection, addDoc, getDocs, query, orderBy, limit, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// MODULE: SYSTEM LOG + DUNGEON BACKUP
// Admin-only visibility
// ==========================================

(async function initLogModule() {
  try {

    // ---- WRITE LOG ----
    // Call this from any module to record an action
    window.writeSystemLog = async function(action, detail = {}) {
      if (!window.db) return;
      try {
        const actor = window.currentUser ? (window.currentUser.name || window.currentUser.username || 'unknown') : 'system';
        const logRef = collection(window.db, 'guild_system_logs');
        await addDoc(logRef, {
          timestamp: Date.now(),
          actor: actor,
          action: action,
          detail: detail
        });
      } catch(e) {
        console.warn('[Log] Failed to write log:', e);
      }
    };

    // ---- BACKUP DUNGEON DATA ----
    // Call this before any destructive operation to save a snapshot
    window.backupDungeonData = async function(reason = '') {
      if (!window.db || !window.dungeonData) return;
      try {
        const snap = JSON.parse(JSON.stringify(window.dungeonData)); // deep clone
        const backupRef = collection(window.db, 'guild_dungeon_backups');
        const actor = window.currentUser ? (window.currentUser.name || window.currentUser.username || 'unknown') : 'system';
        await addDoc(backupRef, {
          timestamp: Date.now(),
          actor: actor,
          reason: reason,
          data: snap
        });
      } catch(e) {
        console.warn('[Backup] Failed to backup:', e);
      }
    };

    // ---- RESTORE BACKUP ----
    window.restoreDungeonBackup = async function(backupId, backupData) {
      if (!window.db) return;
      if (!confirm('⚠️ ยืนยันการกู้คืนข้อมูล? ข้อมูลปัจจุบันจะถูกแทนที่ด้วย Backup ชุดนี้')) return;
      try {
        const dungRef = doc(window.db, 'guild_system', 'dungeons');
        await setDoc(dungRef, backupData);
        await window.writeSystemLog('RESTORE_BACKUP', { backupId: backupId });
        window.showToast('กู้คืนข้อมูลสำเร็จ! รีเฟรชหน้าจอเพื่อดูผล', 'success');
      } catch(e) {
        window.showToast('กู้คืนล้มเหลว: ' + e.message, 'error');
      }
    };

    // ---- OPEN ADMIN LOGS MODAL ----
    window.openAdminLogsModal = async function() {
      if (!window.isUserAdmin || !window.isUserAdmin()) {
        window.showToast('เฉพาะ Admin เท่านั้น', 'error');
        return;
      }
      // Build modal if not exists
      let modal = document.getElementById('adminLogsModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminLogsModal';
        modal.innerHTML = `
          <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;">
            <div style="background:var(--surface,#fff);border-radius:12px;width:100%;max-width:860px;box-shadow:0 20px 60px rgba(0,0,0,0.3);margin-top:20px;">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--line);background:#1e293b;border-radius:12px 12px 0 0;">
                <div>
                  <h2 style="margin:0;color:#f1f5f9;font-size:18px;">📋 ประวัติระบบ (System Log)</h2>
                  <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">เฉพาะ Admin เท่านั้น — ระบบบันทึกการกระทำทุกอย่างแบบ Real-time</p>
                </div>
                <button onclick="document.getElementById('adminLogsModal').remove()" style="background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;padding:4px;">✕</button>
              </div>
              <!-- Tabs -->
              <div style="display:flex;gap:0;border-bottom:1px solid var(--line);">
                <button onclick="window.switchLogTab('logs')" id="logTabLogs" style="flex:1;padding:12px;border:none;background:#f8fafc;font-weight:700;color:#2563eb;border-bottom:3px solid #2563eb;cursor:pointer;font-family:var(--font-display,'Prompt',sans-serif);font-size:13px;">📋 Log ทั้งหมด</button>
                <button onclick="window.switchLogTab('backups')" id="logTabBackups" style="flex:1;padding:12px;border:none;background:transparent;font-weight:600;color:var(--text-lo);cursor:pointer;font-family:var(--font-display,'Prompt',sans-serif);font-size:13px;">💾 Backup ข้อมูล</button>
              </div>
              <div id="adminLogsBody" style="padding:16px;min-height:300px;">
                <div style="text-align:center;padding:40px;color:var(--text-lo);">⏳ กำลังโหลด...</div>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
      window.switchLogTab('logs');
    };

    // ---- SWITCH TABS ----
    window.switchLogTab = async function(tab) {
      const logsBtn = document.getElementById('logTabLogs');
      const backupsBtn = document.getElementById('logTabBackups');
      const body = document.getElementById('adminLogsBody');
      if (!body) return;

      // Reset tab styles
      if (logsBtn) { logsBtn.style.background = tab === 'logs' ? '#f8fafc' : 'transparent'; logsBtn.style.color = tab === 'logs' ? '#2563eb' : 'var(--text-lo)'; logsBtn.style.borderBottom = tab === 'logs' ? '3px solid #2563eb' : '3px solid transparent'; }
      if (backupsBtn) { backupsBtn.style.background = tab === 'backups' ? '#f8fafc' : 'transparent'; backupsBtn.style.color = tab === 'backups' ? '#2563eb' : 'var(--text-lo)'; backupsBtn.style.borderBottom = tab === 'backups' ? '3px solid #2563eb' : '3px solid transparent'; }

      body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-lo);">⏳ กำลังโหลด...</div>';

      if (tab === 'logs') {
        try {
          const q = query(collection(window.db, 'guild_system_logs'), orderBy('timestamp', 'desc'), limit(100));
          const snap = await getDocs(q);
          if (snap.empty) { body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-lo);">ยังไม่มี Log ในระบบ</div>'; return; }

          const actionLabel = {
            BOOK_QUEUE: { icon: '📝', label: 'จองคิวดันเจี้ยน', color: '#2563eb' },
            DELETE_QUEUE: { icon: '🗑️', label: 'ลบคิว', color: '#ef4444' },
            CREATE_TEAM: { icon: '➕', label: 'สร้างทีม', color: '#16a34a' },
            DELETE_TEAM: { icon: '💥', label: 'ลบทีม', color: '#ef4444' },
            DROP_TO_TEAM: { icon: '🎯', label: 'ลากคนลงทีม', color: '#7c3aed' },
            UPDATE_MEMBER: { icon: '✏️', label: 'แก้ไขสมาชิกทีม', color: '#d97706' },
            CLEAR_TEAM: { icon: '✅', label: 'ลงดันเจี้ยนสำเร็จ (เคลียร์ทีม)', color: '#16a34a' },
            CLEAR_SLOT: { icon: '❌', label: 'ลบสมาชิกออกจากทีม', color: '#ef4444' },
            RESTORE_BACKUP: { icon: '🔄', label: 'กู้คืน Backup', color: '#7c3aed' },
            LOGIN: { icon: '🔐', label: 'เข้าสู่ระบบ', color: '#0891b2' },
            LOGOUT: { icon: '🚪', label: 'ออกจากระบบ', color: '#64748b' },
          };

          body.innerHTML = `
            <div style="margin-bottom:12px;font-size:12px;color:var(--text-lo);">แสดง ${snap.size} รายการล่าสุด (สูงสุด 100 รายการ)</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${snap.docs.map(d => {
                const log = d.data();
                const al = actionLabel[log.action] || { icon: '🔔', label: log.action, color: '#64748b' };
                const dt = new Date(log.timestamp).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const detail = log.detail ? Object.entries(log.detail).map(([k, v]) => `<span style="color:var(--text-lo);font-size:11px;">${k}: <b style="color:var(--text-hi);">${typeof v === 'object' ? JSON.stringify(v) : v}</b></span>`).join(' &nbsp;|&nbsp; ') : '';
                return `
                  <div style="background:var(--bg-soft,#f8fafc);border-radius:8px;padding:10px 14px;border-left:3px solid ${al.color};display:flex;align-items:flex-start;gap:10px;">
                    <span style="font-size:16px;flex-shrink:0;margin-top:1px;">${al.icon}</span>
                    <div style="flex:1;min-width:0;">
                      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                        <span style="background:${al.color}22;color:${al.color};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;">${al.label}</span>
                        <span style="font-size:12px;font-weight:700;color:var(--text-hi);">${log.actor || 'system'}</span>
                        <span style="font-size:11px;color:var(--text-lo);">${dt}</span>
                      </div>
                      ${detail ? `<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:8px;">${detail}</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } catch(e) {
          body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger);">โหลด Log ล้มเหลว: ${e.message}</div>`;
        }
      } else {
        // Backups tab
        try {
          const q = query(collection(window.db, 'guild_dungeon_backups'), orderBy('timestamp', 'desc'), limit(30));
          const snap = await getDocs(q);
          if (snap.empty) { body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-lo);">ยังไม่มี Backup ในระบบ</div>'; return; }

          body.innerHTML = `
            <div style="margin-bottom:12px;font-size:12px;color:var(--text-lo);">แสดง ${snap.size} Backup ล่าสุด (สูงสุด 30 รายการ)</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${snap.docs.map(d => {
                const bk = d.data();
                const dt = new Date(bk.timestamp).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
                const qCount = (bk.data && bk.data.queues) ? bk.data.queues.length : 0;
                const tCount = (bk.data && bk.data.teams) ? bk.data.teams.length : 0;
                const totalMembers = (bk.data && bk.data.teams) ? bk.data.teams.reduce((sum, t) => sum + (t.members || []).filter(m => m && m.name).length, 0) : 0;
                return `
                  <div style="background:var(--bg-soft,#f8fafc);border-radius:8px;padding:12px 16px;border:1px solid var(--line);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                      <div>
                        <div style="font-size:13px;font-weight:700;color:var(--text-hi);">💾 Backup เมื่อ ${dt}</div>
                        <div style="font-size:12px;color:var(--text-lo);margin-top:4px;">
                          โดย: <b style="color:var(--text-hi);">${bk.actor || 'system'}</b>
                          &nbsp;|&nbsp; สาเหตุ: <b style="color:var(--text-hi);">${bk.reason || '-'}</b>
                        </div>
                        <div style="margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;">
                          <span style="background:#eff6ff;color:#2563eb;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;">คิว ${qCount} คน</span>
                          <span style="background:#f0fdf4;color:#16a34a;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;">${tCount} ทีม (${totalMembers} คนในทีม)</span>
                        </div>
                      </div>
                      <button onclick="window.restoreDungeonBackup('${d.id}', ${JSON.stringify(bk.data).replace(/'/g, "\\'")})" style="background:#7c3aed;color:white;border:none;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;">🔄 กู้คืน Backup นี้</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } catch(e) {
          body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger);">โหลด Backup ล้มเหลว: ${e.message}</div>`;
        }
      }
    };


    // ---- RENDER LOG PAGE (Dedicated Full Page) ----
    // This renders into the page-logs section (not a modal)
    window.renderLogPage = async function(tab = 'logs') {
      if (!window.isUserAdmin || !window.isUserAdmin()) return;
      window._currentLogTab = tab;

      const body = document.getElementById('logPageBody');
      if (!body) return;

      // Update tab button styles
      const logsBtn = document.getElementById('logPageTabLogs');
      const backupsBtn = document.getElementById('logPageTabBackups');
      if (logsBtn) { logsBtn.style.borderBottom = tab === 'logs' ? '3px solid var(--blue-500)' : '3px solid transparent'; logsBtn.style.color = tab === 'logs' ? 'var(--blue-500)' : 'var(--text-lo)'; logsBtn.style.fontWeight = tab === 'logs' ? '700' : '600'; }
      if (backupsBtn) { backupsBtn.style.borderBottom = tab === 'backups' ? '3px solid var(--blue-500)' : '3px solid transparent'; backupsBtn.style.color = tab === 'backups' ? 'var(--blue-500)' : 'var(--text-lo)'; backupsBtn.style.fontWeight = tab === 'backups' ? '700' : '600'; }

      body.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-lo);">⏳ กำลังโหลดข้อมูล...</div>';

      const actionLabel = {
        BOOK_QUEUE:     { icon: '📝', label: 'จองคิวดันเจี้ยน',           color: '#2563eb' },
        DELETE_QUEUE:   { icon: '🗑️', label: 'ลบคิว',                       color: '#ef4444' },
        CREATE_TEAM:    { icon: '➕', label: 'สร้างทีม',                     color: '#16a34a' },
        DELETE_TEAM:    { icon: '💥', label: 'ลบทีม',                        color: '#ef4444' },
        DROP_TO_TEAM:   { icon: '🎯', label: 'ลากคนลงทีม (Drag & Drop)',    color: '#7c3aed' },
        UPDATE_MEMBER:  { icon: '✏️', label: 'แก้ไขสมาชิกทีม',              color: '#d97706' },
        CLEAR_TEAM:     { icon: '✅', label: 'ลงดันเจี้ยนสำเร็จ (เคลียร์ทีม)', color: '#16a34a' },
        CLEAR_SLOT:     { icon: '❌', label: 'ถอดสมาชิกออกจากช่อง',          color: '#ef4444' },
        RESTORE_BACKUP: { icon: '🔄', label: 'กู้คืน Backup',                color: '#7c3aed' },
        LOGIN:          { icon: '🔐', label: 'เข้าสู่ระบบ',                   color: '#0891b2' },
        LOGOUT:         { icon: '🚪', label: 'ออกจากระบบ',                    color: '#64748b' },
      };

      if (tab === 'logs') {
        try {
          const q = query(collection(window.db, 'guild_system_logs'), orderBy('timestamp', 'desc'), limit(200));
          const snap = await getDocs(q);
          if (snap.empty) { body.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-lo);">ยังไม่มี Log ในระบบ</div>'; return; }

          body.innerHTML = `
            <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <span style="font-size:12px;color:var(--text-lo);">แสดง ${snap.size} รายการล่าสุด (สูงสุด 200 รายการ)</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${snap.docs.map(d => {
                const log = d.data();
                const al = actionLabel[log.action] || { icon: '🔔', label: log.action, color: '#64748b' };
                const dt = new Date(log.timestamp).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const detail = log.detail ? Object.entries(log.detail).map(([k, v]) => `<span style="color:var(--text-lo);font-size:11px;">${k}: <b style="color:var(--text-hi);">${typeof v === 'object' ? JSON.stringify(v) : v}</b></span>`).join(' &nbsp;|&nbsp; ') : '';
                return `
                  <div style="background:var(--surface,#fff);border-radius:8px;padding:12px 16px;border-left:4px solid ${al.color};display:flex;align-items:flex-start;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                    <span style="font-size:18px;flex-shrink:0;margin-top:1px;">${al.icon}</span>
                    <div style="flex:1;min-width:0;">
                      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                        <span style="background:${al.color}22;color:${al.color};font-size:12px;font-weight:700;padding:3px 10px;border-radius:10px;">${al.label}</span>
                        <span style="font-size:13px;font-weight:700;color:var(--text-hi);">👤 ${log.actor || 'system'}</span>
                        <span style="font-size:12px;color:var(--text-lo);">🕒 ${dt}</span>
                      </div>
                      ${detail ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:8px;">${detail}</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } catch(e) {
          body.innerHTML = `<div style="text-align:center;padding:60px;color:var(--danger);">โหลด Log ล้มเหลว: ${e.message}</div>`;
        }
      } else {
        try {
          const q = query(collection(window.db, 'guild_dungeon_backups'), orderBy('timestamp', 'desc'), limit(50));
          const snap = await getDocs(q);
          if (snap.empty) { body.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-lo);">ยังไม่มี Backup ในระบบ</div>'; return; }

          body.innerHTML = `
            <div style="margin-bottom:12px;font-size:12px;color:var(--text-lo);">แสดง ${snap.size} Backup ล่าสุด (สูงสุด 50 รายการ)</div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${snap.docs.map(d => {
                const bk = d.data();
                const dt = new Date(bk.timestamp).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
                const qCount = (bk.data && bk.data.queues) ? bk.data.queues.length : 0;
                const tCount = (bk.data && bk.data.teams) ? bk.data.teams.length : 0;
                const totalMembers = (bk.data && bk.data.teams) ? bk.data.teams.reduce((sum, t) => sum + (t.members || []).filter(m => m && m.name).length, 0) : 0;
                const teamDetail = (bk.data && bk.data.teams) ? bk.data.teams.map(t => {
                  const filled = (t.members || []).filter(m => m && m.name);
                  return filled.length > 0 ? `<div style="font-size:11px;color:var(--text-lo);margin-top:4px;"><b style="color:var(--text-hi);">${t.dungeonName || t.type}</b>: ${filled.map(m => m.name).join(', ')}</div>` : '';
                }).join('') : '';
                const safeData = JSON.stringify(bk.data).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                return `
                  <div style="background:var(--surface,#fff);border-radius:10px;padding:16px;border:1px solid var(--line);box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
                      <div style="flex:1;min-width:0;">
                        <div style="font-size:14px;font-weight:700;color:var(--text-hi);">💾 Backup เมื่อ ${dt}</div>
                        <div style="font-size:12px;color:var(--text-lo);margin-top:4px;">
                          โดย: <b style="color:var(--text-hi);">${bk.actor || 'system'}</b>
                          &nbsp;|&nbsp; สาเหตุ: <b style="color:var(--text-hi);">${bk.reason || '-'}</b>
                        </div>
                        <div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap;">
                          <span style="background:#eff6ff;color:#2563eb;font-size:11px;padding:3px 10px;border-radius:10px;font-weight:600;">📋 คิว ${qCount} คน</span>
                          <span style="background:#f0fdf4;color:#16a34a;font-size:11px;padding:3px 10px;border-radius:10px;font-weight:600;">👥 ${tCount} ทีม (${totalMembers} คนในทีม)</span>
                        </div>
                        ${teamDetail ? `<div style="margin-top:8px;background:var(--bg-soft);border-radius:6px;padding:8px 10px;">${teamDetail}</div>` : ''}
                      </div>
                      <button onclick="window.restoreDungeonBackup('${d.id}', '${safeData}')" style="background:#7c3aed;color:white;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;flex-shrink:0;font-family:var(--font-display,'Prompt',sans-serif);">🔄 กู้คืน</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } catch(e) {
          body.innerHTML = `<div style="text-align:center;padding:60px;color:var(--danger);">โหลด Backup ล้มเหลว: ${e.message}</div>`;
        }
      }
    };

    console.log('[Module Log] ระบบ Log และ Backup พร้อมใช้งาน');


  } catch(err) {
    console.error('[Module Log] ระบบ Log มีปัญหา:', err);
  }
})();
