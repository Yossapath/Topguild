const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

// Replace the leave form inputs
const oldLeaveForm = /<label style="display: block; font-size: 12px; color: var\(--text-lo\); margin-bottom: 4px;">ชื่อตัวละคร[\s\S]*?<\/select>\s*<\/div>/;
const newLeaveForm = `<label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">ชื่อตัวละคร (ของคุณ)</label>
          <input type="text" id="leaveName" class="form-control" readonly style="background: var(--bg-soft); color: var(--text-hi); opacity: 0.8;">
        </div>
        <div>
          <label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">อาชีพ</label>
          <input type="text" id="leaveJob" class="form-control" readonly style="background: var(--bg-soft); color: var(--text-hi); opacity: 0.8;">
        </div>`;

html = html.replace(oldLeaveForm, newLeaveForm);

// Replace the dropdown
const oldDropdown = /<select id="leaveDay" class="form-control">[\s\S]*?<\/select>/;
const newDropdown = `<select id="leaveDay" class="form-control">
            <option value="">-- เลือกรอบที่ต้องการลา --</option>
            <option value="Tuesday_1">อังคาร รอบ 1 (21:30 - 21:55)</option>
            <option value="Tuesday_2">อังคาร รอบ 2 (22:00 - 22:25)</option>
            <option value="Thursday_1">พฤหัสบดี (22:00 - 22:25)</option>
            <option value="Sunday_1">อาทิตย์ (21:00 - 22:00)</option>
          </select>`;

html = html.replace(oldDropdown, newDropdown);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Patched HTML');
