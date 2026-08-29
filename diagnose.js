const fs = require('fs');
const code = fs.readFileSync('module_dungeon.js', 'utf8');
const lines = code.split('\n');

// Track all { and } in the renderDungeonPage function
const startLine = lines.findIndex(l => l.includes('function renderDungeonPage'));
const endLine = lines.findIndex((l, i) => i > startLine + 5 && /^\s*\}\s*$/.test(l) && i > 700);

console.log('renderDungeonPage starts at line:', startLine + 1);

// Find all try/catch from startLine onwards
let depth = 0;
let tryStack = [];
for (let i = startLine; i < Math.min(endLine + 20, lines.length); i++) {
  const line = lines[i];
  // Count braces (rough)
  const opens = (line.match(/\{/g) || []).length;
  const closes = (line.match(/\}/g) || []).length;
  if (/\btry\s*\{/.test(line)) {
    tryStack.push({ line: i+1, depth });
    console.log('TRY opened at line', i+1, ':', line.trim());
  }
  if (/catch\s*\(/.test(line) || /finally\s*\{/.test(line)) {
    const t = tryStack.pop();
    if (t) console.log('  -> closed at line', i+1);
  }
  depth += opens - closes;
}

if (tryStack.length > 0) {
  console.log('\nUNCLOSED try blocks:', tryStack);
} else {
  console.log('\nAll try blocks have catch/finally');
}

// Check lines 560-610 for the qList section
console.log('\n--- Lines 560-610 ---');
for (let i = 559; i <= 609; i++) {
  console.log(i+1 + ': ' + lines[i]);
}
