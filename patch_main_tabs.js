const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const regex = /\.main-tabs\s*\{[\s\S]*?\}/;
const replace = `.main-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--line);
  padding-bottom: 12px;
  overflow-x: auto;
  white-space: nowrap;
  flex-wrap: wrap;
  justify-content: center;
}`;

css = css.replace(regex, replace);
fs.writeFileSync('styles.css', css, 'utf8');
console.log('Patched main-tabs css');
