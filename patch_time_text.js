const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace Open time input
html = html.replace(
  `<input type="time" id="dqOpenTime" lang="sv-SE" value="06:00" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px;">`,
  `<input type="text" id="dqOpenTime" value="06:00" placeholder="06:00" maxlength="5" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" oninput="this.value=this.value.replace(/[^0-9:]/g,'')" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px; width:80px;">`
);

// Replace Close time input
html = html.replace(
  `<input type="time" id="dqCloseTime" lang="sv-SE" value="23:59" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px;">`,
  `<input type="text" id="dqCloseTime" value="23:59" placeholder="23:59" maxlength="5" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" oninput="this.value=this.value.replace(/[^0-9:]/g,'')" style="flex:1; padding:6px 8px; border:1px solid var(--line); border-radius:4px; font-size:13px; width:80px;">`
);

// Verify
const openOk = html.includes('id="dqOpenTime"') && html.includes('type="text"');
const closeOk = html.includes('id="dqCloseTime"') && html.includes('type="text"');
console.log('dqOpenTime -> text:', openOk);
console.log('dqCloseTime -> text:', closeOk);

fs.writeFileSync('index.html', html);
console.log('Done');
