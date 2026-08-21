const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Restore the autocomplete structure for leave name
const oldLeaveForm = `<label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">ชื่อตัวละคร (ของคุณ)</label>
          <input type="text" id="leaveName" class="form-control" readonly style="background: var(--bg-soft); color: var(--text-hi); opacity: 0.8;">
        </div>
        <div>
          <label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">อาชีพ</label>
          <input type="text" id="leaveJob" class="form-control" readonly style="background: var(--bg-soft); color: var(--text-hi); opacity: 0.8;">
        </div>`;
const newLeaveForm = `<label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">ชื่อตัวละคร</label>
          <div style="position:relative;">
            <input type="text" id="leaveName" class="form-control autocomplete-member" data-action="leaveForm" placeholder="🔍 พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off">
          </div>
        </div>
        <div>
          <label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">อาชีพ</label>
          <select id="leaveJob" class="form-control">
            <option value="">-- เลือกอาชีพ --</option>
            <option value="Lord Knight">Lord Knight</option>
            <option value="Paladin">Paladin</option>
            <option value="Assassin Cross">Assassin Cross</option>
            <option value="Sniper">Sniper</option>
            <option value="High Wizard">High Wizard</option>
            <option value="Priest">Priest</option>
            <option value="Druid">Druid</option>
            <option value="Merchant">Merchant</option>
            <option value="Champion">Champion</option>
            <option value="Gunslinger">Gunslinger</option>
          </select>
        </div>`;

if (html.includes('id="leaveName" class="form-control" readonly')) {
  html = html.replace(oldLeaveForm, newLeaveForm);
  fs.writeFileSync('index.html', html, 'utf8');
}

let js = fs.readFileSync('auth_dungeon.js', 'utf8');
// Fix global dropdown to handle data-action="leaveForm"
const globalActionLogic = `if (action === 'mainField') {
             const slot = window.activeAutocompleteInput.getAttribute('data-slot');
             if (typeof handleNameChange === 'function') handleNameChange(slot, newName);
          } else if (action === 'dungeonTeam') {
             const teamId = window.activeAutocompleteInput.getAttribute('data-team-id');
             const slotIdx = window.activeAutocompleteInput.getAttribute('data-slot-idx');
             if (typeof updateDungeonTeamName === 'function') updateDungeonTeamName(teamId, parseInt(slotIdx), newName);
          } else if (action === 'leaveForm') {
             const job = item.getAttribute('data-job');
             const leaveJob = document.getElementById('leaveJob');
             if (leaveJob) leaveJob.value = job;
          }`;
js = js.replace(/if \(action === 'mainField'\) \{[\s\S]*?updateDungeonTeamName.*?\}[\s\S]*?\}/, globalActionLogic);
fs.writeFileSync('auth_dungeon.js', js, 'utf8');

console.log('Fixed leave inputs');
