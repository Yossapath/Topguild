const fs = require('fs');
let txt = fs.readFileSync('module_log.js', 'utf8');

txt = txt.replace(
  "body.innerHTML = '<div style=\"text-align:center;padding:60px;color:var(--text-lo);\">กำลังโหลดข้อมูล...</div>';",
  "body.innerHTML = '<div id=\"logDebugText\" style=\"text-align:center;padding:60px;color:var(--text-lo);\">กำลังเริ่มดึงข้อมูล (Step 1)...</div>';"
);

txt = txt.replace(
  "const snap = await getDocs(q);",
  "document.getElementById('logDebugText').innerText = 'กำลังส่งคำขอไปที่ Firebase (Step 2)...';\n          const snap = await getDocs(q);\n          document.getElementById('logDebugText').innerText = 'ได้รับข้อมูลจาก Firebase แล้ว (Step 3)...';"
);

fs.writeFileSync('module_log.js', txt, 'utf8');
console.log('Added debug steps to renderLogPage');
