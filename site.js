(function () {
  // Yalda campaign language toggle (Kooch page)
  var buttons = document.querySelectorAll('.toggle button');
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var lang = b.dataset.lang;
      buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('#yalda img[data-en]').forEach(function (img) { img.src = img.dataset[lang]; });
    });
  });

  // Lightbox for any image marked .zoom, with previous/next navigation
  var zoomables = Array.prototype.slice.call(document.querySelectorAll('img.zoom'));
  if (zoomables.length) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Image viewer');
    dlg.tabIndex = -1;
    dlg.innerHTML =
      '<div class="lb-stage"><img alt=""></div>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="Previous image">&#8592;</button>' +
      '<button class="lb-nav lb-next" type="button" aria-label="Next image">&#8594;</button>' +
      '<div class="lb-bar"><span class="mono-label lb-count"></span><button class="btn lb-close" type="button">Close</button></div>';
    document.body.appendChild(dlg);
    var big = dlg.querySelector('.lb-stage img');
    var count = dlg.querySelector('.lb-count');
    var prevBtn = dlg.querySelector('.lb-prev'), nextBtn = dlg.querySelector('.lb-next');
    var index = 0;
    var many = zoomables.length > 1;
    prevBtn.hidden = nextBtn.hidden = !many;
    var show = function (i) {
      index = (i + zoomables.length) % zoomables.length;
      var img = zoomables[index];
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      count.textContent = many ? (index + 1) + ' / ' + zoomables.length : '';
    };
    var open = function (i) {
      show(i);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      dlg.focus();
    };
    var close = function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(index - 1); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(index + 1); });
    dlg.querySelector('.lb-close').addEventListener('click', close);
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.classList.contains('lb-stage')) close();
    });
    dlg.addEventListener('keydown', function (e) {
      if (!many) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });
    // Swipe on touch screens
    var x0 = null;
    dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (x0 === null || !many) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    });
    zoomables.forEach(function (img, i) {
      img.tabIndex = 0;
      img.addEventListener('click', function () { open(i); });
      img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
  }


  // Personal page: scattered layout with per-image parallax (after allierho.com/playground)
  var grid = document.querySelector('.art-grid');
  if (grid) {
    var items = Array.prototype.slice.call(grid.querySelectorAll('.art'));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Seeded random so the layout is the same on every visit
    var seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var pick = function (arr) { return arr[Math.floor(rnd() * arr.length)]; };
    var speeds = [];
    var mode = '';
    var layout = function () {
      var w = window.innerWidth;
      var m = w >= 900 ? 'lg' : (w >= 600 ? 'md' : 'sm');
      if (m === mode) return;
      mode = m; seed = 7; speeds = [];
      if (m === 'sm') {
        // Phones: clean single column, no parallax
        grid.classList.remove('js-scatter'); grid.classList.add('js-stack');
        grid.style.gridTemplateColumns = '';
        items.forEach(function (fig) {
          fig.style.gridRow = fig.style.gridColumn = fig.style.marginTop = fig.style.zIndex = fig.style.transform = '';
          fig.dataset.off = 0; fig.classList.remove('depth-back', 'depth-front');
        });
        return;
      }
      grid.classList.remove('js-stack');
      grid.classList.add('js-scatter');
      var cols = m === 'lg' ? 12 : (m === 'md' ? 8 : 6);
      grid.style.gridTemplateColumns = 'repeat(' + cols + ', minmax(0, 1fr))';
      var row = 1, i = 0;
      while (i < items.length) {
        var perRow = m === 'lg' ? pick([2, 3, 3]) : (m === 'md' ? 2 : 1);
        perRow = Math.min(perRow, items.length - i);
        // split the columns into slots, then place each image somewhere inside its slot
        var slot = Math.floor(cols / perRow);
        for (var k = 0; k < perRow; k++, i++) {
          var fig = items[i];
          var img = fig.querySelector('img');
          var ratio = img.getAttribute('width') / img.getAttribute('height');
          var span;
          if (m === 'sm') span = ratio > 1.1 ? pick([5, 6]) : pick([4, 5]);
          else span = slot >= 6 ? (ratio > 1.2 ? pick([5, 6]) : pick([4, 5])) : (ratio > 1.2 ? slot : pick([3, 4]));
          span = Math.max(m === 'sm' ? 4 : 3, Math.min(slot === 2 ? 2 : span, span));
          var start = k * slot + 1 + Math.floor(rnd() * (slot - span + 1));
          if (m === 'sm') start = (row % 2 ? 1 : cols - span + 1);
          fig.style.gridRow = row;
          fig.style.gridColumn = start + ' / span ' + span;
          fig.style.marginTop = Math.round(rnd() * (m === 'sm' ? 30 : 100)) + 'px';
          speeds[i] = reduce ? 0 : pick(m === 'sm' ? [-0.05, 0, 0.05] : [-0.12, -0.06, 0, 0.06, 0.1]);
          fig.classList.remove('depth-back', 'depth-front');
          fig.style.zIndex = '';
          if (m === 'lg') {
            // Desktop depth: some pieces sit far back (small, slow, behind), some come forward (large, fast, on top)
            var d = rnd();
            if (d < 0.28) {
              var bs = ratio > 1.2 ? 3 : 2;
              fig.style.gridColumn = (k * slot + 1 + Math.floor(rnd() * (slot - bs + 1))) + ' / span ' + bs;
              fig.style.marginTop = Math.round(40 + rnd() * 160) + 'px';
              fig.classList.add('depth-back'); fig.style.zIndex = 1;
              speeds[i] = reduce ? 0 : pick([-0.45, -0.38]);
            } else if (d > 0.78) {
              var fs = Math.min(cols - 1, span + 1);
              var fstart = Math.max(1, Math.min(cols - fs + 1, start - 1 + Math.floor(rnd() * 2)));
              fig.style.gridColumn = fstart + ' / span ' + fs;
              fig.classList.add('depth-front'); fig.style.zIndex = 3;
              speeds[i] = reduce ? 0 : pick([0.22, 0.3]);
            } else {
              fig.style.zIndex = 2;
              speeds[i] = reduce ? 0 : pick([-0.15, -0.05, 0.05, 0.12]);
            }
          }
        }
        row++;
      }
      update();
    };
    var ticking = false;
    var update = function () {
      ticking = false;
      if (mode === 'sm') return;
      var vh = window.innerHeight;
      items.forEach(function (fig, i) {
        var s = speeds[i] || 0;
        if (!s) { fig.style.transform = ''; fig.dataset.off = 0; return; }
        var r = fig.getBoundingClientRect();
        var center = r.top + r.height / 2 - (parseFloat(fig.dataset.off) || 0);
        var off = (center - vh / 2) * s; // linear in scroll position, so each piece keeps one constant speed
        fig.dataset.off = off; fig.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', layout);
    layout();
  }

  // Copy-to-clipboard buttons: <button data-copy="#id">
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      var el = document.querySelector(btn.dataset.copy);
      var text = el.textContent.trim();
      var select = function () {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      };
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label; }, 1600); };
      try { navigator.clipboard.writeText(text).then(done, select); } catch (e) { select(); }
    });
  });
})();
