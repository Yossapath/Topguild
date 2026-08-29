const fs = require('fs');
let lines = fs.readFileSync('module_dungeon.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  // Remove emoji from delete button in adminCtrl
  if (lines[i].includes('🗑 ลบ') && lines[i].includes('deleteDungeonQueue') && lines[i].includes('adminCtrl')) {
    lines[i] = lines[i].replace('🗑 ลบ', 'ลบ').replace('font-size:13px;padding:8px 16px;', 'font-size:12px;padding:5px 12px;');
  }
  // Remove emoji from member cancel button
  if (lines[i].includes('🗑 ยกเลิกการจอง')) {
    lines[i] = lines[i].replace('🗑 ยกเลิกการจอง', 'ยกเลิกการจอง').replace('font-size:13px;padding:8px 16px;', 'font-size:12px;padding:5px 12px;');
  }
}

fs.writeFileSync('module_dungeon.js', lines.join('\n'));
console.log('Removed emoji from buttons');
