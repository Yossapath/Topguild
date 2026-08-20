const fs = require('fs');
let content = fs.readFileSync('auth_dungeon.js', 'utf8');

const replacements = {
  'เน„เธกเนˆเธžเธšเธฃเธฒเธขเธŠเธทเนˆเธญเนƒเธ™เธฃเธฐเธšเธšเธ เธดเธฅเธ”เนŒ': 'ไม่พบรายชื่อในระบบกิลด์',
  '๐ŸŸข เน€เธ‚เน‰เธฒเธฃเนˆเธงเธก': '🟢 เข้าร่วม',
  '๐ŸŸก เธฅเธฒ': '🟡 ลา',
  '๐Ÿ”ด เธ‚เธฒเธ”': '🔴 ขาด',
  '- เธขเธฑเธ‡เน„เธกเนˆเน€เธŠเน‡เธ„เธŠเธทเนˆเธญ -': '- ยังไม่เช็คชื่อ -',
  'เธ เธฃเธธเธ“เธฒเน€เธฅเธทเธญเธ เธซเธฃเธทเธญเธชเธฃเน‰เธฒเธ‡เธงเธฑเธ™เธ—เธตเนˆเน€เธŠเน‡เธ„เธŠเธทเนˆเธญ': 'กรุณาเลือกหรือสร้างวันที่เช็คชื่อ',
  'เธฃเธฐเธšเธธเธงเธฑเธ™เธ—เธตเนˆเธชเธณเธซเธฃเธฑเธšเธ เธฒเธฃเน€เธŠเน‡เธ„เธŠเธทเนˆเธญ': 'ระบุวันที่สำหรับการเช็คชื่อ',
  'เธงเธฑเธ™เธ—เธตเนˆเธ™เธตเน‰เธ–เธนเธ เธชเธฃเน‰เธฒเธ‡เน„เธงเน‰เน เธฅเน‰เธง': 'วันที่นี้ถูกสร้างไว้แล้ว',
  'เธชเธฃเน‰เธฒเธ‡เธงเธฑเธ™เธ—เธตเนˆ': 'สร้างวันที่',
  'เน€เธฃเธตเธขเธšเธฃเน‰เธญเธขเน เธฅเน‰เธง': 'เรียบร้อยแล้ว',
  'เน„เธกเนˆเธกเธตเธ‚เน‰เธญเธกเธนเธฅ': 'ไม่มีข้อมูล',
  'เธ เธฃเธธเธ“เธฒเน€เธฅเธทเธญเธ เธงเธฑเธ™เธ—เธตเนˆ': 'กรุณาเลือกวันที่',
  'เธ„เธธเธ“เธ•เน‰เธญเธ‡เธ เธฒเธฃเธฅเธšเธ—เธตเธกเธ™เธตเน‰เนƒเธŠเนˆเธซเธฃเธทเธญเน„เธกเนˆ?': 'คุณต้องการลบทีมนี้ใช่หรือไม่?'
};

for (const [bad, good] of Object.entries(replacements)) {
  content = content.split(bad).join(good);
}

content = content.replace('dungeonName,', 'type: dungeonName, dungeonName,');

// Modify handleLogin for loading state
content = content.replace(
  'window.handleLogin = async function() {',
  \window.handleLogin = async function() {
  const loginBtn = document.querySelector('#loginForm button[type="submit"]');
  if (loginBtn) { loginBtn.disabled = true; loginBtn.innerText = 'กำลังเข้าสู่ระบบ...'; }\
);
content = content.replace(
  'window.showToast("กรุณากรอก Username และ Password", "warning");',
  \window.showToast("กรุณากรอก Username และ Password", "warning"); if(loginBtn){loginBtn.disabled=false;loginBtn.innerText='เข้าสู่ระบบ';}\
);
content = content.replace(
  'window.showToast("ไม่พบผู้ใช้งานนี้ในระบบ", "error");',
  \window.showToast("ไม่พบผู้ใช้งานนี้ในระบบ", "error"); if(loginBtn){loginBtn.disabled=false;loginBtn.innerText='เข้าสู่ระบบ';}\
);
content = content.replace(
  'window.showToast("รหัสผ่านไม่ถูกต้อง", "error");',
  \window.showToast("รหัสผ่านไม่ถูกต้อง", "error"); if(loginBtn){loginBtn.disabled=false;loginBtn.innerText='เข้าสู่ระบบ';}\
);
content = content.replace(
  'window.showToast("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", "error");',
  \window.showToast("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", "error"); if(loginBtn){loginBtn.disabled=false;loginBtn.innerText='เข้าสู่ระบบ';}\
);
content = content.replace(
  'window.showToast(\ยินดีต้อนรับ \\, "success");',
  \window.showToast(\ยินดีต้อนรับ \\, "success"); if(loginBtn){loginBtn.disabled=false;loginBtn.innerText='เข้าสู่ระบบ';}\
);

fs.writeFileSync('auth_dungeon.js', content, 'utf8');
