const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldHeaders = `<th style="padding: 12px 16px; text-align: left; font-family: var(--font-display); color: var(--blue-900); width:30px;">#</th>
                <th style="padding: 12px 16px; text-align: left; font-family: var(--font-display); color: var(--blue-900);">ชื่อตัวละคร</th>
                <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--ok);">🟢 เข้าร่วม (ครั้ง)</th>
                <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--warn);">🟡 ลา (ครั้ง)</th>
                <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--danger);">🔴 ขาด (ครั้ง)</th>`;

const newHeaders = `<th style="padding: 12px 16px; text-align: left; font-family: var(--font-display); color: var(--blue-900); width:30px;">#</th>
                <th style="padding: 12px 16px; text-align: left; font-family: var(--font-display); color: var(--blue-900);">ชื่อตัวละคร</th>
                <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--blue-900);">อาชีพ</th>
                <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--ok);">🟢 เข้าร่วม</th>
                <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--warn);">🟡 ลา</th>
                <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--danger);">🔴 ขาด</th>
                <th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--blue-900);">% มา</th>`;

if (html.includes('<th style="padding: 12px 16px; text-align: center; font-family: var(--font-display); color: var(--danger);">🔴 ขาด (ครั้ง)</th>')) {
    html = html.replace(/<th style="padding: 12px 16px; text-align: left; font-family: var\(--font-display\); color: var\(--blue-900\); width:30px;">#<\/th>[\s\S]*?<th style="padding: 12px 16px; text-align: center; font-family: var\(--font-display\); color: var\(--danger\);">🔴 ขาด \(ครั้ง\)<\/th>/, newHeaders);
    console.log('Fixed stats HTML headers via regex');
} else {
    console.log('Regex did not match');
}

// Fix the loading message colspan from 4 to 7
html = html.replace(/<td colspan="4"([^>]*>กำลังโหลดสถิติ)/g, '<td colspan="7"$1');

fs.writeFileSync('index.html', html, 'utf8');
