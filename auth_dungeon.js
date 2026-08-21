// ==========================================
// ====== AUTHENTICATION & ROLE SYSTEM ======
// ==========================================

import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
      uiInfo.innerHTML = `👤 ${window.escapeHtml ? window.escapeHtml(window.currentUser.username) : window.currentUser.username} <span style="opacity:0.7; margin:0 6px;">|</span> Role: ${(window.currentUser.role || '').toLowerCase() === 'admin' ? '<span style="color: #f59e0b; font-weight: 700;">👑 Admin</span>' : '🛡️ Member'}`;
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
  window.currentUser = null;
  localStorage.removeItem('guild_current_user');
  showAuthUI();
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
};

function applyRolePermissions() {
  const isAdmin = window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin';
  
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
    if (!window.db || !window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
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
// ====== DUNGEON SYSTEM ======
// ==========================================
let dungeonData = { queues: [], teams: [] };
    window.dungeonData = dungeonData;
window.dungeonData = dungeonData;
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
          window.dungeonData = dungeonData;
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
    window.dungeonData = dungeonData;
    await setDoc(dungRef, dungeonData);
}

window.bookDungeonQueue = function() {
  if (!window.currentUser) return window.showToast("กรุณาเข้าสู่ระบบ", "error");
  const name = document.getElementById('dqName').value.trim();
  const job = document.getElementById('dqClass').value;
  const dungeon = document.getElementById('dqDungeon').value;
  
  if (!name || !job || !dungeon) return window.showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");

  // Get power from roster
  let power = 0;
  if (window.guildRoster && window.guildRoster[job]) {
    const found = window.guildRoster[job].find(m => m.name.toLowerCase() === name.toLowerCase());
    if (found) power = found.power || 0;
  }

  dungeonData.queues.push({
    id: Date.now().toString(),
    name, job, dungeon, power,
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


window.clearDungeonTeam = function(teamId) {
  if (!confirm("ยืนยันว่าทีมนี้ลงดันเจี้ยนสำเร็จ และต้องการเคลียร์รายชื่อทั้งหมด?")) return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (t) {
    t.members = Array(t.capacity).fill(null);
    saveDungeonState();
    window.showToast("เคลียร์ทีมเรียบร้อย", "success");
  }
};

window.memberJoinTeam = function(teamId) {
  if (!window.currentUser) return window.showToast("กรุณาเข้าสู่ระบบ", "error");
  const myName = window.currentUser.username;
  
  // Get my job and power
  let myJob = '';
  let myPower = 0;
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(job => {
      const found = (window.guildRoster[job]||[]).find(m => m.name.toLowerCase() === myName.toLowerCase());
      if (found) { myJob = job; myPower = found.power || 0; }
    });
  }
  if (!myJob) return window.showToast("ไม่พบข้อมูลอาชีพของคุณในรายชื่อสมาชิก", "error");

  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
  
  // Check if user is already in ANY team in THIS dungeon tab
  const alreadyInTeam = dungeonData.teams.some(team => 
    team.type === window.currentDungeonTab && 
    team.members.some(m => m && m.name.toLowerCase() === myName.toLowerCase())
  );
  if (alreadyInTeam) return window.showToast("คุณอยู่ในทีมดันเจี้ยนนี้แล้ว", "warning");

  const currentMembers = t.members.filter(m => m && m.name);
  const filledCount = currentMembers.length;
  if (filledCount >= t.capacity) return window.showToast("ทีมนี้เต็มแล้ว", "warning");

  const curPriest = currentMembers.filter(m => m.job === 'Priest').length;
  const curTank = currentMembers.filter(m => m.job === 'Lord Knight' || m.job === 'Paladin').length;
  const emptySlots = t.capacity - filledCount;

  if (window.currentDungeonTab === 'มายา (Maya)') {
    if (filledCount >= 2) return window.showToast("ทีมมายารับสมาชิกกดเข้าเองได้สูงสุด 2 คน โปรดสร้างทีมใหม่", "warning");
    const missingPriests = Math.max(0, 1 - curPriest);
    const myContribution = (myJob === 'Priest') ? 1 : 0;
    if ((emptySlots - 1) < (missingPriests - myContribution)) {
       return window.showToast("ไม่สามารถเข้าได้ ทีมมายาต้องการ Priest ขั้นต่ำ 1 คน", "warning");
    }
  } else if (window.currentDungeonTab === 'บับเบิ้ล (Bubble)') {
    const missingPriests = Math.max(0, 2 - curPriest);
    const missingTanks = Math.max(0, 1 - curTank);
    let myContribution = 0;
    if (myJob === 'Priest') myContribution = missingPriests > 0 ? 1 : 0;
    else if (myJob === 'Lord Knight' || myJob === 'Paladin') myContribution = missingTanks > 0 ? 1 : 0;
    
    if ((emptySlots - 1) < (missingPriests + missingTanks - myContribution)) {
       return window.showToast("ไม่สามารถเข้าได้ ทีมต้องการ Priest ขั้นต่ำ 2 คน และ แทงค์ขั้นต่ำ 1 คน", "warning");
    }
  } else if (window.currentDungeonTab === 'กระจก (Mirror)') {
    const missingPriests = Math.max(0, 2 - curPriest);
    const missingTanks = Math.max(0, 2 - curTank);
    let myContribution = 0;
    if (myJob === 'Priest') myContribution = missingPriests > 0 ? 1 : 0;
    else if (myJob === 'Lord Knight' || myJob === 'Paladin') myContribution = missingTanks > 0 ? 1 : 0;
    
    if ((emptySlots - 1) < (missingPriests + missingTanks - myContribution)) {
       return window.showToast("ไม่สามารถเข้าได้ ทีมต้องการ Priest ขั้นต่ำ 2 คน และ แทงค์ขั้นต่ำ 2 คน", "warning");
    }
  }

  const emptyIdx = t.members.findIndex(m => !m || !m.name);
  if (emptyIdx !== -1) {
    t.members[emptyIdx] = { name: myName, job: myJob, power: myPower };
    
    // Auto remove from queue if they are in it
    dungeonData.queues = dungeonData.queues.filter(q => q.name.toLowerCase() !== myName.toLowerCase() || q.dungeon !== window.currentDungeonTab);
    
    saveDungeonState();
    window.showToast("เข้าร่วมทีมสำเร็จ!", "success");
  }
};

window.addDungeonTeam = function(dungeonName, capacity) {
  if (!window.currentUser) return;
  const isAdmin = (window.currentUser.role || '').toLowerCase() === 'admin';
  if (!isAdmin && window.currentDungeonTab !== 'มายา (Maya)') {
     return window.showToast("เฉพาะ Admin ที่สร้างทีมดันเจี้ยนอื่นได้", "error");
  }
  const teamNum = dungeonData.teams.filter(t => t.type === window.currentDungeonTab).length + 1;
  dungeonData.teams.push({
    id: Date.now().toString(),
    type: window.currentDungeonTab || 'มายา (Maya)',
    dungeonName,
    capacity,
    members: Array(capacity).fill(null)
  });
  saveDungeonState();
};

window.deleteDungeonTeam = function(id) {
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
  if (confirm("คุณต้องการลบทีมนี้ใช่หรือไม่?")) {
    dungeonData.teams = dungeonData.teams.filter(x => x.id !== id);
    saveDungeonState();
  }
};

window.updateDungeonTeamName = function(teamId, slotIdx, nameVal) {
    if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
    const t = dungeonData.teams.find(x => x.id === teamId);
    if (!t) return;
    
    // Check duplicates
    if (nameVal.trim()) {
       const isDup = dungeonData.teams.some(team => team.type === window.currentDungeonTab && team.members.some((m, idx) => m && m.name.toLowerCase() === nameVal.trim().toLowerCase() && !(team.id === teamId && idx === slotIdx)));
       if (isDup) {
          window.showToast("รายชื่อซ้ำ! คนนี้อยู่ในทีมแล้ว", "warning");
          if (typeof renderDungeonPage === 'function') renderDungeonPage();
          return;
       }
    }
  if (!t.members[slotIdx]) t.members[slotIdx] = { name: '', job: '', power: null };
  t.members[slotIdx].name = nameVal.trim();
  
  if (nameVal && window.guildRoster) {
    for (const j in window.guildRoster) {
      const found = (window.guildRoster[j] || []).find(m => m.name.toLowerCase() === nameVal.toLowerCase());
      if (found) { t.members[slotIdx].job = j; t.members[slotIdx].power = found.power; break; }
    }
  }
  if (!nameVal.trim() && !t.members[slotIdx].job && !t.members[slotIdx].power) {
    t.members[slotIdx] = null;
  }
  saveDungeonState();
};

window.updateDungeonTeamJob = function(teamId, slotIdx, jobVal) {
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
  if (!t.members[slotIdx]) t.members[slotIdx] = { name: '', job: '', power: null };
  t.members[slotIdx].job = jobVal;
  saveDungeonState();
};

window.updateDungeonTeamPower = function(teamId, slotIdx, powerVal) {
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
  if (!t.members[slotIdx]) t.members[slotIdx] = { name: '', job: '', power: null };
  t.members[slotIdx].power = powerVal === '' ? null : Number(powerVal);
  saveDungeonState();
};

window.clearDungeonSlot = function(teamId, slotIdx) {
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (t) { t.members[slotIdx] = null; saveDungeonState(); }
};

function dungeonNameSelectHtml(currentName, filterJob) {
  let list = [];
  if (window.guildRoster) {
    if (filterJob && window.guildRoster[filterJob]) {
      list = [...window.guildRoster[filterJob]];
    } else {
      Object.keys(window.guildRoster).forEach(j => {
        list.push(...window.guildRoster[j].map(m => ({...m, job: j})));
      });
    }
  }
  
  list.sort((a,b) => (b.power||0) - (a.power||0));

  let out = `<option value="" ${!currentName ? 'selected' : ''}>— เลือกชื่อ —</option>`;
  
  if (currentName && !list.some(m => m.name.toLowerCase() === currentName.toLowerCase())) {
    out += `<option value="${window.escapeHtml(currentName)}" selected>${window.escapeHtml(currentName)} ❓</option>`;
  }

  list.forEach(m => {
    const isSelected = currentName && m.name.toLowerCase() === currentName.toLowerCase();
    const jobBadge = isSelected ? '' : ` [${m.job || filterJob}]`;
    const extraInfo = isSelected ? '' : (m.power != null ? ` (⚡ ${Number(m.power).toLocaleString('en-US')})` : '');
    out += `<option value="${window.escapeHtml(m.name)}" ${isSelected ? 'selected' : ''}>${window.escapeHtml(m.name)}${jobBadge}${extraInfo}</option>`;
  });
  return out;
}

const DUNGEON_JOB_LIST = [
  "Lord Knight", "Paladin", "High Wizard", "Sniper", 
  "Priest", "Champion", "Assassin Cross", "Merchant", 
  "Gunslinger", "Druid"
];

function dungeonJobSelectHtml(currentJob) {
  let out = `<option value="" ${!currentJob ? 'selected' : ''}>— เลือกอาชีพ —</option>`;
  DUNGEON_JOB_LIST.forEach(j => {
    const isSelected = currentJob && currentJob.toLowerCase() === j.toLowerCase();
    out += `<option value="${j}" ${isSelected ? 'selected' : ''}>${j}</option>`;
  });
  return out;
}


window.currentDungeonTab = window.currentDungeonTab || 'มายา (Maya)';

window.switchDungeonTab = function(tabName) {
  window.currentDungeonTab = tabName;
  // Sync the dqDungeon dropdown
  const dq = document.getElementById('dqDungeon');
  if (dq) {
    Array.from(dq.options).forEach(opt => {
      if (opt.value === tabName) dq.value = opt.value;
    });
  }
  // Highlight tabs
  document.querySelectorAll('.dungeon-tab').forEach(btn => {
      btn.classList.remove('active');
      btn.style.background = 'transparent';
      btn.style.color = 'var(--text-lo)';
      if (btn.getAttribute('data-type') === tabName) {
        btn.classList.add('active');
        btn.style.background = '#2563eb';
        btn.style.color = 'white';
      }
    });
  renderDungeonPage();
};

function renderDungeonPage() {
  const isAdmin = window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin';
  const currentTab = window.currentDungeonTab || 'มายา (Maya)';

  // Update create team button
  const btnCreate = document.getElementById('btnCreateDungeonTeam');
  if (btnCreate) {
    btnCreate.innerHTML = isAdmin
      ? ('+ สร้างทีม' + currentTab.split(' ')[0])
      : '+ สร้างทีมใหม่';
  }

  // ---- QUEUE PANEL ----
  const qList = document.getElementById('dqList');
  if (qList) {
    const filteredQueues = (dungeonData.queues || []).filter(q => q.dungeon === currentTab);
    if (filteredQueues.length === 0) {
      qList.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-lo);font-size:13px;">ยังไม่มีคิว</div>';
    } else {
      qList.innerHTML = filteredQueues.map(q => {
        const sColor = q.status === 'done' ? 'var(--ok)' : (q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)');
        const sText = q.status === 'done' ? 'สำเร็จ' : (q.status === 'active' ? 'กำลังลงดัน' : 'รอลงดัน');
        const eName = window.escapeHtml ? window.escapeHtml(q.name) : q.name;
        const eJob = window.escapeHtml ? window.escapeHtml(q.job || '') : (q.job || '');
        const adminCtrl = isAdmin ? `<div style="display:flex;gap:4px;margin-top:8px;">
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','waiting')" style="font-size:11px;padding:2px 4px;">รอ</button>
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','active')" style="font-size:11px;padding:2px 4px;">กำลังลง</button>
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','done')" style="font-size:11px;padding:2px 4px;">เสร็จ</button>
          <button class="btn-secondary" onclick="deleteDungeonQueue('${q.id}')" style="font-size:11px;padding:2px 4px;color:var(--danger);border-color:var(--danger);">ลบ</button>
        </div>` : '';
        const dragAttr = isAdmin ? `draggable="true" data-queue-name="${eName}" data-queue-job="${eJob}" data-queue-power="${q.power || 0}"` : '';
        return `<div ${dragAttr} style="padding:10px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;${isAdmin ? 'cursor:grab;' : ''}" ondragstart="window.onDungeonQueueDragStart(event)">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <strong style="color:var(--text-hi);font-size:14px;">${eName}</strong>
              <span style="font-size:11px;color:${q.job && window.JOB_COLORS && window.JOB_COLORS[q.job] ? window.JOB_COLORS[q.job] : 'var(--text-lo)'};margin-left:6px;font-weight:600;">${q.job || ''}</span>
              ${q.power ? '<span style="font-size:11px;color:var(--text-lo);">⚡' + Number(q.power).toLocaleString('en-US') + '</span>' : ''}
              ${q.timestamp ? '<div style="font-size:10.5px;color:var(--text-lo);margin-top:4px;">🕒 ' + new Date(q.timestamp).toLocaleString('th-TH',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) + ' น.</div>' : ''}
            </div>
            <span style="font-size:11px;padding:2px 6px;border-radius:12px;font-weight:600;color:${sColor};">${sText}</span>
          </div>
          ${adminCtrl}
        </div>`;
      }).join('');
    }
  }

  // ---- TEAMS AREA ----
  const tArea = document.getElementById('dungeonTeamsArea');
  if (!tArea) return;

  const teamsForTab = (dungeonData.teams || []).filter(t => t.type === currentTab);

  if (teamsForTab.length === 0) {
    tArea.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-lo);">' +
      (isAdmin ? 'ยังไม่มีทีม กดปุ่มด้านบนเพื่อสร้างทีม' : 'ยังไม่มีทีมในดันเจี้ยนนี้') + '</div>';
    return;
  }

  tArea.innerHTML = teamsForTab.map(t => {
    let mHtml = '';
    let totalPower = 0;
    let filledCount = 0;

    for (let i = 0; i < t.capacity; i++) {
      const member = t.members[i];
      const memberName = member ? (typeof member === 'string' ? member : (member.name || '')) : '';
      let memberJob = member ? (typeof member === 'string' ? '' : (member.job || '')) : '';
      let memberPower = member ? (typeof member === 'string' ? null : (member.power || null)) : null;

      if (memberName && !memberJob && window.guildRoster) {
        for (const j in window.guildRoster) {
          const found = (window.guildRoster[j] || []).find(m => m.name.toLowerCase() === memberName.toLowerCase());
          if (found) { memberJob = j; memberPower = found.power; break; }
        }
      }

      if (memberName) { filledCount++; if (memberPower) totalPower += Number(memberPower); }

      const eName = window.escapeHtml ? window.escapeHtml(memberName) : memberName;
      const jobColor = memberJob && window.JOB_COLORS ? (window.JOB_COLORS[memberJob] || 'var(--text-hi)') : 'var(--text-hi)';

      if (isAdmin) {
        mHtml += `<tr data-team-id="${t.id}" data-slot="${i}"
          ondragover="event.preventDefault();this.style.background='var(--blue-100)';"
          ondragleave="this.style.background='';"
          ondrop="window.onDungeonSlotDrop(event,'${t.id}',${i});this.style.background='';">
          <td class="cell-rank">${i + 1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member"
              onchange="updateDungeonTeamName('${t.id}',${i},this.value)"
              data-team-id="${t.id}" data-slot-idx="${i}" data-action="dungeonTeam"
              value="${memberName ? eName : ''}" placeholder="🔍 พิมพ์/คลิก..." autocomplete="off"
              style="width:100%;min-width:140px;font-size:14px;padding:6px;">
          </td>
          <td>
            <select class="cell-input job-input ${memberJob ? '' : 'empty'}" onchange="updateDungeonTeamJob('${t.id}',${i},this.value)" style="width:100%;min-width:120px;font-size:14px;padding:6px;--job-color:${jobColor};">
              ${dungeonJobSelectHtml(memberJob)}
            </select>
          </td>
          <td class="cell-action">
            <button class="clear-btn" onclick="clearDungeonSlot('${t.id}',${i})" title="ล้างช่องนี้">✕</button>
          </td>
        </tr>`;
      } else {
        mHtml += `<tr>
          <td class="cell-rank">${i + 1}</td>
          <td style="padding-left:8px;font-size:14px;color:var(--text-hi);">
            ${memberName ? eName : '<i style="color:var(--text-lo)">- ว่าง -</i>'}
          </td>
          <td style="text-align:center;font-size:14px;font-weight:600;color:${jobColor};">${memberJob || '-'}</td>
          <td></td>
        </tr>`;
      }
    }

    const pct = t.capacity > 0 ? filledCount / t.capacity : 0;
    const badgeClass = pct === 1 ? 'ok' : (pct > 0.5 ? 'warn' : '');
    const badgeText = filledCount === t.capacity
      ? 'ครบ ' + filledCount + '/' + t.capacity
      : 'ขาด ' + (t.capacity - filledCount) + ' คน';

    return `<div class="team-card" style="width:100%;">
      <div class="team-card-head" style="display:flex;justify-content:space-between;align-items:center;padding:12px;">
        <div class="team-title-group">
          <span style="font-size:16px;">🗡️ ${window.escapeHtml ? window.escapeHtml(t.dungeonName || t.type) : (t.dungeonName || t.type)}</span>
          <span class="team-power-sum" style="font-size:14px;">⚡ ${totalPower.toLocaleString('en-US')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="status-badge ${badgeClass}" style="font-size:13px;padding:4px 8px;">${badgeText}</span>
          ${isAdmin ? '<button onclick="deleteDungeonTeam(\'' + t.id + '\')" style="background:transparent;border:none;color:white;cursor:pointer;font-size:16px;" title="ลบทีม">✕</button>' : ''}
        </div>
      </div>
      <div style="padding:0 8px 8px;">
        <table class="team-table" style="width:100%;table-layout:auto;">
          <thead><tr>
            <th style="width:30px;">#</th>
            <th>ชื่อ</th>
            <th style="text-align:center;">อาชีพ</th>
            <th style="width:36px;"></th>
          </tr></thead>
          <tbody>${mHtml}</tbody>
        </table>
        <div style="display:flex;gap:8px;margin-top:8px;">
          ${!isAdmin ? '<button class="btn-primary" style="flex:1;border-radius:8px;padding:6px;font-size:13px;" onclick="memberJoinTeam(\'' + t.id + '\')">เข้าร่วมทีม</button>' : ''}
          ${isAdmin ? '<button class="btn-secondary" style="flex:1;border-radius:8px;padding:6px;font-size:13px;border-color:var(--ok);color:var(--ok);" onclick="clearDungeonTeam(\'' + t.id + '\')">✅ ลงสำเร็จ</button>' : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

// Drag-and-drop: drag from queue panel → drop into team slot
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
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
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
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
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
    if (summaryDiv) summaryDiv.innerHTML = '';
    const btnDelete = document.getElementById('btnDeleteAttendanceDate');
    if (btnDelete) btnDelete.style.display = 'none';
    return;
  }
  
  const btnDelete = document.getElementById('btnDeleteAttendanceDate');
  const isAdmin = window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin';
  if (btnDelete) btnDelete.style.display = (isAdmin && selectedDate) ? 'inline-block' : 'none';
  
  const dayData = attendanceData.dates[selectedDate] || {};
  
  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(job => {
      window.guildRoster[job].forEach(m => {
        allMembers.push({ name: m.name, job: job, power: m.power || 0 });
      });
    });
  }
  
  allMembers.sort((a,b) => b.power - a.power);
  
  const searchInput = document.getElementById('attendanceSearch');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  
  let html = '';
  let joinedCount = 0;
  let leaveCount = 0;
  let absentCount = 0;
  let totalCount = 0;
  
  let idx = 1;
  allMembers.forEach(m => {
     if (query && !m.name.toLowerCase().includes(query)) return;
     const status = dayData[m.name] || 'none';
     totalCount++;
     if (status === 'attended') joinedCount++;
     else if (status === 'leave') leaveCount++;
     else absentCount++;
     
     const escapedName = window.escapeHtml ? window.escapeHtml(m.name) : m.name;
     html += `<tr>
       <td class="cell-rank">${idx++}</td>
       <td>${escapedName}</td>
       <td style="text-align:center; font-weight: 600; color:${window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : "var(--text-hi)"};">${m.job}</td>
         <td style="text-align:center;"><small style="color:var(--text-lo)">${m.power}</small></td>
       <td style="text-align:center;">
         <select class="form-control" style="width:100%; min-width:100px; padding:4px;" ${isAdmin ? '' : 'disabled'} onchange="updateAttendanceStatus('${selectedDate}', '${escapedName}', this.value)">
           <option value="none" ${!status || status === 'none' ? 'selected' : ''}>--- เว้นว่าง ---</option>
           <option value="attended" ${status === 'attended' ? 'selected' : ''}>✅ เข้าร่วม</option>
           <option value="absent" ${status === 'absent' ? 'selected' : ''}>❌ ขาด</option>
           <option value="leave" ${status === 'leave' ? 'selected' : ''}>🟡 ลา</option>
         </select>
       </td>
     </tr>`;
  });
  
  if (html === '') {
    html = '<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--text-lo);">ไม่พบข้อมูลสมาชิก</td></tr>';
  }
  tbody.innerHTML = html;
  
  const summaryDiv = document.getElementById('attendanceSummary');
  if (summaryDiv) {
    summaryDiv.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom: 10px; background:var(--bg-soft); padding: 10px; border-radius: 8px;">
        <span style="color:var(--text-hi);">ทั้งหมด: ${totalCount} คน</span>
        <span style="color:var(--ok);">✅ มา: ${joinedCount} คน</span>
        <span style="color:var(--warn);">🟡 ลา: ${leaveCount} คน</span>
        <span style="color:var(--danger);">❌ ขาด: ${absentCount} คน</span>
      </div>
    `;
  }
};

window.updateAttendanceStatus = function(dateStr, name, status) {
  if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
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
window.addEventListener('scroll', () => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown && dropdown.style.display === 'block') dropdown.style.display = 'none';
}, true);


window.activeAutocompleteInput = null;

function showGlobalDropdown(inputEl, filterText = '') {
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


// ==========================================
// ====== LEAVE SYSTEM ======
// ==========================================



let leaveData = [];
let unsubLeaveListener = null;

window.setupLeaveFirebase = async function() {
  if (!window.db) return;
  try {
    const leaveRef = doc(window.db, 'guild_system', 'leaves');
    const snap = await getDoc(leaveRef);
    if (!snap.exists()) {
      await setDoc(leaveRef, { leaves: [] });
    }
    unsubLeaveListener = onSnapshot(leaveRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        leaveData = d.leaves || [];
        renderLeaveList();
      }
    });
  } catch(e) {
    console.error('setupLeaveFirebase error:', e);
  }
};

async function saveLeaveState() {
  if (!window.db) return;
  const leaveRef = doc(window.db, 'guild_system', 'leaves');
  await setDoc(leaveRef, { leaves: leaveData });
}

// Auto-fill leave form with current user's info when tab is shown
(function() {
  const tabBtn = document.querySelector('[data-page="page-leave"]');
  if (tabBtn) {
    tabBtn.addEventListener('click', function() {
      setTimeout(fillLeaveForm, 100);
    });
  }
  // Also fill when page loads if already on leave tab
  window.addEventListener('load', function() {
    const page = document.getElementById('page-leave');
    if (page && page.style.display !== 'none') fillLeaveForm();
  });
})();

function fillLeaveForm() {
  if (!window.currentUser) return;
  const nameInput = document.getElementById('leaveName');
  const jobSelect = document.getElementById('leaveJob');
  if (nameInput && !nameInput.value) {
    // Find character name from roster matching current user
    let charName = '';
    let charJob = '';
    if (window.guildRoster) {
      Object.keys(window.guildRoster).forEach(job => {
        const found = (window.guildRoster[job] || []).find(
          m => m.name && m.name.toLowerCase() === window.currentUser.username.toLowerCase()
        );
        if (found) { charName = found.name; charJob = job; }
      });
    }
    if (charName) {
      nameInput.value = charName;
      if (jobSelect && charJob) jobSelect.value = charJob;
    }
  }
}

window.submitLeave = async function() {
  if (!window.currentUser) return window.showToast('กรุณาเข้าสู่ระบบ', 'error');

  const nameInput = document.getElementById('leaveName');
  const jobSelect = document.getElementById('leaveJob');
  const daySelect = document.getElementById('leaveDay');
  const dateInput = document.getElementById('leaveDate');

  const name = nameInput ? nameInput.value.trim() : '';
  const job = jobSelect ? jobSelect.value : '';
  const day = daySelect ? daySelect.value : '';
  const date = dateInput ? dateInput.value : '';

  if (!name || !job || !day || !date) {
    return window.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
  }

  // Validate user can only submit leave for themselves (by matching name from roster)
  const isAdmin = (window.currentUser.role || '').toLowerCase() === 'admin';
  if (!isAdmin) {
    // Check if name matches current user's character
    let myCharName = '';
    if (window.guildRoster) {
      Object.keys(window.guildRoster).forEach(job => {
        const found = (window.guildRoster[job] || []).find(
          m => m.name && m.name.toLowerCase() === window.currentUser.username.toLowerCase()
        );
        if (found) myCharName = found.name;
      });
    }
    if (!myCharName || myCharName.toLowerCase() !== name.toLowerCase()) {
      return window.showToast('คุณสามารถแจ้งลาได้เฉพาะชื่อตัวละครของตัวเองเท่านั้น', 'error');
    }
  }

  // Check for duplicate leave
  const isDup = leaveData.some(l =>
    l.name.toLowerCase() === name.toLowerCase() && l.day === day && l.date === date
  );
  if (isDup) return window.showToast('คุณได้แจ้งลาวันนี้และรอบนี้ไว้แล้ว', 'warning');

  const entry = {
    id: Date.now().toString(),
    name, job, day, date,
    submittedBy: window.currentUser.username,
    timestamp: Date.now()
  };

  leaveData.push(entry);
  await saveLeaveState();
  window.showToast('บันทึกการลาเรียบร้อยแล้ว', 'success');

  // Clear form
  if (nameInput) nameInput.value = '';
  if (jobSelect) jobSelect.value = '';
  if (daySelect) daySelect.value = '';
  if (dateInput) dateInput.value = '';
};

window.cancelLeave = async function(leaveId) {
  if (!window.currentUser) return window.showToast('กรุณาเข้าสู่ระบบ', 'error');
  const isAdmin = (window.currentUser.role || '').toLowerCase() === 'admin';
  const entry = leaveData.find(l => l.id === leaveId);
  if (!entry) return;

  // Only admin or the submitter can cancel
  if (!isAdmin && entry.submittedBy !== window.currentUser.username) {
    return window.showToast('คุณไม่มีสิทธิ์ยกเลิกการลาของคนอื่น', 'error');
  }

  if (!confirm('ยืนยันการยกเลิกการแจ้งลา?')) return;
  leaveData = leaveData.filter(l => l.id !== leaveId);
  await saveLeaveState();
  window.showToast('ยกเลิกการลาเรียบร้อยแล้ว', 'success');
};

function renderLeaveList() {
  const tbody = document.getElementById('leaveListTbody');
  if (!tbody) return;

  const isAdmin = window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin';

  // Sort by date desc
  const sorted = [...leaveData].sort((a,b) => b.timestamp - a.timestamp);

  // Non-admin only sees their own leaves
  const displayed = isAdmin
    ? sorted
    : sorted.filter(l => l.submittedBy === window.currentUser.username);

  const dayLabels = {
    'Tuesday_1': 'อังคาร รอบ 1 (21:30)',
    'Tuesday_2': 'อังคาร รอบ 2 (22:00)',
    'Thursday': 'พฤหัส (22:00)',
    'Sunday': 'อาทิตย์ (21:00)'
  };

  if (displayed.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-lo);">ไม่มีรายการแจ้งลา</td></tr>';
    return;
  }

  tbody.innerHTML = displayed.map(l => {
    const eName = window.escapeHtml ? window.escapeHtml(l.name) : l.name;
    const dayLabel = dayLabels[l.day] || l.day;
    return '<tr>' +
      '<td>' + (l.date || '-') + '</td>' +
      '<td>' + dayLabel + '</td>' +
      '<td>' + eName + '</td>' +
      '<td>' + (l.job || '-') + '</td>' +
      '<td>' + (l.submittedBy || '-') + '</td>' +
      '<td style="text-align:center;"><button onclick="cancelLeave(\'' + l.id + '\')" style="background:var(--danger-light);color:var(--danger);border:1px solid var(--danger);padding:2px 8px;border-radius:6px;cursor:pointer;font-size:12px;">ยกเลิก</button></td>' +
      '</tr>';
  }).join('');
}

// ==========================================
// ====== ACCOUNT ROLE MANAGEMENT ======
// ==========================================

window.updateAccountRole = async function(docId, newRole) {
  if (!window.db || !window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') {
    return window.showToast('ไม่มีสิทธิ์เปลี่ยน Role', 'error');
  }
  try {
    const { doc: fDoc, setDoc: fSetDoc, getDoc: fGetDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const ref = fDoc(window.db, 'users', docId);
    const snap = await fGetDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    data.role = newRole;
    await fSetDoc(ref, data);
    window.showToast('เปลี่ยน Role สำเร็จ', 'success');
  } catch(e) {
    console.error(e);
    window.showToast('เกิดข้อผิดพลาด', 'error');
  }
};

// Fix scrollbar clicking stealing focus and closing dropdown
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown) {
    dropdown.addEventListener('mousedown', (e) => {
      // If clicking inside the custom-dropdown-item, it already preventDefaults
      // If clicking on the scrollbar, we also need to preventDefault so focus isn't lost
      e.preventDefault();
    });
  }
});
