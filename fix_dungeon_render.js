const fs = require('fs');

let dungTxt = fs.readFileSync('module_dungeon.js', 'utf8');

// Fix the queue map
const oldQueueLogic = `          const currentTeams = dungeonData.teams.filter(t => t.type === currentTab);
          let inTeamIndex = -1;
          currentTeams.forEach((team, tIdx) => {
            if (team.members.some(m => m && m.name && m.name.toLowerCase() === q.name.toLowerCase())) {
              inTeamIndex = tIdx + 1;
            }
          });`;

const newQueueLogic = `          const currentTeams = dungeonData.teams.filter(t => t.type === currentTab);
          let inTeamIndex = -1;
          currentTeams.forEach((team, tIdx) => {
            if (team.members && Array.isArray(team.members)) {
              if (team.members.some(m => m && m.name && q && q.name && m.name.toLowerCase() === q.name.toLowerCase())) {
                inTeamIndex = tIdx + 1;
              }
            }
          });`;

dungTxt = dungTxt.replace(oldQueueLogic, newQueueLogic);

// Fix the team card rendering
const oldTeamLoop = `    // 5 slots
    for (let i=0; i<5; i++) {
      const m = t.members[i];`;
const newTeamLoop = `    // 5 slots
    const members = t.members || [];
    for (let i=0; i<5; i++) {
      const m = members[i];`;

dungTxt = dungTxt.replace(oldTeamLoop, newTeamLoop);

// Also look for capacity-based loop if that exists
const oldTeamLoop2 = `    for (let i = 0; i < t.capacity; i++) {
      const member = t.members[i];`;
const newTeamLoop2 = `    const members = t.members || [];
    for (let i = 0; i < t.capacity; i++) {
      const member = members[i];`;

dungTxt = dungTxt.replace(oldTeamLoop2, newTeamLoop2);

fs.writeFileSync('module_dungeon.js', dungTxt, 'utf8');
console.log('Fixed dungeon module defensive checks');
