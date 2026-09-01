const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

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
    fs.writeFileSync('app.js', html);
    console.log('Replaced successfully');
} else {
    console.log('Not found');
}
