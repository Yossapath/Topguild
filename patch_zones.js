const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /teamsGrid\.innerHTML = sortedTeamNames\.map\(teamName => \{([\s\S]*?return `[\s\S]*?`\s*;\s*\}\)\.join\(''\);/g;

let match = regex.exec(code);
if (match) {
  let innerBody = match[1];

  let replacementStr = `
    const teamHTMLMap = {};
    sortedTeamNames.forEach(teamName => {
${innerBody.replace(/return `/g, 'teamHTMLMap[teamName] = `')}
    });

    if (currentFieldIdx === 0) {
      const zone1Names = [];
      const zone2Names = [];
      sortedTeamNames.forEach(tName => {
        const numMatch = tName.match(/\\d+/);
        const num = numMatch ? parseInt(numMatch[0]) : 0;
        if (num % 2 === 0 && num !== 0) {
          zone2Names.push(tName);
        } else {
          zone1Names.push(tName);
        }
      });

      const zone1HTML = zone1Names.map(t => teamHTMLMap[t]).join('');
      const zone2HTML = zone2Names.map(t => teamHTMLMap[t]).join('');

      teamsGrid.innerHTML = \`
        <div class="zone-column" style="display:flex; flex-direction:column; gap:16px;">
          <h3 style="margin:0; text-align:center; background:var(--blue-700); color:white; padding:8px; border-radius:8px;">โซน 1 (ซ้าย)</h3>
          \${zone1HTML}
        </div>
        <div class="zone-column" style="display:flex; flex-direction:column; gap:16px;">
          <h3 style="margin:0; text-align:center; background:var(--blue-700); color:white; padding:8px; border-radius:8px;">โซน 2 (ขวา)</h3>
          \${zone2HTML}
        </div>
      \`;
    } else {
      teamsGrid.innerHTML = sortedTeamNames.map(t => teamHTMLMap[t]).join('');
    }
  `;
  
  code = code.replace(match[0], replacementStr);
  fs.writeFileSync('app.js', code);
  console.log('Patched renderTeams for Zone layout');
} else {
  console.log('Regex did not match teamsGrid.innerHTML assignment');
}
