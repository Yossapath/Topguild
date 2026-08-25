import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

(async function initAuthModule() {
try {

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
        const snap = await getDoc(doc(window.db, 'users', window.currentUser.username?.toLowerCase()));
        if (snap.exists()) {
          window.currentUser.role = snap.data().role || 'member';
          delete window.currentUser.password;
          localStorage.setItem("guild_current_user", JSON.stringify(window.currentUser));
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

// ==========================================
// ====== HANDLE LOGIN ======
// ==========================================
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

  if (!u || !p) {
    window.showToast("กรุณากรอก Username และ Password", "warning");
    return;
  }

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
      await window.UI.alert("รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        window.showToast("รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง", "error");
      setBtnState(false);
      return;
    }

    window.currentUser = { username: data.username, role: data.role || 'member', class: data.class };
    delete window.currentUser.password;
    localStorage.setItem("guild_current_user", JSON.stringify(window.currentUser));
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

// ==========================================
// ====== HANDLE REGISTER ======
// ==========================================
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
      await window.UI.alert("สมัครล้มเหลว: Username นี้มีคนใช้งานแล้ว!");
        window.showToast("Username นี้ถูกใช้งานแล้ว", "error");
      return;
    }

    await setDoc(userRef, {
      username: u,
      class: j,
      password: p,
      role: 'member'
    });

    await window.UI.alert("สมัครสมาชิกสำเร็จ! กำลังพากลับไปยังหน้าเข้าสู่ระบบ");
      window.showToast("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ", "success");
    document.getElementById('regUsername').value = '';
    document.getElementById('regJob').value = '';
    document.getElementById('regPassword').value = '';
    if (typeof window.toggleAuthMode === 'function') {
      window.toggleAuthMode('login');
    }
  } catch (err) {
    await window.UI.alert("เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่");
      window.showToast("เกิดข้อผิดพลาดในการสมัครสมาชิก", "error");
    console.error(err);
  }
};

// ==========================================
// ====== HANDLE LOGOUT ======
// ==========================================
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

// ==========================================
// ====== ROLE PERMISSIONS ======
// ==========================================
function applyRolePermissions() {
  const isAdmin = window.isUserAdmin();

  const btnAdminUsers = document.getElementById('btnAdminUsers');
  if (btnAdminUsers) btnAdminUsers.style.display = isAdmin ? 'block' : 'none';

  const tabLogs = document.getElementById('tabLogs');
  if (tabLogs) tabLogs.style.display = isAdmin ? 'inline-block' : 'none';

  const btnAdminCreateAtt = document.getElementById('btnAdminCreateAttendance');
  if (btnAdminCreateAtt) btnAdminCreateAtt.style.display = isAdmin ? 'block' : 'none';

  const btnAdminAutoAtt = document.getElementById('btnAdminAutoAttendance');
  if (btnAdminAutoAtt) btnAdminAutoAtt.style.display = isAdmin ? 'block' : 'none';

  const tabSettings = document.getElementById('tabSettings');
  if (tabSettings) tabSettings.style.display = isAdmin ? 'inline-block' : 'none';
  
  const tabArchive = document.getElementById('tabArchive');
  if (tabArchive) tabArchive.style.display = isAdmin ? 'inline-block' : 'none';

  const clearBtn = document.getElementById('btnClearCurrentFieldTeamsBtn');
  if (clearBtn) clearBtn.style.display = isAdmin ? 'block' : 'none';

  const addTeamBtn = document.getElementById('btnAddTeamBtn');
  if (addTeamBtn) addTeamBtn.style.display = isAdmin ? 'block' : 'none';

  const rmTeamBtn = document.getElementById('btnRemoveTeamBtn');
  if (rmTeamBtn) rmTeamBtn.style.display = isAdmin ? 'block' : 'none';
}

// ==========================================
// ====== ADMIN SIDEBAR ======
// ==========================================
window.openAdminUsersSidebar = async function() {
  const sidebar = document.getElementById('adminUsersSidebar');
  const overlay = document.getElementById('adminUsersOverlay');
  if (!sidebar || !overlay) {
    window.showToast('ไม่พบหน้าจัดการผู้ใช้', 'error');
    return;
  }
  sidebar.style.left = '0';
  overlay.style.display = 'block';
  setTimeout(() => overlay.style.opacity = '1', 10);
  await fetchAndRenderUsers();
};

window.closeAdminUsersSidebar = function() {
  const sidebar = document.getElementById('adminUsersSidebar');
  const overlay = document.getElementById('adminUsersOverlay');
  if (sidebar) sidebar.style.left = '-320px';
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
  }
};

// ==========================================
// ====== RENDER USERS LIST ======
// ==========================================
let cachedAdminUsers = [];

window.renderAdminUsers = function() {
  const listEl = document.getElementById('adminUsersList');
  if (!listEl) return;

  const searchInput = document.getElementById('adminUsersSearch');
  const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let filtered = cachedAdminUsers;
  if (term) {
    filtered = filtered.filter(d => d.username && d.username?.toLowerCase()?.includes(term));
  }

  if (filtered.length === 0) {
    listEl.innerHTML = '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">ไม่พบผู้ใช้ที่ค้นหา</div>';
    return;
  }

  let html = '';
  let lastRole = null;

  filtered.forEach((d, index) => {
    const isMe = window.currentUser && d.username && d.username?.toLowerCase() === window.currentUser.username?.toLowerCase();
    const role = (d.role || 'member').toLowerCase();
    const roleColor = role === 'admin' ? '#eab308' : 'var(--blue-500)';

    if (lastRole === 'admin' && role !== 'admin') {
      html += `<div style="display:flex; align-items:center; margin: 16px 0; opacity: 0.5;">
        <div style="flex:1; height:1px; background:var(--line);"></div>
        <div style="padding: 0 10px; font-size: 11px; font-weight:600; color:var(--text-lo); text-transform:uppercase;">Member</div>
        <div style="flex:1; height:1px; background:var(--line);"></div>
      </div>`;
    }
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
          <div>อาชีพ: <span style="font-weight: 500; color: ${window.JOB_COLORS && window.JOB_COLORS[d.class] ? window.JOB_COLORS[d.class] : 'var(--text-hi)'};">${d.class || '-'}</span></div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>Role:</span>
            ${!isMe
              ? `<select onchange="window.updateAccountRole('${d.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: ${role==='admin' ? '#eab308' : 'var(--blue-500)'}; font-weight: 600; cursor: pointer; width: auto; min-width: 70px;">
                  <option value="admin" ${role === 'admin' ? 'selected' : ''} style="color:#eab308">Admin</option>
                  <option value="member" ${role === 'member' ? 'selected' : ''} style="color:var(--blue-500)">Member</option>
                </select>`
              : `<span style="color: ${roleColor}; font-weight: 600;">${role === 'admin' ? 'Admin' : 'Member'}</span>`
            }
          </div>
        </div>
      </div>
      ${!isMe
        ? `<button onclick="window.deleteAccount('${d.id}')" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">ลบ</button>`
        : '<span style="font-size:12px; color:var(--text-lo); margin-top:4px;">คุณ</span>'
      }
    </div>`;
  });
  listEl.innerHTML = html;
};

// ==========================================
// ====== FETCH USERS FROM DB ======
// ==========================================
async function fetchAndRenderUsers() {
  if (!window.db || !window.currentUser || !window.isUserAdmin()) {
    const listEl = document.getElementById('adminUsersList');
    if (listEl) listEl.innerHTML = '<div style="text-align:center; color:var(--danger); margin-top:20px;">ไม่มีสิทธิ์เข้าถึง</div>';
    return;
  }
  const listEl = document.getElementById('adminUsersList');
  if (listEl) listEl.innerHTML = '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">กำลังโหลด...</div>';

  try {
    const snap = await getDocs(collection(window.db, 'users'));
    cachedAdminUsers = [];
    snap.forEach(docSnap => {
      let d = docSnap.data();
      d.id = docSnap.id;
      cachedAdminUsers.push(d);
    });
    cachedAdminUsers.sort((a, b) => {
      const rA = (a.role || 'member').toLowerCase();
      const rB = (b.role || 'member').toLowerCase();
      if (rA === 'admin' && rB !== 'admin') return -1;
      if (rA !== 'admin' && rB === 'admin') return 1;
      return (a.username || '').localeCompare(b.username || '');
    });
    if (typeof window.renderAdminUsers === 'function') {
      window.renderAdminUsers();
    }
  } catch (err) {
    console.error(err);
    if (listEl) listEl.innerHTML = '<div style="text-align: center; color: var(--danger); margin-top: 20px;">เกิดข้อผิดพลาด</div>';
  }
}

window.updateAccountRole = async function(docId, newRole) {
  if (!window.db || !window.currentUser || !window.isUserAdmin()) {
    return window.showToast('ไม่มีสิทธิ์เปลี่ยน Role', 'error');
  }
  try {
    const ref = doc(window.db, 'users', docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    data.role = newRole;
    await setDoc(ref, data);
    window.showToast('เปลี่ยน Role สำเร็จ', 'success');
    await fetchAndRenderUsers();
  } catch(e) {
    console.error(e);
    window.showToast('เกิดข้อผิดพลาด', 'error');
  }
};

window.deleteAccount = async function(docId) {
  if (!await window.UI.confirm('ยืนยันการลบบัญชีผู้ใช้นี้? จะไม่สามารถกู้คืนได้')) return;
  if (!window.db) return;
  try {
    await deleteDoc(doc(window.db, 'users', docId));
    window.showToast("ลบบัญชีสำเร็จ", "success");
    await fetchAndRenderUsers();
  } catch (err) {
    console.error(err);
    window.showToast("เกิดข้อผิดพลาดในการลบ", "error");
  }
};

// ==========================================
// ====== GLOBAL DROPDOWN (Autocomplete) ======
// ==========================================
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

    if (action === 'mainField') {
      const slotKey = inputEl.getAttribute('data-slot');
      const requiredJob = window.rowJobFilter ? window.rowJobFilter[slotKey] : '';
      allMembers = allMembers.filter(m => {
        if (requiredJob && m.job !== requiredJob) return false;
        const lowerName = m.name?.toLowerCase();
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
      if (window.dungeonData && window.dungeonData.teams) {
        window.dungeonData.teams.forEach(t => {
          if (t.type === currentTab && t.members) {
            t.members.forEach((m, idx) => {
              if (m && m.name) {
                if (t.id === teamId && idx === slotIdx) return;
                inUseNames.add(m.name?.toLowerCase());
              }
            });
          }
        });
      }
      allMembers = allMembers.filter(m => !inUseNames.has(m.name?.toLowerCase()));
    }

    const val = filterText.toLowerCase();
    const filtered = allMembers.filter(m => m.name?.toLowerCase()?.includes(val));

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
            window.activeAutocompleteInput.value = newName; window.activeAutocompleteInput.blur();
            const act = window.activeAutocompleteInput.getAttribute('data-action');
            if (act === 'mainField') {
              const slot = window.activeAutocompleteInput.getAttribute('data-slot');
              if (typeof handleNameChange === 'function') handleNameChange(slot, newName);
            } else if (act === 'dungeonTeam') {
              const tid = window.activeAutocompleteInput.getAttribute('data-team-id');
              const sidx = window.activeAutocompleteInput.getAttribute('data-slot-idx');
              if (typeof updateDungeonTeamName === 'function') updateDungeonTeamName(tid, parseInt(sidx), newName);
            } else if (act === 'leaveForm') {
              const job = item.getAttribute('data-job');
              const leaveJob = document.getElementById('leaveJob');
              if (leaveJob) leaveJob.value = job;
            } else if (act === 'dungeonQueue') {
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

// Close dropdown on click outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
}, true);

// ==========================================
// ====== GLOBAL EXPORTS ======
// ==========================================
window.ensureDefaultAdmin = ensureDefaultAdmin;
window.checkAuth = checkAuth;
window.fetchAndRenderUsers = fetchAndRenderUsers;
window.showGlobalDropdown = showGlobalDropdown;
window.applyRolePermissions = applyRolePermissions;

} catch(err) { console.error('[Module Auth] Error:', err); }
})();
