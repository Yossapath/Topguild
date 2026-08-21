// --- LEAVE SYSTEM ---
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

window.submitLeave = function() {
  const nameEl = document.getElementById('leaveName');
  const jobEl = document.getElementById('leaveJob');
  const dayEl = document.getElementById('leaveDay');
  const dateEl = document.getElementById('leaveDate');
  
  if (!nameEl.value || !jobEl.value || !dayEl.value || !dateEl.value) {
    window.showToast("กรุณากรอกข้อมูลให้ครบทุกช่อง", "error");
    return;
  }
  
  const leaveObj = {
    id: Date.now().toString(),
    name: nameEl.value.trim(),
    job: jobEl.value,
    dayStr: dayEl.value,
    dateStr: dateEl.value // YYYY-MM-DD
  };
  
  leaveData.list.push(leaveObj);
  saveLeaveState();
  
  nameEl.value = '';
  jobEl.value = '';
  dayEl.value = '';
  dateEl.value = '';
  window.showToast("บันทึกการแจ้งลาเรียบร้อย", "success");
};

window.deleteLeave = function(id) {
  if (confirm("ต้องการลบรายการแจ้งลานี้ใช่หรือไม่?")) {
    leaveData.list = leaveData.list.filter(L => L.id !== id);
    saveLeaveState();
  }
};

function renderLeaveList() {
  const tbody = document.getElementById('leaveListTbody');
  if (!tbody) return;
  
  let html = '';
  const isAdmin = window.currentUser && window.currentUser.role === 'admin';
  const myName = window.currentUser ? window.currentUser.username : '';
  
  const sortedList = [...leaveData.list].sort((a,b) => a.dateStr.localeCompare(b.dateStr));
  
  sortedList.forEach(L => {
    const isMine = myName && L.name.toLowerCase() === myName.toLowerCase();
    const canDelete = isAdmin || isMine;
    
    let dayTh = '';
    if (L.dayStr === 'Tuesday') dayTh = 'อังคาร';
    else if (L.dayStr === 'Thursday') dayTh = 'พฤหัสบดี';
    else if (L.dayStr === 'Sunday') dayTh = 'อาทิตย์';
    
    html += `
      <tr style="border-bottom: 1px solid var(--line);">
        <td style="padding: 10px;">${L.dateStr}</td>
        <td style="padding: 10px;">${dayTh}</td>
        <td style="padding: 10px; font-weight:600; color:var(--text-hi);">${window.escapeHtml ? window.escapeHtml(L.name) : L.name}</td>
        <td style="padding: 10px; color:var(--text-lo);">${L.job}</td>
        <td style="padding: 10px;">
          ${canDelete ? `<button class="btn-danger" style="padding:4px 8px; font-size:11px;" onclick="deleteLeave('${L.id}')">ลบ</button>` : '-'}
        </td>
      </tr>
    `;
  });
  
  if (html === '') {
    html = `<tr><td colspan="5" style="text-align:center; padding: 20px; color:var(--text-lo);">ยังไม่มีรายการแจ้งลา</td></tr>`;
  }
  
  tbody.innerHTML = html;
}

// --- AUTO ATTENDANCE GENERATOR ---
function getDatesOfCurrentWeek() {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday...
  // Get Monday of this week
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  
  const formatIso = (d) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth()+1).padStart(2,'0');
    const da = String(d.getDate()).padStart(2,'0');
    return `${yr}-${mo}-${da}`;
  };
  
  // Calculate target days
  const tue = new Date(monday); tue.setDate(monday.getDate() + 1); // Tuesday
  const thu = new Date(monday); thu.setDate(monday.getDate() + 3); // Thursday
  const sun = new Date(monday); sun.setDate(monday.getDate() + 6); // Sunday
  
  return {
    tuesday: formatIso(tue),
    thursday: formatIso(thu),
    sunday: formatIso(sun)
  };
}

window.autoGenerateAttendance = function() {
  if (!confirm("ระบบจะสร้างตารางเช็คชื่อของ อังคาร(รอบ 1,2), พฤหัส(รอบ1), อาทิตย์(รอบ1) ของสัปดาห์นี้\nและจะอัปเดตคนลาให้อัตโนมัติ ต้องการดำเนินการหรือไม่?")) {
    return;
  }
  
  const weekDates = getDatesOfCurrentWeek();
  const datesToCreate = [
    { date: weekDates.tuesday + " (อังคาร รอบ 1)", baseDate: weekDates.tuesday, dayStr: 'Tuesday' },
    { date: weekDates.tuesday + " (อังคาร รอบ 2)", baseDate: weekDates.tuesday, dayStr: 'Tuesday' },
    { date: weekDates.thursday + " (พฤหัส รอบ 1)", baseDate: weekDates.thursday, dayStr: 'Thursday' },
    { date: weekDates.sunday + " (อาทิตย์ รอบ 1)", baseDate: weekDates.sunday, dayStr: 'Sunday' }
  ];
  
  let changed = false;
  
  datesToCreate.forEach(target => {
    // 1. Create table if not exists
    if (!attendanceData.dates[target.date]) {
      attendanceData.dates[target.date] = {};
      changed = true;
    }
    
    // 2. Auto-apply leaves for this date
    // Find all leaves that match this target's baseDate
    const matchingLeaves = leaveData.list.filter(L => L.dateStr === target.baseDate);
    matchingLeaves.forEach(L => {
      // Find exact member key (lowercase)
      if (window.guildRoster) {
        let foundKey = null;
        Object.keys(window.guildRoster).forEach(job => {
          (window.guildRoster[job] || []).forEach(m => {
            if (m.name.toLowerCase() === L.name.toLowerCase()) {
              foundKey = m.name; // Keep original casing
            }
          });
        });
        
        if (foundKey) {
          // If they haven't explicitly attended, mark as leave
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
