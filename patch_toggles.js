const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const themeTarget = `function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('guild_app_theme', theme);
      var btn = document.getElementById('btnThemeToggle');
      if (btn) {
        btn.innerHTML = theme === 'dark' ? 'ธีมสว่าง' : 'ธีมมืด';
      }
    }`;
    
const themeReplace = `function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('guild_app_theme', theme);
      var btn = document.getElementById('btnThemeToggle');
      if (btn) {
        btn.innerHTML = theme === 'dark' ? 'ธีมสว่าง' : 'ธีมมืด';
        if (theme === 'dark') btn.classList.add('active-mode');
        else btn.classList.remove('active-mode');
      }
    }`;

if (html.includes(themeTarget)) {
  html = html.replace(themeTarget, themeReplace);
}

const styleTarget = `function setJobStyle(style) {
      document.documentElement.setAttribute('data-job-style', style);
      localStorage.setItem('guild_job_style', style);
      var bSolid = document.getElementById('btnStyleSolid');
      var bOutline = document.getElementById('btnStyleOutline');
      if (bSolid && bOutline) {
        if (style === 'outline') {
          bSolid.style.background = 'transparent';
          bSolid.style.color = 'var(--text-lo)';
          bOutline.style.background = 'var(--blue-700)';
          bOutline.style.color = '#ffffff';
        } else {
          bSolid.style.background = 'var(--blue-700)';
          bSolid.style.color = '#ffffff';
          bOutline.style.background = 'transparent';
          bOutline.style.color = 'var(--text-lo)';
        }
      }
    }`;
    
const styleReplace = `function setJobStyle(style) {
      document.documentElement.setAttribute('data-job-style', style);
      localStorage.setItem('guild_job_style', style);
      var bSolid = document.getElementById('btnStyleSolid');
      var bOutline = document.getElementById('btnStyleOutline');
      if (bSolid) {
        if (style === 'solid') bSolid.classList.add('active-mode');
        else bSolid.classList.remove('active-mode');
      }
      if (bOutline) {
        if (style === 'outline') bOutline.classList.add('active-mode');
        else bOutline.classList.remove('active-mode');
      }
    }`;

if (html.includes(styleTarget)) {
  html = html.replace(styleTarget, styleReplace);
}

// Remove lock emojis from app.js correctly (previously failed if they were in inline onclicks etc)
let app = fs.readFileSync('app.js', 'utf8');
app = app.replace(/<span style="font-size:12px;">🔒<\/span>/g, '<span style="font-size:12px; font-weight:700;">[ล็อก]</span>');
app = app.replace(/<span style="font-size:12px; filter:grayscale\(1\); opacity:0.5;">🔒<\/span>/g, '<span style="font-size:12px; opacity:0.5; font-weight:700;">[ปลดล็อก]</span>');

fs.writeFileSync('app.js', app, 'utf8');
fs.writeFileSync('index.html', html, 'utf8');
