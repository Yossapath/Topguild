const fs = require('fs');
let app = fs.readFileSync('app.js', 'utf8');

// 1. Find and replace onSlotHandleDragStart and related functions
const dragFuncStart = app.indexOf('// ---- Slot Handle Drag-and-Drop ----');
const dragFuncEnd = app.lastIndexOf('};', app.indexOf('window.onSlotDragLeave = function')) + 2;

if (dragFuncStart === -1) {
  console.log('[FAIL] Could not find drag section start');
  process.exit(1);
}

const before = app.substring(0, dragFuncStart);
const after = app.substring(dragFuncEnd);

const newDragCode = `// ---- Slot Handle Drag-and-Drop ----
// APPROACH: drag handle SPAN fires drag events.
// TR elements have ondragover+ondrop to act as drop targets.
// Body gets 'is-dragging-slot' class → CSS highlights all drop-target TRs.
// No DOM injection needed. Works reliably.

window._slotDragSourceKey = null;

window.onSlotHandleDragStart = function(event, sourceKey) {
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) { event.preventDefault(); return; }

  window._slotDragSourceKey = sourceKey;
  event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'swap_slot', sourceKey }));
  event.dataTransfer.effectAllowed = 'move';
  document.body.classList.add('is-dragging-slot');

  // Mark source TR
  const sourceTr = event.target.closest('tr');
  if (sourceTr) sourceTr.dataset.slotDragging = '1';
};

window.onSlotHandleDragEnd = function(event) {
  window._slotDragSourceKey = null;
  document.body.classList.remove('is-dragging-slot');
  document.querySelectorAll('tr[data-slot-dragging]').forEach(tr => delete tr.dataset.slotDragging);
  document.querySelectorAll('.slot-drag-over').forEach(el => el.classList.remove('slot-drag-over'));
};

window.onSlotDragStart = window.onSlotHandleDragStart;
window.onSlotDragEnd = window.onSlotHandleDragEnd;

window.onSlotDragOver = function(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const tr = event.currentTarget;
  if (tr && !tr.dataset.slotDragging) tr.classList.add('slot-drag-over');
};

window.onSlotDragLeave = function(event) {
  const tr = event.currentTarget;
  if (tr && !tr.contains(event.relatedTarget)) {
    tr.classList.remove('slot-drag-over');
  }
};`;

app = before + newDragCode + '\n\n' + after;

// 2. Add ondragover/ondrop back to TR in main field rows
const trSearch = `        <tr class="\${rowClass}" data-slot-key="\${key}">`;
const trReplace = `        <tr class="\${rowClass}" data-slot-key="\${key}"
            ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">`;
if (app.includes(trSearch)) {
  app = app.replace(trSearch, trReplace);
  console.log('[OK] Added drop handlers to main field TR');
} else {
  console.log('[FAIL] Main TR not found');
}

// 3. Add ondragover/ondrop to offline TR
const trOffSearch = `        <tr data-slot-key="\${key}">`;
const trOffReplace = `        <tr data-slot-key="\${key}"
            ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">`;
if (app.includes(trOffSearch)) {
  app = app.replace(trOffSearch, trOffReplace);
  console.log('[OK] Added drop handlers to offline TR');
} else {
  console.log('[FAIL] Offline TR not found');
}

fs.writeFileSync('app.js', app);
console.log('Done writing app.js');

// 4. Update CSS in index.html
let html = fs.readFileSync('index.html', 'utf8');

const oldSlotCSS = `    /* CSS for Slot Drag and Drop */
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

const newSlotCSS = `    /* CSS for Slot Drag and Drop */
    .slot-drag-handle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      font-size: 16px;
      line-height: 1;
      opacity: 0.4;
      margin-right: 3px;
      padding: 2px 3px;
      user-select: none;
      vertical-align: middle;
      border-radius: 3px;
      min-width: 18px;
      min-height: 18px;
    }
    .slot-drag-handle:hover {
      opacity: 0.8;
      background: rgba(59,130,246,0.1);
    }
    .slot-drag-handle:active { cursor: grabbing; }

    /* Highlight all filled TRs during drag to show they are drop targets */
    body.is-dragging-slot tr[data-slot-key] td {
      background-color: rgba(219,234,254,0.5) !important;
    }
    body.is-dragging-slot tr[data-slot-dragging="1"] td {
      opacity: 0.4 !important;
      background-color: transparent !important;
    }
    /* Hovered drop target row */
    body.is-dragging-slot tr.slot-drag-over td {
      background-color: #bfdbfe !important;
      outline: 2px solid #3b82f6;
      outline-offset: -1px;
    }
    /* Show "สลับที่กัน" label in first cell via pseudo-element */
    body.is-dragging-slot tr[data-slot-key]:not([data-slot-dragging]) td.cell-rank {
      position: relative;
    }
    body.is-dragging-slot tr[data-slot-key]:not([data-slot-dragging]) td.cell-rank::after {
      content: "วาง";
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      font-size: 10px;
      font-weight: 700;
      pointer-events: none;
    }
    body.is-dragging-slot tr.slot-drag-over td.cell-rank::after {
      content: "สลับที่กัน";
      font-size: 11px;
      color: #1d4ed8;
    }`;

if (html.includes(oldSlotCSS)) {
  html = html.replace(oldSlotCSS, newSlotCSS);
  console.log('[OK] Updated CSS');
} else {
  console.log('[FAIL] Old CSS not found - might need manual update');
}

fs.writeFileSync('index.html', html);
console.log('Done writing index.html');
