const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Find the boundaries of the dungeon section
const startMarker = '<section id="page-dungeons" class="page">';
const endMarker = '</section>';
const startIdx = code.indexOf(startMarker);
if (startIdx === -1) { console.log('start not found'); process.exit(1); }

// Find the end of the section
let depth = 0;
let i = startIdx;
let endIdx = -1;
while (i < code.length) {
  if (code.slice(i, i + 8) === '<section') depth++;
  else if (code.slice(i, i + 10) === '</section>') {
    depth--;
    if (depth === 0) {
      endIdx = i + 10;
      break;
    }
  }
  i++;
}

if (endIdx === -1) { console.log('end not found'); process.exit(1); }

console.log('Section start:', startIdx, 'end:', endIdx);
console.log('First 200 chars of section:\n', code.slice(startIdx, startIdx + 200));

const newSection = `  <section id="page-dungeons" class="page">
    <!-- Full-width dungeon booking UI -->
    <div style="background: var(--surface); border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;">
      <!-- Header -->
      <div style="background: var(--blue-700); color: white; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">🏰 ระบบจองคิวลงดันเจี้ยน</h2>
        <div id="dungeonAdminControls" style="display:flex; gap:8px; align-items:center;"></div>
      </div>
      <!-- Tabs -->
      <div id="dungeonTabsContainer" style="display: flex; border-bottom: 2px solid var(--line); background: var(--bg-card);">
        <button type="button" class="dungeon-tab active" data-type="มายา (Maya)" onclick="switchDungeonTab('มายา (Maya)')" style="flex:1; padding:14px; font-size:15px; font-weight:700; border-radius:0;">มายา (Maya)</button>
        <button type="button" class="dungeon-tab" data-type="บับเบิ้ล (Bubble)" onclick="switchDungeonTab('บับเบิ้ล (Bubble)')" style="flex:1; padding:14px; font-size:15px; font-weight:700; border-radius:0;">บับเบิ้ล (Bubble)</button>
        <button type="button" class="dungeon-tab" data-type="กระจก (Mirror)" onclick="switchDungeonTab('กระจก (Mirror)')" style="flex:1; padding:14px; font-size:15px; font-weight:700; border-radius:0;">กระจก (Mirror)</button>
      </div>
      <!-- Body: form left + queue right -->
      <div style="display:flex; align-items:flex-start; min-height:520px;">
        <!-- Booking form -->
        <div style="width:340px; flex-shrink:0; border-right:2px solid var(--line); padding:24px; background:var(--surface);">
          <h3 style="margin:0 0 20px 0; font-size:16px; color:var(--blue-700); font-weight:700;">📋 จองคิวลงดัน</h3>
          <label style="font-size:11px; font-weight:700; color:var(--text-lo); display:block; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">ชื่อตัวละคร</label>
          <input type="text" id="dqName" class="form-control autocomplete-member" data-action="dungeonQueue" placeholder="พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off" style="font-size:15px; padding:12px 14px; height:48px; width:100%; box-sizing:border-box; margin-bottom:6px;">
          <div id="dqScoreDisplay" style="font-size:12px; color:var(--text-lo); margin-bottom:12px; font-weight:600; min-height:18px;"></div>
          <label style="font-size:11px; font-weight:700; color:var(--text-lo); display:block; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">อาชีพ</label>
          <select id="dqClass" class="form-control" style="font-size:15px; padding:12px 14px; height:48px; width:100%; box-sizing:border-box; margin-bottom:12px;">
            <option value="" disabled selected>-- เลือกอาชีพ --</option>
            <option value="Lord Knight">Lord Knight</option>
            <option value="Paladin">Paladin</option>
            <option value="High Wizard">High Wizard</option>
            <option value="Sniper">Sniper</option>
            <option value="Priest">Priest</option>
            <option value="Champion">Champion</option>
            <option value="Assassin Cross">Assassin Cross</option>
            <option value="Mastersmith">Mastersmith</option>
            <option value="Gunslinger">Gunslinger</option>
            <option value="Druid">Druid</option>
          </select>
          <label style="font-size:11px; font-weight:700; color:var(--text-lo); display:block; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">ดันเจี้ยน</label>
          <select id="dqDungeon" class="form-control" style="font-size:15px; padding:12px 14px; height:48px; width:100%; box-sizing:border-box; margin-bottom:20px;">
            <option value="มายา (Maya)">ดันมายา (5 คน)</option>
            <option value="บับเบิ้ล (Bubble)">ดันบับเบิ้ล (10 คน)</option>
            <option value="กระจก (Mirror)">ดันกระจก (10 คน)</option>
          </select>
          <button class="btn-primary" style="width:100%; font-size:17px; padding:16px; font-weight:700; border-radius:10px;" onclick="bookDungeonQueue()">🎯 จองคิวลงดันเจี้ยน</button>
          <!-- Admin run queue controls -->
          <div id="dungeonRunControls" style="margin-top:16px; display:none;">
            <hr style="border:none; border-top:1px solid var(--line); margin:16px 0;">
            <button class="btn-secondary" style="width:100%; font-size:14px; padding:12px; font-weight:700; border-color:var(--ok); color:var(--ok);" onclick="window.runDungeonQueue && window.runDungeonQueue()">▶️ รันคิว (จัดทีมอัตโนมัติ)</button>
            <button class="btn-secondary" style="width:100%; font-size:14px; padding:10px; margin-top:8px; font-weight:600; border-color:var(--danger); color:var(--danger);" onclick="window.clearDungeonQueues && window.clearDungeonQueues()">🗑️ ล้างคิวทั้งหมด</button>
          </div>
        </div>
        <!-- Queue list -->
        <div style="flex:1; display:flex; flex-direction:column; min-height:520px; background:var(--bg-card);">
          <div style="padding:16px 20px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between;">
            <h3 style="margin:0; font-size:15px; color:var(--text-hi); font-weight:700;">📋 รายคิวจอง</h3>
            <span id="dqCountBadge" style="background:var(--blue-100); color:var(--blue-700); font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px;">0 คน</span>
          </div>
          <div id="dqList" style="flex:1; overflow-y:auto; max-height:600px;"></div>
        </div>
      </div>
    </div>
    <!-- Hidden: still needed by JS -->
    <div id="dungeonTeamsArea" style="display:none;"></div>
  </section>`;

code = code.slice(0, startIdx) + newSection + '\n\n' + code.slice(endIdx);
fs.writeFileSync('index.html', code);
console.log('Dungeon section replaced!');
