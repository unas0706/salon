import { useEffect, useMemo, useRef, useState } from 'react';
import { BRAND, CATS, FAMILIES, SERVICES, STATES, istMinutes, fmtTime, tel } from './data.js';
import { useBooking } from './booking.jsx';
import { Mix } from './sections.jsx';

// Lakmé Salon publishes no central salon list with hours, so the visitor names their city and area,
// and the request goes to the official Lakmé Salon WhatsApp line, which routes it to the nearest salon.
const STEPS = ['Where', 'Services', 'Time', 'Details'];
const TZ = 'Asia/Kolkata';
const fmt = (d, o) => new Intl.DateTimeFormat('en-IN', { timeZone: TZ, ...o }).format(d);
const isoDay = d => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const hhmm = m => String((m / 60) | 0).padStart(2, '0') + String(m % 60).padStart(2, '0');
const n2 = i => String(i).padStart(2, '0');
const img = k => `/lk/${k}.jpg`;
const store = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const START = { step: 1, city: '', area: '', who: 'Women', picks: [], day: 0, time: null, name: '', phone: '', note: '', ref: '' };
const POPULAR = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];
const CAT_IMG = { ...Object.fromEntries(FAMILIES.map(f => [f.key, f.img])), Innovations: 'peel' };
const STEP_IMG = { 1: 'bridal-2', 3: 'bridal-6', 4: 'bridal-7', 5: 'bridal-8' };
const ASIDE_IMGS = [...new Set([...Object.values(STEP_IMG), ...Object.values(CAT_IMG)])];
const PARTS = [['Morning', 0, 12 * 60], ['Afternoon', 12 * 60, 16 * 60], ['Evening', 16 * 60, 24 * 60]];
const STEP_COPY = {
  1: ['Your salon', 'Tell us where you are and we’ll route your request to the nearest Lakmé Salon.'],
  2: ['Your services', 'Choose as many as you like. Your stylist will tailor each one on the day.'],
  3: ['Your moment', 'Pick a preferred time. The salon calls to confirm it before your visit.'],
  4: ['Your details', BRAND.concept ? 'No payment to book. In this concept demo, nothing is sent.' : 'No payment to book. Confirming opens WhatsApp with everything filled in.'],
  5: ['All set', 'Your request is on its way. We look forward to seeing you.'],
};

const waText = (s, when, picks) => [
  `Appointment request ${s.ref} · Lakmé Salon`, `Name: ${s.name.trim()}`, `Phone: ${s.phone.trim()}`,
  `Salon: ${[s.area.trim(), s.city.trim()].filter(Boolean).join(', ')}`, `For: ${s.who}`,
  `When: ${when}`, `Services: ${picks.map(p => p.name).join(', ')}`, s.note.trim() && `Note: ${s.note.trim()}`].filter(Boolean).join('\n');
const waLink = (s, when, picks) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(waText(s, when, picks))}`;

function icsUrl(date, time, s, picks) {
  const d = isoDay(date).replace(/-/g, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lakme Salon//Booking//EN', 'BEGIN:VEVENT',
    `UID:${s.ref}@lakmesalon`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`,
    `DTSTART;TZID=${TZ}:${d}T${hhmm(time.m)}00`, `DTEND;TZID=${TZ}:${d}T${hhmm(time.m + 60)}00`,
    `SUMMARY:Lakmé Salon: ${picks.map(p => p.name).join(', ')} (to be confirmed)`,
    `LOCATION:Lakmé Salon ${[s.area, s.city].filter(Boolean).join(', ')}`, 'END:VEVENT', 'END:VCALENDAR'];
  return URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
}

export default function BookingModal() {
  const { isOpen, pre, close } = useBooking();
  const [s, setS] = useState(START);
  const [cat, setCat] = useState(CATS[0]);
  const [dir, setDir] = useState(1);
  const [tried, setTried] = useState(false);
  const [closing, setClosing] = useState(false);
  const body = useRef(null), sheet = useRef(null), dayRow = useRef(null);
  const set = patch => setS(p => ({ ...p, ...patch }));
  const go = step => { setDir(step > s.step ? 1 : -1); set({ step }); };
  const dismiss = () => { if (closing) return; setClosing(true); setTimeout(() => { setClosing(false); close(); }, 380); };

  // reset on open; pre-select from the button that opened it, and remember the visitor's details
  useEffect(() => {
    if (!isOpen) return;
    const saved = store.get('lk-booking') || {};
    const hit = pre.service ? SERVICES.findIndex(x => x.name === pre.service) : -1;
    const late = istMinutes() > BRAND.closeMin - BRAND.slot;
    setS({ ...START, city: saved.city || '', area: saved.area || '', who: saved.who || 'Women', name: saved.name || '', phone: saved.phone || '', picks: hit >= 0 ? [hit] : [], day: late ? 1 : 0 });
    setCat(hit >= 0 ? SERVICES[hit].cat : pre.cat && CATS.includes(pre.cat) ? pre.cat : CATS[0]);
    setDir(1);
    setTried(false);
    requestAnimationFrame(() => sheet.current?.focus());
  }, [isOpen, pre]);

  useEffect(() => {
    document.body.classList.toggle('lock', isOpen);
    const esc = e => e.key === 'Escape' && dismiss();
    addEventListener('keydown', esc);
    return () => { removeEventListener('keydown', esc); document.body.classList.remove('lock'); };
  }, [isOpen, closing]);
  useEffect(() => { body.current?.scrollTo(0, 0); setTried(false); }, [s.step]);
  useEffect(() => { // keep the chosen day in view
    if (s.step === 3) dayRow.current?.children[s.day]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [s.step, s.day]);

  const days = useMemo(() => [...Array(14)].map((_, i) => new Date(Date.now() + i * 864e5)), [isOpen]);
  const slots = useMemo(() => {
    const nowM = istMinutes(), out = [];
    for (let m = BRAND.openMin; m <= BRAND.closeMin - BRAND.slot; m += BRAND.slot) out.push({ m, label: fmtTime(m), off: s.day === 0 && m <= nowM + 30 });
    return out;
  }, [s.day, isOpen, s.step]);

  if (!isOpen) return null;

  const forWho = x => s.who === 'Women' || x.men || x.cat === 'Innovations';
  const menu = SERVICES.map((x, i) => ({ ...x, i })).filter(x => x.cat === cat && forWho(x));
  const picks = s.picks.map(i => ({ ...SERVICES[i], i }));
  const phoneOk = s.phone.replace(/\D/g, '').length >= 10;
  const valid = { 1: s.city.trim().length > 1, 2: picks.length > 0, 3: !!s.time, 4: !!s.name.trim() && phoneOk };
  const ok = valid[s.step];
  const need = { 1: 'Tell us your city', 2: 'Pick at least one service', 3: 'Pick a time', 4: !s.name.trim() ? 'Add your name' : 'Add a 10-digit mobile number' }[s.step];
  const when = s.time ? `${fmt(days[s.day], { weekday: 'long', day: 'numeric', month: 'long' })}, ${s.time.label}` : '';
  const where = [s.area.trim(), s.city.trim()].filter(Boolean).join(', ');
  const asideImg = s.step === 2 ? CAT_IMG[cat] : STEP_IMG[s.step];
  const canJump = i => i < s.step || [1, 2, 3].slice(0, i - 1).every(k => valid[k]);

  const next = () => {
    if (!ok) { setTried(true); return; }
    if (s.step === 4) {
      store.set('lk-booking', { city: s.city.trim(), area: s.area.trim(), who: s.who, name: s.name.trim(), phone: s.phone.trim() });
      const ref = 'LS-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      if (!BRAND.concept) window.open(waLink({ ...s, ref }, when, picks), '_blank', 'noopener');
      setDir(1);
      return set({ step: 5, ref });
    }
    go(s.step + 1);
  };
  const toggle = i => setS(p => ({ ...p, picks: p.picks.includes(i) ? p.picks.filter(x => x !== i) : [...p.picks, i] }));
  const scrollDays = d => dayRow.current?.scrollBy({ left: d * 260, behavior: 'smooth' });

  // the running summary, shown in the side panel and on the review step
  const rows = [
    ['Salon', where, 1], ['Services', picks.map(p => p.name).join(', '), 2], ['When', when, 3],
  ];
  const summary = edit => (
    <dl className="bk-sum">
      {rows.map(([k, v, step]) => (
        <div key={k}><dt className="lbl dim">{k}{k === 'Services' ? ` · ${s.who}` : ''}</dt><dd>{v}</dd>
          {edit && <button className="lbl ul" onClick={() => go(step)}>Edit</button>}</div>
      ))}
      <div><dt className="lbl dim">Price</dt><dd>Shared by the salon when they confirm</dd></div>
    </dl>
  );

  return (
    <div className={`bk-wrap${closing ? ' closing' : ''}`} onClick={e => e.target === e.currentTarget && dismiss()}>
      <div className="bk" role="dialog" aria-modal="true" aria-label="Book an appointment" tabIndex={-1} ref={sheet}>

        {/* side panel: photo for the step, big step number, the appointment filling in */}
        <aside className="bk-aside" aria-hidden="true">
          {ASIDE_IMGS.map(k => <img key={k} src={img(k)} alt="" className={k === asideImg ? 'on' : ''} />)}
          <div className="bk-aside-in">
            <img className="bk-logo" src="/lk/logo.png" alt="" />
            <div key={s.step} className="bk-aside-copy">
              <p className="bk-num">{s.step < 5 ? <>{n2(s.step)}<small>/04</small></> : '✦'}</p>
              <p className="lbl">{STEP_COPY[s.step][0]}</p>
              <p className="bk-aside-txt">{STEP_COPY[s.step][1]}</p>
            </div>
            <ul className="bk-trail">
              {rows.map(([k, v]) => <li key={k} className={v ? 'on' : ''}><span className="lbl">{k}</span><span key={v} className="v">{v || '—'}</span></li>)}
            </ul>
          </div>
        </aside>

        <div className="bk-main">
          <header className="bk-head">
            <ol className="bk-steps" aria-label={`Step ${Math.min(s.step, 4)} of 4`}>
              {STEPS.map((n, i) => {
                const k = i + 1, st = k === s.step ? 'now' : k < s.step ? 'done' : '';
                return (
                  <li key={n} className={st}>
                    <button className="lbl" disabled={s.step === 5 || !canJump(k) || k === s.step} onClick={() => go(k)} aria-current={k === s.step ? 'step' : undefined}>
                      <i>{k < s.step ? '✓' : k}</i><span>{n}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <button className="bk-x" onClick={dismiss} aria-label="Close"><i /><i /></button>
            <span className="bk-bar" style={{ '--p': Math.min(s.step - 1, 4) / 4 }} aria-hidden="true" />
          </header>

          <div className={`bk-body ${dir > 0 ? 'fwd' : 'back'}`} ref={body} key={s.step}>
            {s.step === 1 && (<>
              <h3 className="h-md"><Mix>{'{W}HERE {S}HALL\n{W}E {S}EE {Y}OU?'}</Mix></h3>
              <div className="seg" role="radiogroup" aria-label="Booking for" style={{ '--x': s.who === 'Men' ? 1 : 0 }}>
                {['Women', 'Men'].map(w => <button key={w} role="radio" aria-checked={s.who === w} className={s.who === w ? 'on' : ''} onClick={() => set({ who: w, picks: s.who === w ? s.picks : [] })}>{w}</button>)}
              </div>
              <label className={`field${tried && !valid[1] ? ' err' : ''}`}><span className="lbl">City</span>
                <input list="lk-cities" value={s.city} onChange={e => set({ city: e.target.value })} placeholder="e.g. Mumbai" autoComplete="address-level2" /></label>
              <datalist id="lk-cities">{[...POPULAR, 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', ...STATES].map(c => <option key={c} value={c} />)}</datalist>
              <div className="chips" aria-label="Popular cities">
                {POPULAR.map((c, i) => <button key={c} className={`chip${s.city === c ? ' on' : ''}`} style={{ '--d': `${i * 30}ms` }} onClick={() => set({ city: c })}>{c}</button>)}
              </div>
              <label className="field"><span className="lbl">Area or preferred salon <em>(optional)</em></span>
                <input value={s.area} onChange={e => set({ area: e.target.value })} placeholder="e.g. Bandra West" /></label>
              <a className="lbl ul" href={BRAND.locator} target="_blank" rel="noreferrer">Not sure? Find salons near you ↗</a>
            </>)}

            {s.step === 2 && (<>
              <h3 className="h-md"><Mix>{'{W}HAT {W}OULD\n{Y}OU {L}OVE?'}</Mix></h3>
              <div className="cats" role="tablist" aria-label="Service categories">{CATS.map(c => {
                const n = picks.filter(p => p.cat === c).length;
                return (
                  <button key={c} role="tab" aria-selected={c === cat} className={`cat${c === cat ? ' on' : ''}`} onClick={() => setCat(c)}>
                    <img src={img(CAT_IMG[c])} alt="" /><span className="lbl">{c}</span>{n > 0 && <b key={n}>{n}</b>}
                  </button>
                );
              })}</div>
              <ul className="bk-list" key={cat + s.who}>
                {menu.map((x, k) => {
                  const on = s.picks.includes(x.i);
                  return (
                    <li key={x.i} style={{ '--d': `${k * 45}ms` }}><button className={`bk-row${on ? ' on' : ''}`} aria-pressed={on} onClick={() => toggle(x.i)}>
                      <span>{x.name}{x.desc && <small className="lbl dim">{x.desc}</small>}</span><i aria-hidden="true"><svg viewBox="0 0 14 14"><path d="M7 2v10M2 7h10" className="plus" /><path d="M2.5 7.5l3 3 6-6.5" className="tick" /></svg></i>
                    </button></li>
                  );
                })}
                {!menu.length && <li className="lbl dim">Nothing on the {s.who.toLowerCase()}’s menu here.</li>}
              </ul>
              {picks.length > 0 && (
                <div className="picked">
                  <p className="lbl dim">Selected · {picks.length}</p>
                  <div className="chips">{picks.map(p => <button key={p.i} className="chip on x" onClick={() => toggle(p.i)} aria-label={`Remove ${p.name}`}>{p.name} <span aria-hidden="true">×</span></button>)}</div>
                </div>
              )}
            </>)}

            {s.step === 3 && (<>
              <h3 className="h-md"><Mix>{'{C}HOOSE {Y}OUR\n{M}OMENT'}</Mix></h3>
              <div className="days-head">
                <p className="lbl">{fmt(days[s.day], { month: 'long', year: 'numeric' })}</p>
                <div><button className="lbl" onClick={() => scrollDays(-1)} aria-label="Earlier dates">←</button><button className="lbl" onClick={() => scrollDays(1)} aria-label="Later dates">→</button></div>
              </div>
              <div className="days" ref={dayRow}>{days.map((d, i) => (
                <button key={i} className={`day${s.day === i ? ' on' : ''}`} onClick={() => set({ day: i, time: null })} aria-pressed={s.day === i}>
                  <span className="lbl">{i === 0 ? 'Today' : i === 1 ? 'Tmrw' : fmt(d, { weekday: 'short' })}</span><b>{fmt(d, { day: 'numeric' })}</b><span className="lbl dim">{fmt(d, { month: 'short' })}</span>
                </button>))}</div>
              {slots.every(x => x.off) ? (
                <p className="empty lbl dim">No times left today. <button className="ul" onClick={() => set({ day: s.day + 1, time: null })}>See tomorrow →</button></p>
              ) : (
                <div className="parts" key={s.day}>
                  {PARTS.map(([name, a, b], p) => {
                    const list = slots.filter(x => x.m >= a && x.m < b);
                    if (!list.length) return null;
                    return (
                      <div key={name} className="part" style={{ '--d': `${p * 80}ms` }}>
                        <p className="lbl dim">{name}</p>
                        <div className="slots">{list.map(x => (
                          <button key={x.m} disabled={x.off} aria-pressed={s.time?.m === x.m} className={`lbl slot${s.time?.m === x.m ? ' on' : ''}`} onClick={() => set({ time: x })}>{x.label}</button>))}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              {s.time && <p className="picked-when" key={when}><span className="lbl dim">Your request</span>{when}</p>}
            </>)}

            {s.step === 4 && (<>
              <h3 className="h-md"><Mix>{'{A}LMOST {T}HERE'}</Mix></h3>
              {summary(true)}
              <label className={`field${tried && !s.name.trim() ? ' err' : ''}${s.name.trim() ? ' ok' : ''}`}><span className="lbl">Your name</span>
                <input value={s.name} onChange={e => set({ name: e.target.value })} placeholder="Full name" autoComplete="name" /></label>
              <label className={`field${tried && s.name.trim() && !phoneOk ? ' err' : ''}${phoneOk ? ' ok' : ''}`}><span className="lbl">Mobile number</span>
                <input value={s.phone} onChange={e => set({ phone: e.target.value })} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" /></label>
              <label className="field"><span className="lbl">Anything we should know? <em>(optional)</em></span>
                <input value={s.note} onChange={e => set({ note: e.target.value })} placeholder="e.g. Sensitive skin, stylist preference" /></label>
              <p className="lbl dim">{BRAND.concept ? 'Concept demo: nothing is sent. On the live site, confirming opens WhatsApp with your request filled in.' : 'No payment to book. Confirming opens WhatsApp with your request filled in.'}</p>
            </>)}

            {s.step === 5 && (<>
              <svg className="done-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" /><path d="M20 33l8 8 16-18" /></svg>
              <p className="lbl dim">Reference {s.ref}</p>
              <h3 className="h-md"><Mix>{'{R}EQUEST {S}ENT'}</Mix></h3>
              <p className="body">{BRAND.concept ? `Concept demo: no message was sent. On the live site this goes to Lakmé Salon on WhatsApp, and the salon calls ${s.phone} to confirm.` : `Send the WhatsApp message if you haven’t yet. The salon will call ${s.phone} to confirm.`}</p>
              {summary(false)}
              <div className="bk-acts">
                {!BRAND.concept && <a className="btn" href={waLink(s, when, picks)} target="_blank" rel="noreferrer">Send on WhatsApp</a>}
                <a className="btn ghost-dk" href={icsUrl(days[s.day], s.time, s, picks)} download={`lakme-${s.ref}.ics`}>Add to calendar</a>
                <a className="lbl ul" href={tel(BRAND.tollFree)}>Or call {BRAND.tollFree}</a>
              </div>
            </>)}
          </div>

          <footer className="bk-foot">
            {s.step < 5 ? (<>
              {s.step > 1 ? <button className="lbl bk-back" onClick={() => go(s.step - 1)}>← Back</button> : <span />}
              <p className={`lbl bk-msg${tried && !ok ? ' bad' : ' dim'}`} key={tried && !ok ? need : 'ok'} role={tried && !ok ? 'alert' : undefined}>
                {tried && !ok ? need : [picks.length && `${picks.length} service${picks.length > 1 ? 's' : ''}`, s.time?.label].filter(Boolean).join(' · ')}
              </p>
              <button className="btn" onClick={next} data-off={!ok}>{s.step === 4 ? 'Confirm request' : 'Continue'} <span aria-hidden="true">→</span></button>
            </>) : <><span /><span className="bk-msg" /><button className="btn" onClick={dismiss}>Done</button></>}
          </footer>
        </div>
      </div>
    </div>
  );
}
