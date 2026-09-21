/* ============================================================
   COMISIONES.JS — Cálculo semanal + lectura/escritura de hojas
   Expone: window.Comisiones  y  window.Hojas
   ============================================================ */
(function (global) {
  'use strict';

  /* ── Configuración ─────────────────────────────────────── */
  const CONFIG = {
    // ID publicado de tu hoja (el que aparece en /d/e/…/pubhtml)
    SHEET_PUB_ID: '2PACX-1vTIGG5byEOVxTCfQ74yM_8D110_kOFEDfW_FzomB19I93K7n-vnXZdsyqhNXpqTVQ',
    // URL del Web App de Apps Script para ESCRIBIR (ver apps-script/Code.gs)
    WEB_APP_URL: '',          // ← pega aquí la URL tras desplegar el script
    SUELDO_BASE: 2205.28,
    MAX_INSTALACIONES: 20,
    HOJA_CONTRATOS: 'Contratos',   // nombre de la pestaña en tu hoja
  };

  /* ── Tabla de comisiones (tarifa plana por tramo) ──────── */
  const TRAMOS = [
    { min: 1,  max: 3,  tarifa: 61.70  },
    { min: 4,  max: 5,  tarifa: 185.09 },
    { min: 6,  max: 9,  tarifa: 357.84 },
    { min: 10, max: 12, tarifa: 370.18 },
    { min: 13, max: 20, tarifa: 382.52 },
  ];

  function tramoDe(n) { return TRAMOS.find(t => n >= t.min && n <= t.max) || null; }

  /**
   * Cálculo puro de comisión.
   * @returns {null|{instalaciones,tarifa,tramoLabel,comisionTotal,sueldoBase,sueldoTotal}}
   */
  function calcular(n) {
    n = Number(n);
    if (!Number.isInteger(n) || n < 1 || n > CONFIG.MAX_INSTALACIONES) return null;
    const t = tramoDe(n);
    if (!t) return null;
    const comisionTotal = +(t.tarifa * n).toFixed(2);
    return {
      instalaciones: n,
      tarifa: t.tarifa,
      tramoLabel: t.min === t.max ? `${t.min}` : `${t.min} – ${t.max}`,
      comisionTotal,
      sueldoBase: CONFIG.SUELDO_BASE,
      sueldoTotal: +(CONFIG.SUELDO_BASE + comisionTotal).toFixed(2),
    };
  }

  /* ── Semanas (lunes a domingo) ─────────────────────────── */
  function aFecha(v) {
    if (v instanceof Date) return new Date(v.getTime());
    const s = String(v).trim();
    // Acepta ISO (2026-05-26), dd/mm/yyyy (26/05/2026) y dd/mm/yy
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (m) {
      let y = +m[3]; if (y < 100) y += 2000;
      return new Date(y, +m[2] - 1, +m[1]);
    }
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  const iso = d => {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  /** Devuelve el lunes 00:00 de la semana de una fecha. */
  function inicioSemana(fecha) {
    const d = aFecha(fecha) || new Date();
    const dow = (d.getDay() + 6) % 7;         // lunes = 0
    d.setDate(d.getDate() - dow);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** Clave + etiqueta de la semana que contiene `fecha`. */
  function semana(fecha) {
    const ini = inicioSemana(fecha);
    const fin = new Date(ini); fin.setDate(fin.getDate() + 6);
    const num = numeroSemanaISO(ini);
    return {
      clave: iso(ini),
      inicio: iso(ini),
      fin: iso(fin),
      numero: num,
      etiqueta: `Semana ${num} · ${formatear(ini)} – ${formatear(fin)}`,
    };
  }

  function numeroSemanaISO(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dia = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dia);
    const inicioAnio = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - inicioAnio) / 86400000 + 1) / 7);
  }

  const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  function formatear(d) { return `${d.getDate()} ${MESES[d.getMonth()]}`; }

  /** Lista las últimas N semanas (de la más reciente a la más antigua). */
  function semanasRecientes(n = 12) {
    const out = [];
    const base = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(base); d.setDate(d.getDate() - i * 7);
      out.push(semana(d));
    }
    return out;
  }

  /**
   * Agrupa registros por semana.
   * @param {Array} registros  cada uno con fecha/creado y (opcional) tipo
   * @returns {Array<{semana, contratos, registros, calculo}>}
   */
  function agruparPorSemana(registros, { soloInstalaciones = true } = {}) {
    const TIPOS_INSTALACION = ['LIQ_FIBRA', 'LIQ_COBRE'];
    const mapa = new Map();

    for (const r of registros) {
      if (soloInstalaciones && !TIPOS_INSTALACION.includes(r.formatoId)) continue;
      const f = r.fecha || (r.creado || '').slice(0, 10);
      const s = semana(f);
      if (!mapa.has(s.clave)) mapa.set(s.clave, { semana: s, registros: [] });
      mapa.get(s.clave).registros.push(r);
    }

    return [...mapa.values()]
      .sort((a, b) => b.semana.clave.localeCompare(a.semana.clave))
      .map(g => ({
        ...g,
        contratos: g.registros.length,
        calculo: calcular(g.registros.length),
      }));
  }

  /* ============================================================
     HOJAS — Lectura (CSV publicado) y escritura (Apps Script)
     ============================================================ */
  const Hojas = (() => {

    /* ── Parser CSV robusto (maneja comillas y saltos) ───── */
    function parseCSV(texto) {
      const filas = [];
      let fila = [], campo = '', q = false;
      for (let i = 0; i < texto.length; i++) {
        const c = texto[i];
        if (q) {
          if (c === '"') {
            if (texto[i + 1] === '"') { campo += '"'; i++; }
            else q = false;
          } else campo += c;
        } else {
          if (c === '"') q = true;
          else if (c === ',') { fila.push(campo); campo = ''; }
          else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = ''; }
          else if (c !== '\r') campo += c;
        }
      }
      if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
      return filas;
    }

    /** Convierte matriz CSV en array de objetos usando la 1ª fila como cabecera. */
    function aObjetos(matriz) {
      if (!matriz.length) return [];
      const cab = matriz[0].map(h => String(h).trim());
      return matriz.slice(1)
        .filter(f => f.some(c => String(c).trim() !== ''))
        .map(f => {
          const o = {};
          cab.forEach((h, i) => { o[h] = (f[i] ?? '').trim(); });
          return o;
        });
    }

    /**
     * Lee una pestaña publicada de la hoja.
     * @param {string} nombreHoja  p.ej. "URUAPAN" o "Contratos"
     * @returns {Promise<Array<Object>>}
     */
    async function leer(nombreHoja) {
      const id = CONFIG.SHEET_PUB_ID;
      const url = `https://docs.google.com/spreadsheets/d/e/${id}/pub`
                + `?output=csv&sheet=${encodeURIComponent(nombreHoja)}`
                + `&cachebust=${Date.now()}`;

      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`No se pudo leer "${nombreHoja}" (HTTP ${res.status})`);
      const txt = await res.text();
      if (/<html/i.test(txt)) throw new Error(`La hoja "${nombreHoja}" no está publicada como CSV.`);
      return aObjetos(parseCSV(txt));
    }

    /** Lee varias pestañas en paralelo, tolerando fallos individuales. */
    async function leerVarias(nombres) {
      const out = {};
      await Promise.all(nombres.map(async n => {
        try { out[n] = await leer(n); }
        catch (e) { out[n] = { error: e.message }; }
      }));
      return out;
    }

    /** Lista los nombres de pestaña conocidos (los COPE locales + contratos). */
    function pestanasConocidas() {
      const locales = Almacen.copes().map(c => c.nombre);
      const set = new Set([CONFIG.HOJA_CONTRATOS, ...locales, 'URUAPAN', 'ZITACUARO']);
      return [...set];
    }

    /**
     * Escribe filas en la hoja vía Apps Script Web App.
     * Si no hay WEB_APP_URL configurada, encola en localStorage.
     * @param {{hoja:string, filas:Array<Object>}} payload
     */
    async function escribir({ hoja, filas }) {
      if (!CONFIG.WEB_APP_URL) {
        const cola = JSON.parse(localStorage.getItem('ct_uru_cola_hoja') || '[]');
        cola.push({ hoja, filas, ts: Date.now() });
        localStorage.setItem('ct_uru_cola_hoja', JSON.stringify(cola));
        return { ok: false, encolado: true, motivo: 'WEB_APP_URL no configurada' };
      }

      const res = await fetch(CONFIG.WEB_APP_URL, {
        method: 'POST',
        // text/plain evita el preflight CORS en Apps Script
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ accion: 'escribir', hoja, filas }),
      });
      return res.json();
    }

    /** Reintenta enviar la cola pendiente. */
    async function vaciarCola() {
      if (!CONFIG.WEB_APP_URL) return { ok: false, motivo: 'sin endpoint' };
      const cola = JSON.parse(localStorage.getItem('ct_uru_cola_hoja') || '[]');
      if (!cola.length) return { ok: true, enviados: 0 };

      const restantes = [];
      let enviados = 0;
      for (const item of cola) {
        try { await escribir(item); enviados++; }
        catch { restantes.push(item); }
      }
      localStorage.setItem('ct_uru_cola_hoja', JSON.stringify(restantes));
      return { ok: true, enviados, pendientes: restantes.length };
    }

    const colaPendiente = () =>
      JSON.parse(localStorage.getItem('ct_uru_cola_hoja') || '[]').length;

    return { leer, leerVarias, escribir, vaciarCola, colaPendiente,
             pestanasConocidas, parseCSV, aObjetos };
  })();

  /* ── Exportación ───────────────────────────────────────── */
  global.Comisiones = {
    CONFIG, TRAMOS, calcular, tramoDe,
    semana, semanasRecientes, agruparPorSemana,
    inicioSemana, aFecha, iso,
  };
  global.Hojas = Hojas;
})(window);