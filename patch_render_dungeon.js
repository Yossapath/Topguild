const fs = require('fs');
let code = fs.readFileSync('auth_dungeon.js', 'utf8');

// Normalize to LF
code = code.replace(/\r\n/g, '\n');

// Find the start of renderDungeonPage function
const startMarker = 'function renderDungeonPage() {';
const startIdx = code.indexOf(startMarker);
if (startIdx === -1) { console.log('ERROR: could not find renderDungeonPage'); process.exit(1); }

// Find end by brace counting
let depth = 0;
let endIdx = -1;
for (let i = startIdx + startMarker.length - 1; i < code.length; i++) {
  if (code[i] === '{') depth++;
  if (code[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
}
if (endIdx === -1) { console.log('ERROR: could not find end of renderDungeonPage'); process.exit(1); }

console.log('Found renderDungeonPage from char', startIdx, 'to', endIdx);

const newRenderDungeonPage = `function renderDungeonPage() {
  const isAdmin = window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin';
  const currentTab = window.currentDungeonTab || 'มายา (Maya)';

  // Admin controls visibility
  const dc = document.getElementById('dungeonAdminControls');
  if (dc) dc.style.display = 'flex';

  // Update "Create Team" button label
  const btnCreate = document.getElementById('btnCreateDungeonTeam');
  if (btnCreate) {
    btnCreate.style.display = isAdmin ? 'inline-flex' : 'inline-flex';
    btnCreate.innerHTML = isAdmin
      ? ('+ สร้างทีม' + currentTab.split(' ')[0])
      : '+ สร้างทีมใหม่';
  }

  // ---- QUEUE PANEL ----
  const qList = document.getElementById('dqList');
  if (qList) {
    const filteredQueues = dungeonData.queues.filter(q => q.dungeon === currentTab);
    if (filteredQueues.length === 0) {
      qList.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-lo); font-size:13px;">ยังไม่มีคิว</div>';
    } else {
      qList.innerHTML = filteredQueues.map(q => {
        const sColor = q.status === 'done' ? 'var(--ok)' : (q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)');
        const sText = q.status === 'done' ? 'สำเร็จ' : (q.status === 'active' ? 'กำลังลงดัน' : 'รอลงดัน');
        const eName = window.escapeHtml ? window.escapeHtml(q.name) : q.name;
        const eJob = window.escapeHtml ? window.escapeHtml(q.job) : q.job;
        const adminCtrl = isAdmin ? \`
          <div style="display:flex; gap:4px; margin-top:8px;">
            <button class="btn-secondary" onclick="changeDungeonQueueStatus('\${q.id}','waiting')" style="font-size:11px;padding:2px 4px;">รอ</button>
            <button class="btn-secondary" onclick="changeDungeonQueueStatus('\${q.id}','active')" style="font-size:11px;padding:2px 4px;">กำลังลง</button>
            <button class="btn-secondary" onclick="changeDungeonQueueStatus('\${q.id}','done')" style="font-size:11px;padding:2px 4px;">เสร็จ</button>
            <button class="btn-secondary" onclick="deleteDungeonQueue('\${q.id}')" style="font-size:11px;padding:2px 4px;color:var(--danger);border-color:var(--danger);">ลบ</button>
          </div>\` : '';
        const dragAttr = isAdmin ? \`draggable="true" data-queue-name="\${eName}" data-queue-job="\${eJob}" data-queue-power="\${q.power || 0}"\` : '';
        return \`<div \${dragAttr} style="padding:10px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;\${isAdmin ? 'cursor:grab;' : ''}" ondragstart="window.onDungeonQueueDragStart(event)">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <strong style="color:var(--text-hi);font-size:14px;">\${eName}</strong>
              <span style="font-size:11px;color:var(--text-lo);margin-left:6px;">\${q.job}</span>
              \${q.power ? '<span style="font-size:11px;color:var(--text-lo);">⚡' + Number(q.power).toLocaleString('en-US') + '</span>' : ''}
              \${q.timestamp ? '<div style="font-size:10.5px;color:var(--text-lo);margin-top:5px;">🕒 ' + new Date(q.timestamp).toLocaleString('th-TH', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) + ' น.</div>' : ''}
            </div>
            <span style="font-size:11px;padding:2px 6px;border-radius:12px;background:color-mix(in srgb, \${sColor} 15%, transparent);color:\${sColor};font-weight:600;">\${sText}</span>
          </div>
          \${adminCtrl}
        </div>\`;
      }).join('');
    }
  }

  // ---- TEAMS AREA ----
  const tArea = document.getElementById('dungeonTeamsArea');
  if (!tArea) return;

  const teamsForTab = (dungeonData.teams || []).filter(t => t.type === currentTab);

  if (teamsForTab.length === 0) {
    tArea.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-lo);">' +
      (isAdmin ? 'ยังไม่มีทีม กดปุ่มด้านบนเพื่อสร้างทีม' : 'ยังไม่มีทีมในดันเจี้ยนนี้') +
      '</div>';
    return;
  }

  tArea.innerHTML = teamsForTab.map(t => {
    let mHtml = '';
    let totalPower = 0;
    let filledCount = 0;

    for (let i = 0; i < t.capacity; i++) {
      const member = t.members[i];
      const memberName = member ? (typeof member === 'string' ? member : (member.name || '')) : '';
      let memberJob = member ? (typeof member === 'string' ? '' : (member.job || '')) : '';
      let memberPower = member ? (typeof member === 'string' ? null : (member.power || null)) : null;

      // Auto-lookup from roster if job missing
      if (memberName && !memberJob && window.guildRoster) {
        for (const j in window.guildRoster) {
          const found = (window.guildRoster[j] || []).find(m => m.name.toLowerCase() === memberName.toLowerCase());
          if (found) { memberJob = j; memberPower = found.power; break; }
        }
      }

      if (memberName) { filledCount++; if (memberPower) totalPower += Number(memberPower); }

      const eName = window.escapeHtml ? window.escapeHtml(memberName) : memberName;
      const jobColor = memberJob && window.JOB_COLORS ? window.JOB_COLORS[memberJob] : 'var(--text-hi)';
      const rowClass = !memberName ? 'empty-row' : '';

      if (isAdmin) {
        mHtml += \`
          <tr class="\${rowClass}" data-team-id="\${t.id}" data-slot="\${i}"
            ondragover="event.preventDefault(); this.style.background='var(--blue-100)';"
            ondragleave="this.style.background='';"
            ondrop="window.onDungeonSlotDrop(event,'\${t.id}',\${i}); this.style.background='';">
            <td class="cell-rank">\${i + 1}</td>
            <td>
              <input type="text" class="cell-input name-input autocomplete-member"
                onchange="updateDungeonTeamName('\${t.id}',\${i},this.value)"
                data-team-id="\${t.id}" data-slot-idx="\${i}" data-action="dungeonTeam"
                value="\${memberName ? eName : ''}"
                placeholder="🔍 พิมพ์/คลิก..." autocomplete="off"
                style="width:100%;min-width:140px;font-size:14px;padding:6px;">
            </td>
            <td>
              <select class="cell-input job-input \${memberJob ? '' : 'empty'}"
                onchange="updateDungeonTeamJob('\${t.id}',\${i},this.value)"
                style="width:100%;min-width:120px;font-size:14px;padding:6px;text-align:center;">
                \${dungeonJobSelectHtml(memberJob)}
              </select>
            </td>
            <td class="cell-action">
              <button class="clear-btn" onclick="clearDungeonSlot('\${t.id}',\${i})" title="ล้างช่องนี้">✕</button>
            </td>
          </tr>\`;
      } else {
        mHtml += \`
          <tr>
            <td class="cell-rank">\${i + 1}</td>
            <td style="padding-left:8px;font-size:14px;color:var(--text-hi);">
              \${memberName ? eName : '<i style="color:var(--text-lo)">- ว่าง -</i>'}
            </td>
            <td style="text-align:center;font-size:14px;font-weight:600;color:\${jobColor};">\${memberJob || '-'}</td>
            <td></td>
          </tr>\`;
      }
    }

    const pct = filledCount / t.capacity;
    const badgeClass = pct === 1 ? 'ok' : (pct > 0.5 ? 'warn' : '');
    const badgeText = filledCount === t.capacity
      ? 'ครบ ' + filledCount + '/' + t.capacity
      : 'ขาด ' + (t.capacity - filledCount) + ' คน';

    return \`
      <div class="team-card" style="width:100%;">
        <div class="team-card-head" style="display:flex;justify-content:space-between;align-items:center;padding:12px;">
          <div class="team-title-group">
            <span style="font-size:16px;">🗡️ \${t.dungeonName || t.type}</span>
            <span class="team-power-sum" style="font-size:14px;">⚡ \${totalPower.toLocaleString('en-US')}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="status-badge \${badgeClass}" style="font-size:13px;padding:4px 8px;">\${badgeText}</span>
            \${isAdmin ? '<button class="btn-delete-dungeon-team" onclick="deleteDungeonTeam(\\'' + t.id + '\\')" style="background:transparent;border:none;color:white;cursor:pointer;font-size:16px;" title="ลบทีม">✕</button>' : ''}
          </div>
        </div>
        <div>
          <table class="team-table" style="width:100%;table-layout:auto;">
            <thead><tr>
              <th style="width:30px;">#</th>
              <th>ชื่อ</th>
              <th style="text-align:center;">อาชีพ</th>
              <th style="width:36px;"></th>
            </tr></thead>
            <tbody>\${mHtml}</tbody>
          </table>
          <div style="display:flex;gap:8px;margin-top:8px;">
            \${!isAdmin ? '<button class="btn-primary" style="flex:1;border-radius:8px;padding:6px;font-size:13px;" onclick="memberJoinTeam(\\'' + t.id + '\\')">เข้าร่วมทีม</button>' : ''}
            \${isAdmin ? '<button class="btn-secondary" style="flex:1;border-radius:8px;padding:6px;font-size:13px;border-color:var(--ok);color:var(--ok);" onclick="clearDungeonTeam(\\'' + t.id + '\\')">✅ ลงสำเร็จ</button>' : ''}
          </div>
        </div>
      </div>\`;
  }).join('');
}`;

code = code.slice(0, startIdx) + newRenderDungeonPage + code.slice(endIdx);
fs.writeFileSync('auth_dungeon.js', code, 'utf8');
console.log('SUCCESS: rewrote renderDungeonPage cleanly');
