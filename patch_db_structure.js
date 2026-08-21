const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

// 1. Update serializeTeamsState to return an object { main, sub }
const serializeRegex = /function serializeTeamsState\(\) \{\s*return fieldMeta\.map\(\(fm, fieldIdx\) => \{[\s\S]*?\}\);\s*\}/;

const replaceSerialize = `function serializeTeamsState() {
  const arr = fieldMeta.map((fm, fieldIdx) => {
    const teamsObj = {};
    const sortedNames = sortTeamNames(fm.teamNames);
    sortedNames.forEach(teamName => {
      const cap = fm.capacity[teamName];
      const slotList = [];
      for (let i = 0; i < cap; i++) {
        const key = slotKey(fieldIdx, teamName, i);
        const a = teamsAssignments[key];
        if (a && a.name) {
          slotList.push({ name: a.name, job: a.job, power: a.power });
        } else {
          slotList.push({ name: "", job: "", power: null });
        }
      }
      teamsObj[teamName] = slotList;
    });

    return {
      title: fm.title,
      isMain: fm.isMain,
      teams: teamsObj
    };
  });
  
  return {
    main: arr[0] || { title: 'สนามหลัก', isMain: true, teams: { "ทีม 1": [{},{},{},{},{}] } },
    sub: arr[1] || { title: 'สนามรอง', isMain: false, teams: { "ทีม 1": [{},{},{},{},{}] } }
  };
}`;
js = js.replace(serializeRegex, replaceSerialize);

// 2. Update toTeams to accept object format
const toTeamsRegex = /const toTeams = \(snap\) => \{\s*if \(\!snap\.exists\(\)\) return null;\s*const d = snap\.data\(\);\s*if \(d && Array\.isArray\(d\.data\) && d\.data\.length > 0\) return d\.data;\s*return null;\s*\};/;
const replaceToTeams = `const toTeams = (snap) => {
      if (!snap.exists()) return null;
      const d = snap.data();
      if (!d || !d.data) return null;
      if (Array.isArray(d.data) && d.data.length > 0) return d.data;
      if (typeof d.data === 'object') {
        const arr = [];
        if (d.data.main) arr.push(d.data.main);
        if (d.data.sub) arr.push(d.data.sub);
        if (arr.length > 0) return arr;
      }
      return null;
    };`;
js = js.replace(toTeamsRegex, replaceToTeams);

// 3. Update initTeamStructure to handle both Array and Object (for local storage / imports)
const initRegex = /function initTeamStructure\(teamsData\) \{[\s\S]*?\/\/ Force 2 fields minimum fallback[\s\S]*?fieldMeta\[1\] = \{ title: 'สนามรอง', isMain: false, teamNames: \['ทีม 1'\], capacity: \{'ทีม 1': 5\} \};\s*\}/;
const replaceInit = `function initTeamStructure(rawTeamsData) {
  let teamsData = [];
  if (Array.isArray(rawTeamsData)) {
    teamsData = rawTeamsData;
  } else if (rawTeamsData && typeof rawTeamsData === 'object') {
    if (rawTeamsData.main) teamsData.push(rawTeamsData.main);
    if (rawTeamsData.sub) teamsData.push(rawTeamsData.sub);
  }

  let safeTeamsData = teamsData;
  if (!safeTeamsData || safeTeamsData.length === 0) {
     safeTeamsData = [];
  }
  if (safeTeamsData.length === 1) {
    safeTeamsData.push({
      "title": "สนามรอง",
      "teams": { "ทีม 1": [{},{},{},{},{}] }
    });
  }

  fieldMeta = safeTeamsData.map((group, idx) => {
    const rawNames = Object.keys(group.teams || {});
    const sortedNames = sortTeamNames(rawNames);
    const isMainField = group.title ? group.title.indexOf('Priest') !== -1 : (idx === 0);
    return {
      title: group.title || (isMainField ? 'สนามหลัก' : 'สนามรอง'),
      isMain: isMainField,
      teamNames: sortedNames.length > 0 ? sortedNames : ['ทีม 1'],
      capacity: sortedNames.length > 0 ? Object.fromEntries(sortedNames.map(t => [t, group.teams[t].length])) : {'ทีม 1': 5}
    };
  });
  
  if (fieldMeta.length < 2) {
    fieldMeta[0] = fieldMeta[0] || { title: 'สนามหลัก', isMain: true, teamNames: ['ทีม 1'], capacity: {'ทีม 1': 5} };
    fieldMeta[1] = { title: 'สนามรอง', isMain: false, teamNames: ['ทีม 1'], capacity: {'ทีม 1': 5} };
  }`;
js = js.replace(initRegex, replaceInit);

fs.writeFileSync('app.js', js, 'utf8');
console.log('Patched DB structures');
