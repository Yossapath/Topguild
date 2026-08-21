const fs = require('fs');
const js = fs.readFileSync('auth_dungeon.js', 'utf8');

const splitTokenStart = '// --- LEAVE SYSTEM ---';
const splitTokenEnd = '\nwindow.activeAutocompleteInput = null;';

const partsStart = js.split(splitTokenStart);
const prefix = partsStart[0];
const partsEnd = partsStart[1].split(splitTokenEnd);
const suffix = partsEnd.slice(1).join(splitTokenEnd);

const newLeaveLogic = `// --- LEAVE SYSTEM ---
let leaveData = { list: [] };
let unsubLeaveListener = null;

async function setupLeaveFirebase() {
  if (!window.db) return;
  try {
    const leaveRef = doc(window.db, 'guild_system', 'leaves');
    const snap = await getDoc(leaveRef);
    if (!snap.exists()) {
      await setDoc(leaveRef, { list: [] });
    }

    unsubLeaveListener = onSnapshot(leaveRef, (snapshot) => {
      if (snapshot.exists()) {
        leaveData = snapshot.data();
        if (!leaveData.list) leaveData.list = [];
        renderLeaveList();
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function saveLeaveState() {
  if (!window.db) return;
  const leaveRef = doc(window.db, 'guild_system', 'leaves');
  await setDoc(leaveRef, leaveData);
}

// Ensure the form gets populated with the current user's name/job
setInterval(() => {
  const nameEl = document.getElementById('leaveName');
  const jobEl = document.getElementById('leaveJob');
  if (nameEl && window.currentUser && window.currentUser.username) {
    nameEl.value = window.currentUser.username;
    
    // Attempt to auto-fill job if not filled yet
    if (!jobEl.value && window.guildRoster) {
      Object.keys(window.guildRoster).forEach(job => {
        const found = window.guildRoster[job].find(m => m.name.toLowerCase() === window.currentUser.username.toLowerCase());
        if (found) {
           jobEl.value = job;
        }
      });
    }
  }
}, 1000);

window.submitLeave = function() {
  const nameEl = document.getElementById('leaveName');
  const jobEl = document.getElementById('leaveJob');
  const dayEl = document.getElementById('leaveDay');
  const dateEl = document.getElementById('leaveDate');
  
  if (!nameEl.value || !dayEl.value || !dateEl.value) {
    window.showToast("กรุณากรอกข้อมูลให้ครบทุกช่อง (รอระบบโหลดชื่อสักครู่)", "error");
    return;
  }
  
  const leaveObj = {
    id: Date.now().toString(),
    name: nameEl.value.trim(),
    job: jobEl.value || '-',
    dayStr: dayEl.value,
    dateStr: dateEl.value // YYYY-MM-DD
  };
  
  leaveData.list.push(leaveObj);
  saveLeaveState();
  
  dayEl.value = '';
  dateEl.value = '';
  window.showToast("บันทึกการแจ้งลาเรียบร้อย", "success");
};

window.deleteLeave = function(id) {
  if (confirm("ต้องการยกเลิกการแจ้งลานี้ใช่หรือไม่?")) {
    leaveData.list = leaveData.list.filter(L => L.id !== id);
    saveLeaveState();
  }
};

function renderLeaveList() {
  const tbody = document.getElementById('leaveListTbody');
  if (!tbody) return;
  
  let html = '';
  const isAdmin = window.currentUser && (window.currentUser.role || '').toLowerCase() === 'admin';
  const myName = window.currentUser ? window.currentUser.username : '';
  
  const sortedList = [...leaveData.list].sort((a,b) => a.dateStr.localeCompare(b.dateStr));
  
  sortedList.forEach(L => {
    const isMine = myName && L.name.toLowerCase() === myName.toLowerCase();
    const canDelete = isAdmin || isMine;
    
    let dayTh = '';
    if (L.dayStr === 'Tuesday_1') dayTh = 'อังคาร รอบ 1 (21:30-21:55)';
    else if (L.dayStr === 'Tuesday_2') dayTh = 'อังคาร รอบ 2 (22:00-22:25)';
    else if (L.dayStr === 'Thursday_1') dayTh = 'พฤหัสบดี (22:00-22:25)';
    else if (L.dayStr === 'Sunday_1') dayTh = 'อาทิตย์ (21:00-22:00)';
    else dayTh = L.dayStr;
    
    html += \`
      <tr style="border-bottom: 1px solid var(--line);">
        <td style="padding: 10px;">\${L.dateStr}</td>
        <td style="padding: 10px;">\${dayTh}</td>
        <td style="padding: 10px; font-weight:600; color:var(--text-hi);">\${window.escapeHtml ? window.escapeHtml(L.name) : L.name}</td>
        <td style="padding: 10px; color:var(--text-lo);">\${L.job}</td>
        <td style="padding: 10px; text-align:center;">
          \${canDelete ? \`<button class="btn-danger" style="padding:4px 8px; font-size:11px;" onclick="deleteLeave('\${L.id}')">\${isMine ? 'ยกเลิกการลา' : 'ลบ'}</button>\` : '-'}
        </td>
      </tr>
    \`;
  });
  
  if (html === '') {
    html = \`<tr><td colspan="5" style="text-align:center; padding: 20px; color:var(--text-lo);">ยังไม่มีรายการแจ้งลา</td></tr>\`;
  }
  
  tbody.innerHTML = html;
}

// --- AUTO ATTENDANCE GENERATOR ---
function getDatesOfCurrentWeek() {
  const now = new Date();
  const currentDay = now.getDay(); 
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  
  const formatIso = (d) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth()+1).padStart(2,'0');
    const da = String(d.getDate()).padStart(2,'0');
    return \`\${yr}-\${mo}-\${da}\`;
  };
  
  const tue = new Date(monday); tue.setDate(monday.getDate() + 1); 
  const thu = new Date(monday); thu.setDate(monday.getDate() + 3); 
  const sun = new Date(monday); sun.setDate(monday.getDate() + 6); 
  
  return {
    tuesday: formatIso(tue),
    thursday: formatIso(thu),
    sunday: formatIso(sun)
  };
}

window.autoGenerateAttendance = function() {
  if (!confirm("ระบบจะสร้างตารางเช็คชื่อของ อังคาร(รอบ 1,2), พฤหัส(รอบ1), อาทิตย์(รอบ1) ของสัปดาห์นี้\\nและจะอัปเดตคนลาให้อัตโนมัติ ต้องการดำเนินการหรือไม่?")) {
    return;
  }
  
  const weekDates = getDatesOfCurrentWeek();
  const datesToCreate = [
    { date: weekDates.tuesday + " (อังคาร รอบ 1)", baseDate: weekDates.tuesday, leaveMatch: 'Tuesday_1' },
    { date: weekDates.tuesday + " (อังคาร รอบ 2)", baseDate: weekDates.tuesday, leaveMatch: 'Tuesday_2' },
    { date: weekDates.thursday + " (พฤหัส รอบ 1)", baseDate: weekDates.thursday, leaveMatch: 'Thursday_1' },
    { date: weekDates.sunday + " (อาทิตย์ รอบ 1)", baseDate: weekDates.sunday, leaveMatch: 'Sunday_1' }
  ];
  
  let changed = false;
  
  datesToCreate.forEach(target => {
    // 1. Create table if not exists
    if (!attendanceData.dates[target.date]) {
      attendanceData.dates[target.date] = {};
      changed = true;
    }
    
    // 2. Auto-apply leaves for this exact date & round
    const matchingLeaves = leaveData.list.filter(L => L.dateStr === target.baseDate && L.dayStr === target.leaveMatch);
    matchingLeaves.forEach(L => {
      if (window.guildRoster) {
        let foundKey = null;
        Object.keys(window.guildRoster).forEach(job => {
          (window.guildRoster[job] || []).forEach(m => {
            if (m.name.toLowerCase() === L.name.toLowerCase()) {
              foundKey = m.name;
            }
          });
        });
        
        if (foundKey) {
          if (attendanceData.dates[target.date][foundKey] !== 'attended') {
             attendanceData.dates[target.date][foundKey] = 'leave';
             changed = true;
          }
        }
      }
    });
  });
  
  if (changed) {
    if (typeof saveAttendanceState === 'function') saveAttendanceState();
    if (typeof renderAttendanceOptions === 'function') renderAttendanceOptions();
    window.showToast("ออโต้สร้างตารางสำเร็จ และอัปเดตใบลาเรียบร้อย!", "success");
  } else {
    window.showToast("ตารางและข้อมูลลาเป็นเวอร์ชันล่าสุดแล้ว", "info");
  }
};

window.setupLeaveFirebase = setupLeaveFirebase;
`;

const finalJs = prefix + newLeaveLogic + '\nwindow.activeAutocompleteInput = null;' + suffix;
fs.writeFileSync('auth_dungeon.js', finalJs, 'utf8');
console.log('Patched leave logic');
