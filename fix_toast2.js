const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /function showToast\(message, type = 'info'\) \{\s*const container = document\.getElementById\('toastContainer'\);\s*if \(!container\) return;/;
const replacementStr = `function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container'; // Use the CSS class from styles.css
    document.body.appendChild(container);
  }`;

if (code.match(regex)) {
  code = code.replace(regex, replacementStr);
  fs.writeFileSync('app.js', code);
  console.log('Fixed showToast REALLY THIS TIME');
} else {
  console.log('regex NOT MATCHED');
}
