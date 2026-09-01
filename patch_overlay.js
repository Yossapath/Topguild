const fs = require('fs');

// 1. Inject CSS into index.html
let html = fs.readFileSync('index.html', 'utf8');
const customCSS = `
    /* CSS for Team Drag and Drop */
    body.is-dragging-team .team-table,
    body.is-dragging-team .team-title-group,
    body.is-dragging-team .team-card-head button,
    body.is-dragging-team .team-card-head .status-badge {
      pointer-events: none !important;
    }
    
    body.is-dragging-team .team-card {
      position: relative;
    }
    
    body.is-dragging-team .team-card::after {
      content: "สลับที่กับทีมนี้";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255, 255, 255, 0.85);
      border: 3px dashed var(--primary);
      border-radius: inherit;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      color: var(--primary);
      pointer-events: none;
      transition: all 0.2s ease;
    }
    
    body.is-dragging-team .team-card.drag-over::after {
      background: rgba(239, 246, 255, 0.95);
      border-width: 4px;
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    /* Make the dragging element transparent but hide the overlay on ITSELF */
    body.is-dragging-team .team-card.is-dragged::after {
      display: none;
    }
`;
if (!html.includes('/* CSS for Team Drag and Drop */')) {
    html = html.replace('</style>', customCSS + '\n  </style>');
    fs.writeFileSync('index.html', html);
    console.log('Injected Drag CSS');
} else {
    console.log('Drag CSS already exists');
}


// 2. Update JS in app.js
let appJs = fs.readFileSync('app.js', 'utf8');

const updatedJS = `
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
  
  window._isDraggingTeam = true;
  document.body.classList.add('is-dragging-team');
  event.currentTarget.classList.add('is-dragged');
  
  event.dataTransfer.effectAllowed = 'move';
};

window.onTeamCardDragOver = function(event) {
  event.preventDefault();
  if (window._isDraggingTeam) {
    event.currentTarget.classList.add('drag-over');
  }
};

window.onTeamCardDragLeave = function(event) {
  if (window._isDraggingTeam) {
    event.currentTarget.classList.remove('drag-over');
  }
};

window.onTeamCardDragEnd = function(event) {
  window._isDraggingTeam = false;
  document.body.classList.remove('is-dragging-team');
  document.querySelectorAll('.team-card').forEach(el => {
      el.classList.remove('is-dragged');
      el.classList.remove('drag-over');
  });
};

window.onTeamCardDrop = function(event) {
  event.preventDefault();
  
  window._isDraggingTeam = false;
  document.body.classList.remove('is-dragging-team');
  document.querySelectorAll('.team-card').forEach(el => {
      el.classList.remove('is-dragged');
      el.classList.remove('drag-over');
  });

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

appJs = appJs.replace(/window\.onTeamCardDragStart = function[\s\S]*?window\.onTeamCardDrop = function[\s\S]*?console\.error\(e\);\n  \}\n};/m, updatedJS.trim());

fs.writeFileSync('app.js', appJs);
console.log('Updated app.js with overlay drag logic');

