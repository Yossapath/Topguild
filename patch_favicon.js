const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const faviconTag = `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚔️</text></svg>">`;

if (!html.includes('rel="icon"')) {
  html = html.replace('<head>', '<head>\n  ' + faviconTag);
  fs.writeFileSync('index.html', html);
  console.log('Added favicon');
} else {
  console.log('Favicon already exists');
}
