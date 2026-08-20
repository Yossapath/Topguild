// ==========================================
// ====== AUTHENTICATION & ROLE SYSTEM ======
// ==========================================

import { doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
          window.currentUser.role = snap.data().role || 'member';
          localStorage.setItem('guild_current_user', JSON.stringify(window.currentUser));
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
      uiInfo.innerHTML = `👤 ${window.escapeHtml ? window.escapeHtml(window.currentUser.username) : window.currentUser.username} <span style="opacity:0.7; margin:0 6px;">|</span> ยศ: ${window.currentUser.role === 'admin' ? '👑 Admin' : '🛡️ Member'}`;
    }
  }
}

window.handleLogin = async function() {
  const u = document.getElementById('loginUsername').value.trim().toLowerCase();
  const p = document.getElementById('loginPassword').value;
  if (!u || !p) return window.showToast("กรุณากรอก Username และ Password", "warning");

  if (!window.db) {
    window.showToast("ระบบกำลังเชื่อมต่อฐานข้อมูล กรุณารอสักครู่...", "warning");
    return;
  }

  try {
    const userRef = doc(window.db, 'users', u);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      window.showToast("ไม่พบผู้ใช้งานนี้ในระบบ", "error");
      return;
    }
    const data = snap.data();
    if (data.password !== p) {
      window.showToast("รหัสผ่านไม่ถูกต้อง", "error");
      return;
    }

    window.currentUser = { username: data.username, role: data.role || 'member', class: data.class };
    localStorage.setItem('guild_current_user', JSON.stringify(window.currentUser));
    window.showToast(`ยินดีต้อนรับ ${window.currentUser.username}`, "success");
    showMainApp();
    applyRolePermissions();
    if (typeof window.renderAll === 'function') window.renderAll();
  } catch (err) {
    window.showToast("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", "error");
    console.error(err);
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
    
    // Auto-add to Roster
    if (window.guildRoster && window.saveState) {
        if (!window.guildRoster[j]) window.guildRoster[j] = [];
        window.guildRoster[j].push({ name: u, power: 0, fieldPref: 'any' });
        window.saveState();
        if (typeof window.renderAll === 'function') window.renderAll();
    }
    
    window.showToast("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ", "success");
    if (typeof window.toggleAuthMode === 'function') {
      window.toggleAuthMode('login');
    }
  } catch (err) {
    window.showToast("เกิดข้อผิดพลาดในการสมัครสมาชิก", "error");
    console.error(err);
  }
};

window.handleLogout = function() {
  window.currentUser = null;
  localStorage.removeItem('guild_current_user');
  showAuthUI();
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
};

function applyRolePermissions() {
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  
  const btnAdminUsers = document.getElementById('btnAdminUsers');
  if (btnAdminUsers) btnAdminUsers.style.display = isAdmin ? 'block' : 'none';
  
  const btnAdminCreateAtt = document.getElementById('btnAdminCreateAttendance');
  if (btnAdminCreateAtt) btnAdminCreateAtt.style.display = isAdmin ? 'block' : 'none';

  const btnAutoOptMain = document.getElementById('btnAutoOptimizeMain');
  if (btnAutoOptMain) btnAutoOptMain.style.display = isAdmin ? 'block' : 'none';
  const btnAutoOptSub = document.getElementById('btnAutoOptimizeSub');
  if (btnAutoOptSub) btnAutoOptSub.style.display = isAdmin ? 'block' : 'none';

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

async function fetchAndRenderUsers() {
  if (!window.db || !window.currentUser || window.currentUser.role !== 'admin') return;
  const listEl = document.getElementById('adminUsersList');
  listEl.innerHTML = '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">กำลังโหลด...</div>';
  
  try {
    const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const snap = await getDocs(collection(window.db, 'users'));
    let html = '';
    snap.forEach(doc => {
      const d = doc.data();
      const roleColor = d.role === 'admin' ? 'var(--warn)' : 'var(--blue-500)';
      html += `
        <div style="padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600; color: var(--text-hi); font-size: 14px;">${window.escapeHtml ? window.escapeHtml(d.username) : d.username}</div>
            <div style="font-size: 12px; color: var(--text-lo); margin-top: 2px;">
              อาชีพ: ${d.class || '-'} <br>
              ยศ: <span style="color: ${roleColor}; font-weight: 600;">${d.role === 'admin' ? 'Admin' : 'Member'}</span>
            </div>
          </div>
          ${d.username.toLowerCase() !== window.currentUser.username.toLowerCase() ? 
            `<button onclick="deleteAccount('${doc.id}')" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">ลบ</button>` 
            : '<span style="font-size:12px; color:var(--text-lo);">คุณ</span>'
          }
        </div>
      `;
    });
    listEl.innerHTML = html || '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">ไม่พบข้อมูล</div>';
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
// ====== DUNGEON SYSTEM ======
// ==========================================
let dungeonData = { queues: [], teams: [] };
let unsubDungeonListener = null;

async function setupDungeonFirebase() {
  if (!window.db) return;
  try {
    const dungRef = doc(window.db, 'guild_system', 'dungeons');
    
    const snap = await getDoc(dungRef);
    if (!snap.exists()) {
      await setDoc(dungRef, { queues: [], teams: [] });
    }

    unsubDungeonListener = onSnapshot(dungRef, (snapshot) => {
      if (snapshot.exists()) {
        dungeonData = snapshot.data();
        if (!dungeonData.queues) dungeonData.queues = [];
        if (!dungeonData.teams) dungeonData.teams = [];
        renderDungeonPage();
      }
    });
  } catch(e) {
    console.error(e);
  }
}

async function saveDungeonState() {
  if (!window.db) return;
  const dungRef = doc(window.db, 'guild_system', 'dungeons');
  await setDoc(dungRef, dungeonData);
}

window.bookDungeonQueue = function() {
  if (!window.currentUser) return window.showToast("กรุณาเข้าสู่ระบบ", "error");
  const name = document.getElementById('dqName').value.trim();
  const job = document.getElementById('dqClass').value;
  const dungeon = document.getElementById('dqDungeon').value;
  
  if (!name || !job || !dungeon) return window.showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");

  dungeonData.queues.push({
    id: Date.now().toString(),
    name, job, dungeon,
    status: 'waiting',
    timestamp: Date.now()
  });
  
  saveDungeonState();
  
  document.getElementById('dqName').value = '';
  document.getElementById('dqClass').value = '';
  window.showToast("จองคิวสำเร็จ!", "success");
};

window.changeDungeonQueueStatus = function(id, newStatus) {
  const q = dungeonData.queues.find(x => x.id === id);
  if (q) {
    q.status = newStatus;
    saveDungeonState();
  }
};

window.deleteDungeonQueue = function(id) {
  dungeonData.queues = dungeonData.queues.filter(x => x.id !== id);
  saveDungeonState();
};

window.addDungeonTeam = function(dungeonName, capacity) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  dungeonData.teams.push({
    id: Date.now().toString(),
    dungeonName,
    capacity,
    members: Array(capacity).fill(null)
  });
  saveDungeonState();
};

window.deleteDungeonTeam = function(id) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  if (confirm("คุณต้องการลบทีมนี้ใช่หรือไม่?")) {
    dungeonData.teams = dungeonData.teams.filter(x => x.id !== id);
    saveDungeonState();
  }
};

window.updateDungeonTeamMember = function(teamId, memberIndex, nameVal) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (t) {
    t.members[memberIndex] = nameVal || null;
    saveDungeonState();
  }
};

function renderDungeonPage() {
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  const dc = document.getElementById('dungeonAdminControls');
  if (dc) dc.style.display = isAdmin ? 'flex' : 'none';

  const qList = document.getElementById('dqList');
  if (qList) {
    qList.innerHTML = dungeonData.queues.map(q => {
      const sColor = q.status === 'done' ? 'var(--ok)' : (q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)');
      const sText = q.status === 'done' ? 'สำเร็จ' : (q.status === 'active' ? 'กำลังลงดัน' : 'รอลงดัน');
      
      let adminControls = '';
      if (isAdmin) {
        adminControls = `
          <div style="display:flex; gap: 4px; margin-top: 8px;">
            <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}', 'waiting')" style="font-size:11px; padding:2px 4px;">รอ</button>
            <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}', 'active')" style="font-size:11px; padding:2px 4px;">กำลังลง</button>
            <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}', 'done')" style="font-size:11px; padding:2px 4px;">เสร็จ</button>
            <button class="btn-secondary" onclick="deleteDungeonQueue('${q.id}')" style="font-size:11px; padding:2px 4px; color:var(--danger); border-color:var(--danger);">ลบ</button>
          </div>
        `;
      }
      return `
        <div style="padding: 10px; border-bottom: 1px solid var(--line); display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between;">
            <strong style="color:var(--text-hi); font-size:14px;">${window.escapeHtml ? window.escapeHtml(q.name) : q.name}</strong>
            <span style="font-size:11px; padding:2px 6px; border-radius:12px; background:color-mix(in srgb, ${sColor} 15%, transparent); color:${sColor}; font-weight:600;">${sText}</span>
          </div>
          <div style="font-size:12px; color:var(--text-lo); margin-top:2px;">
            อาชีพ: ${q.job} <br>ดันเจี้ยน: ${q.dungeon}
          </div>
          ${adminControls}
        </div>
      `;
    }).join('') || '<div style="padding:16px; text-align:center; color:var(--text-lo); font-size:13px;">ยังไม่มีคิว</div>';
  }

  const tArea = document.getElementById('dungeonTeamsArea');
  if (tArea) {
    tArea.innerHTML = dungeonData.teams
      .filter(t => t.type === (window.currentDungeonTab || 'มายา (Maya)'))
      .map(t => {
      let mHtml = '';
      for (let i=0; i<t.capacity; i++) {
        const mv = t.members[i] || '';
        if (isAdmin) {
          mHtml += `
            <div style="display:flex; gap:8px; margin-bottom:4px; align-items:center;">
              <span style="width:20px; text-align:right; font-size:12px; color:var(--text-lo);">${i+1}.</span>
              <input type="text" list="rosterDatalist" value="${window.escapeHtml ? window.escapeHtml(mv) : mv}" onchange="updateDungeonTeamMember('${t.id}', ${i}, this.value)" class="form-control" style="padding:4px 8px; font-size:13px; height:28px;" placeholder="ชื่อคนลงดัน">
            </div>
          `;
        } else {
          mHtml += `
            <div style="display:flex; gap:8px; margin-bottom:4px; align-items:center;">
              <span style="width:20px; text-align:right; font-size:12px; color:var(--text-lo);">${i+1}.</span>
              <span style="font-size:13px; color:var(--text-hi);">${mv ? (window.escapeHtml ? window.escapeHtml(mv) : mv) : '<i style="color:var(--text-lo)">- ว่าง -</i>'}</span>
            </div>
          `;
        }
      }
      
      return `
        <div class="team-card" style="box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div class="team-card-head" style="display:flex; justify-content:space-between; align-items:center;">
            <h4 style="margin:0; font-size:15px; color:var(--blue-700);">🗡️ ${t.dungeonName}</h4>
            ${isAdmin ? `<button class="btn-delete-team-card" onclick="deleteDungeonTeam('${t.id}')" style="background:transparent; border:none; color:var(--danger); cursor:pointer;">✕</button>` : ''}
          </div>
          <div style="padding: 12px;">
            ${mHtml}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Global Exports
window.ensureDefaultAdmin = ensureDefaultAdmin;
window.checkAuth = checkAuth;
window.setupDungeonFirebase = setupDungeonFirebase;
// ==========================================
// ====== ATTENDANCE SYSTEM ======
// ==========================================

let attendanceData = { dates: {} };
let unsubAttendanceListener = null;

async function setupAttendanceFirebase() {
  if (!window.db) return;
  try {
    const { doc, getDoc, setDoc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const attRef = doc(window.db, 'guild_system', 'attendance');
    
    const snap = await getDoc(attRef);
    if (!snap.exists()) {
      await setDoc(attRef, { dates: {} });
    }

    unsubAttendanceListener = onSnapshot(attRef, (snapshot) => {
      if (snapshot.exists()) {
        attendanceData = snapshot.data();
        if (!attendanceData.dates) attendanceData.dates = {};
        renderAttendanceOptions();
      }
    });
  } catch(e) {
    console.error(e);
  }
}

async function saveAttendanceState() {
  if (!window.db) return;
  const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
  const attRef = doc(window.db, 'guild_system', 'attendance');
  await setDoc(attRef, attendanceData);
}

window.createAttendanceDate = function() {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
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
    if (dates.includes(currentVal)) {
      select.value = currentVal;
    }
  }
  
  window.renderAttendanceTable();
}

window.renderAttendanceTable = function() {
  const select = document.getElementById('attendanceDateSelect');
  const tbody = document.getElementById('attendanceTbody');
  if (!select || !tbody) return;
  
  const selectedDate = select.value;
  if (!selectedDate) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกหรือสร้างวันที่เช็คชื่อ</td></tr>';
    return;
  }
  
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  const records = attendanceData.dates[selectedDate] || {};
  
  let allMembers = [];
  if (window.guildRoster) {
    Object.values(window.guildRoster).forEach(arr => {
      arr.forEach(m => {
        allMembers.push(m.name);
      });
    });
  }
  
  allMembers.sort((a, b) => a.localeCompare(b));
  
  const searchInput = document.getElementById('attendanceSearch');
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (searchText) {
    allMembers = allMembers.filter(name => name.toLowerCase().includes(searchText));
  }
  
  if (allMembers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 24px; color: var(--text-lo);">ไม่พบรายชื่อในระบบกิลด์</td></tr>';
    return;
  }

  let html = '';
  allMembers.forEach((name, idx) => {
    const status = records[name] || 'none'; 
    const escapedName = window.escapeHtml ? window.escapeHtml(name) : name;
    
    let statusUI = '';
    if (isAdmin) {
      statusUI = `
        <div style="display: flex; justify-content: center; gap: 8px;">
          <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="att_${idx}" onchange="updateAttendanceStatus('${selectedDate}', '${escapedName}', 'attended')" ${status === 'attended' ? 'checked' : ''}>
            <span style="color: var(--ok); font-weight: 600; font-size: 13px;">🟢 เข้าร่วม</span>
          </label>
          <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="att_${idx}" onchange="updateAttendanceStatus('${selectedDate}', '${escapedName}', 'leave')" ${status === 'leave' ? 'checked' : ''}>
            <span style="color: var(--warn); font-weight: 600; font-size: 13px;">🟡 ลา</span>
          </label>
          <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="att_${idx}" onchange="updateAttendanceStatus('${selectedDate}', '${escapedName}', 'absent')" ${status === 'absent' ? 'checked' : ''}>
            <span style="color: var(--danger); font-weight: 600; font-size: 13px;">🔴 ขาด</span>
          </label>
        </div>
      `;
    } else {
      let badge = '<span style="color: var(--text-lo);">- ยังไม่เช็คชื่อ -</span>';
      if (status === 'attended') badge = '<span style="color: var(--ok); font-weight: 600;">🟢 เข้าร่วม</span>';
      else if (status === 'leave') badge = '<span style="color: var(--warn); font-weight: 600;">🟡 ลา</span>';
      else if (status === 'absent') badge = '<span style="color: var(--danger); font-weight: 600;">🔴 ขาด</span>';
      
      statusUI = `<div style="text-align: center;">${badge}</div>`;
    }
    
    html += `
      <tr style="border-bottom: 1px solid var(--line);">
        <td style="padding: 10px 16px; color: var(--text-lo);">${idx + 1}</td>
        <td style="padding: 10px 16px; font-weight: 600; color: var(--text-hi);">${escapedName}</td>
        <td style="padding: 10px 16px;">${statusUI}</td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
};

window.updateAttendanceStatus = function(dateStr, name, status) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  if (!attendanceData.dates[dateStr]) attendanceData.dates[dateStr] = {};
  attendanceData.dates[dateStr][name] = status;
  saveAttendanceState();
};

window.setupAttendanceFirebase = setupAttendanceFirebase;
let currentDungeonTab = 'มายา (Maya)';

window.switchDungeonTab = function(type) {
  currentDungeonTab = type;
  
  // Update Tab UI
  document.querySelectorAll('.dungeon-tab').forEach(btn => {
    if (btn.dataset.type === type) {
      btn.classList.add('active');
      btn.style.background = '#2563eb';
      btn.style.color = 'white';
    } else {
      btn.classList.remove('active');
      btn.style.background = 'transparent';
      btn.style.color = 'var(--text-lo)';
    }
  });

  window.renderDungeonPage();
};
window.currentDungeonTab = 'มายา (Maya)';

window.switchDungeonTab = function(type) {
  window.currentDungeonTab = type;
  
  document.querySelectorAll('.dungeon-tab').forEach(btn => {
    if (btn.dataset.type === type) {
      btn.classList.add('active');
      btn.style.background = '#2563eb';
      btn.style.color = 'white';
    } else {
      btn.classList.remove('active');
      btn.style.background = 'transparent';
      btn.style.color = 'var(--text-lo)';
    }
  });

  window.renderDungeonPage();
};
