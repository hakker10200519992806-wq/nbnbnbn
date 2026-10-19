/* Robot-ustoz: original 3D qahramon (three.js). Mushukcha o'rniga ishlaydi.
   Mavjud harakat motori (#rb, mood(), say(), sinflar: wk, run, climb ...) shu yerda 3D pozaga aylanadi. */
(function () {
  'use strict';
  var cv = document.getElementById('robotCv');
  var rbEl = document.getElementById('rb');
  if (!cv || !rbEl || !window.THREE) return;
  var THREE = window.THREE;

  /* ---------- Renderer / sahna ---------- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, preserveDrawingBuffer: false });
  } catch (e) {
    cv.style.display = 'none';
    var fb = document.createElement('div');
    fb.textContent = '🤖'; fb.style.cssText = 'font-size:72px;text-align:center';
    cv.parentNode.appendChild(fb);
    return;
  }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(384, 384, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.5, 9.4);
  camera.lookAt(0, 0.5, 0);

  /* Yorug'lik */
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x2b2236, 0.35));
  var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-3, 5, 6); scene.add(key);
  var rim = new THREE.DirectionalLight(0x58f0ff, 0.9); rim.position.set(4, 2, -4); scene.add(rim);
  var fill = new THREE.PointLight(0xffb36b, 0.5, 20); fill.position.set(3.5, -1, 4); scene.add(fill);

  /* Atrof-muhit akslari (yaltiroq sirt uchun): yumshoq "softbox" lar bor protsedur env */
  try {
    var ec = document.createElement('canvas'); ec.width = 512; ec.height = 256;
    var ex = ec.getContext('2d');
    var g = ex.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#9fb7d6'); g.addColorStop(0.5, '#3a4458'); g.addColorStop(1, '#171a24');
    ex.fillStyle = g; ex.fillRect(0, 0, 512, 256);
    ex.fillStyle = '#ffffff'; ex.fillRect(60, 50, 90, 60); ex.fillRect(330, 40, 120, 50);
    ex.fillStyle = '#ffd9a8'; ex.fillRect(220, 100, 50, 30);
    var et = new THREE.CanvasTexture(ec);
    et.mapping = THREE.EquirectangularReflectionMapping; et.encoding = THREE.sRGBEncoding;
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(et).texture;
    pm.dispose();
  } catch (e) { /* env bo'lmasa ham ishlayveradi */ }

  /* ---------- Yordamchi: yumaloq "kvadrat" (superellipsoid) ---------- */
  function superEllipsoid(rx, ry, rz, e, taper) {
    var geo = new THREE.SphereGeometry(1, 56, 40);
    var p = geo.attributes.position, nrm = geo.attributes.normal;
    var a = 2 / e, v = new THREE.Vector3(), n = new THREE.Vector3();
    var sg = function (x) { return x < 0 ? -1 : 1; };
    for (var i = 0; i < p.count; i++) {
      var cx = p.getX(i), cy = p.getY(i), cz = p.getZ(i);
      var x = sg(cx) * Math.pow(Math.abs(cx), e), y = sg(cy) * Math.pow(Math.abs(cy), e), z = sg(cz) * Math.pow(Math.abs(cz), e);
      n.set(sg(x) * Math.pow(Math.abs(x), a - 1), sg(y) * Math.pow(Math.abs(y), a - 1), sg(z) * Math.pow(Math.abs(z), a - 1));
      var f = 1;
      if (taper) { var yn = (y + 1) / 2; f = 1 - taper * (1 - yn); }
      v.set(x * rx * f, y * ry, z * rz * f);
      p.setXYZ(i, v.x, v.y, v.z);
      n.set(n.x / rx, n.y / ry, n.z / rz).normalize();
      nrm.setXYZ(i, n.x, n.y, n.z);
    }
    return geo;
  }
  function M(color, o) {
    o = o || {};
    return new THREE.MeshPhysicalMaterial({
      color: color, roughness: o.r != null ? o.r : 0.28, metalness: o.m != null ? o.m : 0.05,
      clearcoat: o.cc != null ? o.cc : 0.6, clearcoatRoughness: 0.12, envMapIntensity: o.env != null ? o.env : 0.55,
      emissive: o.em || 0x000000, emissiveIntensity: o.ei || 0
    });
  }
  function seg(parent, rad, len, mat, y) { var m = new THREE.Mesh(new THREE.CapsuleGeometry(rad, len, 6, 10), mat); m.position.y = y; parent.add(m); return m; }
  function mesh(geo, mat, x, y, z) { var m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; }

  var C = { teal: 0x0fa596, orange: 0xf2780f, graphite: 0x2f3645, graphite2: 0x434b5e, dark: 0x080c12, glow: 0x6dffb8 };

  /* ---------- Robot tuzilmasi ---------- */
  var root = new THREE.Group(); scene.add(root);
  var body = new THREE.Group(); root.add(body);               // yaw/lean/hover shu yerda

  /* Tana (alohida, boshga yopishmagan) */
  var torso = new THREE.Group(); torso.position.set(0, -0.2, 0); body.add(torso);
  torso.add(mesh(superEllipsoid(0.78, 0.82, 0.66, 0.7, 0.26), M(C.orange)));
  var collar = mesh(new THREE.TorusGeometry(0.52, 0.055, 16, 48), M(C.graphite, { r: 0.4 }), 0, 0.74, 0);
  collar.rotation.x = Math.PI / 2; collar.scale.set(1, 1, 1); torso.add(collar);
  /* Ko'krak ekrani: { } */
  var chCv = document.createElement('canvas'); chCv.width = 128; chCv.height = 128;
  var cx = chCv.getContext('2d');
  cx.fillStyle = '#0a1018'; cx.beginPath(); cx.arc(64, 64, 62, 0, 7); cx.fill();
  cx.strokeStyle = '#2f3b4d'; cx.lineWidth = 5; cx.beginPath(); cx.arc(64, 64, 59, 0, 7); cx.stroke();
  cx.fillStyle = '#6dffb8'; cx.shadowColor = '#6dffb8'; cx.shadowBlur = 12;
  cx.font = 'bold 54px ui-monospace,Consolas,monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillText('{ }', 64, 68);
  var chTex = new THREE.CanvasTexture(chCv); chTex.encoding = THREE.sRGBEncoding;
  var chest = mesh(new THREE.CircleGeometry(0.27, 40), new THREE.MeshBasicMaterial({ map: chTex, transparent: true, toneMapped: false }), 0, 0.12, 0.665);
  torso.add(chest);
  /* Pastdagi "uchish" halqasi */
  var thr = mesh(new THREE.TorusGeometry(0.34, 0.05, 12, 40), new THREE.MeshBasicMaterial({ color: C.glow, toneMapped: false }), 0, -0.86, 0);
  thr.rotation.x = Math.PI / 2; torso.add(thr);
  var thrDisc = mesh(new THREE.CircleGeometry(0.3, 32), new THREE.MeshBasicMaterial({ color: 0x9dffd3, transparent: true, opacity: 0.55, toneMapped: false }), 0, -0.87, 0);
  thrDisc.rotation.x = -Math.PI / 2; torso.add(thrDisc);
  /* Bosh bilan tana orasida suzuvchi energiya halqasi */
  var ring = mesh(new THREE.TorusGeometry(0.42, 0.03, 10, 48), new THREE.MeshBasicMaterial({ color: C.glow, toneMapped: false }), 0, 0.98, 0);
  ring.rotation.x = Math.PI / 2; body.add(ring);

  /* Bosh */
  var head = new THREE.Group(); head.position.set(0, 1.5, 0); body.add(head);
  head.add(mesh(superEllipsoid(0.92, 0.7, 0.8, 0.62), M(C.teal)));
  var visor = mesh(superEllipsoid(0.72, 0.4, 0.14, 0.7), M(C.dark, { r: 0.1, cc: 1, env: 0.8 }), 0, -0.02, 0.72);
  head.add(visor);
  var eCv = document.createElement('canvas'); eCv.width = 256; eCv.height = 160;
  var ectx = eCv.getContext('2d');
  var eTex = new THREE.CanvasTexture(eCv); eTex.encoding = THREE.sRGBEncoding;
  var eyes = mesh(new THREE.PlaneGeometry(1.16, 0.725), new THREE.MeshBasicMaterial({ map: eTex, transparent: true, toneMapped: false, depthWrite: false }), 0, -0.02, 0.868);
  head.add(eyes);
  /* Quloq modullari */
  [-1, 1].forEach(function (s) {
    var pod = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.16, 28), M(C.orange), s * 0.93, 0, 0);
    pod.rotation.z = Math.PI / 2; head.add(pod);
    var pr = mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 24), new THREE.MeshBasicMaterial({ color: C.glow, toneMapped: false }), s * 1.015, 0, 0);
    pr.rotation.y = Math.PI / 2; head.add(pr);
  });
  /* Antenna */
  var antG = new THREE.Group(); antG.position.set(0, 0.64, 0); head.add(antG);
  antG.add(mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.34, 10), M(C.graphite, { r: 0.4 }), 0, 0.17, 0));
  var bulb = mesh(new THREE.SphereGeometry(0.09, 20, 16), new THREE.MeshBasicMaterial({ color: 0xffc247, toneMapped: false }), 0, 0.38, 0);
  antG.add(bulb);

  /* Qo'llar: tanaga yopishmagan, barmoqlari bor */
  function makeArm(side) {
    var sh = new THREE.Group(); sh.position.set(side * 1.22, 0.3, 0); body.add(sh);
    sh.add(mesh(new THREE.SphereGeometry(0.22, 24, 18), M(C.graphite2, { r: 0.35 })));
    var upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.34, 10, 20), M(C.orange)); upper.position.y = -0.34; sh.add(upper);
    var el = new THREE.Group(); el.position.y = -0.66; sh.add(el);
    el.add(mesh(new THREE.SphereGeometry(0.17, 20, 16), M(C.graphite2, { r: 0.35 })));
    var fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.28, 10, 20), M(C.orange)); fore.position.y = -0.27; el.add(fore);
    var hand = new THREE.Group(); hand.position.y = -0.56; hand.scale.setScalar(1.55); el.add(hand);
    hand.add(mesh(new THREE.SphereGeometry(0.095, 18, 14), M(C.graphite2, { r: 0.35 }), 0, 0.03, 0));
    var palm = mesh(superEllipsoid(0.09, 0.1, 0.13, 0.6), M(C.graphite), 0, -0.07, 0); hand.add(palm);
    var fingers = [];
    var zs = [-0.095, -0.032, 0.032, 0.095];
    zs.forEach(function (z) {
      var f0 = new THREE.Group(); f0.position.set(0, -0.15, z); hand.add(f0);
      seg(f0, 0.03, 0.07, M(C.graphite2, { r: 0.35 }), -0.045);
      var f1 = new THREE.Group(); f1.position.y = -0.1; f0.add(f1);
      seg(f1, 0.027, 0.055, M(C.orange, { r: 0.3 }), -0.04);
      fingers.push([f0, f1]);
    });
    var t0 = new THREE.Group(); t0.position.set(-side * 0.085, -0.07, 0.08); t0.rotation.z = side * 0.5; hand.add(t0);
    seg(t0, 0.03, 0.06, M(C.graphite2, { r: 0.35 }), -0.045);
    var t1 = new THREE.Group(); t1.position.y = -0.09; t0.add(t1);
    seg(t1, 0.026, 0.045, M(C.orange, { r: 0.3 }), -0.035);
    return { sh: sh, el: el, fingers: fingers, thumb: [t0, t1], side: side, hand: hand };
  }
  var AL = makeArm(-1), AR = makeArm(1);

  /* Aksessuarlar (dars sonidan ochiladi: data-acc 1..4) */
  var acc = { bow: new THREE.Group(), glasses: new THREE.Group(), crown: new THREE.Group(), cap: new THREE.Group() };
  (function () {
    var red = M(0xe63950);
    var bw1 = mesh(new THREE.ConeGeometry(0.16, 0.3, 16), red, -0.17, 0, 0); bw1.rotation.z = Math.PI / 2; acc.bow.add(bw1);
    var bw2 = mesh(new THREE.ConeGeometry(0.16, 0.3, 16), red, 0.17, 0, 0); bw2.rotation.z = -Math.PI / 2; acc.bow.add(bw2);
    acc.bow.add(mesh(new THREE.SphereGeometry(0.1, 16, 12), red));
    acc.bow.position.set(0, 0.62, 0.55); torso.add(acc.bow);
    var gm = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    [-1, 1].forEach(function (s) { var t = mesh(new THREE.TorusGeometry(0.2, 0.026, 8, 32), gm, s * 0.3, -0.02, 0.9); acc.glasses.add(t); });
    acc.glasses.add(mesh(new THREE.BoxGeometry(0.2, 0.03, 0.03), gm, 0, -0.02, 0.9));
    head.add(acc.glasses);
    var gold = M(0xffd93d, { m: 0.6, r: 0.25 });
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * Math.PI * 2, sp = mesh(new THREE.ConeGeometry(0.07, 0.24, 10), gold, Math.cos(a) * 0.3, 0.12, Math.sin(a) * 0.3);
      acc.crown.add(sp);
    }
    var band = mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.1, 24, 1, true), gold, 0, 0, 0); band.material.side = THREE.DoubleSide; acc.crown.add(band);
    acc.crown.position.set(0, 0.72, 0); head.add(acc.crown);
    var cap = M(0x23233a);
    acc.cap.add(mesh(new THREE.BoxGeometry(0.95, 0.05, 0.95), cap, 0, 0.1, 0));
    acc.cap.add(mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.16, 20), cap, 0, 0, 0));
    acc.cap.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), new THREE.MeshBasicMaterial({ color: 0xffd93d }), 0.42, -0.04, 0.42));
    acc.cap.position.set(0, 0.7, 0); head.add(acc.cap);
    Object.keys(acc).forEach(function (k) { acc[k].visible = false; });
  })();

  /* Soya */
  var shCv = document.createElement('canvas'); shCv.width = shCv.height = 64;
  var sx = shCv.getContext('2d'), sgd = sx.createRadialGradient(32, 32, 2, 32, 32, 32);
  sgd.addColorStop(0, 'rgba(0,0,0,.55)'); sgd.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = sgd; sx.fillRect(0, 0, 64, 64);
  var shadow = mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shCv), transparent: true, depthWrite: false }), 0, -1.95, 0);
  shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1, 0.5, 1); scene.add(shadow);
  shadow.position.z = 0.1;

  /* ---------- Ko'z ifodalari ---------- */
  var EC = { happy: '#7dffb0', star: '#ffe066', wow: '#ffe066', think: '#ffe066', sad: '#7cc4ff', cry: '#7cc4ff', grumpy: '#ff8a5c', love: '#ff7ab0', sleepy: '#7fb2d6', yawn: '#7fb2d6', dizzy: '#ffb15c', type: '#6dffb8', shy: '#ff9ec7', wave: '#7dffb0' };
  var lastKey = '';
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill(); }
  function drawEyes(m, blink, talking, t) {
    var key = m + '|' + (blink ? 1 : 0) + '|' + (talking ? Math.floor(t * 12) : 0) + '|' + (m === 'dizzy' ? Math.floor(t * 20) : 0) + '|' + (m === 'type' ? Math.floor(t * 6) : 0);
    if (key === lastKey) return; lastKey = key;
    var c = ectx, col = EC[m] || '#6dffb8';
    c.clearRect(0, 0, 256, 160);
    c.fillStyle = col; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 14; c.lineCap = 'round'; c.lineWidth = 11;
    var lx = 78, rx = 178, ey = 68;
    function arc(x, up) { c.beginPath(); c.arc(x, ey + (up ? 14 : -14), 24, up ? Math.PI * 1.1 : Math.PI * -0.1 + 0, up ? Math.PI * 1.9 : Math.PI * 1.1 - Math.PI * 1.2, false); c.stroke(); }
    var closed = blink && !/sleepy|yawn|happy|star|shy|wave|love|cry/.test(m);
    if (closed) { c.fillRect(lx - 24, ey - 3, 48, 7); c.fillRect(rx - 24, ey - 3, 48, 7); }
    else if (/^(happy|star|shy|wave)$/.test(m)) {
      [lx, rx].forEach(function (x) { c.beginPath(); c.arc(x, ey + 14, 25, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); });
    } else if (m === 'sleepy' || m === 'yawn') {
      [lx, rx].forEach(function (x) { c.beginPath(); c.arc(x, ey - 10, 24, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); });
      if (m === 'yawn') { c.beginPath(); c.ellipse(128, 128, 10, 14, 0, 0, 7); c.stroke(); }
    } else if (m === 'cry') {
      c.beginPath(); c.moveTo(lx - 22, ey - 22); c.lineTo(lx + 16, ey); c.lineTo(lx - 22, ey + 22); c.stroke();
      c.beginPath(); c.moveTo(rx + 22, ey - 22); c.lineTo(rx - 16, ey); c.lineTo(rx + 22, ey + 22); c.stroke();
      c.fillStyle = '#9fd8ff'; c.fillRect(lx - 14, ey + 30, 7, 24); c.fillRect(rx + 8, ey + 30, 7, 24);
    } else if (m === 'love') {
      [lx, rx].forEach(function (x) {
        c.beginPath(); c.moveTo(x, ey + 24); c.bezierCurveTo(x - 38, ey - 4, x - 18, ey - 34, x, ey - 12); c.bezierCurveTo(x + 18, ey - 34, x + 38, ey - 4, x, ey + 24); c.fill();
      });
    } else if (m === 'wow') {
      c.beginPath(); c.ellipse(lx, ey, 28, 32, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(rx, ey, 28, 32, 0, 0, 7); c.fill();
    } else if (m === 'grumpy') {
      c.save(); c.translate(lx, ey); c.rotate(0.28); rr(c, -24, -9, 48, 28, 8); c.restore();
      c.save(); c.translate(rx, ey); c.rotate(-0.28); rr(c, -24, -9, 48, 28, 8); c.restore();
    } else if (m === 'sad') {
      c.save(); c.translate(lx, ey + 4); c.rotate(-0.25); rr(c, -22, -12, 44, 28, 10); c.restore();
      c.save(); c.translate(rx, ey + 4); c.rotate(0.25); rr(c, -22, -12, 44, 28, 10); c.restore();
      c.fillStyle = '#9fd8ff'; c.beginPath(); c.ellipse(lx - 18, ey + 42, 5, 8, 0, 0, 7); c.fill();
    } else if (m === 'think' || m === 'curious') {
      rr(c, lx - 22, ey - 24, 44, 48, 14); rr(c, rx - 17, ey - 14, 34, 36, 12);
      c.fillRect(rx - 22, ey - 40, 44, 7);
    } else if (m === 'dizzy') {
      var a = t * 8; [lx, rx].forEach(function (x) { c.beginPath(); for (var i = 0; i < 40; i++) { var r = 2 + i * 0.55, an = a + i * 0.4; c.lineTo(x + Math.cos(an) * r, ey + Math.sin(an) * r); } c.lineWidth = 5; c.stroke(); });
      c.lineWidth = 11;
    } else if (m === 'type') {
      c.font = 'bold 56px ui-monospace,Consolas,monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
      var on = Math.floor(t * 6) % 2; c.fillText('<', lx, ey); c.fillText('>', rx, ey); if (on) c.fillText('_', 128, ey + 6);
    } else {
      rr(c, lx - 22, ey - 26, 44, 52, 16); rr(c, rx - 22, ey - 26, 44, 52, 16);
    }
    if (talking && !/cry|yawn/.test(m)) {
      c.shadowBlur = 8; c.fillStyle = col;
      for (var i = 0; i < 5; i++) { var h = 6 + Math.abs(Math.sin(t * 14 + i * 1.7)) * 16; c.fillRect(100 + i * 13, 138 - h / 2, 8, h); }
    }
    eTex.needsUpdate = true;
  }

  /* ---------- Poza hisobi ---------- */
  function armT(fwd, out, bend, curl) { return { fwd: fwd, out: out, bend: bend, curl: curl, point: 0 }; }
  var P = null, gest = { name: '', until: 0 };
  function newState() { return { y: 0, rz: 0, rx: 0, ry: 0, hrz: 0, hrx: 0, hry: 0, ant: 0, sq: 1, L: armT(0, 0, 0, 0.9), R: armT(0, 0, 0, 0.9), ring: 0, shadow: 1 }; }
  P = newState();
  var yawFollow = 0, pitchFollow = 0;
  function has(c) { return rbEl.classList.contains(c); }

  function target(t) {
    var m = rbEl.dataset.m || 'idle', face = 1;
    try { face = (typeof window.__face === 'function') ? window.__face() : 1; } catch (e) { }
    var T = newState();
    var bob = Math.sin(t * 2.1);
    T.y = bob * 0.07;
    T.ry = face * 0.5 + yawFollow;
    T.hrx = pitchFollow; T.hry = yawFollow * 0.6;
    T.ant = Math.sin(t * 2.6) * 0.1;
    T.L = armT(0.05, 0.16 + bob * 0.02, 0.18, 0.92); T.R = armT(0.05, 0.16 - bob * 0.02, 0.18, 0.92);
    T.ring = t * 1.4;

    /* kayfiyat */
    switch (m) {
      case 'happy': T.y += Math.abs(Math.sin(t * 6)) * 0.18; T.L.out = 0.7; T.R.out = 0.7; T.L.fwd = 0.1; T.R.fwd = 0.1; T.hrz = Math.sin(t * 3) * 0.06; break;
      case 'star': T.y += Math.abs(Math.sin(t * 7)) * 0.25; T.L.fwd = 0.2; T.R.fwd = 0.2; T.L.out = 2.4; T.R.out = 2.4; T.L.curl = 0.1; T.R.curl = 0.1; T.ry += Math.sin(t * 3) * 0.3; break;
      case 'wave': T.R.out = 2.1; T.R.fwd = 0.2; T.R.bend = 0.6 + Math.sin(t * 9) * 0.55; T.R.curl = 0.05; T.hrz = -0.1; break;
      case 'wow': T.hrx = -0.25; T.y += 0.25; T.L.out = 1.2; T.R.out = 1.2; T.L.curl = 0.2; T.R.curl = 0.2; T.ant = 0.35; T.sq = 1.05; break;
      case 'think': T.R.fwd = 1.2; T.R.out = 0.35; T.R.bend = 1.9; T.R.curl = 0.55; T.hrz = 0.14; T.hry = -0.2; break;
      case 'curious': T.hrz = 0.26; T.hry = 0.2; T.R.fwd = 0.6; T.R.bend = 0.9; T.R.curl = 0.3; T.ant = 0.3; break;
      case 'type': T.L.fwd = 1.15; T.R.fwd = 1.15; T.L.bend = 1.2; T.R.bend = 1.2; T.L.out = 0.2; T.R.out = 0.2; T.hrx = 0.14; T.L.curl = 0.4 + Math.sin(t * 22) * 0.35; T.R.curl = 0.4 + Math.cos(t * 19) * 0.35; T.rx = 0.07; break;
      case 'sad': T.hrx = 0.3; T.y -= 0.12; T.ant = -0.5; T.L.out = 0.05; T.R.out = 0.05; T.L.fwd = -0.05; T.R.fwd = -0.05; T.L.curl = 0.5; T.R.curl = 0.5; break;
      case 'cry': T.hrx = 0.35; T.y -= 0.1; T.ant = -0.55; T.rz = Math.sin(t * 28) * 0.03; T.L.fwd = 1.1; T.R.fwd = 1.1; T.L.bend = 2.1; T.R.bend = 2.1; T.L.out = 0.1; T.R.out = 0.1; break;
      case 'grumpy': T.rz = Math.sin(t * 36) * 0.03; T.hrx = 0.1; T.L.fwd = 0.9; T.R.fwd = 0.9; T.L.bend = 1.7; T.R.bend = 1.7; T.L.out = -0.15; T.R.out = -0.15; T.L.curl = 1; T.R.curl = 1; break;
      case 'play': T.y += Math.abs(Math.sin(t * 8)) * 0.3; T.L.out = 1.1 + Math.sin(t * 8) * 0.5; T.R.out = 1.1 - Math.sin(t * 8) * 0.5; T.L.curl = 0.2; T.R.curl = 0.2; T.rz = Math.sin(t * 4) * 0.08; break;
      case 'groom': T.R.out = 2.2; T.R.fwd = 0.4; T.R.bend = 1.5; T.R.curl = 0.2; T.hrz = 0.18; break;
      case 'sleepy': T.hrx = 0.38; T.y -= 0.15 + Math.sin(t * 1.2) * 0.04; T.ant = -0.4; T.L.out = 0.03; T.R.out = 0.03; break;
      case 'yawn': T.hrx = -0.28; T.y -= 0.05; T.L.out = 1.4; T.R.out = 1.4; T.L.curl = 0.2; T.R.curl = 0.2; break;
      case 'love': T.L.fwd = 1.0; T.R.fwd = 1.0; T.L.bend = 1.9; T.R.bend = 1.9; T.L.out = -0.1; T.R.out = -0.1; T.L.curl = 0.4; T.R.curl = 0.4; T.rz = Math.sin(t * 3) * 0.1; T.y += Math.sin(t * 3) * 0.1; break;
      case 'dizzy': T.rz = Math.sin(t * 5) * 0.2; T.hrz = Math.sin(t * 5 + 1) * 0.25; T.ry += t * 4 % (Math.PI * 2) - Math.PI; T.L.out = 0.9; T.R.out = 0.9; break;
      case 'shy': T.hrz = 0.2; T.hry = -0.35; T.L.fwd = 0.9; T.L.bend = 2.0; T.L.out = 0.1; T.L.curl = 0.6; T.R.fwd = 0.9; T.R.bend = 2.0; T.R.out = 0.1; T.R.curl = 0.6; break;
    }

    /* harakat sinflari */
    var ph = t * 10;
    if (has('wk')) { T.rz = -face * 0.1; T.y += Math.abs(Math.sin(ph)) * 0.08; T.L.fwd = Math.sin(ph) * 0.5; T.R.fwd = -Math.sin(ph) * 0.5; T.L.bend = 0.4; T.R.bend = 0.4; T.ant = -face * 0.3; }
    if (has('run')) { T.rz = -face * 0.28; T.rx = 0.12; T.y += Math.abs(Math.sin(t * 20)) * 0.1; T.L.fwd = -0.9 + Math.sin(t * 20) * 0.4; T.R.fwd = -0.9 - Math.sin(t * 20) * 0.4; T.L.bend = 0.6; T.R.bend = 0.6; T.L.out = 0.25; T.R.out = 0.25; T.ant = -face * 0.6; }
    if (has('sneak')) { T.y -= 0.35; T.rx = 0.2; T.hrx = 0.25; T.L.fwd = 0.3; T.R.fwd = 0.3; T.L.bend = 1.0; T.R.bend = 1.0; T.sq = 0.9; }
    if (has('climb')) { T.y += Math.sin(t * 12) * 0.1; T.L.fwd = 0; T.R.fwd = 0; T.L.out = 2.5 + Math.sin(t * 10) * 0.4; T.R.out = 2.5 - Math.sin(t * 10) * 0.4; T.L.curl = 0.6; T.R.curl = 0.6; T.rz = Math.sin(t * 8) * 0.07; }
    if (has('sit')) { T.y -= 0.3; T.sq = 0.93; T.L.out = 0.05; T.R.out = 0.05; T.hrz = Math.sin(t * 2) * 0.05; }
    if (has('lie')) { T.y -= 0.55; T.rz = face * -1.1; T.hrx = 0.3; T.L.out = 0.05; T.R.out = 0.05; T.sq = 0.95; }
    if (has('stretch')) { T.hrx = -0.4; T.L.out = 2.6; T.R.out = 2.6; T.L.curl = 0.05; T.R.curl = 0.05; T.sq = 1.1; T.y += 0.2; }
    if (has('scratch')) { T.R.out = 1.2 + Math.sin(t * 24) * 0.4; T.R.bend = 0.9; T.R.curl = 0.3; T.rz = 0.05; }
    if (has('pounce')) { T.rx = 0.25; T.L.fwd = 1.4; T.R.fwd = 1.4; T.L.out = 0.2; T.R.out = 0.2; T.y -= 0.1; }
    if (has('knead')) { T.L.fwd = 0.9 + Math.sin(t * 10) * 0.5; T.R.fwd = 0.9 - Math.sin(t * 10) * 0.5; T.L.bend = 1.2; T.R.bend = 1.2; T.L.out = 0.15; T.R.out = 0.15; T.L.curl = 0.3; T.R.curl = 0.3; }
    if (has('celebrate')) { T.ry += (t * 9) % (Math.PI * 2); T.L.out = 2.5; T.R.out = 2.5; T.L.curl = 0.05; T.R.curl = 0.05; T.y += Math.abs(Math.sin(t * 8)) * 0.3; }
    if (has('confused')) { T.hrz = Math.sin(t * 8) * 0.3; T.hry = Math.sin(t * 5) * 0.3; T.R.out = 0.4; T.R.fwd = 1.1; T.R.bend = 1.9; T.R.curl = 0.5; }
    if (has('slide')) { T.rz = face * 0.35; T.L.out = 1.4; T.R.out = 1.4; }
    if (has('ar')) { T.L.out = 1.6; T.R.out = 1.6; T.L.curl = 0.2; T.R.curl = 0.2; T.ant = -0.4; T.sq = 1.08; }
    if (has('cr')) { T.sq = 0.88; T.L.out = 0.2; T.R.out = 0.2; T.y -= 0.12; }
    if (has('hd')) { T.rz = Math.sin(t * 7) * 0.18; T.L.out = 0.7 + Math.sin(t * 7) * 0.2; T.R.out = 0.7 - Math.sin(t * 7) * 0.2; T.y -= 0.2; T.L.curl = 0.3; T.R.curl = 0.3; T.ant = Math.sin(t * 7) * 0.5; T.shadow = 0; }

    /* o'qituvchi imolari (tushuntirish paytida) */
    if (gest.until > Date.now()) {
      if (gest.name === 'present') { T.R.out = 1.15; T.R.fwd = 0.7; T.R.bend = 0.5; T.R.curl = 0.1; T.hrz = -0.1; T.L.out = 0.2; T.L.curl = 0.9; }
      if (gest.name === 'point') { T.R.out = 0.5; T.R.fwd = 1.45; T.R.bend = 0.2; T.R.curl = 0.9; T.R.point = 1; T.hry = -0.15 * face; T.ry += 0.2 * face; T.L.out = 0.2; }
      if (gest.name === 'count') { T.R.out = 1.0; T.R.fwd = 0.9; T.R.bend = 1.2; T.R.curl = 0.5 + Math.sin(t * 6) * 0.45; T.hrz = 0.08; }
    }
    return T;
  }
  function smoothTo(a, b, k) { for (var key in b) { if (typeof b[key] === 'number') a[key] += (b[key] - a[key]) * k; else if (typeof b[key] === 'object') smoothTo(a[key], b[key], k); } }

  function applyArm(A, S) {
    var s = A.side;
    A.sh.rotation.order = 'ZXY';
    A.sh.rotation.z = s * S.out * 1.0;
    A.sh.rotation.x = -S.fwd;
    A.el.rotation.x = -S.bend;
    var cl = S.curl;
    for (var i = 0; i < A.fingers.length; i++) {
      var pt = (S.point && i === 3) ? 0 : cl;                  // ko'rsatkich barmoq faqat "point" da ochiq
      A.fingers[i][0].rotation.z = -s * pt * 1.25;
      A.fingers[i][1].rotation.z = -s * pt * 1.45;
    }
    A.thumb[0].rotation.x = -cl * 0.5; A.thumb[1].rotation.z = -s * cl * 0.7;
  }

  var tPrev = performance.now(), blinkAt = 0, blinkUntil = 0, accKey = '';
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { tPrev = now; return; }
    var dt = Math.min(0.05, (now - tPrev) / 1000); tPrev = now;
    var t = now / 1000;
    var T = target(t);
    smoothTo(P, T, 1 - Math.exp(-dt * 14));
    /* ko'rsatkich barmoq bayrog'i yig'ilmaydi */
    P.L.point = T.L.point; P.R.point = T.R.point;

    body.position.y = P.y; body.rotation.z = P.rz; body.rotation.x = P.rx; body.rotation.y = P.ry;
    body.scale.set(1 / Math.sqrt(P.sq), P.sq, 1 / Math.sqrt(P.sq));
    head.rotation.set(P.hrx, P.hry, P.hrz);
    head.position.y = 1.5 + Math.sin(t * 2.1 + 1) * 0.04;     // bosh tanadan alohida suzadi
    antG.rotation.z = P.ant + Math.sin(t * 5) * 0.03;
    bulb.material.color.setHSL(0.11, 1, 0.55 + 0.1 * Math.sin(t * 4));
    ring.rotation.z = P.ring; ring.position.y = 0.98 + Math.sin(t * 2.1 + 0.5) * 0.02;
    thr.scale.setScalar(1 + 0.08 * Math.sin(t * 9)); thrDisc.material.opacity = 0.45 + 0.15 * Math.sin(t * 9);
    applyArm(AL, P.L); applyArm(AR, P.R);
    /* qo'llar ham mustaqil suzadi */
    AL.sh.position.y = 0.3 + Math.sin(t * 2.1 + 2) * 0.03; AR.sh.position.y = 0.3 + Math.sin(t * 2.1 + 3) * 0.03;

    var sy = body.position.y;
    shadow.material.opacity = 1; shadow.visible = P.shadow > 0.05;
    var sc = 1 - Math.max(0, sy) * 0.25; shadow.scale.set(sc, 0.5 * sc, 1);

    /* ko'zlar */
    var m = rbEl.dataset.m || 'idle';
    if (now > blinkAt) { blinkUntil = now + 130; blinkAt = now + 2200 + Math.random() * 3200; }
    var talking = (document.getElementById('bb') || {}).classList && document.getElementById('bb').classList.contains('s');
    drawEyes(m, now < blinkUntil, talking, t);

    /* aksessuarlar */
    var a = +(rbEl.dataset.acc || 0);
    if (String(a) !== accKey) { accKey = String(a); acc.bow.visible = a >= 1; acc.glasses.visible = a >= 2; acc.crown.visible = a >= 3; acc.cap.visible = a >= 4; if (a >= 4) acc.crown.visible = false; }

    renderer.render(scene, camera);
  }

  /* Kursorga qarash */
  addEventListener('pointermove', function (e) {
    var r = rbEl.getBoundingClientRect(); var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.3);
    yawFollow = Math.max(-0.45, Math.min(0.45, dx / 600)); pitchFollow = Math.max(-0.25, Math.min(0.25, dy / 800));
  }, { passive: true });

  /* ---------- Robot ovozlari (mushuk emas) ---------- */
  var actx;
  function isMuted() { try { return !!mute; } catch (e) { return !!window.mute; } }
  function AC2() { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; }
  window.meow = function () {
    if (isMuted()) return;
    try {
      var a = AC2(), t0 = a.currentTime;
      [[520, 0], [780, 0.09], [640, 0.18]].forEach(function (p) {
        var o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.value = p[0];
        g.gain.setValueAtTime(0.0001, t0 + p[1]); g.gain.exponentialRampToValueAtTime(0.025, t0 + p[1] + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + p[1] + 0.08);
        o.connect(g); g.connect(a.destination); o.start(t0 + p[1]); o.stop(t0 + p[1] + 0.1);
      });
    } catch (e) { }
  };
  window.purr = function (d) {
    if (isMuted()) return; d = d || 1;
    try {
      var a = AC2(), t0 = a.currentTime, o = a.createOscillator(), l = a.createOscillator(), g = a.createGain(), lg = a.createGain();
      o.type = 'sine'; o.frequency.value = 110; l.frequency.value = 9; lg.gain.value = 0.015; g.gain.value = 0.02;
      l.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(a.destination); o.start(t0); l.start(t0); o.stop(t0 + d); l.stop(t0 + d);
    } catch (e) { }
  };

  /* ---------- Ustoz: tushuntirish ---------- */
  var exId = 0;
  function gesture(name, ms) { gest.name = name; gest.until = Date.now() + (ms || 2500); }
  function lessonText() {
    var th = document.getElementById('th'); if (!th) return [];
    var c = th.cloneNode(true); var ex = c.querySelector('.exw'); if (ex) ex.remove();
    var txt = (c.textContent || '').replace(/\s+/g, ' ').trim();
    var parts = txt.match(/[^.!?]+[.!?]?/g) || [txt];
    var out = [], cur = '';
    parts.forEach(function (p) { p = p.trim(); if (!p) return; if ((cur + ' ' + p).length > 110 && cur) { out.push(cur); cur = p; } else cur = (cur ? cur + ' ' : '') + p; });
    if (cur) out.push(cur);
    return out;
  }
  async function explain() {
    var my = ++exId, chunks = lessonText();
    for (var i = 0; i < chunks.length; i++) {
      if (my !== exId) return;
      var topic = /Topshiriq/i.test(chunks[i]);
      gesture(topic ? 'point' : (i % 2 ? 'present' : 'count'), 3500);
      var txt = chunks[i];
      if (typeof window.say === 'function') window.say(txt, topic ? 'curious' : 'happy', 6000);
      await new Promise(function (r) { setTimeout(r, Math.min(9000, Math.max(3200, txt.length * 75))); });
    }
    if (my === exId && typeof window.say === 'function') { gesture('point', 2500); window.say("Endi o'zingiz urinib ko'ring! Kodni yozing va «Ishga tushirish» ni bosing.", 'star', 5000); }
  }
  var eb = document.getElementById('explain'); if (eb) eb.onclick = explain;
  var _load = window.load;
  if (typeof _load === 'function') window.load = function (i, q) { exId++; _load(i, q); if (!q) gesture('present', 2600); };

  window.RBX = { gesture: gesture, explain: explain, THREE: THREE, scene: scene, camera: camera, renderer: renderer, root: root, P: P };
  requestAnimationFrame(frame);
})();
