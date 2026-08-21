const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Update the top bar UI (uiInfo)
const targetUiInfo = "uiInfo.innerHTML = `👤 ${window.escapeHtml ? window.escapeHtml(window.currentUser.username) : window.currentUser.username} <span style=\"opacity:0.7; margin:0 6px;\">|</span> Role: ${window.currentUser.role === 'admin' ? '👑 Admin' : '🛡️ Member'}`;";
const replaceUiInfo = "uiInfo.innerHTML = `👤 ${window.escapeHtml ? window.escapeHtml(window.currentUser.username) : window.currentUser.username} <span style=\"opacity:0.7; margin:0 6px;\">|</span> Role: ${window.currentUser.role === 'admin' ? '<span style=\"color: #f59e0b; font-weight: 700;\">👑 Admin</span>' : '🛡️ Member'}`;";

// Just to be safe with string formatting issues, we can use regex
js = js.replace(/Role: \$\{window\.currentUser\.role === 'admin' \? '👑 Admin' : '🛡️ Member'\}/, 
  "Role: ${window.currentUser.role === 'admin' ? '<span style=\"color: #f59e0b; font-weight: 700;\">👑 Admin</span>' : '🛡️ Member'}");

// 2. Update the roleColor variable in fetchAndRenderUsers
js = js.replace("const roleColor = d.role === 'admin' ? 'var(--warn)' : 'var(--blue-500)';", 
                "const roleColor = d.role === 'admin' ? '#f59e0b' : 'var(--blue-500)';");

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched Admin Color');
