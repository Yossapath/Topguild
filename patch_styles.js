const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

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
[data-theme="dark"] .btn-blue-theme:hover {
  background: var(--blue-500, #3b82f6) !important;
}
[data-theme="dark"] .btn-blue-theme-outline {
  color: var(--blue-400, #60a5fa) !important;
  border-color: var(--blue-500, #3b82f6) !important;
}
[data-theme="dark"] .btn-blue-theme-outline:hover {
  background: rgba(59, 130, 246, 0.15) !important;
}

/* Header */`;

if (!css.includes('.btn-blue-theme')) {
  css = css.replace('/* Header */', cssInject);
  fs.writeFileSync('styles.css', css, 'utf8');
}
