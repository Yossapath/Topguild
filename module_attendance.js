import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// ==========================================
// MODULE: ATTENDANCE SYSTEM
// ==========================================
(async function initAttendanceModule() {
  try {
    // ====== ATTENDANCE SYSTEM ======
// ==========================================

window.attendanceData = window.attendanceData || { dates: {} };
let unsubAttendanceListener = null;

async function setupAttendanceFirebase() {
  // STEP 1: Render from localStorage instantly (avoids blank screen on refresh)
  try {
    const localAtt = localStorage.getItem('guild_attendance_data');
    if (localAtt) {
      const parsed = JSON.parse(localAtt);
      if (parsed && parsed.dates && Object.keys(parsed.dates).length > 0) {
        attendanceData = parsed;
        setTimeout(renderAttendanceOptions, 50);
      }
    }
  } catch(e) {}

  // STEP 2: Firebase real-time listener (authoritative source)
  if (!window.db) return;
  try {
    const attRef = doc(window.db, 'guild_system', 'attendance');
    const snap = await getDoc(attRef);
    if (!snap.exists()) {
      await setDoc(attRef, { dates: {} });
    }
    unsubAttendanceListener = onSnapshot(attRef, (snapshot) => {
      if (snapshot.exists()) {
        attendanceData = snapshot.data();
        if (!window.attendanceData.dates) window.attendanceData.dates = {};
        // Keep localStorage in sync
        try { localStorage.setItem('guild_attendance_data', JSON.stringify(window.attendanceData)); } catch(e2) {}
        renderAttendanceOptions();
      }
    });
  } catch(e) {
    console.error('setupAttendanceFirebase error:', e);
  }
}
// CRITICAL: Export so app.js can call window.setupAttendanceFirebase()
window.setupAttendanceFirebase = setupAttendanceFirebase;

window.saveAttendanceState = saveAttendanceState;
async function saveAttendanceState() {
  localStorage.setItem('guild_attendance_data', JSON.stringify(window.attendanceData));
  if (!window.db) return;
  try {
    const attRef = doc(window.db, 'guild_system', 'attendance');
    await setDoc(attRef, attendanceData, { merge: true });
    console.log('Saved attendance data to Firebase successfully');
  } catch(err) {
    console.error('Failed to save attendance data:', err);
    window.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล (เช็คสิทธิ์ Database)', 'error');
  }
}


window.bulkImportAttendance = function() {
    if (!window.currentUser || !window.isUserAdmin()) return window.showToast('ไม่มีสิทธิ์', 'error');
    const select = document.getElementById('attendanceDateSelect');
    if (!select || !select.value) return window.showToast('กรุณาเลือกวันที่ก่อน', 'warning');
    
    document.getElementById('bulkImportAttendanceText').value = '';
    const modal = document.getElementById('bulkImportAttendanceModal');
    if (modal) modal.style.display = 'flex';
};

window.closeBulkImportAttendanceModal = function() {
    const modal = document.getElementById('bulkImportAttendanceModal');
    if (modal) modal.style.display = 'none';
};

window.processBulkImportAttendance = function() {
    const select = document.getElementById('attendanceDateSelect');
    if (!select || !select.value) return;
    const dateStr = select.value;
    
    const text = document.getElementById('bulkImportAttendanceText').value;
    if (!text) {
        window.closeBulkImportAttendanceModal();
        return;
    }
    
    const names = text.split('\n').map(n => n.trim()).filter(n => n);
    if (!window.attendanceData.dates[dateStr]) window.attendanceData.dates[dateStr] = {};
    
    let matchCount = 0;
      let notFoundNames = [];
      names.forEach(rawName => {
          let found = false;
        if (window.guildRoster) {
            Object.keys(window.guildRoster).forEach(job => {
                window.guildRoster[job].forEach(m => {
                    if (m.name?.toLowerCase() === rawName?.toLowerCase()) {
                        window.attendanceData.dates[dateStr][m.name] = 'attended';
                        found = true;
                        matchCount++;
                    }
                });
            });
        }
        if (!found) {
              notFoundNames.push(rawName);
              window.attendanceData.dates[dateStr][rawName] = 'attended';
              matchCount++;
          }
    });
    
    saveAttendanceState();
    window.renderAttendanceTable();
    window.closeBulkImportAttendanceModal();
      const resultModal = document.getElementById('importResultModal');
      const resultText = document.getElementById('importResultText');
      const missingDiv = document.getElementById('importResultMissing');
      const missingList = document.getElementById('importResultMissingList');
      
      if (resultModal && resultText && missingDiv && missingList) {
          resultText.innerHTML = 'อัปเดตสถานะเป็น <b>"เข้าร่วม"</b> ทั้งหมด ' + matchCount + ' คนเรียบร้อยแล้ว';
          if (notFoundNames.length > 0) {
              missingDiv.style.display = 'block';
              missingList.value = notFoundNames.join('\n');
          } else {
              missingDiv.style.display = 'none';
          }
          resultModal.style.display = 'flex';
      } else {
          window.showToast('อัปเดตรายชื่อ ' + matchCount + ' คน เป็น "เข้าร่วม" แล้ว', 'success');
      }
};

window.autoGenerateAttendance = async function() {
    if (!window.currentUser || !window.isUserAdmin()) return;
    if (!await window.UI.confirm('ต้องการสร้างตารางเช็คชื่อสำหรับ อังคาร พฤหัส อาทิตย์ ของสัปดาห์นี้อัตโนมัติหรือไม่?')) return;
  
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  
  // Calculate Monday of this week
  const monday = new Date(today);
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  monday.setDate(today.getDate() + diffToMonday);
  
  const getFmtDate = (d) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const datesToCreate = [];

  // Tuesday
  const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);
    datesToCreate.push(getFmtDate(tuesday) + " (อังคาร)");

  // Thursday
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  datesToCreate.push(getFmtDate(thursday) + " (พฤหัสบดี)");

  // Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  datesToCreate.push(getFmtDate(sunday) + " (อาทิตย์)");

  let createdCount = 0;
  datesToCreate.forEach(d => {
    if (!window.attendanceData.dates[d]) {
      window.attendanceData.dates[d] = {};
      createdCount++;
    }
  });

  if (createdCount > 0) {
    saveAttendanceState();
    window.showToast('สร้างตารางอัตโนมัติสำเร็จ!', 'success');
    setTimeout(renderAttendanceOptions, 500);
  } else {
    window.showToast('ตารางสัปดาห์นี้ถูกสร้างไว้แล้ว', 'warning');
  }
};

window.createAttendanceDate = async function() {
    if (!window.currentUser || !window.isUserAdmin()) return;
    const today = new Date().toISOString().split('T')[0];
    const dateStr = await window.UI.prompt("ระบุวันที่สำหรับการเช็คชื่อ (YYYY-MM-DD):", today);
  if (!dateStr) return;
  
  if (!window.attendanceData.dates[dateStr]) {
    window.attendanceData.dates[dateStr] = {};
    saveAttendanceState();
    window.showToast(`สร้างวันที่ ${dateStr} เรียบร้อยแล้ว`, "success");
    
    setTimeout(() => {
      const select = document.getElementById('attendanceDateSelect');
      if (select) {
        select.value = dateStr;
        window.renderAttendanceTable();
      }
    }, 500);
  } else {
    window.showToast("วันที่นี้ถูกสร้างไว้แล้ว", "warning");
  }
};

function renderAttendanceOptions() {
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  
  const currentVal = select.value;
  const dates = Object.keys(window.attendanceData.dates).sort((a, b) => b.localeCompare(a));
  
  const newHtml = dates.length === 0 
    ? '<option value="">-- ไม่มีข้อมูล --</option>'
    : '<option value="">-- กรุณาเลือกวันที่ --</option>' + dates.map(d => `<option value="${d}">${d}</option>`).join('');

  if (select.innerHTML !== newHtml) {
      select.innerHTML = newHtml;
  }
  
  if (dates.length > 0) {
    
    const lastSelected = localStorage.getItem('guild_attendance_last_date');
    
    if (dates.includes(currentVal) && currentVal !== '') {
      select.value = currentVal;
    } else if (lastSelected && dates.includes(lastSelected)) {
      select.value = lastSelected;
    } else {
      select.value = dates[0];
    }
  }
  
  // Attach onchange to save to localStorage
  select.onchange = function() {
    localStorage.setItem('guild_attendance_last_date', this.value);
    window.renderAttendanceTable();
  };
  
  window.renderAttendanceTable();
}


window.switchAttTab = function(tab) {
  const dailyBtn = document.getElementById('btnAttTabDaily');
  const statsBtn = document.getElementById('btnAttTabStats');
  const dailyView = document.getElementById('attDailyView');
  const statsView = document.getElementById('attStatsView');
  
  if (tab === 'daily') {
    if (dailyBtn) dailyBtn.classList.add('active');
    if (statsBtn) statsBtn.classList.remove('active');
    if (dailyView) dailyView.style.display = 'block';
    if (statsView) statsView.style.display = 'none';
    window.renderAttendanceTable();
  } else {
    if (dailyBtn) dailyBtn.classList.remove('active');
    if (statsBtn) statsBtn.classList.add('active');
    if (dailyView) dailyView.style.display = 'none';
    if (statsView) statsView.style.display = 'block';
    window.renderAttendanceStats();
  }
};



window.exportAbsentUsers = function() {
    if (!window.currentUser || !window.isUserAdmin()) return;
    const select = document.getElementById('attendanceDateSelect');
    if (!select || !select.value) return window.showToast('กรุณาเลือกวันที่ก่อน', 'warning');
    const dateStr = select.value;
    const dayData = window.attendanceData.dates[dateStr];
    if (!dayData) return window.showToast('ไม่มีข้อมูลสำหรับวันที่นี้', 'warning');

    let absentNames = [];
    if (window.guildRoster) {
        Object.keys(window.guildRoster).forEach(job => {
            window.guildRoster[job].forEach(m => {
                if (dayData[m.name] === 'absent') {
                    absentNames.push(m.name);
                }
            });
        });
    }

    if (absentNames.length === 0) {
        return window.showToast('ไม่มีคนขาดวอในวันที่ ' + dateStr, 'info');
    }

    const text = absentNames.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'absent_' + dateStr + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast('ส่งออกรายชื่อคนขาด ' + absentNames.length + ' คนสำเร็จ', 'success');
};

window.archiveAttendanceDate = async function() {
    if (!window.currentUser || !window.isUserAdmin()) return;
    const select = document.getElementById('attendanceDateSelect');
    if (!select) return;
    const dateStr = select.value;
    if (!dateStr) return;
    
    if (await window.UI.confirm('คุณต้องการจัดเก็บข้อมูลเช็คชื่อของวันที่ ' + dateStr + ' ลงประวัติหรือไม่?\n(ข้อมูลจะถูกเก็บไว้ใช้คำนวณบทลงโทษต่อ แต่จะไม่แสดงในหน้านี้แล้ว)')) {
      if (!window.attendanceData.archived) window.attendanceData.archived = {};
        const dayDataToArchive = window.attendanceData.dates[dateStr];
        if (window.guildRoster) {
            Object.keys(window.guildRoster).forEach(job => {
                window.guildRoster[job].forEach(m => {
                    const status = dayDataToArchive[m.name];
                    if (!status || status === 'none') {
                        dayDataToArchive[m.name] = 'absent';
                    }
                });
            });
        }
        window.attendanceData.archived[dateStr] = dayDataToArchive;
        delete window.attendanceData.dates[dateStr];
      
      saveAttendanceState();
      
      window.showToast("จัดเก็บวันที่ " + dateStr + " ลงประวัติเรียบร้อยแล้ว", "success");
      
      select.value = '';
      localStorage.removeItem('guild_attendance_last_date');
      window.renderAttendanceTable();
    }
};

window.viewArchivedDates = function() {
    if (!window.currentUser || !window.isUserAdmin()) return;
    const listDiv = document.getElementById('archivedDatesPageList');
    if (!listDiv) return;
    
    const archived = window.attendanceData.archived || {};
    const dates = Object.keys(archived).sort((a, b) => b.localeCompare(a));
    
    if (dates.length === 0) {
        listDiv.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-lo); background:var(--bg-soft); border-radius:8px;">ไม่มีประวัติการจัดเก็บ</div>';
    } else {
        listDiv.innerHTML = dates.map(d => {
            const count = Object.keys(archived[d]).length;
            return '<div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid var(--line); background:var(--bg-soft); border-radius:8px; margin-bottom:8px;">' +
                   '<span style="font-size:15px; color:var(--text-hi);"><strong>' + d + '</strong> <small style="color:var(--text-lo); margin-left:8px;">(' + count + ' คน)</small></span>' +
                   '<button class="btn-secondary" onclick="window.restoreArchivedDate(\'' + d + '\')" style="font-size:13px; padding:6px 12px; border-color:var(--blue-500); color:var(--blue-600);">นำกลับมาใช้งาน</button>' +
                   '</div>';
        }).join('');
    }
};

window.restoreArchivedDate = function(dateStr) {
    if (!window.currentUser || !window.isUserAdmin()) return;
    if (!window.attendanceData.archived || !window.attendanceData.archived[dateStr]) return;
    
    window.attendanceData.dates[dateStr] = window.attendanceData.archived[dateStr];
    delete window.attendanceData.archived[dateStr];
    
    saveAttendanceState();
    window.showToast("นำวันที่ " + dateStr + " กลับมาแล้ว", "success");
    
    // Switch to attendance tab and select the restored date
    if (typeof switchTab === 'function') switchTab('page-attendance');
    const select = document.getElementById('attendanceDateSelect');
    if (select) {
        select.value = dateStr;
        localStorage.setItem('guild_attendance_last_date', dateStr);
        window.renderAttendanceTable();
    }
    window.viewArchivedDates(); // re-render list if they switch back
};

window.renderAttendanceTable = function() {
  const tbody = document.getElementById('attendanceTbody');
  if (!tbody) return;
  const select = document.getElementById('attendanceDateSelect');
  if (!select) return;
  const selectedDate = select.value;
  
  if (!selectedDate) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--text-lo);">กรุณาเลือกวันที่เพื่อดูข้อมูล</td></tr>';
    const summaryDiv = document.getElementById('attendanceSummary');
    if (summaryDiv) summaryDiv.innerHTML = '';
    const btnArchive = document.getElementById('btnArchiveAttendanceDate');
    const btnExport = document.getElementById('btnExportAbsent');
    const btnImport = document.getElementById('btnImportAttendance');
    if (btnArchive) btnArchive.style.display = 'none';
    if (btnExport) btnExport.style.display = 'none';
    if (btnImport) btnImport.style.display = 'none';
    return;
  }
  
  const btnArchive = document.getElementById('btnArchiveAttendanceDate');
    const btnExport = document.getElementById('btnExportAbsent');
    const btnImport = document.getElementById('btnImportAttendance');
    const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '')?.toLowerCase() : ''; const isAdmin = window.isUserAdmin();
    if (btnArchive) btnArchive.style.display = (isAdmin && selectedDate) ? 'inline-block' : 'none';
    if (btnExport) btnExport.style.display = (isAdmin && selectedDate) ? 'inline-block' : 'none';
    if (btnImport) btnImport.style.display = (isAdmin && selectedDate) ? 'inline-block' : 'none';
  
  const dayData = window.attendanceData.dates[selectedDate] || {};
  
  let allMembers = [];
  if (window.guildRoster) {
    Object.keys(window.guildRoster).forEach(job => {
      window.guildRoster[job].forEach(m => {
        allMembers.push({ name: m.name, job: job, power: m.power || 0 });
      });
    });
  }
  
  allMembers.sort((a,b) => b.power - a.power);
  
  const searchInput = document.getElementById('attendanceSearch');
  const query = searchInput ? searchInput.value?.toLowerCase().trim() : '';
  
  let html = '';
  let joinedCount = 0;
  let leaveCount = 0;
  let absentCount = 0;
  let totalCount = 0;
  
  let idx = 1;
    const todayStr = new Date().toLocaleString('sv').split(' ')[0]; // YYYY-MM-DD
    const isPast = selectedDate < todayStr;
    let needsSave = false;

    allMembers.forEach(m => {
       let status = dayData[m.name] || 'none';
       
       if ((!status || status === 'none') && window.leaveData) {
           const isLeave = window.leaveData.some(l => l.name?.toLowerCase() === m.name?.toLowerCase() && l.date === selectedDate);
           if (isLeave) {
               status = 'leave';
               dayData[m.name] = 'leave';
               needsSave = true;
           }
       }
       
       if ((!status || status === 'none') && isPast) {
           status = 'absent';
           dayData[m.name] = 'absent';
           needsSave = true;
       }

       if (query && !m.name?.toLowerCase()?.includes(query)) return;
     totalCount++;
     if (status === 'attended') joinedCount++;
     else if (status === 'leave') leaveCount++;
     else absentCount++;
     
     const escapedName = window.escapeHtml ? window.escapeHtml(m.name) : m.name;
     html += `<tr>
       <td class="cell-rank">${idx++}</td>
       <td>${escapedName}</td>
       <td style="text-align:center; font-weight: 600; color:${window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : "var(--text-hi)"};">${m.job}</td>
         <td style="text-align:center;"><small style="color:var(--text-lo)">${m.power}</small></td>
       <td style="text-align:center;">
         <select class="form-control" style="width:100%; min-width:100px; padding:4px;" ${isAdmin ? '' : 'disabled'} data-date="${selectedDate}" data-name="${escapedName}" onchange="updateAttendanceStatus(this.dataset.date, this.dataset.name, this.value)">
           <option value="none" ${!status || status === 'none' ? 'selected' : ''}>--- เว้นว่าง ---</option>
           <option value="attended" ${status === 'attended' ? 'selected' : ''}>เข้าร่วม</option>
           <option value="absent" ${status === 'absent' ? 'selected' : ''}>ขาด</option>
           <option value="leave" ${status === 'leave' ? 'selected' : ''}>ลา</option>
         </select>
       </td>
     </tr>`;
  });
  
  if (html === '') {
    html = '<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--text-lo);">ไม่พบข้อมูลสมาชิก</td></tr>';
  }
  tbody.innerHTML = html;
  
  const summaryDiv = document.getElementById('attendanceSummary');
  if (summaryDiv) {
    summaryDiv.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; text-align:center; margin-bottom: 10px; background:var(--bg-soft); padding: 12px; border-radius: 8px; border: 1px solid var(--line); font-size: 15px; font-weight: 600;">
        <span style="color:var(--text-hi);">ทั้งหมด : ${totalCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--ok);">มา : ${joinedCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--warn);">ลา : ${leaveCount} คน</span>
        <span style="color:var(--line); margin: 0 20px;">|</span>
        <span style="color:var(--danger);">ขาด : ${absentCount} คน</span>
      </div>
    `;
  }
};

window.updateAttendanceStatus = function(dateStr, name, status) {
  if (!window.currentUser || !window.isUserAdmin()) return;
  if (!window.attendanceData.dates[dateStr]) window.attendanceData.dates[dateStr] = {};
  window.attendanceData.dates[dateStr][name] = status;
  
  // Wrap in setTimeout to prevent Chrome PagePopupController crash 
  // (happens when <select> DOM is destroyed while native popup is closing)
  setTimeout(() => {
      saveAttendanceState();
  }, 150);
};

window.renderAttendanceStats = function() {
    const tbody = document.getElementById('attStatsTbody');
    if (!tbody) return;
    
    const btnReset = document.getElementById('btnResetStats');
    if (btnReset) btnReset.style.display = (window.currentUser && window.isUserAdmin()) ? 'block' : 'none';
    const searchInput = document.getElementById('attStatsSearch');
    const query = searchInput ? searchInput.value?.toLowerCase().trim() : '';
    
    const statsMap = {};
    let datesCount = 0;
    
    const aggregate = (datesObj) => {
        if (!datesObj) return;
        const keys = Object.keys(datesObj);
        datesCount += keys.length;
        keys.forEach(d => {
            let weight = 1;
            if (d.includes('อังคาร')) weight = 1;
            else if (d.includes('พฤหัส')) weight = 1;
            else if (d.includes('อาทิตย์')) weight = 2;
            
            const dayData = datesObj[d];
            Object.keys(dayData).forEach(name => {
                const status = dayData[name];
                if (!statsMap[name]) statsMap[name] = { joined: 0, leave: 0, absent: 0, score: 0 };
                if (status === 'attended') { statsMap[name].joined++; statsMap[name].score += weight; }
                if (status === 'leave') { statsMap[name].leave++; }
                if (status === 'absent') { statsMap[name].absent++; statsMap[name].score -= weight; }
            });
        });
    };
    
    aggregate(window.attendanceData.dates);
    aggregate(window.attendanceData.archived);
    
    let allMembers = [];
    if (window.guildRoster) {
      Object.keys(window.guildRoster).forEach(function(job) {
        window.guildRoster[job].forEach(function(m) {
          allMembers.push({ name: m.name, job: job, power: m.power || 0 });
        });
      });
    }
  
    allMembers.sort(function(a,b) { return b.power - a.power; });
    if (query) allMembers = allMembers.filter(function(m) { return m.name?.toLowerCase()?.includes(query); });
  
    let html = '';
    allMembers.forEach(function(m, i) {
      const s = statsMap[m.name] || { joined: 0, leave: 0, absent: 0, score: 0 };
      const total = datesCount;
      
      const eName = window.escapeHtml ? window.escapeHtml(m.name) : m.name;
      html += '<tr>' +
        '<td class="cell-rank">' + (i+1) + '</td>' +
        '<td>' + eName + '</td>' +
        '<td style="text-align:center; font-weight: 600; color:' + (window.JOB_COLORS && window.JOB_COLORS[m.job] ? window.JOB_COLORS[m.job] : 'var(--text-hi)') + ';">' + m.job + '</td>' +
        '<td style="text-align:center; color:var(--ok)">' + s.joined + '</td>' +
        '<td style="text-align:center; color:var(--warn)">' + s.leave + '</td>' +
        '<td style="text-align:center; color:var(--danger)">' + s.absent + '</td>' +
        '<td style="text-align:center; font-weight:bold; color:var(--blue-600)">' + s.score + '</td>' +
        
        '</tr>';
    });
    tbody.innerHTML = html || '<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-lo);">ไม่มีข้อมูลสถิติ</td></tr>';
};


document.addEventListener('input', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusin', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    showGlobalDropdown(e.target, e.target.value.trim());
  }
});

document.addEventListener('focusout', (e) => {
  if (e.target && e.target.classList.contains('autocomplete-member')) {
    setTimeout(() => {
      const dropdown = document.getElementById('globalMemberDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }, 150);
  }
});

// Update window scroll to hide dropdown
window.addEventListener('scroll', (e) => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown && dropdown.style.display === 'block') {
    if (!dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  }
}, true);


window.activeAutocompleteInput = null;

function showGlobalDropdown(inputEl, filterText = '') {
  try {
    if (!window.guildRoster) return;
    const dropdown = document.getElementById('globalMemberDropdown');
    if (!dropdown) return;
    
    let allMembers = [];
    Object.keys(window.guildRoster).forEach(job => {
      window.guildRoster[job].forEach(m => {
        allMembers.push({ name: m.name, job: job, power: m.power || 0 });
      });
    });
    
    const action = inputEl.getAttribute('data-action');
    
    // Apply specific filters
      if (action === 'mainField' || action === 'dungeonTeam' || action === 'dungeonQueue') {
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
        const todayDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
        if (window.leaveData && window.leaveData.length > 0) {
          allMembers = allMembers.filter(m => {
            const isOnLeave = window.leaveData.some(l =>
              l.name?.trim().toLowerCase() === m.name?.trim().toLowerCase() &&
              (l.date === todayStr || l.day === todayDay)
            );
            return !isOnLeave;
          });
        }
      }
      
      if (action === 'mainField') {
      const slotKey = inputEl.getAttribute('data-slot');
      const requiredJob = window.rowJobFilter ? window.rowJobFilter[slotKey] : '';
      
      allMembers = allMembers.filter(m => {
        if (requiredJob && m.job !== requiredJob) return false;
        const lowerName = m.name?.toLowerCase();
        if (window.occupiedMap && window.occupiedMap.has(lowerName)) {
          if (window.occupiedMap.get(lowerName) !== slotKey) return false;
        }
        return true;
      });
    } else if (action === 'dungeonTeam' && typeof window.dungeonData !== 'undefined') {
      const currentTab = window.currentDungeonTab;
      const teamId = inputEl.getAttribute('data-team-id');
      const slotIdx = parseInt(inputEl.getAttribute('data-slot-idx'));
      const inUseNames = new Set();
      
      window.dungeonData.teams.forEach(t => {
        if (t.type === currentTab) {
          t.members.forEach((m, idx) => {
            if (m && m.name) {
               if (t.id === teamId && idx === slotIdx) return; // Allow current occupant
               inUseNames.add(m.name?.toLowerCase());
            }
          });
        }
      });
      allMembers = allMembers.filter(m => !inUseNames.has(m.name?.toLowerCase()));
    }
    
    const val = filterText?.toLowerCase();
    const filtered = allMembers.filter(m => m.name?.toLowerCase()?.includes(val));
    
    if (filtered.length === 0) {
      dropdown.innerHTML = '<div style="padding: 10px; text-align:center; color:var(--text-lo); font-size: 13px;">ไม่พบชื่อตัวละคร</div>';
    } else {
      dropdown.innerHTML = filtered.map(m => 
        `<div class="custom-dropdown-item" data-name="${window.escapeHtml ? window.escapeHtml(m.name) : m.name}" data-job="${m.job}" data-power="${m.power}">
          <strong style="color:var(--blue-700);">${window.escapeHtml ? window.escapeHtml(m.name) : m.name}</strong> 
          <span style="opacity:0.7; font-size:12px;">- ${m.job} (${m.power})</span>
        </div>`
      ).join('');
      
      dropdown.querySelectorAll('.custom-dropdown-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
          e.preventDefault(); 
          if (window.activeAutocompleteInput) {
            const newName = item.getAttribute('data-name');
            window.activeAutocompleteInput.value = newName; window.activeAutocompleteInput.blur();
            
            const action = window.activeAutocompleteInput.getAttribute('data-action');
            if (action === 'mainField') {
               const slot = window.activeAutocompleteInput.getAttribute('data-slot');
               if (typeof handleNameChange === 'function') handleNameChange(slot, newName);
            } else if (action === 'dungeonTeam') {
               const teamId = window.activeAutocompleteInput.getAttribute('data-team-id');
               const slotIdx = window.activeAutocompleteInput.getAttribute('data-slot-idx');
               if (typeof updateDungeonTeamName === 'function') updateDungeonTeamName(teamId, parseInt(slotIdx), newName);
            } else if (action === 'leaveForm') {
               const job = item.getAttribute('data-job');
               const leaveJob = document.getElementById('leaveJob');
               if (leaveJob) leaveJob.value = job;
            } else if (action === 'dungeonQueue') {
               const job = item.getAttribute('data-job');
               const dqClass = document.getElementById('dqClass');
               if (dqClass) dqClass.value = job;
            }
          }
          dropdown.style.display = 'none';
        });
      });
    }
    
    const rect = inputEl.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = Math.max(200, rect.width) + 'px';
    dropdown.style.display = 'block';
    window.activeAutocompleteInput = inputEl;
  } catch(e) {
    console.error('Dropdown Error:', e);
  }
}


// ==========================================

    if (typeof setupAttendanceFirebase === 'function' && !window._attendanceReady) {
      window._attendanceReady = true;
      await setupAttendanceFirebase();
    }
  } catch(err) {
    console.error('[Module Attendance] ระบบเช็คชื่อมีปัญหา:', err);
    const area = document.getElementById('attendanceTbody');
    if (area) area.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--danger);">ระบบเช็คชื่อขัดข้อง กรุณารีเฟรชหน้าจอ</td></tr>';
  }
})();


window.getUserScore = function(username) {
    if (!window.attendanceData) return 0;
    let score = 0;
    
    const calculateStats = (datesObj) => {
        if (!datesObj) return;
        Object.keys(datesObj).forEach(dateStr => {
            const status = datesObj[dateStr][username];
            if (!status) return;
            
            let weight = 1;
            if (dateStr.includes('อังคาร')) weight = 1;
            else if (dateStr.includes('พฤหัส')) weight = 1;
            else if (dateStr.includes('อาทิตย์')) weight = 2;
            
            if (status === 'attended') score += weight;
            else if (status === 'absent') score -= weight;
        });
    };
    
    calculateStats(window.attendanceData.dates);
    calculateStats(window.attendanceData.archived);
    
    return score;
};
window.getUserAbsentCount = window.getUserScore;
