const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

const search = `<td style="width: 40px; text-align: center; color:var(--text-lo); font-size:12px;">\${i+1}</td>`;
const replace = `<td style="width: 50px; text-align: center; color:var(--text-lo); font-size:12px;">
            <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
              \${isAdmin && a && a.name ? \`<div draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)" style="cursor:grab; opacity:0.4; display:flex; align-items:center;" title="ลากเพื่อสลับผู้เล่น"><svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>\` : \`<div style="width:12px;"></div>\`}
              <span>\${i+1}</span>
            </div>
          </td>`;
          
if (html.includes(search)) {
    html = html.replace(search, replace);
    fs.writeFileSync('app.js', html);
    console.log('Fixed offline TD');
} else {
    console.log('Could not find offline TD');
}
