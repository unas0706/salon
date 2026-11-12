import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

maplibregl.setWorkerUrl(workerUrl);

// MapLibre street map (port of the mapcn "marker + tooltip" pattern, without shadcn/Tailwind/TS).
// Dark basemap: CARTO Dark Matter vector style (OpenStreetMap data), no API key.
const STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export default function StreetMap({ outlets, metro, sel, onSelect, me, label }) {
  const box = useRef(null);
  const map = useRef(null);
  const marks = useRef({});
  const meMark = useRef(null);
  const pick = useRef(onSelect);
  pick.current = onSelect;

  useEffect(() => {
    const m = new maplibregl.Map({ container: box.current, style: STYLE, center: [80.22, 13.04], zoom: 10, attributionControl: { compact: true } });
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    const b = new maplibregl.LngLatBounds();
    metro.forEach(o => b.extend([o.lng, o.lat]));
    m.fitBounds(b, { padding: 40, duration: 0, maxZoom: 12 });

    outlets.forEach(o => {
      const el = document.createElement('button');
      el.className = 'st-pin';
      el.setAttribute('aria-label', label(o));
      el.innerHTML = '<i></i>';
      const tip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 18, className: 'st-tip' }).setText(label(o));
      const mk = new maplibregl.Marker({ element: el }).setLngLat([o.lng, o.lat]).addTo(m);
      el.addEventListener('mouseenter', () => tip.setLngLat([o.lng, o.lat]).addTo(m));
      el.addEventListener('mouseleave', () => tip.remove());
      el.addEventListener('click', e => { e.stopPropagation(); pick.current(o.id); });
      marks.current[o.id] = { el, mk };
    });
    return () => { m.remove(); map.current = null; marks.current = {}; };
  }, []);

  useEffect(() => {
    Object.entries(marks.current).forEach(([id, { el }]) => el.classList.toggle('on', +id === sel));
    const o = outlets.find(x => x.id === sel);
    if (o && map.current) map.current.flyTo({ center: [o.lng, o.lat], zoom: Math.max(map.current.getZoom(), 14), duration: 900 });
  }, [sel]);

  useEffect(() => {
    if (!map.current) return;
    meMark.current?.remove();
    if (me) { const el = document.createElement('i'); el.className = 'st-me'; meMark.current = new maplibregl.Marker({ element: el }).setLngLat([me.lng, me.lat]).addTo(map.current); }
  }, [me]);

  return <div ref={box} className="st-map" />;
}
