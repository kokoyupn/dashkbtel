/* ============================================================
   ALMACEN.JS — Persistencia local por COPE (pestañas)
   Expone: window.Almacen
   ============================================================ */
(function (global) {
  'use strict';

  const KEY = 'ct_uru_almacen_v1';
  const listeners = new Set();

  /* ── Estructura en disco ──────────────────────────────────
     {
       "URUAPAN": {
          creado: "2026-05-01T10:00:00Z",
          registros: [ {...}, {...} ]
       },
       "ZITACUARO": { ... }
     }
  ─────────────────────────────────────────────────────────── */

  function leerTodo() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch { return {}; }
  }

  function escribirTodo(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj));
    listeners.forEach(fn => fn(obj));
  }

  const uid = () =>
    'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ── API ───────────────────────────────────────────────── */

  /** Lista de COPEs existentes con metadatos. */
  function copes() {
    const todo = leerTodo();
    return Object.entries(todo).map(([nombre, t]) => ({
      nombre,
      total: t.registros.length,
      creado: t.creado,
      actualizado: t.actualizado || t.creado,
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  /** Garantiza que exista la pestaña del COPE (la crea si no). */
  function asegurarCope(cope) {
    const nombre = String(cope || 'SIN COPE').trim().toUpperCase();
    const todo = leerTodo();
    if (!todo[nombre]) {
      todo[nombre] = {
        creado: new Date().toISOString(),
        registros: [],
      };
      escribirTodo(todo);
      return { creada: true, nombre };
    }
    return { creada: false, nombre };
  }

  /** Devuelve los registros de un COPE. */
  function porCope(cope) {
    const todo = leerTodo();
    return todo[String(cope).toUpperCase()]?.registros || [];
  }

  /** Devuelve TODOS los registros aplanados. */
  function todos() {
    const todo = leerTodo();
    const out = [];
    for (const [cope, t] of Object.entries(todo)) {
      for (const r of t.registros) out.push({ ...r, cope });
    }
    return out.sort((a, b) => (b.creado || '').localeCompare(a.creado || ''));
  }

  /**
   * Guarda un registro. Determina el COPE a partir del formato
   * y crea la pestaña si no existe.
   * @returns {{creada:boolean, nombre:string, registro:object}}
   */
  function guardar({ formatoId, formatoNombre, datos, texto }) {
    const cope = Formatos.copeDe(formatoId, datos) || 'SIN COPE';
    const { creada, nombre } = asegurarCope(cope);

    const idx = Formatos.indexar(formatoId, datos);
    const registro = {
      id: uid(),
      formatoId,
      formatoNombre,
      creado: new Date().toISOString(),
      datos,
      texto,
      ...idx,                    // os, serie, titular, telefono, fecha, distrito, terminal, coordsDom, coordsTer
    };

    const todo = leerTodo();
    todo[nombre].registros.unshift(registro);
    todo[nombre].actualizado = new Date().toISOString();
    escribirTodo(todo);

    return { creada, nombre, registro };
  }

  /** Elimina un registro por id. */
  function eliminar(cope, id) {
    const nombre = String(cope).toUpperCase();
    const todo = leerTodo();
    if (!todo[nombre]) return false;
    const antes = todo[nombre].registros.length;
    todo[nombre].registros = todo[nombre].registros.filter(r => r.id !== id);
    escribirTodo(todo);
    return todo[nombre].registros.length < antes;
  }

  /** Elimina una pestaña completa de COPE. */
  function borrarCope(cope) {
    const todo = leerTodo();
    delete todo[String(cope).toUpperCase()];
    escribirTodo(todo);
  }

  /**
   * Búsqueda multicriterio.
   * @param {{texto?:string, serie?:string, os?:string,
   *          desde?:string, hasta?:string, cope?:string,
   *          formatoId?:string}} q
   */
  function buscar(q = {}) {
    const norm = s => String(s || '').toLowerCase().trim();
    const t = norm(q.texto);

    return todos().filter(r => {
      if (q.cope && r.cope !== q.cope.toUpperCase()) return false;
      if (q.formatoId && r.formatoId !== q.formatoId) return false;

      if (q.serie && !norm(r.serie).includes(norm(q.serie))) return false;
      if (q.os    && !norm(r.os).includes(norm(q.os)))       return false;

      if (q.desde && (r.fecha || r.creado.slice(0, 10)) < q.desde) return false;
      if (q.hasta && (r.fecha || r.creado.slice(0, 10)) > q.hasta) return false;

      if (t) {
        const blob = [
          r.os, r.serie, r.titular, r.telefono, r.distrito,
          r.terminal, r.cope, r.formatoNombre,
        ].map(norm).join(' ');
        if (!blob.includes(t)) return false;
      }
      return true;
    });
  }

  /** Seriales únicos (para autocompletado). */
  function seriales() {
    const set = new Set();
    todos().forEach(r => r.serie && set.add(r.serie));
    return [...set].sort();
  }

  function exportar() {
    return JSON.stringify(leerTodo(), null, 2);
  }

  function importar(json) {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    const actual = leerTodo();
    for (const [cope, t] of Object.entries(obj)) {
      if (!actual[cope]) actual[cope] = t;
      else {
        const ids = new Set(actual[cope].registros.map(r => r.id));
        actual[cope].registros.push(...t.registros.filter(r => !ids.has(r.id)));
      }
    }
    escribirTodo(actual);
  }

  function suscribir(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  global.Almacen = {
    copes, asegurarCope, porCope, todos, guardar, eliminar, borrarCope,
    buscar, seriales, exportar, importar, suscribir,
    _leerTodo: leerTodo,
  };
})(window);