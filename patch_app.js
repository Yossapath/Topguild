const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const regex = /fieldMeta = teamsData\.map\(group => \{[\s\S]*?\}\);/;

const replacement = `
  // Ensure we always have exactly two fields if teamsData is corrupted
  let safeTeamsData = teamsData;
  if (!safeTeamsData || safeTeamsData.length === 0) {
     safeTeamsData = [];
  }
  if (safeTeamsData.length === 1) {
    // Restore empty Sub Field if it got deleted
    safeTeamsData.push({
      "title": "สนามรอง",
      "teams": { "ทีม 1": [{},{},{},{},{}] }
    });
  }

  fieldMeta = safeTeamsData.map((group, idx) => {
    const rawNames = Object.keys(group.teams);
    const sortedNames = sortTeamNames(rawNames);
    const isMainField = group.title ? group.title.indexOf('Priest') !== -1 : (idx === 0);
    return {
      title: group.title || (isMainField ? 'สนามหลัก' : 'สนามรอง'),
      isMain: isMainField,
      teamNames: sortedNames,
      capacity: Object.fromEntries(sortedNames.map(t => [t, group.teams[t].length]))
    };
  });
  
  // Force 2 fields minimum fallback
  if (fieldMeta.length < 2) {
    fieldMeta[0] = fieldMeta[0] || { title: 'สนามหลัก', isMain: true, teamNames: ['ทีม 1'], capacity: {'ทีม 1': 5} };
    fieldMeta[1] = { title: 'สนามรอง', isMain: false, teamNames: ['ทีม 1'], capacity: {'ทีม 1': 5} };
  }
`;

js = js.replace(regex, replacement.trim());
fs.writeFileSync('app.js', js, 'utf8');
console.log("Patched app.js");
