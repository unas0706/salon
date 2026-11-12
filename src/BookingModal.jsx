import { useEffect, useMemo, useRef, useState } from 'react';
import { BRAND, CATS, SERVICES, istMinutes, fmtTime, chairStatus } from './data.js';
import { useBooking } from './booking.jsx';
import { OUTLETS, label, km, directions } from './outlets-util.js';

const money = n => `${BRAND.currency}${n.toLocaleString('en-IN')}`;
const STEPS = ['Outlet', 'Services', 'Time', 'Details'];
const TZ = 'Asia/Kolkata';
const fmt = (d, o) => new Intl.DateTimeFormat('en-IN', { timeZone: TZ, ...o }).format(d);
const isoDay = d => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const store = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const touch = () => !matchMedia('(hover:hover)').matches;
const hhmm = m => String((m / 60) | 0).padStart(2, '0') + String(m % 60).padStart(2, '0');

const START = { step: 1, outlet: null, picks: [], day: 0, time: null, name: '', phone: '', ref: '' };

function icsUrl(date, time, ref, outlet, picks) {
  const d = isoDay(date).replace(/-/g, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cheap and Best Salon//Booking//EN', 'BEGIN:VEVENT',
    `UID:${ref}@cheapandbestsalon`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`,
    `DTSTART;TZID=${TZ}:${d}T${hhmm(time.m)}00`, `DTEND;TZID=${TZ}:${d}T${hhmm(time.m + 45)}00`,
    `SUMMARY:${BRAND.name}: ${picks.map(p => p.name).join(', ')}`,
    `LOCATION:${label(outlet)}${outlet.address ? ', ' + outlet.address : ''}`, 'END:VEVENT', 'END:VCALENDAR'];
  return URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
}

export default function BookingModal() {
  const { isOpen, pre, close } = useBooking();
  const [s, setS] = useState(START);
  const [cat, setCat] = useState(CATS[0]);
  const [q, setQ] = useState('');
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState('');
  const [tried, setTried] = useState(false);
  const [closing, setClosing] = useState(false);
  const prevStep = useRef(1);
  const body = useRef(null), search = useRef(null), adv = useRef(null);
  useEffect(() => () => clearTimeout(adv.current), []);
  const dismiss = () => { if (closing) return; setClosing(true); setTimeout(() => { setClosing(false); close(); }, 230); };
  const set = patch => setS(p => ({ ...p, ...patch }));

  // reset every time the sheet opens; pre-fill from the click and from what we remember
  useEffect(() => {
    if (!isOpen) return;
    const saved = store.get('cb-booking') || {};
    const picks = pre.services ?? (pre.service != null ? [pre.service] : []);
    const outlet = pre.outlet ?? (OUTLETS.some(o => o.id === saved.outlet) ? saved.outlet : null);
    const st = chairStatus();
    setS({ ...START, outlet, picks, day: !st.open && st.day === 'tomorrow' ? 1 : 0, name: saved.name || '', phone: saved.phone || '', step: pre.outlet != null ? 2 : 1 });
    if (picks.length) setCat(SERVICES[picks[0]].cat);
    setQ(''); setMe(null); setMsg(''); setTried(false);
  }, [isOpen, pre]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    const esc = e => e.key === 'Escape' && dismiss();
    addEventListener('keydown', esc);
    return () => { removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [isOpen, closing]);

  useEffect(() => { body.current?.scrollTo(0, 0); setTried(false); if (s.step === 1 && !touch()) search.current?.focus(); }, [s.step, isOpen]);

  const days = useMemo(() => [...Array(7)].map((_, i) => new Date(Date.now() + i * 864e5)), [isOpen]);
  const slots = useMemo(() => {
    const nowM = istMinutes(), out = [];
    for (let m = BRAND.openMin; m <= BRAND.closeMin - 20; m += 20)
      out.push({ m, label: fmtTime(m), off: (((m - BRAND.openMin) / 20) * 7 + s.day * 3) % 5 === 0 || (s.day === 0 && m <= nowM) });
    return out;
  }, [s.day, isOpen, s.step]);

  const outlets = useMemo(() => {
    const t = q.trim().toLowerCase();
    return OUTLETS
      .filter(o => !t || `${o.area} ${o.city} ${o.address} ${o.phones.join(' ')}`.toLowerCase().includes(t))
      .map(o => ({ ...o, d: me ? km(me, o) : null }))
      .sort((a, b) => (me ? a.d - b.d : label(a).localeCompare(label(b))));
  }, [q, me]);

  useEffect(() => { prevStep.current = s.step; });
  if (!isOpen) return null;
  const dir = s.step < prevStep.current ? 'back' : 'fwd';

  const outlet = OUTLETS.find(o => o.id === s.outlet) || null;
  const picks = s.picks.map(i => ({ ...SERVICES[i], i }));
  const total = picks.reduce((t, x) => t + x.price, 0);
  const slotsLeft = slots.filter(x => !x.off).length;
  const phoneOk = s.phone.replace(/\D/g, '').length >= 10;
  const need = { 1: 'Pick an outlet to continue', 2: 'Choose at least one service', 3: 'Pick a time', 4: !s.name.trim() ? 'Add your name' : 'Add a 10-digit mobile number' }[s.step];
  const ok = { 1: !!outlet, 2: picks.length > 0, 3: !!s.time, 4: !!s.name.trim() && phoneOk }[s.step];
  const dayLabel = fmt(days[s.day], { weekday: 'long', day: 'numeric', month: 'long' });
  const when = s.time ? `${dayLabel}, ${s.time.label}` : '';

  const next = () => {
    if (!ok) { setTried(true); return; }
    if (s.step === 4) {
      store.set('cb-booking', { outlet: s.outlet, name: s.name.trim(), phone: s.phone.trim() });
      return set({ step: 5, ref: 'CB-' + Math.random().toString(36).slice(2, 6).toUpperCase() });
    }
    set({ step: s.step + 1 });
  };
  // outlet and time are single choices, so picking one moves straight on (after a beat so the selection shows)
  const pickAndGo = (patch, from, ms = 280) => {
    set(patch);
    clearTimeout(adv.current);
    adv.current = setTimeout(() => setS(p => (p.step === from ? { ...p, step: from + 1 } : p)), ms);
  };
  const toggle = i => setS(p => ({ ...p, picks: p.picks.includes(i) ? p.picks.filter(x => x !== i) : [...p.picks, i] }));

  const locate = () => {
    if (!navigator.geolocation) return setMsg('Location is not available in this browser.');
    setMsg('Finding you…');
    navigator.geolocation.getCurrentPosition(
      p => {
        const you = { lat: p.coords.latitude, lng: p.coords.longitude };
        const near = OUTLETS.reduce((a, b) => (km(you, a) < km(you, b) ? a : b));
        const d = km(you, near);
        setMe(you); setQ(''); pickAndGo({ outlet: near.id }, 1, 1400);
        setMsg(d > 60 ? `Nearest outlet is ${Math.round(d)} km away.` : `Nearest: ${label(near)}, ${d.toFixed(1)} km away.`);
      },
      () => setMsg('Could not get your location. Search by area instead.'),
      { timeout: 10000 }
    );
  };

  const summary = (
    <div className="bk-sum">
      <div><span className="mono">Outlet</span><b>{outlet && label(outlet)}</b></div>
      <div><span className="mono">When</span><b>{when}</b></div>
      <div className="bk-svc"><span className="mono">Services</span>
        <ul>{picks.map(p => <li key={p.name}><span>{p.name}</span><b>{money(p.price)}</b></li>)}</ul></div>
      <div className="bk-tot"><span className="mono">{s.step === 5 ? 'To pay at the chair' : 'Total, pay at the chair'}</span><b>{money(total)}</b></div>
    </div>
  );

  return (
    <div className={`modal open bk-modal${closing ? ' closing' : ''}`} onClick={e => e.target === e.currentTarget && dismiss()}>
      <div className="sheet bk" role="dialog" aria-modal="true" aria-label="Book a chair">
        <header className="bk-head">
          {s.step > 1 && s.step < 5 ? <button className="bk-back" onClick={() => { clearTimeout(adv.current); set({ step: s.step - 1 }); }} aria-label="Back">←</button> : <span className="bk-back ph" />}
          {s.step < 5 && (
            <ol className="bk-prog" aria-label={`Step ${s.step} of 4`}>
              {STEPS.map((n, i) => <li key={n} className={i + 1 < s.step ? 'done' : i + 1 === s.step ? 'now' : ''}><i /><span className="mono">{n}</span></li>)}
            </ol>
          )}
          <button className="x" onClick={dismiss} aria-label="Close">×</button>
        </header>

        <div className={`bk-body ${dir}`} ref={body} key={s.step}>
          {s.step === 1 && (<>
            <h3>Which outlet is closest to you?</h3>
            <p className="bk-sub">Search by area, or let us find the nearest one.</p>
            <div className="bk-tools">
              <input ref={search} value={q} onChange={e => setQ(e.target.value)} placeholder="Search area, e.g. Adyar" aria-label="Search outlets" />
              <button className="pill light sm" onClick={locate}>Near me</button>
            </div>
            <p className="bk-msg mono" aria-live="polite">{msg || `${outlets.length} of ${OUTLETS.length} outlets`}</p>
            <ul className="bk-list">
              {outlets.map((o, n) => (
                <li key={o.id} style={{ '--i': Math.min(n, 10) }}>
                  <button className={`bk-row${o.id === s.outlet ? ' on' : ''}`} onClick={() => pickAndGo({ outlet: o.id }, 1)} aria-pressed={o.id === s.outlet}>
                    <span><b>{label(o)}</b><small className="mono">{o.phones[0] || o.address || 'Chennai region'}</small></span>
                    {o.d != null && <em className="mono">{o.d < 10 ? o.d.toFixed(1) : Math.round(o.d)} km</em>}
                    <i className="bk-tick" aria-hidden="true">✓</i>
                  </button>
                </li>
              ))}
              {!outlets.length && <li className="bk-empty">No outlet matches that search.</li>}
            </ul>
          </>)}

          {s.step === 2 && (<>
            <h3>What would you like done?</h3>
            <p className="bk-sub">Pick one or more. Prices are listed upfront.</p>
            <div className="cat-tabs dk">{CATS.map(c => {
              const n = picks.filter(p => p.cat === c).length;
              return <button key={c} className={`cat${c === cat ? ' on' : ''}`} onClick={() => setCat(c)}>{c}{n ? <b className="bk-n">{n}</b> : null}</button>;
            })}</div>
            <ul className="bk-list">
              {SERVICES.filter(x => x.cat === cat).map((x, n) => { const i = SERVICES.indexOf(x); return (
                <li key={x.name} style={{ '--i': n }}>
                  <button className={`bk-row${s.picks.includes(i) ? ' on' : ''}`} onClick={() => toggle(i)} aria-pressed={s.picks.includes(i)}>
                    <span><b>{x.name}</b><small className="mono">{x.min ? `${x.min} min · ` : ''}{x.desc}</small></span>
                    <em className="bk-price">{money(x.price)}</em>
                    <i className="bk-tick" aria-hidden="true">✓</i>
                  </button>
                </li>); })}
            </ul>
          </>)}

          {s.step === 3 && (<>
            <h3>When should we expect you?</h3>
            <p className="bk-sub">{label(outlet)} · open 7:00 AM – 10:00 PM</p>
            <div className="days">{days.map((d, i) => (
              <button key={i} className={`day mono${s.day === i ? ' on' : ''}`} onClick={() => set({ day: i, time: null })}>
                {i ? fmt(d, { weekday: 'short' }) : 'Today'}<b>{fmt(d, { day: 'numeric' })}</b>
              </button>))}</div>
            {slotsLeft === 0 && <p className="bk-empty">No slots left {s.day === 0 ? 'today' : 'on this day'}. Try {s.day === 0 ? 'tomorrow' : 'another day'}.</p>}
            {[['Morning', BRAND.openMin, 720], ['Afternoon', 720, 1020], ['Evening', 1020, BRAND.closeMin]].map(([n, a, b]) => {
              const g = slots.filter(x => x.m >= a && x.m < b); if (!g.length) return null;
              return (
                <div key={n} className="bk-group"><p className="mono">{n}</p>
                  <div className="slots">{g.map((x, n) => (
                    <button key={x.m} style={{ '--i': n }} disabled={x.off} className={`slot mono${s.time?.m === x.m ? ' on' : ''}`} onClick={() => pickAndGo({ time: x }, 3)}>{x.label}</button>))}</div>
                </div>);
            })}
          </>)}

          {s.step === 4 && (<>
            <h3>Almost done.</h3>
            <p className="bk-sub">Check your booking and tell us who is coming.</p>
            {summary}
            <label className="bk-field"><span className="mono">Your name</span>
              <input value={s.name} onChange={e => set({ name: e.target.value })} placeholder="Full name" autoComplete="name" /></label>
            <label className="bk-field"><span className="mono">Mobile number</span>
              <input value={s.phone} onChange={e => set({ phone: e.target.value })} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" /></label>
            <p className="bk-note">No payment needed to book. We'll text you a reminder the day before.</p>
          </>)}

          {s.step === 5 && (<div className="bk-done">
            <div className="bk-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
            <h3>Your chair is held.</h3>
            <p className="bk-sub">Booking reference <b className="mono">{s.ref}</b></p>
            {summary}
            <div className="bk-actions">
              <a className="pill light sm" href={icsUrl(days[s.day], s.time, s.ref, outlet, picks)} download={`cheap-and-best-${s.ref}.ics`}>Add to calendar</a>
              <a className="pill ghost sm" href={directions(outlet)} target="_blank" rel="noreferrer">Get directions ↗</a>
              {outlet.phones[0] && <a className="pill ghost sm" href={`tel:${outlet.phones[0].replace(/[^\d+]/g, '')}`}>Call outlet</a>}
            </div>
            <p className="bk-note">We'll text {s.phone} the day before. This is a demo, so nothing was saved or charged.</p>
          </div>)}
        </div>

        <footer className="bk-foot">
          {s.step < 5 ? (<>
            <div className="bk-run">
              <span className="mono">{[outlet && label(outlet), picks.length ? `${picks.length} service${picks.length > 1 ? 's' : ''}` : null, s.time?.label].filter(Boolean).join(' · ') || 'Your booking'}</span>
              {tried && !ok ? <b className="bad">{need}</b> : <b>{picks.length ? money(total) : 'Free to book'}</b>}
            </div>
            <button className="pill light" onClick={next} data-off={!ok}>{s.step === 4 ? 'Confirm booking' : 'Continue'} <i className="arr dk">→</i></button>
          </>) : <button className="pill light bk-done-btn" onClick={dismiss}>Done <i className="arr dk">✓</i></button>}
        </footer>
      </div>
    </div>
  );
}
