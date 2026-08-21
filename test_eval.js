const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');
code = code.replace(/import\s+.*?from\s+['"].*?['"];/g, ''); // strip imports
try {
  // provide mock window, document
  global.window = { addEventListener: () => {}, location: {} };
  global.document = { 
    getElementById: () => ({ addEventListener: () => {}, style: {} }),
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
  eval(code);
  console.log("No global execution errors.");
} catch(e) {
  console.error("ERROR:", e);
}
