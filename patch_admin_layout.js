const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const targetHtml = `<div style="padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
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
          </div>`;

const replaceHtml = `<div style="padding: 10px; border: 1px solid var(--line); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: var(--text-hi); font-size: 14px;">\${window.escapeHtml ? window.escapeHtml(d.username) : d.username}</div>
            <div style="font-size: 12px; color: var(--text-lo); margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
              <div>อาชีพ: <span style="font-weight: 500; color: \${window.JOB_COLORS && window.JOB_COLORS[d.class] ? window.JOB_COLORS[d.class] : 'var(--text-hi)'}">\${d.class || '-'}</span></div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span>Role:</span>
                \${!isMe ? 
                  \`<select onchange="updateAccountRole('\${d.id}', this.value)" style="font-size: 11px; padding: 1px 4px; border-radius: 4px; border: 1px solid var(--line); background: var(--bg-soft); color: \${d.role==='admin' ? '#eab308' : 'var(--blue-500)'}; font-weight: 600; cursor: pointer; width: auto; min-width: 70px;">
                    <option value="admin" \${d.role === 'admin' ? 'selected' : ''} style="color:#eab308">Admin</option>
                    <option value="member" \${d.role === 'member' ? 'selected' : ''} style="color:var(--blue-500)">Member</option>
                  </select>\` 
                  : \`<span style="color: \${roleColor}; font-weight: 600;">\${d.role === 'admin' ? 'Admin' : 'Member'}</span>\`
                }
              </div>
            </div>
          </div>`;

if (code.includes(targetHtml)) {
  code = code.replace(targetHtml, replaceHtml);
  console.log('Replaced Admin Users HTML layout');
} else {
  console.log('Target HTML not found!');
  
  // Let's try replacing with a regex in case spaces are slightly different
  const regex = /<div style="padding: 10px; border: 1px solid var\(--line\);.*?<div style="font-weight: 600; color: var\(--text-hi\); font-size: 14px;">\$\{window\.escapeHtml \? window\.escapeHtml\(d\.username\) : d\.username\}<\/div>.*?<\/div>\s*<\/div>/s;
  if (regex.test(code)) {
    code = code.replace(regex, replaceHtml);
    console.log('Replaced Admin Users HTML using regex');
  } else {
    console.log('Regex also failed');
  }
}

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
