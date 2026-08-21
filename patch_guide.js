const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const startIndex = html.indexOf('<div class="modal-backdrop" id="guideModal">');
const endIndexStr = '<!-- Sidebar: Admin Users -->';
const endIndex = html.indexOf(endIndexStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newGuideHtml = `<div class="modal-backdrop" id="guideModal">
  <div class="modal-box" style="max-width: 650px; width: 95%;">
    <div class="modal-header">
      <h3>💡 คู่มือการใช้งานระบบจัดการกิลด์ (Row Topguild)</h3>
      <button class="modal-close" onclick="closeGuideModal()">✕</button>
    </div>
    <div class="modal-body" style="max-height: 70vh; overflow-y: auto; padding-right: 8px;">
      
      <div style="background: var(--bg-soft); border-left: 4px solid var(--blue-700); padding: 12px 16px; border-radius: 8px; margin-bottom: 14px;">
        <h4 style="margin: 0 0 6px 0; font-family: var(--font-display); color: var(--blue-900); font-size: 14px;">🔐 1. ระบบสมาชิกและสิทธิ์การใช้งาน</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.6; color: var(--text-hi);">
          <li><b>ระดับสิทธิ์:</b> มี 2 ระดับคือ <span style="color:var(--danger); font-weight:bold;">Admin (ผู้ดูแล)</span> จัดการได้ทุกอย่าง และ <span style="color:var(--ok); font-weight:bold;">Member (สมาชิกทั่วไป)</span> ซึ่งจะทำได้แค่ดูข้อมูลและกดจองคิวดันเจี้ยน</li>
          <li><b>การจดจำล็อกอิน:</b> เมื่อล็อกอินสำเร็จ ระบบจะจดจำคุณไว้แม้จะรีเฟรชหรือปิดหน้าเว็บ หากต้องการเปลี่ยนไอดีให้กดปุ่ม <code>ออกจากระบบ</code> ด้านบนขวา</li>
        </ul>
      </div>

      <div style="background: var(--bg-soft); border-left: 4px solid #8b5cf6; padding: 12px 16px; border-radius: 8px; margin-bottom: 14px;">
        <h4 style="margin: 0 0 6px 0; font-family: var(--font-display); color: var(--blue-900); font-size: 14px;">📋 2. หน้ารายชื่อกิลด์ (Roster)</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.6; color: var(--text-hi);">
          <li><b>เพิ่มสมาชิก:</b> กด <code>➕ เพิ่มสมาชิกใหม่</code> ระบุชื่อ, อาชีพ, พลัง และเลือก "ความต้องการลงสนาม" (ทุกสนาม, เฉพาะสนามหลัก, เฉพาะสนามรอง)</li>
          <li><b>นำเข้าจาก Excel:</b> ก๊อปปี้ข้อมูลที่มีคอลัมน์ [ชื่อ] [อาชีพ] [ค่าพลัง] มาวางในปุ่ม <code>นำเข้าข้อมูล (Excel)</code> เพื่อเพิ่มทีละหลายคน</li>
          <li><b>แก้ไข/ลบ:</b> คลิกที่ชื่อตัวละครในตารางเพื่อเปลี่ยนข้อมูล หรือกดปุ่ม <code>✕ ลบรายชื่อ</code></li>
        </ul>
      </div>

      <div style="background: var(--bg-soft); border-left: 4px solid var(--ok); padding: 12px 16px; border-radius: 8px; margin-bottom: 14px;">
        <h4 style="margin: 0 0 6px 0; font-family: var(--font-display); color: var(--blue-900); font-size: 14px;">⚔️ 3. การจัดทีมกิลด์วอ (สนามหลักและสนามรอง)</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.6; color: var(--text-hi);">
          <li><b>⚡ จัดทีมอัตโนมัติ:</b> ระบบจะจัดทีมให้อัตโนมัติ (เฉพาะ Admin) โดยสนามหลักจะคัดคนพลังสูงสุด 60 คน (การันตีมี Priest อย่างน้อย 1 คนทุกทีม) ส่วนสนามรองจะดึง "รายชื่อที่เหลือทั้งหมด" มาจัดให้อัตโนมัติพร้อมขยายทีมให้ตามจำนวนคน</li>
          <li><b>จัดเองแบบ Manual:</b> สามารถกด Dropdown เลือกชื่อคนเข้าทีมได้เลย ระบบจะแสดงชื่อ อาชีพ และค่าพลังครบถ้วน</li>
          <li><b>การค้นหา:</b> พิมพ์ชื่อลงในช่องค้นหาด้านบน เพื่อหาว่าบุคคลนั้นอยู่ทีมไหน ระบบจะทำแถบสว่างไฮไลท์ให้</li>
        </ul>
      </div>

      <div style="background: var(--bg-soft); border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 14px;">
        <h4 style="margin: 0 0 6px 0; font-family: var(--font-display); color: var(--blue-900); font-size: 14px;">🏰 4. หน้าจัดทีมดันเจี้ยน (จองคิว)</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.6; color: var(--text-hi);">
          <li><b>จองคิวลงดัน:</b> สมาชิกเข้ามากด "จองคิว" ในดันเจี้ยนที่ต้องการ (เช่น มายา, บับเบิ้ล) คิวจะเรียงตามเวลาที่กดจอง 1, 2, 3...</li>
          <li><b>สร้างทีม (Admin):</b> Admin สามารถสร้างทีมดันเจี้ยน และใช้เมาส์ <b>คลิกค้างแล้วลาก (Drag & Drop)</b> รายชื่อจากคิวด้านซ้าย มาใส่ในช่องปาร์ตี้ด้านขวาได้ทันที หรือจะเลือกจาก Dropdown ก็ได้</li>
        </ul>
      </div>

      <div style="background: var(--bg-soft); border-left: 4px solid #ec4899; padding: 12px 16px; border-radius: 8px; margin-bottom: 14px;">
        <h4 style="margin: 0 0 6px 0; font-family: var(--font-display); color: var(--blue-900); font-size: 14px;">📅 5. ระบบเช็คชื่อกิลด์วอ (Attendance)</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.6; color: var(--text-hi);">
          <li><b>เช็คชื่อรายวัน:</b> Admin กดสร้างวันที่ แล้วติ๊กเลือกสถานะสมาชิกแต่ละคน (เข้าร่วม, ลา, ขาด) หากสร้างผิดสามารถกด "🗑️ ลบวันที่นี้" ออกได้</li>
          <li><b>สถิติรวม:</b> กดแท็บ "สถิติรวม" เพื่อดูประวัติการเช็คชื่อทั้งหมดของสมาชิกตั้งแต่เริ่มต้น ว่ามาเข้าร่วมกี่ครั้ง, ลากี่ครั้ง และขาดกี่ครั้ง พร้อมช่องค้นหาชื่อ</li>
        </ul>
      </div>

      <div style="background: var(--bg-soft); border-left: 4px solid #14b8a6; padding: 12px 16px; border-radius: 8px; margin-bottom: 6px;">
        <h4 style="margin: 0 0 6px 0; font-family: var(--font-display); color: var(--blue-900); font-size: 14px;">💾 6. ฐานข้อมูลและการ Backup</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.6; color: var(--text-hi);">
          <li><b>ระบบ Real-time:</b> ข้อมูลทุกอย่างเชื่อมกับ Cloud Database ทุกคนจะเห็นข้อมูลตรงกันตลอดเวลา</li>
          <li><b>สำรองและกู้คืน (Backup JSON):</b> ในหน้า "จัดการข้อมูล" Admin สามารถกดส่งออกข้อมูลเป็นไฟล์ JSON เพื่อสำรองเก็บไว้ในเครื่องตนเอง และสามารถกดนำเข้าไฟล์นี้เพื่อกู้ข้อมูลคืนได้ทุกเมื่อ</li>
        </ul>
      </div>

    </div>
    <div class="btn-group" style="justify-content: flex-end; margin-top: 16px;">
      <button class="btn-primary" onclick="closeGuideModal()">รับทราบและเข้าใจ 👍</button>
    </div>
  </div>
</div>

\n\n` + endIndexStr;

  html = html.substring(0, startIndex) + newGuideHtml + html.substring(endIndex + endIndexStr.length);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Guide modal replaced successfully');
} else {
  console.log('Could not find boundaries for guideModal');
}
