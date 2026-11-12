import { useEffect } from 'react';
import { Splash, Nav, Hero, Services, Deals, Chain, Faq, Visit, Footer, Cursor } from './sections.jsx';
import BookingModal from './BookingModal.jsx';

export default function App() {
  useEffect(() => {
    const onScroll = () =>
      document.querySelectorAll('[data-parallax]').forEach(el => {
        el.style.translate = `0 ${scrollY * parseFloat(el.dataset.parallax) * 4}px`;
      });
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Splash />
      <Nav />
      <main id="top">
        <Hero />
        <Services />
        <Deals />
        <Chain />
        <Faq />
        <Visit />
        <Footer />
      </main>
      <BookingModal />
      <Cursor />
    </>
  );
}
