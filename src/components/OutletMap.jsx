import { useEffect, useMemo, useRef, useState } from 'react';
import { OUTLETS, label, km, directions } from '../outlets-util.js';
import { useBooking } from '../booking.jsx';
import DOTS from '../dotmaps.json';
import StreetMap from './StreetMap.jsx';

// Dotted outlet map. Pins are the real outlets from the public Google My Map on cheapandbestsalon.in/store-locator.
// Land dots are generated from Natural Earth country outlines (public domain), see dotmaps.json.
// Two views: South India (one pin per outlet, with Chennai grouped), and a zoomed Chennai metro.

const inMetro = o => o.lat > 12.885 && o.lat < 13.2 && o.lng > 80.09 && o.lng < 80.34;
const proj = (view, lat, lng) => {
  const [la0, la1, ln0, ln1] = DOTS[view].bbox;
  return { x: ((lng - ln0) / (ln1 - ln0)) * 100, y: ((la1 - lat) / (la1 - la0)) * 100, in: lat >= la0 && lat <= la1 && lng >= ln0 && lng <= ln1 };
};

const METRO = OUTLETS.filter(inMetro);
const OTHERS = OUTLETS.filter(o => !inMetro(o));
const CHENNAI_PIN = { lat: METRO.reduce((s, o) => s + o.lat, 0) / METRO.length, lng: METRO.reduce((s, o) => s + o.lng, 0) / METRO.length };

// oval fade centred on the outlets, so the land dissolves into an organic shape instead of a rectangle
const OVAL = { south: { cx: 0.55, cy: 0.52, rx: 0.6, ry: 0.66 }, chennai: { cx: 0.5, cy: 0.5, rx: 0.46, ry: 0.56 } };
const smooth = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

function Dots({ view, w, h }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c || !w || !h) return;
    const g = DOTS[view], dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    const cell = w / g.cols, d = Math.max(2, cell * 0.46), off = (cell - d) / 2;
    // dots dissolve toward the frame edges so the land never reads as a hard rectangle
    const fadeW = Math.min(g.cols, g.rows) * 0.14;
    for (let r = 0; r < g.rows; r++) {
      const row = g.grid[r], t = r / g.rows;
      for (let col = 0; col < g.cols; col++) {
        if (row[col] !== '1') continue;
        const edge = Math.min(col, g.cols - 1 - col, r, g.rows - 1 - r) / fadeW;
        const ov = OVAL[view], rho = Math.hypot((col / g.cols - ov.cx) / ov.rx, (r / g.rows - ov.cy) / ov.ry);
        const fade = Math.min(Math.pow(Math.max(0, Math.min(1, edge)), 1.4), 1 - smooth(0.62, 1.05, rho));
        if (fade <= 0.02) continue;
        const jitter = ((r * 31 + col * 17) % 5) * 0.025;
        // shoreline: land dots that touch sea (inside the frame) are brighter and slightly larger
        const sea = (rr, cc) => rr >= 0 && rr < g.rows && cc >= 0 && cc < g.cols && g.grid[rr][cc] !== '1';
        const coast = sea(r - 1, col) || sea(r + 1, col) || sea(r, col - 1) || sea(r, col + 1);
        const a = (0.2 + 0.45 * t + jitter + (coast ? 0.38 : 0)) * fade;
        const dd = coast ? d * 1.22 : d, oo = (cell - dd) / 2;
        ctx.fillStyle = `rgba(${coast ? '240,240,240' : '214,214,214'},${Math.min(a, 0.95)})`;
        ctx.fillRect(col * cell + oo, r * (h / g.rows) + oo, dd, dd);
      }
    }
  }, [view, w, h]);
  return <canvas ref={ref} className="dm-canvas" style={{ width: w, height: h }} />;
}

function Pin({ x, y, delay, small, on, count, title, onClick }) {
  return (
    <button className={`dm-pin${small ? ' s' : ''}${on ? ' on' : ''}`} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s`, zIndex: Math.round(y * 10) + (on ? 2000 : 0) }} onClick={onClick} title={title} aria-label={title}>
      <span className="dm-pin-in">
        <svg fill="none" viewBox="0 0 38 38" className="dm-pin-svg">
          <path d="M29.607 5.193c5.858 5.857 5.858 15.355 0 21.213l-9.9 9.9-.707.706-.708-.708-9.899-9.898c-5.857-5.858-5.857-15.356 0-21.213 5.858-5.858 15.356-5.858 21.214 0Z" fill="rgba(0,0,0,.08)" />
          <path className="dm-pin-body" d="m28.9 25.698-9.9 9.9-9.9-9.9C3.634 20.232 3.634 11.367 9.1 5.9 14.569.432 23.433.432 28.9 5.9c5.467 5.468 5.467 14.332 0 19.8Z" />
        </svg>
        <img alt="" src="/favicon.png" className="dm-pin-img" />
        {count > 1 && <b className="dm-count">{count}</b>}
      </span>
    </button>
  );
}

export default function OutletMap() {
  const { open: book } = useBooking();
  const stage = useRef(null);
  const [mode, setMode] = useState('street');
  const [view, setView] = useState('south');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [shown, setShown] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState('');

  // fit the dot map inside the stage, keeping its aspect ratio
  useEffect(() => {
    const fit = () => {
      const el = stage.current, g = DOTS[view], ar = g.cols / g.rows;
      const cs = getComputedStyle(el);
      const aw = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ah = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const w = Math.max(0, Math.min(aw, ah * ar));
      setSize({ w: Math.round(w), h: Math.round(w / ar) });
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(stage.current);
    return () => ro.disconnect();
  }, [view]);

  // drop the pins in when the map scrolls into view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(stage.current);
    return () => io.disconnect();
  }, []);

  const selected = sel != null ? OUTLETS[sel] : null;
  const pins = useMemo(() => {
    if (view === 'chennai') return METRO.map((o, i) => ({ key: o.id, o, ...proj('chennai', o.lat, o.lng), small: true, delay: Math.min(i * 0.025, 1) }));
    return [
      { key: 'chennai', cluster: true, ...proj('south', CHENNAI_PIN.lat, CHENNAI_PIN.lng), count: METRO.length, delay: 0.1 },
      ...OTHERS.map((o, i) => ({ key: o.id, o, ...proj('south', o.lat, o.lng), delay: 0.25 + i * 0.07 })),
    ];
  }, [view]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return OUTLETS
      .filter(o => !s || `${o.area} ${o.city} ${o.address} ${o.phones.join(' ')}`.toLowerCase().includes(s))
      .map(o => ({ ...o, d: me ? km(me, o) : null }))
      .sort((a, b) => (me ? a.d - b.d : label(a).localeCompare(label(b))));
  }, [q, me]);

  const focus = o => {
    setView(inMetro(o) ? 'chennai' : 'south');
    setSel(o.id);
    stage.current.closest('.loc-map').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const locate = () => {
    if (!navigator.geolocation) return setMsg('Location is not available in this browser.');
    setMsg('Finding you…');
    navigator.geolocation.getCurrentPosition(
      p => {
        const you = { lat: p.coords.latitude, lng: p.coords.longitude };
        setMe(you); setQ('');
        const near = OUTLETS.reduce((a, b) => (km(you, a) < km(you, b) ? a : b));
        const d = km(you, near);
        setMsg(d > 60 ? `Nearest outlet is ${Math.round(d)} km away: ${label(near)}.` : `Nearest: ${label(near)}, ${d.toFixed(1)} km away.`);
        focus(near);
      },
      () => setMsg('Could not get your location. You can search by area instead.'),
      { timeout: 10000 }
    );
  };

  const you = me ? proj(view, me.lat, me.lng) : null;

  return (
    <div className="locator">
      <div className="loc-map">
        <div className="st-wrap" hidden={mode !== 'street'}>
          <StreetMap outlets={OUTLETS} metro={METRO} sel={sel} onSelect={setSel} me={me} label={label} />
        </div>
        <div className="dm-stage" ref={stage} hidden={mode !== 'dots'}>
          <div className="dm" style={{ width: size.w, height: size.h }}>
            <Dots view={view} w={size.w} h={size.h} />
            <div className={`dm-pins${shown ? ' in' : ''}`} key={view} role="group" aria-label={view === 'chennai' ? 'Chennai outlets' : 'Outlets across South India'}>
              {pins.map(p => (
                <Pin key={p.key} x={p.x} y={p.y} delay={p.delay} small={p.small} count={p.count}
                  on={!p.cluster && p.o.id === sel}
                  title={p.cluster ? `Chennai: ${p.count} outlets` : label(p.o)}
                  onClick={() => (p.cluster ? (setView('chennai'), setSel(null)) : setSel(p.o.id))} />
              ))}
              {you && you.in && <i className="dm-me" style={{ left: `${you.x}%`, top: `${you.y}%` }} title="You are here" />}
            </div>
          </div>
        </div>
        {mode === 'dots' && <div className="dm-fade" />}
        <div className="loc-mode mono">
          <button className={mode === 'street' ? 'on' : ''} onClick={() => setMode('street')}>Street</button>
          <button className={mode === 'dots' ? 'on' : ''} onClick={() => setMode('dots')}>Dots</button>
        </div>
        {mode === 'dots' && <span className="dm-cap mono">{view === 'chennai' ? `Chennai · ${METRO.length} outlets` : `South India · ${OUTLETS.length} outlets`}</span>}
        {mode === 'dots' && (view === 'chennai'
          ? <button className="dm-back pill ghost sm" onClick={() => { setView('south'); setSel(null); }}>← All outlets</button>
          : <span className="dm-hint mono">Tap the Chennai pin to zoom in</span>)}
        {selected && (
          <div className="dm-card" role="dialog" aria-label={label(selected)}>
            <button className="dm-x" onClick={() => setSel(null)} aria-label="Close">×</button>
            <b>{label(selected)}</b>
            {selected.address && <p>{selected.address}</p>}
            {selected.phones.map(p => <a key={p} href={`tel:${p.replace(/[^\d+]/g, '')}`}>{p}</a>)}
            {!selected.phones.length && !selected.address && <p>Phone not listed.</p>}
            <button className="pill ghost sm dm-book" onClick={() => book({ outlet: selected.id })}>Book here</button>
            <a className="dm-dir pill light sm" href={directions(selected)} target="_blank" rel="noreferrer">Get directions <i className="arr dk">↗</i></a>
          </div>
        )}
      </div>

      <div className="loc-panel">
        <div className="loc-tools">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search area or phone" aria-label="Search outlets" />
          <button className="pill light sm" onClick={locate}>Near me</button>
        </div>
        <p className="loc-msg mono" aria-live="polite">{msg || `${list.length} of ${OUTLETS.length} outlets`}</p>
        <ul className="loc-list">
          {list.map(o => (
            <li key={o.id}>
              <button className={o.id === sel ? 'on' : ''} onClick={() => focus(o)}>
                <span><b>{label(o)}</b>{o.phones[0] && <small className="mono">{o.phones[0]}</small>}</span>
                {o.d != null && <em className="mono">{o.d < 10 ? o.d.toFixed(1) : Math.round(o.d)} km</em>}
              </button>
            </li>
          ))}
          {!list.length && <li className="loc-empty">No outlet matches that search.</li>}
        </ul>
      </div>
    </div>
  );
}
