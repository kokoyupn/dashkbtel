/* ============================================================
   FORMATOS.JS — Definición única de los 7 formatos de campo
   Expone: window.Formatos
   ============================================================ */
(function (global) {
  'use strict';

  const hoyISO = () => new Date().toISOString().slice(0, 10);
  const TECNICO_DEF = 'HUGO ALBERTO MONTAÑEZ VILLANUEVA';
  const EXP_DEF = '01046681';

  /** Marca ✅ solo si el valor es truthy */
  const chk = v => (v ? '✅' : '');

  const FORMATOS = {};

  /* ── 1. QUEJA GARANTÍA ─────────────────────────────────── */
  FORMATOS.QUEJA_GARANTIA = {
    id: 'QUEJA_GARANTIA',
    nombre: 'Queja Garantía',
    icono: '🛠️',
    campos: [
      { k:'fecha',    label:'Fecha',            tipo:'date',     req:true, def:hoyISO, rol:'fecha' },
      { k:'area',     label:'Área',             tipo:'text',     req:true, def:'MORELIA' },
      { k:'cope',     label:'COPE',             tipo:'text',     req:true, def:'ZITÁCUARO', rol:'cope', esCope:true },
      { k:'cliente',  label:'Nombre del cliente', tipo:'text',   req:true, rol:'titular' },
      { k:'telefono', label:'Teléfono',         tipo:'tel',      req:true, rol:'telefono' },
      { k:'os',       label:'O.S.',             tipo:'text',     req:true, rol:'os' },
      { k:'distrito', label:'Distrito',         tipo:'text',     req:true, rol:'distrito' },
      { k:'falla',    label:'Falla',            tipo:'textarea', req:true },
      { k:'tecnico',  label:'Técnico',          tipo:'text',     req:true, def:TECNICO_DEF },
    ],
    construir(d) {
      return [
        'QUEJA GARANTÍA', '',
        `Fecha:  ${d.fecha}`,
        `Área: ${d.area}`,
        `COPE: ${d.cope}`,
        `NOMBRE DEL CLIENTE: ${d.cliente}`,
        `TELEFONO: ${d.telefono}`,
        `O.S.: ${d.os}`,
        `DISTRITO: ${d.distrito}`,
        `FALLA: ${d.falla}`,
        `*Técnico:* ${d.tecnico}`,
      ].join('\n');
    }
  };

  /* ── 2. LIQUIDACIÓN FIBRA ──────────────────────────────── */
  FORMATOS.LIQ_FIBRA = {
    id: 'LIQ_FIBRA',
    nombre: 'Liquidación Fibra',
    icono: '🔵',
    campos: [
      { k:'empresa',   label:'Empresa',                 tipo:'text', req:true, def:'KBTEL TELECOMUNICACIONES SA DE CV' },
      { k:'tecnico',   label:'Técnico',                 tipo:'text', req:true, def:TECNICO_DEF },
      { k:'exp',       label:'Exp. Personal',           tipo:'text', req:true, def:EXP_DEF },
      { k:'fecha',     label:'Fecha',                   tipo:'date', req:true, def:hoyISO, rol:'fecha' },
      { k:'cope',      label:'Cope',                    tipo:'text', req:true, rol:'cope', esCope:true },
      { k:'os',        label:'Número de OS',            tipo:'text', req:true, rol:'os' },
      { k:'telOS',     label:'Teléfono orden de servicio', tipo:'tel', req:true, rol:'telefono' },
      { k:'telCliente',label:'Teléfono personal del cliente', tipo:'tel', req:false },
      { k:'tipoServ',  label:'Tipo de Servicio',        tipo:'text', req:true },
      { k:'titular',   label:'Titular',                 tipo:'text', req:true, rol:'titular' },
      { k:'domicilio', label:'Domicilio',               tipo:'text', req:true },
      { k:'distrito',  label:'Distrito',                tipo:'text', req:true, rol:'distrito' },
      { k:'terminal',  label:'Terminal',                tipo:'text', req:true, rol:'terminal' },
      { k:'puerto',    label:'Puerto',                  tipo:'text', req:true },
      { k:'bajante',   label:'Tipo de Bajante',         tipo:'text', req:true, def:'AÉREO' },
      { k:'metros',    label:'Metros construidos',      tipo:'number', req:true },
      { k:'folioBaj',  label:'Folio(s) de Bajantes',    tipo:'text', req:false, def:'BOBINA' },
      { k:'folioCCR',  label:'Folio CCR',               tipo:'text', req:false },
      { k:'serieONT',  label:'Número de Serie ONT',     tipo:'text', req:true, rol:'serie' },
      { k:'alfanum',   label:'Alfanumérico',            tipo:'text', req:false },
      { k:'claroVideo',label:'Claro Video',             tipo:'select', req:true, opciones:['SI','NO','N/A'] },
      { k:'folioCV',   label:'Folio Claro Vídeo',       tipo:'text', req:false },
      { k:'motivo',    label:'Motivo',                  tipo:'text', req:false },
      { k:'coship',    label:'Instalación de COSHIP',   tipo:'text', req:false, def:'N/A' },
      { k:'fusion',    label:'Fusión SI/NO',            tipo:'select', req:true, opciones:['SI','NO'], def:'NO' },
      { k:'coordsDom', label:'Coordenadas Domicilio',   tipo:'coords', req:true, rol:'coordsDom' },
      { k:'coordsTer', label:'Coordenadas Terminal',    tipo:'coords', req:true, rol:'coordsTer' },
      { k:'cap',       label:'Liquidación CAP',         tipo:'check' },
      { k:'pic',       label:'Liquidación PIC',         tipo:'check' },
      { k:'tac',       label:'Liquidación TAC',         tipo:'check', def:true },
      { k:'ivr',       label:'Liquidación IVR',         tipo:'check' },
      { k:'trino',     label:'Liquidación TRINO',       tipo:'check', def:true },
    ],
    construir(d) {
      return [
        '*PLANTILLA PARA LIQUIDACIONES DE FIBRA*', '',
        '*CUADRO DE INFORMACION:*',
        `*Empresa* ${d.empresa}`,
        `*TÉCNICO:* ${d.tecnico}`,
        `*EXP. PERSONAL:* ${d.exp}`,
        `*Fecha:* ${d.fecha}`,
        `*Cope:* ${d.cope}`,
        `*Numero de OS:* ${d.os}`,
        `*Teléfono la orden de servicio* ${d.telOS}`,
        `*Teléfono personal del cliente* ${d.telCliente}`,
        `*Tipo de Servicio:* ${d.tipoServ}`,
        `*TITULAR:* ${d.titular}`,
        `*Domicilio:* ${d.domicilio}`,
        `*Distrito:* ${d.distrito}`,
        `*Terminal:* ${d.terminal}`,
        `*Puerto* ${d.puerto}`,
        `*Tipo de Bajante:* ${d.bajante}`,
        `*Metros construidos:* ${d.metros}`,
        `*FOLIO (S) DE BAJANTES* ${d.folioBaj}`,
        `*FOLIO CCR:* ${d.folioCCR}`,
        `*Número de Serie ONT:* ${d.serieONT}`,
        `*Alfanumérico:* ${d.alfanum}`,
        `*CLARO VIDEO?* ${d.claroVideo}`,
        `*Folio Claro Vídeo:* ${d.folioCV}`,
        `*MOTIVO* ${d.motivo}`,
        `*INSTALACION DE COSHIP* ${d.coship}`,
        `*FUSION SI/NO* ${d.fusion}`,
        `*COORDENADAS DE DOMICILIO :* ${d.coordsDom}`,
        `*COORDENADAS DE TERMINAL* ${d.coordsTer}`,
        '*TIPO DE LIQUIDACION*',
        `*CAP*${chk(d.cap)}`,
        `*PIC*${chk(d.pic)}`,
        `*TAC*${chk(d.tac)}`,
        `*IVR*${chk(d.ivr)}`,
        `*TRINO*${chk(d.trino)}`,
      ].join('\n');
    }
  };

  /* ── 3. LIQUIDACIÓN COBRE ──────────────────────────────── */
  FORMATOS.LIQ_COBRE = {
    id: 'LIQ_COBRE',
    nombre: 'Liquidación Cobre',
    icono: '🟠',
    campos: [
      { k:'tecnico',   label:'Técnico',            tipo:'text', req:true, def:TECNICO_DEF },
      { k:'exp',       label:'Expediente Personal',tipo:'text', req:true, def:EXP_DEF },
      { k:'empresa',   label:'Empresa',            tipo:'text', req:true, def:'KB TEL Telecomunicaciones, S.A. de C.V.' },
      { k:'fecha',     label:'Fecha',              tipo:'date', req:true, def:hoyISO, rol:'fecha' },
      { k:'area',      label:'Área',               tipo:'text', req:true, def:'Morelia' },
      { k:'cope',      label:'Cope',               tipo:'text', req:true, rol:'cope', esCope:true },
      { k:'os',        label:'Número de OS',       tipo:'text', req:true, rol:'os' },
      { k:'telContacto',label:'Tel de contacto',   tipo:'tel',  req:true },
      { k:'telefono',  label:'Teléfono',           tipo:'tel',  req:true, rol:'telefono' },
      { k:'distrito',  label:'Distrito',           tipo:'text', req:true, rol:'distrito' },
      { k:'coords',    label:'Coordenadas',        tipo:'coords', req:true, rol:'coordsDom' },
      { k:'tipoServ',  label:'Tipo de Servicio',   tipo:'text', req:true },
      { k:'titular',   label:'Titular',            tipo:'text', req:true, rol:'titular' },
      { k:'domicilio', label:'Domicilio',          tipo:'text', req:true },
      { k:'metros',    label:'Metros construidos', tipo:'number', req:true },
      { k:'bajante',   label:'Tipo de Bajante',    tipo:'text', req:true, def:'Aéreo' },
      { k:'folioCCR',  label:'Folio CCR',          tipo:'text', req:false },
      { k:'alfanum',   label:'Alfanumérico',       tipo:'text', req:true, rol:'serie' },
      { k:'serie',     label:'Número de Serie',    tipo:'text', req:true },
      { k:'tecnologia',label:'Tecnología',         tipo:'select', req:true, opciones:['COBRE','FIBRA'], def:'COBRE' },
      { k:'secundario',label:'Secundario',         tipo:'text', req:true },
      { k:'principal', label:'Principal',          tipo:'text', req:true },
      { k:'posDG',     label:'Posición DG',        tipo:'text', req:true },
      { k:'remSalida', label:'Remate de Salida',   tipo:'text', req:true },
      { k:'remEntrada',label:'Remate de Entrada',  tipo:'text', req:true },
      { k:'locCentral',label:'Localización Central', tipo:'text', req:false },
      { k:'claroVideo',label:'Claro Video',        tipo:'select', req:true, opciones:['SI','NO','N/A'], def:'N/A' },
      { k:'folioCV',   label:'Folio CV',           tipo:'text', req:false, def:'N/A' },
      { k:'dit',       label:'DIT',                tipo:'check', def:true },
      { k:'roseta',    label:'Roseta Marfil',      tipo:'check', def:true },
      { k:'modem',     label:'Módem',              tipo:'check', def:true },
      { k:'tipoLiq',   label:'Tipo de Liquidación',tipo:'text', req:true, def:'APLEX' },
    ],
    construir(d) {
      return [
        '*PLANTILLA PARA LIQUIDACIONES DE COBRE*', '',
        '*CUADRO DE  INFORMACION OFICIAL:*',
        '*DATOS DE LA OS*',
        `*Técnico:* ${d.tecnico}`,
        `*Expediente Personal:* ${d.exp}`,
        `*Empresa:* ${d.empresa}`,
        `*FECHA:* ${d.fecha}`,
        `*ÁREA* ${d.area}`,
        `*Cope:* ${d.cope}`,
        `*NÚMERO de OS:* ${d.os}`,
        `*Tel de contacto:* ${d.telContacto}`,
        `*Teléfono:* ${d.telefono}`,
        `*Distrito:* ${d.distrito}`,
        `*COORDENADAS:* ${d.coords}`,
        `*Tipo de Servicio:* ${d.tipoServ}`,
        `*TITULAR:* ${d.titular}`,
        `*DOMICILIO:* ${d.domicilio}`,
        `*Metros construidos:* ${d.metros}`,
        `*Tipo de Bajante:* ${d.bajante}`,
        `*FOLIO CCR*: ${d.folioCCR}`,
        `*ALFANUMÉRICO:* ${d.alfanum}`,
        `*NÚMERO DE SERIE* ${d.serie}`,
        `*TECNOLOGÍA* : ${d.tecnologia}`,
        `*SECUNDARIO* ${d.secundario}`,
        `*PRINCIPAL* ${d.principal}`,
        `*POSICIÓN DG:* ${d.posDG}`,
        `*REMATE DE SALIDA :* ${d.remSalida}`,
        `*REMATE DE ENTRADA:* ${d.remEntrada}`,
        `*LOCALIZACIÓN CENTRAL* ${d.locCentral}`,
        `*CLARO VIDEO?* ${d.claroVideo}`,
        `*FOLIO CV* ${d.folioCV}`,
        '*INDICAR SI SE INSTALO LO SIGUIENTE:*',
        `*DIT* ${chk(d.dit)}`,
        `*ROSETA MARFIL* ${chk(d.roseta)}`,
        `*MODEM* ${chk(d.modem)}`,
        '*TIPO DE LIQUIDACION:*',
        `${d.tipoLiq}`,
      ].join('\n');
    }
  };

  /* ── 4. INCIDENCIA / CAMBIO DE RETENCIÓN ───────────────── */
  FORMATOS.RETENCION = {
    id: 'RETENCION',
    nombre: 'Incidencia Cambios de Retención',
    icono: '🔁',
    campos: [
      { k:'fecha',    label:'Fecha',      tipo:'date', req:true, def:hoyISO, rol:'fecha' },
      { k:'cope',     label:'Cope',       tipo:'text', req:true, rol:'cope', esCope:true },
      { k:'area',     label:'Área',       tipo:'text', req:true, def:'Morelia' },
      { k:'distrito', label:'Distrito',   tipo:'text', req:true, rol:'distrito' },
      { k:'tarea',    label:'Tarea',      tipo:'text', req:true },
      { k:'os',       label:'OS',         tipo:'text', req:true, rol:'os' },
      { k:'telefono', label:'Teléfono',   tipo:'tel',  req:true, rol:'telefono' },
      { k:'contacto', label:'Contacto',   tipo:'tel',  req:false },
      { k:'motivo',   label:'Motivo',     tipo:'text', req:true },
      { k:'agenteCap',label:'Agente CAP', tipo:'text', req:false },
      { k:'agenteCon',label:'Agente Concierge', tipo:'text', req:false },
      { k:'direccion',label:'Dirección',  tipo:'text', req:true },
      { k:'titular',  label:'Titular',    tipo:'text', req:true, rol:'titular' },
      { k:'folios',   label:'Folios',     tipo:'text', req:false },
      { k:'tecnico',  label:'Técnico',    tipo:'text', req:true, def:TECNICO_DEF },
    ],
    construir(d) {
      return [
        '*Cuadro de INCIDENCIA CAMBIOS DE RETENCION*', '',
        `*Fecha :* ${d.fecha}`,
        `*Cope :* ${d.cope}`,
        `*Area :* ${d.area}`,
        `*Distrito:* ${d.distrito}`,
        `*Tarea*: ${d.tarea}`,
        `*OS :* ${d.os}`,
        `*Teléfono :* ${d.telefono}`,
        `*Contacto:* ${d.contacto}`,
        `*Motivo:* ${d.motivo}`,
        `*Agente cap*: ${d.agenteCap}`,
        `*Agente concierge*: ${d.agenteCon}`,
        `*Dirección:* ${d.direccion}`,
        `*Titular:* ${d.titular}`,
        `*Folios:* ${d.folios}`,
        `*Técnico* ${d.tecnico}`,
      ].join('\n');
    }
  };

  /* ── 5. OBJECIÓN ───────────────────────────────────────── */
  FORMATOS.OBJECION = {
    id: 'OBJECION',
    nombre: 'Cuadro de Objeción',
    icono: '🚫',
    campos: [
      { k:'fecha',    label:'Fecha',      tipo:'date', req:true, def:hoyISO, rol:'fecha' },
      { k:'cope',     label:'Cope',       tipo:'text', req:true, rol:'cope', esCope:true },
      { k:'area',     label:'Área',       tipo:'text', req:true, def:'MORELIA' },
      { k:'distrito', label:'Distrito',   tipo:'text', req:true, rol:'distrito' },
      { k:'os',       label:'OS',         tipo:'text', req:true, rol:'os' },
      { k:'telefono', label:'Teléfono',   tipo:'tel',  req:true, rol:'telefono' },
      { k:'contacto', label:'Contacto',   tipo:'tel',  req:false },
      { k:'motivo',   label:'Motivo',     tipo:'text', req:true },
      { k:'coords',   label:'Coordenadas',tipo:'coords', req:true, rol:'coordsDom' },
      { k:'folioCAP', label:'Folio CAP',  tipo:'text', req:true },
      { k:'agenteCon',label:'Agente Concierge', tipo:'text', req:true },
      { k:'tecnico',  label:'Técnico',    tipo:'text', req:true, def:TECNICO_DEF },
    ],
    construir(d) {
      return [
        '*Cuadro de OBJECIÓN*',
        `*Fecha:* ${d.fecha}`,
        `*Cope :* ${d.cope}`,
        `*Area :* ${d.area}`,
        `*Distrito :* ${d.distrito}`,
        `*OS :* ${d.os}`,
        `*Teléfono :* ${d.telefono}`,
        `*Contacto:* ${d.contacto}`,
        `*Motivo :* ${d.motivo}`,
        '*Coordenadas:*',
        ` ${d.coords}`,
        `*Folio CAP:* ${d.folioCAP}`,
        `*Agente Consierge:* ${d.agenteCon}`,
        `*Técnico:* ${d.tecnico}`,
      ].join('\n');
    }
  };

  /* ── 6. RETIRAR FOLIO ──────────────────────────────────── */
  FORMATOS.RETIRAR_FOLIO = {
    id: 'RETIRAR_FOLIO',
    nombre: 'Retirar Folio',
    icono: '📤',
    campos: [
      { k:'folioOS',  label:'Folio OS',   tipo:'text', req:true, rol:'os' },
      { k:'telCliente',label:'Tel cliente',tipo:'tel', req:true, rol:'telefono' },
      { k:'area',     label:'Área',       tipo:'text', req:true, def:'MORELIA' },
      { k:'cope',     label:'Cope',       tipo:'text', req:true, def:'COPE URUAPAN', rol:'cope', esCope:true },
      { k:'tecnico',  label:'Nombre del técnico', tipo:'text', req:true, def:`(134121) ${TECNICO_DEF}` },
      { k:'exp',      label:'Expediente técnico', tipo:'text', req:true, def:EXP_DEF },
      { k:'serie',    label:'Número de serie', tipo:'text', req:false, def:'N/A', rol:'serie' },
      { k:'terminal', label:'Terminal',   tipo:'text', req:true, rol:'terminal' },
      { k:'puerto',   label:'Puerto',     tipo:'text', req:true },
      { k:'motivo',   label:'Motivo',     tipo:'text', req:true },
      { k:'personal', label:'Personal Telmex (nombre y puesto)', tipo:'text', req:true },
      { k:'via',      label:'Vía utilizada', tipo:'select', req:true, opciones:['LLAMADA','WHATSAPP','MENSAJE ATL - CONSIERGNE'] },
      { k:'hora',     label:'Hora en que se escaló', tipo:'time', req:true },
    ],
    construir(d) {
      return [
        '*PROBLEMA:\tRETIRAR FOLIO*', '',
        `*FOLIO OS:* ${d.folioOS}`,
        `*TEL CLIENTE:*\t${d.telCliente}`,
        `*AREA:* ${d.area}`,
        `*COPE:* ${d.cope}`,
        `*NOMBRE DEL TECNICO:* ${d.tecnico}`,
        `*EXPEDIENTE TECNICO:* ${d.exp}`,
        `*NUMERO DE SERIE:*\t${d.serie}`,
        `*TERMINAL:* ${d.terminal}`,
        `*PUERTO:* ${d.puerto}`,
        `*MOTIVO:* ${d.motivo}`,
        `*PERSONAL TELMEX CON EL CUAL SE ESCALO (NOMBRE Y PUESTO):* ${d.personal}`,
        `*QUE VIA UTILIZARON LLAMADA O WHATSAPP:*\t${d.via}`,
        `*HORA EN QUE SE ESCALO:* ${d.hora}`,
      ].join('\n');
    }
  };

  /* ── 7. SUSPENDER FOLIO ────────────────────────────────── */
  FORMATOS.SUSPENDER_FOLIO = {
    id: 'SUSPENDER_FOLIO',
    nombre: 'Solicitud para Suspender Folio',
    icono: '⏸️',
    campos: [
      { k:'problema', label:'Problema',   tipo:'text', req:true },
      { k:'idActividad', label:'ID Actividad', tipo:'text', req:true },
      { k:'folio',    label:'Folio',      tipo:'text', req:true, rol:'os' },
      { k:'telCliente',label:'Tel cliente',tipo:'tel', req:true, rol:'telefono' },
      { k:'serie',    label:'Número de serie', tipo:'text', req:false, rol:'serie' },
      { k:'area',     label:'Área',       tipo:'text', req:true, def:'MORELIA' },
      { k:'cope',     label:'Cope',       tipo:'text', req:true, def:'URUAPAN', rol:'cope', esCope:true },
      { k:'reporta',  label:'Datos de quien reporta', tipo:'text', req:true, def:'CAP MORELIA' },
      { k:'tecnico',  label:'Nombre del técnico', tipo:'text', req:true, def:TECNICO_DEF },
      { k:'exp',      label:'Expediente técnico', tipo:'text', req:true, def:EXP_DEF },
    ],
    construir(d) {
      return [
        'SOLICITUD PARA SUSPENDER FOLIO', '',
        `1. *PROBLEMA:* ${d.problema}`,
        `2. *ID ACTIVIDAD :* ${d.idActividad}`,
        `3. *FOLIO:*  ${d.folio}`,
        `3. *TEL CLIENTE :* ${d.telCliente}`,
        `4. *NUMERO DE SERIE:* ${d.serie}`,
        `5. *AREA:* ${d.area}`,
        `6. *COPE:* ${d.cope}`,
        `7. *DATOS DE QUIEN REPORTA:* ${d.reporta}`,
        `*NOMBRE DEL TECNICO:* ${d.tecnico}`,
        `*EXPEDIENTE TECNICO:* ${d.exp}`,
      ].join('\n');
    }
  };

  /* ── API pública ───────────────────────────────────────── */
  const lista = () => Object.values(FORMATOS);
  const obtener = id => FORMATOS[id] || null;

  /**
   * Extrae los campos "indexables" (roles) de un registro,
   * para el almacén y las búsquedas.
   */
  function indexar(formatoId, datos) {
    const f = obtener(formatoId);
    if (!f) return {};
    const idx = {};
    for (const c of f.campos) {
      if (c.rol && datos[c.k] != null && datos[c.k] !== '') {
        idx[c.rol] = String(datos[c.k]).trim();
      }
    }
    return idx;
  }

  /** Devuelve el COPE normalizado (sin espacios, mayúsculas). */
  function copeDe(formatoId, datos) {
    const f = obtener(formatoId);
    if (!f) return '';
    const campo = f.campos.find(c => c.esCope);
    const raw = campo ? datos[campo.k] : '';
    return String(raw || '').replace(/^COPE\s*/i, '').trim().toUpperCase();
  }

  global.Formatos = { lista, obtener, indexar, copeDe, TODOS: FORMATOS };
})(window);