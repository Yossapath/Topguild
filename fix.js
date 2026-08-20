const fs = require('fs');
let content = fs.readFileSync('auth_dungeon.js', 'utf8');

const extras = `
window.allAdminUsers = [];

window.renderAdminUsers = function() {
  const listEl = document.getElementById('adminUsersList');
  if (!listEl) return;
  const searchInput = document.getElementById('adminUsersSearch');
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
  
  let html = '';
  window.allAdminUsers.forEach(d => {
    if (searchText && !d.username.toLowerCase().includes(searchText)) return;
    
    const roleColor = d.role === 'admin' ? 'var(--warn)' : 'var(--blue-500)';
    
    let roleSelectHtml = '';
    if (d.username.toLowerCase() !== window.currentUser.username.toLowerCase()) {
      roleSelectHtml = `
        <select onchange="changeUserRole('${d.id}', this.value)" style="font-size: 11px; padding: 2px; border-radius: 4px; border: 1px solid var(--line); margin-left: 4px; background: var(--bg-soft); color: var(--text-hi);">
          <option value="admin" ${d.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="member" ${d.role !== 'admin' ? 'selected' : ''}>Member</option>
        </select>
      `;
    } else {
      roleSelectHtml = `<span style="color: ${roleColor}; font-weight: 600; margin-left: 4px;">Admin</span>`;
    }

    html += `
      <div style="padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; background: white;">
        <div>
          <div style="font-weight: 600; color: var(--text-hi); font-size: 14px;">${window.escapeHtml ? window.escapeHtml(d.username) : d.username}</div>
          <div style="font-size: 12px; color: var(--text-lo); margin-top: 2px;">
            อาชีพ: ${d.class || '-'} <br>
            Role: ${roleSelectHtml}
          </div>
        </div>
        ${d.username.toLowerCase() !== window.currentUser.username.toLowerCase() ? 
          `<button onclick="deleteAccount('${d.id}')" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">ลบ</button>` 
          : '<span style="font-size:12px; color:var(--text-lo);">ไม่<pan>'
        }
      </div>
    `;
  });
  
  listEl.innerHTML = html || '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">ไม่พบข้อมูล</div>';
};

window.changeUserRole = async function(docId, newRole) {
  if (!window.db || !window.currentUser || window.currentUser.role !== 'admin') return;
  try {
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    await updateDoc(doc(window.db, 'users', docId), { role: newRole });
    window.showToast("อัปเดด Role สำเร็จ", "success");
    const user = window.allAdminUsers.find(u => u.id === docId);
    if (user) user.role = newRole;
    window.renderAdminUsers();
  } catch (err) {
    window.showToast("อัปเดด Role ไม่สำเร็จ", "error");
    console.error(err);
  }
};

window.updateUserClass = async function(usernameLower, newClass) {
  if (!window.db) return;
  try {
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    await updateDoc(doc(window.db, 'users', usernameLower), { class: newClass });
    if (window.allAdminUsers) {
      const user = window.allAdminUsers.find(u => u.username.toLowerCase() === usernameLower);
      if (user) {
        user.class = newClass;
        if (window.renderAdminUsers) window.renderAdminUsers();
      }
    }
  } catch (err) {
    console.error("Error updating user class:", err);
  }
};

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
  if (!window.db) { window.showToast("ระบบก฼ลังเชื่อมต่อฐานข้อมูล กรุณารอสักครู่...", "warning"); return; }
  setBtnState(true);
  try {
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const userRef = doc(window.db, 'users', u);
    const snap = await getDoc(userRef);
    if (!snap.exists()) { window.showToast("ไม่พบฟู้เช้งานนี้็นระบบ", "error"); setBtnState(false); return; }
    const data = snap.data();
    if (data.password !== p) { window.showToast("รหัสผ่านไม่ถูกต้อง", "error"); setBtnState(false); return; }
    window.currentUser = { username: data.username, role: data.role || 'member', class: data.class };
    localStorage.setItem('guild_current_user', JSON.stringify(window.currentUser));
    window.showToast(`ยินดีต้อนรับ ${window.currentUser.username}`, "success");
    if (typeof window.showMainApp === 'function') window.showMainApp();
    if (typeof window.applyRolePermissions === 'function') window.applyRolePermissions();
    if (typeof window.renderAll === 'function') window.renderAll();
    setBtnState(false);
  } catch (err) {
    window.showToast("กิดข้อผิดพลาดในการเข้าสู่ระบบ", "error");
    console.error(err);
    setBtnState(false);
  }
};
`;
fs.writeFileSync('auth_dungeon.js', content + '\n' + extras, 'utf8');
