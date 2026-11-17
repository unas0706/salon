// All editable content lives here.
// Facts are taken from lakmesalon.in (home, about-us, contact-us, lakme-advantage, franchisee-process, runway-reward) and
// salons.lakmesalon.in, Nov 2026. Lakmé Salon publishes no service prices online, so the site shows none.
//
// Headings use a tiny markup: a letter in {braces} is set in the script face, e.g. '{Y}OUR {V}ISION'.

export const BRAND = {
  name: 'Lakmé Salon',
  since: 1980,
  tagline: 'Your vision, our expertise',
  purpose: 'We exist to inspire women to choose beauty unapologetically, no matter what.',
  tollFree: '1800 123 1952',
  careEmail: 'care.llpl@unilever.com',
  productEmail: 'lakmesalon.queries@unilever.com',
  whatsapp: '919987472865',
  locator: 'https://salons.lakmesalon.in/',
  shop: 'https://www.lakmesalon.in/collections/all',
  joinUs: 'https://www.lakmesalon.in/pages/join-us',
  instagram: 'https://www.instagram.com/lakmesalon/',
  facebook: 'https://www.facebook.com/LakmeSalon/',
  x: 'https://x.com/LakmeSalon',
  youtube: 'https://www.youtube.com/user/LakmeSalonIndia',
  // ASSUMPTION: hours vary by salon and are not published centrally (locator pages show "Opens at 10:00 AM").
  // Booking times are requests that the salon confirms by phone.
  openMin: 10 * 60,
  closeMin: 20 * 60,
  slot: 30,
  // Pitch concept: bookings are simulated and never sent to Lakmé's real WhatsApp line. Set false for a live site.
  concept: true,
};

export const STATS = [
  ['450+', 'Salons'],
  ['160+', 'Cities'],
  ['4,000+', 'Experts'],
  ['40+', 'Years'],
];

// The four service families on lakmesalon.in, with the sub-menus listed on the site.
export const FAMILIES = [
  { key: 'Hair', title: 'Hair Artistry', img: 'hair', items: ['Haircut', 'Colours', 'Texture', 'Hair Spa', 'Hair Style'] },
  { key: 'Skin', title: 'Skin Rituals', img: 'radiance', items: ['Facials', 'Clean up', 'Waxing', 'Body Care', 'Everyday Essentials'] },
  { key: 'Makeup', title: 'Bridal & Makeup', img: 'bridal-3', items: ['Bridal Makeup', 'Party Makeup', 'Special Occasion', 'Outdoor', 'Saaree Drape'] },
  { key: 'Hands & Feet', title: 'Hands & Feet', img: 'feet', items: ['Manicure', 'Pedicure', 'Nails'] },
];

// Men's menu as listed on the site.
export const MEN = {
  Hair: ['Haircut', 'Colours', 'Texture', 'Hair Spa'],
  Skin: ['Facials', 'Clean up'],
  Makeup: ['Party Makeup'],
  'Hands & Feet': ['Manicure', 'Pedicure'],
};

// "Innovation services" featured on the home page. Descriptors follow each service's page title on lakmesalon.in.
export const INNOVATIONS = [
  { name: '{P}ERFECT {R}ADIANCE', plain: 'Lakmé Perfect Radiance', what: 'Advanced pigmentation treatment', img: 'radiance', cat: 'Innovations' },
  { name: '{K}-SSENCE {P}EELS', plain: 'K-SSENCE Skin Renewal Peels', what: 'Skin renewal peels', img: 'peel', cat: 'Innovations' },
  { name: '{G}LASS {S}HINE {H}AIR', plain: 'Glass Shine Hair', what: 'Glass shine hair treatment', img: 'hair', cat: 'Innovations' },
];

// Runway Rewards, tier set "Silver Icon → Showstopper" from lakmesalon.in/pages/runway-reward.
export const REWARDS = {
  perks: ['3,000 welcome spotlights for new members', '15% off all services for new customers, all days', '10% off Lakmé products for everyone'],
  tiers: [
    { name: 'Silver Icon', spend: '₹1,000 – ₹9,999', rate: 2, gift: '₹500 in vouchers (2 × ₹250)', happy: '10% off services, Mon–Thu before 3 PM', bday: '15% off services' },
    { name: 'Gold Glam', spend: '₹10,000 – ₹24,999', rate: 5, gift: '₹500 in vouchers + 1 “Showstopper for a day”', happy: '10% off services, Mon–Thu before 3 PM', bday: '15% off services' },
    { name: 'Platinum Elite', spend: '₹25,000 – ₹49,999', rate: 10, gift: '₹1,500 in vouchers (3 × ₹500) + 2 “Showstopper for a day”', happy: '15% off services, all days', bday: '15% off services' },
    { name: 'Showstopper', spend: '₹50,000 and above', rate: 10, gift: '₹3,000 in vouchers (3 × ₹1,000)', happy: '20% off services, all days', bday: '30% off services' },
  ],
  note: 'Spotlights are subject to expiry. Full terms on lakmesalon.in.',
  url: 'https://www.lakmesalon.in/pages/runway-reward',
};

// About-us timeline.
export const STORY = [
  ['1980', 'Our journey began with the launch of our first salon, India’s first chain of beauty salons.'],
  ['2000', 'Partnered with Lakmé Fashion Week, cementing a position as a trendsetter in the industry.'],
  ['Today', '450+ salons in 160+ cities, run with 300+ entrepreneurs who own and operate Lakmé Salons across the country.'],
];
export const PROOF = [['300+', 'Franchise partners'], ['63,000+', 'Experts trained'], ['4,000+', 'Professional stylists'], ['400+', 'Product counters']];

// States listed on the official salon locator.
export const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Meghalaya', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
export const stateUrl = s => `${BRAND.locator}location/${s.toLowerCase().replace(/\s+/g, '-')}`;

// Bookable services for the booking sheet, built from the menus above.
export const CATS = ['Hair', 'Skin', 'Makeup', 'Hands & Feet', 'Innovations'];
export const SERVICES = [
  ...FAMILIES.flatMap(f => f.items.map(name => ({ cat: f.key, name, men: (MEN[f.key] || []).includes(name) }))),
  ...INNOVATIONS.map(i => ({ cat: 'Innovations', name: i.plain, desc: i.what })),
  { cat: 'Innovations', name: 'K-SSENCE Face Rituals', desc: 'Glass shine brightening ritual' },
  { cat: 'Innovations', name: 'K-SSENCE Head Rituals', desc: 'Head ritual' },
];

export const FRANCHISE = {
  advantages: [
    ['Leading chain of 450+ salons', 'India’s first and leading chain of beauty salons, in 160+ cities.'],
    ['High-potency products & 400+ counters', 'Professional products and a retail network behind every salon.'],
    ['Partnership with Lakmé Fashion Week', 'A trendsetting association that spans over two decades.'],
  ],
  process: [
    ['Place', 'On-site set-up: from site evaluation, selection and deal closure to salon design.'],
    ['Portfolio', 'A diverse range of services and innovations across hair, skin, hands & feet, makeup and nails.'],
    ['Process', 'IT plus continuous operational support and audits for every franchisee salon.'],
    ['People', 'Ongoing HR and training support, with innovation and refresher training.'],
    ['Promotion', 'Marketing and advertising support, including a 90-day launch plan from 15 days before opening to 75 days after.'],
    ['Personality', 'Image and leadership.'],
  ],
};

// Shop time is India Standard Time, whatever the visitor's device clock says.
export const istMinutes = (now = new Date()) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map(x => [x.type, x.value]));
  return +p.hour * 60 + +p.minute;
};
export const fmtTime = m => { const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
export const tel = p => `tel:${p.replace(/[^\d+]/g, '')}`;
