/* Password gate for the whole site.
   Note: this is a client-side gate. It keeps casual visitors out, but the files themselves
   are still publicly reachable by anyone who knows their direct URLs. */
(function () {
  var HASH = '9e498c76bc8b4f678fee731b12bbb38eb652f2b2e2c04b4bf56b8af5c4acfb32'; // SHA-256 of the password
  var KEY = 'minu-site-unlocked';
  var root = document.documentElement;
  var unlocked = false;
  try { unlocked = localStorage.getItem(KEY) === HASH; } catch (e) {}
  if (unlocked) return;

  root.classList.add('gate-locked');
  var css = document.createElement('style');
  css.textContent =
    'html.gate-locked body > *:not(.gate){display:none!important}' +
    'html.gate-locked body{background:#fcfcfc}' +
    '.gate{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:#fcfcfc;z-index:9999}' +
    '.gate form{width:100%;max-width:340px;display:flex;flex-direction:column;gap:18px}' +
    '.gate .k{font:12px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;text-transform:uppercase;letter-spacing:.12em;color:#000}' +
    '.gate h1{margin:0;font-family:"Crimson Pro",Georgia,serif;font-weight:300;font-size:40px;line-height:1.05;letter-spacing:-.03em;color:#1c1c1c}' +
    '.gate h1 em{font-style:italic}' +
    '.gate label{font:12px/1.2 "Azeret Mono",ui-monospace,monospace;text-transform:uppercase;letter-spacing:.02em;color:#6f6f6f}' +
    '.gate input{font:14px "Azeret Mono",ui-monospace,monospace;padding:12px 18px;border:1px solid #000;border-radius:200px;background:transparent;color:#000;outline:none}' +
    '.gate input:focus-visible{outline:1px solid #6c5f7d;outline-offset:3px}' +
    '.gate button{align-self:flex-start;font:12px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;text-transform:uppercase;letter-spacing:.06em;padding:10px 18px;border:1px solid #000;border-radius:200px;background:transparent;color:#000;cursor:pointer}' +
    '.gate button:hover{background:#000;color:#fcfcfc}' +
    '.gate .err{min-height:1.2em;font:12px "Azeret Mono",ui-monospace,monospace;color:#6c5f7d}';
  document.head.appendChild(css);

  // Small SHA-256 so the check works everywhere (including pages opened from disk)
  function sha256(ascii) {
    function r(v, a) { return (v >>> a) | (v << (32 - a)); }
    var mp = Math.pow, max = mp(2, 32), res = '', words = [], bl = ascii.length * 8, h = [], k = [], pc = 0, isC = {};
    for (var c = 2; pc < 64; c++) { if (!isC[c]) { for (var i = 0; i < 313; i += c) isC[i] = c; h[pc] = (mp(c, .5) * max) | 0; k[pc++] = (mp(c, 1 / 3) * max) | 0; } }
    h = h.slice(0, 8);
    ascii = unescape(encodeURIComponent(ascii)); bl = ascii.length * 8;
    ascii += '\x80'; while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) words[i >> 2] |= ascii.charCodeAt(i) << ((3 - i) % 4) * 8;
    words[words.length] = ((bl / max) | 0); words[words.length] = bl;
    for (var j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oh = h; h = h.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = h[0], e = h[4];
        var t1 = h[7] + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & h[5]) ^ (~e & h[6])) + k[i] +
          (w[i] = i < 16 ? w[i] : (w[i - 16] + (r(w15, 7) ^ r(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (r(w2, 17) ^ r(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));
        h = [(t1 + t2) | 0].concat(h); h[4] = (h[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) h[i] = (h[i] + oh[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (h[i] >> (j * 8)) & 255; res += (b < 16 ? '0' : '') + b.toString(16); }
    return res;
  }

  function build() {
    var gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML =
      '<form autocomplete="off">' +
      '<span class="k">Minu Azimi</span>' +
      '<h1>This portfolio is <em>password protected.</em></h1>' +
      '<label for="gate-pw">Password</label>' +
      '<input id="gate-pw" type="password" autocomplete="current-password" autofocus>' +
      '<span class="err" aria-live="polite"></span>' +
      '<button type="submit">Enter</button>' +
      '</form>';
    document.body.appendChild(gate);
    var form = gate.querySelector('form'), input = gate.querySelector('input'), err = gate.querySelector('.err');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sha256(input.value) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch (x) {}
        root.classList.remove('gate-locked');
        gate.remove();
      } else {
        err.textContent = 'That password is incorrect. Try again.';
        input.select();
      }
    });
    input.focus();
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
