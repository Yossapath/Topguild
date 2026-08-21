const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const sIdx = code.indexOf('window.renderAdminUsers = function() {');
const endStr = 'listEl.innerHTML = html;\n  };';
const eIdx = code.indexOf(endStr, sIdx) + endStr.length;

if (sIdx !== -1 && eIdx > sIdx) {
  const newRenderFunc = `window.renderAdminUsers = function() {
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
        html += \`<div style="display:flex; align-items:center; margin: 16px 0; opacity: 0.5;">
          <div style="flex:1; height:1px; background:var(--line);"></div>
          <div style="padding: 0 10px; font-size: 11px; font-weight:600; color:var(--text-lo); text-transform:uppercase;">Member</div>
          <div style="flex:1; height:1px; background:var(--line);"></div>
        </div>\`;
      }
      // Add Admin title for the first admin
      if (index === 0 && role === 'admin') {
        html += \`<div style="display:flex; align-items:center; margin: 0 0 12px 0; opacity: 0.8;">
          <div style="flex:1; height:1px; background:var(--line);"></div>
          <div style="padding: 0 10px; font-size: 11px; font-weight:700; color:#eab308; text-transform:uppercase;">Admin</div>
          <div style="flex:1; height:1px; background:var(--line);"></div>
        </div>\`;
      }
      
      lastRole = role;

      html += \`<div style="padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: var(--text-hi); font-size: 14px;">\${window.escapeHtml ? window.escapeHtml(d.username) : d.username}</div>
          <div style="font-size: 12px; color: var(--text-lo); margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
            <div>อาชีพ: <span style="font-weight: 500; color: \${window.JOB_COLORS && window.JOB_COLORS[d.class] ? window.JOB_COLORS[d.class] : 'var(--text-hi)'}">\${d.class || '-'}</span></div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>Role:</span>
              \${!isMe ? 
                \`<select onchange="updateAccountRole('\${d.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: \${role==='admin' ? '#eab308' : 'var(--blue-500)'}; font-weight: 600; cursor: pointer; width: auto; min-width: 70px;">
                  <option value="admin" \${role === 'admin' ? 'selected' : ''} style="color:#eab308">Admin</option>
                  <option value="member" \${role === 'member' ? 'selected' : ''} style="color:var(--blue-500)">Member</option>
                </select>\` 
                : \`<span style="color: \${roleColor}; font-weight: 600;">\${role === 'admin' ? 'Admin' : 'Member'}</span>\`
              }
            </div>
          </div>
        </div>
        \${!isMe ? 
          \`<button onclick="deleteAccount('\${d.id}')" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">ลบ</button>\` 
          : '<span style="font-size:12px; color:var(--text-lo); margin-top:4px;">คุณ</span>'
        }
      </div>\`;
    });
    listEl.innerHTML = html;
  };`;

  code = code.substring(0, sIdx) + newRenderFunc + code.substring(eIdx);
  console.log('Replaced renderAdminUsers!');
} else {
  console.log('Failed to find start/end of renderAdminUsers');
}

const fetchTarget = `cachedAdminUsers.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return (a.username || '').localeCompare(b.username || '');
      });`;
      
const fetchReplace = `cachedAdminUsers.sort((a, b) => {
        const rA = (a.role || 'member').toLowerCase();
        const rB = (b.role || 'member').toLowerCase();
        if (rA === 'admin' && rB !== 'admin') return -1;
        if (rA !== 'admin' && rB === 'admin') return 1;
        return (a.username || '').localeCompare(b.username || '');
      });`;

if (code.includes(fetchTarget)) {
  code = code.replace(fetchTarget, fetchReplace);
  console.log('Replaced fetch logic!');
}

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
