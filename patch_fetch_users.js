const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const oldFetchAndRender = `async function fetchAndRenderUsers() {
    if (!window.db || !window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
    const listEl = document.getElementById('adminUsersList');
    listEl.innerHTML = '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">กำลังโหลด...</div>';
    
    try {
      const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const snap = await getDocs(collection(window.db, 'users'));
      let html = '';
      snap.forEach(doc => {
        const d = doc.data();
        const roleColor = d.role === 'admin' ? '#f59e0b' : 'var(--blue-500)';
        html += \`
          <div style="padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: var(--text-hi); font-size: 14px;">\${window.escapeHtml ? window.escapeHtml(d.username) : d.username}</div>
              <div style="font-size: 12px; color: var(--text-lo); margin-top: 2px;">
                อาชีพ: \${d.class || '-'} <span style="opacity:0.5; margin:0 4px;">|</span> Role: 
                \${d.username.toLowerCase() !== window.currentUser.username.toLowerCase() ? 
                  \`<select onchange="updateAccountRole('\${doc.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: \${roleColor}; font-weight: 600; cursor: pointer;">
                    <option value="admin" \${d.role === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="member" \${d.role === 'member' ? 'selected' : ''}>Member</option>
                  </select>\` 
                  : \`<span style="color: \${roleColor}; font-weight: 600;">\${d.role === 'admin' ? 'Admin' : 'Member'}</span>\`
                }
              </div>
            </div>
            \${d.username.toLowerCase() !== window.currentUser.username.toLowerCase() ? 
              \`<button onclick="deleteAccount('\${doc.id}')" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">ลบ</button>\` 
              : '<span style="font-size:12px; color:var(--text-lo);">คุณ</span>'
            }
          </div>
        \`;
      });
      listEl.innerHTML = html || '<div style="text-align: center; color: var(--text-lo); margin-top: 20px;">ไม่พบข้อมูล</div>';
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<div style="text-align: center; color: var(--danger); margin-top: 20px;">เกิดข้อผิดพลาด</div>';
    }
  }`;

const newFetchAndRender = `async function fetchAndRenderUsers() {
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
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return (a.username || '').localeCompare(b.username || '');
      });
      if (typeof window.renderAdminUsers === 'function') {
        window.renderAdminUsers();
      }
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<div style="text-align: center; color: var(--danger); margin-top: 20px;">เกิดข้อผิดพลาด</div>';
    }
  }`;

const start = code.indexOf('async function fetchAndRenderUsers() {');
const end = code.indexOf('}', code.indexOf('listEl.innerHTML = \'<div style="text-align: center; color: var(--danger); margin-top: 20px;">เกิดข้อผิดพลาด</div>\';')) + 1;

if (start !== -1 && end !== -1) {
  code = code.substring(0, start) + newFetchAndRender + code.substring(end);
  fs.writeFileSync('auth_dungeon.js', code, 'utf8');
  console.log('Fixed fetchAndRenderUsers');
} else {
  console.log('Could not find fetchAndRenderUsers correctly via indexOf');
}
