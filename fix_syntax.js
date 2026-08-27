const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const targetStr = `window.closeAutoMatchModal = function() {
  const modal = document.getElementById('autoMatchModal');
  if (modal) {
    const mainFm = fieldMeta[0];`;

const replacementStr = `window.closeAutoMatchModal = function() {
  const modal = document.getElementById('autoMatchModal');
  if (modal) {
    modal.classList.remove('show');
  }
};

/* Custom Guild Team Optimization Algorithm */
async function autoOptimizeTeams(customMainNames = null, mode = 'both') {
  const masterList = getMasterMemberList();

  // Guard: ถ้า leaveData ยังไม่ถูก init (undefined) ให้ init เป็น array ว่างก่อน
  if (!Array.isArray(window.leaveData)) {
    window.leaveData = [];
    showToast('⚠️ ข้อมูลการลายังโหลดไม่เสร็จ ระบบจะจัดทีมโดยไม่คำนึงถึงการลาชั่วคราว', 'warning');
  }

  if (mode === 'both') {
    teamsAssignments = {};
    occupiedMap.clear();
  } else if (mode === 'main') {
    const mainFm = fieldMeta[0];`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('app.js', code);
console.log('Fixed autoOptimizeTeams syntax error');
