const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const filterEmptyScript = `
  const group1Teams = oddTeams.map(tName => {
    let members = [];
    for(let j=0; j<5; j++) {
      let a = assignments['0|' + tName + '|' + j];
      if (a && a.name) members.push(a);
    }
    return { name: tName, members, leader: getTeamLeader(tName) };
  }).filter(t => t.members.length > 0);

  const group2Teams = evenTeams.map(tName => {
    let members = [];
    for(let j=0; j<5; j++) {
      let a = assignments['0|' + tName + '|' + j];
      if (a && a.name) members.push(a);
    }
    return { name: tName, members, leader: getTeamLeader(tName) };
  }).filter(t => t.members.length > 0);
`;

const oldGroup1 = `
  const group1Teams = oddTeams.map(tName => {
    let members = [];
    for(let j=0; j<5; j++) {
      let a = assignments['0|' + tName + '|' + j];
      if (a && a.name) members.push(a);
    }
    return { name: tName, members, leader: getTeamLeader(tName) };
  });

  const group2Teams = evenTeams.map(tName => {
    let members = [];
    for(let j=0; j<5; j++) {
      let a = assignments['0|' + tName + '|' + j];
      if (a && a.name) members.push(a);
    }
    return { name: tName, members, leader: getTeamLeader(tName) };
  });
`;

if (code.includes('const group1Teams = oddTeams.map(tName => {') && !code.includes('.filter(t => t.members.length > 0)')) {
    code = code.replace(oldGroup1, filterEmptyScript);
    fs.writeFileSync('app.js', code);
    console.log('exportMainFieldPDF patched to filter empty teams');
} else {
    // try a more generic replace if formatting differs
    const g1start = code.indexOf('const group1Teams = oddTeams.map(');
    const g2end = code.indexOf('});', code.indexOf('const group2Teams = evenTeams.map(')) + 3;
    if (g1start !== -1 && g2end !== -1) {
        code = code.substring(0, g1start) + filterEmptyScript + code.substring(g2end);
        fs.writeFileSync('app.js', code);
        console.log('exportMainFieldPDF patched with generic replace');
    }
}
