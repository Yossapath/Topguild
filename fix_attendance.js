const fs = require('fs');
let code = fs.readFileSync('module_attendance.js', 'utf8');

const regex = /\/\/ Apply specific filters\s+if \(action === 'mainField'\) \{/;
const replacementStr = `// Apply specific filters
      if (action === 'mainField' || action === 'dungeonTeam' || action === 'dungeonQueue') {
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
        const todayDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
        if (window.leaveData && window.leaveData.length > 0) {
          allMembers = allMembers.filter(m => {
            const isOnLeave = window.leaveData.some(l =>
              l.name?.trim().toLowerCase() === m.name?.trim().toLowerCase() &&
              (l.date === todayStr || l.day === todayDay)
            );
            return !isOnLeave;
          });
        }
      }
      
      if (action === 'mainField') {`;

if (code.match(regex)) {
  code = code.replace(regex, replacementStr);
  fs.writeFileSync('module_attendance.js', code);
  console.log('Fixed module_attendance.js leave filter');
} else {
  console.log('regex NOT MATCHED in module_attendance.js');
}
