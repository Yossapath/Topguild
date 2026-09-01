const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

const badInjectedCode = `
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

if (html.includes(badInjectedCode)) {
    html = html.replace(badInjectedCode, '');
    html += '\n' + badInjectedCode;
    fs.writeFileSync('app.js', html);
    console.log('Fixed injection');
} else {
    console.log('Could not find bad injection');
}
