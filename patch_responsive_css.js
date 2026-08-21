const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const responsiveCSS = `

/* =========================================
   📱 RESPONSIVE & AUTO-FIT (MOBILE VIEW)
   ========================================= */

/* 1. Main Tabs Scrollable on Mobile */
.main-tabs {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  justify-content: flex-start; /* Align left to allow smooth scroll */
}
.main-tabs::-webkit-scrollbar {
  display: none; /* Hide scrollbar for cleaner look */
}

/* 2. Responsive Tables */
.table-container, .card-body {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}

/* 3. Auto-fit Grids */
.teams-grid, #dungeonTeamsArea {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)) !important;
  gap: 16px !important;
  width: 100%;
}

/* 4. Fix Sidebar in Dungeon View */
.dungeon-layout-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
  position: relative;
}
.dungeon-sidebar {
  width: 100%;
  flex-shrink: 0;
  position: relative;
}

@media (min-width: 769px) {
  .dungeon-sidebar {
    width: 320px;
    position: sticky;
    top: 16px;
  }
}

/* 5. Mobile Optimizations (< 768px) */
@media (max-width: 768px) {
  /* Modals */
  .modal-box {
    padding: 16px !important;
    width: 95% !important;
    margin: 10px auto;
  }
  
  /* Inputs inside tight tables */
  .cell-input {
    font-size: 11px !important;
    padding: 8px 4px !important;
  }
  
  /* Power input shrink */
  .cell-input.power-input {
    width: 55px !important;
  }
  
  select.name-input {
    min-width: 80px !important;
  }
  
  /* Dungeon Cards */
  .team-card {
    min-width: 100% !important;
  }
  
  /* Header */
  h1 {
    font-size: 24px !important;
  }
  
  /* Action Bar Wrap */
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .btn-group {
    width: 100%;
    justify-content: stretch;
  }
  .btn-group button {
    flex: 1;
  }
}
`;

if (!css.includes('RESPONSIVE & AUTO-FIT')) {
  css += responsiveCSS;
  fs.writeFileSync('styles.css', css, 'utf8');
  console.log('Appended responsive CSS');
} else {
  console.log('Responsive CSS already exists');
}
