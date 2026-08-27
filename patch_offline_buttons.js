const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

// 1. Patch addNewTeam
const addNewTeamRegex = /function addNewTeam\(\) \{\s*const fm = fieldMeta\[currentFieldIdx\];/;
const addNewTeamReplace = `function addNewTeam() {
    const fm = fieldMeta[currentFieldIdx];
    if (!fm) return;
    if (currentFieldIdx === 2) {
      const teamName = fm.teamNames[0] || 'ทีม 1';
      fm.capacity[teamName] = (fm.capacity[teamName] || 20) + 10;
      saveState();
      renderAll();
      return;
    }`;

if (code.match(addNewTeamRegex)) {
  code = code.replace(addNewTeamRegex, addNewTeamReplace);
}

// 2. Patch removeLastTeam
const removeLastTeamRegex = /async function removeLastTeam\(\) \{\s*const fm = fieldMeta\[currentFieldIdx\];/;
const removeLastTeamReplace = `async function removeLastTeam() {
    const fm = fieldMeta[currentFieldIdx];
    if (!fm) return;
    if (currentFieldIdx === 2) {
      const teamName = fm.teamNames[0] || 'ทีม 1';
      if ((fm.capacity[teamName] || 20) <= 10) return;
      fm.capacity[teamName] = (fm.capacity[teamName] || 20) - 10;
      saveState();
      renderAll();
      return;
    }`;

if (code.match(removeLastTeamRegex)) {
  code = code.replace(removeLastTeamRegex, removeLastTeamReplace);
}

// 3. Patch renderTeams UI
const offlineUIRegex = /const cap = 100; \/\/ allow up to 100 offline people[\s\S]*?\/\/ Render 15 extra empty slots below the last filled one\s*if \(\!a && i > offlineCount \+ 15\) continue;/;
const offlineUIReplace = `const fm = fieldMeta[2];
      const teamName = (fm && fm.teamNames && fm.teamNames[0]) ? fm.teamNames[0] : 'ทีม 1';
      if (!fm.capacity[teamName]) fm.capacity[teamName] = 20;
      const cap = fm.capacity[teamName];
      let offlineCount = 0;
      let htmlRows = '';
      for (let i = 0; i < cap; i++) {
        const key = '2|' + teamName + '|' + i;
        const a = teamsAssignments[key];
        if (a && a.name) offlineCount++;`;

if (code.match(offlineUIRegex)) {
  code = code.replace(offlineUIRegex, offlineUIReplace);
}

// 4. Patch button text
const buttonTextRegex = /if \(btnMain\) btnMain\.style\.display = \(isAdmin && currentFieldIdx === 0\) \? 'block' : 'none';/;
const buttonTextReplace = `if (btnMain) btnMain.style.display = (isAdmin && currentFieldIdx === 0) ? 'block' : 'none';
    const btnAddTeamBtn = document.getElementById('btnAddTeamBtn');
    const btnRemoveTeamBtn = document.getElementById('btnRemoveTeamBtn');
    if (btnAddTeamBtn) btnAddTeamBtn.innerText = currentFieldIdx === 2 ? '+ เพิ่ม 10 ช่อง' : '+ เพิ่มทีม';
    if (btnRemoveTeamBtn) btnRemoveTeamBtn.innerText = currentFieldIdx === 2 ? '- ลบ 10 ช่อง' : '- ลบทีมล่าสุด';`;

if (code.match(buttonTextRegex)) {
  code = code.replace(buttonTextRegex, buttonTextReplace);
}

fs.writeFileSync('app.js', code);
console.log('Patched buttons and slots!');
