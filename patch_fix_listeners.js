const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const targetFunc = "function attachRowListeners() {";

// We want to replace all querySelectorAll calls inside attachRowListeners
const newFunc = `function attachRowListeners() {
  document.querySelectorAll('#teamsGrid .job-input').forEach(sel => {
    sel.addEventListener('change', e => handleJobFilterChange(e.target.dataset.slot, e.target.value));
  });
  document.querySelectorAll('#teamsGrid .name-input').forEach(sel => {
    sel.addEventListener('change', e => handleNameChange(e.target.dataset.slot, e.target.value));
  });
  document.querySelectorAll('#teamsGrid .power-input').forEach(inp => {
    inp.addEventListener('change', e => handlePowerChange(e.target.dataset.slot, e.target.value));
  });
  document.querySelectorAll('#teamsGrid .clear-btn').forEach(btn => {
    btn.addEventListener('click', e => handleClearSlot(e.currentTarget.dataset.slot));
  });
  document.querySelectorAll('#teamsGrid .btn-delete-team-card').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removeSpecificTeam(e.currentTarget.dataset.team);
    });
  });
}`;

// Use regex to replace the whole function
const regex = /function attachRowListeners\(\) \{[\s\S]*?(?=\n\}\n|\n\}\s*$)\n\}/m;

if (regex.test(code)) {
  code = code.replace(regex, newFunc);
  fs.writeFileSync('app.js', code, 'utf8');
  console.log('Fixed attachRowListeners selectors');
} else {
  console.log('Could not find attachRowListeners function with regex');
}
