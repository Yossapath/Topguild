const fs = require('fs');
// module_auth.js has a duplicate import. Remove the second one.
let txt = fs.readFileSync('module_auth.js', 'utf8');

const IMPORT = `import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";`;

// Find first occurrence and remove the second
const firstIdx = txt.indexOf(IMPORT);
const secondIdx = txt.indexOf(IMPORT, firstIdx + IMPORT.length);

if (secondIdx !== -1) {
  txt = txt.substring(0, secondIdx) + txt.substring(secondIdx + IMPORT.length).replace(/^\r?\n/, '');
  fs.writeFileSync('module_auth.js', txt, 'utf8');
  console.log('Removed duplicate import OK');
} else {
  console.log('No duplicate found (already clean)');
}
