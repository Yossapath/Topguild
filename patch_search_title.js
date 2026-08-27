const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

const searchRegex = /const fieldTitle = fieldMeta\[foundFieldIdx\]\.isMain \? "สนามหลัก" : "สนามรอง";/;
const searchReplace = `const fieldTitle = foundFieldIdx === 2 ? "ออฟไลน์" : (fieldMeta[foundFieldIdx].isMain ? "สนามหลัก" : "สนามรอง");`;

if (code.match(searchRegex)) {
  code = code.replace(searchRegex, searchReplace);
  fs.writeFileSync('app.js', code);
  console.log('Patched handleTeamSearch title');
} else {
  console.log('Match failed for handleTeamSearch');
}
