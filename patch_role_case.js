const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const targetStr = `            <div style="font-size: 12px; color: var(--text-lo); margin-top: 2px; display: flex; align-items: center; gap: 4px;">
              อาชีพ: \${d.class || '-'} <span style="opacity:0.5; margin:0 4px;">|</span> Role: 
              \${d.username.toLowerCase() !== window.currentUser.username.toLowerCase() ? 
                \`<select onchange="updateAccountRole('\${doc.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: \${roleColor}; font-weight: 600; cursor: pointer;">
                  <option value="admin" \${d.role === 'admin' ? 'selected' : ''}>Admin</option>
                  <option value="member" \${d.role === 'member' ? 'selected' : ''}>Member</option>
                </select>\` 
                : \`<span style="color: \${roleColor}; font-weight: 600;">\${d.role === 'admin' ? 'Admin' : 'Member'}</span>\`
              }
            </div>`;

const replacementStr = `            <div style="font-size: 12px; color: var(--text-lo); margin-top: 2px; display: flex; align-items: center; gap: 4px;">
              อาชีพ: \${d.class || '-'} <span style="opacity:0.5; margin:0 4px;">|</span> Role: 
              \${d.username.toLowerCase() !== window.currentUser.username.toLowerCase() ? 
                \`<select onchange="updateAccountRole('\${doc.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: \${(d.role || '').toLowerCase() === 'admin' ? '#f59e0b' : 'var(--blue-500)'}; font-weight: 600; cursor: pointer;">
                  <option value="admin" \${(d.role || '').toLowerCase() === 'admin' ? 'selected' : ''}>Admin</option>
                  <option value="member" \${(d.role || '').toLowerCase() === 'member' ? 'selected' : ''}>Member</option>
                </select>\` 
                : \`<span style="color: \${(d.role || '').toLowerCase() === 'admin' ? '#f59e0b' : 'var(--blue-500)'}; font-weight: 600;">\${(d.role || '').toLowerCase() === 'admin' ? 'Admin' : 'Member'}</span>\`
              }
            </div>`;

js = js.replace(targetStr, replacementStr);
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched case insensitivity for role');
