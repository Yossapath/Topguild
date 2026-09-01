const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const oldSidebarStart = `window.onSidebarDragStart = function(event, name, job, power) {
  event.dataTransfer.setData('text/plain', JSON.stringify({ name, job, power }));
};`;

const newSidebarStart = `window.onSidebarDragStart = function(event, name, job, power) {
  event.dataTransfer.setData('text/plain', JSON.stringify({ name, job, power }));
  document.body.classList.add('is-dragging-slot');
};

window.onSidebarDragEnd = function(event) {
  document.body.classList.remove('is-dragging-slot');
  document.querySelectorAll('.slot-drag-over').forEach(el => el.classList.remove('slot-drag-over'));
};`;

appJs = appJs.replace(oldSidebarStart, newSidebarStart);

const missingRowSearch = `class="missing-row" draggable="true" ondragstart="window.onSidebarDragStart(event, '\${escapeHtml(m.name)}', '\${escapeHtml(m.job)}', \${m.power})"`;
const missingRowReplace = `class="missing-row" draggable="true" ondragstart="window.onSidebarDragStart(event, '\${escapeHtml(m.name)}', '\${escapeHtml(m.job)}', \${m.power})" ondragend="window.onSidebarDragEnd(event)"`;
appJs = appJs.replace(missingRowSearch, missingRowReplace);

fs.writeFileSync('app.js', appJs);
console.log('Fixed sidebar dragging');
