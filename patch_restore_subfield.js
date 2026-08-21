const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const targetStr = `  fieldMeta = teamsData.map(group => {
    const rawNames = Object.keys(group.teams);
    const sortedNames = sortTeamNames(rawNames);
    return {
      title: group.title,
      isMain: group.title.indexOf('Priest') !== -1,
      teamNames: sortedNames,
      capacity: Object.fromEntries(sortedNames.map(t => [t, group.teams[t].length]))
    };
  });`;

const replaceStr = `  // Ensure we always have exactly two fields if teamsData is corrupted
  let safeTeamsData = teamsData;
  if (safeTeamsData.length === 1) {
    // Restore empty Sub Field if it got deleted
    safeTeamsData.push({
      "title": "สนามรอง",
      "teams": { "ทีม 1": [] }
    });
  }

  fieldMeta = safeTeamsData.map(group => {
    const rawNames = Object.keys(group.teams);
    const sortedNames = sortTeamNames(rawNames);
    return {
      title: group.title || (group.isMain ? 'สนามหลัก' : 'สนามรอง'),
      isMain: group.title && group.title.indexOf('Priest') !== -1 || group.isMain,
      teamNames: sortedNames,
      capacity: Object.fromEntries(sortedNames.map(t => [t, group.teams[t].length]))
    };
  });
  
  // Force 2 fields minimum
  if (fieldMeta.length < 2) {
    fieldMeta[0] = fieldMeta[0] || { title: 'สนามหลัก', isMain: true, teamNames: ['ทีม 1'], capacity: {'ทีม 1': 5} };
    fieldMeta[1] = { title: 'สนามรอง', isMain: false, teamNames: ['ทีม 1'], capacity: {'ทีม 1': 5} };
  }`;

js = js.replace(targetStr, replaceStr);

fs.writeFileSync('app.js', js, 'utf8');
console.log('Patched restore subfield');
