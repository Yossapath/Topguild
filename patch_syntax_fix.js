const fs = require('fs');
let code = fs.readFileSync('module_dungeon.js', 'utf8');

// Fix: the if block is missing closing brace before schedule code
// Line 862-866:
//     if (typeof setupDungeonFirebase === "function" && !window._dungeonReady) {
//       window._dungeonReady = true;
//       await setupDungeonFirebase();
//     // ====== DUNGEON BOOKING SCHEDULE ======   <-- WRONG: missing }
const broken = `    if (typeof setupDungeonFirebase === "function" && !window._dungeonReady) {
      window._dungeonReady = true;
      await setupDungeonFirebase();
    // ====== DUNGEON BOOKING SCHEDULE ======`;

const fixed = `    if (typeof setupDungeonFirebase === "function" && !window._dungeonReady) {
      window._dungeonReady = true;
      await setupDungeonFirebase();
    }
    // ====== DUNGEON BOOKING SCHEDULE ======`;

if (code.includes(broken)) {
  code = code.replace(broken, fixed);
  fs.writeFileSync('module_dungeon.js', code);
  console.log('Fixed missing closing brace!');
} else {
  console.log('Pattern not found exactly, trying partial search...');
  const idx = code.indexOf('await setupDungeonFirebase();\n    // ====== DUNGEON BOOKING SCHEDULE ======');
  console.log('Found at:', idx);
  if (idx !== -1) {
    code = code.replace(
      'await setupDungeonFirebase();\n    // ====== DUNGEON BOOKING SCHEDULE ======',
      'await setupDungeonFirebase();\n    }\n    // ====== DUNGEON BOOKING SCHEDULE ======'
    );
    fs.writeFileSync('module_dungeon.js', code);
    console.log('Fixed with partial match!');
  }
}
