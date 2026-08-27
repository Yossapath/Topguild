const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const targetStr = `teamsGrid.innerHTML = sortedTeamNames.map(teamName => {`;
let startIdx = code.indexOf(targetStr);
if (startIdx !== -1) {
  let endIdx = code.indexOf("    }).join('');", startIdx);
  if (endIdx !== -1) {
    let innerBody = code.substring(startIdx + targetStr.length, endIdx);

    let lastReturnIdx = innerBody.lastIndexOf('return `');
    if (lastReturnIdx !== -1) {
      let beforeReturn = innerBody.substring(0, lastReturnIdx);
      let htmlTemplate = innerBody.substring(lastReturnIdx + 8, innerBody.length);
      htmlTemplate = htmlTemplate.substring(0, htmlTemplate.lastIndexOf('`'));

      let replacementStr = `
    const teamHTMLMap = {};
    sortedTeamNames.forEach(teamName => {
      ${beforeReturn}
      teamHTMLMap[teamName] = \`${htmlTemplate}\`;
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

      code = code.substring(0, startIdx) + replacementStr + code.substring(endIdx + "    }).join('');".length);
      fs.writeFileSync('app.js', code);
      console.log('Patched UI for Zone layout successfully');
    }
  } else {
    console.log('End not found');
  }
}
