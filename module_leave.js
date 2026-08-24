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

window.setupLeaveFirebase = async function() {
  if (!window.db) return;
  try {
    const leaveRef = doc(window.db, 'guild_system', 'leaves');
    const snap = await getDoc(leaveRef);
    if (!snap.exists()) {
      await setDoc(leaveRef, { leaves: [] });
    }
    unsubLeaveListener = onSnapshot(leaveRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        window.leaveData = d.leaves || [];
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
          m => m.name && m.name.toLowerCase() === window.currentUser.username.toLowerCase()
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
          m => m.name && m.name.toLowerCase() === window.currentUser.username.toLowerCase()
        );
        if (found) myCharName = found.name;
      });
    }
    if (!myCharName || myCharName.toLowerCase() !== name.toLowerCase()) {
      return window.showToast('คุณสามารถแจ้งลาได้เฉพาะชื่อตัวละครของตัวเองเท่านั้น', 'error');
    }
  }

  // Check for duplicate leave
  const isDup = window.leaveData.some(l =>
    l.name.toLowerCase() === name.toLowerCase() && l.day === day && l.date === date
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
  window.showToast('ยกเลิกการลาเรียบร้อยแล้ว', 'success');
};

function renderLeaveList() {
  const tbody = document.getElementById('leaveListTbody');
  const historyTbody = document.getElementById('leaveHistoryTbody');
  if (!tbody) return;

  const userRole = window.currentUser ? (window.currentUser.role || window.currentUser.Role || '').toLowerCase() : '';
  const isAdmin = window.isUserAdmin();

  // Sort by date desc
  const sorted = [...window.leaveData].sort((a,b) => b.timestamp - a.timestamp);

  // Non-admin only sees their own leaves
  const displayed = isAdmin
    ? sorted
    : sorted.filter(l => window.currentUser && l.submittedBy === window.currentUser.username);

  const dayLabels = {
    'Tuesday_1': 'อังคาร รอบ 1 (21:30)',
    'Tuesday_2': 'อังคาร รอบ 2 (22:00)',
    'Thursday': 'พฤหัส (22:00)',
    'Sunday': 'อาทิตย์ (21:00)'
  };

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

  const upcomingLeaves = [];
  const pastLeaves = [];

  displayed.forEach(l => {
    if (l.date && l.date < todayStr) {
      pastLeaves.push(l);
    } else {
      upcomingLeaves.push(l);
    }
  });

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
  if (historyTbody) {
    historyTbody.innerHTML = generateRows(pastLeaves);
  }
}

// ==========================================
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
