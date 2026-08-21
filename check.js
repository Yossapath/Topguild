const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = html.split('<section id="page-dungeons"');
console.log('Number of page-dungeons sections: ' + (matches.length - 1));

// Also let's check auth_dungeon.js render function
const auth = fs.readFileSync('auth_dungeon.js', 'utf8');
const renderFunc = auth.substring(auth.indexOf('function renderDungeonPage()'), auth.indexOf('function openDungeonQueueModal'));
console.log('renderDungeonPage length: ' + renderFunc.length);
