const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');
const oldFlex = '<div style="display:flex; align-items:flex-start;">';
const newFlex = '<div style="display:flex; align-items:stretch;">';
html = html.replace(oldFlex, newFlex);
fs.writeFileSync('index.html', html);
console.log('Updated index.html to use align-items:stretch');

// 2. Update module_dungeon.js empty state
let mod = fs.readFileSync('module_dungeon.js', 'utf8');
const oldEmpty = `qList.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-lo);font-size:14px;">ยังไม่มีคิว</div>';`;

const emptySVG = `<svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:12px; opacity:0.3; color:var(--text-lo);"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>`;

const newEmpty = `qList.innerHTML = \`<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; min-height:300px; color:var(--text-lo); font-size:15px; font-weight:600; background:var(--blue-50, #eff6ff); border:2px dashed var(--line); border-radius:12px; margin:16px;">
  ${emptySVG}
  <div style="opacity:0.6;">ยังไม่มีคิวในขณะนี้</div>
</div>\`;`;

mod = mod.replace(oldEmpty, newEmpty);
fs.writeFileSync('module_dungeon.js', mod);
console.log('Updated module_dungeon.js empty state UI');
