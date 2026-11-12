import OUTLETS from './outlets.json';
export { OUTLETS };

// Shared helpers for anything that shows or picks an outlet (map, booking).
export const label = o => (o.city && o.city !== 'Chennai' && !o.area.includes(o.city) ? `${o.area}, ${o.city}` : o.area);
export const km = (a, b) => {
  const R = 6371, rad = d => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
export const directions = o => `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`;
