import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// ==========================================
// MODULE: LEAVE SYSTEM
// ==========================================
(async function initLeaveModule() {
  try {
    // ====== LEAVE SYSTEM ======
// ==========================================



window.leaveData = window.leaveData || [];
let unsubLeaveListener = null;
let unsubLeaveHistoryListener = null;

window.setupLeaveFirebase = async function() {
  if (!window.db) return;
  try {
    const leaveRef = doc(window.db, 'guild_system', 'leaves');
    const histRef = doc(window.db, 'guild_system', 'leave_history');
    
    const snap = await getDoc(leaveRef);
    if (!snap.exists()) {
      await setDoc(leaveRef, { leaves: [] });
    }
    const histSnap = await getDoc(histRef);
    if (!histSnap.exists()) {
      await setDoc(histRef, { leaves: [] });
    }
    
    unsubLeaveListener = onSnapshot(leaveRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        window.leaveData = d.leaves || [];
        renderLeaveList();
        if (typeof window.renderAll === 'function') window.renderAll();
        
        // Auto archive past leaves if admin
        if (window.isUserAdmin && window.isUserAdmin()) {
           const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
           const hasPast = window.leaveData.some(l => l.date && l.date < todayStr);
           if (hasPast && !window._autoArchiving) {
              window._autoArchiving = true;
              setTimeout(() => {
                 if (window.archiveOldLeaves) window.archiveOldLeaves(true);
                 window._autoArchiving = false;
              }, 2000);
           }
        }
      }
    });
    
    unsubLeaveHistoryListener = onSnapshot(histRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        window.leaveHistoryData = d.leaves || [];
        renderLeaveList();
      }
    });
  } catch(e) {
    console.error('setupLeaveFirebase error:', e);
  }
};

async function saveLeaveState() {
  if (!window.db) return;
  const leaveRef = doc(window.db, 'guild_system', 'leaves');
  await setDoc(leaveRef, { leaves: window.leaveData });
}

// Auto-fill leave form with current user's info when tab is shown
(function() {
  const tabBtn = document.querySelector('[data-page="page-leave"]');
  if (tabBtn) {
    tabBtn.addEventListener('click', function() {
      setTimeout(fillLeaveForm, 100);
    });
  }
  // Also fill when page loads if already on leave tab
  window.addEventListener('load', function() {
    const page = document.getElementById('page-leave');
    if (page && page.style.display !== 'none') fillLeaveForm();
  });
})();

function fillLeaveForm() {
  if (!window.currentUser) return;
  const nameInput = document.getElementById('leaveName');
  const jobSelect = document.getElementById('leaveJob');
  if (nameInput && !nameInput.value) {
    // Find character name from roster matching current user
    let charName = '';
    let charJob = '';
    if (window.guildRoster) {
      Object.keys(window.guildRoster).forEach(job => {
        const found = (window.guildRoster[job] || []).find(
          m => m.name && m.name?.toLowerCase() === window.currentUser.username?.toLowerCase()
        );
        if (found) { charName = found.name; charJob = job; }
      });
    }
    if (charName) {
      nameInput.value = charName;
      if (jobSelect && charJob) jobSelect.value = charJob;
    }
  }
}

window.archiveOldLeaves = async function(isSilent = false) {
  if (!window.currentUser || !window.isUserAdmin()) return;
  if (!isSilent) {
    if (!await window.UI.confirm('ยืนยันการจัดเก็บประวัติการลาที่เลยกำหนดแล้วเข้าสู่ฐานข้อมูล?')) return;
  }
  
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  const toArchive = window.leaveData.filter(l => l.date && l.date < todayStr);
  const remaining = window.leaveData.filter(l => !l.date || l.date >= todayStr);
  
  if (toArchive.length === 0) {
    if (!isSilent) window.showToast('ไม่มีรายการแจ้งลาที่เลยกำหนด', 'info');
    return;
  }

  try {
    const newHist = [...(window.leaveHistoryData || [])];
    toArchive.forEach(a => {
       if (!newHist.some(h => h.id === a.id)) newHist.push(a);
    });
    window.leaveHistoryData = newHist;
    window.leaveData = remaining;
    
    const leaveRef = doc(window.db, 'guild_system', 'leaves');
    const historyRef = doc(window.db, 'guild_system', 'leave_history');
    await setDoc(leaveRef, { leaves: window.leaveData });
    await setDoc(historyRef, { leaves: window.leaveHistoryData }, { merge: true });
    
    if (!isSilent) window.showToast('จัดเก็บประวัติการลาสำเร็จ ' + toArchive.length + ' รายการ', 'success');
  } catch(err) {
    console.error(err);
    if (!isSilent) window.showToast('เกิดข้อผิดพลาดในการจัดเก็บประวัติ', 'error');
  }
};

window.submitLeave = async function() {
  if (!window.currentUser) return window.showToast('กรุณาเข้าสู่ระบบ', 'error');

  const nameInput = document.getElementById('leaveName');
  const jobSelect = document.getElementById('leaveJob');
  const daySelect = document.getElementById('leaveDay');
  const dateInput = document.getElementById('leaveDate');

  const name = nameInput ? nameInput.value.trim() : '';
  const job = jobSelect ? jobSelect.value : '';
  const day = daySelect ? daySelect.value : '';
  const date = dateInput ? dateInput.value : '';
  const reasonInput = document.getElementById('leaveReason');
  const reason = reasonInput ? reasonInput.value.trim() : '';

  if (!name || !job || !day || !date || !reason) {
    if (!reason) return window.showToast('กรุณาระบุเหตุผลการลาทุกครั้ง', 'warning');
    return window.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
  }

  // Validate user can only submit leave for themselves (by matching name from roster)
  const isAdmin = window.isUserAdmin();
  if (!isAdmin) {
    // Check if name matches current user's character
    let myCharName = '';
    if (window.guildRoster) {
      Object.keys(window.guildRoster).forEach(job => {
        const found = (window.guildRoster[job] || []).find(
          m => m.name && m.name?.toLowerCase() === window.currentUser.username?.toLowerCase()
        );
        if (found) myCharName = found.name;
      });
    }
    if (!myCharName || myCharName?.toLowerCase() !== name?.toLowerCase()) {
      return window.showToast('คุณสามารถแจ้งลาได้เฉพาะชื่อตัวละครของตัวเองเท่านั้น', 'error');
    }
  }

  // Check for duplicate leave
  const isDup = window.leaveData.some(l =>
    l.name?.toLowerCase() === name?.toLowerCase() && l.day === day && l.date === date
  );
  if (isDup) return window.showToast('คุณได้แจ้งลาวันนี้และรอบนี้ไว้แล้ว', 'warning');

  const entry = {
    id: Date.now().toString(),
    name, job, day, date, reason,
    submittedBy: window.currentUser.username,
    timestamp: Date.now()
  };

  
  window.leaveData.push(entry);
  await saveLeaveState();
  
  // --- Auto-Sync with Attendance ---
  try {
    const dayLabelsMap = {
      'Tuesday': 'อังคาร',
      'Thursday': 'พฤหัสบดี',
      'Sunday': 'อาทิตย์'
    };
    const mappedDay = dayLabelsMap[day] || day;
    const attKey = date + " (" + mappedDay + ")";
    
    if (window.attendanceData) {
      if (!window.attendanceData.dates) window.attendanceData.dates = {};
      if (!window.attendanceData.dates[attKey]) window.attendanceData.dates[attKey] = {};
      window.attendanceData.dates[attKey][name] = 'leave';
      if (typeof window.saveAttendanceState === 'function') {
        await window.saveAttendanceState();
        console.log('Auto-synced leave to attendance');
      }
    }
  } catch(e) {
    console.error("Auto-sync leave to attendance failed:", e);
  }

  window.showToast('บันทึกการลาเรียบร้อยแล้ว', 'success');

  // Clear form
  if (nameInput) nameInput.value = '';
  if (jobSelect) jobSelect.value = '';
  if (daySelect) daySelect.value = '';
  if (dateInput) dateInput.value = '';
};

window.cancelLeave = async function(leaveId) {
  if (!window.currentUser) return window.showToast('กรุณาเข้าสู่ระบบ', 'error');
  const isAdmin = window.isUserAdmin();
  const entry = window.leaveData.find(l => l.id === leaveId);
  if (!entry) return;

  // Only admin or the submitter can cancel
  if (!isAdmin && entry.submittedBy !== window.currentUser.username) {
    return window.showToast('คุณไม่มีสิทธิ์ยกเลิกการลาของคนอื่น', 'error');
  }

  if (!await window.UI.confirm('ยืนยันการยกเลิกการแจ้งลา?')) return;
  
  window.leaveData = window.leaveData.filter(l => l.id !== leaveId);
  await saveLeaveState();
  
  // --- Auto-Sync with Attendance ---
  try {
    const dayLabelsMap = {
      'Tuesday': 'อังคาร',
      'Thursday': 'พฤหัสบดี',
      'Sunday': 'อาทิตย์'
    };
    const mappedDay = dayLabelsMap[entry.day] || entry.day;
    const attKey = entry.date + " (" + mappedDay + ")";
    
    if (window.attendanceData && window.attendanceData.dates && window.attendanceData.dates[attKey]) {
      if (window.attendanceData.dates[attKey][entry.name] === 'leave') {
        window.attendanceData.dates[attKey][entry.name] = 'none'; // Revert
        if (typeof window.saveAttendanceState === 'function') {
          await window.saveAttendanceState();
          console.log('Auto-unsynced leave from attendance');
        }
      }
    }
  } catch(e) {
    console.error("Auto-unsync leave from attendance failed:", e);
  }

  window.showToast('ยกเลิกการลาเรียบร้อยแล้ว', 'success');
};

function renderLeaveList() {
  const tbody = document.getElementById('leaveListTbody');
  if (!tbody) return;

  const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '')?.toLowerCase() : '';
  const isAdmin = window.isUserAdmin();

  // Sort by date desc
  const sorted = [...window.leaveData].sort((a,b) => b.timestamp - a.timestamp);

  // Non-admin only sees their own leaves
  const displayed = isAdmin
    ? sorted
    : sorted.filter(l => window.currentUser && l.submittedBy === window.currentUser.username);

  const dayLabels = {
    'Tuesday': 'อังคาร',
    'Thursday': 'พฤหัสบดี',
    'Sunday': 'อาทิตย์'
  };

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

  const upcomingLeaves = [];
  const pastLeaves = []; // Used to check if archive button should show

  displayed.forEach(l => {
    if (l.date && l.date < todayStr) {
      pastLeaves.push(l);
    } else {
      upcomingLeaves.push(l);
    }
  });

  const btnArchive = document.getElementById('btnArchiveLeave');
  if (btnArchive) btnArchive.style.display = (isAdmin && pastLeaves.length > 0) ? 'inline-block' : 'none';

  function generateRows(list) {
    if (list.length === 0) {
      return '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-lo);">ไม่มีรายการแจ้งลา</td></tr>';
    }
    return list.map(l => {
      const eName = window.escapeHtml ? window.escapeHtml(l.name) : l.name;
      const dayLabel = dayLabels[l.day] || l.day;
      return '<tr>' +
        '<td>' + (l.date || '-') + '</td>' +
        '<td>' + dayLabel + '</td>' +
        '<td>' + eName + '</td>' +
        '<td>' + (l.job || '-') + '</td>' +
        '<td>' + (l.submittedBy || '-') + '</td>' +
        '<td>' + window.escapeHtml(l.reason || '-') + '</td>' +
        '<td style="text-align:center;"><button onclick="cancelLeave(\'' + l.id + '\')" style="background:var(--danger-light);color:var(--danger);border:1px solid var(--danger);padding:2px 8px;border-radius:6px;cursor:pointer;font-size:12px;">ยกเลิก</button></td>' +
        '</tr>';
    }).join('');
  }

  tbody.innerHTML = generateRows(upcomingLeaves);
}
// ====== ACCOUNT ROLE MANAGEMENT ======
// ==========================================



// Fix scrollbar clicking stealing focus and closing dropdown
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('globalMemberDropdown');
  if (dropdown) {
    dropdown.addEventListener('mousedown', (e) => {
      // If clicking inside the custom-dropdown-item, it already preventDefaults
      // If clicking on the scrollbar, we also need to preventDefault so focus isn't lost
      e.preventDefault();
    });
  }
});


const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

    if (typeof setupLeaveFirebase === 'function' && !window._leaveReady) {
      window._leaveReady = true;
      await setupLeaveFirebase();
    }
  } catch(err) {
    console.error('[Module Leave] ระบบแจ้งลามีปัญหา:', err);
  }
})();
