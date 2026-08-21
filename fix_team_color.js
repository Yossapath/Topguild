const fs = require('fs');
let txt = fs.readFileSync('module_dungeon.js', 'utf8');

txt = txt.replace(
  /<span style="color:var\(--text-lo\); font-size:14px; font-weight:normal; margin-left:8px;">\(ทีมที่ /g,
  '<span style="color:white; font-size:14px; font-weight:normal; margin-left:8px;">(ทีมที่ '
);

// Also look for purple text if it exists and change it if the user meant that?
// "ชื่อของ สีทีมที่ ขอเป็นสีขาว ให้มองเห็นชัดเจน" -> The name of the Team Color, please make it white so it's clearly visible.
// In Dungeon Queue list, I added purple text: sColor = '#8b5cf6'; sText = 'อยู่ในทีม ' + inTeamIndex;
// If the user wants the "อยู่ในทีม X" to be white instead of purple? "ชื่อของ สีทีมที่" (Name of Team Color). 
// Let's also change the purple text to white if they meant that, or just keep it purple?
// Wait, "สีทีมที่ ขอเป็นสีขาว" (Color of "Team" please make white). They explicitly said "ทีมที่". So the "(ทีมที่ X)" text.
// Let's change both to be safe and visible.

txt = txt.replace(
  /sColor = '#8b5cf6'; \/\/ Purple/g,
  "sColor = '#ffffff'; // White"
);

fs.writeFileSync('module_dungeon.js', txt, 'utf8');
console.log('Fixed team color!');
