const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

// Replace drag event functions to be more robust
const robustSwapCode = `
window.onTeamCardDragStart = function(event) {
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) {
    event.preventDefault();
    return;
  }
  
  // Make sure we are not dragging an input or button
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' || event.target.tagName === 'SELECT') {
     return;
  }

  const team = event.currentTarget.dataset.team;
  event.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'swap_team',
    fieldIdx: window.currentFieldIdx,
    team: team
  }));
  
  // Store a global state as fallback for dragover
  window._isDraggingTeam = true;
  
  event.currentTarget.style.opacity = '0.5';
  event.dataTransfer.effectAllowed = 'move';
};

window.onTeamCardDragOver = function(event) {
  event.preventDefault();
  if (window._isDraggingTeam) {
    event.currentTarget.style.boxShadow = '0 0 0 2px var(--primary) inset';
  }
};

window.onTeamCardDragLeave = function(event) {
  if (window._isDraggingTeam) {
    event.currentTarget.style.boxShadow = '';
  }
};

window.onTeamCardDragEnd = function(event) {
  window._isDraggingTeam = false;
  event.currentTarget.style.opacity = '1';
  document.querySelectorAll('.team-card').forEach(el => el.style.boxShadow = '');
};

window.onTeamCardDrop = function(event) {
  event.preventDefault();
  event.currentTarget.style.boxShadow = '';
  window._isDraggingTeam = false;
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) return;

  const dataStr = event.dataTransfer.getData('text/plain');
  if (!dataStr) return;

  try {
    const data = JSON.parse(dataStr);
    if (data.type === 'swap_team' && data.fieldIdx === window.currentFieldIdx) {
      const sourceTeam = data.team;
      const targetTeam = event.currentTarget.dataset.team;
      
      if (sourceTeam === targetTeam) return;

      const fm = window.fieldMeta[window.currentFieldIdx];
      const capA = fm.capacity[sourceTeam] || 5;
      const capB = fm.capacity[targetTeam] || 5;
      const maxCap = Math.max(capA, capB);

      for (let i = 0; i < maxCap; i++) {
        const keyA = window.currentFieldIdx + '|' + sourceTeam + '|' + i;
        const keyB = window.currentFieldIdx + '|' + targetTeam + '|' + i;

        const valA = window.teamsAssignments[keyA];
        const valB = window.teamsAssignments[keyB];
        const filterA = window.rowJobFilter[keyA];
        const filterB = window.rowJobFilter[keyB];

        if (valB) {
            window.teamsAssignments[keyA] = valB;
            if (valB.name) window.occupiedMap.set(valB.name.toLowerCase(), keyA);
        } else {
            delete window.teamsAssignments[keyA];
        }

        if (valA) {
            window.teamsAssignments[keyB] = valA;
            if (valA.name) window.occupiedMap.set(valA.name.toLowerCase(), keyB);
        } else {
            delete window.teamsAssignments[keyB];
        }

        if (filterB) {
            window.rowJobFilter[keyA] = filterB;
        } else {
            delete window.rowJobFilter[keyA];
        }

        if (filterA) {
            window.rowJobFilter[keyB] = filterA;
        } else {
            delete window.rowJobFilter[keyB];
        }
      }

      window.saveState();
      window.renderAll();
      if (window.showToast) window.showToast(\`สลับ \${sourceTeam} กับ \${targetTeam} เรียบร้อยแล้ว\`, 'success');
    }
  } catch(e) {
    console.error(e);
  }
};
`;

// we need to replace the old swap functions with the new ones
const startIndex = html.indexOf('window.onTeamCardDragStart = function');
const endIndex = html.indexOf('window.onTeamCardDrop = function(event) {');
const nextFuncIndex = html.indexOf(';', html.indexOf('}', endIndex + 100)) + 1; // rough heuristic
// It's safer to just regex replace the entire block of window.onTeamCard...
html = html.replace(/window\.onTeamCardDragStart = function[\s\S]*?window\.onTeamCardDrop = function[\s\S]*?console\.error\(e\);\n  \}\n};/m, robustSwapCode.trim());

fs.writeFileSync('app.js', html);
