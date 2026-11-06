/* SENSUS – nature scenes: animated backgrounds (canvas) + matching nature sounds (Web Audio).
   Each scene can later get a real video: set `video: 'assets/scenes/<id>.mp4'` and the page will use it instead of the canvas. */
(function () {
  'use strict';

  var V = 'assets/scenes/';
  var LIST = [
    { id: 'deszcz', name: 'Deszcz', icon: '<path d="M7 14.5a4 4 0 01-.6-7.9 5 5 0 019.7 1.3A3.4 3.4 0 0116.8 14.5"/><path d="M9 17.5l-.9 2M12.4 17.5l-.9 2M15.8 17.5l-.9 2"/>' },
    { id: 'burza', name: 'Burza', v: ['burza-1'], icon: '<path d="M7 13.5a4 4 0 01-.6-7.9 5 5 0 019.7 1.3A3.4 3.4 0 0116.8 13.5"/><path d="M12.6 11.5l-2.1 4h3l-2.1 4"/>' },
    { id: 'morze', name: 'Morze', v: ['morze-1', 'morze-2'], icon: '<path d="M3 14.5c2.2 0 3.2-5 7-5 2.8 0 3.6 2.6 1.8 3.8"/><path d="M3 18.5c2.5 0 3-1.5 5.5-1.5s3 1.5 5.5 1.5 3-1.5 5.5-1.5"/><path d="M14.5 10.5c1.6-2.2 3.8-3.2 6.5-3.2"/>' },
    { id: 'jezioro', name: 'Jezioro', v: ['jezioro-1'], icon: '<circle cx="12" cy="7.5" r="2.6"/><path d="M3.5 14c2 0 2-1.4 4.2-1.4S10 14 12 14s2.2-1.4 4.3-1.4S18.5 14 20.5 14M6 18c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/>' },
    { id: 'rzeka', name: 'Rzeka', v: ['rzeka-1'], icon: '<path d="M3.5 8c2.8 0 2.8-2 5.7-2s2.8 2 5.6 2 2.9-2 5.7-2M3.5 12.5c2.8 0 2.8-2 5.7-2s2.8 2 5.6 2 2.9-2 5.7-2M3.5 17c2.8 0 2.8-2 5.7-2s2.8 2 5.6 2 2.9-2 5.7-2"/>' },
    { id: 'strumien', name: 'Strumień', icon: '<path d="M12 4c3 4.4 5 7.4 5 9.9a5 5 0 01-10 0C7 11.4 9 8.4 12 4z"/>' },
    { id: 'mgla', name: 'Mglisty las', v: ['mgla-1'], icon: '<path d="M4 8.5h10M17 8.5h3M6 12.5h14M4 16.5h8M15 16.5h3"/>' },
    { id: 'ptaki', name: 'Ptaki w lesie', v: ['las-1', 'las-2'], icon: '<path d="M3.5 10c1.4-1.5 2.9-1.5 4 0 1.1-1.5 2.6-1.5 4 0M12.5 15c1.4-1.5 2.9-1.5 4 0 1.1-1.5 2.6-1.5 4 0"/>' },
    { id: 'liscie', name: 'Jesienne liście', v: ['liscie-1', 'liscie-2'], icon: '<path d="M6 18.5c0-7.2 5-12 13-12-.5 8-5.6 12-13 12z"/><path d="M6 18.5l7.2-7.2"/>' },
    { id: 'ogien', name: 'Ognisko', v: ['ognisko-1', 'ognisko-2'], icon: '<path d="M12 3.5c1 3.4 5 5.4 5 9.8a5 5 0 01-10 0c0-2.4 1.4-3.9 2.4-4.9.3 1.5 1 2.5 2 2.9 0-2.9-.3-5.3.6-7.8z"/>' },
    { id: 'swierszcze', name: 'Noc i świerszcze', v: ['noc-1'], icon: '<path d="M12 19.5c0-5.6-2.9-8.6-6.6-9.5 0 4.7 2.8 8.6 6.6 9.5zM12 19.5c0-5.6 2.9-8.6 6.6-9.5 0 4.7-2.8 8.6-6.6 9.5z"/><path d="M12 19.5V8"/>' }
  ];
  function icon(id) {
    var s = LIST.filter(function (x) { return x.id === id; })[0];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (s ? s.icon : '') + '</svg>';
  }

  /* ---------------- visuals ---------------- */
  var vwrap = null, vids = [], vi = 0, useCanvas = true;
  var cv = null, ctx = null, raf = 0, cur = null, W = 0, H = 0, last = 0, t0 = 0, reduce = false, S = {}, activeSound = null;
  function R(a, b) { return a + Math.random() * (b - a); }
  function size() {
    if (!cv) return;
    var d = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
    cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    init();
  }
  function init() { S = {}; if (D[cur] && D[cur].init) D[cur].init(); }
  function find(id) { return LIST.filter(function (x) { return x.id === id; })[0]; }
  function mkVid() {
    var v = document.createElement('video'); v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.preload = 'auto'; return v;
  }
  function canvasOn(on) { useCanvas = on; if (cv) cv.style.opacity = on ? '1' : '0'; }
  function showVideo(id) {
    var sc = find(id);
    if (!vwrap || !sc || !sc.v) { vids.forEach(function (v) { v.classList.remove('on'); }); canvasOn(true); return; }
    var base = V + sc.v[Math.floor(Math.random() * sc.v.length)], nv = vids[vi ^= 1], ov = vids[vi ^ 1];
    nv.onerror = function () { if (vids[vi] === nv) { nv.classList.remove('on'); canvasOn(true); } };
    nv.poster = base + '.jpg';
    if (reduce) { nv.removeAttribute('src'); nv.load(); }
    else { nv.src = base + '.mp4'; nv.load(); var p = nv.play(); if (p && p.catch) p.catch(function () { }); }
    nv.classList.add('on'); ov.classList.remove('on'); canvasOn(false);
    setTimeout(function () { if (vids[vi] !== ov) { ov.pause(); ov.removeAttribute('src'); ov.load(); } }, 1400);
  }
  function start(canvas, id, o) {
    stop(); cv = canvas; ctx = cv.getContext('2d'); cur = D[id] ? id : 'jezioro'; reduce = !!(o && o.reduce);
    vwrap = (o && o.video) || null;
    if (vwrap && !vids.length) { vids = [mkVid(), mkVid()]; vids.forEach(function (v) { vwrap.appendChild(v); }); }
    addEventListener('resize', size); size(); t0 = last = performance.now(); raf = requestAnimationFrame(loop);
    showVideo(cur);
  }
  function set(id) { if (!D[id] || id === cur) return; cur = id; init(); showVideo(id); }
  function stop() {
    cancelAnimationFrame(raf); raf = 0; removeEventListener('resize', size); cv = null;
    vids.forEach(function (v) { v.classList.remove('on'); v.pause(); v.removeAttribute('src'); v.load(); });
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = (now - last) / 1000; if (dt < 1 / 31) return; last = now; dt = Math.min(dt, .1);
    var t = (now - t0) / 1000; if (reduce) { dt *= .35; t *= .35; }
    if (!useCanvas) return;
    try { D[cur].draw(t, dt); } catch (e) { }
  }
  function grad(c1, c2) { var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function veil(rgb, a) { ctx.fillStyle = 'rgba(' + rgb + ',' + a + ')'; ctx.fillRect(0, 0, W, H); }
  function glow(x, y, r, rgb, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); }
  function spawn(rate, dt, fn) { var n = rate * dt; while (n > 0) { if (Math.random() < Math.min(1, n)) fn(); n -= 1; } }

  var D = {
    deszcz: {
      init: function () { S.r = []; S.st = []; for (var i = 0; i < 70; i++) S.st.push({ x: R(0, W * 1.1), y: R(0, H), v: R(520, 820) }); },
      draw: function (t, dt) {
        grad('#4a5446', '#1b221a'); glow(W * .72, H * .1, H * .55, '241,205,132', .07);
        spawn(W * H / 9000, dt, function () { S.r.push({ x: R(0, W), y: R(H * .22, H), r: 0, m: R(14, 40) }); });
        ctx.lineWidth = 1;
        S.r = S.r.filter(function (p) {
          p.r += dt * 26; var a = (1 - p.r / p.m) * .42; if (a <= 0) return false;
          ctx.strokeStyle = 'rgba(238,231,212,' + a + ')'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * .36, 0, 0, 6.2832); ctx.stroke();
          if (p.r > 6) { ctx.strokeStyle = 'rgba(238,231,212,' + a * .5 + ')'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * .55, p.r * .2, 0, 0, 6.2832); ctx.stroke(); }
          return true;
        });
        ctx.strokeStyle = 'rgba(238,231,212,.10)';
        S.st.forEach(function (p) { p.y += p.v * dt; p.x -= p.v * dt * .1; if (p.y > H + 20) { p.y = -20; p.x = R(0, W * 1.1); } ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 1.6, p.y - 16); ctx.stroke(); });
      }
    },
    burza: {
      init: function () {
        S.c = []; for (var i = 0; i < 10; i++) S.c.push({ x: R(-.2, 1.2) * W, y: R(-.05, .75) * H, r: R(.35, .7) * Math.max(W, H), v: R(3, 10), s: R(.14, .26) });
        S.l = []; for (var j = 0; j < 70; j++) S.l.push({ x: R(0, W), y: H * R(.9, .97), a: R(.25, .7) });
        S.flash = 0; S.next = R(3, 6);
      },
      draw: function (t, dt) {
        grad('#1b2331', '#0b0f13');
        S.next -= dt;
        if (S.next <= 0) { S.next = R(8, 16); S.flash = reduce ? .25 : 1; if (activeSound && activeSound.thunder) { var snd = activeSound; setTimeout(function () { if (activeSound === snd) snd.thunder(); }, R(500, 1500)); } }
        S.flash *= Math.pow(.03, dt);
        S.c.forEach(function (c) { c.x += c.v * dt; if (c.x - c.r > W) c.x = -c.r; glow(c.x, c.y, c.r, '118,132,152', c.s * (1 + S.flash * 1.8)); });
        if (S.flash > .01) veil('205,214,232', S.flash * .22);
        ctx.fillStyle = '#07090b'; ctx.fillRect(0, H * .95, W, H * .05);
        S.l.forEach(function (p) { ctx.fillStyle = 'rgba(241,205,132,' + p.a * (.7 + .3 * Math.sin(t * 2 + p.x)) + ')'; ctx.fillRect(p.x, p.y, 1.4, 1.4); });
      }
    },
    rzeka: {
      init: function () { grad('#2c3531', '#1d2421'); S.p = []; for (var i = 0; i < 280; i++) S.p.push(rz()); },
      draw: function (t, dt) {
        veil('33,41,37', .12);
        S.p.forEach(function (p, i) {
          var a = Math.sin(p.x * .008 + t * .3) * .9 + Math.cos(p.y * .011 - t * .2) * .9 + 1.5708;
          p.x += Math.cos(a) * 42 * dt; p.y += Math.sin(a) * 42 * dt; p.l -= dt;
          if (p.l < 0 || p.x < -10 || p.x > W + 10 || p.y > H + 10) S.p[i] = p = rz();
          ctx.fillStyle = p.g ? 'rgba(241,205,132,' + p.a + ')' : 'rgba(234,230,214,' + p.a + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.2832); ctx.fill();
        });
      }
    },
    strumien: {
      init: function () {
        grad('#5b4b2f', '#29251a'); S.p = []; for (var i = 0; i < 230; i++) S.p.push(st());
        S.k = []; for (var j = 0; j < 16; j++) S.k.push({ x: R(-.1, 1.1) * W, y: R(.05, 1) * H, rx: R(26, 80), ry: R(14, 34), rot: R(-.4, .4), c: R(0, 1) });
      },
      draw: function (t, dt) {
        veil('56,48,33', .16);
        S.p.forEach(function (p, i) {
          p.x += (-34 + Math.sin(p.y * .02 + t) * 22) * dt; p.y += 74 * dt; p.l -= dt;
          if (p.l < 0 || p.y > H + 10 || p.x < -20) S.p[i] = p = st();
          ctx.fillStyle = p.g ? 'rgba(245,205,120,' + p.a * 1.4 + ')' : 'rgba(240,234,218,' + p.a + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.2832); ctx.fill();
        });
        S.k.forEach(function (k) {
          ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(k.rot);
          ctx.fillStyle = k.c > .5 ? '#2c271b' : '#3a3322'; ctx.beginPath(); ctx.ellipse(0, 0, k.rx, k.ry, 0, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = 'rgba(241,205,132,.13)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -2, k.rx * .9, k.ry * .8, 0, 3.6, 5.9); ctx.stroke();
          ctx.fillStyle = 'rgba(96,110,60,.35)'; ctx.beginPath(); ctx.ellipse(-k.rx * .2, -k.ry * .45, k.rx * .45, k.ry * .25, 0, 0, 6.2832); ctx.fill();
          ctx.restore();
        });
      }
    },
    ptaki: {
      init: function () {
        S.m = []; for (var i = 0; i < 70; i++) S.m.push({ x: R(0, W), y: R(0, H), r: R(.8, 2.2), vx: R(-6, 6), vy: R(-10, -2), ph: R(0, 6) });
        S.b = []; for (var j = 0; j < 5; j++) S.b.push({ x: R(.35, 1.05) * W, w: R(30, 95), a: R(.05, .11), ph: R(0, 6) });
        S.f = []; for (var k = 0; k < 34; k++) { var side = k % 3; S.f.push({ x: side === 0 ? R(0, W) : side === 1 ? R(-20, W * .18) : R(W * .82, W + 20), y: side === 0 ? R(-20, H * .1) : R(0, H * .4), r: R(14, 34), rot: R(0, 3.1), ph: R(0, 6) }); }
      },
      draw: function (t, dt) {
        grad('#36452d', '#131911');
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        S.b.forEach(function (b) {
          var ang = .42 + Math.sin(t * .1 + b.ph) * .04, dx = -Math.tan(ang) * H, a = b.a * (.75 + .25 * Math.sin(t * .3 + b.ph));
          var g = ctx.createLinearGradient(b.x, 0, b.x + dx, H); g.addColorStop(0, 'rgba(241,226,180,' + a + ')'); g.addColorStop(1, 'rgba(241,226,180,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b.x - b.w / 2, -10); ctx.lineTo(b.x + b.w / 2, -10); ctx.lineTo(b.x + dx + b.w * 1.6, H); ctx.lineTo(b.x + dx - b.w * 1.6, H); ctx.closePath(); ctx.fill();
        });
        S.m.forEach(function (m) {
          m.x += (m.vx + Math.sin(t + m.ph) * 4) * dt; m.y += m.vy * dt; if (m.y < -5) { m.y = H + 5; m.x = R(0, W); }
          ctx.fillStyle = 'rgba(241,205,132,' + (.25 + .35 * Math.abs(Math.sin(t * .8 + m.ph))) + ')'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.2832); ctx.fill();
        });
        ctx.restore();
        ctx.fillStyle = 'rgba(14,20,12,.88)';
        ctx.fillStyle = 'rgba(14,20,12,.72)';
        S.f.forEach(function (f) { var r = f.r * .7; ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot + Math.sin(t * .6 + f.ph) * .07); ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -r * .62, r, 0); ctx.quadraticCurveTo(0, r * .62, -r, 0); ctx.fill(); ctx.strokeStyle = 'rgba(70,90,50,.35)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-r * .9, 0); ctx.lineTo(r * .9, 0); ctx.stroke(); ctx.restore(); });
      }
    },
    ogien: {
      init: function () { S.e = []; S.fl = []; for (var i = 0; i < 8; i++) S.fl.push({ x: R(-38, 38), h: R(30, 110), r: R(40, 90), ph: R(0, 6) }); },
      draw: function (t, dt) {
        grad('#12100b', '#090806');
        var fl = .85 + .1 * Math.sin(t * 7) + .07 * Math.sin(t * 13.7), cx = W / 2, by = H * 1.0;
        glow(cx, by, H * .42, '238,146,38', .2 * fl);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        S.fl.forEach(function (f) {
          var x = cx + f.x + Math.sin(t * 3 + f.ph) * 8, y = by - f.h * .7 * (.8 + .25 * Math.sin(t * 4.3 + f.ph)), r = f.r * .85 * fl;
          var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(245,200,110,.45)'); g.addColorStop(.45, 'rgba(238,146,38,.2)'); g.addColorStop(1, 'rgba(238,146,38,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
        });
        spawn(42, dt, function () { var m = R(1.5, 4.2); S.e.push({ x: cx + R(-45, 45), y: by - R(0, 40), vx: R(-22, 22), vy: -R(60, 170), l: m, m: m, s: R(.8, 2.2), ph: R(0, 6) }); });
        S.e = S.e.filter(function (e) {
          e.l -= dt; if (e.l <= 0) return false; e.x += e.vx * dt + Math.sin(t * 2 + e.ph) * .6; e.y += e.vy * dt;
          ctx.fillStyle = 'rgba(245,192,98,' + (e.l / e.m) * .9 + ')'; ctx.beginPath(); ctx.arc(e.x, e.y, e.s, 0, 6.2832); ctx.fill(); return true;
        });
        ctx.restore();
      }
    },
    swierszcze: {
      init: function () {
        S.s = []; for (var i = 0; i < 260; i++) S.s.push({ x: R(0, W), y: R(0, H * .75), r: R(.4, 1.5), ph: R(0, 6), sp: R(.3, 1.6) });
        S.ff = []; for (var j = 0; j < 14; j++) S.ff.push({ x: R(0, W), y: R(H * .68, H * .95), ph: R(0, 6), vx: R(-8, 8), vy: R(-4, 4) });
      },
      draw: function (t, dt) {
        grad('#0d1722', '#1c2b2b');
        ctx.save(); ctx.translate(W * .5, H * .35); ctx.rotate(-.55); ctx.scale(1, .28); glow(0, 0, Math.max(W, H) * .6, '196,206,226', .06); ctx.restore();
        S.s.forEach(function (s) { ctx.fillStyle = 'rgba(246,240,225,' + (.25 + .6 * Math.abs(Math.sin(t * s.sp + s.ph))) + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill(); });
        ctx.fillStyle = '#17231a'; ctx.beginPath(); ctx.moveTo(0, H * .74);
        ctx.bezierCurveTo(W * .25, H * .66, W * .45, H * .6, W * .65, H * .62); ctx.bezierCurveTo(W * .82, H * .64, W * .92, H * .68, W, H * .67);
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        S.ff.forEach(function (f) { f.x += (f.vx + Math.sin(t * .7 + f.ph) * 6) * dt; f.y += (f.vy + Math.cos(t * .5 + f.ph) * 4) * dt; if (f.x < -10) f.x = W + 10; if (f.x > W + 10) f.x = -10; glow(f.x, f.y, 9, '241,205,132', .55 * Math.max(0, Math.sin(t * 1.3 + f.ph))); });
        ctx.restore();
      }
    },
    jezioro: {
      init: function () { S.k = []; for (var i = 0; i < 34; i++) S.k.push({ x: R(0, W), y: R(0, H), ph: R(0, 6), sp: R(.6, 1.6) }); },
      draw: function (t, dt) {
        grad('#8d9e92', '#475a51'); glow(W * .5, H * .05, H * .6, '246,240,225', .14);
        ctx.lineWidth = 1.2;
        for (var y = -10; y < H + 14; y += 14) {
          ctx.strokeStyle = 'rgba(246,240,225,' + (.09 + .07 * Math.sin(y * .03 + t * .6)) + ')'; ctx.beginPath();
          for (var x = -16; x <= W + 16; x += 16) { var yy = y + Math.sin(x * .02 + t * .8 + y * .05) * 4 + Math.sin(x * .007 - t * .5) * 3; if (x < -15) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
          ctx.stroke();
        }
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        S.k.forEach(function (k) { var a = Math.max(0, Math.sin(t * k.sp + k.ph)); if (a > .6) glow(k.x, k.y, 6, '255,250,235', (a - .6) * 1.6); });
        ctx.restore();
      }
    }
  };
  D.morze = D.jezioro; D.liscie = D.ptaki;
  D.mgla = {
    init: function () {
      S.t = []; for (var i = 0; i < 16; i++) S.t.push({ x: R(-.05, 1.05) * W, w: R(6, 26), a: R(.25, .7) });
      S.f = []; for (var j = 0; j < 9; j++) S.f.push({ x: R(0, W), y: R(.2, .9) * H, r: R(.3, .6) * W, v: R(4, 12) });
    },
    draw: function (t, dt) {
      grad('#7b857a', '#2f372f');
      S.t.forEach(function (k) { ctx.fillStyle = 'rgba(28,34,27,' + k.a + ')'; ctx.fillRect(k.x, 0, k.w, H); });
      S.f.forEach(function (f) { f.x += f.v * dt; if (f.x - f.r > W) f.x = -f.r; glow(f.x, f.y, f.r, '226,228,220', .22); });
    }
  };
  function rz() { return { x: R(-10, W + 10), y: R(-10, H), s: R(.6, 2.2), a: R(.07, .24), l: R(3, 9), g: Math.random() < .08 }; }
  function st() { return { x: R(W * .1, W * 1.2), y: R(-30, H * .4), s: R(.6, 2), a: R(.08, .26), l: R(3, 8), g: Math.random() < .06 }; }

  /* ---------------- sounds ---------------- */
  function noise(ac, kind) {
    ac.__sensusNoise = ac.__sensusNoise || {};
    if (ac.__sensusNoise[kind]) return ac.__sensusNoise[kind];
    var len = ac.sampleRate * 4, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; if (kind === 'brown') { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
    return (ac.__sensusNoise[kind] = b);
  }
  function sound(ac, id) {
    var out = ac.createGain(), nodes = [], timers = [], dead = false;
    function F(type, f, q) { var b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; return b; }
    function bed(kind, filters, g) {
      var s = ac.createBufferSource(); s.buffer = noise(ac, kind); s.loop = true; s.loopStart = R(0, 2); s.start(); nodes.push(s);
      var n = s; filters.forEach(function (f) { n.connect(f); n = f; }); var gn = ac.createGain(); gn.gain.value = g; n.connect(gn); gn.connect(out); return gn;
    }
    function lfo(f, depth, param) { var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = depth; o.connect(g); g.connect(param); o.start(); nodes.push(o); }
    function later(fn, ms) { timers.push(setTimeout(function () { if (!dead) fn(); }, ms)); if (timers.length > 50) timers.splice(0, 25); }
    function panTo(v) { if (!ac.createStereoPanner) return out; var p = ac.createStereoPanner(); p.pan.value = v; p.connect(out); return p; }
    var api = { node: out };

    if (id === 'deszcz' || id === 'burza') {
      bed('white', [F('highpass', 900), F('lowpass', 5500)], id === 'burza' ? .09 : .11);
      bed('brown', [F('lowpass', 420)], .16);
    }
    if (id === 'burza') {
      bed('brown', [F('lowpass', 140)], .3);
      api.thunder = function () {
        if (dead) return;
        var s = ac.createBufferSource(); s.buffer = noise(ac, 'brown'); var lp = F('lowpass', 170), g = ac.createGain(), t = ac.currentTime;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9, t + .25); g.gain.exponentialRampToValueAtTime(.001, t + 5.5);
        s.connect(lp); lp.connect(g); g.connect(out); s.start(t); s.stop(t + 5.7);
      };
      activeSound = api;
    }
    if (id === 'rzeka') {
      bed('brown', [F('highpass', 150), F('lowpass', 1800)], .55);
      var foam = bed('white', [F('bandpass', 900, .5)], .03); lfo(.17, .015, foam.gain);
    }
    if (id === 'strumien') {
      bed('brown', [F('lowpass', 900)], .22);
      var bub = bed('white', [F('bandpass', 2300, 1)], .05); lfo(3.1, .02, bub.gain); lfo(4.7, .015, bub.gain); lfo(.4, .01, bub.gain);
    }
    function leavesBed(g) { var bp = F('bandpass', 3200, .6), lv = bed('white', [F('highpass', 1200), bp], g); lfo(.13, g * .75, lv.gain); lfo(.05, 900, bp.frequency); }
    function birds(vol, minMs, maxMs) {
      (function bird() {
        var n = Math.floor(R(2, 6)), t = ac.currentTime + .05, base = R(2400, 4200), dest = panTo(R(-.8, .8));
        for (var i = 0; i < n; i++) {
          var o = ac.createOscillator(), g = ac.createGain(), f0 = base * R(.9, 1.15);
          o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * R(.7, 1.4), t + R(.06, .14));
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(R(.012, .03) * vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + .17);
          o.connect(g); g.connect(dest); o.start(t); o.stop(t + .2); t += R(.12, .26);
        }
        later(bird, R(minMs, maxMs));
      })();
    }
    if (id === 'morze') {
      var sw = bed('brown', [F('lowpass', 650)], .32); lfo(.08, .26, sw.gain);
      var hiss = bed('white', [F('bandpass', 1600, .5)], .03); lfo(.08, .026, hiss.gain);
    }
    if (id === 'mgla') {
      var wd = bed('brown', [F('bandpass', 320, .7)], .12); lfo(.06, .06, wd.gain);
      birds(.6, 5000, 12000);
    }
    if (id === 'liscie') {
      leavesBed(.06); var wl = bed('brown', [F('bandpass', 450, .8)], .1); lfo(.09, .06, wl.gain);
    }
    if (id === 'ptaki') {
      leavesBed(.04);
      birds(1, 1300, 4800);
    }
    if (id === 'ogien') {
      var roar = bed('brown', [F('lowpass', 480)], .32); lfo(.6, .08, roar.gain); lfo(1.7, .05, roar.gain);
      var cb = []; for (var c = 0; c < 6; c++) { var len = Math.floor(ac.sampleRate * R(.015, .05)), b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); cb.push(b); }
      (function crackle() {
        var s = ac.createBufferSource(); s.buffer = cb[Math.floor(Math.random() * cb.length)];
        var hp = F('highpass', R(1200, 3200)), g = ac.createGain(); g.gain.value = R(.04, .24); s.connect(hp); hp.connect(g); g.connect(panTo(R(-.3, .3))); s.start();
        later(crackle, Math.random() < .15 ? R(20, 60) : R(80, 420));
      })();
    }
    if (id === 'swierszcze') {
      bed('brown', [F('bandpass', 380, .7)], .07);
      [[4400, -.6, .78], [4720, .5, .95], [4150, .1, 1.3]].forEach(function (c) {
        var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = c[0]; g.gain.value = 0; o.connect(g); g.connect(panTo(c[1])); o.start(); nodes.push(o);
        (function chirp() {
          var t = ac.currentTime + .02;
          for (var i = 0; i < 3; i++) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.011, t + .006); g.gain.linearRampToValueAtTime(0, t + .028); t += .045; }
          later(chirp, c[2] * R(.85, 1.15) * 1000);
        })();
      });
    }
    if (id === 'jezioro') {
      var lap = bed('brown', [F('lowpass', 700)], .28); lfo(.12, .2, lap.gain);
      var fz = bed('white', [F('bandpass', 1200, .7)], .016); lfo(.12, .012, fz.gain);
    }
    api.stop = function () {
      dead = true; timers.forEach(clearTimeout); nodes.forEach(function (n) { try { n.stop(); } catch (e) { } });
      try { out.disconnect(); } catch (e) { } if (activeSound === api) activeSound = null;
    };
    return api;
  }

  window.SensusScenes = { list: LIST, icon: icon, start: start, set: set, stop: stop, sound: sound };
})();
