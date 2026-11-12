import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BRAND, CATS, SERVICES, DEALS, CHAIN_FACTS, FAQ, chairStatus } from './data.js';
import { useBooking } from './booking.jsx';
import OUTLETS from './outlets.json';
import OutletMap from './components/OutletMap.jsx';

const money = n => `${BRAND.currency}${n.toLocaleString('en-IN')}`;

/* ---------- Splash: a screen of hair that a trimmer shaves away ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const lerp = (a, b, v) => a + (b - a) * v;

// timeline (seconds)
const TL = { toolStart: 0.2, toolEnd: 1.4, glow: 1.2, sweep: 1.5, sweepEnd: 2.4, morph: 1.9, reveal: 2.4, done: 3.1 };

function drawHair(ctx, w, h) {
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  // [colour, alpha, width, share of strands]
  const buckets = [
    ['#0c0c0c', 0.9, 1.0, 0.34], ['#161616', 0.9, 0.9, 0.26], ['#222', 0.85, 0.8, 0.18],
    ['#333', 0.75, 0.7, 0.12], ['#505050', 0.6, 0.6, 0.06], ['#808080', 0.45, 0.55, 0.03], ['#c8c8c8', 0.35, 0.5, 0.01],
  ];
  const total = Math.round((w * h) / 13);
  for (const [col, al, lw, share] of buckets) {
    ctx.strokeStyle = col; ctx.globalAlpha = al; ctx.lineWidth = lw; ctx.beginPath();
    const n = Math.round(total * share);
    for (let i = 0; i < n; i++) {
      const x = Math.random() * (w + 60) - 30, y = Math.random() * (h + 60) - 30;
      // slowly varying flow direction, like fur swept in one direction
      const ang = 0.35 + 0.55 * Math.sin(x / 340 + y / 520) + (Math.random() - 0.5) * 0.5;
      const len = 14 + Math.random() * 30, bend = (Math.random() - 0.5) * 8;
      const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
      ctx.moveTo(x, y); ctx.quadraticCurveTo((x + ex) / 2 + bend * Math.sin(ang), (y + ey) / 2 - bend * Math.cos(ang), ex, ey);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.025)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

// Slim chrome T-blade trimmer, cord attaches at the right end.
function Trimmer() {
  return (
    <svg viewBox="0 0 360 80" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ch1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fafafa" /><stop offset=".45" stopColor="#8d8d8d" /><stop offset=".6" stopColor="#d6d6d6" /><stop offset="1" stopColor="#6a6a6a" /></linearGradient>
        <linearGradient id="ch2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6f6f6f" /><stop offset=".5" stopColor="#f2f2f2" /><stop offset="1" stopColor="#777" /></linearGradient>
      </defs>
      <rect x="26" y="37" width="16" height="6" rx="3" fill="url(#ch1)" />
      <rect x="40" y="4" width="14" height="72" rx="3" fill="url(#ch2)" stroke="#444" strokeWidth=".8" />
      <rect x="54" y="19" width="104" height="9" rx="4.5" fill="url(#ch1)" /><rect x="54" y="52" width="104" height="9" rx="4.5" fill="url(#ch1)" />
      <rect x="54" y="30" width="96" height="20" rx="6" fill="#0c0c0c" />
      <rect x="150" y="14" width="22" height="52" rx="8" fill="url(#ch2)" stroke="#444" strokeWidth=".8" />
      <rect x="172" y="22" width="150" height="36" rx="8" fill="#0d0d0d" />
      <rect x="172" y="24" width="150" height="3" rx="1.5" fill="url(#ch1)" /><rect x="172" y="53" width="150" height="3" rx="1.5" fill="url(#ch1)" />
      <circle cx="196" cy="40" r="7" fill="#1c1c1c" stroke="#555" />
      <rect x="318" y="30" width="22" height="20" rx="6" fill="url(#ch2)" />
      <rect x="338" y="38" width="22" height="4" rx="2" fill="#cfcfcf" />
    </svg>
  );
}

export function Splash() {
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef(null), hairRef = useRef(null), lineRef = useRef(null), trimRef = useRef(null), countRef = useRef(null), skipRef = useRef(() => {});
  const markDone = () => { document.documentElement.dataset.intro = 'done'; document.body.style.overflow = ''; };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const root = rootRef.current;
    const finishNow = () => { markDone(); setOut(true); };
    skipRef.current = finishNow;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { const t = setTimeout(finishNow, 600); return () => clearTimeout(t); }

    const dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    const hair = hairRef.current, line = lineRef.current, trim = trimRef.current;
    for (const c of [hair, line]) { c.width = W * dpr; c.height = H * dpr; }
    const hc = hair.getContext('2d'), lc = line.getContext('2d');
    hc.scale(dpr, dpr); lc.scale(dpr, dpr);
    drawHair(hc, W, H);

    // cord path: starts well off the left edge, runs low, then curves up to the top-right corner
    const X = v => (v * W) / 1000, Y = v => (v * H) / 600;
    const d = `M ${-W * 0.6} ${Y(430)} L ${X(-30)} ${Y(430)} C ${X(300)} ${Y(450)}, ${X(520)} ${Y(400)}, ${X(760)} ${Y(230)} C ${X(1000)} ${Y(60)}, ${X(1020)} ${Y(-10)}, ${X(1080)} ${Y(-40)}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', d);
    const p2d = new Path2D(d), total = path.getTotalLength();
    let s0 = 0; for (let s = 0; s < total; s += 4) if (path.getPointAtLength(s).x >= W * 0.5) { s0 = s; break; }

    const tw = Math.max(220, W * 0.3), th = tw / 4.5;
    trim.style.width = tw + 'px'; trim.style.height = th + 'px';
    const diag = Math.hypot(W, H) * 1.15;
    let raf, t0, morphed = false, revealed = false, ended = false;

    const startMorph = () => {
      const pairs = [['.splash-word .thin', '.hero-word .thin'], ['.splash-word .bold', '.hero-word .bold']];
      pairs.forEach(([a, b]) => {
        const from = document.querySelector(a), to = document.querySelector(b); if (!from || !to) return;
        const fr = from.getBoundingClientRect(), tr = to.getBoundingClientRect(), fs = parseFloat(getComputedStyle(to).fontSize);
        const sc = tr.width / fr.width, dx = tr.left - fr.left, dy = tr.top - fr.top - 0.05 * fs;
        from.style.transformOrigin = '0 0'; from.style.transition = 'transform 1.1s cubic-bezier(.7,0,.2,1), opacity 1.1s, color 1.1s'; from.style.willChange = 'transform';
        from.style.transform = `translate(${dx}px,${dy}px) scale(${sc})`; from.style.color = from.classList.contains('thin') ? '#16161c' : '#a4472f'; from.style.opacity = 0.92;
      });
    };

    const frame = now => {
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      lc.clearRect(0, 0, W, H);

      // 1. the trimmer pulls its cord out to the left
      const pt1 = ease((t - TL.toolStart) / (TL.toolEnd - TL.toolStart));
      const s = lerp(s0, 0, pt1);
      if (t < TL.toolEnd + 0.05) {
        const a = path.getPointAtLength(s), b = path.getPointAtLength(Math.min(s + 3, total)), ang = Math.atan2(b.y - a.y, b.x - a.x);
        trim.style.opacity = 1;
        trim.style.transform = `translate(${a.x - tw}px,${a.y - th / 2}px) rotate(${ang}rad)`;
      } else trim.style.opacity = 0;

      // 2. the cord: thin and grey, then thick and glowing
      const g = ease((t - TL.glow) / 0.5);
      lc.lineCap = 'round'; lc.lineJoin = 'round';
      lc.lineWidth = 2.2 + g * 1.9; lc.strokeStyle = g > 0 ? '#fff' : '#d8d8d8'; lc.shadowColor = '#fff'; lc.shadowBlur = g * 16;
      lc.beginPath(); lc.moveTo(path.getPointAtLength(s).x, path.getPointAtLength(s).y);
      for (let p = s; p <= total; p += 8) { const q = path.getPointAtLength(p); lc.lineTo(q.x, q.y); }
      lc.stroke();

      // 3. the sweep: a black band opens along the cord and eats the hair
      if (t > TL.sweep) {
        const w = 14 + ease((t - TL.sweep) / (TL.sweepEnd - TL.sweep)) * diag;
        hc.globalCompositeOperation = 'destination-out'; hc.lineCap = 'butt'; hc.lineJoin = 'round'; hc.strokeStyle = '#000';
        [[w + 46, 0.18], [w + 22, 0.3], [w, 1]].forEach(([lw, al]) => { hc.globalAlpha = al; hc.lineWidth = lw; hc.stroke(p2d); });
        hc.globalAlpha = 1; hc.globalCompositeOperation = 'source-over';
        if (countRef.current) countRef.current.textContent = 'CHAIR #0';
      }

      // 4. the wordmark glides to its place in the hero, the cord fades and the splash opens onto the hero
      if (!morphed && t > TL.morph) { morphed = true; startMorph(); line.style.opacity = 0; }
      if (!revealed && t > TL.reveal) { revealed = true; root.classList.add('reveal'); }
      if (!ended && t > TL.done) { ended = true; finishNow(); }
      if (!ended) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { if (out) { const t = setTimeout(() => setGone(true), 900); return () => clearTimeout(t); } }, [out]);
  if (gone) return null;
  return (
    <div ref={rootRef} className={`splash${out ? ' out' : ''}`}>
      <canvas ref={hairRef} className="hair-canvas" />
      <div className="splash-word"><span className="thin">{BRAND.first}<em className="amp">&amp;</em></span><span className="bold">{BRAND.second}</span></div>
      <canvas ref={lineRef} className="line-canvas" />
      <div className="trimmer" ref={trimRef}><Trimmer /></div>
      <span className="mono tl">{BRAND.name.toUpperCase()} · {BRAND.hours}</span>
      <span className="mono bl">13.0827° N · 80.2707° E</span>
      <span className="mono br" ref={countRef}>CHAIR #1</span>
      <button className="skip mono" onClick={() => skipRef.current()}>Skip ›</button>
    </div>
  );
}

/* ---------- Nav ---------- */
export function Nav({ home = true }) {
  const { open } = useBooking();
  const h = home ? '' : '/';
  return (
    <header className="nav">
      <a className="logo" href={home ? '#top' : '/'}><img src="/logo.png" alt={BRAND.name} height="28" /></a>
      <nav className="links">
        <a href={`${h}#menu`}>Prices</a><a href={`${h}#deals`}>Deals</a><a href={`${h}#visit`}>Visit</a><a href="/franchise">Franchise</a>
      </nav>
      <button className="pill dark" onClick={() => open()}>Book <i className="arr">↗</i></button>
    </header>
  );
}

/* ---------- Hero ---------- */
export function Hero() {
  const { open } = useBooking();
  const chair = useRef(null);
  const slot = useChair();
  useEffect(() => {
    const move = e => { if (chair.current) chair.current.style.transform = `translateX(calc(-50% + ${(e.clientX / innerWidth - 0.5) * 18}px)) translateY(${(e.clientY / innerHeight - 0.5) * 10}px)`; };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, []);
  return (
    <section className="hero">
      <p className="hero-top">Cheap isn't a compromise.<br /><b>We do the</b></p>
      <div className="status mono"><i className="dot" /> {slot.open ? `Open now · next chair ${slot.label}` : `Closed · opens ${slot.day === 'tomorrow' ? 'tomorrow ' : ''}${slot.label}`}</div>
      <h1 className="hero-word">
        <span className="thin" data-parallax="-0.08">{BRAND.first}<em className="amp">&amp;</em></span>
        <span className="bold" data-parallax="0.08">{BRAND.second}</span>
      </h1>
      <img ref={chair} className="hero-img" src="/hero.png" alt="A salon station with a terracotta barber chair, oval mirror and wash basin" width="1024" height="1024" fetchpriority="high" />
      <div className="hero-bottom">
        <p>Hair cuts from {money(SERVICES[0].price)}. Beard, colour, facials and spa at honest prices. Book in under a minute.</p>
        <div className="btns">
          <button className="pill light" onClick={() => open()}>Book a chair <i className="arr dk">↗</i></button>
          <a className="pill ghost" href="#menu">See prices</a>
        </div>
        <small className="mono">{BRAND.outlets} outlets · open 7 AM – 10 PM</small>
      </div>
    </section>
  );
}

/* ---------- Pointer tools: the icon that follows the hovered service ---------- */
const toolFor = s => {
  const n = s.name.toLowerCase();
  if (n === 'shave' || n === 'head shave') return 'razor';
  if (n.includes('trim') || n.includes('beard design')) return 'trimmer';
  if (s.cat === 'Hair') return 'scissors';
  if (s.cat === 'Beard') return 'trimmer';
  if (s.cat === 'Colour') return 'brush';
  if (s.cat === 'Skin' || s.cat === 'Massage') return 'bottle';
  return 'file';
};
const M = '#e6e6e6', D = '#9a9aa3', K = '#3a3a40';
function ToolIcon({ kind }) {
  const g = <defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stopColor="#222" /><stop offset=".5" stopColor="#d4d4d4" /><stop offset="1" stopColor="#222" /></linearGradient></defs>;
  switch (kind) {
    case 'trimmer': return (<svg viewBox="0 0 60 150">{g}
      <rect x="12" y="6" width="36" height="26" rx="3" fill="url(#tg)" /><path d="M16 6v14M21 6v14M26 6v14M31 6v14M36 6v14M41 6v14M46 6v14" stroke="#222" strokeWidth="1.5" />
      <rect x="15" y="30" width="30" height="108" rx="12" fill={K} stroke={D} strokeWidth="2" /><circle cx="30" cy="56" r="6" fill={M} /><rect x="26" y="78" width="8" height="30" rx="4" fill="#222" /></svg>);
    case 'razor': return (<svg viewBox="0 0 60 150">{g}
      <rect x="10" y="30" width="40" height="14" rx="3" fill="url(#tg)" /><rect x="14" y="44" width="32" height="12" rx="2" fill={D} /><path d="M18 50h24" stroke="#222" strokeWidth="2" />
      <rect x="26" y="56" width="8" height="88" rx="4" fill={K} stroke={D} strokeWidth="2" /></svg>);
    case 'brush': return (<svg viewBox="0 0 60 150">
      <path d="M30 4C16 22 14 42 20 56h20c6-14 4-34-10-52Z" fill={M} /><path d="M24 30v22M30 22v30M36 30v22" stroke="#999" strokeWidth="1.5" />
      <rect x="19" y="56" width="22" height="16" rx="2" fill={D} /><path d="M24 72h12l-3 72h-6Z" fill={K} stroke={D} strokeWidth="2" /></svg>);
    case 'bottle': return (<svg viewBox="0 0 60 150">
      <rect x="22" y="4" width="16" height="22" rx="4" fill={M} /><rect x="25" y="26" width="10" height="16" fill={D} />
      <rect x="12" y="42" width="36" height="100" rx="14" fill={K} stroke={D} strokeWidth="2" /><rect x="19" y="72" width="22" height="34" rx="3" fill="none" stroke={M} strokeWidth="2" /><path d="M23 84h14M23 92h10" stroke={M} strokeWidth="2" /></svg>);
    case 'file': return (<svg viewBox="0 0 60 150">
      <rect x="20" y="4" width="20" height="104" rx="10" fill={M} /><path d="M24 20l12 8M24 34l12 8M24 48l12 8M24 62l12 8M24 76l12 8" stroke="#777" strokeWidth="1.5" /><rect x="22" y="104" width="16" height="42" rx="6" fill={K} stroke={D} strokeWidth="2" /></svg>);
    default: return (<svg viewBox="0 0 60 150">{g}
      <path d="M30 78 L18 4 L24 3 L33 76Z" fill="url(#tg)" /><path d="M30 78 L42 4 L36 3 L27 76Z" fill="url(#tg)" /><circle cx="30" cy="80" r="3" fill="#aaa" />
      <circle cx="18" cy="120" r="14" fill="none" stroke={M} strokeWidth="6" /><circle cx="42" cy="120" r="14" fill="none" stroke={M} strokeWidth="6" /><path d="M26 92 L22 108M34 92 L38 108" stroke={M} strokeWidth="5" strokeLinecap="round" /></svg>);
  }
}

/* ---------- Live chair status (re-checked every 30 seconds) ---------- */
function useChair() {
  const [c, setC] = useState(() => chairStatus());
  useEffect(() => { const id = setInterval(() => setC(chairStatus()), 30000); return () => clearInterval(id); }, []);
  return c;
}

/* ---------- Services / price list ---------- */
export function Services() {
  const { open } = useBooking();
  const [cat, setCat] = useState(CATS[0]);
  const [active, setActive] = useState(0);
  const list = SERVICES.map((s, i) => ({ ...s, i })).filter(s => s.cat === cat);
  const sec = useRef(null), clip = useRef(null), rows = useRef([]);
  const place = () => {
    const li = rows.current[active]; if (!li || !sec.current || !clip.current) return;
    const a = li.getBoundingClientRect(), b = sec.current.getBoundingClientRect();
    clip.current.style.transform = `translate(${a.width * 0.29}px,${a.top - b.top - 70}px)`;
  };
  useLayoutEffect(place, [active, cat]);
  useEffect(() => { addEventListener('resize', place); addEventListener('load', place); return () => { removeEventListener('resize', place); removeEventListener('load', place); }; });
  return (
    <section className="dark menu" id="menu" ref={sec}>
      <p className="tag mono">#1 · The price list</p>
      <h2>Every service has <b>a fair price.</b></h2>
      <p className="sub">Real prices, listed upfront. No hidden extras, no upsell at the chair.</p>
      <div className="cat-tabs">{CATS.map(c => <button key={c} className={`cat${c === cat ? ' on' : ''}`} onClick={() => { setCat(c); setActive(0); }}>{c}</button>)}</div>
      <ul className="rows">
        {list.map((s, k) => (
          <li key={s.name} ref={el => (rows.current[k] = el)} className={k === active ? 'on' : ''} onMouseEnter={() => setActive(k)}>
            <span className="n">#{k}</span>
            <span className="nm"><TextRoll>{s.name}</TextRoll><small>{s.desc}</small></span>
            <span className="mn">{s.min ? `${s.min} min` : ''}</span>
            <span className="pr">{money(s.price)}</span>
            <button className="bk" onClick={() => open({ service: s.i })}>Book ↗</button>
          </li>
        ))}
      </ul>
      <div className="clipper" ref={clip} aria-hidden="true"><div className="tool-pop" key={toolFor(list[active] || list[0])}><ToolIcon kind={toolFor(list[active] || list[0])} /></div></div>
      <div className="deposit"><b>Free</b><span className="mono">Booking, pay at the chair.</span></div>
    </section>
  );
}

/* ---------- Deals + gift card ---------- */
export function Deals() {
  const { open } = useBooking();
  const [sel, setSel] = useState(0);
  const d = DEALS[sel];
  const label = x => x.name.replace('Head massage, coconut oil', 'Head massage (coconut oil)');
  return (
    <section className="dark combos" id="deals">
      <p className="tag mono">#2 · Combos</p>
      <h2>Popular <b>combos.</b></h2>
      <p className="sub">Pick a combo to see everything in it. Prices are the listed prices added together.</p>
      <div className="combo-grid">
        <article className="combo-card" key={sel}>
          <span className="mono tiny">Selected combo</span>
          <h3>{d.items.length} services, one visit</h3>
          <ul>
            {d.items.map(x => (
              <li key={x.name}><span><i>✓</i>{label(x)}{x.min ? <small className="mono">{x.min} min</small> : null}</span><b>{money(x.price)}</b></li>
            ))}
          </ul>
          <div className="combo-total"><span className="mono">Total</span><b>{money(d.price)}</b></div>
          <button className="pill light" onClick={() => open({ services: d.items.map(x => x.i) })}>Book this combo <i className="arr dk">↗</i></button>
          <p className="combo-note mono">Pay at the chair. Booking is free.</p>
        </article>
        <ul className="combo-list" role="listbox" aria-label="Combos">
          {DEALS.map((x, i) => (
            <li key={x.title}>
              <button role="option" aria-selected={i === sel} className={i === sel ? 'on' : ''} onClick={() => setSel(i)}>
                <span className="mono n">{String(i + 1).padStart(2, '0')}</span>
                <span className="t"><TextRoll>{x.title}</TextRoll></span>
                <b>{money(x.price)}</b>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Count-up: runs once when scrolled into view ---------- */
export function CountUp({ to, prefix = '', suffix = '', ms = 1600, className }) {
  const el = useRef(null), [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(to); return; }
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = t => { const k = Math.min((t - t0) / ms, 1); setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, ms]);
  return <span ref={el} className={className}>{prefix}{n.toLocaleString('en-IN')}{suffix}</span>;
}

/* ---------- The chain (real facts from their site, no invented reviews) ---------- */
export function Chain() {
  const [i, setI] = useState(0), [swap, setSwap] = useState(false);
  const go = () => { setSwap(true); setTimeout(() => { setI(n => (n + 1) % CHAIN_FACTS.length); setSwap(false); }, 280); };
  return (
    <section className="light reviews">
      <p className="tag mono">#6 · The chain</p>
      <div className="big"><CountUp to={365} suffix="+" ms={2000} /></div>
      <blockquote className={`rev${swap ? ' swap' : ''}`}><p>{CHAIN_FACTS[i][0]}</p><cite className="mono">{CHAIN_FACTS[i][1]}</cite></blockquote>
      <button className="next mono" onClick={go}>{i + 1} / {CHAIN_FACTS.length} · Next →</button>
      <div className="chain-foot">
        <dl className="chain-stats">
          <div><dt className="mono">Outlets on our map</dt><dd><CountUp to={OUTLETS.length} /></dd></div>
          <div><dt className="mono">Services</dt><dd><CountUp to={SERVICES.length} /></dd></div>
          <div><dt className="mono">Prices from</dt><dd><CountUp to={Math.min(...SERVICES.map(x => x.price))} prefix={BRAND.currency} /></dd></div>
          <div><dt className="mono">Open hours a day</dt><dd><CountUp to={(BRAND.closeMin - BRAND.openMin) / 60} /></dd></div>
        </dl>
        <div className="family">
          <b>Be part of our family.</b>
          <span className="mono">Open a Cheap &amp; Best outlet near you.</span>
          <a className="pill dkp" href={BRAND.franchiseUrl}>Join the family <i className="arr">↗</i></a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Visit: real outlet map ---------- */
export function Visit() {
  return (
    <section className="dark visit" id="visit">
      <p className="tag mono">#6 · Find the chair</p>
      <h2>Find your <b>nearest outlet.</b></h2>
      <p className="sub">Every pin is a real outlet from our store locator. Search by area, or tap Near me.</p>
      <OutletMap />
    </section>
  );
}

/* ---------- Footer ---------- */
export function Footer({ home = true }) {
  const { open } = useBooking();
  const h = home ? '' : '/';
  const chair = useChair();
  return (
    <footer className="foot dark">
      <div className="cta"><h3>{chair.open ? <>A chair is free <b>at {chair.label}.</b></> : <>We open <b>{chair.day === 'tomorrow' ? 'tomorrow ' : ''}at {chair.label}.</b></>}</h3><button className="pill light" onClick={() => open()}>Book a chair <i className="arr dk">↗</i></button></div>
      <address className="foot-addr">
        <span className="mono">Corporate office</span>
        <b>{BRAND.company}</b>
        {BRAND.address[0]}, {BRAND.address[1]}
        <a className="mono" href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
        <a className="mono" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
      </address>
      <img className="foot-logo" src="/logo.png" alt={BRAND.name} height="34" />
      <div className="mega"><span className="thin">{BRAND.first}</span> <em className="amp">&amp;</em> <span className="bold">{BRAND.second}</span></div>
      <div className="foot-links mono"><span><a href={`${h}#menu`}>Prices</a> · <a href={`${h}#deals`}>Deals</a> · <a href={`${h}#visit`}>Visit</a> · <a href="/franchise">Franchise</a> · <a href={BRAND.instagram} target="_blank" rel="noreferrer">Instagram</a> · <a href={BRAND.facebook} target="_blank" rel="noreferrer">Facebook</a></span><span className="r">© 2026 {BRAND.company}. </span></div>
    </footer>
  );
}

/* ---------- FAQ ---------- */
export function ChatItem({ q, a, open, toggle }) {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!open) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 650);
    return () => clearTimeout(t);
  }, [open]);
  return (
    <div className={`chat-item${open ? ' open' : ''}`}>
      <button className="bubble q" onClick={toggle} aria-expanded={open}>{q}</button>
      <div className="ans-wrap" aria-hidden={!open}>
        <div className="ans-in">
          <div className="bot">
            <img className="avatar" src="/favicon.png" alt="" width="32" height="32" />
            <div className={`bubble a${typing ? ' typing' : ''}`} aria-live="polite">
              {typing ? <span className="dots" aria-label="Typing"><i /><i /><i /></span> : a}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const [o, setO] = useState(0);
  return (
    <section className="dark faq" id="faq">
      <p className="tag mono">#5 · Good to know</p>
      <h2>Questions, <b>answered.</b></h2>
      <p className="sub">Tap a question and we'll answer it.</p>
      <div className="chat">
        {FAQ.map(([q, a], i) => <ChatItem key={q} q={q} a={a} open={o === i} toggle={() => setO(o === i ? -1 : i)} />)}
      </div>
    </section>
  );
}

/* ---------- Text roll: each letter rolls up and is replaced by a copy when the parent row is hovered ---------- */
export function TextRoll({ children }) {
  const t = String(children);
  return (
    <span className="roll" aria-label={t}>
      {[...t].map((c, i) => (
        <span key={i} className="ch" aria-hidden="true" style={{ '--i': i }}>
          <span>{c === ' ' ? '\u00a0' : c}</span><span>{c === ' ' ? '\u00a0' : c}</span>
        </span>
      ))}
    </span>
  );
}

/* ---------- Cursor ---------- */
export function Cursor() {
  const el = useRef(null);
  useEffect(() => {
    const move = e => { el.current.style.opacity = 1; el.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; };
    const over = e => el.current.classList.toggle('hot', !!e.target.closest('a,button,input,label,.rows li,.maplibregl-canvas'));
    const out = e => { if (!e.relatedTarget) el.current.style.opacity = 0; };
    addEventListener('pointermove', move); document.addEventListener('pointerover', over); document.addEventListener('pointerout', out);
    return () => { removeEventListener('pointermove', move); document.removeEventListener('pointerover', over); document.removeEventListener('pointerout', out); };
  }, []);
  return <div className="cursor" ref={el} />;
}
