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

    var filterDocs = function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      docRows.forEach(function (tr) {
        var ok = (!q || tr.textContent.toLowerCase().indexOf(q) !== -1) &&
          (!org.value || tr.dataset.org === org.value) &&
          (!kind.value || tr.dataset.kind === kind.value);
        tr.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = 'Hiển thị ' + shown + ' / ' + docRows.length + ' văn bản';
      empty.hidden = shown > 0;
    };
    [search, org, kind].forEach(function (el) { el.addEventListener('input', filterDocs); });
    filterDocs();
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
    gMain.src = gThumbs[gCurrent].src;
    gMain.alt = gThumbs[gCurrent].alt;
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
})();
