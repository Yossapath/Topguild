const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let app = fs.readFileSync('app.js', 'utf8');
let auth = fs.readFileSync('auth_dungeon.js', 'utf8');

// index.html replacements (skip the nav tabs!)
// We can just target the specific buttons they mentioned.
html = html.replace(/🗑️ ลบ/g, 'ลบ');
html = html.replace(/➕ เพิ่ม/g, 'เพิ่ม');
html = html.replace(/⚡ /g, '');
html = html.replace(/❌ /g, '');
html = html.replace(/📝 /g, '');
html = html.replace(/✅ /g, '');
html = html.replace(/⚔️ /g, ''); // Wait, this might kill the tab. Let's restore the tab after.
html = html.replace(/🛡️ /g, ''); 
html = html.replace(/📋 /g, ''); 
html = html.replace(/📅 /g, ''); 
html = html.replace(/📦 /g, ''); 

// RESTORE TABS!
html = html.replace(/<button type="button" class="main-tab-btn active" data-page="page-roster"[^>]*>รายชื่อสมาชิก<\/button>/, '<button type="button" class="main-tab-btn active" data-page="page-roster" onclick="switchTab(\'page-roster\')">📋 รายชื่อสมาชิก</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-teams"[^>]*>สนามหลัก-สนามรอง<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-teams" onclick="switchTab(\'page-teams\')">🛡️ สนามหลัก-สนามรอง</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-dungeons"[^>]*>จองคิวดันเจี้ยน<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-dungeons" onclick="switchTab(\'page-dungeons\')">⚔️ จองคิวดันเจี้ยน</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-attendance"[^>]*>เช็คชื่อวอ<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-attendance" onclick="switchTab(\'page-attendance\')">📅 เช็คชื่อวอ</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-leave"[^>]*>แจ้งลาวอ<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-leave" onclick="switchTab(\'page-leave\')">📝 แจ้งลาวอ</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-settings"[^>]*>จัดการข้อมูล<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-settings" onclick="switchTab(\'page-settings\')" id="tabSettings">📦 จัดการข้อมูล</button>');

// app.js replacements
app = app.replace(/⚡ /g, '');
app = app.replace(/❌ /g, '');
app = app.replace(/📝 /g, '');
app = app.replace(/✅ /g, '');
app = app.replace(/⚔️ /g, '');
app = app.replace(/🗑️ /g, '');
app = app.replace(/➕ /g, '');
// Lock text in app.js
app = app.replace(/'🔓 ล็อก'/g, "'ปลดล็อก (Unlock)'");
app = app.replace(/' ล็อก'/g, "'ล็อก (Lock)'");
app = app.replace(/>\[ปลดล็อก\]</g, '>[ปลดล็อก (Unlock)]<');
app = app.replace(/>\[ล็อก\]</g, '>[ล็อก (Lock)]<');


// auth_dungeon.js replacements
auth = auth.replace(/⚡ /g, '');
auth = auth.replace(/❌ /g, '');
auth = auth.replace(/📝 /g, '');
auth = auth.replace(/✅ /g, '');
auth = auth.replace(/⚔️ /g, '');
auth = auth.replace(/🗑️ /g, '');
auth = auth.replace(/➕ /g, '');

// Also they mentioned: "แก้ ui หน้า จัดคิวลงดัน มันบัคเห็น ui เก่า และใหม่ผสมกัน" (Fix UI bug in Dungeon queue, mixing old and new UI)
// This might be due to `renderDungeonPage` failing to clear a container or appending incorrectly.
// Let's check `auth_dungeon.js` for innerHTML assignments.
if (auth.includes('const qList = document.getElementById(\'dqList\');')) {
  // Wait, if there's old HTML, maybe there's two "page-dungeons" sections in index.html?
  // Let's check index.html for page-dungeons duplicates first.
}

fs.writeFileSync('index.html', html, 'utf8');
fs.writeFileSync('app.js', app, 'utf8');
fs.writeFileSync('auth_dungeon.js', auth, 'utf8');

console.log('Removed emojis and updated lock text.');
