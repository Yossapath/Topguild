const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Allow members to create Maya teams
js = js.replace(/window\.addDungeonTeam = function\(dungeonName, capacity\) \{[\s\S]*?const teamNum/, `window.addDungeonTeam = function(dungeonName, capacity) {
  if (!window.currentUser) return;
  const isAdmin = (window.currentUser.role || '').toLowerCase() === 'admin';
  if (!isAdmin && window.currentDungeonTab !== 'มายา (Maya)') {
     return window.showToast("เฉพาะ Admin ที่สร้างทีมดันเจี้ยนอื่นได้", "error");
  }
  const teamNum`);

// 2. Add memberJoinTeam function
const memberJoinTeamCode = `
window.memberJoinTeam = function(teamId) {
  if (!window.currentUser) return window.showToast("กรุณาเข้าสู่ระบบ", "error");
  const myName = window.currentUser.username;
  
  // Get my job and power
  let myJob = '';
  let myPower = 0;
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(job => {
      const found = (window.guildRoster[job]||[]).find(m => m.name.toLowerCase() === myName.toLowerCase());
      if (found) { myJob = job; myPower = found.power || 0; }
    });
  }
  if (!myJob) return window.showToast("ไม่พบข้อมูลอาชีพของคุณในรายชื่อสมาชิก", "error");

  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
  
  // Check if user is already in ANY team in THIS dungeon tab
  const alreadyInTeam = dungeonData.teams.some(team => 
    team.type === window.currentDungeonTab && 
    team.members.some(m => m && m.name.toLowerCase() === myName.toLowerCase())
  );
  if (alreadyInTeam) return window.showToast("คุณอยู่ในทีมดันเจี้ยนนี้แล้ว", "warning");

  const currentMembers = t.members.filter(m => m && m.name);
  const filledCount = currentMembers.length;
  if (filledCount >= t.capacity) return window.showToast("ทีมนี้เต็มแล้ว", "warning");

  const curPriest = currentMembers.filter(m => m.job === 'Priest').length;
  const curTank = currentMembers.filter(m => m.job === 'Lord Knight' || m.job === 'Paladin').length;
  const emptySlots = t.capacity - filledCount;

  if (window.currentDungeonTab === 'มายา (Maya)') {
    if (filledCount >= 2) return window.showToast("ทีมมายารับสมาชิกกดเข้าเองได้สูงสุด 2 คน โปรดสร้างทีมใหม่", "warning");
  } else if (window.currentDungeonTab === 'บับเบิ้ล (Bubble)') {
    const missingPriests = Math.max(0, 2 - curPriest);
    const missingTanks = Math.max(0, 1 - curTank);
    let myContribution = 0;
    if (myJob === 'Priest') myContribution = missingPriests > 0 ? 1 : 0;
    else if (myJob === 'Lord Knight' || myJob === 'Paladin') myContribution = missingTanks > 0 ? 1 : 0;
    
    if ((emptySlots - 1) < (missingPriests + missingTanks - myContribution)) {
       return window.showToast("ไม่สามารถเข้าได้ ทีมต้องการ Priest ขั้นต่ำ 2 คน และ แทงค์ขั้นต่ำ 1 คน", "warning");
    }
  } else if (window.currentDungeonTab === 'กระจก (Mirror)') {
    const missingPriests = Math.max(0, 2 - curPriest);
    const missingTanks = Math.max(0, 2 - curTank);
    let myContribution = 0;
    if (myJob === 'Priest') myContribution = missingPriests > 0 ? 1 : 0;
    else if (myJob === 'Lord Knight' || myJob === 'Paladin') myContribution = missingTanks > 0 ? 1 : 0;
    
    if ((emptySlots - 1) < (missingPriests + missingTanks - myContribution)) {
       return window.showToast("ไม่สามารถเข้าได้ ทีมต้องการ Priest ขั้นต่ำ 2 คน และ แทงค์ขั้นต่ำ 2 คน", "warning");
    }
  }

  const emptyIdx = t.members.findIndex(m => !m || !m.name);
  if (emptyIdx !== -1) {
    t.members[emptyIdx] = { name: myName, job: myJob, power: myPower };
    
    // Auto remove from queue if they are in it
    dungeonData.queues = dungeonData.queues.filter(q => q.name.toLowerCase() !== myName.toLowerCase() || q.dungeon !== window.currentDungeonTab);
    
    saveDungeonState();
    window.showToast("เข้าร่วมทีมสำเร็จ!", "success");
  }
};
`;

if (!js.includes('window.memberJoinTeam =')) {
  js = js.replace(/window\.addDungeonTeam = function/, memberJoinTeamCode + '\nwindow.addDungeonTeam = function');
}

// 3. Render the Join button and Create Team button for Members
// Show create Maya team for members
js = js.replace(/const dc = document\.getElementById\('dungeonAdminControls'\);\s*if \(dc\) dc\.style\.display = isAdmin \? 'flex' : 'none';/, 
  `const dc = document.getElementById('dungeonAdminControls');
  if (dc) dc.style.display = (isAdmin || window.currentDungeonTab === 'มายา (Maya)') ? 'flex' : 'none';`);

// Hide specific admin buttons inside dc if member
const createTeamHtmlRegex = /<button id="btnCreateDungeonTeam"/;
js = js.replace(/const qList = document\.getElementById\('dqList'\);/, `
  const btnCreate = document.getElementById('btnCreateDungeonTeam');
  if (btnCreate) {
    if (isAdmin) {
      btnCreate.innerHTML = '+ สร้างทีม' + (window.currentDungeonTab.split(' ')[0]);
    } else {
      btnCreate.innerHTML = '+ สร้างทีมใหม่';
    }
  }
  const qList = document.getElementById('dqList');`);

// Inject "เข้าร่วมทีม" button at the end of each team card
// `</div>` before `</section>`... wait. In renderDungeonPage:
/*
        <table class="team-table" style="width: 100%; table-layout: auto;">
          <thead><tr><th style="width:30px;">#</th><th>ชื่อ</th><th style="text-align:center;">อาชีพ</th><th style="width:36px;"></th></tr></thead>
          <tbody>${mHtml}</tbody>
        </table>
      </div>
    \`;
  }).join('');
*/
const tableHtmlRegex = /<\/table>\s*<\/div>\s*`;\s*\}\)\.join\(''\);/;
const tableReplacement = `</table>
        \${!isAdmin ? \`<button class="btn-primary" style="width:100%; margin-top:8px; border-radius:8px; padding:6px; font-size:13px;" onclick="memberJoinTeam('\${t.id}')">เข้าร่วมทีม</button>\` : ''}
      </div>
    \`;
  }).join('');`;

js = js.replace(tableHtmlRegex, tableReplacement);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched memberJoinTeam logic');
