const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s1 = '<div id="authWrap" style="display: grid; place-items: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; background: linear-gradient(135deg, #e3f2fd, #bbdefb); z-index: 10000; overflow: hidden; padding: 20px; box-sizing: border-box;">';

const r1 = `<script>
  if (localStorage.getItem('guild_current_user')) {
    document.write('<style>#authWrap { display: none !important; } #appWrap { display: block !important; }</style>');
  }
</script>
<div id="authWrap" style="display: grid; place-items: center; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; background: linear-gradient(135deg, #e3f2fd, #bbdefb); z-index: 10000; overflow: hidden; padding: 20px; box-sizing: border-box;">`;

html = html.replace(s1, r1);

fs.writeFileSync('index.html', html, 'utf8');
console.log('flicker fixed');
