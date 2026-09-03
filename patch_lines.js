const fs = require('fs');
let lines = fs.readFileSync('app.js', 'utf8').split('\n');

// Lines 836-855 (0-indexed: 835-854) is the rows.push block
// Replace them
const newMainRows = [
  `      rows.push(\`\r`,
  `        <tr class="\${rowClass}" data-slot-key="\${key}">\r`,
  `          <td class="cell-rank" style="position:relative; white-space:nowrap;">\r`,
  `            \${isAdmin && a && a.name\r`,
  `              ? \`<span class="slot-drag-handle" draggable="true"\r`,
  `                   ondragstart="window.onSlotHandleDragStart(event, '\${key}')"\r`,
  `                   ondragend="window.onSlotHandleDragEnd(event)"\r`,
  `                   title="ลากเพื่อสลับผู้เล่น">⠿</span>\`\r`,
  `              : \`<span style="display:inline-block;width:14px;"></span>\`}\r`,
  `            \${i + 1}\r`,
  `          </td>\r`,
  `          <td>\r`,
  `            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์/คลิก..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>\r`,
  `          </td>\r`,
  `          <td>\r`,
  `            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>\r`,
  `              \${jobSelectHtml(key, job)}\r`,
  `            </select>\r`,
  `          </td>\r`,
  `          <td><input class="cell-input power-input" type="number" data-slot="\${key}" value="\${a && a.power != null ? a.power : ''}" placeholder="-"></td>\r`,
  `          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>\r`,
  `        </tr>\`);`,
];

// Replace lines 836-855 (1-indexed), which is indices 835-854 (0-indexed)
lines.splice(835, 20, ...newMainRows);
console.log('[OK] Replaced main field rows (lines 836-855)');

// Now find offline rows
const offlineIdx = lines.findIndex(l => l.includes("htmlRows += `"));
console.log('htmlRows at:', offlineIdx + 1);

// Print lines around it
for (let i = offlineIdx; i < offlineIdx + 22; i++) {
  console.log(i+1, JSON.stringify(lines[i]));
}
fs.writeFileSync('app.js', lines.join('\n'));
