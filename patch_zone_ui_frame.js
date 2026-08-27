const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const targetStr = `<div class="zone-column" style="display:flex; flex-direction:column; gap:16px;">`;
const replacementStr1 = `<div class="zone-column" style="display:flex; flex-direction:column; gap:16px; border: 3px solid var(--blue-700); border-radius: 16px; padding: 16px; background: rgba(37, 99, 235, 0.03); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">`;

const targetStr2 = `<div class="zone-column" style="display:flex; flex-direction:column; gap:16px;">`; // There are two of these

code = code.replace(targetStr, replacementStr1);
code = code.replace(targetStr2, replacementStr1);

fs.writeFileSync('app.js', code);
console.log('Added UI frames to zones');
