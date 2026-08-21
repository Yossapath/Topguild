const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const ids = ['page-roster','page-teams','page-dungeons','page-attendance','page-leave','page-settings'];
ids.forEach(id => {
  const pos = html.indexOf('id="' + id + '"');
  console.log(id, '-> char', pos);
});
