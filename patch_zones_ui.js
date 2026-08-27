const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const startStr = 'teamsGrid.innerHTML = sortedTeamNames.map(teamName => {';
const endStr = `          </div>
        </div>
      \`;
    }).join('');`;

let startIdx = code.indexOf(startStr);
let endIdx = code.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let innerBody = code.substring(startIdx + startStr.length, endIdx + endStr.length - `    }).join('');`.length);
  
  // Replace the return backtick with teamHTMLMap[teamName] = backtick
  let newInnerBody = innerBody.replace(/return `/g, 'teamHTMLMap[teamName] = `');

  let replacementStr = `
    const teamHTMLMap = {};
    sortedTeamNames.forEach(teamName => {
      ${newInnerBody}
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

  code = code.substring(0, startIdx) + replacementStr + code.substring(endIdx + endStr.length);
  fs.writeFileSync('app.js', code);
  console.log('Patched renderTeams for Zone layout');
} else {
  console.log('Could not find start or end bounds for teamsGrid.innerHTML assignment');
}
