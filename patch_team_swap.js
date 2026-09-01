const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

const swapCode = `
window.onTeamCardDragStart = function(event) {
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) {
    event.preventDefault();
    return;
  }
  // Make sure we are grabbing the card, not a row
  if (event.target.tagName === 'TR' || event.target.tagName === 'TD') return;

  const team = event.currentTarget.dataset.team;
  event.dataTransfer.setData('application/x-swap-team', JSON.stringify({
    type: 'swap_team',
    fieldIdx: window.currentFieldIdx,
    team: team
  }));
  event.currentTarget.style.opacity = '0.5';
  event.dataTransfer.effectAllowed = 'move';
};

window.onTeamCardDragOver = function(event) {
  if (event.dataTransfer.types.includes('application/x-swap-team')) {
    event.preventDefault();
    event.currentTarget.style.boxShadow = '0 0 0 2px var(--primary) inset';
  }
};

window.onTeamCardDragLeave = function(event) {
  if (event.dataTransfer.types.includes('application/x-swap-team')) {
    event.currentTarget.style.boxShadow = '';
  }
};

window.onTeamCardDragEnd = function(event) {
  event.currentTarget.style.opacity = '1';
  document.querySelectorAll('.team-card').forEach(el => el.style.boxShadow = '');
};

window.onTeamCardDrop = function(event) {
  event.preventDefault();
  event.currentTarget.style.boxShadow = '';
  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;
  if (!isAdmin) return;

  const dataStr = event.dataTransfer.getData('application/x-swap-team');
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
      if (window.showToast) window.showToast(\`สลับ \${sourceTeam} กับ \${targetTeam} แล้ว\`, 'success');
    }
  } catch(e) {
    console.error(e);
  }
};
`;

if (!html.includes('window.onTeamCardDragStart')) {
    html += '\n' + swapCode;
    console.log('Injected team drag handlers');
} else {
    console.log('Team drag handlers already exist');
}

const searchDiv = `<div class="team-card \${cardDim}\${locked?' locked-team':''}">`;
const replaceDiv = `<div class="team-card \${cardDim}\${locked?' locked-team':''}" \${isAdmin && !locked ? 'draggable="true" ondragstart="window.onTeamCardDragStart(event)" ondragover="window.onTeamCardDragOver(event)" ondragleave="window.onTeamCardDragLeave(event)" ondrop="window.onTeamCardDrop(event)" ondragend="window.onTeamCardDragEnd(event)"' : ''} data-team="\${escapeHtml(teamName)}">`;

if (html.includes(searchDiv)) {
    html = html.replace(searchDiv, replaceDiv);
    console.log('Injected draggable attributes to team cards');
} else {
    console.log('Could not find team card div template');
}

// Add a drag handle icon to the team-card-head for better UX
const headSearch = `<div class="team-title-group">`;
const headReplace = `<div class="team-title-group" style="cursor:\${isAdmin && !locked ? 'grab' : 'default'};">
            \${isAdmin && !locked ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;opacity:0.5;"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>' : ''}`;

if (html.includes(headSearch)) {
    html = html.replace(headSearch, headReplace);
    console.log('Injected drag handle to team title');
} else {
    console.log('Could not find team title group');
}


fs.writeFileSync('app.js', html);
