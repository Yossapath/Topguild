const fs = require('fs');

// 1. Fix index.html: make tab buttons square (no border-radius)
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(
  `<div id="dungeonTabsContainer" style="display: flex; background: var(--bg-card);">
        <button type="button" class="dungeon-tab active" data-type="มายา (Maya)" onclick="switchDungeonTab('มายา (Maya)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid var(--blue-700); background:white; cursor:pointer;">มายา (Maya)</button>
        <button type="button" class="dungeon-tab" data-type="บับเบิ้ล (Bubble)" onclick="switchDungeonTab('บับเบิ้ล (Bubble)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid transparent; background:white; cursor:pointer;">บับเบิ้ล (Bubble)</button>
        <button type="button" class="dungeon-tab" data-type="กระจก (Mirror)" onclick="switchDungeonTab('กระจก (Mirror)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid transparent; background:white; cursor:pointer;">กระจก (Mirror)</button>
      </div>`,
  `<div id="dungeonTabsContainer" style="display: flex; background: white; border-bottom: 2px solid var(--line);">
        <button type="button" class="dungeon-tab active" data-type="มายา (Maya)" onclick="switchDungeonTab('มายา (Maya)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-right:1px solid var(--line); border-bottom:3px solid var(--blue-700); background:white; cursor:pointer;">มายา (Maya)</button>
        <button type="button" class="dungeon-tab" data-type="บับเบิ้ล (Bubble)" onclick="switchDungeonTab('บับเบิ้ล (Bubble)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-right:1px solid var(--line); border-bottom:3px solid transparent; background:white; cursor:pointer;">บับเบิ้ล (Bubble)</button>
        <button type="button" class="dungeon-tab" data-type="กระจก (Mirror)" onclick="switchDungeonTab('กระจก (Mirror)')" style="flex:1; padding:13px; font-size:15px; font-weight:700; border-radius:0; border:none; border-bottom:3px solid transparent; background:white; cursor:pointer;">กระจก (Mirror)</button>
      </div>`
);
fs.writeFileSync('index.html', html);
console.log('Patched tabs in index.html');

// 2. Fix module_dungeon.js: make badges square
let code = fs.readFileSync('module_dungeon.js', 'utf8');
// Job badge: border-radius:6px -> border-radius:3px
code = code.replace(
  'height:30px;padding:0 10px;border-radius:6px;display:inline-flex;align-items:center;white-space:nowrap;">${q.job',
  'height:30px;padding:0 10px;border-radius:3px;display:inline-flex;align-items:center;white-space:nowrap;">${q.job'
);
// Status badge: border-radius:20px -> border-radius:3px
code = code.replace(
  'height:30px;padding:0 12px;border-radius:20px;display:inline-flex;align-items:center;white-space:nowrap;background:white;">${sText}',
  'height:30px;padding:0 12px;border-radius:3px;display:inline-flex;align-items:center;white-space:nowrap;background:white;">${sText}'
);
// Buttons: border-radius:6px -> border-radius:3px for queue action buttons
code = code.replace(/height:30px;padding:0 14px;border:none;background:var\(--ok\);color:white;border-radius:6px/g,
  'height:30px;padding:0 14px;border:none;background:var(--ok);color:white;border-radius:3px');
code = code.replace(/height:30px;padding:0 14px;border:1\.5px solid var\(--danger\);background:transparent;color:var\(--danger\);border-radius:6px/g,
  'height:30px;padding:0 14px;border:1.5px solid var(--danger);background:transparent;color:var(--danger);border-radius:3px');

fs.writeFileSync('module_dungeon.js', code);
console.log('Patched badge/button radius in module_dungeon.js');
