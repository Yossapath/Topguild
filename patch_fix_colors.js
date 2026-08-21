const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// ==========================================
// 1. Fix Admin Users Sidebar (Sorting, Searching, Color)
// ==========================================

// We need to add a global array to store users for searching
if (!code.includes('let cachedAdminUsers = [];')) {
  const replaceTarget = "async function fetchAndRenderUsers() {";
  const newFunc = `let cachedAdminUsers = [];
  
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
    filtered.forEach(d => {
      const isMe = d.username.toLowerCase() === window.currentUser.username.toLowerCase();
      // สีเหลืองสำหรับ admin
      const roleColor = d.role === 'admin' ? '#eab308' : 'var(--blue-500)';
      html += \`<div style="padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 600; color: var(--text-hi); font-size: 14px;">\${window.escapeHtml ? window.escapeHtml(d.username) : d.username}</div>
          <div style="font-size: 12px; color: var(--text-lo); margin-top: 2px; display: flex; align-items: center; gap: 6px;">
            <span>อาชีพ: \${d.class || '-'}</span> 
            <span style="opacity:0.3;">|</span> 
            <span>Role:</span>
            \${!isMe ? 
              \`<select onchange="updateAccountRole('\${d.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: \${this.value==='admin'||d.role==='admin' ? '#eab308' : 'var(--blue-500)'}; font-weight: 600; cursor: pointer;">
                <option value="admin" \${d.role === 'admin' ? 'selected' : ''} style="color:#eab308">Admin</option>
                <option value="member" \${d.role === 'member' ? 'selected' : ''} style="color:var(--blue-500)">Member</option>
              </select>\` 
              : \`<span style="color: \${roleColor}; font-weight: 600;">\${d.role === 'admin' ? 'Admin' : 'Member'}</span>\`
            }
          </div>
        </div>
        \${!isMe ? 
          \`<button onclick="deleteAccount('\${d.id}')" style="background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger); padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">ลบ</button>\` 
          : '<span style="font-size:12px; color:var(--text-lo);">คุณ</span>'
        }
      </div>\`;
    });
    listEl.innerHTML = html;
  };
  
  async function fetchAndRenderUsers() {`;
  
  code = code.replace(replaceTarget, newFunc);
  
  // Replace the inner part of fetchAndRenderUsers
  const fetchInner = `const snap = await getDocs(collection(window.db, 'users'));
      let html = '';
      snap.forEach(doc => {
        const d = doc.data();
        const roleColor = d.role === 'admin' ? '#f59e0b' : 'var(--blue-500)';`;
        
  const newFetchInner = `const snap = await getDocs(collection(window.db, 'users'));
      cachedAdminUsers = [];
      snap.forEach(doc => {
        let d = doc.data();
        d.id = doc.id;
        cachedAdminUsers.push(d);
      });
      // Sort: Admin first, then by name
      cachedAdminUsers.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return a.username.localeCompare(b.username);
      });
      window.renderAdminUsers();`;
      
  // Find where snap.forEach ends
  const startIdx = code.indexOf(`const snap = await getDocs(collection(window.db, 'users'));`);
  const endIdx = code.indexOf(`listEl.innerHTML = html;`, startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + newFetchInner + code.substring(endIdx + `listEl.innerHTML = html;`.length);
  }
}

// ==========================================
// 2. Fix Job Colors in Dungeon Queue & Team Select
// ==========================================

// A) Queue Panel
code = code.replace(
  /<span style="font-size:11px;color:var\(--text-lo\);margin-left:6px;">\$\{q\.job \|\| ''\}<\/span>/g,
  `<span style="font-size:11px;color:\${q.job && window.JOB_COLORS && window.JOB_COLORS[q.job] ? window.JOB_COLORS[q.job] : 'var(--text-lo)'};margin-left:6px;font-weight:600;">\${q.job || ''}</span>`
);

// B) Team Select
code = code.replace(
  /<select class="cell-input job-input \$\{memberJob \? '' : 'empty'\}"\s*onchange="updateDungeonTeamJob\('\$\{t\.id\}',\$\{i\},this\.value\)"\s*style="width:100%;min-width:120px;font-size:14px;padding:6px;">/g,
  `<select class="cell-input job-input \${memberJob ? '' : 'empty'}" onchange="updateDungeonTeamJob('\${t.id}',\${i},this.value)" style="width:100%;min-width:120px;font-size:14px;padding:6px;color:\${jobColor};font-weight:600;">`
);


// ==========================================
// 3. Fix Job Colors in Attendance Table
// ==========================================
const attendanceJobTarget = `<td style="font-size:13px; color:var(--text-lo); text-align:center;">\${escapedJob}</td>`;
const attendanceJobReplace = `\const jColor = window.JOB_COLORS && window.JOB_COLORS[job] ? window.JOB_COLORS[job] : 'var(--text-hi)';
         html += \`
         <tr data-name="\${escapedName}">
           <td class="cell-rank" style="width:30px;">\${i+1}</td>
           <td style="font-weight:600; font-size:14px; padding:6px 12px; color:var(--text-hi);">\${escapedName}</td>
           <td style="font-size:13px; color:\${jColor}; text-align:center; font-weight:600;">\${escapedJob}</td>\`;`;
           
code = code.replace(
  /html \+= `\s*<tr data-name="\$\{escapedName\}">\s*<td class="cell-rank" style="width:30px;">\$\{i\+1\}<\/td>\s*<td style="font-weight:600; font-size:14px; padding:6px 12px; color:var\(--text-hi\);">\$\{escapedName\}<\/td>\s*<td style="font-size:13px; color:var\(--text-lo\); text-align:center;">\$\{escapedJob\}<\/td>/,
  attendanceJobReplace
);

// Fix renderAttendanceStats colors
const statsJobTarget = `<td style="font-size:13px; color:var(--text-lo); text-align:center;">\${jobStr}</td>`;
const statsJobReplace = `\const jColor = window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : 'var(--text-hi)';
        html += \`
        <tr>
          <td class="cell-rank">\${i+1}</td>
          <td style="font-weight:600; font-size:14px; color:var(--text-hi);">\${nameStr}</td>
          <td style="font-size:13px; color:\${jColor}; text-align:center; font-weight:600;">\${jobStr}</td>\`;`;

code = code.replace(
  /html \+= `\s*<tr>\s*<td class="cell-rank">\$\{i\+1\}<\/td>\s*<td style="font-weight:600; font-size:14px; color:var\(--text-hi\);">\$\{nameStr\}<\/td>\s*<td style="font-size:13px; color:var\(--text-lo\); text-align:center;">\$\{jobStr\}<\/td>/,
  statsJobReplace
);

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('Fixed auth_dungeon.js');
