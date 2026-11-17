import { Nav, Hero, Intro, Services, Innovations, Rewards, Bridal, Story, Salons, Reserve, Footer, useReveal } from './sections.jsx';
import BookingModal from './BookingModal.jsx';

export default function App() {
  useReveal();
  return (
    <>
      <Nav />
      <main className="page">
        <Hero />
        <Intro />
        <Services />
        <Innovations />
        <Rewards />
        <Bridal />
        <Story />
        <Salons />
        <Reserve />
      </main>
      <Footer />
      <BookingModal />
    </>
  );
}
