const fs = require('fs');
let html = fs.readFileSync('app.js', 'utf8');

const search = '<svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
const replace = '<svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events: none;">';

html = html.split(search).join(replace);

fs.writeFileSync('app.js', html);
console.log('Done');
