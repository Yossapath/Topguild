const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('<div id="dungeonTabsContainer"');
if (idx === -1) { console.log('Not found'); process.exit(1); }

// Find end of this div
let depth = 0, i = idx, endIdx = -1;
while (i < html.length) {
  if (html.slice(i, i+4) === '<div') depth++;
  else if (html.slice(i, i+6) === '</div>') {
    depth--;
    if (depth === 0) { endIdx = i + 6; break; }
  }
  i++;
}

console.log('Found tab container at', idx, 'to', endIdx);

const newTabs = `<div id="dungeonTabsContainer" style="display: flex; background: white; border-bottom: 2px solid var(--line);">
        <button type="button" class="dungeon-tab active" data-type="มายา (Maya)" onclick="switchDungeonTab('มายา (Maya)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-right:1px solid var(--line); border-bottom:3px solid var(--blue-700); background:white; cursor:pointer;">มายา (Maya)</button>
        <button type="button" class="dungeon-tab" data-type="บับเบิ้ล (Bubble)" onclick="switchDungeonTab('บับเบิ้ล (Bubble)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-right:1px solid var(--line); border-bottom:3px solid transparent; background:white; cursor:pointer;">บับเบิ้ล (Bubble)</button>
        <button type="button" class="dungeon-tab" data-type="กระจก (Mirror)" onclick="switchDungeonTab('กระจก (Mirror)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid transparent; background:white; cursor:pointer;">กระจก (Mirror)</button>
      </div>`;

html = html.slice(0, idx) + newTabs + html.slice(endIdx);
fs.writeFileSync('index.html', html);
console.log('Done - tabs are now square');
