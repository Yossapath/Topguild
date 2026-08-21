const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

// 1. Filter out duplicates in globalMemberDropdown for dungeonTeam
const filterDungeonTeamLogic = `if (action === 'dungeonTeam' && typeof dungeonData !== 'undefined') {
    const currentTab = window.currentDungeonTab;
    const inUseNames = new Set();
    dungeonData.teams.forEach(t => {
      if (t.type === currentTab) {
        t.members.forEach((m, idx) => {
          if (m && m.name) {
             // Don't filter out if it's the exact slot we are editing
             const teamId = inputEl.getAttribute('data-team-id');
             const slotIdx = parseInt(inputEl.getAttribute('data-slot-idx'));
             if (t.id === teamId && idx === slotIdx) return;
             inUseNames.add(m.name.toLowerCase());
          }
        });
      }
    });
    allMembers = allMembers.filter(m => !inUseNames.has(m.name.toLowerCase()));
  }
  
  const val = filterText.toLowerCase();`;

js = js.replace(/const val = filterText\.toLowerCase\(\);/, filterDungeonTeamLogic);

// Add duplicate check inside updateDungeonTeamName
const dupCheckLogic = `window.updateDungeonTeamName = function(teamId, slotIdx, nameVal) {
    if (!window.currentUser || (window.currentUser.role || '').toLowerCase() !== 'admin') return;
    const t = dungeonData.teams.find(x => x.id === teamId);
    if (!t) return;
    
    // Check duplicates
    if (nameVal.trim()) {
       const isDup = dungeonData.teams.some(team => team.type === window.currentDungeonTab && team.members.some((m, idx) => m && m.name.toLowerCase() === nameVal.trim().toLowerCase() && !(team.id === teamId && idx === slotIdx)));
       if (isDup) {
          window.showToast("รายชื่อซ้ำ! คนนี้อยู่ในทีมแล้ว", "warning");
          if (typeof renderDungeonPage === 'function') renderDungeonPage();
          return;
       }
    }`;
js = js.replace(/window\.updateDungeonTeamName = function\(teamId, slotIdx, nameVal\) \{[\s\S]*?if \(!t\) return;/, dupCheckLogic);

// 2. Add "ลงสำเร็จ" (Clear Team) button & 3. Maya Priest Constraint
// The memberJoinTeam logic for Maya needs Priest check
const mayaPriestCheck = `if (window.currentDungeonTab === 'มายา (Maya)') {
    if (filledCount >= 2) return window.showToast("ทีมมายารับสมาชิกกดเข้าเองได้สูงสุด 2 คน โปรดสร้างทีมใหม่", "warning");
    const missingPriests = Math.max(0, 1 - curPriest);
    const myContribution = (myJob === 'Priest') ? 1 : 0;
    if ((emptySlots - 1) < (missingPriests - myContribution)) {
       return window.showToast("ไม่สามารถเข้าได้ ทีมมายาต้องการ Priest ขั้นต่ำ 1 คน", "warning");
    }
  } else if`;
js = js.replace(/if \(window\.currentDungeonTab === 'มายา \(Maya\)'\) \{[\s\S]*?\} else if/, mayaPriestCheck);

// "ลงสำเร็จ" button in renderDungeonPage
const clearTeamFn = `window.clearDungeonTeam = function(teamId) {
  if (!confirm("ยืนยันว่าทีมนี้ลงดันเจี้ยนสำเร็จ และต้องการเคลียร์รายชื่อทั้งหมด?")) return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (t) {
    t.members = Array(t.capacity).fill(null);
    saveDungeonState();
    window.showToast("เคลียร์ทีมเรียบร้อย", "success");
  }
};
`;
if (!js.includes('window.clearDungeonTeam =')) {
  js = js.replace(/window\.memberJoinTeam = function/, clearTeamFn + '\nwindow.memberJoinTeam = function');
}

// Inject button into HTML rendering
const joinBtnReplacement = `</table>
        <div style="display:flex; gap:8px; margin-top:8px;">
          \${!isAdmin ? \`<button class="btn-primary" style="flex:1; border-radius:8px; padding:6px; font-size:13px;" onclick="memberJoinTeam('\${t.id}')">เข้าร่วมทีม</button>\` : ''}
          <button class="btn-secondary" style="\${!isAdmin ? 'flex:0 0 auto;' : 'flex:1;'} border-radius:8px; padding:6px; font-size:13px; border-color: var(--ok); color: var(--ok);" onclick="clearDungeonTeam('\${t.id}')">✅ ลงสำเร็จ</button>
        </div>
      </div>
    \`;`;
js = js.replace(/<\/table>\s*\$\{\!isAdmin \? \`<button class="btn-primary" style="width:100%; margin-top:8px; border-radius:8px; padding:6px; font-size:13px;" onclick="memberJoinTeam\('\$\{t\.id\}'\)">เข้าร่วมทีม<\/button>\` : ''\}\s*<\/div>\s*`;/g, joinBtnReplacement);

// 4. Auto-change <select id="dqDungeon"> inside switchDungeonTab
const syncDqDungeon = `window.switchDungeonTab = function(tabName) {
    window.currentDungeonTab = tabName;
    const dq = document.getElementById('dqDungeon');
    if (dq) {
      // Find the option that matches
      Array.from(dq.options).forEach(opt => {
         if (opt.value.includes(tabName.split(' ')[0])) {
            dq.value = opt.value;
         }
      });
    }
    renderDungeonPage();
  };`;
js = js.replace(/window\.switchDungeonTab = function\(tabName\) \{[\s\S]*?renderDungeonPage\(\);\s*\};/, syncDqDungeon);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Patched all 4 requests');
