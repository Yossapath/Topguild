const fs = require('fs');

let authModule = fs.readFileSync('module_auth.js', 'utf8');

// Strip out existing if any
const cleanupStart = authModule.indexOf('// ====== SHARED: Global Autocomplete Dropdown');
if (cleanupStart !== -1) {
    authModule = authModule.substring(0, cleanupStart);
}

const authDungeonTxt = fs.readFileSync('auth_dungeon.js', 'utf8');
const start = authDungeonTxt.indexOf('function showGlobalDropdown(');
const end = authDungeonTxt.indexOf('// ====== LEAVE SYSTEM');

if (start !== -1 && end !== -1) {
    // Also remove the "window.activeAutocompleteInput = null" from the end of auth_dungeon.js part if it's there
    let code = authDungeonTxt.substring(start, end);
    // Remove the extra window.setupLeaveFirebase = ... if we accidentally caught it
    const lastValidFunc = code.lastIndexOf('}');
    if (lastValidFunc !== -1) {
       code = code.substring(0, lastValidFunc + 1);
    }
    
    // EXPORT IT TO WINDOW SO IT CAN BE CALLED GLOBALLY
    // Even though it's inside a module, we can just attach it to window.
    code = code.replace('function showGlobalDropdown(', 'window.showGlobalDropdown = function(');

    authModule += '\n// ====== SHARED: Global Autocomplete Dropdown ======\nwindow.activeAutocompleteInput = null;\n' + code + '\n';
    
    authModule += `
document.addEventListener("input", (e) => { 
  if (e.target && e.target.classList.contains("autocomplete-member")) { 
    if (typeof window.showGlobalDropdown === "function") window.showGlobalDropdown(e.target, e.target.value.trim()); 
  } 
}); 
document.addEventListener("focusin", (e) => { 
  if (e.target && e.target.classList.contains("autocomplete-member")) { 
    if (typeof window.showGlobalDropdown === "function") window.showGlobalDropdown(e.target, e.target.value.trim()); 
  } 
}); 
document.addEventListener("focusout", (e) => { 
  if (e.target && e.target.classList.contains("autocomplete-member")) { 
    setTimeout(() => { 
      const dropdown = document.getElementById("globalMemberDropdown"); 
      if (dropdown) dropdown.style.display = "none"; 
    }, 150); 
  } 
}); 
window.addEventListener("scroll", (e) => { 
  const dropdown = document.getElementById("globalMemberDropdown"); 
  if (dropdown && dropdown.style.display === "block") { 
    if (!dropdown.contains(e.target)) { 
      dropdown.style.display = "none"; 
    } 
  } 
}, true);
`;
    fs.writeFileSync('module_auth.js', authModule, 'utf8');
    console.log('Fixed dropdown perfectly!');
} else {
    console.log('Bounds not found');
}
