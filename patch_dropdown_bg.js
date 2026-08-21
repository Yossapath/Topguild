const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<div id="globalMemberDropdown" class="custom-dropdown" style="display:none; position:fixed; z-index:99999; max-height:250px; overflow-y:auto; width:200px; box-shadow: 0 4px 12px rgba\(0,0,0,0\.2\);"><\/div>/;
const replace = `<div id="globalMemberDropdown" class="custom-dropdown" style="display:none; position:fixed; z-index:99999; max-height:250px; overflow-y:auto; width:200px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); background-color: var(--surface); border: 1px solid var(--line);"></div>`;

if (html.match(regex)) {
  html = html.replace(regex, replace);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Fixed background in HTML');
} else {
  console.log('Regex not found in HTML, trying alternative');
  html = html.replace('box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>', 'box-shadow: 0 4px 12px rgba(0,0,0,0.2); background-color: var(--surface); border: 1px solid var(--line);"></div>');
  fs.writeFileSync('index.html', html, 'utf8');
}
