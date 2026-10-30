(function () {
  'use strict';

  /* ---------- Navbar dính + nút lên đầu trang ---------- */
  var nav = document.getElementById('mainNav');
  var backTop = document.getElementById('backTop');

  function onScroll() {
    var stuck = nav.getBoundingClientRect().top <= 0 && window.scrollY > 0;
    nav.classList.toggle('is-stuck', stuck);
    backTop.classList.toggle('is-visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', function () { window.scrollTo({ top: 0 }); });

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('menu');
  var mobile = window.matchMedia('(max-width: 992px)');

  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('.has-sub > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!mobile.matches) return;
      e.preventDefault();
      a.parentElement.classList.toggle('open');
    });
  });

  /* ---------- Slider tin tức (chỉ có ở trang chủ) ---------- */
  if (document.querySelector('.hero')) initHero();

  function initHero() {
  var DELAY = 3500;
  var slides = document.querySelectorAll('.hero-slide');
  var thumbs = document.querySelectorAll('#heroThumbs button');
  // Chấm tròn chỉ vị trí slide, tạo theo số slide
  var dotsBox = document.getElementById('heroDots');
  slides.forEach(function (s, k) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Tin ' + (k + 1));
    b.addEventListener('click', function () { show(k); });
    dotsBox.appendChild(b);
  });
  var dots = dotsBox.querySelectorAll('button');
  var bar = document.getElementById('heroProgress');
  var hero = document.querySelector('.hero');
  var current = 0;
  var timer = null;
  var hovering = false;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('is-active', k === current); });
    thumbs.forEach(function (t, k) { t.classList.toggle('is-active', k === current); });
    dots.forEach(function (d, k) {
      d.classList.toggle('is-active', k === current);
      d.setAttribute('aria-current', k === current);
    });
    if (hovering) pause(); else restart();
  }

  function restart() {
    clearTimeout(timer);
    bar.style.transition = 'none';
    bar.style.width = '0';
    void bar.offsetWidth;
    bar.style.transition = 'width ' + DELAY + 'ms linear';
    bar.style.width = '100%';
    timer = setTimeout(function () { show(current + 1); }, DELAY);
  }

  function pause() {
    clearTimeout(timer);
    bar.style.transition = 'none';
    bar.style.width = getComputedStyle(bar).width;
  }

  document.getElementById('heroPrev').addEventListener('click', function () { show(current - 1); });
  document.getElementById('heroNext').addEventListener('click', function () { show(current + 1); });
  thumbs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); }); });
  // Rê chuột vào slider thì dừng, kể cả sau khi bấm chuyển tin
  // (chỉ với chuột thật, để chạm trên điện thoại không làm slider đứng luôn)
  hero.addEventListener('pointerenter', function (e) {
    if (e.pointerType !== 'mouse') return;
    hovering = true; pause();
  });
  hero.addEventListener('pointerleave', function (e) {
    if (e.pointerType !== 'mouse') return;
    hovering = false; restart();
  });

  // Vuốt trên điện thoại
  var startX = null;
  hero.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  show(0);
  }

  /* ---------- Form liên hệ (bản demo: không gửi đi đâu) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var msg = document.getElementById('formMsg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var missing = [];
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle('is-invalid', bad);
        if (bad) missing.push(f);
      });
      if (missing.length) {
        msg.className = 'form-msg err';
        msg.textContent = 'Vui lòng điền các mục có dấu *.';
        missing[0].focus();
        return;
      }
      msg.className = 'form-msg ok';
      msg.textContent = 'Cảm ơn bạn! (Bản demo: ý kiến chưa được gửi đi.)';
      form.reset();
    });
  }

  /* ---------- Dự toán khối lượng bê tông nhựa (trang Giới thiệu) ---------- */
  var calc = document.getElementById('calc');
  if (calc) {
    var DENSITY = 2.35;      // tấn/m³, khối lượng thể tích BTN đã lu lèn (giả định chung)
    var LOSS = 1.2;          // hệ số hao hụt đầm lèn
    var TRUCK = 30;          // tấn/chuyến xe ben
    var PLANT = 160;         // tấn/giờ, công suất 1 trạm
    var EMUL = 0.5;          // kg/m² nhũ tương dính bám
    var typeBtns = calc.querySelectorAll('.gt-types button');
    var area = document.getElementById('area');
    var thick = document.getElementById('thick');
    var loss = document.getElementById('loss');
    var emul = document.getElementById('emul');
    var fmt = function (n, d) { return n.toLocaleString('vi-VN', { maximumFractionDigits: d || 0 }); };
    var type = 'BTN C9.5';

    var update = function () {
      var a = +area.value;
      var t = +thick.value;
      var vol = a * t / 100;
      var factor = loss.checked ? LOSS : 1;
      var ton = vol * DENSITY * factor;
      document.getElementById('areaOut').textContent = fmt(a);
      document.getElementById('thickOut').textContent = t + ' cm';
      document.getElementById('resTitle').textContent = type + (loss.checked ? ' (Hao hụt lu lèn 1.20)' : ' (Không tính hao hụt)');
      document.getElementById('resTon').textContent = fmt(Math.round(ton));
      document.getElementById('resTrips').textContent = 'Tương đương khoảng ~' + fmt(Math.ceil(ton / TRUCK)) + ' chuyến xe ben 30T cách nhiệt';
      document.getElementById('resVol').textContent = fmt(vol, 1) + ' m³';
      document.getElementById('resFleet').textContent = ton > 3000 ? '02 Vögele 1800 + 04 Lu Hamm' : '01 Vögele 1800 + 02 Lu Hamm';
      var hours = ton / (ton > 3000 ? PLANT * 2 : PLANT);
      document.getElementById('resTime').textContent = '~ ' + fmt(hours, 1) + ' Giờ liên tục (' + (ton > 3000 ? '2 trạm' : 'Trạm') + ' 160T/h)';
      document.getElementById('emulRow').hidden = !emul.checked;
      document.getElementById('resEmul').textContent = fmt(a * EMUL / 1000, 1) + ' tấn';
    };

    typeBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        typeBtns.forEach(function (x) { x.classList.toggle('is-active', x === b); });
        type = b.dataset.type;
        update();
      });
    });
    [area, thick, loss, emul].forEach(function (el) { el.addEventListener('input', update); });
    update();
  }

  /* ---------- Bộ lọc dự án (trang Giới thiệu) ---------- */
  var prjFilter = document.getElementById('prjFilter');
  if (prjFilter) {
    var prjBtns = prjFilter.querySelectorAll('button');
    var prjs = document.querySelectorAll('.gt-prj');
    prjBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        prjBtns.forEach(function (x) { x.classList.toggle('is-active', x === b); });
        prjs.forEach(function (p) { p.hidden = b.dataset.cat !== 'all' && p.dataset.cat !== b.dataset.cat; });
      });
    });
  }

  /* ---------- Bộ lọc văn bản ---------- */
  var docRows = document.querySelectorAll('#docRows tr');
  if (docRows.length) {
    var search = document.getElementById('docSearch');
    var org = document.getElementById('docOrg');
    var kind = document.getElementById('docKind');
    var count = document.getElementById('docCount');
    var empty = document.getElementById('docEmpty');

    var emptyTimer = null;
    var filterDocs = function (animate) {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      docRows.forEach(function (tr) {
        var ok = (!q || tr.textContent.toLowerCase().indexOf(q) !== -1) &&
          (!org.value || tr.dataset.org === org.value) &&
          (!kind.value || tr.dataset.kind === kind.value);
        if (ok) shown++;
        clearTimeout(tr._t);
        if (!animate) { tr.hidden = !ok; return; }
        if (ok) {
          // Dòng hiện lại thì trồi lên nhẹ
          tr.classList.remove('is-leaving');
          if (tr.hidden) {
            tr.hidden = false;
            tr.classList.remove('is-entering');
            void tr.offsetWidth;
            tr.classList.add('is-entering');
          }
        } else if (!tr.hidden) {
          // Dòng bị lọc đi thì mờ dần rồi mới ẩn
          tr.classList.add('is-leaving');
          tr._t = setTimeout(function () {
            tr.hidden = true;
            tr.classList.remove('is-leaving', 'is-entering');
          }, 180);
        }
      });
      count.textContent = 'Hiển thị ' + shown + ' / ' + docRows.length + ' văn bản';
      clearTimeout(emptyTimer);
      if (shown > 0 || !animate) empty.hidden = shown > 0;
      else emptyTimer = setTimeout(function () { empty.hidden = false; }, 180);
    };
    [search, org, kind].forEach(function (el) { el.addEventListener('input', function () { filterDocs(true); }); });
    filterDocs(false);
  }

  /* ---------- Nút sao chép liên kết bài viết ---------- */
  var copyBtn = document.getElementById('copyLink');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(location.href).then(function () {
        copyBtn.textContent = 'Đã sao chép';
        setTimeout(function () { copyBtn.textContent = 'Sao chép liên kết'; }, 2000);
      });
    });
  }

  /* ---------- Thư viện ảnh cột phải (trang có cột phải) ---------- */
  if (document.getElementById('gallery')) initGallery();

  function initGallery() {
  var gMain = document.getElementById('galleryMain');
  var gThumbs = document.querySelectorAll('#galleryThumbs img');
  var gCurrent = 0;

  function gShow(i) {
    gCurrent = (i + gThumbs.length) % gThumbs.length;
    var next = gThumbs[gCurrent];
    // Mờ dần ảnh cũ rồi mới thay ảnh mới
    gMain.classList.add('is-fading');
    setTimeout(function () {
      gMain.src = next.src;
      gMain.alt = next.alt;
      gMain.classList.remove('is-fading');
    }, 250);
    gThumbs.forEach(function (t, k) { t.classList.toggle('is-active', k === gCurrent); });
    // Cuộn dải ảnh nhỏ theo chiều ngang, không làm trang bị cuộn theo
    var strip = gThumbs[gCurrent].parentElement;
    strip.scrollLeft = gThumbs[gCurrent].offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + gThumbs[gCurrent].offsetWidth / 2;
  }
  gThumbs.forEach(function (t, k) { t.addEventListener('click', function () { gShow(k); }); });
  document.getElementById('gPrev').addEventListener('click', function () { gShow(gCurrent - 1); });
  document.getElementById('gNext').addEventListener('click', function () { gShow(gCurrent + 1); });
  setInterval(function () { gShow(gCurrent + 1); }, 4000);
  }

  /* ---------- Hiệu ứng khi cuộn tới ---------- */
  /* ---------- Thẻ nghiêng 3D theo chuột (chỉ với chuột thật) ---------- */
  var TILT = '.card, .svc, .project, .market, .unit, .stat, .svc-card, .award, .kpis > div, .steps > li, ' +
    '.gt-glass-card, .gt-pillar, .gt-prj, .gt-steps > li, .gt-lab-item, .gt-metric';
  var MAX = 8; // độ nghiêng tối đa
  document.querySelectorAll(TILT).forEach(function (el) {
    el.classList.add('tilt');
    var glare = document.createElement('span');
    glare.className = 'tilt-glare';
    el.appendChild(glare);
    // Thẻ to (trụ cột, dự án) nghiêng ít hơn cho đỡ chóng mặt
    var max = el.offsetWidth > 360 ? MAX / 2 : MAX;
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', ((x - 0.5) * 2 * max).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 2 * max).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      el.classList.add('is-tilting');
    });
    el.addEventListener('pointerleave', function () {
      el.classList.remove('is-tilting');
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    });
  });

  if ('IntersectionObserver' in window) {
    var REVEAL = [
      '.block-title', '.page-title', '.page-lead', '.grid > *', '.stats > *', '.units > *', '.steps > li',
      '.news-lead', '.news-item', '.link-list > a', '.kpis > div', '.svc-card', '.product', '.awards > *',
      '.timeline > li', '.org-row', '.form', '.xk-hero', '.col-side > *',
      '.gt-hero-cards > *', '.gt-metrics > *', '.gt-pillars > *', '.gt-steps > li', '.gt-projects > *',
      '.gt-lab-items > *', '.gt-table-card', '.gt-cta', '#calc'
    ].join(',');
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        seen.unobserve(el);
        el.classList.add('is-in');
        // Gỡ lớp hiệu ứng sau khi xong để không ảnh hưởng hover
        setTimeout(function () {
          el.classList.remove('reveal', 'is-in');
          el.style.removeProperty('--d');
        }, 900 + parseFloat(el.style.getPropertyValue('--d') || 0) * 1000);
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll(REVEAL).forEach(function (el) {
      if (el.closest('.reveal')) return;
      // Các phần tử cùng hàng xuất hiện lần lượt
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(REVEAL); });
      var k = Math.max(0, sibs.indexOf(el));
      el.style.setProperty('--d', (k % 4) * 0.08 + 's');
      el.classList.add('reveal');
      seen.observe(el);
    });

    /* Số liệu chạy từ 0 lên (bỏ qua năm như 1997 và chỉ số có ký hiệu như K ≥ 0.98) */
    var counted = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        counted.unobserve(en.target);
        countUp(en.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stat strong, .kpis strong, .gt-metric strong').forEach(function (el) {
      var m = el.textContent.trim().match(/^(~?)(\d[\d.,]*)(.*)$/);
      if (!m || /^(19|20)\d\d$/.test(m[2] + m[3])) return;
      el.dataset.count = el.textContent;
      counted.observe(el);
    });
  }

  function countUp(el) {
    var m = el.dataset.count.trim().match(/^(~?)(\d[\d.,]*)(.*)$/);
    var raw = m[2];
    var thousands = /\.\d{3}(?!\d)/.test(raw);               // 10.000 → dấu chấm ngăn nghìn
    var decimals = (raw.split(',')[1] || '').length;          // 4,1 → 1 chữ số thập phân
    var pad = raw.charAt(0) === '0' && raw.length > 1 ? raw.length : 0; // 02 → giữ số 0 đầu
    var target = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
    var start = null;
    function fmt(v) {
      var s = decimals ? v.toFixed(decimals).replace('.', ',') : String(Math.round(v));
      if (thousands) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      while (s.length < pad) s = '0' + s;
      return m[1] + s + m[3];
    }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / 1400, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step); else el.textContent = el.dataset.count;
    }
    requestAnimationFrame(step);
  }
})();
