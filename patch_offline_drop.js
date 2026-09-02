const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

const searchOffTr = `        <tr>
          <td style="width: 50px; text-align: center;`;
const replaceOffTr = `        <tr ondragover="window.onSlotDragOver(event)" ondragleave="window.onSlotDragLeave(event)" ondrop="window.onTeamSlotDrop(event, '\${key}')">
          <td style="width: 50px; text-align: center;`;

if (html.includes(searchOffTr)) {
    html = html.replace(searchOffTr, replaceOffTr);
    fs.writeFileSync('app.js', html);
    console.log('Fixed offline TR drop zones');
} else {
    console.log('Could not find offline TR');
}
