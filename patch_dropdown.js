const fs = require('fs');

function patchFile(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  
  // Patch occupiedMap filter to ignore slotKey starting with '2|'
  const target1 = `if (window.occupiedMap && window.occupiedMap.has(lowerName)) {`;
  const replace1 = `if (window.occupiedMap && window.occupiedMap.has(lowerName)) {
          if (slotKey && slotKey.startsWith('2|')) return true; // Offline slots can select anyone`;
          
  const target2 = `if (window.occupiedMap.get(lowerName) !== slotKey) return false;`;
  const replace2 = `const occKey = window.occupiedMap.get(lowerName);
            if (occKey !== slotKey && !(slotKey && slotKey.startsWith('2|'))) return false;`;

  // module_auth has:
  // if (window.occupiedMap.get(lowerName) !== slotKey) return false;
  // module_attendance has:
  // const occKey = window.occupiedMap.get(lowerName);
  // if (occKey === slotKey) return true;
  // return false;

  if (filename === 'module_auth.js') {
    code = code.replace(target2, replace2);
  } else if (filename === 'module_attendance.js') {
    const target3 = `const occKey = window.occupiedMap.get(lowerName);
            // Allow if it's the SAME slot they are currently focused on
            if (occKey === slotKey) return true;
            // Otherwise, they are assigned somewhere else -> hide from dropdown
            return false;`;
    const replace3 = `const occKey = window.occupiedMap.get(lowerName);
            // Allow if it's the SAME slot they are currently focused on
            if (occKey === slotKey) return true;
            if (slotKey && slotKey.startsWith('2|')) return true;
            // Otherwise, they are assigned somewhere else -> hide from dropdown
            return false;`;
    code = code.replace(target3, replace3);
  }

  // Also patch the leaveData filter so you CAN select people who are on leave for the Offline tab
  // (Maybe they are on leave but they also want to list them as offline? Actually, leaveData filter applies to 'mainField').
  // We can just bypass it.
  const targetLeave = `if (action === 'mainField' || action === 'dungeonTeam' || action === 'dungeonQueue') {`;
  const replaceLeave = `if (action === 'mainField' || action === 'dungeonTeam' || action === 'dungeonQueue') {
        const slotKeyForLeave = inputEl.getAttribute('data-slot');
        if (slotKeyForLeave && slotKeyForLeave.startsWith('2|')) {
          // skip leave filter for Offline tab
        } else {`;
  const targetLeaveEnd = `return !isOnLeave;
          });
        }`;
  const replaceLeaveEnd = `return !isOnLeave;
          });
        }
        }`;
        
  code = code.replace(targetLeave, replaceLeave);
  code = code.replace(targetLeaveEnd, replaceLeaveEnd);

  fs.writeFileSync(filename, code);
  console.log('Patched ' + filename);
}

patchFile('module_auth.js');
patchFile('module_attendance.js');
