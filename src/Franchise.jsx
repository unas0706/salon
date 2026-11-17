import { useEffect } from 'react';
import { BRAND, FRANCHISE as F, PROOF, tel } from './data.js';
import { Nav, Footer, Mix, Label, Count, useReveal } from './sections.jsx';
import BookingModal from './BookingModal.jsx';

const n2 = i => String(i + 1).padStart(2, '0');

export default function Franchise() {
  useReveal();
  useEffect(() => { document.title = 'Franchise | Lakmé Salon'; }, []);
  return (
    <>
      <Nav home={false} />
      <main className="page fr">
        <section className="sec fr-hero">
          <Label className="side">Franchise</Label>
          <div className="main">
            <h1 className="h-xl"><Mix>{'{J}OIN THE {L}AKMÉ\n{S}ALON {F}AMILY'}</Mix></h1>
            <p className="body narrow">Over 300 entrepreneurs have partnered with Lakmé Lever as franchisees, backed by over 40 years of experience and a 100% subsidiary of Hindustan Unilever Ltd.</p>
            <div className="fr-acts">
              <a className="btn" href={BRAND.joinUs} target="_blank" rel="noreferrer">Apply to join ↗</a>
              <a className="lbl ul" href={tel(BRAND.tollFree)}>Call {BRAND.tollFree}</a>
            </div>
          </div>
          <figure className="fr-pic"><img src="/lk/bridal-2.jpg" alt="" /></figure>
        </section>

        <section className="sec">
          <Label className="side">The Lakmé advantage</Label>
          <div className="main"><h2 className="h-xl"><Mix>{'{W}HY {L}AKMÉ'}</Mix></h2></div>
          <ol className="fr-adv">
            {F.advantages.map(([t, d], i) => <li key={t} style={{ '--d': `${i * 90}ms` }}><p className="lbl dim">{n2(i)}</p><h3 className="lbl">{t}</h3><p className="body">{d}</p></li>)}
          </ol>
          <dl className="proof">{PROOF.map(([v, k], i) => <div key={k} style={{ '--d': `${i * 90}ms` }}><dt className="lbl dim">{k}</dt><dd><Count value={v} /></dd></div>)}</dl>
        </section>

        <section className="sec">
          <Label className="side">The 6P model</Label>
          <div className="main">
            <h2 className="h-xl"><Mix>{'{F}ROM {C}ATCHMENT\n{S}TUDY TO {L}AUNCH'}</Mix></h2>
            <ul className="rows big">
              {F.process.map(([t, d], i) => <li key={t}><div className="row static"><span className="lbl dim">{n2(i)}</span><span className="lbl">{t}</span><span className="body">{d}</span></div></li>)}
            </ul>
          </div>
        </section>

        <section className="reserve">
          <img className="reserve-bg" data-parallax="0.18" src="/lk/bridal-9.jpg" alt="" aria-hidden="true" />
          <h2 className="h-xl"><Mix>{'{O}PEN {Y}OUR\n{L}AKMÉ {S}ALON'}</Mix></h2>
          <div className="reserve-acts">
            <a className="btn light" href={BRAND.joinUs} target="_blank" rel="noreferrer">Apply on lakmesalon.in ↗</a>
            <a className="btn ghost" href={`mailto:${BRAND.careEmail}?subject=${encodeURIComponent('Franchise enquiry')}`}>Email us</a>
          </div>
        </section>
      </main>
      <Footer home={false} />
      <BookingModal />
    </>
  );
}
