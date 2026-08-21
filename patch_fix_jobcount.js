const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const target = "const statusBar = document.getElementById('fieldStatusBar');";
const replacement = `
  // Count jobs in current field assignments
  const jobCountInField = {};
  Object.keys(teamsAssignments).forEach(k => {
    if (k.startsWith(currentFieldIdx + '_')) {
      const a = teamsAssignments[k];
      if (a && a.job) jobCountInField[a.job] = (jobCountInField[a.job] || 0) + 1;
    }
  });
  
  const statusBar = document.getElementById('fieldStatusBar');`;

if (code.includes(target) && !code.includes('const jobCountInField = {}')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('app.js', code, 'utf8');
  console.log('Fixed jobCountInField declaration');
} else {
  console.log('Already fixed or target not found');
}
