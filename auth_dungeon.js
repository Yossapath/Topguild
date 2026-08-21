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
    
    // Auto-add to Roster
    if (window.guildRoster && window.saveState) {
        if (!window.guildRoster[j]) window.guildRoster[j] = [];
        window.guildRoster[j].push({ name: u, power: 0, fieldPref: 'any' });
        window.saveState();
        if (typeof window.renderAll === 'function') window.renderAll();
    }
    
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
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  
  const btnAdminUsers = document.getElementById('btnAdminUsers');
  if (btnAdminUsers) btnAdminUsers.style.display = isAdmin ? 'block' : 'none';
  
  const btnAdminCreateAtt = document.getElementById('btnAdminCreateAttendance');
  if (btnAdminCreateAtt) btnAdminCreateAtt.style.display = isAdmin ? 'block' : 'none';

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

window.addDungeonTeam = function(dungeonName, capacity) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
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
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  if (confirm("คุณต้องการลบทีมนี้ใช่หรือไม่?")) {
    dungeonData.teams = dungeonData.teams.filter(x => x.id !== id);
    saveDungeonState();
  }
};

window.updateDungeonTeamName = function(teamId, slotIdx, nameVal) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
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
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
  if (!t.members[slotIdx]) t.members[slotIdx] = { name: '', job: '', power: null };
  t.members[slotIdx].job = jobVal;
  saveDungeonState();
};

window.updateDungeonTeamPower = function(teamId, slotIdx, powerVal) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
  if (!t.members[slotIdx]) t.members[slotIdx] = { name: '', job: '', power: null };
  t.members[slotIdx].power = powerVal === '' ? null : Number(powerVal);
  saveDungeonState();
};

window.clearDungeonSlot = function(teamId, slotIdx) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
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

function renderDungeonPage() {
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  const dc = document.getElementById('dungeonAdminControls');
  if (dc) dc.style.display = isAdmin ? 'flex' : 'none';

  const currentTab = window.currentDungeonTab || 'มายา (Maya)';

  // ---- QUEUE PANEL ----
  const qList = document.getElementById('dqList');
  if (qList) {
    const filteredQueues = dungeonData.queues.filter(q => q.dungeon === currentTab);
    qList.innerHTML = filteredQueues.map(q => {
      const sColor = q.status === 'done' ? 'var(--ok)' : (q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)');
      const sText = q.status === 'done' ? 'สำเร็จ' : (q.status === 'active' ? 'กำลังลงดัน' : 'รอลงดัน');
      const escapedName = window.escapeHtml ? window.escapeHtml(q.name) : q.name;
      
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

      // Draggable queue item (drag to team slot)
      const dragAttr = isAdmin ? `draggable="true" data-queue-name="${escapedName}" data-queue-job="${window.escapeHtml ? window.escapeHtml(q.job) : q.job}" data-queue-power="${q.power || 0}"` : '';
      const dragStyle = isAdmin ? 'cursor:grab;' : '';

      return `
        <div ${dragAttr} style="padding: 10px; border-bottom: 1px solid var(--line); display:flex; flex-direction:column; ${dragStyle}"
          ondragstart="window.onDungeonQueueDragStart(event)">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:var(--text-hi); font-size:14px;">${escapedName}</strong>
              <span style="font-size:11px; color:var(--text-lo); margin-left:6px;">${q.job}</span>
              ${q.power ? `<span style="font-size:11px; color:var(--text-lo);">⚡${Number(q.power).toLocaleString('en-US')}</span>` : ''}
            </div>
            <span style="font-size:11px; padding:2px 6px; border-radius:12px; background:color-mix(in srgb, ${sColor} 15%, transparent); color:${sColor}; font-weight:600;">${sText}</span>
          </div>
          ${adminControls}
        </div>
      `;
    }).join('') || '<div style="padding:16px; text-align:center; color:var(--text-lo); font-size:13px;">ยังไม่มีคิว</div>';
  }

  // ---- TEAMS AREA ----
  const tArea = document.getElementById('dungeonTeamsArea');
  if (!tArea) return;

  const teamsForTab = dungeonData.teams.filter(t => t.type === currentTab);

  if (teamsForTab.length === 0) {
    tArea.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-lo);">
      ${isAdmin ? 'ยังไม่มีทีม กดปุ่มด้านบนเพื่อสร้างทีม' : 'ยังไม่มีทีมในดันเจี้ยนนี้'}
    </div>`;
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

      const escapedName = window.escapeHtml ? window.escapeHtml(memberName) : memberName;
      const jobColor = memberJob && window.JOB_COLORS ? window.JOB_COLORS[memberJob] : '';

      const rowClass = !memberName ? 'empty-row' : '';

      if (isAdmin) {
        mHtml += `
          <tr class="${rowClass}" data-team-id="${t.id}" data-slot="${i}"
            ondragover="event.preventDefault(); this.style.background='var(--blue-100)';"
            ondragleave="this.style.background='';"
            ondrop="window.onDungeonSlotDrop(event, '${t.id}', ${i}); this.style.background='';">
            <td class="cell-rank">${i + 1}</td>
            <td>
              <select class="cell-input name-input ${memberName ? '' : 'empty'}" onchange="updateDungeonTeamName('${t.id}', ${i}, this.value)" style="width:100%; min-width:140px; font-size:14px; padding:6px;">
                ${dungeonNameSelectHtml(memberName, memberJob)}
              </select>
            </td>
            <td>
              <select class="cell-input job-input ${memberJob ? '' : 'empty'}" onchange="updateDungeonTeamJob('${t.id}', ${i}, this.value)" style="--job-color:${jobColor}; width:100%; min-width:120px; font-size:14px; padding:6px; text-align:center;">
                ${dungeonJobSelectHtml(memberJob)}
              </select>
            </td>
            <td class="cell-action">
              <button class="clear-btn" onclick="clearDungeonSlot('${t.id}', ${i})" title="ล้างช่องนี้">✕</button>
            </td>
          </tr>
        `;
      } else {
        mHtml += `
          <tr>
            <td class="cell-rank">${i + 1}</td>
            <td style="padding-left:8px; font-size:14px; color:var(--text-hi);">
              ${memberName ? escapedName : '<i style="color:var(--text-lo)">- ว่าง -</i>'}
            </td>
            <td style="text-align:center; font-size:14px; font-weight:600; color:${jobColor};">${memberJob || '-'}</td>
            <td></td>
          </tr>
        `;
      }
    }

    const pct = filledCount / t.capacity;
    const badgeClass = pct === 1 ? 'ok' : (pct > 0.5 ? 'warn' : '');
    const badgeText = filledCount === t.capacity ? `ครบ ${filledCount}/${t.capacity}` : `ขาด ${t.capacity - filledCount} คน`;

    return `
      <div class="team-card" style="min-width: 420px; max-width: 100%;">
        <div class="team-card-head" style="display:flex; justify-content:space-between; align-items:center; padding:12px;">
          <div class="team-title-group">
            <span style="font-size:16px;">🗡️ ${t.dungeonName}</span>
            <span class="team-power-sum" style="font-size:14px;">⚡ ${totalPower.toLocaleString('en-US')}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="status-badge ${badgeClass}" style="font-size:13px; padding:4px 8px;">${badgeText}</span>
            ${isAdmin ? `<button class="btn-delete-dungeon-team" onclick="deleteDungeonTeam('${t.id}')" style="background:transparent; border:none; color:white; cursor:pointer; font-size:16px;" title="ลบทีม">✕</button>` : ''}
          </div>
        </div>
        <table class="team-table" style="width: 100%; table-layout: auto;">
          <thead><tr><th style="width:30px;">#</th><th>ชื่อ</th><th style="text-align:center;">อาชีพ</th><th style="width:36px;"></th></tr></thead>
          <tbody>${mHtml}</tbody>
        </table>
      </div>
    `;
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
        renderAttendanceOptions();
      }
    });
  } catch(e) {
    console.error(e);
  }
}

async function saveAttendanceState() {
  if (!window.db) return;
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
  
  // Prepare member list from guildRoster to show everyone (or those with stats)
  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(j => {
      allMembers.push(...window.guildRoster[j]);
    });
  }
  
  // If a member has no record, they will have 0/0/0
  let rowsHtml = '';
  let idx = 1;
  allMembers.sort((a,b) => a.name.localeCompare(b.name)).forEach(m => {
    const nameLower = m.name.toLowerCase();
    if (query && !nameLower.includes(query)) return;
    
    const st = statsMap[m.name] || { joined: 0, leave: 0, absent: 0 };
    rowsHtml += '<tr>';
    rowsHtml += '<td class="cell-rank">' + (idx++) + '</td>';
    rowsHtml += '<td>' + (window.escapeHtml ? window.escapeHtml(m.name) : m.name) + '</td>';
    rowsHtml += '<td style="text-align:center; font-weight:600; color:var(--ok);">' + st.joined + '</td>';
    rowsHtml += '<td style="text-align:center; font-weight:600; color:var(--warn);">' + st.leave + '</td>';
    rowsHtml += '<td style="text-align:center; font-weight:600; color:var(--danger);">' + st.absent + '</td>';
    rowsHtml += '</tr>';
  });
  
  if (rowsHtml === '') {
    rowsHtml = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">ไม่พบข้อมูล</td></tr>';
  }
  
  tbody.innerHTML = rowsHtml;
};

window.renderAttendanceTable = function() {
  const select = document.getElementById('attendanceDateSelect');
  const tbody = document.getElementById('attendanceTbody');
  if (!select || !tbody) return;
  
  const selectedDate = select.value;
  if (!selectedDate) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกหรือสร้างวันที่เช็คชื่อ</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
  const btnDelete = document.getElementById('btnDeleteAttendanceDate');
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  if (btnDelete) btnDelete.style.display = (isAdmin && selectedDate) ? 'inline-block' : 'none';
    if (summaryDiv) summaryDiv.innerHTML = '';
    return;
  }
  
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  const records = attendanceData.dates[selectedDate] || {};
  
  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(job => {
      (window.guildRoster[job] || []).forEach(m => {
        allMembers.push({ name: m.name, job, power: m.power });
      });
    });
  }
  
  allMembers.sort((a, b) => (b.power || 0) - (a.power || 0));
  
  const searchInput = document.getElementById('attendanceSearch');
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (searchText) {
    allMembers = allMembers.filter(m => m.name.toLowerCase().includes(searchText));
  }
  
  if (allMembers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">ไม่พบรายชื่อในระบบกิลด์</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
    if (summaryDiv) summaryDiv.innerHTML = '';
    return;
  }

  let html = '';
  let countAttended = 0;
  let countLeave = 0;
  let countAbsent = 0;
  let countNone = 0;
  
  // Store names for event delegation
  const memberNames = allMembers.map(m => m.name);
  
  allMembers.forEach((m, idx) => {
    const name = m.name;
    const status = records[name] || 'none'; 
    const escapedName = window.escapeHtml ? window.escapeHtml(name) : name;
    // Safe name for use in inline JS attributes (escape single quotes)
    const safeName = name.replace(/'/g, "\\'").replace(/\\/g, "\\\\");
    
    if (status === 'attended') countAttended++;
    else if (status === 'leave') countLeave++;
    else if (status === 'absent') countAbsent++;
    else countNone++;
    
    let statusUI = '';
    if (isAdmin) {
      statusUI = `
        <div style="display: flex; justify-content: center; gap: 8px;">
          <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="att_${idx}" onchange="updateAttendanceStatus('${selectedDate}', '${safeName}', 'attended')" ${status === 'attended' ? 'checked' : ''}>
            <span style="color: var(--ok); font-weight: 600; font-size: 13px;">🟢 เข้าร่วม</span>
          </label>
          <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="att_${idx}" onchange="updateAttendanceStatus('${selectedDate}', '${safeName}', 'leave')" ${status === 'leave' ? 'checked' : ''}>
            <span style="color: var(--warn); font-weight: 600; font-size: 13px;">🟡 ลา</span>
          </label>
          <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="att_${idx}" onchange="updateAttendanceStatus('${selectedDate}', '${safeName}', 'absent')" ${status === 'absent' ? 'checked' : ''}>
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
    
    const jobColor = m.job && window.JOB_COLORS ? window.JOB_COLORS[m.job] || '#8fa8bd' : '#8fa8bd';
    
    html += `
      <tr style="border-bottom: 1px solid var(--line);">
        <td style="padding: 10px 16px; color: var(--text-lo);">${idx + 1}</td>
        <td style="padding: 10px 16px; font-weight: 600; color: var(--text-hi);">${escapedName}</td>
        <td style="padding: 10px 16px; text-align: center; font-size: 13px; font-weight: 600; color: ${jobColor};">${m.job || '-'}</td>
        <td style="padding: 10px 16px; text-align: center; color: var(--text-hi); font-size: 13px;">${m.power ? Number(m.power).toLocaleString('en-US') : '-'}</td>
        <td style="padding: 10px 16px;">${statusUI}</td>
      </tr>
    `;
  });
  
  const summaryDiv = document.getElementById('attendanceSummary');
  if (summaryDiv) {
    summaryDiv.innerHTML = `
      <div style="background: var(--bg-soft); padding: 8px 16px; border-radius: 8px; border-left: 4px solid var(--ok); flex: 1; display: flex; flex-direction: column; align-items: center;">
        <span style="font-size: 12px; color: var(--text-lo); font-weight: 600;">เข้าร่วม (Attended)</span>
        <span style="font-size: 18px; font-weight: 700; color: var(--blue-900); font-family: var(--font-display);">${countAttended}</span>
      </div>
      <div style="background: var(--bg-soft); padding: 8px 16px; border-radius: 8px; border-left: 4px solid var(--warn); flex: 1; display: flex; flex-direction: column; align-items: center;">
        <span style="font-size: 12px; color: var(--text-lo); font-weight: 600;">ลา (Leave)</span>
        <span style="font-size: 18px; font-weight: 700; color: var(--blue-900); font-family: var(--font-display);">${countLeave}</span>
      </div>
      <div style="background: var(--bg-soft); padding: 8px 16px; border-radius: 8px; border-left: 4px solid var(--danger); flex: 1; display: flex; flex-direction: column; align-items: center;">
        <span style="font-size: 12px; color: var(--text-lo); font-weight: 600;">ขาด (Absent)</span>
        <span style="font-size: 18px; font-weight: 700; color: var(--blue-900); font-family: var(--font-display);">${countAbsent}</span>
      </div>
      <div style="background: var(--bg-soft); padding: 8px 16px; border-radius: 8px; border-left: 4px solid var(--line); flex: 1; display: flex; flex-direction: column; align-items: center;">
        <span style="font-size: 12px; color: var(--text-lo); font-weight: 600;">ยังไม่เช็คชื่อ</span>
        <span style="font-size: 18px; font-weight: 700; color: var(--blue-900); font-family: var(--font-display);">${countNone}</span>
      </div>
    `;
  }
  
  tbody.innerHTML = html;
};

window.updateAttendanceStatus = function(dateStr, name, status) {
  if (!window.currentUser || window.currentUser.role !== 'admin') return;
  if (!attendanceData.dates[dateStr]) attendanceData.dates[dateStr] = {};
  attendanceData.dates[dateStr][name] = status;
  saveAttendanceState();
};

window.setupAttendanceFirebase = setupAttendanceFirebase;

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

  const btnCreate = document.getElementById('btnCreateDungeonTeam');
  if (btnCreate) {
    const shortName = type.split(' ')[0]; // e.g., 'มายา' from 'มายา (Maya)'
    btnCreate.innerText = '+ สร้างทีม' + shortName;
  }

  window.renderDungeonPage();
};

document.addEventListener('DOMContentLoaded', () => {

  const dqNameInput = document.getElementById('dqName');
  const dqNameDropdown = document.getElementById('dqNameDropdown');
  
  if (dqNameInput && dqNameDropdown) {
    let allMembers = [];
    
    function populateDropdown(filterText = '') {
      if (!window.guildRoster) return;
      allMembers = [];
      Object.keys(window.guildRoster).forEach(job => {
        window.guildRoster[job].forEach(m => {
          allMembers.push({ name: m.name, job: job, power: m.power || 0 });
        });
      });
      
      allMembers.sort((a,b) => b.power - a.power);
      
      let filtered = allMembers;
      if (filterText) {
        const lower = filterText.toLowerCase();
        filtered = allMembers.filter(m => m.name.toLowerCase().includes(lower));
      }
      
      if (filtered.length === 0) {
        dqNameDropdown.innerHTML = '<div style="padding: 10px; text-align:center; color:var(--text-lo); font-size: 13px;">ไม่พบชื่อตัวละคร</div>';
        return;
      }
      
      dqNameDropdown.innerHTML = filtered.map(m => 
        `<div class="custom-dropdown-item" data-name="${window.escapeHtml ? window.escapeHtml(m.name) : m.name}" data-job="${m.job}">
          <strong style="color:var(--blue-700);">${window.escapeHtml ? window.escapeHtml(m.name) : m.name}</strong> 
          <span style="opacity:0.7; font-size:12px;">- ${m.job} (${m.power})</span>
        </div>`
      ).join('');
      
      // Bind clicks
      dqNameDropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
        item.addEventListener('mousedown', (e) => { // mousedown fires before blur
          e.preventDefault(); 
          dqNameInput.value = item.getAttribute('data-name');
          const job = item.getAttribute('data-job');
          const dqClass = document.getElementById('dqClass');
          if (dqClass) dqClass.value = job;
          dqNameDropdown.style.display = 'none';
        });
      });
    }
    
    dqNameInput.addEventListener('focus', () => {
      populateDropdown(dqNameInput.value.trim());
      dqNameDropdown.style.display = 'block';
    });
    
    dqNameInput.addEventListener('input', (e) => {
      populateDropdown(e.target.value.trim());
      dqNameDropdown.style.display = 'block';
      
      // Auto match job if typing exact name
      const val = e.target.value.trim().toLowerCase();
      const exactMatch = allMembers.find(m => m.name.toLowerCase() === val);
      if (exactMatch) {
        const dqClass = document.getElementById('dqClass');
        if (dqClass) dqClass.value = exactMatch.job;
      }
    });
    
    dqNameInput.addEventListener('blur', () => {
      setTimeout(() => { dqNameDropdown.style.display = 'none'; }, 150);
    });
  }

  const dqNameInput = document.getElementById('dqName');
  if (dqNameInput) {
    dqNameInput.addEventListener('change', (e) => {
      const val = e.target.value.trim().toLowerCase();
      if (!val) return;
      if (window.guildRoster) {
        for (let job in window.guildRoster) {
          const found = window.guildRoster[job].find(m => m.name.toLowerCase() === val);
          if (found) {
            const dqClass = document.getElementById('dqClass');
            if (dqClass) dqClass.value = job;
            break;
          }
        }
      }
    });
  }

  const saved = localStorage.getItem('guild_current_user');
  if (saved) {
    try {
      window.currentUser = JSON.parse(saved);
      if (typeof showMainApp === 'function') showMainApp();
      if (typeof applyRolePermissions === 'function') applyRolePermissions();
    } catch(e) {}
  }
});
