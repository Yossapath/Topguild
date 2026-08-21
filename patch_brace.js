const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const regex = /function setJobStyle\(style\) \{[\s\S]*?\}\s*\}\s*\n\s*function openAutoMatchModal/;

const newStr = `function setJobStyle(style) {
      document.documentElement.setAttribute('data-job-style', style);
      localStorage.setItem('guild_job_style', style);
      var bSolid = document.getElementById('btnStyleSolid');
      var bOutline = document.getElementById('btnStyleOutline');
      if (bSolid && bOutline) {
        bSolid.style = ""; bOutline.style = "";
        if (style === 'outline') {
          bOutline.classList.add('active');
          bSolid.classList.remove('active');
        } else {
          bSolid.classList.add('active');
          bOutline.classList.remove('active');
        }
      }
    }

    function openAutoMatchModal`;

html = html.replace(regex, newStr);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed extra brace');
