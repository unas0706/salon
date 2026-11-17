(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- data (placeholders: edit freely) ---------- */
const SERVICES = [
  { n: 0, name: 'Skin fade', desc: 'Down to the skin, blended at any length on top.', min: 45, price: 55 },
  { n: 1, name: 'Taper', desc: 'Clean neckline and sideburns, length kept on the sides.', min: 40, price: 50 },
  { n: 2, name: 'Scissor cut', desc: 'No clippers. Shape and texture, all by hand.', min: 50, price: 60 },
  { n: 3, name: 'Line-up', desc: 'Edges and beard sharpened, nothing else.', min: 15, price: 25 },
];
const BARBERS = [
  { name: 'Dre', spec: 'Fades & tapers', yrs: 9, lang: 'English', free: 'Today 3:00 PM' },
  { name: 'Malik', spec: 'Line-ups & designs', yrs: 6, lang: 'English', free: 'Today 3:40 PM' },
  { name: 'Tomás', spec: 'Scissor work', yrs: 10, lang: 'English, Spanish', free: 'Today 4:20 PM' },
  { name: 'Yusuf', spec: 'Shaves & beards', yrs: 11, lang: 'English, Arabic', free: 'Today 5:00 PM' },
];
const CUTS = [
  { name: 'Skin fade + part', price: 55, by: 'Dre' }, { name: 'Curl taper', price: 50, by: 'Malik' },
  { name: 'French crop', price: 60, by: 'Tomás' }, { name: 'Low fade', price: 55, by: 'Dre' },
  { name: 'Textured top', price: 60, by: 'Tomás' }, { name: 'Beard sculpt', price: 35, by: 'Yusuf' },
];
const PRODUCTS = [
  { name: 'Matte clay', note: 'Medium hold, no shine.', price: 22 },
  { name: 'Pomade', note: 'High shine, water based.', price: 20 },
  { name: 'Beard oil', note: 'Cedar and amber.', price: 18 },
  { name: 'Sea salt spray', note: 'Texture, light hold.', price: 16 },
];
const REVIEWS = [
  ['“The reminder text saved me. I had completely forgotten, and the deposit came off the bill like they said.”', 'Jordan · Neighborhood 1 · Taper'],
  ['“Best fade I\'ve had in years. Booked my next one before I stood up.”', 'Sam · Neighborhood 2 · Skin fade'],
  ['“No DMs, no waiting. Picked a time, showed up, done.”', 'Alex · Neighborhood 3 · Line-up'],
  ['“He actually listened to what I wanted. Rare.”', 'Chris · Neighborhood 4 · Scissor cut'],
];

/* ---------- splash ---------- */
const splash = $('#splash');
const closeSplash = () => splash.classList.add('out');
$('#skip').addEventListener('click', closeSplash);
setTimeout(closeSplash, 3800);

/* ---------- hero parallax ---------- */
const par = $$('[data-parallax]');
addEventListener('scroll', () => {
  const y = scrollY;
  par.forEach(el => el.style.translate = `0 ${y * parseFloat(el.dataset.parallax) * 4}px`);
}, { passive: true });
addEventListener('pointermove', e => {
  const x = (e.clientX / innerWidth - .5), c = $('.chair');
  if (c) c.style.transform = `translateX(calc(-50% + ${x * 22}px))`;
});

/* ---------- services menu + clipper ---------- */
const rows = $('#rows'), clip = $('#clipper');
rows.innerHTML = SERVICES.map((s, i) => `
  <li data-i="${i}" class="${i === 1 ? 'on' : ''}">
    <span class="n">#${s.n}</span>
    <span class="nm">${s.name}<small>${s.desc}</small></span>
    <span class="mn">${s.min} min</span><span class="pr">$${s.price}</span>
    <button class="bk" data-book data-service="${i}">Book ↗</button>
  </li>`).join('');
const moveClip = li => {
  const sec = $('#menu'), a = li.getBoundingClientRect(), b = sec.getBoundingClientRect();
  clip.style.transform = `translate(${a.width * .38}px,${a.top - b.top - 70}px) rotate(${(Math.random() * 10 - 5).toFixed(1)}deg)`;
};
$$('li', rows).forEach(li => li.addEventListener('mouseenter', () => {
  $$('li', rows).forEach(x => x.classList.toggle('on', x === li)); moveClip(li);
}));
addEventListener('load', () => moveClip($('li.on', rows)));
addEventListener('resize', () => moveClip($('li.on', rows)));

/* ---------- draggable tools (momentum + spin) ---------- */
$$('.tool').forEach(el => {
  let x = 0, y = 0, rot = 0, drag = false, sx, sy, ox, oy, vx = 0, vy = 0, last;
  const apply = () => el.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg)`;
  el.addEventListener('pointerdown', e => { drag = true; el.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; ox = x; oy = y; last = e; });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    x = ox + e.clientX - sx; y = oy + e.clientY - sy;
    vx = e.clientX - last.clientX; vy = e.clientY - last.clientY; last = e;
    rot += vx * .6; apply();
  });
  const end = () => {
    if (!drag) return; drag = false;
    (function glide() {
      vx *= .92; vy *= .92; x += vx; y += vy; rot += vx * .6; apply();
      if (Math.abs(vx) + Math.abs(vy) > .3) requestAnimationFrame(glide);
    })();
  };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  el.addEventListener('click', () => { rot += 90; el.style.transition = 'transform .5s'; apply(); setTimeout(() => el.style.transition = '', 500); });
});

/* ---------- barber cards ---------- */
const cards = $('#cards');
cards.innerHTML = BARBERS.map((b, i) => `
  <article class="bcard ${i === 2 ? 'on' : ''}" data-i="${i}">
    <div class="silh"></div><span class="num mono">#${i + 1}</span>
    <h4>${b.name}</h4>
    <div class="meta mono"><span>${b.spec}</span><span>${b.yrs} yrs</span><span>${b.lang}</span><span>Next free ${b.free}</span></div>
    <button class="pill light sm" data-book data-barber="${i}">Book with ${b.name} ↗</button>
  </article>`).join('');
$$('.bcard', cards).forEach(c => c.addEventListener('click', () => $$('.bcard', cards).forEach(x => x.classList.toggle('on', x === c))));

/* ---------- gallery ---------- */
const filters = $('#filters'), grid = $('#grid');
['All', ...BARBERS.map(b => b.name)].forEach((n, i) => {
  const b = document.createElement('button'); b.className = 'chip' + (i ? '' : ' on'); b.textContent = n;
  b.onclick = () => {
    $$('.chip', filters).forEach(x => x.classList.toggle('on', x === b));
    $$('.pic', grid).forEach(p => p.classList.toggle('hide', n !== 'All' && p.dataset.by !== n));
  };
  filters.append(b);
});
grid.innerHTML = CUTS.map((c, i) => `
  <div class="pic" data-by="${c.by}" data-book data-cut="${i}">
    <span class="hv mono">Hover · ${i % 2 ? 'Side' : 'Back'}</span><div class="face"></div>
    <div class="cap"><span>${c.name}<small class="mono">Book this cut</small></span><span>$${c.price}</span></div>
  </div>`).join('');

/* ---------- gift ---------- */
const amtEl = $('#giftAmt');
$$('#amts .chip').forEach(b => b.onclick = () => {
  $$('#amts .chip').forEach(x => x.classList.toggle('on', x === b)); amtEl.textContent = b.dataset.v;
});
$('#sendGift').onclick = () => alert(`Concept demo: a $${amtEl.textContent} gift card would be sent here.`);

/* ---------- shelf ---------- */
$('#products').innerHTML = PRODUCTS.map(p => `
  <div class="prod"><div class="img"><i></i></div><h5>${p.name}</h5><p>${p.note}</p>
  <div class="row"><b>$${p.price}</b><button class="pill ghost sm">Add</button></div></div>`).join('');

/* ---------- reviews ---------- */
let ri = 0; const rev = $('#rev');
const showRev = () => { rev.classList.add('swap'); setTimeout(() => {
  $('p', rev).textContent = REVIEWS[ri][0]; $('cite', rev).textContent = REVIEWS[ri][1];
  $('#revN').textContent = `${ri + 1} / ${REVIEWS.length}`; rev.classList.remove('swap'); }, 280); };
$('#revNext').onclick = () => { ri = (ri + 1) % REVIEWS.length; showRev(); };
$('p', rev).textContent = REVIEWS[0][0]; $('cite', rev).textContent = REVIEWS[0][1];

/* ---------- booking modal ---------- */
const modal = $('#modal'), steps = $$('.steps section'), next = $('#mNext'), back = $('#mBack');
const state = { step: 1, service: null, barber: null, day: null, time: null };
const fmtDay = d => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

$('#optService').innerHTML = SERVICES.map((s, i) => `<button class="opt" data-i="${i}"><span class="av mono">#${s.n}</span><span><b>${s.name}</b><small>${s.min} min · $${s.price}</small></span><span class="go">→</span></button>`).join('');
$('#optBarber').innerHTML = `<button class="opt" data-i="-1"><span class="av">◷</span><span><b>First free chair</b><small>Whoever is free first</small></span><span class="go">→</span></button>` +
  BARBERS.map((b, i) => `<button class="opt" data-i="${i}"><span class="av">${b.name[0]}</span><span><b>${b.name}</b><small>${b.spec} · ${b.yrs} yrs</small></span><span class="go">→</span></button>`).join('');

const today = new Date(); const DAYS = [...Array(7)].map((_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
$('#days').innerHTML = DAYS.map((d, i) => `<button class="day mono" data-i="${i}">${i ? d.toLocaleDateString('en-US', { weekday: 'short' }) : 'Today'}<b>${d.getDate()}</b></button>`).join('');

function buildSlots() {
  const out = []; for (let m = 9 * 60; m <= 20 * 60; m += 20) out.push(m);
  const now = today.getHours() * 60 + today.getMinutes();
  $('#slots').innerHTML = out.map(m => {
    const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'), label = `${((h + 11) % 12) + 1}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
    const taken = (m * 7 + state.day * 13) % 5 === 0 || (state.day === 0 && m <= now);
    return `<button class="slot mono" ${taken ? 'disabled' : ''}>${label}</button>`;
  }).join('');
}

function render() {
  steps.forEach(s => s.classList.toggle('show', +s.dataset.step === state.step));
  const sv = SERVICES[state.service], br = state.barber === -1 ? { name: 'First free' } : BARBERS[state.barber];
  $('#mSum').textContent = [sv && `${sv.name} · $${sv.price}`, br && br.name, state.time].filter(Boolean).join(' · ');
  back.style.visibility = state.step === 5 ? 'hidden' : 'visible';
  next.textContent = state.step === 4 ? 'Pay $10 deposit' : state.step === 5 ? 'Done' : 'Continue';
  const ok = { 1: state.service !== null, 2: state.barber !== null, 3: state.time, 4: $('#fName').value.trim() && $('#fPhone').value.replace(/\D/g, '').length >= 7, 5: true }[state.step];
  next.disabled = !ok;
}
function open(pre = {}) {
  Object.assign(state, { step: 1, service: null, barber: null, day: 0, time: null }, pre);
  if (pre.service != null) state.step = pre.barber != null ? 3 : 2;
  $$('.opt,.day,.slot').forEach(x => x.classList.remove('on')); $$('.day')[0].classList.add('on');
  if (state.service != null) $$('#optService .opt')[state.service]?.classList.add('on');
  if (state.barber != null) $$('#optBarber .opt')[state.barber + 1]?.classList.add('on');
  buildSlots(); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; render();
}
const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };

document.addEventListener('click', e => {
  const t = e.target.closest('[data-book]'); if (!t) return;
  e.stopPropagation();
  const pre = {};
  if (t.dataset.service != null) pre.service = +t.dataset.service;
  if (t.dataset.barber != null) { pre.barber = +t.dataset.barber; pre.service = pre.service ?? null; }
  if (t.dataset.cut != null) { const c = CUTS[+t.dataset.cut]; pre.service = SERVICES.findIndex(s => s.price === c.price); if (pre.service < 0) pre.service = 0; pre.barber = BARBERS.findIndex(b => b.name === c.by); }
  open(pre);
});
$('#optService').addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b) return; state.service = +b.dataset.i; $$('#optService .opt').forEach(x => x.classList.toggle('on', x === b)); render(); });
$('#optBarber').addEventListener('click', e => { const b = e.target.closest('.opt'); if (!b) return; state.barber = +b.dataset.i; $$('#optBarber .opt').forEach(x => x.classList.toggle('on', x === b)); render(); });
$('#days').addEventListener('click', e => { const b = e.target.closest('.day'); if (!b) return; state.day = +b.dataset.i; state.time = null; $$('.day').forEach(x => x.classList.toggle('on', x === b)); buildSlots(); render(); });
$('#slots').addEventListener('click', e => { const b = e.target.closest('.slot'); if (!b || b.disabled) return; state.time = b.textContent; $$('.slot').forEach(x => x.classList.toggle('on', x === b)); render(); });
['fName', 'fPhone', 'fCard'].forEach(id => $('#' + id).addEventListener('input', render));
$('#fCard').addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim());

next.onclick = () => {
  if (state.step === 5) return close();
  if (state.step === 4) {
    const sv = SERVICES[state.service], br = state.barber === -1 ? BARBERS[0] : BARBERS[state.barber], d = DAYS[state.day];
    $('#summary').innerHTML = `<dt>Service</dt><dd>${sv.name} · ${sv.min} min</dd><dt>Barber</dt><dd>${br.name}</dd><dt>When</dt><dd>${fmtDay(d)}, ${state.time}</dd><dt>Paid now</dt><dd>$10 deposit · $${sv.price - 10} at the chair</dd>`;
    $('#confNote').textContent = `We'll text ${$('#fPhone').value} the day before. Concept demo, nothing was charged.`;
  }
  state.step++; render();
};
back.onclick = () => { if (state.step > 1) { state.step--; render(); } else close(); };
$('#mClose').onclick = close;
modal.addEventListener('click', e => { if (e.target === modal) close(); });
addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
$('#addCal').onclick = () => alert('Concept demo: calendar file would download here.');

/* ---------- custom cursor ---------- */
const cur = $('#cursor');
addEventListener('pointermove', e => { cur.style.opacity = 1; cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
document.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('.tool,.pic,.bcard')));
})();
