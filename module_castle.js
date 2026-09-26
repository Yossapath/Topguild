import { doc, getDoc, setDoc, onSnapshot } from "./firebase_shim.js";
// module_castle.js - Castle Siege (ชิงปราสาท) team organization

let castleAssignments = {}; // slotKey -> {name, job, power} | null
let castleOccupiedMap = new Map(); // name -> slotKey

// Total 5 Zones, 6 Teams per Zone, 5 members per Team
const CASTLE_ZONES = 5;
const CASTLE_TEAMS_PER_ZONE = 6;
const CASTLE_TEAM_SIZE = 5;

export function initCastleModule() {
  loadCastleAssignments();
  renderCastlePage();
}

function getCastleSlotKey(zoneIdx, teamIdx, slotIdx) {
  return `castle|${zoneIdx}|${teamIdx}|${slotIdx}`;
}

let unsubscribeCastle = null;

function loadCastleAssignments() {
  if (!window.db) {
    // If db not ready, wait and retry
    setTimeout(loadCastleAssignments, 500);
    return;
  }
  
  const docRef = doc(window.db, "guild_data", "castle");
  
  if (unsubscribeCastle) unsubscribeCastle();
  
  unsubscribeCastle = onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.assignments) {
        castleAssignments = data.assignments;
        rebuildCastleOccupiedMap();
        renderCastlePage();
        if (window.renderRoster) window.renderRoster();
        return;
      }
    }
    
    // If not exists or no assignments, initialize empty
    castleAssignments = {};
    for (let z = 0; z < CASTLE_ZONES; z++) {
      for (let t = 0; t < CASTLE_TEAMS_PER_ZONE; t++) {
        for (let s = 0; s < CASTLE_TEAM_SIZE; s++) {
          castleAssignments[getCastleSlotKey(z, t, s)] = null;
        }
      }
    }
    castleOccupiedMap.clear();
    

  }, (err) => {
    console.error("Error listening to castle assignments:", err);
  });
}

function saveCastleAssignments() {
  if (!window.db) return;
  const docRef = doc(window.db, "guild_data", "castle");
  setDoc(docRef, { assignments: castleAssignments }, { merge: true })
    .catch(e => console.error("Error saving castle assignments", e));
}

function rebuildCastleOccupiedMap() {
  castleOccupiedMap.clear();
  for (const [key, member] of Object.entries(castleAssignments)) {
    if (member && member.name) {
      castleOccupiedMap.set(member.name.trim().toLowerCase(), key);
    }
  }
}

export function renderCastlePage() {
  const container = document.getElementById('castleZonesContainer');
  if (!container) return;

  let html = '';
  for (let z = 0; z < CASTLE_ZONES; z++) {
    html += `<div class="castle-zone" style="margin-bottom: 24px;">`;
    html += `<h3 style="margin-bottom:12px; color:var(--text); border-bottom:2px solid var(--line); padding-bottom:8px;">โซน ${z + 1}</h3>`;
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">`;
    
    for (let t = 0; t < CASTLE_TEAMS_PER_ZONE; t++) {
      html += `<div class="team-card" style="background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:12px;">`;
      html += `<h4 style="margin:0 0 10px 0; text-align:center; font-size:14px; color:var(--blue-500);">ทีม ${t + 1}</h4>`;
      html += `<div class="team-slots">`;
      
      for (let s = 0; s < CASTLE_TEAM_SIZE; s++) {
        const slotKey = getCastleSlotKey(z, t, s);
        const member = castleAssignments[slotKey];
        html += renderCastleSlot(slotKey, member);
      }
      
      html += `</div></div>`; // team-slots, team-card
    }
    
    html += `</div></div>`; // grid, castle-zone
  }

  container.innerHTML = html;
  attachCastleDragAndDrop();
}

function renderCastleSlot(slotKey, member) {
  if (member) {
    const color = window.JOB_COLORS[member.job] || '#888';
    const isOwner = window.currentUser && window.currentUser.username.toLowerCase() === member.name.toLowerCase();
    const style = isOwner ? 'border:2px solid var(--blue-500);' : '';
    return `
      <div class="team-slot occupied" data-slot="${slotKey}" style="${style}">
        <div class="job-color-bar" style="background:${color}"></div>
        <div class="member-info">
          <div class="member-name">${window.escapeHtml(member.name)}</div>
          <div class="member-job">${window.escapeHtml(member.job)}</div>
        </div>
        ${window.isUserAdmin() ? `<button class="remove-btn" onclick="window.removeCastleMember('${slotKey}')">×</button>` : ''}
      </div>
    `;
  } else {
    return `<div class="team-slot empty" data-slot="${slotKey}">ว่าง</div>`;
  }
}

window.removeCastleMember = function(slotKey) {
  if (!window.isUserAdmin()) return;
  const m = castleAssignments[slotKey];
  if (m) {
    castleAssignments[slotKey] = null;
    castleOccupiedMap.delete(m.name.trim().toLowerCase());
    saveCastleAssignments();
    renderCastlePage();
    if(window.renderRoster) window.renderRoster(); // refresh roster sidebar if visible
  }
}

function attachCastleDragAndDrop() {
  if (!window.isUserAdmin()) return;
  
  const slots = document.querySelectorAll('#castleZonesContainer .team-slot');
  slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', (e) => {
      slot.classList.remove('drag-over');
    });
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      try {
        const data = JSON.parse(dataStr);
        if (data.source === 'roster' || data.source === 'castle') {
           handleCastleDrop(data, slot.dataset.slot);
        }
      } catch (err) {}
    });
    
    // allow dragging existing members in castle
    if (slot.classList.contains('occupied')) {
      slot.setAttribute('draggable', 'true');
      slot.addEventListener('dragstart', (e) => {
        const member = castleAssignments[slot.dataset.slot];
        e.dataTransfer.setData('text/plain', JSON.stringify({
          source: 'castle',
          slotKey: slot.dataset.slot,
          name: member.name,
          job: member.job,
          power: member.power
        }));
      });
    }
  });
}

function handleCastleDrop(data, targetSlotKey) {
  const targetMember = castleAssignments[targetSlotKey];
  
  // if coming from roster
  if (data.source === 'roster') {
    // If already in castle, remove from old slot
    const oldSlot = castleOccupiedMap.get(data.name.toLowerCase());
    if (oldSlot) {
      castleAssignments[oldSlot] = null;
    }
    
    if (targetMember) {
      // Swap? For roster, maybe just overwrite or ignore
      // overwrite for now, move target member out
      castleOccupiedMap.delete(targetMember.name.toLowerCase());
    }
    
    castleAssignments[targetSlotKey] = {name: data.name, job: data.job, power: data.power || 0};
    castleOccupiedMap.set(data.name.toLowerCase(), targetSlotKey);
    
  } else if (data.source === 'castle') {
    const sourceSlotKey = data.slotKey;
    if (sourceSlotKey === targetSlotKey) return;
    
    const sourceMember = castleAssignments[sourceSlotKey];
    
    // Swap
    castleAssignments[sourceSlotKey] = targetMember;
    castleAssignments[targetSlotKey] = sourceMember;
    
    if (sourceMember) castleOccupiedMap.set(sourceMember.name.toLowerCase(), targetSlotKey);
    if (targetMember) castleOccupiedMap.set(targetMember.name.toLowerCase(), sourceSlotKey);
  }
  
  saveCastleAssignments();
  renderCastlePage();
  if(window.renderRoster) window.renderRoster();
}

// Make check function available globally for roster highlights
window.isCastleOccupied = function(name) {
  return castleOccupiedMap.has(name.trim().toLowerCase());
};



window.renderCastleRoster = function() {
  const q = (document.getElementById('castleRosterSearch')?.value || '').toLowerCase().trim();
  const listEl = document.getElementById('castleRosterList');
  if (!listEl) return;
  
  const allMembers = [];
  // Use window.guildRoster which we exposed in app.js
  if (window.guildRoster) {
    for (const job in window.guildRoster) {
      window.guildRoster[job].forEach(m => {
        allMembers.push({name: m.name, job: job, power: m.power});
      });
    }
  }

  // Filter
  const filtered = allMembers.filter(m => {
    if (q && !m.name.toLowerCase().includes(q) && !m.job.toLowerCase().includes(q)) return false;
    return true;
  });

  // Sort: available first, then by power descending
  filtered.sort((a, b) => {
    const aOcc = window.isCastleOccupied(a.name) ? 1 : 0;
    const bOcc = window.isCastleOccupied(b.name) ? 1 : 0;
    if (aOcc !== bOcc) return aOcc - bOcc;
    return b.power - a.power;
  });

  let html = '';
  filtered.forEach(m => {
    const isOcc = window.isCastleOccupied(m.name);
    const color = window.JOB_COLORS[m.job] || '#888';
    
    html += `
      <div class="roster-item ${isOcc ? 'used' : ''}" 
           draggable="${!isOcc && window.isUserAdmin() ? 'true' : 'false'}"
           data-name="${window.escapeHtml(m.name)}" 
           data-job="${window.escapeHtml(m.job)}"
           data-power="${m.power}"
           style="border-left: 4px solid ${color};">
        <div class="roster-item-info">
          <div class="roster-item-name" style="${isOcc ? 'text-decoration:line-through; color:var(--text-lo);' : ''}">${window.escapeHtml(m.name)}</div>
          <div class="roster-item-job">${window.escapeHtml(m.job)}</div>
        </div>
      </div>
    `;
  });
  listEl.innerHTML = html;

  // attach drag events
  if (window.isUserAdmin()) {
    const items = listEl.querySelectorAll('.roster-item:not(.used)');
    items.forEach(el => {
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          source: 'roster',
          name: el.dataset.name,
          job: el.dataset.job,
          power: parseInt(el.dataset.power) || 0
        }));
      });
    });
  }
}

// Call on init
const origInit = initCastleModule;
export function wrappedInitCastleModule() {
  origInit();
  window.renderCastleRoster();
}
window.initCastleModule = wrappedInitCastleModule;


window.autoAssignCastle = function(silent = false) {
  if (!silent) {
    if (!confirm("คุณต้องการจัดทีมชิงปราสาทอัตโนมัติ (150 คน) ใช่หรือไม่? ข้อมูลเดิมจะถูกทับทั้งหมด")) return;
  }
  
  let allMembers = [];
  if (window.guildRoster) {
    for (const job in window.guildRoster) {
      window.guildRoster[job].forEach(m => {
         allMembers.push({name: m.name, job: job, power: m.power});
      });
    }
  }
  
  // Sort by power descending
  allMembers.sort((a, b) => b.power - a.power);
  
  let memberIdx = 0;
  for (let z = 0; z < CASTLE_ZONES; z++) {
    for (let t = 0; t < CASTLE_TEAMS_PER_ZONE; t++) {
      for (let s = 0; s < CASTLE_TEAM_SIZE; s++) {
        const slotKey = getCastleSlotKey(z, t, s);
        if (memberIdx < allMembers.length) {
          castleAssignments[slotKey] = allMembers[memberIdx++];
        } else {
          castleAssignments[slotKey] = null;
        }
      }
    }
  }
  
  rebuildCastleOccupiedMap();
  saveCastleAssignments();
  renderCastlePage();
  if (window.renderRoster) window.renderRoster();
  if (!silent && window.showToast) window.showToast("จัดทีมชิงปราสาทอัตโนมัติสำเร็จ", "success");
}


document.addEventListener("DOMContentLoaded", initCastleModule);
