import { useEffect, useRef, useState } from 'react';
import { BRAND, STATS, FAMILIES, INNOVATIONS, REWARDS, STORY, PROOF, STATES, stateUrl, tel } from './data.js';
import { useBooking } from './booking.jsx';

const n2 = i => String(i + 1).padStart(2, '0');
const img = k => `/lk/${k}.jpg`;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Mixed type: letters in {braces} are set in the script face.
   Each line sits in its own mask so headings can rise in line by line. ---------- */
export function Mix({ children, as: T = 'span', className = '' }) {
  const text = String(children);
  return (
    <T className={`mix ${className}`} aria-label={text.replace(/[{}]/g, '')}>
      {text.split('\n').map((line, l) => (
        <span key={l} className="ln" aria-hidden="true" style={{ '--i': l }}>
          <span>{line.split(/(\{[^}]+\})/).map((p, i) => (p.startsWith('{') ? <span key={i} className="sc">{p.slice(1, -1)}</span> : p))}</span>
        </span>
      ))}
    </T>
  );
}

/* ---------- Count-up number: "4,000+" counts from 0 when scrolled into view ---------- */
export function Count({ value, from = 0, dur = 2000 }) {
  const m = String(value).match(/^(\D*)([\d,]+)(.*)$/);
  const end = m ? +m[2].replace(/,/g, '') : 0;
  const group = m && m[2].includes(',');
  const ref = useRef(null);
  const [n, setN] = useState(from);
  useEffect(() => {
    if (!m) return;
    if (reduced()) { setN(end); return; }
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur);
        const k = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // ease-out expo
        setN(Math.round(from + (end - from) * k));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  if (!m) return value;
  return (
    <span ref={ref} className="count">
      <span className="sr">{value}</span>
      <span aria-hidden="true">{m[1]}{group ? n.toLocaleString('en-IN') : n}{m[3]}</span>
    </span>
  );
}

export function Label({ children, className = '' }) { return <p className={`lbl ${className}`}>{children}</p>; }

/* ---------- Nav (sits on the hero, turns solid cream once scrolled) ---------- */
const LINKS = [['Services', '#services'], ['Innovations', '#innovations'], ['Runway Rewards', '#rewards'], ['Bridal', '#bridal'], ['Salons', '#salons'], ['Franchise', '/franchise']];
export function Nav({ home = true }) {
  const { open } = useBooking();
  const [solid, setSolid] = useState(!home);
  const [menu, setMenu] = useState(false);
  const [hide, setHide] = useState(false);
  const bar = useRef(null);
  useEffect(() => {
    let last = scrollY;
    const on = () => {
      const y = scrollY;
      if (home) setSolid(y > innerHeight * 0.8);
      setHide(y > innerHeight && y > last + 2 ? true : y < last - 2 ? false : h => h);
      last = y;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    on(); addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, [home]);
  useEffect(() => { document.body.classList.toggle('lock', menu); }, [menu]);
  const href = h => (h.startsWith('#') && !home ? `/${h}` : h);
  return (
    <header className={`nav${solid ? ' solid' : ''}${menu ? ' open' : ''}${hide && !menu ? ' hide' : ''}`}>
      <span className="progress" ref={bar} aria-hidden="true" />
      <a className="nav-logo" href={home ? '#top' : '/'}><img src="/lk/logo.png" alt="Lakmé Salon" width="147" height="30" /></a>
      <nav className="nav-cols" aria-label="Main">
        <div>{LINKS.slice(0, 3).map(([t, h]) => <a key={h} href={href(h)}>{t}</a>)}</div>
        <div>{LINKS.slice(3).map(([t, h]) => <a key={h} href={href(h)}>{t}</a>)}</div>
        <div><a href={tel(BRAND.tollFree)}>{BRAND.tollFree}</a><a href={BRAND.shop} target="_blank" rel="noreferrer">Shop ↗</a></div>
      </nav>
      <button className="nav-book" onClick={() => open()}>Book appointment <span aria-hidden="true">↗</span></button>
      <button className="burger" aria-label={menu ? 'Close menu' : 'Menu'} aria-expanded={menu} onClick={() => setMenu(m => !m)}><i /><i /></button>
      {menu && (
        <div className="drawer" onClick={e => e.target.closest('a,button') && setMenu(false)}>
          {LINKS.map(([t, h], i) => <a key={h} href={href(h)} style={{ '--i': i }}><span className="lbl">{n2(i)}</span>{t}</a>)}
          <button className="btn" onClick={() => open()}>Book appointment</button>
          <a className="lbl" href={tel(BRAND.tollFree)}>Toll free · {BRAND.tollFree}</a>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero ---------- */
export function Hero() {
  const { open } = useBooking();
  return (
    <section className="hero" id="top">
      <div className="hero-bg" data-parallax="0.35" aria-hidden="true">
        <img src={img('bridal-2')} alt="" /><img src={img('hair')} alt="" /><img src={img('bridal-6')} alt="" />
      </div>
      <p className="hero-kicker lbl">India’s first chain of beauty salons</p>
      <h1 className="hero-h"><Mix>{'{Y}OUR {V}ISION,\n{O}UR {E}XPERTISE'}</Mix></h1>
      <p className="hero-sub">Hair, skin, makeup and bridal artistry from 4,000+ experts, in 450+ Lakmé Salons across 160+ cities.</p>
      <div className="hero-foot">
        <div><p className="lbl">Since {BRAND.since}</p><p className="lbl dim">For him &amp; her</p></div>
        <button className="btn light" onClick={() => open()}>Book appointment</button>
        <div className="r"><p className="lbl">Toll free</p><a className="lbl dim" href={tel(BRAND.tollFree)}>{BRAND.tollFree}</a></div>
      </div>
    </section>
  );
}

/* ---------- Intro / who we are ---------- */
export function Intro() {
  return (
    <section className="sec intro" id="about">
      <Label className="side">Who we are</Label>
      <div className="main">
        <h2 className="h-xl"><Mix>{'{T}HE {S}ALON {T}HAT\n{S}TARTED {I}T {A}LL'}</Mix></h2>
        <p className="body narrow">Our journey began with the launch of our first salon in 1980. Four decades and a partnership with Lakmé Fashion Week later, Lakmé Salon is India’s leading chain of beauty salons. {BRAND.purpose}</p>
        <a className="lbl ul" href="#story">Discover our story</a>
        <figure className="intro-pic"><img src={img('bridal-1')} alt="A Lakmé Salon bridal look" loading="lazy" /></figure>
        <dl className="stats">
          {STATS.map(([v, k], i) => <div key={k} style={{ '--d': `${i * 90}ms` }}><dt className="lbl dim">{n2(i)}</dt><dd><b><Count value={v} /></b><span className="lbl">{k}</span></dd></div>)}
        </dl>
      </div>
    </section>
  );
}

/* ---------- Curated services: numbered cards on alternating columns ---------- */
export function Services() {
  const { open } = useBooking();
  return (
    <section className="sec svc" id="services">
      <Label className="side">Signature services</Label>
      <div className="main"><h2 className="h-xl"><Mix>{'{B}ACKSTAGE {S}KILLS,\n{E}VERY {D}AY'}</Mix></h2></div>
      <div className="svc-grid">
        {FAMILIES.map((f, i) => (
          <article key={f.key} className={`svc-card c${i % 2}`}>
            <p className="lbl dim">{n2(i)}</p>
            <button className="svc-img" onClick={() => open({ cat: f.key })} aria-label={`Book ${f.title}`}><img src={img(f.img)} alt="" loading="lazy" /></button>
            <div className="svc-meta">
              <h3 className="lbl">{f.title}</h3>
              <ul className="lbl dim">{f.items.slice(0, 3).map(x => <li key={x}>{x}</li>)}</ul>
              <button className="lbl ul" onClick={() => open({ cat: f.key })}>Explore service</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Innovations: framed carousel, big type crossing the photo ---------- */
export function Innovations() {
  const { open } = useBooking();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = d => { setDir(d); setI(x => (x + d + INNOVATIONS.length) % INNOVATIONS.length); };
  useEffect(() => {
    if (reduced()) return;
    const t = setTimeout(() => go(1), 6000);
    return () => clearTimeout(t);
  }, [i]);
  const s = INNOVATIONS[i];
  return (
    <section className="sec inno" id="innovations">
      <div className="frame">
        <Label className="c">Innovation services</Label>
        <div className={`inno-stage ${dir > 0 ? 'fwd' : 'back'}`}>
          <button className="arrow l" onClick={() => go(-1)} aria-label="Previous">←</button>
          <figure className="inno-pic" key={s.img}><img src={img(s.img)} alt={s.plain} /></figure>
          <h2 className="inno-h" key={s.name}><Mix>{s.name}</Mix></h2>
          <button className="arrow r" onClick={() => go(1)} aria-label="Next">→</button>
        </div>
        <div className="inno-foot">
          <div key={i} className="inno-info"><p className="lbl">{n2(i)} / {n2(INNOVATIONS.length - 1)}</p><p className="lbl dim">{s.what}</p></div>
          <div className="dots" role="tablist">{INNOVATIONS.map((x, k) => <button key={k} role="tab" aria-selected={k === i} aria-label={x.plain} className={k === i ? 'on' : ''} onClick={() => { setDir(k < i ? -1 : 1); setI(k); }} />)}</div>
          <button className="lbl ul" onClick={() => open({ service: s.plain })}>Book this ritual</button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Runway Rewards: heading + expandable rows, tall portrait ---------- */
export function Rewards() {
  const [o, setO] = useState(-1);
  return (
    <section className="sec rew" id="rewards">
      <div className="rew-copy">
        <h2 className="h-xl"><Mix>{'{R}UNWAY\n{R}EWARDS'}</Mix></h2>
        <Label>Loyalty programme</Label>
        <p className="body">Earn spotlights on every visit and climb from Silver Icon to Showstopper. The more you spend, the more you earn, with welcome gifts, happy hours and a birthday treat at every tier.</p>
        <ul className="perks">{REWARDS.perks.map((p, i) => <li key={p} className="lbl" style={{ '--d': `${i * 90}ms` }}>✦ {p}</li>)}</ul>
        <ul className="rows">
          {REWARDS.tiers.map((t, i) => (
            <li key={t.name} className={o === i ? 'on' : ''}>
              <button className="row" aria-expanded={o === i} onClick={() => setO(o === i ? -1 : i)}>
                <span className="lbl">{t.name}</span><span className="lbl dim">{t.spend}</span><i aria-hidden="true">+</i>
              </button>
              <div className="row-more"><dl>
                <div><dt className="lbl dim">Earn</dt><dd>{t.rate} spotlights per ₹100</dd></div>
                <div><dt className="lbl dim">Welcome gift</dt><dd>{t.gift}</dd></div>
                <div><dt className="lbl dim">Happy hour</dt><dd>{t.happy}</dd></div>
                <div><dt className="lbl dim">Birthday</dt><dd>{t.bday}</dd></div>
              </dl></div>
            </li>
          ))}
        </ul>
        <p className="lbl dim">{REWARDS.note} <a className="ul" href={REWARDS.url} target="_blank" rel="noreferrer">Read terms ↗</a></p>
      </div>
      <figure className="rew-pic"><img src={img('bridal-7')} alt="" loading="lazy" /></figure>
    </section>
  );
}

/* ---------- Bridal gallery strip ---------- */
const GALLERY = ['bridal-4', 'bridal-5', 'bridal-8', 'bridal-9', 'bridal-6', 'bridal-3'];
export function Bridal() {
  const { open } = useBooking();
  return (
    <section className="sec gal" id="bridal">
      <Label className="side">Maya · The bridal collection</Label>
      <div className="main">
        <h2 className="h-xl"><Mix>{'{F}ROM {H}ALDI\nTO {R}ECEPTION'}</Mix></h2>
        <p className="body narrow">Maya, the bridal beauty collection by Lakmé Salon. Looks for every ceremony, from the haldi to the reception, built around your vision.</p>
      </div>
      <ol className="gal-row">
        {GALLERY.map((g, i) => (
          <li key={g} style={{ '--d': `${i * 60}ms` }}>
            <span className="lbl dim">{n2(i)}</span>
            <button onClick={() => open({ service: 'Bridal Makeup' })} aria-label="Book bridal makeup"><img src={img(g)} alt="" loading="lazy" /></button>
          </li>
        ))}
      </ol>
      <button className="lbl ul gal-cta" onClick={() => open({ service: 'Bridal Makeup' })}>Book a bridal consultation</button>
    </section>
  );
}

/* ---------- Story: proof column + two framed cards ---------- */
export function Story() {
  return (
    <section className="sec story" id="story">
      <Label className="side">Our story</Label>
      <div className="main">
        <h2 className="h-xl"><Mix>{'{F}ROM {O}NE {S}ALON\nTO 450+'}</Mix></h2>
        <p className="body narrow">{BRAND.purpose}</p>
      </div>
      <dl className="proof">
        {PROOF.map(([v, k], i) => <div key={k} style={{ '--d': `${i * 90}ms` }}><dt className="lbl dim">{k}</dt><dd><Count value={v} /></dd></div>)}
      </dl>
      <ol className="story-cards">
        {STORY.map(([y, t]) => <li key={y}><p className="lbl dim">✦ ✦ ✦</p><p className="yr"><Count value={y} from={/^\d{4}$/.test(y) ? +y - 60 : 0} /></p><p className="quote">“{t}”</p></li>)}
      </ol>
    </section>
  );
}

/* ---------- Salons ---------- */
export function Salons() {
  const [q, setQ] = useState('');
  const list = STATES.filter(s => s.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <section className="sec sal" id="salons">
      <Label className="side">Salon locator</Label>
      <div className="main">
        <h2 className="h-xl"><Mix>{'{F}IND {Y}OUR\n{S}ALON'}</Mix></h2>
        <p className="body narrow">450+ salons across {STATES.length} states and union territories. Pick yours to see addresses, phone numbers and opening times on the official locator.</p>
        <input className="sal-q" value={q} onChange={e => setQ(e.target.value)} placeholder="Search your state" aria-label="Search states" />
      </div>
      <ul className="sal-list">
        {list.map((s, i) => <li key={s} style={{ '--d': `${Math.min(i, 12) * 25}ms` }}><a href={stateUrl(s)} target="_blank" rel="noreferrer"><span>{s}</span><i aria-hidden="true">↗</i></a></li>)}
        {!list.length && <li className="lbl dim">No match. <a className="ul" href={BRAND.locator} target="_blank" rel="noreferrer">Open the full locator ↗</a></li>}
      </ul>
    </section>
  );
}

/* ---------- Dark booking call to action ---------- */
export function Reserve() {
  const { open } = useBooking();
  return (
    <section className="reserve">
      <img className="reserve-bg" data-parallax="0.18" src={img('bridal-8')} alt="" loading="lazy" aria-hidden="true" />
      <h2 className="h-xl"><Mix>{'{Y}OUR {T}URN\n{O}N {T}HE {R}UNWAY'}</Mix></h2>
      <div className="reserve-acts">
        <button className="btn light" onClick={() => open()}>Book appointment</button>
        <a className="btn ghost" href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp us</a>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
export function Footer({ home = true }) {
  const h = x => (x.startsWith('#') && !home ? `/${x}` : x);
  return (
    <footer className="foot">
      <div className="foot-top">
        <p className="foot-word" aria-label="Lakmé">{[...'LAKMÉ'].map((c, i) => <span key={i} aria-hidden="true" style={{ '--i': i }}>{c}</span>)}</p>
        <div className="foot-cols">
          <div>{LINKS.map(([t, x]) => <a key={x} className="lbl" href={h(x)}>{t}</a>)}</div>
          <div>{FAMILIES.map(f => <a key={f.key} className="lbl" href={h('#services')}>{f.title}</a>)}</div>
        </div>
      </div>
      <div className="foot-mid">
        <div><p className="lbl dim">Customer care</p><a className="lbl" href={tel(BRAND.tollFree)}>Toll free {BRAND.tollFree}</a><a className="lbl" href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></div>
        <div><p className="lbl dim">Write to us</p><a className="lbl" href={`mailto:${BRAND.careEmail}`}>Salon services · {BRAND.careEmail}</a><a className="lbl" href={`mailto:${BRAND.productEmail}`}>Products · {BRAND.productEmail}</a></div>
        <div><p className="lbl dim">Follow</p><a className="lbl" href={BRAND.instagram} target="_blank" rel="noreferrer">Instagram</a><a className="lbl" href={BRAND.facebook} target="_blank" rel="noreferrer">Facebook</a><a className="lbl" href={BRAND.youtube} target="_blank" rel="noreferrer">YouTube</a><a className="lbl" href={BRAND.x} target="_blank" rel="noreferrer">X</a></div>
      </div>
      <div className="foot-base">
        <p className="lbl dim">Pitch concept · Not an official Lakmé Salon website</p>
        <p className="foot-yr">Est. {BRAND.since}</p>
      </div>
    </footer>
  );
}

/* ---------- Scroll reveal + parallax ---------- */
const REVEAL = '.sec .h-xl, .reserve .h-xl, .reserve-acts, .sec>.side, .sec .main>.body, .sec .main>.lbl, .sec .main>.sal-q, .fr-acts, .svc-card, .gal-row li, .story-cards li, .stats>div, .proof>div, .perks li, .fr-adv li, .frame, .foot-word, .foot-mid>div, .foot-yr';
const CLIP = '.intro-pic, .rew-pic, .svc-img, .gal-row button, .fr-pic';
export function useReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll(REVEAL)];
    const clips = [...document.querySelectorAll(CLIP)];
    const all = [...els, ...clips];
    const show = el => { el.classList.add('in'); io.unobserve(el); };
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && show(e.target)), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => el.classList.add('rv'));
    clips.forEach(el => el.classList.add('rv-clip'));
    all.forEach(el => io.observe(el));
    // anything already scrolled past (fast scroll, jump links) is shown at once
    const past = () => all.forEach(el => !el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight * 0.6 && show(el));
    addEventListener('scroll', past, { passive: true });

    // parallax: elements with data-parallax drift at a fraction of scroll speed
    const par = reduced() ? [] : [...document.querySelectorAll('[data-parallax]')];
    let raf = 0;
    const move = () => {
      raf = 0;
      par.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const off = (r.top + r.height / 2 - innerHeight / 2) * -+el.dataset.parallax;
        el.style.setProperty('--py', `${off.toFixed(1)}px`);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(move); };
    if (par.length) { move(); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); }
    return () => { io.disconnect(); removeEventListener('scroll', past); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);
}
