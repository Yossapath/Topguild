const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const targetStr = `function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;`;

const replacementStr = `function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container'; // Use the CSS class from styles.css
    document.body.appendChild(container);
  }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('app.js', code);
console.log('Fixed showToast to dynamically create container');
