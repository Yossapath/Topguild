const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const targetHtml = `            <div style="font-size: 12px; color: var(--text-lo); margin-top: 2px;">
              อาชีพ: \${d.class || '-'} <br>
              ยศ: <span style="color: \${roleColor}; font-weight: 600;">\${d.role === 'admin' ? 'Admin' : 'Member'}</span>
            </div>`;

const replacementHtml = `            <div style="font-size: 12px; color: var(--text-lo); margin-top: 2px; display: flex; align-items: center; gap: 4px;">
              อาชีพ: \${d.class || '-'} <span style="opacity:0.5">|</span>
              Role: 
              \${d.username.toLowerCase() !== window.currentUser.username.toLowerCase() ? 
                \`<select onchange="updateAccountRole('\${doc.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: \${roleColor}; font-weight: 600; cursor: pointer;">
                  <option value="admin" \${d.role === 'admin' ? 'selected' : ''}>Admin</option>
                  <option value="member" \${d.role === 'member' ? 'selected' : ''}>Member</option>
                </select>\` 
                : \`<span style="color: \${roleColor}; font-weight: 600;">\${d.role === 'admin' ? 'Admin' : 'Member'}</span>\`
              }
            </div>`;

js = js.replace(targetHtml, replacementHtml);

const updateRoleFn = `
window.updateAccountRole = async function(docId, newRole) {
  if (!confirm(\`ยืนยันการเปลี่ยน Role เป็น \${newRole}?\`)) {
    fetchAndRenderUsers();
    return;
  }
  if (!window.db) return;
  try {
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    await updateDoc(doc(window.db, 'users', docId), { role: newRole });
    window.showToast("เปลี่ยน Role สำเร็จ", "success");
    fetchAndRenderUsers();
  } catch (err) {
    console.error(err);
    window.showToast("เกิดข้อผิดพลาดในการเปลี่ยน Role", "error");
  }
};
`;

if (!js.includes('updateAccountRole')) {
  js += '\n' + updateRoleFn;
}

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched Admin Users list with role dropdown');
