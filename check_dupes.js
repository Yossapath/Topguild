const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Check if pages are duplicated (happens when the reorder script inserted them twice)
const ids = ['page-roster','page-teams','page-dungeons','page-attendance','page-leave','page-settings'];
ids.forEach(id => {
  const marker = 'id="' + id + '"';
  let count = 0;
  let pos = 0;
  while (true) {
    const idx = html.indexOf(marker, pos);
    if (idx === -1) break;
    count++;
    pos = idx + marker.length;
  }
  console.log(id, ':', count, 'occurrences');
});
