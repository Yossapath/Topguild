const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<button type="button" class="btn-config-toggle btn-blue-theme" id="btnAdminUsers"/g, '<button type="button" class="btn-solid-blue" id="btnAdminUsers"');
fs.writeFileSync('index.html', html, 'utf8');
