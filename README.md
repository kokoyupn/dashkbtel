# dashkbtel
control interno de equipos

# 📘 README · CT URU — Centro de Formatos, Comisiones y Almacén

> **Proyecto:** Dashboard unificado para captura de formatos operativos, cálculo de comisiones semanales, búsqueda histórica y geolocalización de contratos.
> **Stack:** HTML + CSS + JavaScript vanilla (sin build step). Lectura/Escritura de Google Sheets vía CSV publicado + Apps Script.
> **Autor:** Equipo CT URU · Morelia
> **Versión:** 1.0.0

---

## 📑 Tabla de contenidos

1. [Descripción general](#-descripción-general)
2. [Estructura del proyecto](#-estructura-del-proyecto)
3. [Instalación y configuración](#-instalación-y-configuración)
4. [Arquitectura y flujo de datos](#-arquitectura-y-flujo-de-datos)
5. [Referencia de módulos](#-referencia-de-módulos)
   - [`lib/formatos.js`](#1-libformatosjs--definición-de-formatos)
   - [`lib/almacen.js`](#2-libalmacenjs--almacenamiento-por-cope)
   - [`lib/comisiones.js`](#3-libcomisionesjs--cálculo-y-google-sheets)
   - [`lib/mapa.js`](#4-libmapajs--mapa-leaflet)
6. [Referencia de páginas](#-referencia-de-páginas)
   - [`index.html`](#1-indexhtml--dashboard-principal)
   - [`comisiones.html`](#2-comisioneshtml--calculadora-de-comisiones)
7. [Backend Apps Script](#-backend-apps-script)
8. [Modelo de datos](#-modelo-de-datos)
9. [Comentarios sobre decisiones de programación](#-comentarios-sobre-decisiones-de-programación)
10. [Despliegue y uso](#-despliegue-y-uso)
11. [Roadmap](#-roadmap)
12. [Solución de problemas](#-solución-de-problemas)

---

## 🎯 Descripción general

Este proyecto resuelve tres necesidades operativas del equipo técnico instalador:

| Necesidad | Solución |
|---|---|
| **Capturar 7 formatos distintos** de campo sin errores de estructura | Formularios dinámicos generados desde una librería única (`Formatos`) |
| **Calcular comisiones semanales** con tabla de tramos retroactiva | Librería pura `Comisiones` + lectura de Google Sheets |
| **Consultar históricos** por serial / OS / fecha y ver ubicaciones | Almacén local por COPE + módulo de búsqueda + mapa Leaflet |

**Puntos clave de diseño:**

- ✅ **Cero dependencias de build** — todo funciona abriendo `index.html`.
- ✅ **Separación estricta** entre datos (`Formatos`), persistencia (`Almacen`), lógica de negocio (`Comisiones`) y vistas.
- ✅ **Resiliencia offline** — el almacén es local; los envíos a la hoja se encolan si falla la red.
- ✅ **Extensible** — agregar un nuevo formato requiere solo añadir un objeto a `Formatos.TODOS`.

---

## 📁 Estructura del proyecto

```
ct-uru/
│
├── index.html                 ← Dashboard: captura, registros, búsqueda, mapa
├── comisiones.html            ← Calculadora semanal + sincronización con la hoja
│
├── assets/
│   └── estilos.css            ← Hoja de estilos compartida (tema, layout, responsive)
│
├── lib/
│   ├── formatos.js            ← Definición declarativa de los 7 formatos
│   ├── almacen.js             ← Persistencia local por COPE (pestañas)
│   ├── comisiones.js          ← Cálculo semanal + lectura/escritura de Sheets
│   └── mapa.js                ← Wrapper de Leaflet (domicilio ↔ terminal)
│
└── apps-script/
    └── Code.gs                ← Backend Google Apps Script (Web App)
```

### Regla de dependencias

```
   ┌──────────────┐
   │ formatos.js  │  ← No depende de nadie
   └──────┬───────┘
          │
   ┌──────▼───────┐
   │ almacen.js   │  ← Depende de Formatos
   └──────┬───────┘
          │
   ┌──────▼───────┐
   │ comisiones.js│  ← Depende de Almacen
   └──────┬───────┘
          │
   ┌──────▼───────┐
   │  mapa.js     │  ← Depende solo de Leaflet
   └──────────────┘

   index.html  →  Formatos + Almacen + Comisiones + MapaCT
   comisiones.html →  Formatos + Almacen + Comisiones
```

> ⚠️ **El orden de carga importa.** Cargar siempre en el HTML en el orden: `formatos → almacen → comisiones → mapa`.

---

## ⚙️ Instalación y configuración

### Paso 1 · Clonar / descargar

```bash
git clone https://github.com/TU_USUARIO/ct-uru.git
cd ct-uru
```

### Paso 2 · Configurar el enlace de WhatsApp

En `index.html`, busca la línea:

```javascript
const WHATSAPP_GRP = 'https://chat.whatsapp.com/TU_CODIGO_DE_INVITACION';
```

Sustituye por el enlace real del grupo **Altas y Migras CT URU**.

### Paso 3 · Configurar Google Sheets

**a) Publicar la hoja (solo lectura):**
1. Abre tu hoja → `Archivo` → `Compartir` → `Publicar en la web`
2. Selecciona la pestaña o "Todo el documento" → formato **CSV**
3. Copia el **ID publicado** (el fragmento `2PACX-...`)

**b) Pegar el ID en `lib/comisiones.js`:**

```javascript
const CONFIG = {
  SHEET_PUB_ID: '2PACX-1vTIGG5byEOVxTCfQ74yM_8D110_kOFEDfW_FzomB19I93K7n-vnXZdsyqhNXpqTVQ',
  WEB_APP_URL:  '',  // ← Se llena en el paso 4
  ...
};
```

### Paso 4 · Desplegar el Apps Script (para escribir)

1. Abre tu hoja → `Extensiones` → `Apps Script`
2. Pega el contenido de `apps-script/Code.gs`
3. `Implementar` → `Nueva implementación` → tipo **Aplicación web**
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier persona
4. Copia la URL terminada en `/exec`
5. Pégala en `lib/comisiones.js` → `WEB_APP_URL`

### Paso 5 · Abrir el proyecto

- **En local:** doble clic en `index.html` (funciona sin servidor).
- **En servidor:** cualquier hosting estático (GitHub Pages, Netlify, Cloudflare Pages).

---

## 🏗️ Arquitectura y flujo de datos

### Flujo de captura → WhatsApp → Almacén

```
┌──────────────────────────────────────────────────────────────┐
│  USUARIO                                                     │
│  ├─ Selecciona formato (chip)                                │
│  ├─ Llena campos del formulario generado dinámicamente       │
│  └─ Ve preview en tiempo real mientras escribe               │
└──────────────────────┬───────────────────────────────────────┘
                       │ click "Compartir por WhatsApp"
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  APP (index.html)                                            │
│  1. validar()        → chequea campos requeridos             │
│  2. Almacen.guardar() → determina COPE + crea pestaña si no  │
│  3. copiar(texto)    → navigator.clipboard o execCommand     │
│  4. window.open()    → abre grupo de WhatsApp                │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  localStorage["ct_uru_almacen_v1"]                           │
│  {                                                           │
│    "URUAPAN":  { creado, registros: [...] },                 │
│    "ZITACUARO":{ creado, registros: [...] }                  │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

### Flujo de comisiones

```
┌─────────────────────┐      ┌─────────────────────────┐
│ comisiones.html     │      │ Google Sheets (público) │
│                     │◄─────│ CSV por pestaña         │
│ Hojas.leerVarias()  │      └─────────────────────────┘
│  ├─ Contratos       │
│  ├─ URUAPAN         │      ┌─────────────────────────┐
│  ├─ ZITACUARO       │◄─────│ localStorage            │
│  └─ ...             │      │ (registros locales)     │
└──────────┬──────────┘      └─────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│ Comisiones.agruparPorSemana()          │
│  ├─ Semana ISO (lunes–domingo)         │
│  ├─ Cuenta contratos por semana        │
│  └─ Comisiones.calcular(n) → tarifa    │
└──────────┬─────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│ Render: KPIs + Tabla semanal + Detalle │
└────────────────────────────────────────┘
```

### Escritura diferida (cola offline)

```
Hojas.escribir(payload)
    │
    ├─ WEB_APP_URL vacía → encola en localStorage
    │                      ["ct_uru_cola_hoja"]
    │
    └─ WEB_APP_URL configurada
        │
        ├─ fetch POST → Apps Script → Sheet.appendRow()
        │
        └─ Si falla → encola para reintento
```

---

## 📚 Referencia de módulos

### 1. `lib/formatos.js` · Definición de formatos

**Expone:** `window.Formatos`

#### Objetivo
Ser la **fuente única de verdad** de los 7 formatos de campo. Cada formato declara:

- **`campos[]`** — metadatos para construir el formulario
- **`construir(datos)`** — función que devuelve el texto final exacto (respetando todos los renglones)

#### Estructura de un campo

```javascript
{
  k: 'nombreClave',           // clave en el objeto datos
  label: 'Etiqueta visible',
  tipo: 'text|tel|number|date|time|textarea|select|check|coords',
  req: true|false,            // requerido
  def: 'valor por defecto',   // puede ser función
  opciones: ['A','B'],        // solo para select
  rol: 'os|serie|titular|...' // índice para el almacén (opcional)
  esCope: true                // marca el campo que define la pestaña
}
```

#### Roles indexables

Los campos con `rol` se copian al nivel superior del registro en el almacén. Esto permite búsquedas rápidas:

| Rol | Uso |
|---|---|
| `os` | Órdenes de servicio |
| `serie` | Números de serie / alfanuméricos |
| `titular` | Nombre del cliente |
| `telefono` | Teléfono |
| `fecha` | Fecha del formato |
| `distrito` | Distrito Telmex |
| `terminal` | Identificador de terminal |
| `coordsDom` | Coordenadas del domicilio |
| `coordsTer` | Coordenadas de la terminal |
| `cope` | COPE (determina la pestaña) |

#### API

```javascript
Formatos.lista()                    // → [formato1, formato2, ...]
Formatos.obtener('LIQ_FIBRA')       // → formato
Formatos.indexar(formatoId, datos)  // → { os, serie, titular, ... }
Formatos.copeDe(formatoId, datos)   // → 'URUAPAN' (normalizado)
Formatos.TODOS                      // → objeto indexado por id
```

#### Formatos disponibles

| ID | Nombre | Icono |
|---|---|---|
| `QUEJA_GARANTIA` | Queja Garantía | 🛠️ |
| `LIQ_FIBRA` | Liquidación Fibra | 🔵 |
| `LIQ_COBRE` | Liquidación Cobre | 🟠 |
| `RETENCION` | Incidencia Cambios de Retención | 🔁 |
| `OBJECION` | Cuadro de Objeción | 🚫 |
| `RETIRAR_FOLIO` | Retirar Folio | 📤 |
| `SUSPENDER_FOLIO` | Solicitud para Suspender Folio | ⏸️ |

#### Cómo agregar un formato nuevo

```javascript
FORMATOS.MI_FORMATO = {
  id: 'MI_FORMATO',
  nombre: 'Nombre visible',
  icono: '✨',
  campos: [
    { k:'fecha', label:'Fecha', tipo:'date', req:true, def:hoyISO, rol:'fecha' },
    { k:'cope',  label:'COPE',  tipo:'text', req:true, esCope:true },
    // ... resto de campos
  ],
  construir(d) {
    return [
      'TÍTULO DEL FORMATO', '',
      `Fecha: ${d.fecha}`,
      `Cope: ${d.cope}`,
      // ... respetando TODOS los renglones
    ].join('\n');
  }
};
```

> 🔎 **Nota:** `construir()` usa `Array.join('\n')` para garantizar saltos de línea limpios. No uses template strings multilínea porque el auto-indent del editor puede colar espacios invisibles.

---

### 2. `lib/almacen.js` · Almacenamiento por COPE

**Expone:** `window.Almacen`

#### Objetivo
Persistir registros en `localStorage` **agrupados por COPE**. Si un COPE no existe, se **crea la pestaña automáticamente**.

#### Estructura en disco

```javascript
localStorage["ct_uru_almacen_v1"] = {
  "URUAPAN": {
    creado: "2026-05-01T10:00:00Z",
    actualizado: "2026-05-15T18:30:00Z",
    registros: [
      {
        id: "r_lz3k9a_xy7",
        formatoId: "LIQ_FIBRA",
        formatoNombre: "Liquidación Fibra",
        creado: "2026-05-15T18:30:00Z",
        datos: { /* campos originales */ },
        texto: "*PLANTILLA...*",   // texto exacto copiado
        os: "071349704",            // ← roles indexados
        serie: "ZTEG26066C70",
        titular: "SELENE ESQUIVEL ADAME",
        telefono: "4525197706",
        fecha: "2026-05-26",
        distrito: "LNF0002FO",
        terminal: "B7",
        coordsDom: "19.390925, -102.046743",
        coordsTer: "19.390887,-102.046914"
      }
    ]
  },
  "ZITACUARO": { creado, registros: [...] }
}
```

#### API

| Método | Descripción |
|---|---|
| `copes()` | Lista de pestañas con metadatos (`nombre`, `total`, `creado`, `actualizado`) |
| `asegurarCope(cope)` | Crea la pestaña si no existe. Devuelve `{creada, nombre}` |
| `porCope(cope)` | Registros de una pestaña |
| `todos()` | Todos los registros aplanados (con campo `cope` añadido) |
| `guardar({formatoId, formatoNombre, datos, texto})` | Persiste un registro. Determina el COPE, crea pestaña, indexa roles |
| `eliminar(cope, id)` | Borra un registro por ID |
| `borrarCope(cope)` | Borra la pestaña completa |
| `buscar({texto, serie, os, desde, hasta, cope, formatoId})` | Búsqueda multicriterio |
| `seriales()` | Lista de seriales únicos (para autocompletar) |
| `exportar()` | Devuelve JSON del almacén completo |
| `importar(json)` | Fusiona un JSON sin duplicar IDs |
| `suscribir(fn)` | Notifica cambios en el almacén |

#### Detalles de implementación

- **IDs únicos:** `'r_' + Date.now().toString(36) + random(5)` — suficiente unicidad para uso monousuario por dispositivo.
- **`unshift` en lugar de `push`:** los registros nuevos van al principio, así el listado se ve en orden cronológico inverso sin ordenar.
- **Cascada de listeners:** cualquier escritura dispara `escribirTodo()` que notifica a los suscriptores. Se usa para refrescar vistas reactivamente si se necesita.

---

### 3. `lib/comisiones.js` · Cálculo y Google Sheets

**Expone:** `window.Comisiones` y `window.Hojas`

#### Objetivo
Dos responsabilidades claramente separadas:

1. **`Comisiones`** — lógica pura: cálculo de tramos + agrupación semanal.
2. **`Hojas`** — I/O con Google Sheets (lectura CSV + escritura Apps Script).

#### Tabla de tramos

```javascript
const TRAMOS = [
  { min: 1,  max: 3,  tarifa: 61.70  },
  { min: 4,  max: 5,  tarifa: 185.09 },
  { min: 6,  max: 9,  tarifa: 357.84 },
  { min: 10, max: 12, tarifa: 370.18 },
  { min: 13, max: 20, tarifa: 382.52 },
];
```

> 💡 **Modelo de tarifa plana retroactiva:** si haces 7 instalaciones, TODAS se pagan a $357.84 (no hay mezcla de tarifas).

#### Cálculo

```javascript
Comisiones.calcular(7)
// → {
//     instalaciones: 7,
//     tarifa: 357.84,
//     tramoLabel: "6 – 9",
//     comisionTotal: 2504.88,  // 357.84 × 7
//     sueldoBase: 2205.28,
//     sueldoTotal: 4710.16
//   }
```

#### Semanas ISO (lunes–domingo)

```javascript
Comisiones.semana('2026-05-14')
// → {
//     clave: "2026-05-11",
//     inicio: "2026-05-11",
//     fin: "2026-05-17",
//     numero: 20,
//     etiqueta: "Semana 20 · 11 may – 17 may"
//   }
```

- `clave` es **siempre el lunes** en formato ISO.
- `numero` es el número de semana ISO 8601 (semana 1 = primera con jueves).
- El cálculo de día de la semana usa `(d.getDay() + 6) % 7` para que **lunes = 0** (JS por defecto tiene domingo = 0).

#### Agrupación semanal

```javascript
Comisiones.agruparPorSemana(registros, { soloInstalaciones: true })
// → [
//     { semana, registros, contratos, calculo },
//     ...
//   ]
```

- `soloInstalaciones: true` (por defecto) cuenta **solo `LIQ_FIBRA` y `LIQ_COBRE`** como contratos válidos para comisión.
- Los formatos de incidencia/retención/objeción se ignoran para el cálculo de comisiones.

#### Parser CSV

Implementación **manual** (sin dependencias) que respeta:
- Comillas dobles (`"campo, con coma"`)
- Comillas escapadas (`""` → `"`)
- Saltos de línea dentro de campos
- Fin de línea `\n` y `\r\n`

```javascript
Hojas.parseCSV('a,b\n"c,d",e')
// → [['a','b'], ['c,d','e']]

Hojas.aObjetos([['nom','edad'], ['Ana','30']])
// → [{ nom: 'Ana', edad: '30' }]
```

#### Lectura de hojas

```javascript
await Hojas.leer('URUAPAN');
// GET https://docs.google.com/spreadsheets/d/e/{ID}/pub
//     ?output=csv&sheet=URUAPAN&cachebust={ts}
// → [{ Fecha: '2026-05-01', OS: '071...', ... }]
```

- Se añade `cachebust` para forzar datos frescos.
- Si la respuesta contiene `<html>`, significa que la pestaña **no está publicada como CSV** (devuelve error claro).

```javascript
await Hojas.leerVarias(['Contratos', 'URUAPAN', 'ZITACUARO']);
// → { 'Contratos': [...], 'URUAPAN': [...], 'ZITACUARO': { error: '...' } }
```

- Cada pestaña falla independientemente; las que sí se leen se conservan.

#### Escritura de hojas

```javascript
await Hojas.escribir({
  hoja: 'URUAPAN',
  filas: [{ fecha, cope, os, serie, titular, telefono, distrito, terminal, coordsDom, coordsTer, formatoNombre }]
});
```

- Si `WEB_APP_URL` está vacía → **encola** en `localStorage["ct_uru_cola_hoja"]`.
- Si está configurada → `fetch POST` con `Content-Type: text/plain` (evita el preflight CORS de Apps Script).
- `Hojas.vaciarCola()` reintenta enviar todos los pendientes.
- `Hojas.colaPendiente()` devuelve el número de lotes sin enviar.

---

### 4. `lib/mapa.js` · Mapa Leaflet

**Expone:** `window.MapaCT`

#### Objetivo
Dibujar **domicilio + terminal + línea de distancia** a partir de coordenadas.

#### Parser de coordenadas

Acepta múltiples formatos:

```javascript
MapaCT.parseCoords('19.390925, -102.046743')     // → [19.390925, -102.046743]
MapaCT.parseCoords('19.390925 -102.046743')      // → [19.390925, -102.046743]
MapaCT.parseCoords('19.390925,-102.046743')      // → [19.390925, -102.046743]
MapaCT.parseCoords([19.390925, -102.046743])     // → [19.390925, -102.046743]
MapaCT.parseCoords('')                           // → null
MapaCT.parseCoords('999, 999')                   // → null (fuera de rango)
```

#### API

```javascript
const mapa = MapaCT.crear('mapa');   // inicializa el contenedor

MapaCT.mostrar(mapa, {
  domicilio: '19.390925, -102.046743',
  terminal: '19.390887, -102.046914',
  nombreTerminal: 'LPN7004FOC7',
  titulo: 'SELENE ESQUIVEL ADAME'
});
// → { ok: true, puntos: [[...], [...]], distancia: 32.5 }
```

- Auto-zoom: `fitBounds` con padding del 30 % si hay 2 puntos.
- Si solo hay 1 punto → zoom 17 centrado en él.
- Popup intermedio con distancia en metros.

```javascript
MapaCT.mostrarVarias(mapa, [
  { coords: '19.39,-102.04', titulo: 'Cliente A', tipo: 'domicilio' },
  { coords: '19.40,-102.05', titulo: 'Terminal B7', tipo: 'terminal' }
]);
```

#### Iconos

- 🏠 Domicilio: pin con borde naranja (`--brand`)
- 📡 Terminal: pin con borde azul (`--info`)

Definidos con `L.divIcon` + clases CSS (`.pin`, `.pin-dom`, `.pin-ter`).

---

## 🖼️ Referencia de páginas

### 1. `index.html` · Dashboard principal

#### Secciones (tabs)

| Tab | Descripción |
|---|---|
| **📝 Captura** | Selección de formato + formulario dinámico + preview + botones de acción |
| **🗂️ Registros** | Listado por COPE con chips de pestaña + acciones (ver, mapear, borrar) |
| **🔍 Buscar** | Búsqueda multicriterio (serial, OS, fecha, texto libre) |
| **🗺️ Mapa** | Leaflet con domicilio y terminal |
| **💰 Comisiones** | Enlace a `comisiones.html` |

#### Flujo de captura

```javascript
// 1. Construir chips de formatos
Formatos.lista().forEach(f => { /* chip */ });

// 2. Al hacer click en un chip
seleccionarFormato(f.id)
  → construirFormulario(f)
  → recoger()           // guarda valores en `datosActuales`
  → refrescarPreview()  // actualiza el <pre>

// 3. Al pulsar "Compartir"
validar() → Almacen.guardar(...) → copiar(texto) → window.open(WHATSAPP_GRP)
```

#### Validación

Solo verifica campos marcados con `req: true`. Los `check` se ignoran porque un checkbox sin marcar es un valor válido.

#### Vista previa en tiempo real

Cada `input`/`change` dispara `recoger()` y `refrescarPreview()`. Esto se logra con:

```javascript
el.addEventListener('input',  () => { recoger(); refrescarPreview(); });
el.addEventListener('change', () => { recoger(); refrescarPreview(); });
```

> 🔎 No se usa `debounce` porque `construir()` es trivial y el usuario espera feedback inmediato.

#### Portapapeles con fallback

```javascript
async function copiar(texto) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {}
  // Fallback: <textarea> oculto + execCommand('copy')
  // Necesario para file:// o HTTP sin HTTPS
}
```

---

### 2. `comisiones.html` · Calculadora de comisiones

#### Secciones

1. **KPIs** — contratos, semanas, comisiones, total a pagar
2. **Cálculo manual** — selector de instalaciones (1–20) para ver desglose
3. **Desglose por semana** — tabla con cada semana y su cálculo
4. **Detalle** — `<details>` colapsables con los contratos de cada semana

#### Fuentes de datos

```javascript
async function desdeHoja() {
  const pestanas = Hojas.pestanasConocidas();  // Contratos + COPEs locales
  const res = await Hojas.leerVarias(pestanas);
  // Normaliza filas de la hoja a formato común
}

function desdeLocal() {
  return Almacen.todos().filter(r =>
    r.formatoId === 'LIQ_FIBRA' || r.formatoId === 'LIQ_COBRE');
}
```

- **Init:** renderiza datos locales primero (feedback inmediato), luego intenta sincronizar con la hoja en background.
- **Botón "Sincronizar":** fuerza lectura desde la hoja.
- **Botón "Usar datos locales":** ignora la hoja.

#### Normalización de filas de la hoja

La función `normalizarFila()` aplica **tolerancia de nombres de columna**: acepta `OS`, `os`, `O.S.`, `Orden de Servicio`, etc. porque compara claves sin acentos, sin espacios y sin signos:

```javascript
normalizar('Número de Serie') === 'numerodeserie'
normalizar('numero_de_serie') === 'numerodeserie'
```

---

## 🔧 Backend Apps Script

### `apps-script/Code.gs`

**Puntos de entrada:**

| Método | Acción | Descripción |
|---|---|---|
| `doPost` | `escribir` | Añade filas a la pestaña indicada (crea la hoja si no existe) |
| `doPost` | `crearHoja` | Fuerza la creación de una pestaña |
| `doGet` | `ping` | Health check |
| `doGet` | `leer` | Lee una pestaña como JSON |
| `doGet` | `pestanas` | Lista todas las pestañas del spreadsheet |

### Deduplicación

`escribir()` compara **(OS + Serie)** contra las filas existentes para evitar duplicados:

```javascript
const claves = new Set(existentes.map(r => `${r.OS}|${r.Serie}`));
const nuevas = filas.filter(f => !claves.has(`${f.os}|${f.serie}`));
```

### Auto-creación de pestañas

```javascript
function obtenerOCrearHoja(nombre) {
  let sh = ss.getSheetByName(nombre);
  if (!sh) {
    sh = ss.insertSheet(nombre);
    sh.appendRow(['Fecha','COPE','OS','Serie','Titular','Teléfono',
                  'Distrito','Terminal','CoordsDomicilio','CoordsTerminal','Formato']);
    sh.getRange(1,1,1,11).setFontWeight('bold').setBackground('#ff9933');
    sh.setFrozenRows(1);
  }
  return sh;
}
```

### Protocolo POST

```javascript
// Cliente envía:
{
  "accion": "escribir",
  "hoja": "URUAPAN",
  "filas": [{ fecha, cope, os, serie, titular, ... }, ...]
}

// Servidor responde:
{ "ok": true, "insertadas": 3, "duplicadas": 1 }
```

Se usa `Content-Type: text/plain` en el `fetch` para evitar preflight CORS (Apps Script no responde a `OPTIONS` correctamente en todos los casos).

---

## 🗃️ Modelo de datos

### Registro en `localStorage`

```typescript
interface Registro {
  id: string;                    // "r_lz3k9a_xy7"
  formatoId: string;             // "LIQ_FIBRA"
  formatoNombre: string;         // "Liquidación Fibra"
  creado: string;                // ISO 8601
  datos: Record<string, any>;    // campos originales del formulario
  texto: string;                 // texto exacto que se copia a WhatsApp
  
  // ── Roles indexados (dinámicos según formato) ──
  os?: string;
  serie?: string;
  titular?: string;
  telefono?: string;
  fecha?: string;
  distrito?: string;
  terminal?: string;
  coordsDom?: string;
  coordsTer?: string;
  cope?: string;                 // añadido al aplanar
}
```

### Fila en Google Sheets

| Columna | Tipo | Ejemplo |
|---|---|---|
| Fecha | ISO date | `2026-05-26` |
| COPE | texto | `URUAPAN` |
| OS | texto | `071349704` |
| Serie | texto | `ZTEG26066C70` |
| Titular | texto | `SELENE ESQUIVEL ADAME` |
| Teléfono | texto | `4525197706` |
| Distrito | texto | `LNF0002FO` |
| Terminal | texto | `B7` |
| CoordsDomicilio | texto | `19.390925, -102.046743` |
| CoordsTerminal | texto | `19.390887,-102.046914` |
| Formato | texto | `Liquidación Fibra` |

---

## 🧠 Comentarios sobre decisiones de programación

### 1. ¿Por qué IIFEs `(function(){})()` en lugar de módulos ES?

- **Compatibilidad total** con `file://` (los módulos ES fallan sin servidor).
- **Cero configuración** — no hace falta build step ni `type="module"`.
- **Namespace global explícito:** `window.Formatos`, `window.Almacen`, etc. Fácil de depurar en DevTools.

### 2. ¿Por qué `Formatos.construir()` en vez de templates en el HTML?

- El **layout de cada formato está en un solo lugar** — si hay que cambiar un renglón, se toca una función, no 3 archivos.
- Los saltos de línea están explícitos con `array.join('\n')`. Esto evita bugs de indentación típicos de los template strings.
- Los formatos se pueden testear sin DOM.

### 3. ¿Por qué `localStorage` y no IndexedDB?

- **Simplicidad:** API síncrona, sin callbacks.
- **Capacidad suficiente:** ~5 MB soportan ~2 000 registros.
- **Migración fácil:** si crece, `Almacen.exportar()` devuelve JSON que se importa a IndexedDB.

### 4. ¿Por qué pestañas de COPE en vez de un array plano?

- **Refleja el modelo mental** del equipo: cada COPE tiene su propio "libro".
- **Facilita borrar por COPE** completo si hay que reiniciar.
- **Auto-creación:** `asegurarCope()` garantiza que nunca se pierde un registro por COPE inexistente.

### 5. ¿Por qué separar `Comisiones` (puro) y `Hojas` (I/O)?

- La lógica de cálculo es **testeable sin red**.
- Si mañana se migra de Sheets a Airtable, solo cambia `Hojas` sin tocar la calculadora.

### 6. ¿Por qué tarifa plana retroactiva?

- Es el **esquema real** de pago del cliente. Los tramos no son "acumulativos" (tipo IRPF), sino **todo-o-nada**.
- Esto se ve en `calcular()`: se busca el tramo donde cae `n` y se multiplica por `n`.

### 7. ¿Por qué `text/plain` en el POST a Apps Script?

- `application/json` dispara un **preflight CORS** (`OPTIONS`) que Apps Script no maneja bien.
- `text/plain` se considera "simple request" y se envía directo. El servidor hace `JSON.parse(e.postData.contents)` sin problema.

### 8. ¿Por qué `unshift` en el almacén?

- **UX:** el técnico quiere ver el último registro capturado primero.
- **Coste:** `unshift` es O(n), pero con 2 000 registros es imperceptible (< 1 ms).

### 9. ¿Por qué `ContentService` con JSON en Apps Script?

- Permite al cliente distinguir entre éxito (`{ok: true}`) y error (`{ok: false, error: '...'}`).
- Fácil de extender con nuevos campos sin romper el cliente.

### 10. ¿Por qué `Date.now().toString(36)` para IDs?

- **Compacto:** 8 caracteres vs 13 de un timestamp decimal.
- **Suficiente:** combinado con 5 caracteres aleatorios, la probabilidad de colisión en un dispositivo es ~0.

---

## 🌐 Despliegue y uso

### Opción A · GitHub Pages (recomendado)

```bash
git init && git add . && git commit -m "CT URU v1"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ct-uru.git
git push -u origin main
```

Luego en GitHub: `Settings` → `Pages` → `Source: main / (root)`.

**URL:** `https://TU_USUARIO.github.io/ct-uru/`

### Opción B · Netlify Drop

Arrastra la carpeta completa a [app.netlify.com/drop](https://app.netlify.com/drop). Listo.

### Opción C · Servidor local (para pruebas)

```bash
python3 -m http.server 8000
# Abrir http://localhost:8000
```

### Opción D · PWA (offline)

Añade `manifest.json` + `service-worker.js`:

```html
<link rel="manifest" href="manifest.json">
```

```javascript
// service-worker.js
const CACHE = 'ct-uru-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(['/', '/index.html', '/comisiones.html',
              '/assets/estilos.css', '/lib/formatos.js',
              '/lib/almacen.js', '/lib/comisiones.js', '/lib/mapa.js'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
```

### Acceso desde móvil

1. Abre la URL en Safari (iOS) o Chrome (Android)
2. Compartir → **Añadir a pantalla de inicio**
3. Se comporta como app nativa

---

## 🗺️ Roadmap

| Prioridad | Mejora | Estado |
|---|---|---|
| 🔴 Alta | PWA + Service Worker (offline real) | Pendiente |
| 🔴 Alta | Sincronización bidireccional con Apps Script | Parcial |
| 🟡 Media | Autenticación por PIN | Pendiente |
| 🟡 Media | Fotos adjuntas al registro | Pendiente |
| 🟡 Media | Firma digital del cliente (canvas) | Pendiente |
| 🟢 Baja | Geocodificación inversa (Nominatim) | Pendiente |
| 🟢 Baja | Exportar a PDF | Pendiente |
| 🟢 Baja | Notificaciones push | Pendiente |
| 🟢 Baja | Modo multi-técnico con sincronización | Pendiente |

---

## 🐛 Solución de problemas

### `La hoja "X" no está publicada como CSV`

- Verifica que en Google Sheets esté **publicada como CSV**, no como HTML.
- Comprueba que el nombre de la pestaña esté bien escrito (sensible a mayúsculas).

### `No se pudo copiar al portapapeles`

- En HTTP sin HTTPS, `navigator.clipboard` no funciona → el fallback con `execCommand` sí.
- En iOS, requiere que el usuario **haya pulsado un botón** (no se puede copiar en `load`).

### `WEB_APP_URL no configurada`

- Es solo un aviso: los registros se están **encolando** localmente.
- Configura la URL del Apps Script y pulsa **Subir pendientes** en `comisiones.html`.

### El mapa no carga

- Verifica que Leaflet esté cargado desde el CDN (`unpkg.com/leaflet`).
- Si estás offline, el mapa no funcionará (los tiles vienen de OpenStreetMap).

### Se duplican registros en la hoja

- `escribir()` deduplica por (OS + Serie). Si el mismo contrato tiene OS distintos, se insertará dos veces.
- Revisa que la hoja tenga la cabecera en la fila 1.

### Los acentos salen como `Ã¡`

- Ocurre si el CSV no está en UTF-8. Al exportar desde Google Sheets, escoge **CSV UTF-8**.

### `localStorage` lleno

- Exporta un respaldo (`Exportar JSON`) y limpia con `Almacen.borrarCope('NOMBRE')`.
- Considera migrar a IndexedDB si superas 4 MB.

---

## 📄 Licencia

Uso interno. Todos los derechos reservados al equipo CT URU.

---

## 🤝 Contribuir

1. Crea una rama: `git checkout -b feature/nueva-funcion`
2. Commits atómicos y descriptivos.
3. Respeta el estilo: IIFE, sin dependencias, comentarios en español.
4. Testea en móvil **y** escritorio.
5. Abre un Pull Request.

---

**Última actualización:** 2026-09-20
**Mantenido por:** Equipo CT URU · Morelia
