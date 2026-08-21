const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<div style="position: relative;">\s*<input type="text" id="dqName" class="form-control" placeholder="🔍 พิมพ์ชื่อ หรือคลิกเพื่อเลือก\.\.\." autocomplete="off" style="margin-bottom: 8px; cursor: text;">\s*<div id="dqNameDropdown" class="custom-dropdown" style="display:none; position:absolute; top: 38px; left:0; right:0; max-height:220px; overflow-y:auto; background:var\(--surface\); border:1px solid var\(--blue-500\); border-radius:8px; z-index:9999; box-shadow:0 6px 16px rgba\(0,0,0,0\.12\);">\s*<\/div>\s*<\/div>/;

const replacement = `<div style="position: relative; margin-bottom: 8px;">
  <input type="text" id="dqName" class="form-control autocomplete-member" data-action="dungeonQueue" placeholder="🔍 พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off">
</div>`;

if (html.match(regex)) {
  html = html.replace(regex, replacement);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Fixed dqName in index.html');
} else {
  console.log('Could not match dqName regex in index.html');
}
