/* ============================================================
   MAPA.JS — Wrapper de Leaflet
   Expone: window.MapaCT
   ============================================================ */
(function (global) {
  'use strict';

  /** "19.390925, -102.046743" | "19.390925 -102.046743" → [lat, lng] */
  function parseCoords(s) {
    if (!s) return null;
    if (Array.isArray(s) && s.length === 2) return [+s[0], +s[1]];
    const m = String(s).match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);
    if (!m) return null;
    const lat = +m[1], lng = +m[2];
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    return [lat, lng];
  }

  const ICONO_DOM = L.divIcon({
    className: '',
    html: `<div class="pin pin-dom">🏠</div>`,
    iconSize: [34, 34], iconAnchor: [17, 34],
  });
  const ICONO_TER = L.divIcon({
    className: '',
    html: `<div class="pin pin-ter">📡</div>`,
    iconSize: [34, 34], iconAnchor: [17, 34],
  });

  /** Crea (o reutiliza) un mapa en un contenedor. */
  function crear(contenedorId, { zoom = 17 } = {}) {
    const el = document.getElementById(contenedorId);
    if (!el) return null;

    if (el._mapaLeaflet) { el._mapaLeaflet.remove(); }

    const mapa = L.map(el, { zoomControl: true, scrollWheelZoom: true })
                  .setView([19.4, -102.05], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(mapa);

    el._mapaLeaflet = mapa;
    return mapa;
  }

  /**
   * Dibuja domicilio y terminal.
   * @param {L.Map} mapa
   * @param {{domicilio?:string|number[], terminal?:string|number[],
   *          nombreTerminal?:string, titulo?:string}} opts
   */
  function mostrar(mapa, opts = {}) {
    if (!mapa) return { ok: false, motivo: 'sin mapa' };

    // Limpia capas previas
    if (mapa._capa) mapa.removeLayer(mapa._capa);
    const capa = L.layerGroup().addTo(mapa);
    mapa._capa = capa;

    const pDom = parseCoords(opts.domicilio);
    const pTer = parseCoords(opts.terminal);
    const puntos = [];

    if (pDom) {
      L.marker(pDom, { icon: ICONO_DOM }).addTo(capa)
        .bindPopup(`<b>🏠 Domicilio</b><br>${opts.titulo || ''}<br><code>${pDom.join(', ')}</code>`);
      puntos.push(pDom);
    }
    if (pTer) {
      L.marker(pTer, { icon: ICONO_TER }).addTo(capa)
        .bindPopup(`<b>📡 Terminal</b><br>${opts.nombreTerminal || '—'}<br><code>${pTer.join(', ')}</code>`);
      puntos.push(pTer);
    }
    if (pDom && pTer) {
      L.polyline([pDom, pTer], { color: '#ff9933', weight: 3, dashArray: '6 6' }).addTo(capa);
      const dist = mapa.distance(pDom, pTer);
      L.popup({ closeButton: false })
        .setLatLng([(pDom[0] + pTer[0]) / 2, (pDom[1] + pTer[1]) / 2])
        .setContent(`<small>${dist.toFixed(0)} m</small>`)
        .openOn(mapa);
    }

    if (puntos.length === 1) mapa.setView(puntos[0], 17);
    else if (puntos.length > 1) mapa.fitBounds(L.latLngBounds(puntos).pad(0.3));

    return { ok: puntos.length > 0, puntos, distancia: (pDom && pTer) ? mapa.distance(pDom, pTer) : null };
  }

  /** Muestra varias terminales a la vez (modo "cobertura"). */
  function mostrarVarias(mapa, marcadores) {
    if (mapa._capa) mapa.removeLayer(mapa._capa);
    const capa = L.layerGroup().addTo(mapa);
    mapa._capa = capa;
    const pts = [];
    marcadores.forEach(m => {
      const p = parseCoords(m.coords);
      if (!p) return;
      pts.push(p);
      L.marker(p, { icon: m.tipo === 'terminal' ? ICONO_TER : ICONO_DOM })
        .addTo(capa).bindPopup(`<b>${m.titulo || ''}</b><br>${m.subtitulo || ''}`);
    });
    if (pts.length) mapa.fitBounds(L.latLngBounds(pts).pad(0.2));
  }

  global.MapaCT = { crear, mostrar, mostrarVarias, parseCoords };
})(window);