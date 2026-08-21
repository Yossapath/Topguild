const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

js = js.replace('function renderAll() {', 'function renderAll() {\n  if (typeof buildFieldTabs === "function") buildFieldTabs();');

fs.writeFileSync('app.js', js, 'utf8');
console.log('Added buildFieldTabs call');
