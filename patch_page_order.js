const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ===== FIX 1: Remove inline onchange from attendanceDateSelect =====
// The JS already handles onchange via renderAttendanceOptions(), inline causes double-fire
html = html.replace(
  'id="attendanceDateSelect" class="form-control" style="width: auto; min-width: 200px;" onchange="renderAttendanceTable()"',
  'id="attendanceDateSelect" class="form-control" style="width: auto; min-width: 200px;"'
);

// ===== FIX 2: Reorder pages to match tab order =====
// Current order: roster, teams, leave(!), dungeons(!), settings(wrong position), attendance
// Correct order: roster, teams, dungeons, attendance, leave, settings

// Extract each section by id
function extractSection(html, id) {
  // Match <section id="page-xxx" ... > ... </section>
  const startTag = `id="${id}"`;
  const start = html.indexOf(`<section ${startTag}`);
  if (start === -1) return null;
  
  let depth = 0;
  let inSection = false;
  let end = -1;
  for (let i = start; i < html.length - 10; i++) {
    if (html.slice(i, i+8) === '<section') { depth++; inSection = true; }
    if (html.slice(i, i+10) === '</section>') { depth--; if (inSection && depth === 0) { end = i + 10; break; } }
  }
  if (end === -1) return null;
  return { text: html.slice(start, end), start, end };
}

const pageIds = ['page-roster', 'page-teams', 'page-leave', 'page-dungeons', 'page-attendance', 'page-settings'];
const sections = {};

for (const id of pageIds) {
  const result = extractSection(html, id);
  if (result) {
    sections[id] = result.text;
  } else {
    console.warn('Could not extract section:', id);
  }
}

// Remove all page sections from html
for (const id of pageIds) {
  if (sections[id]) {
    html = html.replace(sections[id], `<!-- PLACEHOLDER_${id} -->`);
  }
}

// Re-insert in correct order: roster, teams, dungeons, attendance, leave, settings
const correctOrder = ['page-roster', 'page-teams', 'page-dungeons', 'page-attendance', 'page-leave', 'page-settings'];

// Place them back in order, starting from first placeholder
let firstPlaceholderPos = Infinity;
for (const id of pageIds) {
  const pos = html.indexOf(`<!-- PLACEHOLDER_${id} -->`);
  if (pos !== -1 && pos < firstPlaceholderPos) firstPlaceholderPos = pos;
}

// Remove all placeholders
for (const id of pageIds) {
  html = html.replace(`<!-- PLACEHOLDER_${id} -->`, '');
}

// Insert all sections in correct order at the right place (after nav, before modals)
const insertionPoint = html.indexOf('\n  <!-- MAIN APP WRAPPER') + '\n  <!-- MAIN APP WRAPPER'.length;
// Actually insert before </div><!-- end appWrap -->
const appWrapEnd = html.lastIndexOf('</div>\n\n  <!-- BULK ADD MODAL');

const orderedSections = correctOrder.map(id => sections[id] || '').join('\n\n  ');

if (appWrapEnd !== -1) {
  html = html.slice(0, appWrapEnd) + '\n\n  ' + orderedSections + '\n\n' + html.slice(appWrapEnd);
  console.log('Reordered pages');
} else {
  // fallback: find </div> that closes appWrap
  const navEnd = html.lastIndexOf('</nav>');
  html = html.slice(0, navEnd + 6) + '\n\n  ' + orderedSections + '\n\n' + html.slice(navEnd + 6);
  console.log('Fallback: inserted after </nav>');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done fixing HTML');
