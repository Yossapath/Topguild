const fs = require('fs');
let js = fs.readFileSync('auth_dungeon.js', 'utf8');

const targetStr = `    // Auto-add to Roster
    if (window.guildRoster && window.saveState) {
        let found = false;
        Object.keys(window.guildRoster).forEach(jobKey => {
            const existing = (window.guildRoster[jobKey] || []).find(m => m.name.toLowerCase() === u.toLowerCase());
            if (existing) {
                found = true;
            }
        });
        
        if (!found) {
            if (!window.guildRoster[j]) window.guildRoster[j] = [];
            window.guildRoster[j].push({ name: u, power: 0, fieldPref: 'any' });
            window.saveState();
            if (typeof window.renderAll === 'function') window.renderAll();
        }
    }`;

js = js.replace(targetStr, `    // ระบบจะไม่ทำการ Auto-add ผู้ใช้เข้า Roster อีกต่อไป 
    // ต้องให้แอดมินหรือผู้มีสิทธิ์ไปกดเพิ่มชื่อในแท็บ "รายชื่อสมาชิก" ด้วยตัวเองเท่านั้น
    // เพื่อป้องกันการมีชื่อขยะโผล่ไปล่างสุดของหน้าเช็คชื่อวอ`);

fs.writeFileSync('auth_dungeon.js', js, 'utf8');
console.log('Removed Auto-add to roster on register');
