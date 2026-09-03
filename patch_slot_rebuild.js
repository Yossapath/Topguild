const fs = require('fs');

let app = fs.readFileSync('app.js', 'utf8');

// ============================
// STEP 1: Replace the TR + cell-rank block for MAIN FIELD (line 837-854)
// ============================

const OLD_MAIN_ROW = `      rows.push(\`
        <tr class="\${rowClass}" ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">
          <td class="cell-rank">
            <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
              \${isAdmin && a && a.name ? \`<div draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)" style="cursor:grab; opacity:0.5; display:flex; align-items:center; padding: 4px;" title="ลากเพื่อสลับผู้เล่น"><svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events: none;"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>\` : \`<div style="width:12px;"></div>\`}
              <span>\${i + 1}</span>
            </div>
          </td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField"  value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์/คลิก..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>
          </td>
          <td>
            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>
              \${jobSelectHtml(key, job)}
            </select>
          </td>
          <td><input class="cell-input power-input" type="number" data-slot="\${key}" value="\${a && a.power != null ? a.power : ''}" placeholder="-"></td>
          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>
        </tr>\`);`;

const NEW_MAIN_ROW = `      rows.push(\`
        <tr class="\${rowClass} slot-drop-target" data-slot-key="\${key}"
            \${isAdmin && a && a.name ? \`draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}')" ondragend="window.onSlotDragEnd(event)"\` : ''}
            ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">
          <td class="cell-rank">
            \${isAdmin && a && a.name ? \`<span class="drag-handle" title="ลากเพื่อสลับ">⠿</span>\` : ''}
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

if (app.includes(OLD_MAIN_ROW)) {
  app = app.replace(OLD_MAIN_ROW, NEW_MAIN_ROW);
  console.log('[OK] Replaced main field row HTML');
} else {
  console.log('[FAIL] Could not find main field row HTML');
}

// ============================
// STEP 2: Replace slot drag functions (at the end of file)
// ============================

const OLD_SLOT_DRAG_START_IDX = app.indexOf('window.onSlotDragStart = function');
const OLD_SLOT_DRAG_END_IDX = app.lastIndexOf('};', app.indexOf('window.onSlotDragOver')) + 2;

if (OLD_SLOT_DRAG_START_IDX !== -1) {
  const beforeDrag = app.substring(0, OLD_SLOT_DRAG_START_IDX);
  const afterDrag = app.substring(OLD_SLOT_DRAG_END_IDX);
  
  const NEW_SLOT_DRAG_CODE = `window.onSlotDragStart = function(event, slotKey) {
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) { event.preventDefault(); return; }

  event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'swap_slot', sourceKey: slotKey }));
  event.dataTransfer.effectAllowed = 'move';
  document.body.classList.add('is-dragging-slot');

  // Dim the dragged row after browser captures drag image
  setTimeout(() => { event.currentTarget.style.opacity = '0.4'; }, 0);
};

window.onSlotDragEnd = function(event) {
  event.currentTarget.style.opacity = '';
  document.body.classList.remove('is-dragging-slot');
  document.querySelectorAll('.slot-drag-over').forEach(el => el.classList.remove('slot-drag-over'));
};

window.onSlotDragOver = function(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const tr = event.currentTarget;
  if (tr) tr.classList.add('slot-drag-over');
};

window.onSlotDragLeave = function(event) {
  const tr = event.currentTarget;
  // Only remove if truly leaving the TR (not a child element)
  if (tr && !tr.contains(event.relatedTarget)) {
    tr.classList.remove('slot-drag-over');
  }
};`;

  app = beforeDrag + NEW_SLOT_DRAG_CODE + '\n\n' + afterDrag;
  console.log('[OK] Replaced slot drag functions');
} else {
  console.log('[FAIL] Could not find slot drag start');
}

fs.writeFileSync('app.js', app);
console.log('Done writing app.js');
