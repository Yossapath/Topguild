const fs = require('fs');
let lines = fs.readFileSync('app.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('data-action="mainField"') && lines[i].includes('autocomplete-member') && !lines[i].includes('ondragover')) {
    // This is the Offline input line
    lines[i] = `            <input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" ondragover="if(window.isUserAdmin && window.isUserAdmin()) event.preventDefault();" ondrop="if(window.isUserAdmin && window.isUserAdmin()) { event.preventDefault(); window.onTeamSlotDrop(event, '\${key}'); }" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>`;
    console.log('Replaced Offline input line:', i+1);
  }

  if (lines[i].includes('<select class="cell-input job-input') && !lines[i].includes('isAdmin') && lines[i].includes('empty')) {
    // This is the Offline job select line
    lines[i] = `            <select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>`;
    console.log('Replaced Offline select line:', i+1);
  }

  if (lines[i].includes('<button class="clear-btn" data-slot') && !lines[i].includes('isAdmin')) {
    // This is the clear button
    lines[i] = `          <td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>`;
    console.log('Replaced Offline clear btn:', i+1);
  }
}

fs.writeFileSync('app.js', lines.join('\n'));
