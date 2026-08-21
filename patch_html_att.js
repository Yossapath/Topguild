const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove btnAdminCreateAttendance
const btnRegex = /<button class="btn-primary" id="btnAdminCreateAttendance"[^>]*>➕ สร้างวันเช็คชื่อใหม่<\/button>/;
if (btnRegex.test(html)) {
    html = html.replace(btnRegex, '');
    console.log('Removed btnAdminCreateAttendance');
}

// Fix table headers
const oldHeaders = `<th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--blue-900);">อาชีพ</th>
              <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--blue-900);">ค่าพลัง</th>`;
const newHeaders = `<th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--blue-900);">อาชีพ / ค่าพลัง</th>`;
html = html.replace(oldHeaders, newHeaders);

// Fix colspan in the default html
html = html.replace(/<td colspan="5"/g, '<td colspan="4"');

fs.writeFileSync('index.html', html, 'utf8');
