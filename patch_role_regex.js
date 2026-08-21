const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const targetRegex = /อาชีพ: \$\{d\.class \|\| '-'} <br>\s*ยศ: <span style="color: \$\{roleColor}; font-weight: 600;">\$\{d\.role === 'admin' \? 'Admin' : 'Member'}<\/span>/;

const replacement = `อาชีพ: \${d.class || '-'} <span style="opacity:0.5; margin:0 4px;">|</span> Role: 
              \${d.username.toLowerCase() !== window.currentUser.username.toLowerCase() ? 
                \`<select onchange="updateAccountRole('\${doc.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: \${roleColor}; font-weight: 600; cursor: pointer;">
                  <option value="admin" \${d.role === 'admin' ? 'selected' : ''}>Admin</option>
                  <option value="member" \${d.role === 'member' ? 'selected' : ''}>Member</option>
                </select>\` 
                : \`<span style="color: \${roleColor}; font-weight: 600;">\${d.role === 'admin' ? 'Admin' : 'Member'}</span>\`
              }`;

js = js.replace(targetRegex, replacement);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched with Regex');
