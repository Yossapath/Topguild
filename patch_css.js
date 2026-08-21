const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// Update .form-control base
const oldFormControl = `.form-control {
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

const newFormControl = `.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font-family: var(--font-display), sans-serif;
  font-size: 14px;
  font-weight: 700;
  background: var(--bg-soft);
  color: var(--blue-900);
  transition: all 0.2s ease;
}`;

css = css.replace(oldFormControl, newFormControl);

// Keep textarea as monospace just in case it's used for JSON/data import
const oldTextarea = `textarea.form-control {
  min-height: 140px;
  resize: vertical;
}`;

const newTextarea = `textarea.form-control {
  min-height: 140px;
  resize: vertical;
  font-family: monospace;
  font-weight: normal;
  font-size: 13px;
}`;

css = css.replace(oldTextarea, newTextarea);

// Update dark mode .form-control color
const oldDarkForm = `[data-theme="dark"] .form-control {
  background-color: #0a0a0d !important;
  color: #94a3b8 !important;
  border-color: #1a1a22 !important;
}`;

const newDarkForm = `[data-theme="dark"] .form-control {
  background-color: #0a0a0d !important;
  color: #f8fafc !important;
  border-color: #1a1a22 !important;
}`;

css = css.replace(oldDarkForm, newDarkForm);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('patched styles.css');
