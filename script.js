(() => {
  /* Barra y botón fijo */
  const bar = document.getElementById('bar');
  const floatWa = document.querySelector('.float-wa');
  const onScroll = () => {
    bar.dataset.state = window.scrollY > 40 ? 'solid' : 'top';
    if (floatWa) floatWa.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menú del celular */
  const toggle = document.querySelector('.bar__toggle');
  const menu = document.getElementById('menu');
  const setMenu = (open) => { menu.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Cerrar' : 'Menú'; };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  /* Entradas escalonadas */
  document.querySelectorAll('section').forEach((sec) => {
    sec.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 5) * 80}ms`));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* Precio: lista, 6 cuotas o transferencia (20% menos, como en la tienda) */
  const money = (n) => '$' + Math.round(n).toLocaleString('es-AR');
  document.querySelectorAll('.item__card').forEach((card) => {
    const base = Number(card.dataset.price);
    const out = card.querySelector('.price__value');
    card.querySelectorAll('.price__tabs button').forEach((b) => b.addEventListener('click', () => {
      card.querySelectorAll('.price__tabs button').forEach((x) => x.classList.toggle('is-on', x === b));
      const m = b.dataset.mode;
      if (m === 'lista') out.innerHTML = money(base);
      if (m === 'cuotas') out.innerHTML = `6 × ${money(base / 6)}<small>sin interés, total ${money(base)}</small>`;
      if (m === 'transf') out.innerHTML = `${money(base * 0.8)}<small>ahorrás ${money(base * 0.2)}</small>`;
    }));
  });

  /* ¿Qué entra? Objetos a escala (10 px = 1 cm) dentro del bolso de 34 × 32 × 12 */
  const OBJ = {
    a4: { n: 'Hoja A4', w: 21, h: 29.7, d: 0.2, shape: 'rect' },
    nb13: { n: 'Notebook 13"', w: 30.4, h: 21.2, d: 1.6, shape: 'rect' },
    nb15: { n: 'Notebook 15"', w: 35.8, h: 24.5, d: 2.4, shape: 'rect' },
    termo: { n: 'Termo 1 L', w: 9, h: 30, d: 9, shape: 'termo' },
    mate: { n: 'Mate', w: 9, h: 18, d: 9, shape: 'mate' },
    paraguas: { n: 'Paraguas', w: 6, h: 28, d: 6, shape: 'rect' },
    billetera: { n: 'Billetera', w: 19, h: 10, d: 2, shape: 'rect' },
  };
  const BAG = { w: 34, h: 32, d: 12 };
  const svgNS = 'http://www.w3.org/2000/svg';
  const g = document.getElementById('fit-objs');
  const verdict = document.getElementById('fit-verdict');
  const boxes = [...document.querySelectorAll('.fit__opts input')];
  const el = (tag, attrs) => { const e = document.createElementNS(svgNS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };

  const draw = () => {
    g.textContent = '';
    const chosen = boxes.filter((b) => b.checked).map((b) => ({ id: b.value, ...OBJ[b.value] }));
    const flat = chosen.filter((o) => o.d < 3);
    const bulky = chosen.filter((o) => o.d >= 3);
    const out = chosen.filter((o) => o.w > BAG.w || o.h > BAG.h + 6);
    let fx = 14, fy = 0;
    flat.forEach((o) => {
      const x = Math.min(fx, 340 - o.w * 10 - 4); const y = 320 - o.h * 10 - fy;
      add(o, x, y); fx += 18; fy += 10;
    });
    let bx = 340 - 12;
    bulky.forEach((o) => { bx -= o.w * 10; add(o, bx, 320 - o.h * 10 - 4); bx -= 8; });

    const bulkyWidth = bulky.reduce((s, o) => s + o.w, 0) + Math.max(0, bulky.length - 1) * 0.8;
    const depth = flat.reduce((s, o) => s + o.d, 0) + Math.max(0, ...bulky.map((o) => o.d), 0);
    if (!chosen.length) verdict.textContent = 'Marcá algo de la lista para verlo adentro.';
    else if (out.length) verdict.textContent = `${out.map((o) => o.n).join(' y ')} no entra: mide ${String(out[0].w).replace('.', ',')} cm de ancho y el bolso, 34.`;
    else if (bulkyWidth > BAG.w - 2 || depth > BAG.d) verdict.textContent = 'Entra, pero justo: el bolso queda lleno y cuesta cerrarlo.';
    else verdict.textContent = 'Entra todo lo que marcaste, y sobra lugar.';
  };
  function add(o, x, y) {
    const isOut = o.w > BAG.w;
    const grp = el('g', { class: 'obj' + (isOut ? ' is-out' : '') });
    const W = o.w * 10, H = o.h * 10;
    if (o.shape === 'termo') {
      grp.appendChild(el('rect', { x, y: y + 22, width: W, height: H - 22, rx: 10 }));
      grp.appendChild(el('rect', { x: x + 14, y, width: W - 28, height: 26, rx: 6 }));
    } else if (o.shape === 'mate') {
      grp.appendChild(el('path', { d: `M${x} ${y + 70} Q${x} ${y + H} ${x + W / 2} ${y + H} Q${x + W} ${y + H} ${x + W} ${y + 70} Z` }));
      grp.appendChild(el('rect', { x: x + W / 2 + 6, y, width: 5, height: 80 }));
    } else {
      grp.appendChild(el('rect', { x, y, width: W, height: H, rx: 3 }));
    }
    const t = el('text', { x: x + W / 2, y: y + H / 2 + 5, 'text-anchor': 'middle' });
    t.textContent = o.n;
    if (W < 70) t.setAttribute('transform', `rotate(-90 ${x + W / 2} ${y + H / 2})`);
    grp.appendChild(t);
    g.appendChild(grp);
  }
  boxes.forEach((b) => b.addEventListener('change', draw));
  draw();

  /* Compartir */
  const share = document.getElementById('share');
  share.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Peumaguen Marroquinería', url: location.href });
      else { await navigator.clipboard.writeText(location.href); share.textContent = 'Link copiado'; }
    } catch (e) { /* cancelado */ }
  });
})();
