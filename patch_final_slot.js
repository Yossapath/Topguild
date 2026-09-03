/**
 * CLEAN REBUILD: Player slot drag-and-drop
 * Strategy:
 *  1. Replace lines 836-854 (the rows.push HTML) with a clean draggable TR version.
 *  2. Replace lines 2903-2945 (onSlotDragStart, onSlotDragEnd, onSlotDragOver, onSlotDragLeave) with new clean JS.
 *  3. Update onTeamSlotDrop to also accept sourceKey from new format.
 *  4. Update the onSlotDragStart call in the old drag handle div to pass just key (not key+name).
 *  5. Add CSS for .slot-drop-zone highlight and .drag-dots in index.html.
 */

const fs = require('fs');
let lines = fs.readFileSync('app.js', 'utf8').split('\r\n');
// Normalize any LF-only lines too
if (lines.length < 100) {
  lines = fs.readFileSync('app.js', 'utf8').split('\n');
}

console.log('Total lines:', lines.length);

// === FIND the rows.push block ===
const rowsPushLineIdx = lines.findIndex(l => l.includes("rows.push(`"));
console.log('rows.push at line (1-indexed):', rowsPushLineIdx + 1);

// The block ends at the line with just `        </tr>`);
let rowsEndLineIdx = -1;
for (let i = rowsPushLineIdx; i < rowsPushLineIdx + 30; i++) {
  if (lines[i] && lines[i].includes('</tr>`);')) {
    rowsEndLineIdx = i;
    break;
  }
}
console.log('rows.push end at line (1-indexed):', rowsEndLineIdx + 1);

if (rowsPushLineIdx === -1 || rowsEndLineIdx === -1) {
  console.error('FAILED: Could not locate rows.push block');
  process.exit(1);
}

// === NEW HTML for main field rows ===
const newRowHtml = [
  `      rows.push(\``,
  `        <tr class="\${rowClass}"`,
  `            \${isAdmin && a && a.name ? 'draggable="true"' : ''}`,
  `            \${isAdmin ? \`ondragstart="window.onSlotDragStart(event, '\${key}')" ondragend="window.onSlotDragEnd(event)"\` : ''}`,
  `            ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">`,
  `          <td class="cell-rank" style="cursor:\${isAdmin && a && a.name ? 'grab' : 'default'}; user-select:none;">`,
  `            \${isAdmin && a && a.name ? '<span style="font-size:12px;opacity:0.35;margin-right:1px;pointer-events:none;">⠿</span>' : ''}`,
  `            \${i + 1}`,
  `          </td>`,
  `          <td>`,
  `            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์/คลิก..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>`,
  `          </td>`,
  `          <td>`,
  `            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>`,
  `              \${jobSelectHtml(key, job)}`,
  `            </select>`,
  `          </td>`,
  `          <td><input class="cell-input power-input" type="number" data-slot="\${key}" value="\${a && a.power != null ? a.power : ''}" placeholder="-"></td>`,
  `          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>`,
  `        </tr>\`);`,
];

lines.splice(rowsPushLineIdx, rowsEndLineIdx - rowsPushLineIdx + 1, ...newRowHtml);
console.log('Replaced rows.push HTML block');

// === FIND the slot drag functions ===
// They should still exist but shifted due to the splice
const dragStartIdx = lines.findIndex(l => l.includes('window.onSlotDragStart = function'));
console.log('onSlotDragStart at line (1-indexed):', dragStartIdx + 1);

// Find the last one (onSlotDragLeave or onSlotDragOver)
const dragLeaveSearchFrom = dragStartIdx;
let dragEndIdx = -1;
for (let i = dragStartIdx; i < lines.length; i++) {
  if (lines[i] && lines[i].includes('window.onSlotDragLeave = function')) {
    // Find closing bracket
    for (let j = i; j < i + 10; j++) {
      if (lines[j] && lines[j].trim() === '};') {
        dragEndIdx = j;
        break;
      }
    }
    break;
  }
}
console.log('Drag end at line (1-indexed):', dragEndIdx + 1);

if (dragStartIdx === -1 || dragEndIdx === -1) {
  console.error('FAILED: Could not locate drag functions');
  process.exit(1);
}

// === NEW SLOT DRAG JS ===
const newDragJs = [
  `window.onSlotDragStart = function(event, slotKey) {`,
  `  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;`,
  `  if (!isAdmin) { event.preventDefault(); return; }`,
  `  event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'swap_slot', sourceKey: slotKey }));`,
  `  event.dataTransfer.effectAllowed = 'move';`,
  `  document.body.classList.add('is-dragging-slot');`,
  `  const tr = event.currentTarget;`,
  `  if (tr) setTimeout(() => { tr.style.opacity = '0.45'; }, 0);`,
  `};`,
  ``,
  `window.onSlotDragEnd = function(event) {`,
  `  const tr = event.currentTarget;`,
  `  if (tr) tr.style.opacity = '';`,
  `  document.body.classList.remove('is-dragging-slot');`,
  `  document.querySelectorAll('.slot-drag-over').forEach(el => el.classList.remove('slot-drag-over'));`,
  `};`,
  ``,
  `window.onSlotDragOver = function(event) {`,
  `  event.preventDefault();`,
  `  event.dataTransfer.dropEffect = 'move';`,
  `  const tr = event.currentTarget;`,
  `  if (tr) tr.classList.add('slot-drag-over');`,
  `};`,
  ``,
  `window.onSlotDragLeave = function(event) {`,
  `  const tr = event.currentTarget;`,
  `  if (tr && !tr.contains(event.relatedTarget)) {`,
  `    tr.classList.remove('slot-drag-over');`,
  `  }`,
  `};`,
];

lines.splice(dragStartIdx, dragEndIdx - dragStartIdx + 1, ...newDragJs);
console.log('Replaced slot drag functions');

// === Also fix the onTeamSlotDrop to use new data format (no 'name' in data) ===
// It should already work because it reads from teamsAssignments[sourceKey] directly

// === Write back ===
fs.writeFileSync('app.js', lines.join('\r\n'));
console.log('Done. Total lines now:', lines.length);
