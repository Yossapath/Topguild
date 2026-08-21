const fs = require('fs');

// --- 1. Modify index.html ---
let html = fs.readFileSync('index.html', 'utf8');

// Replace top bar buttons
// First, delete Data Management
html = html.replace(/<button type="button" class="btn-config-toggle btn-blue-theme" id="btnConfigToggle"[^>]*>จัดการข้อมูล<\/button>/g, '');
html = html.replace(/<button type="button" class="btn-config-toggle" id="btnConfigToggle"[^>]*>📦 จัดการข้อมูล \(Data Management\)<\/button>/g, '');

// Update Logout button to Red
html = html.replace(/id="btnLogout"([^>]*)>ออกจากระบบ<\/button>/g, 'id="btnLogout"$1 class="btn-secondary btn-red-theme">ออกจากระบบ</button>');
// And remove btn-blue-theme from it if it's there
html = html.replace(/class="btn-secondary btn-blue-theme" id="btnLogout"/g, 'class="btn-red-theme" id="btnLogout"');

// Replace Emojis in main buttons
html = html.replace(/🔍 พิมพ์ชื่อตัวละคร \/ ชื่อตัวเอง เพื่อค้นหาทีม\.\.\./g, 'พิมพ์ชื่อตัวละคร / ชื่อตัวเอง เพื่อค้นหาทีม...');
html = html.replace(/🔍 ค้นหา/g, 'ค้นหา');
html = html.replace(/🗑️ ล้างทีมทั้งหมด/g, 'ล้างทีมทั้งหมด');
html = html.replace(/➕ เพิ่มทีม \(5 คน\)/g, 'เพิ่มทีม (5 คน)');
html = html.replace(/⚔️ จองคิวดันเจี้ยน/g, 'จองคิวดันเจี้ยน');
html = html.replace(/📋 รายชื่อสมาชิก/g, '📋 รายชื่อสมาชิก'); // User said keep header emojis
html = html.replace(/🛡️ สนามหลัก-สนามรอง/g, '🛡️ สนามหลัก-สนามรอง');
html = html.replace(/📅 เช็คชื่อวอ/g, '📅 เช็คชื่อวอ');
html = html.replace(/📝 แจ้งลาวอ/g, '📝 แจ้งลาวอ');
html = html.replace(/📦 จัดการข้อมูล/g, '📦 จัดการข้อมูล'); // For the tabSettings if it exists

// Add btn-red-theme to CSS in index.html
const cssTarget = `/* Ensure dark mode works without breaking buttons */`;
const cssInject = `
.btn-red-theme {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-family: var(--font-display, 'Prompt', sans-serif) !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  text-decoration: none !important;
  background: #ef4444 !important;
  color: #ffffff !important;
  border: 1px solid #dc2626 !important;
  box-shadow: none !important;
}
.btn-red-theme:hover {
  background: #dc2626 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25) !important;
}

.btn-blue-theme.active-mode {
  background: #1e3a8a !important; /* Darker blue for active */
  border-color: #1e3a8a !important;
  color: #ffffff !important;
  box-shadow: inset 0 3px 6px rgba(0,0,0,0.2) !important;
}
.btn-blue-theme-outline.active-mode {
  background: var(--blue-500, #3b82f6) !important;
  color: #ffffff !important;
  border-color: var(--blue-600, #2563eb) !important;
}

[data-theme="dark"] .btn-blue-theme.active-mode {
  background: #93c5fd !important;
  color: #1e3a8a !important;
}
[data-theme="dark"] .btn-blue-theme-outline.active-mode {
  background: var(--blue-500) !important;
  color: #ffffff !important;
}
`;
if (html.includes(cssTarget) && !html.includes('.btn-red-theme')) {
  html = html.replace(cssTarget, cssInject + '\n' + cssTarget);
}

// Ensure the #authWrap exactly matches the user's new request image layout
const startAuth = html.indexOf('<div id="authWrap"');
const endAuth = html.indexOf('<!-- MAIN APP WRAPPER -->');
const newAuthHtml = `<div id="authWrap" style="display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; background: #f4f7fb; z-index: 10000; overflow: hidden; box-sizing: border-box; font-family: var(--font-display, 'Prompt', sans-serif);">
  
  <div style="display: flex; flex-direction: row; width: 100%; max-width: 900px; padding: 20px; gap: 60px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
    
    <!-- Left Branding -->
    <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: center;">
      <!-- Logo Icon (Blue square with layers) -->
      <div style="width: 60px; height: 60px; background: #2563eb; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>
      </div>
      <h1 style="margin: 0; font-size: 52px; font-weight: 900; color: #0f172a; line-height: 1; letter-spacing: -1.5px; text-transform: uppercase;">TOPGUILD</h1>
      <h2 style="margin: 4px 0 16px 0; font-size: 32px; font-weight: 900; color: #2563eb; line-height: 1.1; letter-spacing: -1px; text-transform: uppercase;">RAGNAROK<br>THE NEW WORLD</h2>
      <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">GUILD DATA MANAGEMENT SYSTEM</p>
    </div>

    <!-- Right Login Card -->
    <div style="flex: 1; min-width: 320px; max-width: 380px;">
      <div style="background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border-top: 4px solid #2563eb; position: relative;">
        
        <h3 style="margin: 0 0 32px 0; font-size: 24px; font-weight: 900; color: #0f172a; font-style: italic; letter-spacing: -1px;">LOGIN</h3>

        <!-- Login Form -->
        <form id="loginForm" onsubmit="event.preventDefault(); handleLogin();">
          <div class="form-group" style="margin-bottom: 24px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">User</label>
            <div style="position: relative; display: flex; align-items: center;">
              <div style="position: absolute; left: 14px; display: flex; align-items: center; justify-content: center;">
                <svg color="#94a3b8" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <input type="text" id="loginUsername" style="width: 100%; padding: 14px 16px 14px 42px; border: none; border-radius: 8px; font-size: 14px; color: #0f172a; background: #eff6ff; outline: none; font-weight: 600;" placeholder="ชื่อตัวละครของคุณ" required>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 32px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Password</label>
            <div style="position: relative; display: flex; align-items: center;">
              <div style="position: absolute; left: 14px; display: flex; align-items: center; justify-content: center;">
                <svg color="#94a3b8" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input type="password" id="loginPassword" style="width: 100%; padding: 14px 16px 14px 42px; border: none; border-radius: 8px; font-size: 14px; color: #0f172a; background: #eff6ff; outline: none; font-weight: 800;" placeholder="••••••••" required>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #2563eb; font-size: 11px; font-weight: 700;">
              <a href="#" onclick="toggleAuthMode('register'); return false;" style="color: #2563eb; text-decoration: none;">สมัครสมาชิกใหม่</a>
            </div>
          </div>

          <button type="submit" id="btnLoginSubmit" style="width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
            <span>LOGIN ➔</span>
          </button>
        </form>

        <!-- Register Form -->
        <form id="registerForm" style="display: none;" onsubmit="event.preventDefault(); handleRegister();">
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">User</label>
            <input type="text" id="regUsername" style="width: 100%; padding: 14px 16px; border: none; border-radius: 8px; font-size: 14px; color: #0f172a; background: #eff6ff; outline: none; font-weight: 600;" placeholder="ชื่อตัวละครของคุณ" required>
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Class (อาชีพ)</label>
            <select id="regJob" style="width: 100%; padding: 14px 16px; border: none; border-radius: 8px; font-size: 14px; color: #0f172a; background: #eff6ff; outline: none; font-weight: 600;" required>
              <option value="" disabled selected>-- เลือกอาชีพ --</option>
              <option value="Lord Knight">Lord Knight</option>
              <option value="Paladin">Paladin</option>
              <option value="High Wizard">High Wizard</option>
              <option value="Sniper">Sniper</option>
              <option value="Priest">Priest</option>
              <option value="Champion">Champion</option>
              <option value="Assassin Cross">Assassin Cross</option>
              <option value="Mastersmith">Mastersmith</option>
              <option value="Gunslinger">Gunslinger</option>
              <option value="Druid">Druid</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 24px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Password</label>
            <input type="password" id="regPassword" style="width: 100%; padding: 14px 16px; border: none; border-radius: 8px; font-size: 14px; color: #0f172a; background: #eff6ff; outline: none; font-weight: 800;" placeholder="รหัสผ่าน" required>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #2563eb; font-size: 11px; font-weight: 700;">
              <a href="#" onclick="toggleAuthMode('login'); return false;" style="color: #2563eb; text-decoration: none;">กลับไปหน้าเข้าสู่ระบบ</a>
            </div>
          </div>

          <button type="submit" id="btnRegSubmit" style="width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
            <span>REGISTER ➔</span>
          </button>
        </form>

      </div>
    </div>

  </div>
</div>
`;

if (startAuth !== -1 && endAuth > startAuth) {
  html = html.substring(0, startAuth) + newAuthHtml + html.substring(endAuth);
}
fs.writeFileSync('index.html', html, 'utf8');

// --- 2. Remove Emojis from Javascript Logic (app.js / auth_dungeon.js) ---
let appCode = fs.readFileSync('app.js', 'utf8');

// Emojis from auto optimize modal/buttons
appCode = appCode.replace(/⚡ ออโต้จัดทีม/g, 'ออโต้จัดทีม');
appCode = appCode.replace(/⚡ จัดทีมแบบสมดุล/g, 'จัดทีมแบบสมดุล');
appCode = appCode.replace(/🔒/g, ''); // Lock emoji might be inside button logic
// Let's replace lock HTML logic
appCode = appCode.replace(/<span style="font-size:12px;">🔒<\/span>/g, '<span style="font-size:12px;">[ล็อก]</span>');
appCode = appCode.replace(/<span style="font-size:12px; filter:grayscale\\(1\\); opacity:0.5;">🔒<\/span>/g, '<span style="font-size:12px; opacity:0.5;">[ปลดล็อก]</span>');

// Update active states for toggles in app.js
const themeToggleTarget = `document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('guild_app_theme', theme);
    const btn = document.getElementById('btnThemeToggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? 'ธีมสว่าง' : 'ธีมมืด';
    }`;
const themeToggleReplace = `document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('guild_app_theme', theme);
    const btn = document.getElementById('btnThemeToggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? 'ธีมสว่าง' : 'ธีมมืด';
      if (theme === 'dark') {
        btn.classList.add('active-mode');
      } else {
        btn.classList.remove('active-mode');
      }
    }`;

if (appCode.includes(themeToggleTarget)) {
  appCode = appCode.replace(themeToggleTarget, themeToggleReplace);
}

const styleToggleTarget = `document.documentElement.setAttribute('data-job-style', style);
    localStorage.setItem('guild_job_style', style);
    const bSolid = document.getElementById('btnStyleSolid');
    const bOutline = document.getElementById('btnStyleOutline');`;
    
const styleToggleReplace = `document.documentElement.setAttribute('data-job-style', style);
    localStorage.setItem('guild_job_style', style);
    const bSolid = document.getElementById('btnStyleSolid');
    const bOutline = document.getElementById('btnStyleOutline');
    if (bSolid) bSolid.classList.toggle('active-mode', style === 'solid');
    if (bOutline) bOutline.classList.toggle('active-mode', style === 'outline');`;
    
if (appCode.includes(styleToggleTarget)) {
  appCode = appCode.replace(styleToggleTarget, styleToggleReplace);
}

fs.writeFileSync('app.js', appCode, 'utf8');

// --- 3. auth_dungeon.js inline scripts ---
let authCode = fs.readFileSync('auth_dungeon.js', 'utf8');
// Replace dungeon emojis if any
authCode = authCode.replace(/🗑️ ล้างทีม/g, 'ล้างทีม');
authCode = authCode.replace(/➕ เพิ่มคน/g, 'เพิ่มคน');
authCode = authCode.replace(/➕/g, '+'); // Catch any stray +
fs.writeFileSync('auth_dungeon.js', authCode, 'utf8');

console.log('Applied exact login design, removed emojis, unified colors, added active states');
