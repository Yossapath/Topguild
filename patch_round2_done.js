const fs = require('fs');
let html = fs.readFileSync('module_dungeon.js', 'utf8');

const search = `          if (roundNumber === 2) q.round2 = !q.round2;`;
const replace = `          if (roundNumber === 2) {
            q.round2 = !q.round2;
            if (q.round2) q.status = 'done';
          }`;

if (html.includes(search)) {
  html = html.replace(search, replace);
  fs.writeFileSync('module_dungeon.js', html);
  console.log('Added auto-done logic for Round 2');
} else {
  console.log('Search string not found');
}
