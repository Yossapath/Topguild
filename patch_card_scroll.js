const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(
  '.team-card {\n    min-width: 100% !important;\n  }',
  '.team-card {\n    min-width: 100% !important;\n    overflow-x: auto;\n  }'
);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('Added overflow-x auto to team-card');
