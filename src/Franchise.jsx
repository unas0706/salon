import { useEffect, useState } from 'react';
import { BRAND, FRANCHISE as F } from './data.js';
import { Nav, Footer, CountUp, Cursor, ChatItem } from './sections.jsx';
import BookingModal from './BookingModal.jsx';

const EMPTY = { name: '', email: '', phone: '', area: '', state: '', country: 'India', looking: 'Unit Franchise' };
const tel = p => `tel:${p.replace(/[^\d+]/g, '')}`;

function Faq() {
  const [o, setO] = useState(0);
  return (
    <div className="chat">
      {F.faq.map(([q, a], i) => <ChatItem key={q} q={q} a={a} open={o === i} toggle={() => setO(o === i ? -1 : i)} />)}
    </div>
  );
}

function EnquiryForm({ looking, setLooking }) {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(false);
  useEffect(() => setF(p => ({ ...p, looking })), [looking]);
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); if (k === 'looking') setLooking(v); setErr(p => ({ ...p, [k]: '' })); };

  const submit = e => {
    e.preventDefault();
    const x = {};
    if (!f.name.trim()) x.name = 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email';
    if (f.phone.replace(/\D/g, '').length < 8) x.phone = 'Enter a valid phone number';
    if (!f.area.trim()) x.area = 'Where would you like to open?';
    if (!f.state.trim()) x.state = 'Enter your state';
    if (!f.country.trim()) x.country = 'Enter your country';
    setErr(x);
    if (Object.keys(x).length) return;
    // No server yet: open the visitor's email app with the enquiry filled in, addressed to the franchise team.
    const body = [`Name: ${f.name}`, `Email: ${f.email}`, `Phone: ${f.phone}`, `Area: ${f.area}`, `State: ${f.state}`, `Country: ${f.country}`, `Looking for: ${f.looking}`].join('\n');
    location.href = `mailto:${F.email}?subject=${encodeURIComponent(`Franchise enquiry: ${f.looking}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const field = (k, label, props = {}) => (
    <label className={`fr-f${err[k] ? ' bad' : ''}`}>
      <span className="mono">{label}</span>
      <input value={f[k]} onChange={e => set(k, e.target.value)} {...props} aria-invalid={!!err[k]} />
      {err[k] && <em>{err[k]}</em>}
    </label>
  );

  if (sent) return (
    <div className="fr-form fr-sent">
      <h3>Almost there.</h3>
      <p>Your email app should have opened with your enquiry filled in. Press send and the franchise team will get back to you. If nothing opened, email <a href={`mailto:${F.email}`}>{F.email}</a> or call <a href={tel(F.phones[0])}>{F.phones[0]}</a>.</p>
      <button className="pill outline" onClick={() => { setSent(false); setF({ ...EMPTY, looking }); }}>Send another enquiry</button>
    </div>
  );

  return (
    <form className="fr-form" onSubmit={submit} noValidate>
      <h3>Franchise enquiry</h3>
      <div className="fr-row">{field('name', 'Name', { autoComplete: 'name', placeholder: 'Your full name' })}{field('phone', 'Phone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '+91 98765 43210' })}</div>
      {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
      <div className="fr-row">{field('area', 'Area', { placeholder: 'Where to open' })}{field('state', 'State', { autoComplete: 'address-level1', placeholder: 'Tamil Nadu' })}</div>
      {field('country', 'Country', { autoComplete: 'country-name' })}
      <div className="fr-f"><span className="mono">What are you looking for?</span>
        <div className="fr-seg">{F.models.map(m => <button type="button" key={m.key} className={f.looking === m.key ? 'on' : ''} onClick={() => set('looking', m.key)}>{m.title}</button>)}</div>
      </div>
      <button className="pill dkp fr-submit" type="submit">Send enquiry <i className="arr">↗</i></button>
      <small className="mono">We'll reply on the phone and email you give here.</small>
    </form>
  );
}

export default function Franchise() {
  const [looking, setLooking] = useState('Unit Franchise');

  useEffect(() => {
    document.title = 'Franchise | Cheap & Best Salon';
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const choose = key => { setLooking(key); document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <>
      <Nav home={false} />
      <main className="fr">
        {/* hero */}
        <section className="fr-hero light">
          <div className="fr-hero-in">
            <p className="tag mono rv">Franchise · {BRAND.name}</p>
            <h1 className="rv">Join the fast lane to <b>success.</b></h1>
            <p className="fr-lead rv">{F.intro}</p>
            <div className="btns rv">
              <a className="pill dkp" href="#enquire">Enquire now <i className="arr">↗</i></a>
              <a className="pill outline" href={tel(F.phones[0])}>Call {F.phones[0]}</a>
            </div>
          </div>
          <dl className="fr-stats rv">
            <div><dd><CountUp to={365} suffix="+" /></dd><dt className="mono">Outlets</dt></div>
            <div><dd><CountUp to={280} suffix="+" /></dd><dt className="mono">Unit franchises</dt></div>
            <div><dd><CountUp to={F.states.length} /></dd><dt className="mono">States and territories</dt></div>
            <div><dd><CountUp to={1} prefix="≤ " suffix=" yr" /></dd><dt className="mono">ROI period</dt></div>
          </dl>
        </section>


        {/* models */}
        <section className="fr-sec dark">
          <p className="tag mono rv">#1 · Two ways to join</p>
          <h2 className="rv">Pick the model that <b>fits you.</b></h2>
          <div className="fr-models">
            {F.models.map((m, i) => (
              <article key={m.key} className="fr-model rv" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="mono fr-num">0{i + 1}</span>
                <h3>{m.title}</h3>
                <p className="fr-mlead">{m.lead}</p>
                <ul>{m.points.map(p => <li key={p}><i>✓</i>{p}</li>)}</ul>
                <button className="pill light slide" onClick={() => choose(m.key)}><i className="arr dk">↗</i><span>Enquire about {m.title.toLowerCase()}</span></button>
              </article>
            ))}
          </div>
        </section>

        {/* support */}
        <section className="fr-sec light">
          <p className="tag mono rv">#2 · What you get</p>
          <h2 className="rv">Support that goes <b>beyond set-up.</b></h2>
          <div className="fr-grid">
            {F.support.map(([t, d], i) => (
              <article key={t} className="fr-card rv" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t}</h3><p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* master income */}
        <section className="fr-sec dark">
          <p className="tag mono rv">#3 · Master franchise</p>
          <h2 className="rv">Three ways a master <b>earns.</b></h2>
          <ol className="fr-streams">
            {F.streams.map(([t, d], i) => (
              <li key={t} className="rv" style={{ transitionDelay: `${i * 90}ms` }}><span className="mono">0{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>
            ))}
          </ol>
        </section>

        {/* footprint */}
        <section className="fr-sec fr-foot light">
          <p className="tag mono rv">#4 · Where we are</p>
          <h2 className="rv">Growing across <b>South India.</b></h2>
          <p className="fr-lead rv">Successful unit franchises operate across these states. We hope to open many more outlets all over the country in the next few years.</p>
          <div className="fr-chips rv">{F.states.map(s => <span key={s}>{s}</span>)}</div>
          <p className="fr-who rv">We are looking for <b>passionate, creative and unique</b> people with a keen interest in entrepreneurship, to join our success story.</p>
        </section>

        {/* faq */}
        <section className="fr-sec fr-faqsec dark">
          <div>
            <p className="tag mono rv">#5 · Good to know</p>
            <h2 className="rv">Franchise <b>questions.</b></h2>
            <p className="sub rv">Straight answers from what we publish. For figures, talk to the franchise team.</p>
          </div>
          <div className="rv"><Faq /></div>
        </section>

        {/* contact */}
        <section className="fr-sec fr-contact light" id="enquire">
          <div className="fr-cinfo">
            <p className="tag mono rv">#6 · Let's talk</p>
            <h2 className="rv">Start your <b>enquiry.</b></h2>
            <div className="fr-details rv">
              <div><span className="mono">Franchise and business enquiries</span>
                {F.phones.map(p => <a key={p} href={tel(p)}>{p}</a>)}
                <a href={`mailto:${F.email}`}>{F.email}</a></div>
              <div><span className="mono">Corporate office</span>
                <b>{BRAND.company}</b>
                <p>{BRAND.address[0]},<br />{BRAND.address[1]}</p></div>
              <div><span className="mono">General</span>
                <a href={tel(BRAND.phone)}>{BRAND.phone}</a>
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></div>
            </div>
          </div>
          <div className="rv"><EnquiryForm looking={looking} setLooking={setLooking} /></div>
        </section>

        <Footer home={false} />
      </main>
      <BookingModal />
      <Cursor />
    </>
  );
}
