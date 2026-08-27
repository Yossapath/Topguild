const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const searchInjection = `
  const sidebarBody = document.getElementById('sidebarBody');
  if (!sidebarBody) return;

  var searchWrap = document.getElementById('sidebarSearchWrap');
  if (!searchWrap) {
    searchWrap = document.createElement('div');
    searchWrap.id = 'sidebarSearchWrap';
    searchWrap.style.cssText = 'padding:8px 12px;border-bottom:1px solid var(--line);';
    var searchInp = document.createElement('input');
    searchInp.type = 'text';
    searchInp.id = 'sidebarSearchInput';
    searchInp.placeholder = '🔍 ค้นหาชื่อ...';
    searchInp.style.cssText = 'width:100%;box-sizing:border-box;padding:6px 10px;border:1px solid var(--line);border-radius:8px;font-size:13px;';
    searchInp.addEventListener('input', function() { renderSidebar(); });
    searchWrap.appendChild(searchInp);
    if (sidebarBody.parentNode) sidebarBody.parentNode.insertBefore(searchWrap, sidebarBody);
  }
  var sidebarSearchQuery = (document.getElementById('sidebarSearchInput') || {}).value || '';
`;

const regex = /const sidebarBody = document\.getElementById\('sidebarBody'\);\s*if \(!sidebarBody\) return;/;
code = code.replace(regex, searchInjection);
fs.writeFileSync('app.js', code);
console.log('Fixed sidebarSearchQuery reference error');
