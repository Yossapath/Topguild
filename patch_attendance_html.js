const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<button class="btn-primary" id="btnAdminCreateAttendance" onclick="createAttendanceDate\(\)" style="display: none;">.*?<\/button>/;
const replacement = `$&
        <button class="btn-primary" id="btnAdminAutoAttendance" onclick="autoGenerateAttendance()" style="display: none; background: #8b5cf6;">✨ ออโต้สร้างตารางสัปดาห์นี้</button>`;
html = html.replace(regex, replacement);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Injected Auto Attendance button');
