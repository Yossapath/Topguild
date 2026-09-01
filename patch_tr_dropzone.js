const fs = require('fs');

// 1. Update CSS
let html = fs.readFileSync('index.html', 'utf8');
const slotCSS = `
    /* CSS for Slot Drag and Drop */
    body.is-dragging-slot .cell-input,
    body.is-dragging-slot button {
      pointer-events: none !important;
    }
    
    tr.slot-drag-over td {
      background-color: #eff6ff !important;
      border-top: 2px dashed var(--primary) !important;
      border-bottom: 2px dashed var(--primary) !important;
      box-shadow: inset 0 0 10px rgba(37, 99, 235, 0.1);
    }
    tr.slot-drag-over td:first-child {
      border-left: 2px dashed var(--primary) !important;
    }
    tr.slot-drag-over td:last-child {
      border-right: 2px dashed var(--primary) !important;
    }
`;
if (!html.includes('/* CSS for Slot Drag and Drop */')) {
    html = html.replace('</style>', slotCSS + '\n  </style>');
    fs.writeFileSync('index.html', html);
    console.log('Injected Slot Drag CSS');
}

// 2. Update JS
let appJs = fs.readFileSync('app.js', 'utf8');

// A. Move ondragover/ondrop from INPUT to TR for main/sub
const trMainRegex = /<tr class="\$\{rowClass\}">/g;
const trMainReplace = `<tr class="\${rowClass}" ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">`;
appJs = appJs.replace(trMainRegex, trMainReplace);

const inputMainRegex = /ondragover="if\(window\.isUserAdmin && window\.isUserAdmin\(\)\) event\.preventDefault\(\);" ondrop="if\(window\.isUserAdmin && window\.isUserAdmin\(\)\) \{ event\.preventDefault\(\); window\.onTeamSlotDrop\(event, '\$\{key\}'\); \}"/g;
appJs = appJs.replace(inputMainRegex, '');

// B. Move ondragover/ondrop from INPUT to TR for offline
const trOffRegex = /<tr>\n          <td style="width: 50px;/g;
const trOffReplace = `<tr ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">\n          <td style="width: 50px;`;
appJs = appJs.replace(trOffRegex, trOffReplace);


// C. Update window.onSlotDragStart, add DragOver, DragLeave
const oldSlotDragStartRegex = /window\.onSlotDragStart = function[\s\S]*?window\.onSlotDragEnd = function[\s\S]*?tr\.style\.opacity = '1';\n  \}\n\};/m;

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
  document.body.classList.add('is-dragging-slot');
  const tr = event.target.closest('tr');
  if (tr) {
    setTimeout(() => {
      tr.style.opacity = '0.5';
    }, 0);
  }
};

window.onSlotDragEnd = function(event) {
  document.body.classList.remove('is-dragging-slot');
  const tr = event.target.closest('tr');
  if (tr) {
    tr.style.opacity = '1';
  }
  document.querySelectorAll('.slot-drag-over').forEach(el => el.classList.remove('slot-drag-over'));
};

window.onSlotDragOver = function(event) {
  event.preventDefault();
  const tr = event.currentTarget;
  if (!tr.classList.contains('slot-drag-over')) {
    tr.classList.add('slot-drag-over');
  }
};

window.onSlotDragLeave = function(event) {
  event.currentTarget.classList.remove('slot-drag-over');
};`;

if (appJs.includes('window.onSlotDragStart = function')) {
    appJs = appJs.replace(oldSlotDragStartRegex, newSlotDragStart);
}

// D. Clean up slot-drag-over in onTeamSlotDrop
const dropCleanupSearch = `window.onTeamSlotDrop = function(event, targetKey) {
  event.preventDefault();`;
const dropCleanupReplace = `window.onTeamSlotDrop = function(event, targetKey) {
  event.preventDefault();
  event.currentTarget.classList.remove('slot-drag-over');
  document.body.classList.remove('is-dragging-slot');`;
  
if (appJs.includes(dropCleanupSearch)) {
    appJs = appJs.replace(dropCleanupSearch, dropCleanupReplace);
}

fs.writeFileSync('app.js', appJs);
console.log('Fixed TR drop zones');
