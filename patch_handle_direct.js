const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

// 1. Remove the mousedown hack and restore draggable="true" on the drag handle for main/sub
const tdRankSearchRegex = /<div onmousedown="this\.closest\('tr'\)\.setAttribute\('draggable', 'true'\)" onmouseup="this\.closest\('tr'\)\.removeAttribute\('draggable'\)" onmouseleave="this\.closest\('tr'\)\.removeAttribute\('draggable'\)" style="cursor:grab; opacity:0\.4; display:flex; align-items:center;" title="ลากเพื่อสลับผู้เล่น">/g;
const tdRankReplace = `<div draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)" style="cursor:grab; opacity:0.5; display:flex; align-items:center; padding: 4px;" title="ลากเพื่อสลับผู้เล่น">`;
html = html.replace(tdRankSearchRegex, tdRankReplace);

// 2. Remove ondragstart/ondragend from TR for main/sub
const trMainSearchRegex = /<tr class="\$\{rowClass\}" \$\{isAdmin && a && a\.name \? `ondragstart="window\.onSlotDragStart\(event, '\$\{key\}', '\$\{window\.escapeHtml\(a\.name\)\}'\)" ondragend="window\.onSlotDragEnd\(event\)"` : ''\}>/g;
const trMainReplace = `<tr class="\${rowClass}">`;
html = html.replace(trMainSearchRegex, trMainReplace);

// 3. Remove ondragstart/ondragend from TR for offline
const trOffSearchRegex = /<tr \$\{isAdmin && a && a\.name \? `ondragstart="window\.onSlotDragStart\(event, '\$\{key\}', '\$\{window\.escapeHtml\(a\.name\)\}'\)" ondragend="window\.onSlotDragEnd\(event\)"` : ''\}>/g;
const trOffReplace = `<tr>`;
html = html.replace(trOffSearchRegex, trOffReplace);

// 4. Update JS logic for onSlotDragStart and onSlotDragEnd
const oldSlotDragStartRegex = /window\.onSlotDragStart = function[\s\S]*?window\.onSlotDragEnd = function[\s\S]*?tr\.removeAttribute\('draggable'\);\n  \}\n\};/m;

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
    setTimeout(() => {
      tr.style.opacity = '0.5';
    }, 0);
  }
};

window.onSlotDragEnd = function(event) {
  const tr = event.target.closest('tr');
  if (tr) {
    tr.style.opacity = '1';
  }
};`;

html = html.replace(oldSlotDragStartRegex, newSlotDragStart);

fs.writeFileSync('app.js', html);
console.log('Fixed handle drag logic');
