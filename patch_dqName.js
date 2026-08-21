const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace dqName HTML to use the global autocomplete
const oldDqHTML = `<div style="position:relative;">
            <input type="text" id="dqName" class="form-control" placeholder="🔍 พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off">
            <div id="dqNameDropdown" class="custom-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:100;"></div>
          </div>`;
const newDqHTML = `<div>
            <input type="text" id="dqName" class="form-control autocomplete-member" data-action="dungeonQueue" placeholder="🔍 พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off">
          </div>`;

if (html.includes('id="dqNameDropdown"')) {
  html = html.replace(oldDqHTML, newDqHTML);
  fs.writeFileSync('index.html', html, 'utf8');
}

let js = fs.readFileSync('auth_dungeon.js', 'utf8');
// Extend globalActionLogic
const addDungeonQueueAction = `} else if (action === 'dungeonQueue') {
             const job = item.getAttribute('data-job');
             const dqClass = document.getElementById('dqClass');
             if (dqClass) dqClass.value = job;
          }`;
js = js.replace(/\} else if \(action === 'leaveForm'\) \{[\s\S]*?\}/, `$& ${addDungeonQueueAction}`);

// REMOVE the old dqNameDropdown logic from auth_dungeon.js
const oldJsRegex = /const dqNameInput = document\.getElementById\('dqName'\);[\s\S]*?dqNameInput\.addEventListener\('blur', \(\) => \{[\s\S]*?\}\);\s*\}/;
js = js.replace(oldJsRegex, '// Old dqName dropdown removed');

fs.writeFileSync('auth_dungeon.js', js, 'utf8');

console.log('Fixed Dungeon Queue Input');
