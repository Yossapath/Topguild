const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Change Mastersmith to Merchant
html = html.replace(/<option value="Mastersmith">Mastersmith<\/option>/g, '<option value="Merchant">Merchant</option>');
fs.writeFileSync('index.html', html);
console.log('Changed Mastersmith to Merchant in index.html');

let appJs = fs.readFileSync('app.js', 'utf8');
appJs = appJs.replace(/Mastersmith/g, 'Merchant');
fs.writeFileSync('app.js', appJs);
console.log('Changed Mastersmith to Merchant in app.js');

let moduleDungeonJs = fs.readFileSync('module_dungeon.js', 'utf8');
moduleDungeonJs = moduleDungeonJs.replace(/Mastersmith/g, 'Merchant');
fs.writeFileSync('module_dungeon.js', moduleDungeonJs);
console.log('Changed Mastersmith to Merchant in module_dungeon.js');
