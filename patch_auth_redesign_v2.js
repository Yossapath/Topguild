const fs = require('fs');

// --- 1. Modify index.html ---
let html = fs.readFileSync('index.html', 'utf8');

// Replace Auth UI to match the image (side-by-side, clean white/blue)
const startAuth = html.indexOf('<div id="authWrap"');
const endAuth = html.indexOf('<!-- MAIN APP WRAPPER -->');

const newAuthHtml = `<div id="authWrap" style="display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; background: #f4f7fb; z-index: 10000; overflow: hidden; box-sizing: border-box; font-family: var(--font-display, 'Prompt', sans-serif);">
  
  <div style="display: flex; flex-direction: row; width: 100%; max-width: 1000px; padding: 20px; gap: 60px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
    
    <!-- Left Branding -->
    <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; justify-content: center;">
      <!-- Placeholder Logo Icon -->
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #1d4ed8, #3b82f6); border-radius: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 25px rgba(37,99,235,0.3);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <h1 style="margin: 0; font-size: 56px; font-weight: 900; color: #0f172a; line-height: 1.1; letter-spacing: -1.5px; text-transform: uppercase;">TopGuild</h1>
      <h2 style="margin: 4px 0 16px 0; font-size: 36px; font-weight: 900; color: #1d4ed8; line-height: 1.1; letter-spacing: -1px; text-transform: uppercase;">Ragnarok<br>The New World</h2>
      <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Guild Data Management System</p>
    </div>

    <!-- Right Login Card -->
    <div style="flex: 1; min-width: 320px; max-width: 400px;">
      <div style="background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border-top: 4px solid #1d4ed8; position: relative;">
        
        <h3 style="margin: 0 0 32px 0; font-size: 24px; font-weight: 900; color: #0f172a; font-style: italic; letter-spacing: -0.5px;">LOGIN</h3>

        <!-- Login Form -->
        <form id="loginForm" onsubmit="event.preventDefault(); handleLogin();">
          <div class="form-group" style="margin-bottom: 24px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">User</label>
            <div style="position: relative;">
              <svg style="position: absolute; left: 12px; top: 14px; color: #94a3b8;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <input type="text" id="loginUsername" style="width: 100%; padding: 12px 16px 12px 40px; border: 1.5px solid #f1f5f9; border-radius: 8px; font-size: 14px; color: #0f172a; background: #f8fafc; outline: none; font-weight: 500; transition: all 0.2s;" placeholder="ชื่อตัวละครของคุณ" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#ffffff';" onblur="this.style.borderColor='#f1f5f9'; this.style.background='#f8fafc';" required>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 28px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Password</label>
            <div style="position: relative;">
              <svg style="position: absolute; left: 12px; top: 14px; color: #94a3b8;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <input type="password" id="loginPassword" style="width: 100%; padding: 12px 16px 12px 40px; border: 1.5px solid #f1f5f9; border-radius: 8px; font-size: 14px; color: #0f172a; background: #f8fafc; outline: none; font-weight: 500; transition: all 0.2s;" placeholder="••••••••" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#ffffff';" onblur="this.style.borderColor='#f1f5f9'; this.style.background='#f8fafc';" required>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              <a href="#" onclick="toggleAuthMode('register'); return false;" style="color: #2563eb; text-decoration: none;">สมัครสมาชิกใหม่</a>
            </div>
          </div>

          <button type="submit" id="btnLoginSubmit" style="width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.25); display: flex; justify-content: center; align-items: center; gap: 8px;">
            <span>LOGIN ➔</span>
          </button>
        </form>

        <!-- Register Form -->
        <form id="registerForm" style="display: none;" onsubmit="event.preventDefault(); handleRegister();">
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">User</label>
            <input type="text" id="regUsername" style="width: 100%; padding: 12px 16px; border: 1.5px solid #f1f5f9; border-radius: 8px; font-size: 14px; color: #0f172a; background: #f8fafc; outline: none; font-weight: 500;" placeholder="ชื่อตัวละครของคุณ" required>
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Class (อาชีพ)</label>
            <select id="regJob" style="width: 100%; padding: 12px 16px; border: 1.5px solid #f1f5f9; border-radius: 8px; font-size: 14px; color: #0f172a; background: #f8fafc; outline: none; font-weight: 500;" required>
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
          <div class="form-group" style="margin-bottom: 28px;">
            <label style="font-weight: 800; color: #64748b; margin-bottom: 8px; display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Password</label>
            <input type="password" id="regPassword" style="width: 100%; padding: 12px 16px; border: 1.5px solid #f1f5f9; border-radius: 8px; font-size: 14px; color: #0f172a; background: #f8fafc; outline: none; font-weight: 500;" placeholder="รหัสผ่าน" required>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              <a href="#" onclick="toggleAuthMode('login'); return false;" style="color: #2563eb; text-decoration: none;">กลับไปหน้าเข้าสู่ระบบ</a>
            </div>
          </div>

          <button type="submit" id="btnRegSubmit" style="width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.25); display: flex; justify-content: center; align-items: center; gap: 8px;">
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

// Strip emojis from the top bar buttons and standardize style
// "👥 จัดการผู้ใช้" -> "จัดการผู้ใช้"
html = html.replace(
  /<button type="button" class="btn-config-toggle" id="btnAdminUsers"([^>]*)>\s*👥 จัดการผู้ใช้\s*<\/button>/g,
  '<button type="button" class="btn-config-toggle btn-blue-theme" id="btnAdminUsers"$1>จัดการผู้ใช้</button>'
);
html = html.replace(
  /<button type="button" class="btn-config-toggle" id="btnConfigToggle"([^>]*)>\s*📦 จัดการข้อมูล \(Data Management\)\s*<\/button>/g,
  '<button type="button" class="btn-config-toggle btn-blue-theme" id="btnConfigToggle"$1>จัดการข้อมูล</button>'
);
html = html.replace(
  /<button type="button" id="btnStyleSolid"([^>]*)>🎨 สีพื้นหลัง<\/button>/g,
  '<button type="button" class="btn-blue-theme-outline" id="btnStyleSolid"$1>สีพื้นหลัง</button>'
);
html = html.replace(
  /<button type="button" id="btnStyleOutline"([^>]*)>✏️ สีตัวหนังสือ<\/button>/g,
  '<button type="button" class="btn-blue-theme-outline" id="btnStyleOutline"$1>สีตัวหนังสือ</button>'
);
html = html.replace(
  /<button type="button" class="btn-secondary" id="btnThemeToggle"([^>]*)>🌙 ธีมมืด<\/button>/g,
  '<button type="button" class="btn-secondary btn-blue-theme" id="btnThemeToggle"$1>ธีมมืด</button>'
);
html = html.replace(
  /<button type="button" class="btn-secondary" id="btnThemeToggle"([^>]*)>☀️ ธีมสว่าง<\/button>/g,
  '<button type="button" class="btn-secondary btn-blue-theme" id="btnThemeToggle"$1>ธีมสว่าง</button>'
);
html = html.replace(
  /<button type="button" class="btn-secondary" id="btnOpenGuideModal"([^>]*)>💡 คู่มือการใช้งาน<\/button>/g,
  '<button type="button" class="btn-secondary btn-blue-theme" id="btnOpenGuideModal"$1>คู่มือ</button>'
);
html = html.replace(
  /<button type="button" class="btn-secondary" id="btnLogout"([^>]*)>🚪 ออกจากระบบ<\/button>/g,
  '<button type="button" class="btn-secondary btn-blue-theme" id="btnLogout"$1>ออกจากระบบ</button>'
);

// Inject standard blue theme CSS for these buttons
const cssTarget = `/* Header */`;
const cssInject = `
.btn-blue-theme, .btn-blue-theme-outline {
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
  box-shadow: none !important;
}

.btn-blue-theme {
  background: var(--blue-500, #3b82f6) !important;
  color: #ffffff !important;
  border: 1px solid var(--blue-600, #2563eb) !important;
}

.btn-blue-theme:hover {
  background: var(--blue-600, #2563eb) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25) !important;
}

.btn-blue-theme-outline {
  background: transparent !important;
  color: var(--blue-600, #2563eb) !important;
  border: 1.5px solid var(--blue-500, #3b82f6) !important;
}

.btn-blue-theme-outline:hover {
  background: rgba(59, 130, 246, 0.1) !important;
}

/* Ensure dark mode works without breaking buttons */
[data-theme="dark"] .btn-blue-theme {
  background: var(--blue-600, #2563eb) !important;
  color: #ffffff !important;
  border-color: var(--blue-700, #1d4ed8) !important;
}
[data-theme="dark"] .btn-blue-theme-outline {
  color: var(--blue-400, #60a5fa) !important;
  border-color: var(--blue-500, #3b82f6) !important;
}

/* Header */`;

if (html.includes(cssTarget) && !html.includes('.btn-blue-theme')) {
  html = html.replace(cssTarget, cssInject);
}

// Remove inline styles from these buttons to let the class take over
html = html.replace(/style="display: none; background: #3b82f6;"/g, 'style="display: none;"');
html = html.replace(/style="border:none; border-radius:18px; padding: 5px 12px; font-weight:700; font-size:12.5px; cursor:pointer; background:var\(--blue-700\); color:#ffffff; transition: all 0.15s ease;"/g, '');
html = html.replace(/style="border:none; border-radius:18px; padding: 5px 12px; font-weight:700; font-size:12.5px; cursor:pointer; background:transparent; color:var\(--text-lo\); transition: all 0.15s ease;"/g, '');
html = html.replace(/style="border-color: var\(--blue-500\); color: var\(--blue-700\); font-weight: 700; font-size: 12.5px; padding: 6px 16px; border-radius: 20px; display: flex; align-items: center; gap: 6px; background: rgba\(47,143,214,0.08\); box-shadow: 0 2px 6px rgba\(47,143,214,0.15\);"/g, '');
html = html.replace(/style="border-color: var\(--danger\); color: var\(--danger\); font-weight: 700; font-size: 12.5px; padding: 6px 16px; border-radius: 20px; display: flex; align-items: center; gap: 6px; background: var\(--danger-light\); box-shadow: 0 2px 6px rgba\(224,67,44,0.15\);"/g, '');


fs.writeFileSync('index.html', html, 'utf8');

// --- 2. Remove emoji logic in app.js / index.html inline script ---
let html2 = fs.readFileSync('index.html', 'utf8');
html2 = html2.replace(
  /btn\.innerHTML = theme === 'dark' \? '☀️ ธีมสว่าง' : '🌙 ธีมมืด';/g,
  "btn.innerHTML = theme === 'dark' ? 'ธีมสว่าง' : 'ธีมมืด';"
);
fs.writeFileSync('index.html', html2, 'utf8');

// Update auth_dungeon.js loading state text (remove old SVG text if needed, since we changed buttons to `LOGIN ➔`)
let authCode = fs.readFileSync('auth_dungeon.js', 'utf8');
const loginReplaceRegex = /<span>กำลังเข้าสู่ระบบ...<\/span>' \s*: '<span>เข้าสู่ระบบ<\/span>'/g;
authCode = authCode.replace(loginReplaceRegex, "<span>กำลังเข้าสู่ระบบ...</span>' : '<span>LOGIN ➔</span>'");

const regReplaceRegex = /<span>กำลังสมัครสมาชิก...<\/span>' \s*: '<span>สมัครสมาชิกใหม่<\/span>'/g;
authCode = authCode.replace(regReplaceRegex, "<span>กำลังสมัครสมาชิก...</span>' : '<span>REGISTER ➔</span>'");

fs.writeFileSync('auth_dungeon.js', authCode, 'utf8');

console.log('Done redesigning auth UI, cleaning buttons, applying blue theme');
