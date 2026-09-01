const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

// 1. Remove draggable from TR in main/sub field
const trMainSearchRegex = /<tr class="\$\{rowClass\}" \$\{isAdmin && a && a\.name \? `draggable="true" ondragstart="window\.onSlotDragStart\(event, '\$\{key\}', '\$\{window\.escapeHtml\(a\.name\)\}'\)" ondragend="window\.onSlotDragEnd\(event\)" style="cursor:grab;"` : ''\}>/g;
html = html.replace(trMainSearchRegex, '<tr class="${rowClass}">');

// 2. Add drag handle to td.cell-rank in main/sub field
const tdRankSearchRegex = /<td class="cell-rank">\$\{i \+ 1\}<\/td>/g;
const tdRankReplace = `<td class="cell-rank">
            <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
              \${isAdmin && a && a.name ? \`<div draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)" style="cursor:grab; opacity:0.4; display:flex; align-items:center;" title="ลากเพื่อสลับผู้เล่น"><svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>\` : \`<div style="width:12px;"></div>\`}
              <span>\${i + 1}</span>
            </div>
          </td>`;
html = html.replace(tdRankSearchRegex, tdRankReplace);

// 3. Remove draggable from TR in offline field
const trOffSearchRegex = /<tr \$\{isAdmin && a && a\.name \? `draggable="true" ondragstart="window\.onSlotDragStart\(event, '\$\{key\}', '\$\{window\.escapeHtml\(a\.name\)\}'\)" ondragend="window\.onSlotDragEnd\(event\)" style="cursor:grab;"` : ''\}>/g;
html = html.replace(trOffSearchRegex, '<tr>');

// 4. Add drag handle to offline td
const tdOffSearchRegex = /<td style="width: 40px; text-align: center; color:var\(--text-lo\); font-size:12px; cursor:\$\{isAdmin && a && a\.name \? 'grab' : 'default'\};">\$\{i\+1\}<\/td>/g;
const tdOffReplace = `<td style="width: 50px; text-align: center; color:var(--text-lo); font-size:12px;">
            <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
              \${isAdmin && a && a.name ? \`<div draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)" style="cursor:grab; opacity:0.4; display:flex; align-items:center;" title="ลากเพื่อสลับผู้เล่น"><svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>\` : \`<div style="width:12px;"></div>\`}
              <span>\${i+1}</span>
            </div>
          </td>`;
html = html.replace(tdOffSearchRegex, tdOffReplace);

// 5. Update th width in main/sub field
const thSearchRegex = /<th style="width:18px;"><\/th>/g;
html = html.replace(thSearchRegex, '<th style="width:34px;"></th>');

// 6. Update onSlotDragStart and onSlotDragEnd logic
const oldSlotDragStartRegex = /window\.onSlotDragStart = function[\s\S]*?window\.onSlotDragEnd = function[\s\S]*?opacity = '1';\n\};/m;

const newSlotDragStart = `window.onSlotDragStart = function(event, slotKey, name) {
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) {
    event.preventDefault();
    return;
  }
  
  event.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'swap_slot',
    sourceKey: slotKey,
    name: name
  }));
  
  event.dataTransfer.effectAllowed = 'move';
  const tr = event.target.closest('tr');
  if (tr) {
    event.dataTransfer.setDragImage(tr, 20, 20);
    setTimeout(() => {
      tr.style.opacity = '0.5';
    }, 0);
  }
};

window.onSlotDragEnd = function(event) {
  const tr = event.target.closest('tr');
  if (tr) tr.style.opacity = '1';
};`;

html = html.replace(oldSlotDragStartRegex, newSlotDragStart);

fs.writeFileSync('app.js', html);
console.log('Fixed drag handles');
