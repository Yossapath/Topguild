const fs = require('fs');

// --- 1. Modify index.html ---
let html = fs.readFileSync('index.html', 'utf8');

const startAuth = html.indexOf('<div id="authWrap"');
const endAuth = html.indexOf('<!-- MAIN APP WRAPPER -->');

const newAuthHtml = `<div id="authWrap" style="display: grid; place-items: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; background: linear-gradient(135deg, #0f172a, #1e293b); z-index: 10000; overflow: hidden; padding: 20px; box-sizing: border-box; font-family: var(--font-display, 'Prompt', sans-serif);">
  <!-- Decorative background elements -->
  <div style="position: absolute; top: -150px; right: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; pointer-events: none;"></div>
  <div style="position: absolute; bottom: -100px; left: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; pointer-events: none;"></div>

  <div style="background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); width: 100%; max-width: 400px; margin: 0 auto; position: relative; z-index: 1;">
    
    <div style="text-align: center; margin-bottom: 32px;">
      <h2 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1px; background: linear-gradient(90deg, #1e40af, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">TopGuild</h2>
      <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">Ragnarok The New world</p>
    </div>

    <!-- Login Form -->
    <form id="loginForm" onsubmit="event.preventDefault(); handleLogin();">
      <div class="form-group" style="margin-bottom: 20px;">
        <label style="font-weight: 700; color: #334155; margin-bottom: 8px; display: block; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Username Game</label>
        <input type="text" id="loginUsername" style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; color: #0f172a; transition: all 0.2s; outline: none; background: #f8fafc;" placeholder="ชื่อตัวละครของคุณ" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#ffffff';" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';" required>
      </div>
      <div class="form-group" style="margin-bottom: 28px;">
        <label style="font-weight: 700; color: #334155; margin-bottom: 8px; display: block; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Password</label>
        <input type="password" id="loginPassword" style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; color: #0f172a; transition: all 0.2s; outline: none; background: #f8fafc;" placeholder="รหัสผ่าน" onfocus="this.style.borderColor='#3b82f6'; this.style.background='#ffffff';" onblur="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';" required>
      </div>
      <button type="submit" id="btnLoginSubmit" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.3); display: flex; justify-content: center; align-items: center; gap: 8px;">
        <span>เข้าสู่ระบบ</span>
      </button>
      <div style="text-align: center; margin-top: 24px; font-size: 14px; color: #64748b;">
        ยังไม่มีบัญชีใช่หรือไม่? <a href="#" onclick="toggleAuthMode('register'); return false;" style="color: #2563eb; font-weight: 700; text-decoration: none;">สมัครสมาชิก</a>
      </div>
    </form>

    <!-- Register Form (Hidden by default) -->
    <form id="registerForm" style="display: none;" onsubmit="event.preventDefault(); handleRegister();">
      <div class="form-group" style="margin-bottom: 16px;">
        <label style="font-weight: 700; color: #334155; margin-bottom: 8px; display: block; font-size: 13px; text-transform: uppercase;">Username Game</label>
        <input type="text" id="regUsername" style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; color: #0f172a; background: #f8fafc; outline: none;" placeholder="ชื่อตัวละครของคุณ" required>
      </div>
      <div class="form-group" style="margin-bottom: 16px;">
        <label style="font-weight: 700; color: #334155; margin-bottom: 8px; display: block; font-size: 13px; text-transform: uppercase;">Class (อาชีพ)</label>
        <select id="regJob" style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; color: #0f172a; background: #f8fafc; outline: none;" required>
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
        <label style="font-weight: 700; color: #334155; margin-bottom: 8px; display: block; font-size: 13px; text-transform: uppercase;">Password</label>
        <input type="password" id="regPassword" style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; color: #0f172a; background: #f8fafc; outline: none;" placeholder="รหัสผ่าน" required>
      </div>
      <button type="submit" id="btnRegSubmit" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #059669, #047857); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(5,150,105,0.3); display: flex; justify-content: center; align-items: center; gap: 8px;">
        <span>สมัครสมาชิกใหม่</span>
      </button>
      <div style="text-align: center; margin-top: 24px; font-size: 14px; color: #64748b;">
        มีบัญชีอยู่แล้ว? <a href="#" onclick="toggleAuthMode('login'); return false;" style="color: #2563eb; font-weight: 700; text-decoration: none;">เข้าสู่ระบบ</a>
      </div>
    </form>
  </div>
</div>
`;

if (startAuth !== -1 && endAuth > startAuth) {
  html = html.substring(0, startAuth) + newAuthHtml + html.substring(endAuth);
}

// Change Manage Users button color to Blue
html = html.replace('id="btnAdminUsers" onclick="openAdminUsersSidebar()" style="display: none; background: #8b5cf6;"', 'id="btnAdminUsers" onclick="openAdminUsersSidebar()" style="display: none; background: #3b82f6;"');

fs.writeFileSync('index.html', html, 'utf8');

// --- 2. Modify auth_dungeon.js ---
let authCode = fs.readFileSync('auth_dungeon.js', 'utf8');

const loginTarget = `    const setBtnState = (isLoading) => {
      if (loginBtn) {
        loginBtn.disabled = isLoading;
        loginBtn.innerText = isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ';
        loginBtn.style.opacity = isLoading ? '0.7' : '1';
      }
    };`;
    
const loginReplace = `    const setBtnState = (isLoading) => {
      const btn = document.getElementById('btnLoginSubmit');
      if (btn) {
        btn.disabled = isLoading;
        btn.style.opacity = isLoading ? '0.7' : '1';
        btn.innerHTML = isLoading 
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> <span>กำลังเข้าสู่ระบบ...</span>' 
          : '<span>เข้าสู่ระบบ</span>';
      }
    };`;

if (authCode.includes(loginTarget)) {
  authCode = authCode.replace(loginTarget, loginReplace);
}

const regTargetFull = `window.handleRegister = async function() {
    const u = document.getElementById('regUsername').value.trim();
    const j = document.getElementById('regJob').value;
    const p = document.getElementById('regPassword').value;
    
    if (!u || !j || !p) return window.showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
    if (!window.db) return window.showToast("ยังไม่ได้เชื่อมต่อฐานข้อมูล", "warning");
  
    const uLower = u.toLowerCase();
    try {
      const userRef = doc(window.db, 'users', uLower);`;
      
const regReplaceFull = `window.handleRegister = async function() {
    const u = document.getElementById('regUsername').value.trim();
    const j = document.getElementById('regJob').value;
    const p = document.getElementById('regPassword').value;
    
    if (!u || !j || !p) return window.showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
    if (!window.db) return window.showToast("ยังไม่ได้เชื่อมต่อฐานข้อมูล", "warning");
  
    const btn = document.getElementById('btnRegSubmit');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> <span>กำลังสมัครสมาชิก...</span>';
    }

    const resetBtn = () => {
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.innerHTML = '<span>สมัครสมาชิกใหม่</span>';
      }
    };

    const uLower = u.toLowerCase();
    try {
      const userRef = doc(window.db, 'users', uLower);`;
      
if (authCode.includes(regTargetFull)) {
  authCode = authCode.replace(regTargetFull, regReplaceFull);
}

const regSuccessTarget = `window.showToast("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ", "success");
        toggleAuthMode('login');`;
const regSuccessReplace = `window.showToast("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ", "success");
        resetBtn();
        toggleAuthMode('login');`;
      
if (authCode.includes(regSuccessTarget)) {
  authCode = authCode.replace(regSuccessTarget, regSuccessReplace);
}

const regErrorTarget = `      console.error(err);
      window.showToast("เกิดข้อผิดพลาดในการสมัคร", "error");
    }
  };`;
const regErrorReplace = `      console.error(err);
      resetBtn();
      window.showToast("เกิดข้อผิดพลาดในการสมัคร", "error");
    }
  };`;
  
if (authCode.includes(regErrorTarget)) {
  authCode = authCode.replace(regErrorTarget, regErrorReplace);
}

const logoutTarget = `window.handleLogout = function() {
    window.currentUser = null;
    localStorage.removeItem('guild_current_user');
    showAuthUI();
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
  };`;

const logoutReplace = `window.handleLogout = function() {
    const btn = document.getElementById('btnLogout');
    if (btn) {
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> <span>กำลังออกจากระบบ...</span>';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    }
    setTimeout(() => {
      window.currentUser = null;
      localStorage.removeItem('guild_current_user');
      window.location.reload();
    }, 600);
  };`;
  
if (authCode.includes(logoutTarget)) {
  authCode = authCode.replace(logoutTarget, logoutReplace);
}

if (!authCode.includes('@keyframes spin')) {
  authCode += `\n\nconst style = document.createElement('style');
style.textContent = \`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
\`;
document.head.appendChild(style);\n`;
}

fs.writeFileSync('auth_dungeon.js', authCode, 'utf8');
console.log('Done');
