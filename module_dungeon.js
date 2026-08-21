import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// ==========================================
// MODULE: DUNGEON SYSTEM
// ==========================================
(async function initDungeonModule() {
  try {
    // ====== DUNGEON SYSTEM ======
// ==========================================
let dungeonData = { queues: [], teams: [] };
    window.dungeonData = dungeonData;
window.dungeonData = dungeonData;
let unsubDungeonListener = null;

async function setupDungeonFirebase() {
  if (!window.db) return;
  try {
    const dungRef = doc(window.db, 'guild_system', 'dungeons');
    
    const snap = await getDoc(dungRef);
    if (!snap.exists()) {
      await setDoc(dungRef, { queues: [], teams: [] });
    }

    unsubDungeonListener = onSnapshot(dungRef, (snapshot) => {
      if (snapshot.exists()) {
        dungeonData = snapshot.data();
          window.dungeonData = dungeonData;
        if (!dungeonData.queues) dungeonData.queues = [];
        if (!dungeonData.teams) dungeonData.teams = [];
        renderDungeonPage();
      }
    });
  } catch(e) {
    console.error(e);
  }
}

async function saveDungeonState() {
    if (!window.db) return;
    const dungRef = doc(window.db, 'guild_system', 'dungeons');
    window.dungeonData = dungeonData;
    await setDoc(dungRef, dungeonData);
}

window.bookDungeonQueue = function() {
  if (!window.currentUser) return window.showToast("กรุณาเข้าสู่ระบบ", "error");
  const name = document.getElementById('dqName').value.trim();
  const job = document.getElementById('dqClass').value;
  const dungeon = document.getElementById('dqDungeon').value;
  
  if (!name || !job || !dungeon) return window.showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");

  // Get power from roster
  let power = 0;
  if (window.guildRoster && window.guildRoster[job]) {
    const found = window.guildRoster[job].find(m => m.name.toLowerCase() === name.toLowerCase());
    if (found) power = found.power || 0;
  }

  dungeonData.queues.push({
    id: Date.now().toString(),
    name, job, dungeon, power,
    status: 'waiting',
    timestamp: Date.now()
  });
  
  saveDungeonState();
  
  document.getElementById('dqName').value = '';
  document.getElementById('dqClass').value = '';
  window.showToast("จองคิวสำเร็จ!", "success");
};

window.changeDungeonQueueStatus = function(id, newStatus) {
  const q = dungeonData.queues.find(x => x.id === id);
  if (q) {
    q.status = newStatus;
    saveDungeonState();
  }
};

window.deleteDungeonQueue = function(id) {
  dungeonData.queues = dungeonData.queues.filter(x => x.id !== id);
  saveDungeonState();
};


window.clearDungeonTeam = function(teamId) {
  if (!confirm("ยืนยันว่าทีมนี้ลงดันเจี้ยนสำเร็จ และต้องการเคลียร์รายชื่อทั้งหมด?")) return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (t) {
    t.members = Array(t.capacity).fill(null);
    saveDungeonState();
    window.showToast("เคลียร์ทีมเรียบร้อย", "success");
  }
};

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
    const missingPriests = Math.max(0, 1 - curPriest);
    const myContribution = (myJob === 'Priest') ? 1 : 0;
    if ((emptySlots - 1) < (missingPriests - myContribution)) {
       return window.showToast("ไม่สามารถเข้าได้ ทีมมายาต้องการ Priest ขั้นต่ำ 1 คน", "warning");
    }
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

window.addDungeonTeam = function(dungeonName, capacity) {
  if (!window.currentUser) return;
  const isAdmin = window.isUserAdmin();
  if (!isAdmin && window.currentDungeonTab !== 'มายา (Maya)') {
     return window.showToast("เฉพาะ Admin ที่สร้างทีมดันเจี้ยนอื่นได้", "error");
  }
  const teamNum = dungeonData.teams.filter(t => t.type === window.currentDungeonTab).length + 1;
  dungeonData.teams.push({
    id: Date.now().toString(),
    type: window.currentDungeonTab || 'มายา (Maya)',
    dungeonName,
    capacity,
    members: Array(capacity).fill(null)
  });
  saveDungeonState();
};

window.deleteDungeonTeam = function(id) {
  if (!window.currentUser || !window.isUserAdmin()) return;
  if (confirm("คุณต้องการลบทีมนี้ใช่หรือไม่?")) {
    dungeonData.teams = dungeonData.teams.filter(x => x.id !== id);
    saveDungeonState();
  }
};

window.updateDungeonTeamName = function(teamId, slotIdx, nameVal) {
    if (!window.currentUser || !window.isUserAdmin()) return;
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
    }
  if (!t.members[slotIdx]) t.members[slotIdx] = { name: '', job: '', power: null };
  t.members[slotIdx].name = nameVal.trim();
  
  if (nameVal && window.guildRoster) {
    for (const j in window.guildRoster) {
      const found = (window.guildRoster[j] || []).find(m => m.name.toLowerCase() === nameVal.toLowerCase());
      if (found) { t.members[slotIdx].job = j; t.members[slotIdx].power = found.power; break; }
    }
  }
  if (!nameVal.trim() && !t.members[slotIdx].job && !t.members[slotIdx].power) {
    t.members[slotIdx] = null;
  }
  saveDungeonState();
};

window.updateDungeonTeamJob = function(teamId, slotIdx, jobVal) {
  if (!window.currentUser || !window.isUserAdmin()) return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
  if (!t.members[slotIdx]) t.members[slotIdx] = { name: '', job: '', power: null };
  t.members[slotIdx].job = jobVal;
  saveDungeonState();
};

window.updateDungeonTeamPower = function(teamId, slotIdx, powerVal) {
  if (!window.currentUser || !window.isUserAdmin()) return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (!t) return;
  if (!t.members[slotIdx]) t.members[slotIdx] = { name: '', job: '', power: null };
  t.members[slotIdx].power = powerVal === '' ? null : Number(powerVal);
  saveDungeonState();
};

window.clearDungeonSlot = function(teamId, slotIdx) {
  if (!window.currentUser || !window.isUserAdmin()) return;
  const t = dungeonData.teams.find(x => x.id === teamId);
  if (t) { t.members[slotIdx] = null; saveDungeonState(); }
};

function dungeonNameSelectHtml(currentName, filterJob) {
  let list = [];
  if (window.guildRoster) {
    if (filterJob && window.guildRoster[filterJob]) {
      list = [...window.guildRoster[filterJob]];
    } else {
      Object.keys(window.guildRoster).forEach(j => {
        list.push(...window.guildRoster[j].map(m => ({...m, job: j})));
      });
    }
  }
  
  list.sort((a,b) => (b.power||0) - (a.power||0));

  let out = `<option value="" ${!currentName ? 'selected' : ''}>— เลือกชื่อ —</option>`;
  
  if (currentName && !list.some(m => m.name.toLowerCase() === currentName.toLowerCase())) {
    out += `<option value="${window.escapeHtml(currentName)}" selected>${window.escapeHtml(currentName)} ❓</option>`;
  }

  list.forEach(m => {
    const isSelected = currentName && m.name.toLowerCase() === currentName.toLowerCase();
    const jobBadge = isSelected ? '' : ` [${m.job || filterJob}]`;
    const extraInfo = isSelected ? '' : (m.power != null ? ` (${Number(m.power).toLocaleString('en-US')})` : '');
    out += `<option value="${window.escapeHtml(m.name)}" ${isSelected ? 'selected' : ''}>${window.escapeHtml(m.name)}${jobBadge}${extraInfo}</option>`;
  });
  return out;
}

const DUNGEON_JOB_LIST = [
  "Lord Knight", "Paladin", "High Wizard", "Sniper", 
  "Priest", "Champion", "Assassin Cross", "Merchant", 
  "Gunslinger", "Druid"
];

function dungeonJobSelectHtml(currentJob) {
  let out = `<option value="" ${!currentJob ? 'selected' : ''}>— เลือกอาชีพ —</option>`;
  DUNGEON_JOB_LIST.forEach(j => {
    const isSelected = currentJob && currentJob.toLowerCase() === j.toLowerCase();
    out += `<option value="${j}" ${isSelected ? 'selected' : ''}>${j}</option>`;
  });
  return out;
}


window.currentDungeonTab = window.currentDungeonTab || 'มายา (Maya)';

window.switchDungeonTab = function(tabName) {
  window.currentDungeonTab = tabName;
  // Sync the dqDungeon dropdown
  const dq = document.getElementById('dqDungeon');
  if (dq) {
    Array.from(dq.options).forEach(opt => {
      if (opt.value === tabName) dq.value = opt.value;
    });
  }
  // Highlight tabs
  document.querySelectorAll('.dungeon-tab').forEach(btn => {
      btn.classList.remove('active');
      
      if (btn.getAttribute('data-type') === tabName) {
        btn.classList.add('active');
        
      }
    });
  renderDungeonPage();
};

function renderDungeonPage() {
  const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : ''; const isAdmin = window.isUserAdmin();
  const currentTab = window.currentDungeonTab || 'มายา (Maya)';

  // Update create team button
  const btnCreate = document.getElementById('btnCreateDungeonTeam');
  if (btnCreate) {
    btnCreate.innerHTML = isAdmin
      ? ('+ สร้างทีม' + currentTab.split(' ')[0])
      : '+ สร้างทีมใหม่';
  }

  // ---- QUEUE PANEL ----
  const qList = document.getElementById('dqList');
  if (qList) {
    const filteredQueues = (dungeonData.queues || []).filter(q => q.dungeon === currentTab);
    if (filteredQueues.length === 0) {
      qList.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-lo);font-size:13px;">ยังไม่มีคิว</div>';
    } else {
      qList.innerHTML = filteredQueues.map(q => {
        
          // Check if in team
          const currentTeams = dungeonData.teams.filter(t => t.type === currentTab);
          let inTeamIndex = -1;
          currentTeams.forEach((team, tIdx) => {
            if (team.members && Array.isArray(team.members)) {
              if (team.members.some(m => m && m.name && q && q.name && m.name.toLowerCase() === q.name.toLowerCase())) {
                inTeamIndex = tIdx + 1;
              }
            }
          });

          let sColor, sText;
          if (inTeamIndex !== -1) {
            sColor = '#8b5cf6'; // Purple
            sText = 'อยู่ในทีม ' + inTeamIndex;
          } else {
            sColor = q.status === 'done' ? 'var(--ok)' : (q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)');
            sText = q.status === 'done' ? 'สำเร็จ' : (q.status === 'active' ? 'กำลังลงดัน' : 'รอลงดัน');
          }

        const eName = window.escapeHtml ? window.escapeHtml(q.name) : q.name;
        const eJob = window.escapeHtml ? window.escapeHtml(q.job || '') : (q.job || '');
        const adminCtrl = isAdmin ? `<div style="display:flex;gap:4px;margin-top:8px;">
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','waiting')" style="font-size:11px;padding:2px 4px;">รอ</button>
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','active')" style="font-size:11px;padding:2px 4px;">กำลังลง</button>
          <button class="btn-secondary" onclick="changeDungeonQueueStatus('${q.id}','done')" style="font-size:11px;padding:2px 4px;">เสร็จ</button>
          <button class="btn-secondary" onclick="deleteDungeonQueue('${q.id}')" style="font-size:11px;padding:2px 4px;color:var(--danger);border-color:var(--danger);">ลบ</button>
        </div>` : '';
        const dragAttr = isAdmin ? `draggable="true" data-queue-name="${eName}" data-queue-job="${eJob}" data-queue-power="${q.power || 0}"` : '';
        return `<div ${dragAttr} style="padding:10px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;${isAdmin ? 'cursor:grab;' : ''}" ondragstart="window.onDungeonQueueDragStart(event)">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <strong style="color:var(--text-hi);font-size:14px;">${eName}</strong>
              <span style="font-size:11px;color:${q.job && window.JOB_COLORS && window.JOB_COLORS[q.job] ? window.JOB_COLORS[q.job] : 'var(--text-lo)'};margin-left:6px;font-weight:600;">${q.job || ''}</span>
              ${q.power ? '<span style="font-size:11px;color:var(--text-lo);">' + Number(q.power).toLocaleString('en-US') + '</span>' : ''}
              ${q.timestamp ? '<div style="font-size:10.5px;color:var(--text-lo);margin-top:4px;">🕒 ' + new Date(q.timestamp).toLocaleString('th-TH',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) + ' น.</div>' : ''}
            </div>
            <span style="font-size:11px;padding:2px 6px;border-radius:12px;font-weight:600;color:${sColor};">${sText}</span>
          </div>
          ${adminCtrl}
        </div>`;
      }).join('');
    }
  }

  // ---- TEAMS AREA ----
  const tArea = document.getElementById('dungeonTeamsArea');
  if (!tArea) return;

  const teamsForTab = (dungeonData.teams || []).filter(t => t.type === currentTab);

  if (teamsForTab.length === 0) {
    tArea.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-lo);">' +
      (isAdmin ? 'ยังไม่มีทีม กดปุ่มด้านบนเพื่อสร้างทีม' : 'ยังไม่มีทีมในดันเจี้ยนนี้') + '</div>';
    return;
  }

  tArea.innerHTML = teamsForTab.map((t, teamIdx) => {
    let mHtml = '';
    let totalPower = 0;
    let filledCount = 0;

    const members = t.members || [];
    for (let i = 0; i < t.capacity; i++) {
      const member = members[i];
      const memberName = member ? (typeof member === 'string' ? member : (member.name || '')) : '';
      let memberJob = member ? (typeof member === 'string' ? '' : (member.job || '')) : '';
      let memberPower = member ? (typeof member === 'string' ? null : (member.power || null)) : null;

      if (memberName && !memberJob && window.guildRoster) {
        for (const j in window.guildRoster) {
          const found = (window.guildRoster[j] || []).find(m => m.name.toLowerCase() === memberName.toLowerCase());
          if (found) { memberJob = j; memberPower = found.power; break; }
        }
      }

      if (memberName) { filledCount++; if (memberPower) totalPower += Number(memberPower); }

      const eName = window.escapeHtml ? window.escapeHtml(memberName) : memberName;
      const jobColor = memberJob && window.JOB_COLORS ? (window.JOB_COLORS[memberJob] || 'var(--text-hi)') : 'var(--text-hi)';

      if (isAdmin) {
        mHtml += `<tr data-team-id="${t.id}" data-slot="${i}"
          ondragover="event.preventDefault();this.style.background='var(--blue-100)';"
          ondragleave="this.style.background='';"
          ondrop="window.onDungeonSlotDrop(event,'${t.id}',${i});this.style.background='';">
          <td class="cell-rank">${i + 1}</td>
          <td>
            <input type="text" class="cell-input name-input autocomplete-member"
              onchange="updateDungeonTeamName('${t.id}',${i},this.value)"
              data-team-id="${t.id}" data-slot-idx="${i}" data-action="dungeonTeam"
              value="${memberName ? eName : ''}" placeholder="พิมพ์/คลิก..." autocomplete="off"
              style="width:100%;min-width:140px;font-size:14px;padding:6px;">
          </td>
          <td>
            <select class="cell-input job-input ${memberJob ? '' : 'empty'}" onchange="updateDungeonTeamJob('${t.id}',${i},this.value)" style="width:100%;min-width:120px;font-size:14px;padding:6px;--job-color:${jobColor};">
              ${dungeonJobSelectHtml(memberJob)}
            </select>
          </td>
          <td class="cell-action">
            <button class="clear-btn" onclick="clearDungeonSlot('${t.id}',${i})" title="ล้างช่องนี้">✕</button>
          </td>
        </tr>`;
      } else {
        mHtml += `<tr>
          <td class="cell-rank">${i + 1}</td>
          <td style="padding-left:8px;font-size:14px;color:var(--text-hi);">
            ${memberName ? eName : '<i style="color:var(--text-lo)">- ว่าง -</i>'}
          </td>
          <td style="text-align:center;font-size:14px;font-weight:600;color:${jobColor};">${memberJob || '-'}</td>
          <td></td>
        </tr>`;
      }
    }

    const pct = t.capacity > 0 ? filledCount / t.capacity : 0;
    const badgeClass = pct === 1 ? 'ok' : (pct > 0.5 ? 'warn' : '');
    const badgeText = filledCount === t.capacity
      ? 'ครบ ' + filledCount + '/' + t.capacity
      : 'ขาด ' + (t.capacity - filledCount) + ' คน';

    return `<div class="team-card" style="width:100%;">
      <div class="team-card-head" style="display:flex;justify-content:space-between;align-items:center;padding:12px;">
        <div class="team-title-group">
          <span style="font-size:16px;">${window.escapeHtml ? window.escapeHtml(t.dungeonName || t.type) : (t.dungeonName || t.type)} <span style="color:var(--text-lo); font-size:14px; font-weight:normal; margin-left:8px;">(ทีมที่ ${teamIdx + 1})</span></span>
          <span class="team-power-sum" style="font-size:14px;">${totalPower.toLocaleString('en-US')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="status-badge ${badgeClass}" style="font-size:13px;padding:4px 8px;">${badgeText}</span>
          ${isAdmin ? '<button onclick="deleteDungeonTeam(\'' + t.id + '\')" style="background:transparent;border:none;color:white;cursor:pointer;font-size:16px;" title="ลบทีม">✕</button>' : ''}
        </div>
      </div>
      <div style="padding:0 8px 8px;">
        <table class="team-table" style="width:100%;table-layout:auto;">
          <thead><tr>
            <th style="width:30px;">#</th>
            <th>ชื่อ</th>
            <th style="text-align:center;">อาชีพ</th>
            <th style="width:36px;"></th>
          </tr></thead>
          <tbody>${mHtml}</tbody>
        </table>
        <div style="display:flex;gap:8px;margin-top:8px;">
          ${!isAdmin ? '<button class="btn-primary" style="flex:1;border-radius:8px;padding:6px;font-size:13px;" onclick="memberJoinTeam(\'' + t.id + '\')">เข้าร่วมทีม</button>' : ''}
          ${isAdmin ? '<button class="btn-secondary" style="flex:1;border-radius:8px;padding:6px;font-size:13px;border-color:var(--ok);color:var(--ok);" onclick="clearDungeonTeam(\'' + t.id + '\')">ลงสำเร็จ</button>' : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

// Drag-and-drop: drag from queue panel → drop into team slot
window.onDungeonQueueDragStart = function(event) {
  const el = event.currentTarget;
  const data = {
    name: el.dataset.queueName || '',
    job: el.dataset.queueJob || '',
    power: el.dataset.queuePower || ''
  };
  event.dataTransfer.setData('text/plain', JSON.stringify(data));
};

window.onDungeonSlotDrop = function(event, teamId, slotIdx) {
  event.preventDefault();
  try {
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    if (!data.name) return;
    const t = dungeonData.teams.find(x => x.id === teamId);
    if (t) {
      t.members[slotIdx] = { name: data.name, job: data.job, power: data.power ? Number(data.power) : null };
      saveDungeonState();
    }
  } catch(e) { console.error(e); }
};

// Global Exports
window.ensureDefaultAdmin = ensureDefaultAdmin;
window.checkAuth = checkAuth;
window.setupDungeonFirebase = setupDungeonFirebase;
window.renderDungeonPage = renderDungeonPage;
// ==========================================

    // Initialize
    if (typeof setupDungeonFirebase === 'function' && !window._dungeonReady) {
      window._dungeonReady = true;
      await setupDungeonFirebase();
    }
  } catch(err) {
    console.error('[Module Dungeon] ระบบดันเจี้ยนมีปัญหา:', err);
    const area = document.getElementById('dungeonTeamsArea');
    if (area) area.innerHTML = '<div style="padding:24px;text-align:center;color:var(--danger);">ระบบดันเจี้ยนขัดข้อง กรุณารีเฟรชหน้าจอ</div>';
  }
})();
