const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace the old single script tag with 4 separate module tags
const oldTag = `<script type="module" src="auth_dungeon.js?v=5.5"></script>`;
const newTags = `<!-- Module: Auth, Login, Shared Utilities -->
  <script type="module" src="module_auth.js?v=6.0"></script>
  <!-- Module: Dungeon (isolated - bug here won't affect other pages) -->
  <script type="module" src="module_dungeon.js?v=6.0"></script>
  <!-- Module: Attendance (isolated) -->
  <script type="module" src="module_attendance.js?v=6.0"></script>
  <!-- Module: Leave (isolated) -->
  <script type="module" src="module_leave.js?v=6.0"></script>`;

if (html.includes(oldTag)) {
  html = html.replace(oldTag, newTags);
  console.log('Replaced old tag OK');
} else {
  // Try with different version
  const match = html.match(/<script type="module" src="auth_dungeon\.js[^"]*"><\/script>/);
  if (match) {
    html = html.replace(match[0], newTags);
    console.log('Replaced old tag (version variant) OK');
  } else {
    console.log('ERROR: Could not find auth_dungeon script tag!');
    process.exit(1);
  }
}

// Also update app.js version
html = html.replace(/app\.js\?v=[\d.]+/g, 'app.js?v=6.0');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated.');
