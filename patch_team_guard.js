const fs = require('fs');
let lines = fs.readFileSync('app.js', 'utf8').split('\n');

// Replace lines 2788-2812 (1-indexed), indices 2787-2811 (0-indexed)
const newTeamDragStart = [
  `window.onTeamCardDragStart = function(event) {\r`,
  `  const isAdmin = typeof window.isUserAdmin === 'function' ? window.isUserAdmin() : window.isAdmin;\r`,
  `  if (!isAdmin) { event.preventDefault(); return; }\r`,
  `  \r`,
  `  // GUARD: If drag started from slot handle or anywhere inside team-table, let slot drag handle it\r`,
  `  if (event.target.classList && event.target.classList.contains('slot-drag-handle')) return;\r`,
  `  if (event.target.closest && event.target.closest('.team-table')) return;\r`,
  `  if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' || event.target.tagName === 'SELECT') return;\r`,
  `\r`,
  `  const team = event.currentTarget.dataset.team;\r`,
  `  event.dataTransfer.setData('text/plain', JSON.stringify({\r`,
  `    type: 'swap_team',\r`,
  `    fieldIdx: currentFieldIdx,\r`,
  `    team: team\r`,
  `  }));\r`,
  `  \r`,
  `  window._isDraggingTeam = true;\r`,
  `  document.body.classList.add('is-dragging-team');\r`,
  `  event.currentTarget.classList.add('is-dragged');\r`,
  `  event.dataTransfer.effectAllowed = 'move';\r`,
  `};\r`,
];

// Splice out old (lines 2788-2812 => indices 2787-2811 = 25 lines) and put new ones
lines.splice(2787, 25, ...newTeamDragStart);

fs.writeFileSync('app.js', lines.join('\n'));
console.log('[OK] Patched onTeamCardDragStart');
