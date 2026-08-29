const fs = require('fs');
let code = fs.readFileSync('module_dungeon.js', 'utf8');

// Replace the broken section from filteredQueues.sort all the way to the badge/join section
const broken = code.indexOf('filteredQueues.sort((a, b) => {');
const fixedEnd = code.indexOf('.join("");', broken) + '.join("");'.length;

if (broken === -1 || fixedEnd === -1) {
  console.log('Could not find broken section');
  process.exit(1);
}

console.log('Replacing lines', broken, 'to', fixedEnd);

const newQueueSection = `filteredQueues.sort((a, b) => {
          const aDone = a.status === 'done' ? 1 : 0;
          const bDone = b.status === 'done' ? 1 : 0;
          if (aDone !== bDone) return aDone - bDone;
          return (a.timestamp || 0) - (b.timestamp || 0);
        });
        const badge = document.getElementById('dqCountBadge');
        if (badge) badge.textContent = filteredQueues.filter(q => q.status !== 'done').length + ' คน';
        if (filteredQueues.length === 0) {
          qList.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-lo);font-size:14px;">ยังไม่มีคิว</div>';
        } else {
          qList.innerHTML = filteredQueues.map((q) => {
            const currentTeams = dungeonData.teams.filter(t => t.type === currentTab);
            let inTeamIndex = -1;
            currentTeams.forEach((team, tIdx) => {
              if (team.members && Array.isArray(team.members)) {
                if (team.members.some(m => m && m.name && q && q.name && m.name?.toLowerCase() === q.name?.toLowerCase())) {
                  inTeamIndex = tIdx + 1;
                }
              }
            });
            let sColor, sText;
            if (inTeamIndex !== -1) {
              sColor = 'var(--blue-500)';
              sText = 'อยู่ในทีม ' + inTeamIndex;
            } else {
              sColor = q.status === 'done' ? 'var(--ok)' : q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)';
              sText = q.status === 'done' ? 'สำเร็จ' : q.status === 'active' ? 'กำลังลงดัน' : 'รอลงดัน';
            }
            const eName = window.escapeHtml ? window.escapeHtml(q.name) : q.name;
            const eJob = window.escapeHtml ? window.escapeHtml(q.job || '') : q.job || '';
            const isOwner = window.currentUser && q.name?.toLowerCase() === window.currentUser.username?.toLowerCase();
            const memberCtrl = (!isAdmin && isOwner)
              ? \`<button onclick="deleteDungeonQueue('\${q.id}')" style="font-size:12px;padding:4px 12px;border:1.5px solid var(--danger);background:transparent;color:var(--danger);border-radius:6px;cursor:pointer;white-space:nowrap;">ยกเลิก</button>\`
              : '';
            const adminCtrl = isAdmin
              ? \`<button onclick="changeDungeonQueueStatus('\${q.id}','done')" style="font-size:12px;padding:4px 12px;border:none;background:var(--ok);color:white;border-radius:6px;cursor:pointer;white-space:nowrap;">ลงเสร็จ</button>
                 <button onclick="deleteDungeonQueue('\${q.id}')" style="font-size:12px;padding:4px 12px;border:1.5px solid var(--danger);background:transparent;color:var(--danger);border-radius:6px;cursor:pointer;white-space:nowrap;">ลบ</button>\`
              : '';
            const dragAttr = isAdmin
              ? \`draggable="true" data-queue-name="\${eName}" data-queue-job="\${eJob}" data-queue-power="\${q.power || 0}" data-queue-time="\${q.timestamp || ""}"\`
              : '';
            const jobColor = q.job && window.JOB_COLORS && window.JOB_COLORS[q.job] ? window.JOB_COLORS[q.job] : 'var(--text-lo)';
            const statusBorder = q.status === 'done' ? 'var(--ok)' : q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)';
            return \`<div \${dragAttr} style="padding:14px 20px;border-bottom:1px solid var(--line);background:white;border-left:4px solid \${statusBorder};\${isAdmin ? 'cursor:grab;' : ''}" ondragstart="window.onDungeonQueueDragStart(event)">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <strong style="color:var(--text-hi);font-size:18px;font-weight:800;">\${eName}</strong>
                <span style="font-size:13px;color:\${jobColor};font-weight:700;background:rgba(0,0,0,0.07);padding:3px 10px;border-radius:8px;">\${q.job || ''}</span>
                \${q.power ? '<span style="font-size:13px;color:var(--text-lo);font-weight:700;">' + Number(q.power).toLocaleString('en-US') + '</span>' : ''}
                <span style="font-size:13px;padding:4px 14px;border-radius:20px;font-weight:700;color:\${sColor};border:1.5px solid \${sColor};background:white;white-space:nowrap;">\${sText}</span>
                <div style="display:flex;gap:6px;margin-left:auto;">\${adminCtrl}\${memberCtrl}</div>
              </div>
              \${q.timestamp ? '<div style="font-size:12px;color:var(--text-lo);margin-top:5px;">' + new Date(q.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + ' น.</div>' : ''}
            </div>\`;
          }).join('');
        }`;

code = code.slice(0, broken) + newQueueSection + code.slice(fixedEnd);
fs.writeFileSync('module_dungeon.js', code);
console.log('Fixed queue section!');
