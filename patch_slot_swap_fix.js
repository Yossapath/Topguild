const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

const regex = /window\.onTeamSlotDrop = function[\s\S]*?\} catch\(e\) \{\}\n\};/m;
const match = html.match(regex);
if (match) {
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

    html = html.replace(regex, newDrop);
    fs.writeFileSync('app.js', html);
    console.log('Injected slot swap logic');
} else {
    console.log('Could not match regex');
}

// Check offline TR
const trOffSearch = `<tr>
          <td style="width: 40px; text-align: center; color:var(--text-lo); font-size:12px;">\${i+1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}"`;
const trOffReplace = `<tr \${isAdmin && a && a.name ? \`draggable="true" ondragstart="window.onSlotDragStart(event, '\${key}', '\${window.escapeHtml(a.name)}')" ondragend="window.onSlotDragEnd(event)" style="cursor:grab;"\` : ''}>
          <td style="width: 40px; text-align: center; color:var(--text-lo); font-size:12px; cursor:\${isAdmin && a && a.name ? 'grab' : 'default'};">\${i+1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}"`;

if (html.includes(trOffSearch)) {
    html = html.replace(trOffSearch, trOffReplace);
    fs.writeFileSync('app.js', html);
    console.log('Injected draggable to Offline TR');
}

