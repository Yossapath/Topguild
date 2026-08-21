const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let app = fs.readFileSync('app.js', 'utf8');
let auth = fs.readFileSync('auth_dungeon.js', 'utf8');

// Global emoji remover (but carefully keeping the ones we want)
// The user wants:
// - No ⚡ in main/sub teams power sum (done in prev patch mostly, but let's re-verify)
// - No emojis in Attendance and Stats: "ขาด" (❌), "ลา" (📝), "เข้าร่วม" (✅), "จัดทีมออโต้" (⚡)
// - No "🗡️" (sword) in Dungeon UI
// - No "🔍" in search bars
// - No "⏳" in queue header

// Strip all these out
const emojisToRemove = ['⚡', '❌', '📝', '✅', '🗑️', '➕', '🗡️', '🔍', '⏳'];

emojisToRemove.forEach(emoji => {
    // regex to replace emoji followed by space, or just the emoji
    const regex1 = new RegExp(emoji + ' ', 'g');
    const regex2 = new RegExp(emoji, 'g');
    
    html = html.replace(regex1, '');
    html = html.replace(regex2, '');
    
    app = app.replace(regex1, '');
    app = app.replace(regex2, '');
    
    auth = auth.replace(regex1, '');
    auth = auth.replace(regex2, '');
});

// RESTORE TABS IN INDEX.HTML
html = html.replace(/<button type="button" class="main-tab-btn active" data-page="page-roster"[^>]*>รายชื่อสมาชิก<\/button>/, '<button type="button" class="main-tab-btn active" data-page="page-roster" onclick="switchTab(\'page-roster\')">📋 รายชื่อสมาชิก</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-teams"[^>]*>สนามหลัก-สนามรอง<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-teams" onclick="switchTab(\'page-teams\')">🛡️ สนามหลัก-สนามรอง</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-dungeons"[^>]*>จองคิวดันเจี้ยน<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-dungeons" onclick="switchTab(\'page-dungeons\')">⚔️ จองคิวดันเจี้ยน</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-attendance"[^>]*>เช็คชื่อวอ<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-attendance" onclick="switchTab(\'page-attendance\')">📅 เช็คชื่อวอ</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-leave"[^>]*>แจ้งลาวอ<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-leave" onclick="switchTab(\'page-leave\')">📝 แจ้งลาวอ</button>');
html = html.replace(/<button type="button" class="main-tab-btn" data-page="page-settings"[^>]*>จัดการข้อมูล<\/button>/, '<button type="button" class="main-tab-btn" data-page="page-settings" onclick="switchTab(\'page-settings\')" id="tabSettings">📦 จัดการข้อมูล</button>');

// Fix "จัดตำแหน้งหน้า login ให้อยู่ตรงกลาง" (Center the login layout)
// In index.html, #authWrap: display: flex; align-items: center; justify-content: center; is already there.
// But maybe the inner container needs margin: 0 auto; or the width max needs adjusting.
html = html.replace(
  /<div style="display: flex; flex-direction: row; width: 100%; max-width: 900px; padding: 20px; gap: 60px; align-items: center; justify-content: space-between; flex-wrap: wrap;">/,
  '<div style="display: flex; flex-direction: row; width: 100%; max-width: 900px; padding: 20px; gap: 60px; align-items: center; justify-content: center; flex-wrap: wrap; margin: 0 auto;">'
);
// Also ensure left branding is not forcing too much flex if they want it perfectly centered
html = html.replace(
  /<div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: center;">/,
  '<div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: center; text-align: left;">'
);

// Lock button text in app.js
// If we previously changed it to 'ล็อก (Lock)' and 'ปลดล็อก (Unlock)', let's ensure it's exact.
app = app.replace(/>\[ล็อก\]</g, '>[ล็อก (Lock)]<');
app = app.replace(/>\[ปลดล็อก\]</g, '>[ปลดล็อก (Unlock)]<');
// Re-replace just in case the previous script failed or had wrong quotes
app = app.replace(/'🔓 ล็อก'/g, "'ปลดล็อก (Unlock)'");
app = app.replace(/' ล็อก'/g, "'ล็อก (Lock)'");

fs.writeFileSync('index.html', html, 'utf8');
fs.writeFileSync('app.js', app, 'utf8');
fs.writeFileSync('auth_dungeon.js', auth, 'utf8');

console.log('Thorough emoji cleanup complete. Centered login layout.');
