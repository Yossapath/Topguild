const fs = require('fs');
let code = fs.readFileSync('module_leave.js', 'utf8');

// 1. Patch archiveOldLeaves to support isSilent and prevent dupes
const archiveRegex = /window\.archiveOldLeaves = async function\(\) \{[\s\S]*?window\.showToast\('จัดเก็บประวัติการลาสำเร็จ ' \+ toArchive\.length \+ ' รายการ', 'success'\);\n    \} catch\(err\) \{[\s\S]*?\}\n  \};/;

const archiveReplace = `window.archiveOldLeaves = async function(isSilent = false) {
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
      console.log('[Auto-Archive] Archived ' + toArchive.length + ' leaves.');
    } catch(err) {
      console.error(err);
      if (!isSilent) window.showToast('เกิดข้อผิดพลาดในการจัดเก็บประวัติ', 'error');
    }
  };`;

code = code.replace(archiveRegex, archiveReplace);

// 2. Patch onSnapshot to trigger auto-archive
const snapshotRegex = /window\.leaveData = d\.leaves \|\| \[\];\s*renderLeaveList\(\);\s*if \(typeof window\.renderAll === 'function'\) window\.renderAll\(\);/;
const snapshotReplace = `window.leaveData = d.leaves || [];
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
        }`;

code = code.replace(snapshotRegex, snapshotReplace);

fs.writeFileSync('module_leave.js', code);
console.log('Patched module_leave.js for auto archive');
