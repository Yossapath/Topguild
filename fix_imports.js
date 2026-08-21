const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// Merge the two imports into one
const oldImport1 = `import { doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";`;
const oldImport2 = `import { collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";`;
const mergedImport = `import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";`;

code = code.replace(oldImport2, ''); // remove second import
code = code.replace(oldImport1, mergedImport); // merge into first

// Also remove the duplicate import line in leaveCode if any
fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('Merged duplicate imports');
