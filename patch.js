const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace Attendance Header
html = html.replace(
  '<section id="page-attendance" class="page">\r\n    <div style="background: var(--surface); padding: 16px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">',
  '<section id="page-attendance" class="page">\r\n    <div style="background: var(--surface); padding: 16px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">\r\n      <div style="display:flex; align-items:center; gap:16px;" id="attHeaderTitleGroup">'
);

// We need to inject the tabs right after the h2
html = html.replace(
  '<button class="btn-primary" id="btnAdminCreateAttendance"',
  '<div class="field-tabs" style="margin-bottom:0; display:flex; gap:8px;">\r\n          <button class="field-tab-btn active" id="btnAttTabDaily" onclick="window.switchAttTab(\'daily\')">เช็คชื่อรายวัน</button>\r\n          <button class="field-tab-btn" id="btnAttTabStats" onclick="window.switchAttTab(\'stats\')">สถิติรวม</button>\r\n        </div>\r\n      </div>\r\n      <button class="btn-primary" id="btnAdminCreateAttendance"'
);

// 2. Wrap Daily view
html = html.replace(
  '<div id="attendanceControls"',
  '<div id="attDailyView">\r\n    <div id="attendanceControls"'
);

// 3. Add Delete Button
html = html.replace(
  '</select>\r\n      </div>',
  '</select>\r\n        <button id="btnDeleteAttendanceDate" class="btn-secondary" style="border-color: var(--danger); color: var(--danger); display: none; padding: 6px 12px;" onclick="window.deleteAttendanceDate()">🗑️ ลบวันที่นี้</button>\r\n      </div>'
);

// 4. Close Daily View and Add Stats View
html = html.replace(
  '</table>\r\n    </div>\r\n  </section>',
  '</table>\r\n    </div>\r\n    </div>\r\n\r\n    <div id="attStatsView" style="display: none;">\r\n      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">\r\n        <h3 style="margin:0; color:var(--text-hi);">สถิติการเช็คชื่อทั้งหมด</h3>\r\n        <input type="text" id="attStatsSearch" class="form-control" placeholder="🔍 ค้นหารายชื่อ..." style="max-width: 250px;" onkeyup="window.renderAttendanceStats()">\r\n      </div>\r\n      <div style="background: var(--surface); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; overflow-x: auto;">\r\n        <table style="width: 100%; border-collapse: collapse; min-width: 600px;">\r\n          <thead>\r\n            <tr style="background: var(--bg-soft); border-bottom: 2px solid var(--line);">\r\n              <th style="padding: 12px 16px; text-align: left; font-family: var(--font-display); color: var(--blue-900); width:30px;">#</th>\r\n              <th style="padding: 12px 16px; text-align: left; font-family: var(--font-display); color: var(--blue-900);">ชื่อตัวละคร</th>\r\n              <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--ok);">🟢 เข้าร่วม (ครั้ง)</th>\r\n              <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--warn);">🟡 ลา (ครั้ง)</th>\r\n              <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--danger);">🔴 ขาด (ครั้ง)</th>\r\n            </tr>\r\n          </thead>\r\n          <tbody id="attStatsTbody">\r\n            <tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-lo);">กำลังโหลดสถิติ...</td></tr>\r\n          </tbody>\r\n        </table>\r\n      </div>\r\n    </div>\r\n  </section>'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('patched successfully');
