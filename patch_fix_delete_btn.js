const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the old button
const oldBtnRegex = /<button id="btnDeleteAttendanceDate" class="btn-secondary" style="border-color: var\(--danger\); color: var\(--danger\); display: none; padding: 6px 12px;" onclick="window\.deleteAttendanceDate\(\)">🗑️ ลบวันที่นี้<\/button>/;
if (html.match(oldBtnRegex)) {
    html = html.replace(oldBtnRegex, '');
    console.log('Removed old button from Register form');
}

// 2. Insert the correct button after attendanceDateSelect
const btnDeleteHTML = `<button id="btnDeleteAttendanceDate" class="btn-secondary" style="border-color: var(--danger); color: var(--danger); display: none; padding: 6px 12px; margin-left: 8px;" onclick="window.deleteAttendanceDate()">🗑️ ลบวันที่นี้</button>`;
if (!html.includes('id="btnDeleteAttendanceDate"')) {
    html = html.replace(
        /(<select id="attendanceDateSelect"[\s\S]*?<\/select>)/, 
        `$1\n          ${btnDeleteHTML}`
    );
    console.log('Inserted new button near select');
}

fs.writeFileSync('index.html', html, 'utf8');
