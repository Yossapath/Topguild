const fs = require('fs');
let html = fs.readFileSync('module_dungeon.js', 'utf8');

// 1. Filter out 'done' queues from the UI
const searchFilter = `const filteredQueues = (dungeonData.queues || []).filter(
          (q) => q.dungeon === currentTab,
        );`;
const replaceFilter = `const filteredQueues = (dungeonData.queues || []).filter(
          (q) => q.dungeon === currentTab && q.status !== 'done'
        );`;

if (html.includes(searchFilter)) {
  html = html.replace(searchFilter, replaceFilter);
  console.log('Updated filteredQueues to hide done items');
} else {
  // Try alternative format due to formatting changes
  const searchFilterAlt = `const filteredQueues = (dungeonData.queues || []).filter(
          (q) => q.dungeon === currentTab
        );`;
  if (html.includes(searchFilterAlt)) {
      html = html.replace(searchFilterAlt, replaceFilter);
      console.log('Updated filteredQueues (alt format)');
  } else {
      // Fallback regex
      html = html.replace(/const filteredQueues = \(dungeonData\.queues \|\| \[\]\)\.filter\([\s\S]*?q\.dungeon === currentTab,?\s*\);/, replaceFilter);
      console.log('Updated filteredQueues via Regex');
  }
}

fs.writeFileSync('module_dungeon.js', html);
