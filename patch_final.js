const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

// Rename Dungeon tab
html = html.replace('data-page="page-dungeons" onclick="switchTab(\'page-dungeons\')">⚔️ ระบบดันเจี้ยน</button>', 'data-page="page-dungeons" onclick="switchTab(\'page-dungeons\')">⚔️ จองคิวดันเจี้ยน</button>');

// Add Leave Tab Button
const tabRegex = /<button type="button" class="main-tab-btn" data-page="page-attendance"[\s\S]*?<\/button>/;
const tabReplacement = `$&
    <button type="button" class="main-tab-btn" data-page="page-leave" onclick="switchTab('page-leave')">📝 แจ้งลาวอ</button>`;
if (!html.includes('data-page="page-leave"')) {
  html = html.replace(tabRegex, tabReplacement);
}

// Add Auto Attendance Button
const autoRegex = /<button class="btn-primary" id="btnAdminCreateAttendance" onclick="createAttendanceDate\(\)" style="display: none;">.*?<\/button>/;
const autoReplacement = `$&
        <button class="btn-primary" id="btnAdminAutoAttendance" onclick="autoGenerateAttendance()" style="display: none; background: #8b5cf6;">✨ ออโต้สร้างตารางสัปดาห์นี้</button>`;
if (!html.includes('btnAdminAutoAttendance')) {
  html = html.replace(autoRegex, autoReplacement);
}

// Add Leave Section Page
const sectionRegex = /<!-- PAGE: DUNGEONS -->/;
const leaveSectionHTML = `<!-- PAGE: LEAVE -->
  <section id="page-leave" class="page">
    <div style="background: var(--surface); padding: 16px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="margin: 0 0 16px 0; font-family: var(--font-display); font-size: 18px; color: var(--blue-700);">📝 แบบฟอร์มแจ้งลาวอ</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div>
          <label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">ชื่อตัวละคร (ของตัวเองหรือเพื่อน)</label>
          <input type="text" id="leaveName" class="form-control" placeholder="พิมพ์ชื่อ...">
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
        </div>
        <div>
          <label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">วันที่มีกิจกรรม</label>
          <select id="leaveDay" class="form-control">
            <option value="">-- เลือกวัน --</option>
            <option value="Tuesday">อังคาร (รอบ 1, รอบ 2)</option>
            <option value="Thursday">พฤหัสบดี</option>
            <option value="Sunday">อาทิตย์</option>
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 12px; color: var(--text-lo); margin-bottom: 4px;">วันที่ลา (ปฏิทิน)</label>
          <input type="date" id="leaveDate" class="form-control">
        </div>
      </div>
      <button class="btn-primary" id="btnSubmitLeave" onclick="submitLeave()">บันทึกการลา</button>
    </div>

    <div style="background: var(--surface); padding: 16px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="margin: 0 0 16px 0; font-family: var(--font-display); font-size: 16px; color: var(--text-hi);">📅 รายการแจ้งลาล่วงหน้า</h2>
      <div class="table-responsive">
        <table class="team-table" style="width: 100%;">
          <thead>
            <tr>
              <th>วันที่ลา</th>
              <th>วัน</th>
              <th>ชื่อตัวละคร</th>
              <th>อาชีพ</th>
              <th style="width: 60px;">จัดการ</th>
            </tr>
          </thead>
          <tbody id="leaveListTbody">
            <!-- Render leaves here -->
          </tbody>
        </table>
      </div>
    </div>
  </section>

  `;
if (!html.includes('id="page-leave"')) {
  html = html.replace(sectionRegex, leaveSectionHTML + '$&');
}
fs.writeFileSync('index.html', html, 'utf8');

// 2. Fix app.js field tab active background issue
let app = fs.readFileSync('app.js', 'utf8');
const fieldTabRegex = /btn\.addEventListener\('click', \(\) => \{\s*currentFieldIdx = idx;\s*renderTeams\(\);\s*\}\);/;
const fieldTabReplacement = `btn.addEventListener('click', () => {
        currentFieldIdx = idx;
        document.querySelectorAll('#fieldTabs .field-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTeams();
      });`;
app = app.replace(fieldTabRegex, fieldTabReplacement);
fs.writeFileSync('app.js', app, 'utf8');

console.log('Final Patches Applied');
