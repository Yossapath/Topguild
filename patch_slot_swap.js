const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

// 1. Add onSlotDragStart and enhance onTeamSlotDrop
const swapSlotCode = `
window.onSlotDragStart = function(event, slotKey, name) {
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) {
    event.preventDefault();
    return;
  }
  
  // Make sure we are not dragging an input text selection
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
     // Allow dragging text in inputs normally
     // Wait, if it's draggable=true on TR, clicking input might drag the TR.
     // To fix this, users should drag from the rank number or empty space.
  }

  event.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'swap_slot',
    sourceKey: slotKey,
    name: name
  }));
  
  event.dataTransfer.effectAllowed = 'move';
  // Optional visual feedback
  setTimeout(() => {
    event.target.style.opacity = '0.5';
  }, 0);
};

window.onSlotDragEnd = function(event) {
  event.target.style.opacity = '1';
};
`;

if (!html.includes('window.onSlotDragStart')) {
    const attachPoint = html.indexOf('window.onSidebarDragStart');
    html = html.substring(0, attachPoint) + swapSlotCode + '\n' + html.substring(attachPoint);
    console.log('Injected onSlotDragStart');
}

// 2. Enhance window.onTeamSlotDrop
const oldDrop = `window.onTeamSlotDrop = function(event, slotKey) {
  event.preventDefault();
  if (!window.isUserAdmin || !window.isUserAdmin()) return;
  const dataStr = event.dataTransfer.getData('text/plain');
  if (!dataStr) return;
  try {
    const data = JSON.parse(dataStr);
    if (data && data.name) {
      if (window.handleNameChange) window.handleNameChange(slotKey, data.name);
    }
  } catch(e) {}
};`;

const newDrop = `window.onTeamSlotDrop = function(event, targetKey) {
  event.preventDefault();
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) return;
  
  const dataStr = event.dataTransfer.getData('text/plain');
  if (!dataStr) return;
  
  try {
    const data = JSON.parse(dataStr);
    
    // Check if it's a swap slot action
    if (data.type === 'swap_slot') {
       const sourceKey = data.sourceKey;
       if (sourceKey === targetKey) return;
       
       const valA = teamsAssignments[sourceKey];
       const valB = teamsAssignments[targetKey];
       
       const filterA = rowJobFilter[sourceKey];
       const filterB = rowJobFilter[targetKey];
       
       // Swap the values!
       if (valB) {
           teamsAssignments[sourceKey] = valB;
           if (valB.name) occupiedMap.set(valB.name.toLowerCase(), sourceKey);
       } else {
           delete teamsAssignments[sourceKey];
       }
       
       if (valA) {
           teamsAssignments[targetKey] = valA;
           if (valA.name) occupiedMap.set(valA.name.toLowerCase(), targetKey);
       } else {
           delete teamsAssignments[targetKey];
       }
       
       if (filterB) {
           rowJobFilter[sourceKey] = filterB;
       } else {
           delete rowJobFilter[sourceKey];
       }
       
       if (filterA) {
           rowJobFilter[targetKey] = filterA;
       } else {
           delete rowJobFilter[targetKey];
       }
       
       saveState();
       renderAll();
       return;
    }

    // Normal drop from sidebar
    if (data && data.name) {
      if (typeof handleNameChange === 'function') handleNameChange(targetKey, data.name);
    }
  } catch(e) {
    console.error(e);
  }
};`;

if (html.includes(oldDrop)) {
    html = html.replace(oldDrop, newDrop);
    console.log('Injected slot swap drop logic');
} else if (html.includes('if (data.type === \'swap_slot\')')) {
    console.log('Slot swap drop logic already exists');
} else {
    // try regex
    const dropRegex = /window\.onTeamSlotDrop = function\(event, slotKey\) \{[\s\S]*?\} catch\(e\) \{\}\n\};/m;
    if (dropRegex.test(html)) {
        html = html.replace(dropRegex, newDrop);
        console.log('Injected slot swap drop logic via regex');
    } else {
        console.log('Could not find window.onTeamSlotDrop');
    }
}

// 3. Make TR draggable
const trMainSearch = `<tr class="\${rowClass}">`;
const trMainReplace = `<tr class="\${rowClass}" \${isAdmin && a && a.name ? \`draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)" style="cursor:grab;"\` : ''}>`;

const trOffSearch = `<tr>
          <td style="width: 40px; text-align: center; color:var(--text-lo); font-size:12px;">\${i+1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}"`;
const trOffReplace = `<tr \${isAdmin && a && a.name ? \`draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)" style="cursor:grab;"\` : ''}>
          <td style="width: 40px; text-align: center; color:var(--text-lo); font-size:12px; cursor:\${isAdmin && a && a.name ? 'grab' : 'default'};">\${i+1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}"`;

if (html.includes(trMainSearch)) {
    html = html.replace(trMainSearch, trMainReplace);
    console.log('Injected draggable to Main/Sub TR');
}
if (html.includes(trOffSearch)) {
    html = html.replace(trOffSearch, trOffReplace);
    console.log('Injected draggable to Offline TR');
}

fs.writeFileSync('app.js', html);
