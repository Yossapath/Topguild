const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

const oldLogic = `       if (status === 'attended') joinedCount++;
       else if (status === 'leave') leaveCount++;
       else absentCount++;`;

const newLogic = `       if (status === 'attended') joinedCount++;
       else if (status === 'leave') leaveCount++;
       else if (status === 'absent') absentCount++;`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('Fixed absent count logic');
