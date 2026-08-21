const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add classes to Dungeon Layout
const targetDungeonLayout = '<div style="display: flex; gap: 20px; align-items: flex-start; position: relative;">';
const replacementDungeonLayout = '<div class="dungeon-layout-wrapper">';
html = html.replace(targetDungeonLayout, replacementDungeonLayout);

const targetDungeonSidebar = '<div style="width: 320px; flex-shrink: 0; position: sticky; top: 16px;" class="sidebar">';
const replacementDungeonSidebar = '<div class="sidebar dungeon-sidebar">';
html = html.replace(targetDungeonSidebar, replacementDungeonSidebar);

// 2. Fix Job Grid Auto-fit (already auto-fill 140px, should be fine)
// 3. Fix action-bar inside roster
// already handled via CSS .action-bar flex-direction: column

fs.writeFileSync('index.html', html, 'utf8');
console.log('Patched HTML for responsiveness');
