const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

// Move isAdmin up in renderTeams
js = js.replace(/function renderTeams\(\) \{[\s\S]*?const fm = fieldMeta\[currentFieldIdx\];/, 
`function renderTeams() {
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  const fm = fieldMeta[currentFieldIdx];`);

// Apply disabled to name and job selects, hide clear button
js = js.replace(
  /<select class="cell-input name-input \$\{a && a\.name \? '' : 'empty'\}" data-slot="\$\{key\}">/,
  `<select class="cell-input name-input \${a && a.name ? '' : 'empty'}" data-slot="\${key}" \${isAdmin ? '' : 'disabled'}>`
);

js = js.replace(
  /<select class="cell-input job-input \$\{job \? '' : 'empty'\}" data-slot="\$\{key\}" style="--job-color:\$\{job \? colorOf\(job\) : ''\}">/,
  `<select class="cell-input job-input \${job ? '' : 'empty'}" data-slot="\${key}" style="--job-color:\${job ? colorOf(job) : ''}" \${isAdmin ? '' : 'disabled'}>`
);

js = js.replace(
  /<td class="cell-action"><button class="clear-btn" data-slot="\$\{key\}" title="ล้างช่องนี้">✕<\/button><\/td>/,
  `<td class="cell-action">\${isAdmin ? \`<button class="clear-btn" data-slot="\${key}" title="ล้างช่องนี้">✕</button>\` : ''}</td>`
);

// Delete team button hide
js = js.replace(
  /<button class="btn-delete-team-card" data-team="\$\{teamName\}" title="ลบทีมนี้">✕<\/button>/,
  `\${isAdmin ? \`<button class="btn-delete-team-card" data-team="\${teamName}" title="ลบทีมนี้">✕</button>\` : ''}`
);

// Remove the later declaration of isAdmin in renderTeams to avoid duplicate
js = js.replace(/const isAdmin = window\.currentUser && window\.currentUser\.role === 'admin';\s*const btnMain = document\.getElementById\('btnAutoOptimizeMain'\);/, 
  `const btnMain = document.getElementById('btnAutoOptimizeMain');`);

fs.writeFileSync('app.js', js, 'utf8');
console.log('patched app.js permissions');
