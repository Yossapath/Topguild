const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

js = js.replace(/function showGlobalDropdown\(inputEl, filterText = ''\) \{/, `function showGlobalDropdown(inputEl, filterText = '') {
  try {`);
js = js.replace(/window\.activeAutocompleteInput = inputEl;\s*\}/, `window.activeAutocompleteInput = inputEl;
  } catch(e) {
    console.error('Dropdown Error:', e);
  }
}`);
fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Added try-catch to dropdown');
