// All editable content lives here.
// Facts taken from cheapandbestsalon.in: name, tagline, address, phone, email, hours, socials, outlet count, service categories.
// Service prices come from their service pages.
export const BRAND = {
  first: 'cheap',
  second: 'best',
  name: 'Cheap & Best Salon',
  tagline: "The most affordable men's salon with exceptional service.",
  company: 'Anbu Paul Hotels Pvt Ltd',
  address: ['#18/70, Halls Road, Kilpauk', 'Chennai – 600 010'],
  hours: 'Mon–Sun · 7:00 AM – 10:00 PM',
  openMin: 7 * 60,
  closeMin: 22 * 60,
  phone: '+91 90030 43257',
  email: 'nizam@paulsons.in',
  franchisePhones: ['+91 90030 43257', '+91 70944 79141', '+91 72005 19522'],
  complaintsPhone: '+91 99440 41143',
  instagram: 'https://instagram.com/cheapandbestsalonsindia',
  facebook: 'https://facebook.com/Cheapandbestmenssalonindia',
  outlets: '365+',
  franchiseUrl: '/franchise', // placeholder: the franchise page comes later
  brands: ['Godrej', 'Wella'],
  currency: '₹',
};

// Real prices (₹) from cheapandbestsalon.in service pages. Durations are only listed for head massage.
export const CATS = ['Hair', 'Beard', 'Colour', 'Skin', 'Massage', 'Hands & feet'];
export const SERVICES = [
  { cat: 'Hair', name: 'Haircut', desc: 'Cut chosen for your face shape, hair texture and lifestyle.', price: 99 },
  { cat: 'Hair', name: 'Kids cut', desc: 'A neat cut for the little ones.', price: 80 },
  { cat: 'Hair', name: 'Head shave', desc: 'Clean, smooth head shave.', price: 120 },
  { cat: 'Hair', name: 'Change of style', desc: 'Styled with premium gel, wax and spray.', price: 199 },
  { cat: 'Hair', name: 'Kids change of style', desc: 'A fresh style for kids.', price: 149 },
  { cat: 'Beard', name: 'Shave', desc: 'Clean shave.', price: 49 },
  { cat: 'Beard', name: 'Beard trim', desc: 'Shape and tidy your beard.', price: 70 },
  { cat: 'Beard', name: 'Beard design', desc: 'Sharp lines and a custom beard shape.', price: 129 },
  { cat: 'Colour', name: 'Fashion colour', desc: 'Colour accents, priced per streak.', price: 199 },
  { cat: 'Colour', name: 'Beard colour', desc: 'Even, natural-looking beard colour.', price: 199 },
  { cat: 'Colour', name: 'Hair dye', desc: 'Shade matched to your skin tone and eye colour.', price: 270 },
  { cat: 'Colour', name: 'Global hair colour', desc: 'All-over colour from root to tip.', price: 449 },
  { cat: 'Colour', name: 'Cap highlights', desc: 'Highlights through a cap for a bold look.', price: 799 },
  { cat: 'Skin', name: 'Half hand bleach', desc: 'Evens out skin tone.', price: 149 },
  { cat: 'Skin', name: 'Full hand bleach', desc: 'Evens out skin tone.', price: 220 },
  { cat: 'Skin', name: 'Face and neck bleach', desc: 'Brighter, even-toned skin.', price: 220 },
  { cat: 'Skin', name: 'De-tan', desc: 'Removes tan and dullness.', price: 299 },
  { cat: 'Skin', name: 'Peel off mask', desc: 'Pore-cleansing mask.', price: 349 },
  { cat: 'Skin', name: 'Cleanup', desc: 'Quick deep cleanse for fresher skin.', price: 399 },
  { cat: 'Skin', name: 'Fruit facial', desc: 'Refreshing fruit-based facial.', price: 499 },
  { cat: 'Skin', name: 'Mini facial', desc: 'A short facial for a quick glow.', price: 499 },
  { cat: 'Skin', name: 'Chocolate facial', desc: 'Nourishing chocolate facial.', price: 599 },
  { cat: 'Massage', name: 'Head massage, coconut oil', desc: 'Eases tension in scalp, neck and shoulders.', min: 20, price: 170 },
  { cat: 'Massage', name: 'Head massage, almond oil', desc: 'Eases tension in scalp, neck and shoulders.', min: 20, price: 249 },
  { cat: 'Massage', name: 'Head massage, olive oil', desc: 'Eases tension in scalp, neck and shoulders.', min: 20, price: 249 },
  { cat: 'Hands & feet', name: 'Manicure', desc: 'Hands tidied with a matte finish.', price: 299 },
  { cat: 'Hands & feet', name: 'Pedicure', desc: 'Nails trimmed, dead skin removed, feet moisturised.', price: 449 },
  { cat: 'Hands & feet', name: 'Crack removal', desc: 'Treatment for cracked heels.', price: 599 },
  { cat: 'Hands & feet', name: 'Crack removal pedicure', desc: 'Full pedicure with heel crack treatment.', price: 799 },
];

// Combos: plain totals of the real prices above. The original site lists no combo offers, so there are no invented discounts.
const P = n => SERVICES.find(s => s.name === n).price;
const combo = (...names) => {
  const items = names.map(n => { const i = SERVICES.findIndex(x => x.name === n); return { i, name: n, price: SERVICES[i].price, min: SERVICES[i].min }; });
  return { title: names.join(' + ').replace('Head massage, coconut oil', 'Head massage'), items, price: items.reduce((t, x) => t + x.price, 0) };
};
export const DEALS = [
  combo('Haircut', 'Shave'),
  combo('Haircut', 'Beard trim'),
  combo('Haircut', 'Beard design'),
  combo('Haircut', 'Shave', 'Head massage, coconut oil'),
  combo('Haircut', 'Beard trim', 'Cleanup'),
  combo('Haircut', 'Beard colour'),
  combo('Haircut', 'Hair dye'),
  combo('Haircut', 'Fruit facial'),
  combo('Manicure', 'Pedicure'),
  combo('Haircut', 'Shave', 'Fruit facial', 'Head massage, coconut oil'),
];

// Real facts from their site, shown where reviews would be (no reviews on their site yet).
export const CHAIN_FACTS = [
  ["“365+ outlets and growing. Honest prices at every one.”", 'The chain'],
  ["“Open every day, 7 in the morning to 10 at night.”", 'Hours'],
  ["“Wella and Godrej products, the same quality at every chair.”", 'Brands'],
  ["“Master and unit franchises are open for enquiry.”", 'Franchise'],
];

export const FAQ = [
  ['How do I pay?', 'Booking is free. Pay at the chair after your service.'],
  ['Can I cancel or move my booking?', 'Yes, any time. Just book a new slot, there is nothing to refund.'],
  ['Do you take walk-ins?', 'Yes, when a chair is free. Booking guarantees your time, and it takes under a minute.'],
  ['What are your opening hours?', 'We are open every day, from 7:00 AM to 10:00 PM.'],
  ['Why are your prices so low?', 'A simple menu, no upsells and a busy shop. We keep the cost down, not the quality.'],
  ['Can I open an outlet?', 'Yes. Master and unit franchises are available. Call +91 90030 43257 or use the contact form.'],
];

// Shop time is India Standard Time, whatever the visitor's device clock says.
export const istMinutes = (now = new Date()) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map(x => [x.type, x.value]));
  return +p.hour * 60 + +p.minute;
};
export const fmtTime = m => { const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

// Next free 20-minute slot (the same grid the booking modal uses), or when the shop opens next.
export function chairStatus(now = new Date()) {
  const m = istMinutes(now), last = BRAND.closeMin - 20;
  if (m < BRAND.openMin) return { open: false, label: fmtTime(BRAND.openMin), day: 'today' };
  const next = Math.ceil(m / 20) * 20;
  if (next > last) return { open: false, label: fmtTime(BRAND.openMin), day: 'tomorrow' };
  return { open: true, label: fmtTime(next) };
}

// Franchise facts, all taken from cheapandbestsalon.in (home, unit-franchise, master-franchise and contact pages).
export const FRANCHISE = {
  headline: 'Join the fast lane to success with our franchise opportunities.',
  intro: 'Cheap & Best salons, a part of Anbu Paul Hotels Pvt Ltd, aim to provide excellent hairdressing and beauty services in a relaxed environment at affordable prices, an exceptional men’s salon experience that anybody can afford.',
  states: ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Pondicherry'],
  brands: ['Wella', 'Beardo', 'Godrej'],
  phones: ['+91 90030 43257', '+91 70944 79141', '+91 72005 19522'],
  email: 'ceo@paulsons.in',
  models: [
    { key: 'Unit Franchise', title: 'Unit franchise', lead: 'Your own Cheap & Best salon.',
      points: ['Low investment, high returns, with ROI within 1 year', 'Handpicked, experienced stylists', 'Help choosing the best location for your salon', 'Regular business guidance, performance reviews, salon visits and audits'] },
    { key: 'Master Franchise', title: 'Master franchise', lead: 'Build and own a whole territory.',
      points: ['Significantly higher ROI than a unit franchise', 'Earn a share of the franchise fee on every franchise sold in your territory', 'Share in the monthly royalty each franchisee pays', 'Run units of your own and expand at a faster pace'] },
  ],
  support: [
    ['Training and people', 'Handpicked, experienced stylists, with ongoing focus on quality and staff training.'],
    ['Business guidance', 'Support does not end at set-up: regular guidance, performance reviews, salon visits and audits keep your salon running efficiently.'],
    ['Location help', 'We evaluate the market and help pick the best spot, looking at demographics, population density, household income and competition.'],
    ['Affordable, premium feel', 'Classy, fully air-conditioned salons with set cleanliness norms. Premium services the common man can afford.'],
    ['Quality products', 'Tie-ups with leading brands, Wella, Beardo and Godrej, for men’s hair and grooming.'],
    ['Low investment, high returns', 'You do not need a big investment. You get strong facilities and support, and ROI within 1 year.'],
  ],
  streams: [
    ['Franchise fee share', 'When a franchise is sold in your territory, you receive a percentage of the franchise fee.'],
    ['Monthly royalty share', 'You share in the monthly royalty each franchisee pays to the franchisor. This is the most significant part of the reward.'],
    ['Your own units', 'Income from the units you own and manage yourself.'],
  ],
  faq: [
    ['What is the difference between a unit and a master franchise?', 'A unit franchise is a single Cheap & Best salon that you own and run. A master franchise covers a territory: you bring in franchisees, earn from their fees and royalties, and can run units of your own too.'],
    ['How does a master franchisee earn?', 'Three ways. A percentage of the franchise fee when a franchise is sold in your territory, a share of the monthly royalty every franchisee pays, and the income from units you own and manage.'],
    ['How much do I need to invest?', 'Cheap & Best does not need a high investment, and our franchisees see ROI within 1 year. We do not publish exact figures online, so call or send the form and the franchise team will take you through them.'],
    ['What support do I get after opening?', 'Regular business guidance, performance reviews, salon visits and audits, so your salon is managed efficiently. We also provide handpicked, experienced stylists.'],
    ['How is the location chosen?', 'We help evaluate the market and choose the best location, looking at trade-area demographics, population density, household income and competition. Our salons sit in centres with good visibility, appeal and accessibility.'],
    ['Which products do you use?', 'Wella, Beardo and Godrej, leading brands for men’s hair and grooming.'],
    ['Where are your franchises?', 'Successful unit franchises operate in Tamil Nadu, Karnataka, Kerala, Andhra Pradesh, Telangana and Pondicherry. We plan to open many more across the country.'],
    ['How do I enquire?', 'Fill in the form on this page, or call or email the franchise team using the details below.'],
  ],
};
