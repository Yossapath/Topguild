const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Inject leavePanelTeams before teams-layout
if (!code.includes('leavePanelTeams')) {
  const insertStr = `
    <style>
      .leave-panel-header { font-weight: 700; color: #dc2626; margin-bottom: 8px; width: 100%; }
      .leave-badge { display: inline-flex; align-items: center; gap: 4px; background: #fee2e2; color: #991b1b; border-radius: 20px; padding: 4px 12px; font-size: 13px; margin: 2px; border: 1px solid #fecaca; }
      .leave-badge small { font-size: 11px; opacity: 0.8; }
    </style>
    <div id="leavePanelTeams" style="display:none; background:#fef2f2; border:1px solid #fca5a5; border-radius:10px; padding:12px 16px; margin-bottom:14px; flex-wrap:wrap; gap:8px;"></div>
`;
  code = code.replace('<div class="teams-layout">', insertStr + '    <div class="teams-layout">');
}

// 2. Add score display under dqName
if (!code.includes('dqScoreDisplay')) {
  const dqInput = '<input type="text" id="dqName" class="form-control autocomplete-member" data-action="dungeonQueue" placeholder="พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off" style="font-size: 16px; padding: 12px; height: 48px;">\n</div>';
  const newDqInput = '<input type="text" id="dqName" class="form-control autocomplete-member" data-action="dungeonQueue" placeholder="พิมพ์ชื่อ หรือคลิกเพื่อเลือก..." autocomplete="off" style="font-size: 16px; padding: 12px; height: 48px;">\n<div id="dqScoreDisplay" style="font-size: 13px; color: var(--text-lo); margin-top: 4px; font-weight: 600;"></div>\n</div>';
  
  if (code.includes('<input type="text" id="dqName" class="form-control autocomplete-member" data-action="dungeonQueue"')) {
     const startIdx = code.indexOf('<input type="text" id="dqName" class="form-control autocomplete-member"');
     const endIdx = code.indexOf('</div>', startIdx) + 6;
     code = code.substring(0, startIdx) + newDqInput + code.substring(endIdx);
  }
}

fs.writeFileSync('index.html', code);
console.log('index.html patched');
