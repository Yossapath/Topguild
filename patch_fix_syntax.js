const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const regex = /function serializeTeamsState\(\) \{[\s\S]*?\/\* Save to Firebase only - no LocalStorage \*\//;

const replacement = `function serializeTeamsState() {
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
}

/* Save to Firebase only - no LocalStorage */`;

js = js.replace(regex, replacement);
fs.writeFileSync('app.js', js, 'utf8');
console.log('Fixed syntax error');
