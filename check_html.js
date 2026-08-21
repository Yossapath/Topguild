const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const onclicks = html.match(/onclick="([^"]+)"/g) || [];
const calls = onclicks.map(c => c.match(/([a-zA-Z0-9_]+)\(/)?.[1]).filter(Boolean);
console.log([...new Set(calls)]);
