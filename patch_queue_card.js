const fs = require('fs');

// ======= Patch module_dungeon.js by line numbers =======
let lines = fs.readFileSync('module_dungeon.js', 'utf8').split('\n');

// Find line 664 area (memberCtrl and adminCtrl)
// Replace lines 664-686 with new code
// First locate them exactly
let start = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const memberCtrl = (!isAdmin') && lines[i].includes('deleteDungeonQueue')) {
    start = i;
    break;
  }
}

if (start === -1) {
  console.log('Could not find memberCtrl line');
  process.exit(1);
}

console.log('Found memberCtrl at line:', start + 1);

// Find end (the closing div after adminCtrl/memberCtrl)
let end = -1;
for (let i = start; i < lines.length; i++) {
  if (lines[i].includes('${adminCtrl}${memberCtrl}')) {
    // find the closing </div>` after this
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('</div>`;') || lines[j].includes('</div>\`;')) {
        end = j;
        break;
      }
    }
    break;
  }
}

if (end === -1) {
  console.log('Could not find end of card template');
  process.exit(1);
}

console.log('End of card at line:', end + 1);

// New card code to replace lines start..end
const newCardLines = [
  `              const isOwner = window.currentUser && q.name?.toLowerCase() === window.currentUser.username?.toLowerCase();`,
  `              const memberCtrl = (!isAdmin && isOwner) ? \`<div style="display:flex;gap:8px;margin-top:12px;">`,
  `                <button class="btn-secondary" onclick="deleteDungeonQueue('\${q.id}')" style="font-size:13px;padding:8px 16px;color:var(--danger);border-color:var(--danger);flex:1;">🗑 ยกเลิกการจอง</button>`,
  `              </div>\` : '';`,
  `              const adminCtrl = isAdmin ? \`<div style="display:flex;gap:8px;margin-top:12px;">`,
  `                <button class="btn-primary" onclick="changeDungeonQueueStatus('\${q.id}','done')" style="font-size:13px;padding:8px 16px;flex:1;background:var(--ok);border:none;">✅ ลงเสร็จ</button>`,
  `                <button class="btn-secondary" onclick="deleteDungeonQueue('\${q.id}')" style="font-size:13px;padding:8px 16px;color:var(--danger);border-color:var(--danger);">🗑 ลบ</button>`,
  `              </div>\` : '';`,
  `              const dragAttr = isAdmin`,
  `                ? \`draggable="true" data-queue-name="\${eName}" data-queue-job="\${eJob}" data-queue-power="\${q.power || 0}" data-queue-time="\${q.timestamp || ""}"\``,
  `                : "";`,
  `              const jobColor = q.job && window.JOB_COLORS && window.JOB_COLORS[q.job] ? window.JOB_COLORS[q.job] : 'var(--text-lo)';`,
  `              const statusBg = q.status === 'done' ? 'rgba(22,163,74,0.08)' : q.status === 'active' ? 'rgba(37,99,235,0.08)' : 'rgba(245,158,11,0.08)';`,
  `              const statusBorder = q.status === 'done' ? 'var(--ok)' : q.status === 'active' ? 'var(--blue-500)' : 'var(--warn)';`,
  `              return \`<div \${dragAttr} style="padding:16px 20px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;background:\${statusBg};border-left:4px solid \${statusBorder};\${isAdmin ? 'cursor:grab;' : ''}" ondragstart="window.onDungeonQueueDragStart(event)">`,
  `                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">`,
  `                  <div>`,
  `                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">`,
  `                      <strong style="color:var(--text-hi);font-size:17px;font-weight:700;">\${eName}</strong>`,
  `                      <span style="font-size:12px;color:\${jobColor};font-weight:700;background:rgba(0,0,0,0.06);padding:3px 10px;border-radius:10px;">\${q.job || ''}</span>`,
  `                      \${q.power ? '<span style="font-size:12px;color:var(--text-lo);font-weight:600;">' + Number(q.power).toLocaleString('en-US') + '</span>' : ''}`,
  `                    </div>`,
  `                    \${q.timestamp ? '<div style="font-size:11px;color:var(--text-lo);">🕒 ' + new Date(q.timestamp).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + ' น.</div>' : ''}`,
  `                  </div>`,
  `                  <span style="font-size:12px;padding:5px 14px;border-radius:20px;font-weight:700;color:\${sColor};border:1.5px solid \${sColor};background:white;white-space:nowrap;flex-shrink:0;">\${sText}</span>`,
  `                </div>`,
  `                \${adminCtrl}\${memberCtrl}`,
  `              </div>\`;`,
];

// Replace lines start..end with new card lines
lines.splice(start, end - start + 1, ...newCardLines);

fs.writeFileSync('module_dungeon.js', lines.join('\n'));
console.log('Patched card rendering. Lines replaced:', start+1, 'to', end+1);
