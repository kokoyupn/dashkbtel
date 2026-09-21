/**
 * Apps Script · Puente de escritura para CT URU
 * 1. Abre tu hoja → Extensiones → Apps Script
 * 2. Pega este código
 * 3. Implementar → Nueva implementación → Aplicación web
 *      · Ejecutar como: Yo
 *      · Quién tiene acceso: Cualquier persona
 * 4. Copia la URL /exec en CONFIG.WEB_APP_URL de lib/comisiones.js
 */

const HOJA_DEFECTO = 'Contratos';

function doPost(e) {
  const out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  try {
    const body = JSON.parse(e.postData.contents);
    const accion = body.accion || 'escribir';

    if (accion === 'escribir') {
      const res = escribir(body.hoja || HOJA_DEFECTO, body.filas || []);
      return out.setContent(JSON.stringify({ ok: true, ...res }));
    }
    if (accion === 'crearHoja') {
      const nombre = String(body.hoja).trim().toUpperCase();
      obtenerOCrearHoja(nombre);
      return out.setContent(JSON.stringify({ ok: true, hoja: nombre }));
    }
    return out.setContent(JSON.stringify({ ok: false, error: 'Acción desconocida' }));
  } catch (err) {
    return out.setContent(JSON.stringify({ ok: false, error: err.message }));
  }
}

function doGet(e) {
  const accion = (e.parameter.accion || 'ping');
  const out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);

  if (accion === 'ping') {
    return out.setContent(JSON.stringify({ ok: true, ts: new Date() }));
  }
  if (accion === 'leer') {
    const hoja = e.parameter.hoja || HOJA_DEFECTO;
    const sh = SpreadsheetApp.getActive().getSheetByName(hoja);
    if (!sh) return out.setContent(JSON.stringify({ ok: false, error: 'Hoja no existe' }));
    return out.setContent(JSON.stringify({ ok: true, filas: leerHoja(sh) }));
  }
  if (accion === 'pestanas') {
    return out.setContent(JSON.stringify({
      ok: true,
      pestanas: SpreadsheetApp.getActive().getSheets().map(s => s.getName()),
    }));
  }
  return out.setContent(JSON.stringify({ ok: false, error: 'Acción desconocida' }));
}

/* ── Helpers ─────────────────────────────────────────────── */

function obtenerOCrearHoja(nombre) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.appendRow(['Fecha','COPE','OS','Serie','Titular','Teléfono',
                  'Distrito','Terminal','CoordsDomicilio','CoordsTerminal','Formato']);
    sh.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#ff9933');
    sh.setFrozenRows(1);
  }
  return sh;
}

function escribir(nombreHoja, filas) {
  if (!filas.length) return { insertadas: 0 };
  const sh = obtenerOCrearHoja(String(nombreHoja).trim().toUpperCase());

  // Evita duplicados por (OS + Serie)
  const existentes = leerHoja(sh);
  const claves = new Set(existentes.map(r => `${r.OS}|${r.Serie}`));

  const nuevas = filas
    .map(f => ([
      f.fecha || new Date().toISOString().slice(0, 10),
      f.cope || '', f.os || '', f.serie || '', f.titular || '',
      f.telefono || '', f.distrito || '', f.terminal || '',
      f.coordsDom || '', f.coordsTer || '', f.formatoNombre || '',
    ]))
    .filter(r => !claves.has(`${r[2]}|${r[3]}`));

  if (nuevas.length) {
    sh.getRange(sh.getLastRow() + 1, 1, nuevas.length, 11).setValues(nuevas);
  }
  return { insertadas: nuevas.length, duplicadas: filas.length - nuevas.length };
}

function leerHoja(sh) {
  const ult = sh.getLastRow();
  if (ult < 2) return [];
  const vals = sh.getRange(2, 1, ult - 1, 11).getValues();
  const cab = sh.getRange(1, 1, 1, 11).getValues()[0];
  return vals
    .filter(r => r.some(c => c !== ''))
    .map(r => { const o = {}; cab.forEach((h, i) => { o[h] = r[i]; }); return o; });
}