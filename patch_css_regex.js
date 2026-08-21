const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(
  /\.form-control\s*\{[\s\S]*?\}/,
  `.form-control {
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
}`
);

css = css.replace(
  /\[data-theme="dark"\]\s*\.form-control\s*\{[\s\S]*?\}/,
  `[data-theme="dark"] .form-control {
  background-color: #0a0a0d !important;
  color: #f8fafc !important;
  border-color: #1a1a22 !important;
}`
);

css = css.replace(
  /textarea\.form-control\s*\{[\s\S]*?\}/,
  `textarea.form-control {
  min-height: 140px;
  resize: vertical;
  font-family: monospace;
  font-size: 13px;
  font-weight: 400;
}`
);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('patched with regex');
