const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

// 1. Revert TR changes and apply the new logic for main/sub field
const trMainSearchRegex = /<tr class="\$\{rowClass\}">/g;
const trMainReplace = `<tr class="\${rowClass}" \${isAdmin && a && a.name ? \`ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)"\` : ''}>`;
html = html.replace(trMainSearchRegex, trMainReplace);

const tdRankSearchRegex = /<div draggable="true" ondragstart="window\.onSlotDragStart\(event, '\$\{key\}', '\$\{window\.escapeHtml\(a\.name\)\}'\)" ondragend="window\.onSlotDragEnd\(event\)" style="cursor:grab; opacity:0\.4; display:flex; align-items:center;" title="ลากเพื่อสลับผู้เล่น">/g;
const tdRankReplace = `<div onmousedown="this.closest('tr').setAttribute('draggable', 'true')" onmouseup="this.closest('tr').removeAttribute('draggable')" onmouseleave="this.closest('tr').removeAttribute('draggable')" style="cursor:grab; opacity:0.4; display:flex; align-items:center;" title="ลากเพื่อสลับผู้เล่น">`;
html = html.replace(tdRankSearchRegex, tdRankReplace);


// 2. Revert TR changes and apply the new logic for offline field
const trOffSearchRegex = /<tr>\n          <td style="width: 50px;/g;
const trOffReplace = `<tr \${isAdmin && a && a.name ? \`ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)"\` : ''}>\n          <td style="width: 50px;`;
html = html.replace(trOffSearchRegex, trOffReplace);


// 3. Update window.onSlotDragStart and window.onSlotDragEnd
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
  const tr = event.currentTarget;
  if (tr) {
    setTimeout(() => {
      tr.style.opacity = '0.5';
    }, 0);
  }
};

window.onSlotDragEnd = function(event) {
  const tr = event.currentTarget;
  if (tr) {
    tr.style.opacity = '1';
    tr.removeAttribute('draggable');
  }
};`;

html = html.replace(oldSlotDragStartRegex, newSlotDragStart);

fs.writeFileSync('app.js', html);
console.log('Fixed drag handle bug');
