const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const targetStr = `autocomplete="off">`;
// We only want to replace it in the Offline patch section.
// Actually, I can just do a regex replace for the offline name-input and job-input.

const regexName = /<input type="text" class="cell-input name-input autocomplete-member" data-slot="\\\$\\{key\\}" data-action="mainField" value="\\\$\\{a && a\.name \? window\.escapeHtml\(a\.name\) : ''\\}" placeholder="พิมพ์ชื่อคนออฟไลน์\.\.\." autocomplete="off">/g;
const replaceName = `<input type="text" class="cell-input name-input autocomplete-member" data-slot="\${key}" data-action="mainField" value="\${a && a.name ? window.escapeHtml(a.name) : ''}" placeholder="พิมพ์ชื่อคนออฟไลน์..." autocomplete="off" \${isAdmin ? '' : 'disabled'}>`;

const regexJob = /<select class="cell-input job-input \\\$\\{job \? '' : 'empty'\\}" data-slot="\\\$\\{key\\}" style="--job-color:\\\$\\{job \? colorOf\(job\) : ''\\}">/g;
const replaceJob = `<select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>`;

const regexClear = /<button class="clear-btn" data-slot="\\\$\\{key\\}" title="ล้างช่องนี้">✕<\/button>/g;
const replaceClear = `\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}`;

code = code.replace(regexName, replaceName);
code = code.replace(regexJob, replaceJob);
code = code.replace(regexClear, replaceClear);

fs.writeFileSync('app.js', code);
console.log('Patched Admin disabled checks');
