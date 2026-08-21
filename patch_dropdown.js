const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const oldDropdown = `<select class="form-control" style="width:100%; min-width:100px; padding:4px;" \${isAdmin ? '' : 'disabled'} onchange="updateAttendanceStatus('\${selectedDate}', '\${escapedName}', this.value)">
           <option value="absent" \${status === 'absent' ? 'selected' : ''}>❌ ขาด</option>
           <option value="attended" \${status === 'attended' ? 'selected' : ''}>✅ มา</option>
           <option value="leave" \${status === 'leave' ? 'selected' : ''}>🟡 ลา</option>
         </select>`;

const newDropdown = `<select class="form-control" style="width:100%; min-width:100px; padding:4px;" \${isAdmin ? '' : 'disabled'} onchange="updateAttendanceStatus('\${selectedDate}', '\${escapedName}', this.value)">
           <option value="none" \${!status || status === 'none' ? 'selected' : ''}>--- เว้นว่าง ---</option>
           <option value="attended" \${status === 'attended' ? 'selected' : ''}>✅ เข้าร่วม</option>
           <option value="absent" \${status === 'absent' ? 'selected' : ''}>❌ ขาด</option>
           <option value="leave" \${status === 'leave' ? 'selected' : ''}>🟡 ลา</option>
         </select>`;

code = code.replace(oldDropdown, newDropdown);

// Also need to fix where `const status = dayData[m.name] || 'absent';` is defined
const oldStatusLine = "const status = dayData[m.name] || 'absent';";
const newStatusLine = "const status = dayData[m.name] || 'none';";
code = code.replace(oldStatusLine, newStatusLine);

fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('Fixed dropdown options');
