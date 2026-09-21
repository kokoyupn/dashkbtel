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
const COLUMNAS = [
  'ID','Fecha','Semana','Año','TipoMovimiento','Cope','Área','Distrito',
  'O.S.','TipoServicio','Titular','Teléfono','TeléfonoContacto','Domicilio',
  'CoordenadasDomicilio','CoordenadasTerminal','Terminal','Puerto','Secundario',
  'Principal','PosiciónDG','RemateSalida','RemateEntrada','LocalizaciónCentral',
  'TipoBajante','MetrosConstruidos','Tecnología','SerieONT','Alfanumérico',
  'Módem','DIT','RosetaMarfil','ClaroVideo','FolioCV','Fusión','Coship',
  'TipoLiquidación','Técnico','ExpPersonal','Estado','Motivo','FuenteFormato',
  'Creado','Actualizado'
];

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
    sh.appendRow(COLUMNAS);
    sh.getRange(1, 1, 1, COLUMNAS.length)
      .setFontWeight('bold')
      .setBackground('#ff9933')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    sh.setFrozenRows(1);
    sh.setColumnWidths(1, COLUMNAS.length, 120);
  }
  return sh;
}


function escribir(nombreHoja, filas) {
  if (!filas.length) return { insertadas: 0 };
  const sh = obtenerOCrearHoja(String(nombreHoja).trim().toUpperCase());

  // Deduplicar por (O.S. + SerieONT + Fecha)
  const existentes = leerHoja(sh);
  const claves = new Set(existentes.map(r =>
    `${r['O.S.']}|${r['SerieONT']}|${r.Fecha}`));

  const nuevas = filas
    .map(f => {
      const fecha = f.fecha || new Date().toISOString().slice(0, 10);
      const semana = numeroSemanaISO(new Date(fecha));
      return [
        f.id || Utilities.getUuid(),
        fecha,
        semana.numero,
        semana.anio,
        (f.tipoMovimiento || 'ALTA').toUpperCase(),
        f.cope || '',
        f.area || '',
        f.distrito || '',
        f.os || '',
        f.tipoServicio || '',
        f.titular || '',
        f.telefono || '',
        f.telefonoContacto || '',
        f.domicilio || '',
        f.coordsDom || '',
        f.coordsTer || '',
        f.terminal || '',
        f.puerto || '',
        f.secundario || '',
        f.principal || '',
        f.posDG || '',
        f.remSalida || '',
        f.remEntrada || '',
        f.locCentral || '',
        f.bajante || '',
        f.metros || 0,
        (f.tecnologia || 'FIBRA').toUpperCase(),
        f.serieONT || f.serie || '',
        f.alfanum || '',
        f.modem ? 'SI' : 'NO',
        f.dit ? 'SI' : 'NO',
        f.roseta ? 'SI' : 'NO',
        f.claroVideo || 'N/A',
        f.folioCV || '',
        f.fusion || 'N/A',
        f.coship || 'N/A',
        (f.tipoLiq || 'TAC').toUpperCase(),
        f.tecnico || '',
        f.exp || '',
        f.estado || 'ACTIVO',
        f.motivo || '',
        f.fuenteFormato || f.formatoId || '',
        new Date().toISOString(),
        ''
      ];
    })
    .filter(r => !claves.has(`${r[8]}|${r[27]}|${r[1]}`));

  if (nuevas.length) {
    sh.getRange(sh.getLastRow() + 1, 1, nuevas.length, COLUMNAS.length)
      .setValues(nuevas);
  }
  return { insertadas: nuevas.length, duplicadas: filas.length - nuevas.length };
}

function leerHoja(sh) {
  const ult = sh.getLastRow();
  if (ult < 2) return [];
  const cab = sh.getRange(1, 1, 1, COLUMNAS.length).getValues()[0];
  const vals = sh.getRange(2, 1, ult - 1, COLUMNAS.length).getValues();
  return vals
    .filter(r => r.some(c => c !== ''))
    .map(r => { const o = {}; cab.forEach((h, i) => { o[h] = r[i]; }); return o; });
}

function numeroSemanaISO(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dia);
  const inicio = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return {
    numero: Math.ceil(((t - inicio) / 86400000 + 1) / 7),
    anio: t.getUTCFullYear()
  };
}
