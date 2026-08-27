const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regexName = /<input type="text" class="cell-input name-input autocomplete-member" data-slot="\$\\{key\\}" data-action="mainField" value="\$\\{a && a\.name \? window\.escapeHtml\(a\.name\) : ''\\}" placeholder="[^"]+" autocomplete="off">/g;

const replaceName = `<input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" ondragover="if(window.isUserAdmin && window.isUserAdmin()) event.preventDefault();" ondrop="if(window.isUserAdmin && window.isUserAdmin()) { event.preventDefault(); window.onTeamSlotDrop(event, '\${key}'); }" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>`;

const regexClear = /<button class="clear-btn" data-slot="\$\\{key\\}" title="[^"]+">✕<\/button>/g;
const replaceClear = `\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}`;

let matchName = code.match(regexName);
if (matchName) {
  code = code.replace(regexName, replaceName);
  console.log('Patched Name');
} else {
  console.log('Name match failed');
}

let matchClear = code.match(regexClear);
if (matchClear) {
  code = code.replace(regexClear, replaceClear);
  console.log('Patched Clear');
} else {
  console.log('Clear match failed');
}

fs.writeFileSync('app.js', code);
