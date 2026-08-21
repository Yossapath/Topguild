const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /window\.processBulkAdd = function\(\) \{[\s\S]*?errorCount\+\+;\s*\}\s*\}\);\s*saveState\(\);\s*renderJobGrid\(\);\s*updateSummaryStrip\(\);\s*closeBulkAddModal\(\);\s*let msg = \`เพิ่มรายชื่อสำเร็จ \$\{addedCount\} คน\`;\s*if \(errorCount > 0\) msg \+= \` \\n\(ข้ามข้อมูลซ้ำ\/ผิดพลาด \$\{errorCount\} รายการ\)\`;\s*showToast\(msg, addedCount > 0 \? "success" : "warning"\);\s*\};/;

const newFn = `window.processBulkAdd = function() {
  const text = document.getElementById('bulkAddText').value.trim();
  if (!text) {
    showToast("กรุณาวางข้อมูลรายชื่อก่อน", "warning");
    return;
  }
  
  const lines = text.split('\\n');
  let addedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  
  const jobMap = {};
  JOB_LIST.forEach(j => {
    jobMap[j.toLowerCase()] = j;
    jobMap[j.replace(/\\s+/g, '').toLowerCase()] = j;
  });
  
  lines.forEach(line => {
    if (!line.trim()) return;
    
    let parts = line.split(/\\t|,| {2,}/).map(p => p.trim()).filter(p => p);
    if (parts.length < 3) {
      parts = line.split(/\\s+/).map(p => p.trim()).filter(p => p);
    }
    
    if (parts.length >= 3) {
      const name = parts[0];
      
      // Smart parse: find which part is the power (the number) and the rest is job
      let powerRaw = null;
      let powerIndex = -1;
      
      // Try from the end first
      for (let i = parts.length - 1; i >= 1; i--) {
        const parsed = parseInt(parts[i].replace(/,/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) {
          powerRaw = parts[i];
          powerIndex = i;
          break;
        }
      }
      
      if (powerIndex === -1) {
        errorCount++;
        return;
      }
      
      // The job is everything else except the name and power
      const jobParts = [];
      for (let i = 1; i < parts.length; i++) {
        if (i !== powerIndex) {
          jobParts.push(parts[i]);
        }
      }
      const jobRaw = jobParts.join(" ");
      
      const normalizedJobRaw = jobRaw.toLowerCase().replace(/\\s+/g, '');
      let job = jobMap[normalizedJobRaw] || jobMap[jobRaw.toLowerCase()];
      const power = parseInt(powerRaw.replace(/,/g, ''), 10);
      
      if (name && job && !isNaN(power)) {
        const nameLower = name.toLowerCase();
        
        // Check if name already exists anywhere
        let existingJob = null;
        let existingIndex = -1;
        
        Object.keys(guildRoster).forEach(j => {
          const idx = (guildRoster[j] || []).findIndex(m => m.name.trim().toLowerCase() === nameLower);
          if (idx !== -1) {
            existingJob = j;
            existingIndex = idx;
          }
        });
        
        if (existingJob) {
          // Update existing
          if (existingJob === job) {
            // Same job, just update power
            guildRoster[existingJob][existingIndex].power = power;
            // Update name casing just in case
            guildRoster[existingJob][existingIndex].name = name; 
          } else {
            // Changed job! Remove from old, add to new
            const oldMember = guildRoster[existingJob].splice(existingIndex, 1)[0];
            if (!guildRoster[job]) guildRoster[job] = [];
            guildRoster[job].push({ name, power, requirement: oldMember.requirement || 'all' });
          }
          updatedCount++;
        } else {
          // Add new
          if (!guildRoster[job]) guildRoster[job] = [];
          guildRoster[job].push({ name, power, requirement: 'all' });
          addedCount++;
        }
      } else {
        errorCount++;
      }
    } else {
      errorCount++;
    }
  });
  
  saveState();
  renderJobGrid();
  updateSummaryStrip();
  closeBulkAddModal();
  
  let msg = [];
  if (addedCount > 0) msg.push(\`เพิ่มใหม่ \${addedCount} คน\`);
  if (updatedCount > 0) msg.push(\`อัปเดต \${updatedCount} คน\`);
  if (errorCount > 0) msg.push(\`(ข้ามข้อมูลผิดพลาด \${errorCount} รายการ)\`);
  
  if (msg.length > 0) {
    showToast(msg.join(', '), "success");
  } else {
    showToast("ไม่มีการเปลี่ยนแปลง", "warning");
  }
};`;

if (regex.test(code)) {
    code = code.replace(regex, newFn);
    fs.writeFileSync('app.js', code, 'utf8');
    console.log('Successfully updated processBulkAdd');
} else {
    console.log('Regex did not match');
}
