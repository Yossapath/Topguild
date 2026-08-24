const fs = require('fs');

const modalHtml = `
  <!-- Custom UI Modal -->
  <div id="ui-modal-overlay" class="modal-overlay" style="display: none; z-index: 99999; justify-content: center; align-items: center; background: rgba(0,0,0,0.6); position: fixed; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(2px);">
    <div class="modal-content" style="background: var(--surface); padding: 24px; border-radius: 16px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: fade-in 0.2s ease-out;">
      <h3 id="ui-modal-title" style="margin-top: 0; color: var(--text-hi); font-family: var(--font-display); font-size: 18px;"></h3>
      <p id="ui-modal-message" style="color: var(--text-lo); font-size: 14px; margin-bottom: 24px; line-height: 1.6;"></p>
      
      <input type="text" id="ui-modal-input" class="form-control" style="display: none; margin-bottom: 24px; text-align: center;">

      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="ui-modal-btn-cancel" class="btn-secondary" style="display: none; flex: 1; padding: 10px;">ยกเลิก</button>
        <button id="ui-modal-btn-confirm" class="btn-primary" style="flex: 1; padding: 10px;">ตกลง</button>
      </div>
    </div>
  </div>

  <script>
    window.UI = {
      _resolve: null,
      show: function(options) {
        return new Promise(resolve => {
          this._resolve = resolve;
          document.getElementById('ui-modal-title').innerText = options.title || 'แจ้งเตือน';
          document.getElementById('ui-modal-message').innerHTML = (options.message || '').replace(/\\n/g, '<br>');
          
          const input = document.getElementById('ui-modal-input');
          if (options.type === 'prompt') {
            input.style.display = 'block';
            input.value = options.defaultText || '';
          } else {
            input.style.display = 'none';
          }

          const btnCancel = document.getElementById('ui-modal-btn-cancel');
          if (options.type === 'alert') {
            btnCancel.style.display = 'none';
          } else {
            btnCancel.style.display = 'inline-block';
          }

          document.getElementById('ui-modal-overlay').style.display = 'flex';
          
          if (options.type === 'prompt') {
            input.focus();
          }
        });
      },
      close: function(value) {
        document.getElementById('ui-modal-overlay').style.display = 'none';
        if (this._resolve) {
          this._resolve(value);
          this._resolve = null;
        }
      },
      alert: function(message, title = 'แจ้งเตือนระบบ') {
        return this.show({ type: 'alert', message, title });
      },
      confirm: function(message, title = 'ยืนยันการทำรายการ') {
        return this.show({ type: 'confirm', message, title });
      },
      prompt: function(message, defaultText = '', title = 'กรอกข้อมูล') {
        return this.show({ type: 'prompt', message, defaultText, title });
      }
    };

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('ui-modal-btn-cancel').addEventListener('click', () => {
        window.UI.close(document.getElementById('ui-modal-input').style.display === 'block' ? null : false);
      });
      document.getElementById('ui-modal-btn-confirm').addEventListener('click', () => {
        const input = document.getElementById('ui-modal-input');
        if (input.style.display === 'block') {
          window.UI.close(input.value);
        } else {
          window.UI.close(true);
        }
      });
    });
  </script>
</body>`;

let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="ui-modal-overlay"')) {
    html = html.replace('</body>', modalHtml);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Injected UI Modal into index.html');
}
