const fs = require('fs');
const mockEnv = `
global.window = {
  location: { search: '' },
  addEventListener: () => {},
  document: {
    addEventListener: () => {},
    getElementById: () => ({ addEventListener: () => {}, style: {}, classList: { add: () => {}, remove: () => {} }, querySelectorAll: () => [] }),
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } })
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  navigator: { userAgent: '' },
  exportMainFieldPDF: null
};
global.document = window.document;
global.localStorage = window.localStorage;
`;
const appJsCode = fs.readFileSync('app.js', 'utf8');
fs.writeFileSync('test_run.js', mockEnv + appJsCode);
console.log('Created test_run.js');
