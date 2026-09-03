const fs = require('fs');
let lines = fs.readFileSync('app.js', 'utf8').split('\n');

// Offline rows at lines 908-925 (1-indexed), indices 907-924 (0-indexed)
const newOfflineRows = [
  `        htmlRows += \`\r`,
  `        <tr data-slot-key="\${key}">\r`,
  `          <td style="width: 50px; text-align: center; color:var(--text-lo); font-size:12px; position:relative; white-space:nowrap;">\r`,
  `            \${isAdmin && a && a.name\r`,
  `              ? \`<span class="slot-drag-handle" draggable="true"\r`,
  `                   ondragstart="window.onSlotHandleDragStart(event, '\${key}')"\r`,
  `                   ondragend="window.onSlotHandleDragEnd(event)"\r`,
  `                   title="ลากเพื่อสลับผู้เล่น">⠿</span>\`\r`,
  `              : \`<span style="display:inline-block;width:14px;"></span>\`}\r`,
  `            \${i+1}\r`,
  `          </td>\r`,
  `          <td>\r`,
  `            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>\r`,
  `          </td>\r`,
  `          <td style="width: 150px;">\r`,
  `            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>\r`,
  `              \${jobSelectHtml(key, job)}\r`,
  `            </select>\r`,
  `          </td>\r`,
  `          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>\r`,
  `        </tr>\`;`,
];

// indices 907-924 (0-indexed)
lines.splice(907, 18, ...newOfflineRows);
console.log('[OK] Replaced offline rows');

fs.writeFileSync('app.js', lines.join('\n'));
