function sortTeamNames(names) { return names; }
let fieldMeta = [];
let teamsAssignments = {};
let occupiedMap = new Map();
let rowJobFilter = {};
function slotKey(f, t, i) { return f + '_' + t + '_' + i; }

function initTeamStructure(rawTeamsData) {
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
  }
}

// Scenario 1: Only Main is present in the object
initTeamStructure({ main: { title: "สนามหลัก", teams: { "ทีม 1": [] } } });
console.log("Scenario 1 fieldMeta length:", fieldMeta.length);
console.log("Scenario 1 fieldMeta:", JSON.stringify(fieldMeta, null, 2));

