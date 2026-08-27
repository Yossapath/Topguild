const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const targetStr = '<input type="text" class="cell-input name-input autocomplete-member" data-slot="${key}" data-action="mainField" value="${a && a.name ? window.escapeHtml(a.name) : \'\'}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off" ${isAdmin ? \'\' : \'disabled\'}>';

const replaceStr = '<input type="text" class="cell-input name-input autocomplete-member" data-slot="${key}" data-action="mainField" ondragover="if(window.isUserAdmin && window.isUserAdmin()) event.preventDefault();" ondrop="if(window.isUserAdmin && window.isUserAdmin()) { event.preventDefault(); window.onTeamSlotDrop(event, \'${key}\'); }" value="${a && a.name ? window.escapeHtml(a.name) : \'\'}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off" ${isAdmin ? \'\' : \'disabled\'}>';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('app.js', code);
  console.log('Patched Offline drag and drop');
} else {
  console.log('Target string not found');
}
