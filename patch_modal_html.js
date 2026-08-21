const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const modalHtml = `
  <!-- BULK ADD MODAL -->
  <div id="bulkAddModal" style="display:none; position:fixed; inset:0; z-index:99998; align-items:center; justify-content:center;">
    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.55);" onclick="closeBulkAddModal()"></div>
    <div style="position:relative; background:var(--surface); border-radius:16px; padding:28px; width:90%; max-width:560px; box-shadow:0 8px 40px rgba(0,0,0,0.3); z-index:1;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; color:var(--text-hi); font-size:18px;">📝 เพิ่มรายชื่อกลุ่ม (Excel)</h3>
        <button onclick="closeBulkAddModal()" style="background:none; border:none; font-size:22px; cursor:pointer; color:var(--text-lo);">✕</button>
      </div>
      <p style="color:var(--text-lo); font-size:13px; margin-bottom:12px;">
        วางข้อมูลจาก Excel ที่มีคอลัมน์ <b>ชื่อ | อาชีพ | ค่าพลัง</b> (คั่นด้วย Tab หรือ ช่องว่าง)<br>
        ถ้าชื่อซ้ำ ระบบจะ <b>อัปเดต</b> อาชีพและค่าพลังให้อัตโนมัติ
      </p>
      <textarea id="bulkAddText" class="form-control" rows="12"
        style="width:100%; box-sizing:border-box; font-family:monospace; font-size:13px; resize:vertical;"
        placeholder="XxerrosS&#9;Paladin&#9;43684&#10;YuGi&#9;Assassin Cross&#9;43663&#10;DMTz&#9;High Wizard&#9;41193"></textarea>
      <div style="display:flex; gap:10px; margin-top:16px; justify-content:flex-end;">
        <button class="btn-secondary" onclick="closeBulkAddModal()">ยกเลิก</button>
        <button class="btn-primary" onclick="processBulkAdd()">✅ บันทึก</button>
      </div>
    </div>
  </div>`;

// Add CSS for the modal .show state
const modalCss = `
  <style>
    #bulkAddModal.show { display: flex !important; }
  </style>`;

// Insert before </body>
html = html.replace('</body>', modalCss + '\n' + modalHtml + '\n</body>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Bulk add modal added to HTML');
