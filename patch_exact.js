const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const target = `.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: monospace;
  font-size: 12.5px;
  background: var(--bg-soft);
  color: var(--text-hi);
  transition: all 0.2s ease;
}`;

const replacement = `.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-display), sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  background: var(--bg-soft);
  color: var(--blue-900);
  transition: all 0.2s ease;
}`;

// replace all whitespace variations using a regex that ignores whitespace differences
const regexTarget = target.replace(/\s+/g, '\\s+').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
css = css.replace(new RegExp(regexTarget), replacement);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('patched exactly');
