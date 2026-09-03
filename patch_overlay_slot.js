/**
 * FINAL SLOT DRAG-AND-DROP REBUILD
 * 
 * Approach (same as team card drag):
 * 1. The <tr> is NOT draggable - it stays a normal table row
 * 2. The rank <td> (cell-rank) contains a drag handle SPAN that IS draggable
 * 3. When drag starts from the handle, we show .slot-drop-overlay divs on ALL other filled TRs
 * 4. User drops on the overlay div -> swaps the players
 * 5. DragEnd removes all overlays
 * 
 * Why this works where TR-draggable fails:
 * - Dragging a SPAN doesn't conflict with INPUT elements inside the same TR
 * - Overlay divs (position:absolute) can be placed over each TR's first TD to create the "box" feel
 */

const fs = require('fs');

// ================== PATCH app.js ==================
let app = fs.readFileSync('app.js', 'utf8');

// 1. Replace main field row HTML (draggable is on handle span, NOT on TR)
const OLD_MAIN_ROWS_START = `      rows.push(\`
        <tr class="\${rowClass}"
            \${isAdmin && a && a.name ? 'draggable="true"' : ''}
            \${isAdmin ? \`ondragstart="window.onSlotDragStart(event, '\${key}')" ondragend="window.onSlotDragEnd(event)"\` : ''}
            ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">
          <td class="cell-rank" style="cursor:\${isAdmin && a && a.name ? 'grab' : 'default'}; user-select:none;">
            \${isAdmin && a && a.name ? '<span style="font-size:12px;opacity:0.35;margin-right:1px;pointer-events:none;">⠿</span>' : ''}
            \${i + 1}
          </td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์/คลิก..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>
          </td>
          <td>
            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>
              \${jobSelectHtml(key, job)}
            </select>
          </td>
          <td><input class="cell-input power-input" type="number" data-slot="\${key}" value="\${a && a.power != null ? a.power : ''}" placeholder="-"></td>
          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>
        </tr>\`);`;

const NEW_MAIN_ROWS = `      rows.push(\`
        <tr class="\${rowClass}" data-slot-key="\${key}">
          <td class="cell-rank" style="position:relative; white-space:nowrap;">
            \${isAdmin && a && a.name
              ? \`<span class="slot-drag-handle" draggable="true"
                   ondragstart="window.onSlotHandleDragStart(event, '\${key}')"
                   ondragend="window.onSlotHandleDragEnd(event)"
                   title="ลากเพื่อสลับผู้เล่น">⠿</span>\`
              : \`<span style="display:inline-block;width:14px;"></span>\`}
            \${i + 1}
          </td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์/คลิก..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>
          </td>
          <td>
            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>
              \${jobSelectHtml(key, job)}
            </select>
          </td>
          <td><input class="cell-input power-input" type="number" data-slot="\${key}" value="\${a && a.power != null ? a.power : ''}" placeholder="-"></td>
          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>
        </tr>\`);`;

if (app.includes(OLD_MAIN_ROWS_START)) {
  app = app.replace(OLD_MAIN_ROWS_START, NEW_MAIN_ROWS);
  console.log('[OK] Replaced main field row HTML');
} else {
  console.log('[FAIL] Main field row not found');
}

// 2. Replace offline field row HTML
const OLD_OFFLINE_ROWS = `        htmlRows += \`
        <tr \${isAdmin && a && a.name ? 'draggable="true"' : ''}
            \${isAdmin ? \`ondragstart="window.onSlotDragStart(event, '\${key}')" ondragend="window.onSlotDragEnd(event)"\` : ''}
            ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">
          <td style="width: 50px; text-align: center; color:var(--text-lo); font-size:12px; cursor:\${isAdmin && a && a.name ? 'grab' : 'default'}; user-select:none;">
            \${isAdmin && a && a.name ? '<span style="font-size:12px;opacity:0.35;margin-right:1px;pointer-events:none;">⠿</span>' : ''}
            \${i+1}
          </td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>
          </td>
          <td style="width: 150px;">
            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>
              \${jobSelectHtml(key, job)}
            </select>
          </td>
          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>
        </tr>\`;`;

const NEW_OFFLINE_ROWS = `        htmlRows += \`
        <tr data-slot-key="\${key}">
          <td style="width: 50px; text-align: center; color:var(--text-lo); font-size:12px; position:relative; white-space:nowrap;">
            \${isAdmin && a && a.name
              ? \`<span class="slot-drag-handle" draggable="true"
                   ondragstart="window.onSlotHandleDragStart(event, '\${key}')"
                   ondragend="window.onSlotHandleDragEnd(event)"
                   title="ลากเพื่อสลับผู้เล่น">⠿</span>\`
              : \`<span style="display:inline-block;width:14px;"></span>\`}
            \${i+1}
          </td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>
          </td>
          <td style="width: 150px;">
            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>
              \${jobSelectHtml(key, job)}
            </select>
          </td>
          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>
        </tr>\`;`;

if (app.includes(OLD_OFFLINE_ROWS)) {
  app = app.replace(OLD_OFFLINE_ROWS, NEW_OFFLINE_ROWS);
  console.log('[OK] Replaced offline row HTML');
} else {
  console.log('[FAIL] Offline row not found');
}

// 3. Replace slot drag functions
const OLD_DRAG_START_IDX = app.indexOf('window.onSlotDragStart = function');
const OLD_DRAG_LEAVE_IDX = app.indexOf('window.onSlotDragLeave = function');
const OLD_DRAG_LEAVE_END = app.indexOf('};', OLD_DRAG_LEAVE_IDX) + 2;

if (OLD_DRAG_START_IDX !== -1 && OLD_DRAG_LEAVE_END > OLD_DRAG_START_IDX) {
  const before = app.substring(0, OLD_DRAG_START_IDX);
  const after = app.substring(OLD_DRAG_LEAVE_END);

  const NEW_DRAG_CODE = `// ---- Slot Handle Drag-and-Drop ----
// Drag starts from the ⠿ handle span; overlays appear on all other filled TRs.
// This pattern is identical to team card swapping.

window._slotDragSourceKey = null;

window.onSlotHandleDragStart = function(event, sourceKey) {
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) { event.preventDefault(); return; }

  window._slotDragSourceKey = sourceKey;
  event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'swap_slot', sourceKey }));
  event.dataTransfer.effectAllowed = 'move';

  // Mark source row
  const sourceTr = event.target.closest('tr');
  if (sourceTr) sourceTr.classList.add('slot-is-dragged');

  // Show overlay on all other filled TRs
  document.querySelectorAll('tr[data-slot-key]').forEach(tr => {
    const k = tr.dataset.slotKey;
    if (!k || k === sourceKey) return;
    // Check if it has a player (check for the drag handle)
    if (!tr.querySelector('.slot-drag-handle')) return;

    const overlay = document.createElement('div');
    overlay.className = 'slot-drop-overlay';
    overlay.textContent = 'สลับที่กัน';
    overlay.setAttribute('data-target-key', k);
    overlay.setAttribute('draggable', 'false');
    overlay.addEventListener('dragover', e => { e.preventDefault(); overlay.classList.add('hovered'); });
    overlay.addEventListener('dragleave', () => overlay.classList.remove('hovered'));
    overlay.addEventListener('drop', e => {
      e.preventDefault();
      window.onTeamSlotDrop(e, k);
    });
    tr.style.position = 'relative';
    tr.appendChild(overlay);
  });
};

window.onSlotHandleDragEnd = function(event) {
  window._slotDragSourceKey = null;
  // Remove source marker
  document.querySelectorAll('.slot-is-dragged').forEach(el => el.classList.remove('slot-is-dragged'));
  // Remove all overlays
  document.querySelectorAll('.slot-drop-overlay').forEach(el => el.remove());
  // Reset TR positions
  document.querySelectorAll('tr[data-slot-key]').forEach(tr => tr.style.position = '');
};

// Keep old function names as aliases for backward compat (sidebar drop still uses them)
window.onSlotDragStart = window.onSlotHandleDragStart;
window.onSlotDragEnd = window.onSlotHandleDragEnd;

window.onSlotDragOver = function(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const tr = event.currentTarget;
  if (tr) tr.classList.add('slot-drag-over');
};

window.onSlotDragLeave = function(event) {
  const tr = event.currentTarget;
  if (tr && !tr.contains(event.relatedTarget)) {
    tr.classList.remove('slot-drag-over');
  }
};`;

  app = before + NEW_DRAG_CODE + '\n\n' + after;
  console.log('[OK] Replaced slot drag functions');
} else {
  console.log('[FAIL] Could not locate drag functions');
}

fs.writeFileSync('app.js', app);
console.log('Done writing app.js');

// ================== PATCH index.html ==================
let html = fs.readFileSync('index.html', 'utf8');

const OLD_SLOT_CSS = `    /* CSS for Slot Drag and Drop */
    tr[draggable="true"] {
      cursor: grab;
    }
    tr[draggable="true"]:active {
      cursor: grabbing;
    }
    
    tr.slot-drag-over td {
      background-color: #dbeafe !important;
      outline: 2px dashed #3b82f6;
      outline-offset: -2px;
    }`;

const NEW_SLOT_CSS = `    /* CSS for Slot Drag and Drop */
    .slot-drag-handle {
      display: inline-block;
      cursor: grab;
      font-size: 14px;
      opacity: 0.4;
      margin-right: 2px;
      user-select: none;
      vertical-align: middle;
    }
    .slot-drag-handle:hover { opacity: 0.8; }
    .slot-drag-handle:active { cursor: grabbing; }

    tr.slot-is-dragged td { opacity: 0.45; }

    /* Overlay that appears on each target row during drag */
    .slot-drop-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.82);
      border: 2.5px dashed var(--primary, #3b82f6);
      border-radius: 4px;
      font-size: 13px;
      font-weight: 700;
      color: var(--primary, #3b82f6);
      pointer-events: all;
      z-index: 50;
      transition: all 0.15s ease;
    }
    .slot-drop-overlay.hovered {
      background: rgba(219, 234, 254, 0.95);
      border-width: 3px;
      transform: scale(1.01);
    }`;

if (html.includes(OLD_SLOT_CSS)) {
  html = html.replace(OLD_SLOT_CSS, NEW_SLOT_CSS);
  console.log('[OK] Updated slot CSS');
} else {
  console.log('[FAIL] Old slot CSS not found');
}

fs.writeFileSync('index.html', html);
console.log('Done writing index.html');
