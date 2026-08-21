import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

window.isUserAdmin = function() {
  const r = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : '';
  return r === 'admin' || r === 'owner' || r === 'หัวหน้ากิลด์';
};

// ==========================================
// ====== AUTHENTICATION & ROLE SYSTEM ======
// ==========================================



async function ensureDefaultAdmin() {
  if (!window.db) return;
  try {
    const adminRef = doc(window.db, 'users', 'iwannatell');
    const snap = await getDoc(adminRef);
    if (!snap.exists()) {
      await setDoc(adminRef, {
        username: 'iwannatell',
        class: 'Druid',
        password: 'maxtiw30',
        role: 'admin'
      });
      console.log("Default admin iwannatell created.");
    }
  } catch (err) {
    console.error("Failed to ensure admin:", err);
  }
}

async function checkAuth() {
  const saved = localStorage.getItem('guild_current_user');
  if (saved) {
    window.currentUser = JSON.parse(saved);
    
    // Refresh user role from DB to be safe
    if (window.db) {
      try {
        const snap = await getDoc(doc(window.db, 'users', window.currentUser.username.toLowerCase()));
        if (snap.exists()) {
          window.currentUser.role = snap.data().role || \'member\';
          delete window.currentUser.password;
          localStorage.setItem(\'guild_current_user\', JSON.stringify(window.currentUser));
        }
      } catch (e) {}
    }
    
    showMainApp();
    applyRolePermissions();
  } else {
    showAuthUI();
  }
}

function showAuthUI() {
  const authW = document.getElementById('authWrap');
  const appW = document.getElementById('appWrap');
  if (authW) authW.style.display = 'block';
  if (appW) appW.style.display = 'none';
}

function showMainApp() {
  const authW = document.getElementById('authWrap');
  const appW = document.getElementById('appWrap');
  if (authW) authW.style.display = 'none';
  if (appW) appW.style.display = 'block';
  
  if (window.currentUser) {
    const uiInfo = document.getElementById('userInfoDisplay');
    if (uiInfo) {
      uiInfo.innerHTML = `👤 ${window.escapeHtml ? window.escapeHtml(window.currentUser.username) : window.currentUser.username} <span style="opacity:0.7; margin:0 6px;">|</span> Role: ${window.isUserAdmin() ? '<span style="color: #f59e0b; font-weight: 700;">👑 Admin</span>' : '🛡️ Member'}`;
    }
  }
}

window.handleLogin = async function() {
  const u = document.getElementById('loginUsername').value.trim().toLowerCase();
  const p = document.getElementById('loginPassword').value;
  
  const loginBtn = document.querySelector('#loginForm button[type="submit"]');
  const setBtnState = (isLoading) => {
    if (loginBtn) {
      loginBtn.disabled = isLoading;
      loginBtn.innerText = isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ';
      loginBtn.style.opacity = isLoading ? '0.7' : '1';
    }
  };

  if (!u || !p) return window.showToast("กรุณากรอก Username และ Password", "warning");

  if (!window.db) {
    window.showToast("ระบบกำลังเชื่อมต่อฐานข้อมูล กรุณารอสักครู่...", "warning");
    return;
  }

  setBtnState(true);

  try {
    const userRef = doc(window.db, 'users', u);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      window.showToast("ไม่พบผู้ใช้งานนี้ในระบบ", "error");
      setBtnState(false);
      return;
    }
    const data = snap.data();
    if (data.password !== p) {
      window.showToast("รหัสผ่านไม่ถูกต้อง", "error");
      setBtnState(false);
      return;
    }

    window.currentUser = { username: data.username, role: data.role || 'member', class: data.class };
    localStorage.setItem('guild_current_user', JSON.stringify(window.currentUser));
    window.showToast(`ยินดีต้อนรับ ${window.currentUser.username}`, "success");
    showMainApp();
    applyRolePermissions();
    if (typeof window.renderAll === 'function') window.renderAll();
    setBtnState(false);
  } catch (err) {
    window.showToast("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", "error");
    console.error(err);
    setBtnState(false);
  }
};

window.handleRegister = async function() {
  const u = document.getElementById('regUsername').value.trim();
  const j = document.getElementById('regJob').value;
  const p = document.getElementById('regPassword').value;
  
  if (!u || !j || !p) return window.showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
  if (!window.db) return window.showToast("ยังไม่ได้เชื่อมต่อฐานข้อมูล", "warning");

  const uLower = u.toLowerCase();
  try {
    const userRef = doc(window.db, 'users', uLower);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      window.showToast("Username นี้ถูกใช้งานแล้ว", "error");
      return;
    }
    
    await setDoc(userRef, {
      username: u,
      class: j,
      password: p,
      role: 'member'
    });
    
    // ระบบจะไม่ทำการ Auto-add ผู้ใช้เข้า Roster อีกต่อไป 
    // ต้องให้แอดมินหรือผู้มีสิทธิ์ไปกดเพิ่มชื่อในแท็บ "รายชื่อสมาชิก" ด้วยตัวเองเท่านั้น
    // เพื่อป้องกันการมีชื่อขยะโผล่ไปล่างสุดของหน้าเช็คชื่อวอ
    
    window.showToast("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ", "success");
    document.getElementById('regUsername').value = '';
    document.getElementById('regJob').value = '';
    document.getElementById('regPassword').value = '';
    if (typeof window.toggleAuthMode === 'function') {
      window.toggleAuthMode('login');
    }
  } catch (err) {
    window.showToast("เกิดข้อผิดพลาดในการสมัครสมาชิก", "error");
    console.error(err);
  }
};

window.handleLogout = function() {
  const btn = document.getElementById('btnLogout');
  if (btn) {
    btn.innerHTML = 'กำลังออกจากระบบ...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }
  setTimeout(() => {
    window.currentUser = null;
    localStorage.removeItem('guild_current_user');
    window.location.reload();
  }, 600);
};

function applyRolePermissions() {
  const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : ''; const isAdmin = window.isUserAdmin();
  
  const btnAdminUsers = document.getElementById('btnAdminUsers');
  if (btnAdminUsers) btnAdminUsers.style.display = isAdmin ? 'block' : 'none';
  
  const btnAdminCreateAtt = document.getElementById('btnAdminCreateAttendance');
  if (btnAdminCreateAtt) btnAdminCreateAtt.style.display = isAdmin ? 'block' : 'none';
  const btnAdminAutoAtt = document.getElementById('btnAdminAutoAttendance');
  if (btnAdminAutoAtt) btnAdminAutoAtt.style.display = isAdmin ? 'block' : 'none';

  const tabSettings = document.getElementById('tabSettings');
  if (tabSettings) tabSettings.style.display = isAdmin ? 'block' : 'none';

  const clearBtn = document.getElementById('btnClearCurrentFieldTeamsBtn');
  if (clearBtn) clearBtn.style.display = isAdmin ? 'block' : 'none';
  const addTeamBtn = document.getElementById('btnAddTeamBtn');
  if (addTeamBtn) addTeamBtn.style.display = isAdmin ? 'block' : 'none';
  const rmTeamBtn = document.getElementById('btnRemoveTeamBtn');
  if (rmTeamBtn) rmTeamBtn.style.display = isAdmin ? 'block' : 'none';
}

window.openAdminUsersSidebar = async function() {
  document.getElementById('adminUsersSidebar').style.left = '0';
  document.getElementById('adminUsersOverlay').style.display = 'block';
  setTimeout(() => document.getElementById('adminUsersOverlay').style.opacity = '1', 10);
  await fetchAndRenderUsers();
};

window.closeAdminUsersSidebar = function() {
  document.getElementById('adminUsersSidebar').style.left = '-320px';
  document.getElementById('adminUsersOverlay').style.opacity = '0';
  setTimeout(() => document.getElementById('adminUsersOverlay').style.display = 'none', 300);
};

let cachedAdminUsers = [];
  
  window.renderAdminUsers = function() {
    const listEl = document.getElementById('adminUsersList');
    if (!listEl) return;
    
    const searchInput = document.getElementById('adminUsersSearch');
    const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    let filtered = cachedAdminUsers;
    if (term) {
      filtered = filtered.filter(d => d.username.toLowerCase().includes(term));
    }
    
    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">ไม่พบผู้ใช้ที่ค้นหา</div>';
      return;
    }
    
    let html = '';
    let lastRole = null;

    filtered.forEach((d, index) => {
      const isMe = d.username.toLowerCase() === window.currentUser.username.toLowerCase();
      const role = (d.role || 'member').toLowerCase();
      const roleColor = role === 'admin' ? '#eab308' : 'var(--blue-500)';
      
      // Add divider if transitioning from admin to member
      if (lastRole === 'admin' && role !== 'admin') {
        html += `<div style="display:flex; align-items:center; margin: 16px 0; opacity: 0.5;">
          <div style="flex:1; height:1px; background:var(--line);"></div>
          <div style="padding: 0 10px; font-size: 11px; font-weight:600; color:var(--text-lo); text-transform:uppercase;">Member</div>
          <div style="flex:1; height:1px; background:var(--line);"></div>
        </div>`;
      }
      // Add Admin title for the first admin
      if (index === 0 && role === 'admin') {
        html += `<div style="display:flex; align-items:center; margin: 0 0 12px 0; opacity: 0.8;">
          <div style="flex:1; height:1px; background:var(--line);"></div>
          <div style="padding: 0 10px; font-size: 11px; font-weight:700; color:#eab308; text-transform:uppercase;">Admin</div>
          <div style="flex:1; height:1px; background:var(--line);"></div>
        </div>`;
      }
      
      lastRole = role;

      html += `<div style="padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--text-hi); font-size: 14px;">${window.escapeHtml ? window.escapeHtml(d.username) : d.username}</div>
          <div style="font-size: 12px; color: var(--text-lo); margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
            <div>อาชีพ: <span style="font-weight: 500; color: ${window.JOB_COLORS && window.JOB_COLORS[d.class] ? window.JOB_COLORS[d.class] : 'var(--text-hi)'}">${d.class || '-'}</span></div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>Role:</span>
              ${!isMe ? 
                `<select onchange="updateAccountRole('${d.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: ${role==='admin' ? '#eab308' : 'var(--blue-500)'}; font-weight: 600; cursor: pointer; width: auto; min-width: 70px;">
                  <option value="admin" ${role === 'admin' ? 'selected' : ''} style="color:#eab308">Admin</option>
                  <option value="member" ${role === 'member' ? 'selected' : ''} style="color:var(--blue-500)">Member</option>
                </select>` 
                : `<span style="color: ${roleColor}; font-weight: 600;">${role === 'admin' ? 'Admin' : 'Member'}</span>`
              }
            </div>
          </div>
        </div>
        ${!isMe ? 
          `<button onclick="deleteAccount('${d.id}')" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">ลบ</button>` 
          : '<span style="font-size:12px; color:var(--text-lo); margin-top:4px;">คุณ</span>'
        }
      </div>`;
    });
    listEl.innerHTML = html;
  };

  
async function fetchAndRenderUsers() {
    if (!window.db || !window.currentUser || !window.isUserAdmin()) return;
    const listEl = document.getElementById('adminUsersList');
    listEl.innerHTML = '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">กำลังโหลด...</div>';
    
    try {
      const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const snap = await getDocs(collection(window.db, 'users'));
      cachedAdminUsers = [];
      snap.forEach(doc => {
        let d = doc.data();
        d.id = doc.id;
        cachedAdminUsers.push(d);
      });
      cachedAdminUsers.sort((a, b) => {
        const rA = (a.role || 'member').toLowerCase(); const rB = (b.role || 'member').toLowerCase(); if (rA === 'admin' && rB !== 'admin') return -1;
        if (rA !== 'admin' && rB === 'admin') return 1;
        return (a.username || '').localeCompare(b.username || '');
      });
      if (typeof window.renderAdminUsers === 'function') {
        window.renderAdminUsers();
      }
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<div style="text-align: center; color: var(--danger); margin-top: 20px;">เกิดข้อผิดพลาด</div>';
    }
}

window.deleteAccount = async function(docId) {
  if (!confirm('ยืนยันการลบบัญชีผู้ใช้นี้? จะไม่สามารถกู้คืนได้')) return;
  if (!window.db) return;
  try {
    const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    await deleteDoc(doc(window.db, 'users', docId));
    window.showToast("ลบบัญชีสำเร็จ", "success");
    fetchAndRenderUsers();
  } catch (err) {
    console.error(err);
    window.showToast("เกิดข้อผิดพลาดในการลบ", "error");
  }
};


// ==========================================


// ==========================================
// SHARED: Global Autocomplete Dropdown
// ==========================================
window.activeAutocompleteInput = null;

window.onDungeonQueueDragStart = function(event) {
  const el = event.currentTarget;
  const data = {
    name: el.dataset.queueName || '',
    job: el.dataset.queueJob || '',
    power: el.dataset.queuePower || ''
  };
  event.dataTransfer.setData('text/plain', JSON.stringify(data));
};

window.onDungeonSlotDrop = function(event, teamId, slotIdx) {
  event.preventDefault();
  try {
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    if (!data.name) return;
    const t = dungeonData.teams.find(x => x.id === teamId);
    if (t) {
      t.members[slotIdx] = { name: data.name, job: data.job, power: data.power ? Number(data.power) : null };
      saveDungeonState();
    }
  } catch(e) { console.error(e); }
};

// Global Exports
window.ensureDefaultAdmin = ensureDefaultAdmin;
window.checkAuth = checkAuth;
window.setupDungeonFirebase = setupDungeonFirebase;
window.renderDungeonPage = renderDungeonPage;
// ==========================================
// ====== ATTENDANCE SYSTEM ======
// ==========================================

let attendanceData = { dates: {} };
let unsubAttendanceListener = null;

async function setupAttendanceFirebase() {
  // STEP 1: Render from localStorage instantly (avoids blank screen on refresh)
  try {
    const localAtt = localStorage.getItem('guild_attendance_data');
    if (localAtt) {
      const parsed = JSON.parse(localAtt);
      if (parsed && parsed.dates && Object.keys(parsed.dates).length > 0) {
        attendanceData = parsed;
        setTimeout(renderAttendanceOptions, 50);
      }
    }
  } catch(e) {}

  // STEP 2: Firebase real-time listener (authoritative source)
  if (!window.db) return;
  try {
    const attRef = doc(window.db, 'guild_system', 'attendance');
    const snap = await getDoc(attRef);
    if (!snap.exists()) {
      await setDoc(attRef, { dates: {} });
    }
    unsubAttendanceListener = onSnapshot(attRef, (snapshot) => {
      if (snapshot.exists()) {
        attendanceData = snapshot.data();
        if (!attendanceData.dates) attendanceData.dates = {};
        // Keep localStorage in sync
        try { localStorage.setItem('guild_attendance_data', JSON.stringify(attendanceData)); } catch(e2) {}
        renderAttendanceOptions();
      }
    });
  } catch(e) {
    console.error('setupAttendanceFirebase error:', e);
  }
}
// CRITICAL: Export so app.js can call window.setupAttendanceFirebase()
window.setupAttendanceFirebase = setupAttendanceFirebase;

async function saveAttendanceState() {
  localStorage.setItem('guild_attendance_data', JSON.stringify(attendanceData));
  if (!window.db) return;
  try {
    const attRef = doc(window.db, 'guild_system', 'attendance');
    await setDoc(attRef, attendanceData, { merge: true });
    console.log('Saved attendance data to Firebase successfully');
  } catch(err) {
    console.error('Failed to save attendance data:', err);
    window.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล (เช็คสิทธิ์ Database)', 'error');
  }
}


window.autoGenerateAttendance = function() {
  if (!window.currentUser || !window.isUserAdmin()) return;
  if (!confirm('ต้องการสร้างตารางเช็คชื่อสำหรับ อังคาร พฤหัส อาทิตย์ ของสัปดาห์นี้อัตโนมัติหรือไม่?')) return;
  
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  
  // Calculate Monday of this week
  const monday = new Date(today);
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  monday.setDate(today.getDate() + diffToMonday);
  
  const getFmtDate = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const datesToCreate = [];

  // Tuesday
  const tuesday = new Date(monday);
  tuesday.setDate(monday.getDate() + 1);
  datesToCreate.push(getFmtDate(tuesday) + " (อังคาร รอบ 1)");
  datesToCreate.push(getFmtDate(tuesday) + " (อังคาร รอบ 2)");

  // Thursday
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  datesToCreate.push(getFmtDate(thursday) + " (พฤหัสบดี)");

  // Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  datesToCreate.push(getFmtDate(sunday) + " (อาทิตย์)");

  let createdCount = 0;
  datesToCreate.forEach(d => {
    if (!attendanceData.dates[d]) {
      attendanceData.dates[d] = {};
      createdCount++;
    }
  });

  if (createdCount > 0) {
    saveAttendanceState();
    window.showToast('สร้างตารางอัตโนมัติสำเร็จ!', 'success');
    setTimeout(renderAttendanceOptions, 500);
  } else {
    window.showToast('ตารางสัปดาห์นี้ถูกสร้างไว้แล้ว', 'warning');
  }
};

window.createAttendanceDate = function() {
  if (!window.currentUser || !window.isUserAdmin()) return;
  const today = new Date().toISOString().split('T')[0];
  const dateStr = prompt("ระบุวันที่สำหรับการเช็คชื่อ (YYYY-MM-DD):", today);
  if (!dateStr) return;
  
  if (!attendanceData.dates[dateStr]) {
    attendanceData.dates[dateStr] = {};
    saveAttendanceState();
    window.showToast(`สร้างวันที่ ${dateStr} เรียบร้อยแล้ว`, "success");
    
    setTimeout(() => {
      const select = document.getElementById('attendanceDateSelect');
      if (select) {
        select.value = dateStr;
        window.renderAttendanceTable();
      }
    }, 500);
  } else {
    window.showToast("วันที่นี้ถูกสร้างไว้แล้ว", "warning");
  }
};

function renderAttendanceOptions() {
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  
  const currentVal = select.value;
  const dates = Object.keys(attendanceData.dates).sort((a, b) => b.localeCompare(a));
  
  if (dates.length === 0) {
    select.innerHTML = '<option value="">-- ไม่มีข้อมูล --</option>';
  } else {
    select.innerHTML = '<option value="">-- กรุณาเลือกวันที่ --</option>' + dates.map(d => `<option value="${d}">${d}</option>`).join('');
    
    const lastSelected = localStorage.getItem('guild_attendance_last_date');
    
    if (dates.includes(currentVal) && currentVal !== '') {
      select.value = currentVal;
    } else if (lastSelected && dates.includes(lastSelected)) {
      select.value = lastSelected;
    } else {
      select.value = dates[0];
    }
  }
  
  // Attach onchange to save to localStorage
  select.onchange = function() {
    localStorage.setItem('guild_attendance_last_date', this.value);
    window.renderAttendanceTable();
  };
  
  window.renderAttendanceTable();
}


window.switchAttTab = function(tab) {
  const dailyBtn = document.getElementById('btnAttTabDaily');
  const statsBtn = document.getElementById('btnAttTabStats');
  const dailyView = document.getElementById('attDailyView');
  const statsView = document.getElementById('attStatsView');
  
  if (tab === 'daily') {
    if (dailyBtn) dailyBtn.classList.add('active');
    if (statsBtn) statsBtn.classList.remove('active');
    if (dailyView) dailyView.style.display = 'block';
    if (statsView) statsView.style.display = 'none';
    window.renderAttendanceTable();
  } else {
    if (dailyBtn) dailyBtn.classList.remove('active');
    if (statsBtn) statsBtn.classList.add('active');
    if (dailyView) dailyView.style.display = 'none';
    if (statsView) statsView.style.display = 'block';
    window.renderAttendanceStats();
  }
};

window.deleteAttendanceDate = function() {
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  const dateStr = select.value;
  if (!dateStr) return;
  
  if (confirm('คุณต้องการลบข้อมูลเช็คชื่อของวันที่ ' + dateStr + ' ใช่หรือไม่?')) {
    delete attendanceData.dates[dateStr];
    saveAttendanceState();
    select.value = '';
    renderAttendanceOptions();
  }
};


window.renderAttendanceTable = function() {
  const tbody = document.getElementById('attendanceTbody');
  if (!tbody) return;
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  const selectedDate = select.value;
  
  if (!selectedDate) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกวันที่เพื่อดูข้อมูล</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
  if (summaryDiv) {
    summaryDiv.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; text-align:center; margin-bottom: 10px; background:var(--bg-soft); padding: 12px; border-radius: 8px; border: 1px solid var(--line); font-size: 15px; font-weight: 600;">
        <span style="color:var(--text-hi);">ทั้งหมด : ${totalCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--ok);">มา : ${joinedCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--warn);">ลา : ${leaveCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--danger);">ขาด : ${absentCount} คน</span>
      </div>
    `;
  }
};

window.updateAttendanceStatus = function(dateStr, name, status) {
  if (!window.currentUser || !window.isUserAdmin()) return;
  if (!attendanceData.dates[dateStr]) attendanceData.dates[dateStr] = {};
  attendanceData.dates[dateStr][name] = status;
  saveAttendanceState();
};

window.renderAttendanceStats = function() {
  const tbody = document.getElementById('attStatsTbody');
  if (!tbody) return;
  
  const searchInput = document.getElementById('attStatsSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  // Aggregate stats
  const statsMap = {}; // { name: { joined:0, leave:0, absent:0 } }
  const dates = Object.keys(attendanceData.dates);
  
  dates.forEach(d => {
    const dayData = attendanceData.dates[d];
    Object.keys(dayData).forEach(name => {
      const status = dayData[name];
      if (!statsMap[name]) statsMap[name] = { joined: 0, leave: 0, absent: 0 };
      if (status === 'attended') statsMap[name].joined++;
      if (status === 'leave') statsMap[name].leave++;
      if (status === 'absent') statsMap[name].absent++;
    });
  });
  
  // Build stats table from guildRoster
  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(function(job) {
      window.guildRoster[job].forEach(function(m) {
        allMembers.push({ name: m.name, job: job, power: m.power || 0 });
      });
    });
  }

  allMembers.sort(function(a,b) { return b.power - a.power; });
  if (query) allMembers = allMembers.filter(function(m) { return m.name.toLowerCase().includes(query); });

  let html = '';
  allMembers.forEach(function(m, i) {
    const s = statsMap[m.name] || { joined: 0, leave: 0, absent: 0 };
    const total = dates.length;
    const pct = total > 0 ? Math.round((s.joined / total) * 100) : 0;
    const eName = window.escapeHtml ? window.escapeHtml(m.name) : m.name;
    html += '<tr>' +
      '<td class="cell-rank">' + (i+1) + '</td>' +
      '<td>' + eName + '</td>' +
      '<td style="text-align:center; font-weight: 600; color:' + (window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : 'var(--text-hi)') + ';">' + m.job + '</td>' +
      '<td style="text-align:center; color:var(--ok)">' + s.joined + '</td>' +
      '<td style="text-align:center; color:var(--warn)">' + s.leave + '</td>' +
      '<td style="text-align:center; color:var(--danger)">' + s.absent + '</td>' +
      '<td style="text-align:center;">' + pct + '%</td>' +
      '</tr>';
  });
  tbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-lo);">ไม่มีข้อมูลสถิติ</td></tr>';
};


document.addEventListener('input', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusin', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusout', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    setTimeout(() => {
      const dropdown = document.getElementById('globalMemberDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }, 150);
  }
});

// Update window scroll to hide dropdown
window.addEventListener('scroll', (e) => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown && dropdown.style.display === 'block') {
    if (!dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  }
}, true);


window.activeAutocompleteInput = null;



document.addEventListener('input', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    if (typeof showGlobalDropdown === 'function') showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusin', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    if (typeof showGlobalDropdown === 'function') showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusout', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    setTimeout(() => {
      const dropdown = document.getElementById('globalMemberDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }, 150);
  }
});

window.addEventListener('scroll', (e) => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown && dropdown.style.display === 'block') {
    if (!dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  }
}, true);

// ====== SHARED: Global Autocomplete Dropdown ======
window.activeAutocompleteInput = null;
window.showGlobalDropdown = function(inputEl, filterText = '') {
  try {
    if (!window.guildRoster) return;
    const dropdown = document.getElementById('globalMemberDropdown');
    if (!dropdown) return;
    
    let allMembers = [];
    Object.keys(window.guildRoster).forEach(job => {
      window.guildRoster[job].forEach(m => {
        allMembers.push({ name: m.name, job: job, power: m.power || 0 });
      });
    });
    
    const action = inputEl.getAttribute('data-action');
    
    // Apply specific filters
    if (action === 'mainField') {
      const slotKey = inputEl.getAttribute('data-slot');
      const requiredJob = window.rowJobFilter ? window.rowJobFilter[slotKey] : '';
      
      allMembers = allMembers.filter(m => {
        if (requiredJob && m.job !== requiredJob) return false;
        const lowerName = m.name.toLowerCase();
        if (window.occupiedMap && window.occupiedMap.has(lowerName)) {
          if (window.occupiedMap.get(lowerName) !== slotKey) return false;
        }
        return true;
      });
    } else if (action === 'dungeonTeam' && typeof window.dungeonData !== 'undefined') {
      const currentTab = window.currentDungeonTab;
      const teamId = inputEl.getAttribute('data-team-id');
      const slotIdx = parseInt(inputEl.getAttribute('data-slot-idx'));
      const inUseNames = new Set();
      
      window.dungeonData.teams.forEach(t => {
        if (t.type === currentTab) {
          t.members.forEach((m, idx) => {
            if (m && m.name) {
               if (t.id === teamId && idx === slotIdx) return; // Allow current occupant
               inUseNames.add(m.name.toLowerCase());
            }
          });
        }
      });
      allMembers = allMembers.filter(m => !inUseNames.has(m.name.toLowerCase()));
    }
    
    const val = filterText.toLowerCase();
    const filtered = allMembers.filter(m => m.name.toLowerCase().includes(val));
    
    if (filtered.length === 0) {
      dropdown.innerHTML = '<div style="padding: 10px; text-align:center; color:var(--text-lo); font-size: 13px;">ไม่พบชื่อตัวละคร</div>';
    } else {
      dropdown.innerHTML = filtered.map(m => 
        `<div class="custom-dropdown-item" data-name="${window.escapeHtml ? window.escapeHtml(m.name) : m.name}" data-job="${m.job}" data-power="${m.power}">
          <strong style="color:var(--blue-700);">${window.escapeHtml ? window.escapeHtml(m.name) : m.name}</strong> 
          <span style="opacity:0.7; font-size:12px;">- ${m.job} (${m.power})</span>
        </div>`
      ).join('');
      
      dropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
          e.preventDefault(); 
          if (window.activeAutocompleteInput) {
            const newName = item.getAttribute('data-name');
            window.activeAutocompleteInput.value = newName;
            
            const action = window.activeAutocompleteInput.getAttribute('data-action');
            if (action === 'mainField') {
               const slot = window.activeAutocompleteInput.getAttribute('data-slot');
               if (typeof handleNameChange === 'function') handleNameChange(slot, newName);
            } else if (action === 'dungeonTeam') {
               const teamId = window.activeAutocompleteInput.getAttribute('data-team-id');
               const slotIdx = window.activeAutocompleteInput.getAttribute('data-slot-idx');
               if (typeof updateDungeonTeamName === 'function') updateDungeonTeamName(teamId, parseInt(slotIdx), newName);
            } else if (action === 'leaveForm') {
               const job = item.getAttribute('data-job');
               const leaveJob = document.getElementById('leaveJob');
               if (leaveJob) leaveJob.value = job;
            } else if (action === 'dungeonQueue') {
               const job = item.getAttribute('data-job');
               const dqClass = document.getElementById('dqClass');
               if (dqClass) dqClass.value = job;
            }
          }
          dropdown.style.display = 'none';
        });
      });
    }
    
    const rect = inputEl.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = Math.max(200, rect.width) + 'px';
    dropdown.style.display = 'block';
    window.activeAutocompleteInput = inputEl;
  } catch(e) {
    console.error('Dropdown Error:', e);
  }
}

document.addEventListener("input", (e) => { 
  if (e.target && e.target.classList.contains("autocomplete-member")) { 
    if (typeof window.showGlobalDropdown === "function") window.showGlobalDropdown(e.target, e.target.value.trim()); 
  } 
}); 
document.addEventListener("focusin", (e) => { 
  if (e.target && e.target.classList.contains("autocomplete-member")) { 
    if (typeof window.showGlobalDropdown === "function") window.showGlobalDropdown(e.target, e.target.value.trim()); 
  } 
}); 
document.addEventListener("focusout", (e) => { 
  if (e.target && e.target.classList.contains("autocomplete-member")) { 
    setTimeout(() => { 
      const dropdown = document.getElementById("globalMemberDropdown"); 
      if (dropdown) dropdown.style.display = "none"; 
    }, 150); 
  } 
}); 
window.addEventListener("scroll", (e) => { 
  const dropdown = document.getElementById("globalMemberDropdown"); 
  if (dropdown && dropdown.style.display === "block") { 
    if (!dropdown.contains(e.target)) { 
      dropdown.style.display = "none"; 
    } 
  } 
}, true);
