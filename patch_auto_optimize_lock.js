const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// The function autoOptimizeTeams clears assignments based on the mode.
// We need to NOT clear assignments if the team is locked.

code = code.replace(
  /mainFm\.teamNames\.forEach\(teamName => \{/g,
  `mainFm.teamNames.forEach(teamName => {
          if (isTeamLocked(0, teamName)) return; // Skip clearing locked team`
);

code = code.replace(
  /subFm\.teamNames\.forEach\(teamName => \{/g,
  `subFm.teamNames.forEach(teamName => {
          if (isTeamLocked(1, teamName)) return; // Skip clearing locked team`
);

// We also need to not clear when mode === 'both'
const clearBothPattern = `if (mode === 'both') {
      teamsAssignments = {};
      occupiedMap.clear();
    }`;

const clearBothReplacement = `if (mode === 'both') {
      // Don't just clear everything, preserve locked teams
      const newAssignments = {};
      occupiedMap.clear();
      Object.keys(teamsAssignments).forEach(key => {
        const parts = key.split('_');
        if (parts.length >= 2) {
          const fieldIdx = parseInt(parts[0]);
          const teamName = parts[1];
          if (isTeamLocked(fieldIdx, teamName)) {
            newAssignments[key] = teamsAssignments[key];
            if (teamsAssignments[key].name) {
              occupiedMap.set(teamsAssignments[key].name.trim().toLowerCase(), key);
            }
          }
        }
      });
      teamsAssignments = newAssignments;
    }`;

if (code.includes(clearBothPattern)) {
  code = code.replace(clearBothPattern, clearBothReplacement);
  console.log('Fixed clear behavior for mode=both');
}

// Next, in the assignment phase for main field
const mainAssignPriest = `mainTeamNames.forEach((teamName, tIdx) => {
        if (mainPriests[tIdx]) {
          const p = mainPriests[tIdx];`;

const mainAssignPriestRep = `mainTeamNames.forEach((teamName, tIdx) => {
        if (isTeamLocked(0, teamName)) return; // skip locked
        if (mainPriests[tIdx]) {
          const p = mainPriests[tIdx];`;

if (code.includes(mainAssignPriest)) {
  code = code.replace(mainAssignPriest, mainAssignPriestRep);
  console.log('Fixed Priest assignment for main field');
}

const mainAssignOthers = `mainTeamNames.forEach((teamName) => {
        const teamJobsCount = {};`;

const mainAssignOthersRep = `mainTeamNames.forEach((teamName) => {
        if (isTeamLocked(0, teamName)) return; // skip locked
        const teamJobsCount = {};`;

if (code.includes(mainAssignOthers)) {
  code = code.replace(mainAssignOthers, mainAssignOthersRep);
  console.log('Fixed Others assignment for main field');
}

// For sub field
const subAssignLoop = `sortedTeamNames.forEach(teamName => {
        const capacity = subFm.capacity[teamName] || 5;`;

const subAssignLoopRep = `sortedTeamNames.forEach(teamName => {
        if (isTeamLocked(1, teamName)) return; // skip locked
        const capacity = subFm.capacity[teamName] || 5;`;

if (code.includes(subAssignLoop)) {
  code = code.replace(subAssignLoop, subAssignLoopRep);
  console.log('Fixed assignment for sub field');
}

// Finally, pre-populate assignedSet before doing any logic so locked players aren't picked
const assignedSetStart = `const assignedSet = new Set(occupiedMap.keys());`;
const assignedSetFix = `const assignedSet = new Set(occupiedMap.keys());
    
    // Also ensure all locked members are in assignedSet (just to be absolutely safe)
    Object.keys(teamsAssignments).forEach(key => {
      const parts = key.split('_');
      if (parts.length >= 2) {
        const fieldIdx = parseInt(parts[0]);
        const teamName = parts[1];
        if (isTeamLocked(fieldIdx, teamName)) {
           if (teamsAssignments[key].name) {
             assignedSet.add(teamsAssignments[key].name.trim().toLowerCase());
             occupiedMap.set(teamsAssignments[key].name.trim().toLowerCase(), key);
           }
        }
      }
    });`;

if (code.includes(assignedSetStart)) {
  code = code.replace(assignedSetStart, assignedSetFix);
  console.log('Fixed assignedSet initialization');
}

fs.writeFileSync('app.js', code, 'utf8');
console.log('Done rewriting autoOptimizeTeams');
