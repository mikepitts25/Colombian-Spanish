// Colombian Spanish verb conjugation tables
// Persons: yo, vos, él/ella, nosotros, ustedes, ellos/ellas
// No vosotros — Colombia uses ustedes for both informal and formal plural
// Vos forms: present -ar → -ás, -er → -és, -ir → -ís (NO stem change for vos)
// Past tense: pretérito perfecto simple (salté, not "he saltado") — conversational Colombian

export interface VerbForms {
  yo: string;
  vos: string;
  el_ella: string;
  nosotros: string;
  ustedes: string;
  ellos: string;
}

export interface ConjugationEntry {
  irregular: boolean;
  irregular_note?: string;
  reflexive?: boolean;
  presente: VerbForms;
  preterito: VerbForms;
  futuro: VerbForms;
}

export const CONJUGATIONS: Record<string, ConjugationEntry> = {
  // ── A ──────────────────────────────────────────────────────────────────────

  abrir: {
    irregular: true,
    irregular_note: 'past participle: abierto',
    presente:  { yo: 'abro',    vos: 'abrís',    el_ella: 'abre',    nosotros: 'abrimos',   ustedes: 'abren',    ellos: 'abren'    },
    preterito: { yo: 'abrí',    vos: 'abriste',  el_ella: 'abrió',   nosotros: 'abrimos',   ustedes: 'abrieron', ellos: 'abrieron' },
    futuro:    { yo: 'abriré',  vos: 'abrirás',  el_ella: 'abrirá',  nosotros: 'abriremos', ustedes: 'abrirán',  ellos: 'abrirán'  },
  },

  actualizar: {
    irregular: true,
    irregular_note: 'yo preterite spelling change: actualicé',
    presente:  { yo: 'actualizo',   vos: 'actualizás',   el_ella: 'actualiza',   nosotros: 'actualizamos',   ustedes: 'actualizan',    ellos: 'actualizan'    },
    preterito: { yo: 'actualicé',   vos: 'actualizaste', el_ella: 'actualizó',   nosotros: 'actualizamos',   ustedes: 'actualizaron',  ellos: 'actualizaron'  },
    futuro:    { yo: 'actualizaré', vos: 'actualizarás', el_ella: 'actualizará', nosotros: 'actualizaremos', ustedes: 'actualizarán',  ellos: 'actualizarán'  },
  },

  almorzar: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); yo preterite: almorcé',
    presente:  { yo: 'almuerzo',   vos: 'almorzás',   el_ella: 'almuerza',   nosotros: 'almorzamos',   ustedes: 'almuerzan',    ellos: 'almuerzan'    },
    preterito: { yo: 'almorcé',    vos: 'almorzaste', el_ella: 'almorzó',    nosotros: 'almorzamos',   ustedes: 'almorzaron',   ellos: 'almorzaron'   },
    futuro:    { yo: 'almorzaré',  vos: 'almorzarás', el_ella: 'almorzará',  nosotros: 'almorzaremos', ustedes: 'almorzarán',   ellos: 'almorzarán'   },
  },

  aprender: {
    irregular: false,
    presente:  { yo: 'aprendo',    vos: 'aprendés',   el_ella: 'aprende',    nosotros: 'aprendemos',   ustedes: 'aprenden',    ellos: 'aprenden'    },
    preterito: { yo: 'aprendí',    vos: 'aprendiste', el_ella: 'aprendió',   nosotros: 'aprendimos',   ustedes: 'aprendieron', ellos: 'aprendieron' },
    futuro:    { yo: 'aprenderé',  vos: 'aprenderás', el_ella: 'aprenderá',  nosotros: 'aprenderemos', ustedes: 'aprenderán',  ellos: 'aprenderán'  },
  },

  ayudar: {
    irregular: false,
    presente:  { yo: 'ayudo',    vos: 'ayudás',   el_ella: 'ayuda',    nosotros: 'ayudamos',   ustedes: 'ayudan',    ellos: 'ayudan'    },
    preterito: { yo: 'ayudé',    vos: 'ayudaste', el_ella: 'ayudó',    nosotros: 'ayudamos',   ustedes: 'ayudaron',  ellos: 'ayudaron'  },
    futuro:    { yo: 'ayudaré',  vos: 'ayudarás', el_ella: 'ayudará',  nosotros: 'ayudaremos', ustedes: 'ayudarán',  ellos: 'ayudarán'  },
  },

  // ── B ──────────────────────────────────────────────────────────────────────

  bailar: {
    irregular: false,
    presente:  { yo: 'bailo',    vos: 'bailás',   el_ella: 'baila',    nosotros: 'bailamos',   ustedes: 'bailan',    ellos: 'bailan'    },
    preterito: { yo: 'bailé',    vos: 'bailaste', el_ella: 'bailó',    nosotros: 'bailamos',   ustedes: 'bailaron',  ellos: 'bailaron'  },
    futuro:    { yo: 'bailaré',  vos: 'bailarás', el_ella: 'bailará',  nosotros: 'bailaremos', ustedes: 'bailarán',  ellos: 'bailarán'  },
  },

  buscar: {
    irregular: true,
    irregular_note: 'yo preterite spelling change: busqué',
    presente:  { yo: 'busco',    vos: 'buscás',   el_ella: 'busca',    nosotros: 'buscamos',   ustedes: 'buscan',    ellos: 'buscan'    },
    preterito: { yo: 'busqué',   vos: 'buscaste', el_ella: 'buscó',    nosotros: 'buscamos',   ustedes: 'buscaron',  ellos: 'buscaron'  },
    futuro:    { yo: 'buscaré',  vos: 'buscarás', el_ella: 'buscará',  nosotros: 'buscaremos', ustedes: 'buscarán',  ellos: 'buscarán'  },
  },

  // ── C ──────────────────────────────────────────────────────────────────────

  caminar: {
    irregular: false,
    presente:  { yo: 'camino',    vos: 'caminás',   el_ella: 'camina',    nosotros: 'caminamos',   ustedes: 'caminan',    ellos: 'caminan'    },
    preterito: { yo: 'caminé',    vos: 'caminaste', el_ella: 'caminó',    nosotros: 'caminamos',   ustedes: 'caminaron',  ellos: 'caminaron'  },
    futuro:    { yo: 'caminaré',  vos: 'caminarás', el_ella: 'caminará',  nosotros: 'caminaremos', ustedes: 'caminarán',  ellos: 'caminarán'  },
  },

  cantar: {
    irregular: false,
    presente:  { yo: 'canto',    vos: 'cantás',   el_ella: 'canta',    nosotros: 'cantamos',   ustedes: 'cantan',    ellos: 'cantan'    },
    preterito: { yo: 'canté',    vos: 'cantaste', el_ella: 'cantó',    nosotros: 'cantamos',   ustedes: 'cantaron',  ellos: 'cantaron'  },
    futuro:    { yo: 'cantaré',  vos: 'cantarás', el_ella: 'cantará',  nosotros: 'cantaremos', ustedes: 'cantarán',  ellos: 'cantarán'  },
  },

  cenar: {
    irregular: false,
    presente:  { yo: 'ceno',    vos: 'cenás',   el_ella: 'cena',    nosotros: 'cenamos',   ustedes: 'cenan',    ellos: 'cenan'    },
    preterito: { yo: 'cené',    vos: 'cenaste', el_ella: 'cenó',    nosotros: 'cenamos',   ustedes: 'cenaron',  ellos: 'cenaron'  },
    futuro:    { yo: 'cenaré',  vos: 'cenarás', el_ella: 'cenará',  nosotros: 'cenaremos', ustedes: 'cenarán',  ellos: 'cenarán'  },
  },

  cerrar: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'cierro',   vos: 'cerrás',   el_ella: 'cierra',   nosotros: 'cerramos',   ustedes: 'cierran',   ellos: 'cierran'   },
    preterito: { yo: 'cerré',    vos: 'cerraste', el_ella: 'cerró',    nosotros: 'cerramos',   ustedes: 'cerraron',  ellos: 'cerraron'  },
    futuro:    { yo: 'cerraré',  vos: 'cerrarás', el_ella: 'cerrará',  nosotros: 'cerraremos', ustedes: 'cerrarán',  ellos: 'cerrarán'  },
  },

  charlar: {
    irregular: false,
    presente:  { yo: 'charlo',    vos: 'charlás',   el_ella: 'charla',    nosotros: 'charlamos',   ustedes: 'charlan',    ellos: 'charlan'    },
    preterito: { yo: 'charlé',    vos: 'charlaste', el_ella: 'charló',    nosotros: 'charlamos',   ustedes: 'charlaron',  ellos: 'charlaron'  },
    futuro:    { yo: 'charlaré',  vos: 'charlarás', el_ella: 'charlará',  nosotros: 'charlaremos', ustedes: 'charlarán',  ellos: 'charlarán'  },
  },

  cocinar: {
    irregular: false,
    presente:  { yo: 'cocino',    vos: 'cocinás',   el_ella: 'cocina',    nosotros: 'cocinamos',   ustedes: 'cocinan',    ellos: 'cocinan'    },
    preterito: { yo: 'cociné',    vos: 'cocinaste', el_ella: 'cocinó',    nosotros: 'cocinamos',   ustedes: 'cocinaron',  ellos: 'cocinaron'  },
    futuro:    { yo: 'cocinaré',  vos: 'cocinarás', el_ella: 'cocinará',  nosotros: 'cocinaremos', ustedes: 'cocinarán',  ellos: 'cocinarán'  },
  },

  comprar: {
    irregular: false,
    presente:  { yo: 'compro',    vos: 'comprás',   el_ella: 'compra',    nosotros: 'compramos',   ustedes: 'compran',    ellos: 'compran'    },
    preterito: { yo: 'compré',    vos: 'compraste', el_ella: 'compró',    nosotros: 'compramos',   ustedes: 'compraron',  ellos: 'compraron'  },
    futuro:    { yo: 'compraré',  vos: 'comprarás', el_ella: 'comprará',  nosotros: 'compraremos', ustedes: 'comprarán',  ellos: 'comprarán'  },
  },

  contestar: {
    irregular: false,
    presente:  { yo: 'contesto',    vos: 'contestás',   el_ella: 'contesta',    nosotros: 'contestamos',   ustedes: 'contestan',    ellos: 'contestan'    },
    preterito: { yo: 'contesté',    vos: 'contestaste', el_ella: 'contestó',    nosotros: 'contestamos',   ustedes: 'contestaron',  ellos: 'contestaron'  },
    futuro:    { yo: 'contestaré',  vos: 'contestarás', el_ella: 'contestará',  nosotros: 'contestaremos', ustedes: 'contestarán',  ellos: 'contestarán'  },
  },

  correr: {
    irregular: false,
    presente:  { yo: 'corro',    vos: 'corrés',   el_ella: 'corre',    nosotros: 'corremos',   ustedes: 'corren',    ellos: 'corren'    },
    preterito: { yo: 'corrí',    vos: 'corriste', el_ella: 'corrió',   nosotros: 'corrimos',   ustedes: 'corrieron', ellos: 'corrieron' },
    futuro:    { yo: 'correré',  vos: 'correrás', el_ella: 'correrá',  nosotros: 'correremos', ustedes: 'correrán',  ellos: 'correrán'  },
  },

  // ── D ──────────────────────────────────────────────────────────────────────

  desayunar: {
    irregular: false,
    presente:  { yo: 'desayuno',    vos: 'desayunás',   el_ella: 'desayuna',    nosotros: 'desayunamos',   ustedes: 'desayunan',    ellos: 'desayunan'    },
    preterito: { yo: 'desayuné',    vos: 'desayunaste', el_ella: 'desayunó',    nosotros: 'desayunamos',   ustedes: 'desayunaron',  ellos: 'desayunaron'  },
    futuro:    { yo: 'desayunaré',  vos: 'desayunarás', el_ella: 'desayunará',  nosotros: 'desayunaremos', ustedes: 'desayunarán',  ellos: 'desayunarán'  },
  },

  descansar: {
    irregular: false,
    presente:  { yo: 'descanso',    vos: 'descansás',   el_ella: 'descansa',    nosotros: 'descansamos',   ustedes: 'descansan',    ellos: 'descansan'    },
    preterito: { yo: 'descansé',    vos: 'descansaste', el_ella: 'descansó',    nosotros: 'descansamos',   ustedes: 'descansaron',  ellos: 'descansaron'  },
    futuro:    { yo: 'descansaré',  vos: 'descansarás', el_ella: 'descansará',  nosotros: 'descansaremos', ustedes: 'descansarán',  ellos: 'descansarán'  },
  },

  despertarse: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); vos stays regular',
    reflexive: true,
    presente:  { yo: 'me despierto',   vos: 'te despertás',   el_ella: 'se despierta',   nosotros: 'nos despertamos',   ustedes: 'se despiertan',   ellos: 'se despiertan'   },
    preterito: { yo: 'me desperté',    vos: 'te despertaste', el_ella: 'se despertó',    nosotros: 'nos despertamos',   ustedes: 'se despertaron',  ellos: 'se despertaron'  },
    futuro:    { yo: 'me despertaré',  vos: 'te despertarás', el_ella: 'se despertará',  nosotros: 'nos despertaremos', ustedes: 'se despertarán',  ellos: 'se despertarán'  },
  },

  dibujar: {
    irregular: false,
    presente:  { yo: 'dibujo',    vos: 'dibujás',   el_ella: 'dibuja',    nosotros: 'dibujamos',   ustedes: 'dibujan',    ellos: 'dibujan'    },
    preterito: { yo: 'dibujé',    vos: 'dibujaste', el_ella: 'dibujó',    nosotros: 'dibujamos',   ustedes: 'dibujaron',  ellos: 'dibujaron'  },
    futuro:    { yo: 'dibujaré',  vos: 'dibujarás', el_ella: 'dibujará',  nosotros: 'dibujaremos', ustedes: 'dibujarán',  ellos: 'dibujarán'  },
  },

  ducharse: {
    irregular: false,
    reflexive: true,
    presente:  { yo: 'me ducho',    vos: 'te duchás',   el_ella: 'se ducha',    nosotros: 'nos duchamos',   ustedes: 'se duchan',    ellos: 'se duchan'    },
    preterito: { yo: 'me duché',    vos: 'te duchaste', el_ella: 'se duchó',    nosotros: 'nos duchamos',   ustedes: 'se ducharon',  ellos: 'se ducharon'  },
    futuro:    { yo: 'me ducharé',  vos: 'te ducharás', el_ella: 'se duchará',  nosotros: 'nos ducharemos', ustedes: 'se ducharán',  ellos: 'se ducharán'  },
  },

  // ── E ──────────────────────────────────────────────────────────────────────

  enseñar: {
    irregular: false,
    presente:  { yo: 'enseño',    vos: 'enseñás',   el_ella: 'enseña',    nosotros: 'enseñamos',   ustedes: 'enseñan',    ellos: 'enseñan'    },
    preterito: { yo: 'enseñé',    vos: 'enseñaste', el_ella: 'enseñó',    nosotros: 'enseñamos',   ustedes: 'enseñaron',  ellos: 'enseñaron'  },
    futuro:    { yo: 'enseñaré',  vos: 'enseñarás', el_ella: 'enseñará',  nosotros: 'enseñaremos', ustedes: 'enseñarán',  ellos: 'enseñarán'  },
  },

  escribir: {
    irregular: true,
    irregular_note: 'past participle: escrito',
    presente:  { yo: 'escribo',    vos: 'escribís',   el_ella: 'escribe',    nosotros: 'escribimos',   ustedes: 'escriben',    ellos: 'escriben'    },
    preterito: { yo: 'escribí',    vos: 'escribiste', el_ella: 'escribió',   nosotros: 'escribimos',   ustedes: 'escribieron', ellos: 'escribieron' },
    futuro:    { yo: 'escribiré',  vos: 'escribirás', el_ella: 'escribirá',  nosotros: 'escribiremos', ustedes: 'escribirán',  ellos: 'escribirán'  },
  },

  escuchar: {
    irregular: false,
    presente:  { yo: 'escucho',    vos: 'escuchás',   el_ella: 'escucha',    nosotros: 'escuchamos',   ustedes: 'escuchan',    ellos: 'escuchan'    },
    preterito: { yo: 'escuché',    vos: 'escuchaste', el_ella: 'escuchó',    nosotros: 'escuchamos',   ustedes: 'escucharon',  ellos: 'escucharon'  },
    futuro:    { yo: 'escucharé',  vos: 'escucharás', el_ella: 'escuchará',  nosotros: 'escucharemos', ustedes: 'escucharán',  ellos: 'escucharán'  },
  },

  estudiar: {
    irregular: false,
    presente:  { yo: 'estudio',    vos: 'estudiás',   el_ella: 'estudia',    nosotros: 'estudiamos',   ustedes: 'estudian',    ellos: 'estudian'    },
    preterito: { yo: 'estudié',    vos: 'estudiaste', el_ella: 'estudió',    nosotros: 'estudiamos',   ustedes: 'estudiaron',  ellos: 'estudiaron'  },
    futuro:    { yo: 'estudiaré',  vos: 'estudiarás', el_ella: 'estudiará',  nosotros: 'estudiaremos', ustedes: 'estudiarán',  ellos: 'estudiarán'  },
  },

  // ── F ──────────────────────────────────────────────────────────────────────

  fregar: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); yo preterite: fregué',
    presente:  { yo: 'friego',   vos: 'fregás',   el_ella: 'friega',   nosotros: 'fregamos',   ustedes: 'friegan',   ellos: 'friegan'   },
    preterito: { yo: 'fregué',   vos: 'fregaste', el_ella: 'fregó',    nosotros: 'fregamos',   ustedes: 'fregaron',  ellos: 'fregaron'  },
    futuro:    { yo: 'fregaré',  vos: 'fregarás', el_ella: 'fregará',  nosotros: 'fregaremos', ustedes: 'fregarán',  ellos: 'fregarán'  },
  },

  // ── H ──────────────────────────────────────────────────────────────────────

  hablar: {
    irregular: false,
    presente:  { yo: 'hablo',    vos: 'hablás',   el_ella: 'habla',    nosotros: 'hablamos',   ustedes: 'hablan',    ellos: 'hablan'    },
    preterito: { yo: 'hablé',    vos: 'hablaste', el_ella: 'habló',    nosotros: 'hablamos',   ustedes: 'hablaron',  ellos: 'hablaron'  },
    futuro:    { yo: 'hablaré',  vos: 'hablarás', el_ella: 'hablará',  nosotros: 'hablaremos', ustedes: 'hablarán',  ellos: 'hablarán'  },
  },

  // ── J ──────────────────────────────────────────────────────────────────────

  jugar: {
    irregular: true,
    irregular_note: 'unique stem change u→ue (yo, él, ustedes/ellos); yo preterite: jugué; vos stays regular',
    presente:  { yo: 'juego',   vos: 'jugás',   el_ella: 'juega',   nosotros: 'jugamos',   ustedes: 'juegan',   ellos: 'juegan'   },
    preterito: { yo: 'jugué',   vos: 'jugaste', el_ella: 'jugó',    nosotros: 'jugamos',   ustedes: 'jugaron',  ellos: 'jugaron'  },
    futuro:    { yo: 'jugaré',  vos: 'jugarás', el_ella: 'jugará',  nosotros: 'jugaremos', ustedes: 'jugarán',  ellos: 'jugarán'  },
  },

  // ── L ──────────────────────────────────────────────────────────────────────

  leer: {
    irregular: true,
    irregular_note: 'irregular preterite: leyó, leyeron (i→y)',
    presente:  { yo: 'leo',    vos: 'leés',   el_ella: 'lee',    nosotros: 'leemos',   ustedes: 'leen',    ellos: 'leen'    },
    preterito: { yo: 'leí',    vos: 'leíste', el_ella: 'leyó',   nosotros: 'leímos',   ustedes: 'leyeron', ellos: 'leyeron' },
    futuro:    { yo: 'leeré',  vos: 'leerás', el_ella: 'leerá',  nosotros: 'leeremos', ustedes: 'leerán',  ellos: 'leerán'  },
  },

  limpiar: {
    irregular: false,
    presente:  { yo: 'limpio',    vos: 'limpiás',   el_ella: 'limpia',    nosotros: 'limpiamos',   ustedes: 'limpian',    ellos: 'limpian'    },
    preterito: { yo: 'limpié',    vos: 'limpiaste', el_ella: 'limpió',    nosotros: 'limpiamos',   ustedes: 'limpiaron',  ellos: 'limpiaron'  },
    futuro:    { yo: 'limpiaré',  vos: 'limpiarás', el_ella: 'limpiará',  nosotros: 'limpiaremos', ustedes: 'limpiarán',  ellos: 'limpiarán'  },
  },

  // ── M ──────────────────────────────────────────────────────────────────────

  mirar: {
    irregular: false,
    presente:  { yo: 'miro',    vos: 'mirás',   el_ella: 'mira',    nosotros: 'miramos',   ustedes: 'miran',    ellos: 'miran'    },
    preterito: { yo: 'miré',    vos: 'miraste', el_ella: 'miró',    nosotros: 'miramos',   ustedes: 'miraron',  ellos: 'miraron'  },
    futuro:    { yo: 'miraré',  vos: 'mirarás', el_ella: 'mirará',  nosotros: 'miraremos', ustedes: 'mirarán',  ellos: 'mirarán'  },
  },

  // ── N ──────────────────────────────────────────────────────────────────────

  nadar: {
    irregular: false,
    presente:  { yo: 'nado',    vos: 'nadás',   el_ella: 'nada',    nosotros: 'nadamos',   ustedes: 'nadan',    ellos: 'nadan'    },
    preterito: { yo: 'nadé',    vos: 'nadaste', el_ella: 'nadó',    nosotros: 'nadamos',   ustedes: 'nadaron',  ellos: 'nadaron'  },
    futuro:    { yo: 'nadaré',  vos: 'nadarás', el_ella: 'nadará',  nosotros: 'nadaremos', ustedes: 'nadarán',  ellos: 'nadarán'  },
  },

  // ── O ──────────────────────────────────────────────────────────────────────

  olvidar: {
    irregular: false,
    presente:  { yo: 'olvido',    vos: 'olvidás',   el_ella: 'olvida',    nosotros: 'olvidamos',   ustedes: 'olvidan',    ellos: 'olvidan'    },
    preterito: { yo: 'olvidé',    vos: 'olvidaste', el_ella: 'olvidó',    nosotros: 'olvidamos',   ustedes: 'olvidaron',  ellos: 'olvidaron'  },
    futuro:    { yo: 'olvidaré',  vos: 'olvidarás', el_ella: 'olvidará',  nosotros: 'olvidaremos', ustedes: 'olvidarán',  ellos: 'olvidarán'  },
  },

  // ── P ──────────────────────────────────────────────────────────────────────

  pichar: {
    irregular: false,
    presente:  { yo: 'picho',    vos: 'pichás',   el_ella: 'picha',    nosotros: 'pichamos',   ustedes: 'pichan',    ellos: 'pichan'    },
    preterito: { yo: 'piché',    vos: 'pichaste', el_ella: 'pichó',    nosotros: 'pichamos',   ustedes: 'picharon',  ellos: 'picharon'  },
    futuro:    { yo: 'picharé',  vos: 'picharás', el_ella: 'pichará',  nosotros: 'picharemos', ustedes: 'picharán',  ellos: 'picharán'  },
  },

  pintar: {
    irregular: false,
    presente:  { yo: 'pinto',    vos: 'pintás',   el_ella: 'pinta',    nosotros: 'pintamos',   ustedes: 'pintan',    ellos: 'pintan'    },
    preterito: { yo: 'pinté',    vos: 'pintaste', el_ella: 'pintó',    nosotros: 'pintamos',   ustedes: 'pintaron',  ellos: 'pintaron'  },
    futuro:    { yo: 'pintaré',  vos: 'pintarás', el_ella: 'pintará',  nosotros: 'pintaremos', ustedes: 'pintarán',  ellos: 'pintarán'  },
  },

  planchar: {
    irregular: false,
    presente:  { yo: 'plancho',    vos: 'planchás',   el_ella: 'plancha',    nosotros: 'planchamos',   ustedes: 'planchan',    ellos: 'planchan'    },
    preterito: { yo: 'planché',    vos: 'planchaste', el_ella: 'planchó',    nosotros: 'planchamos',   ustedes: 'plancharon',  ellos: 'plancharon'  },
    futuro:    { yo: 'plancharé',  vos: 'plancharás', el_ella: 'planchará',  nosotros: 'plancharemos', ustedes: 'plancharán',  ellos: 'plancharán'  },
  },

  // ── R ──────────────────────────────────────────────────────────────────────

  recordar: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'recuerdo',   vos: 'recordás',   el_ella: 'recuerda',   nosotros: 'recordamos',   ustedes: 'recuerdan',   ellos: 'recuerdan'   },
    preterito: { yo: 'recordé',    vos: 'recordaste', el_ella: 'recordó',    nosotros: 'recordamos',   ustedes: 'recordaron',  ellos: 'recordaron'  },
    futuro:    { yo: 'recordaré',  vos: 'recordarás', el_ella: 'recordará',  nosotros: 'recordaremos', ustedes: 'recordarán',  ellos: 'recordarán'  },
  },

  renunciar: {
    irregular: false,
    presente:  { yo: 'renuncio',    vos: 'renunciás',   el_ella: 'renuncia',    nosotros: 'renunciamos',   ustedes: 'renuncian',    ellos: 'renuncian'    },
    preterito: { yo: 'renuncié',    vos: 'renunciaste', el_ella: 'renunció',    nosotros: 'renunciamos',   ustedes: 'renunciaron',  ellos: 'renunciaron'  },
    futuro:    { yo: 'renunciaré',  vos: 'renunciarás', el_ella: 'renunciará',  nosotros: 'renunciaremos', ustedes: 'renunciarán',  ellos: 'renunciarán'  },
  },

  revisar: {
    irregular: false,
    presente:  { yo: 'reviso',    vos: 'revisás',   el_ella: 'revisa',    nosotros: 'revisamos',   ustedes: 'revisan',    ellos: 'revisan'    },
    preterito: { yo: 'revisé',    vos: 'revisaste', el_ella: 'revisó',    nosotros: 'revisamos',   ustedes: 'revisaron',  ellos: 'revisaron'  },
    futuro:    { yo: 'revisaré',  vos: 'revisarás', el_ella: 'revisará',  nosotros: 'revisaremos', ustedes: 'revisarán',  ellos: 'revisarán'  },
  },

  rumbear: {
    irregular: false,
    presente:  { yo: 'rumbeo',    vos: 'rumbeás',   el_ella: 'rumbea',    nosotros: 'rumbeamos',   ustedes: 'rumbean',    ellos: 'rumbean'    },
    preterito: { yo: 'rumbeé',    vos: 'rumbeaste', el_ella: 'rumbeó',    nosotros: 'rumbeamos',   ustedes: 'rumbearon',  ellos: 'rumbearon'  },
    futuro:    { yo: 'rumbearé',  vos: 'rumbearás', el_ella: 'rumbeará',  nosotros: 'rumbearemos', ustedes: 'rumbearán',  ellos: 'rumbearán'  },
  },

  // ── S ──────────────────────────────────────────────────────────────────────

  saltar: {
    irregular: false,
    presente:  { yo: 'salto',    vos: 'saltás',   el_ella: 'salta',    nosotros: 'saltamos',   ustedes: 'saltan',    ellos: 'saltan'    },
    preterito: { yo: 'salté',    vos: 'saltaste', el_ella: 'saltó',    nosotros: 'saltamos',   ustedes: 'saltaron',  ellos: 'saltaron'  },
    futuro:    { yo: 'saltaré',  vos: 'saltarás', el_ella: 'saltará',  nosotros: 'saltaremos', ustedes: 'saltarán',  ellos: 'saltarán'  },
  },

  subir: {
    irregular: false,
    presente:  { yo: 'subo',    vos: 'subís',   el_ella: 'sube',    nosotros: 'subimos',   ustedes: 'suben',    ellos: 'suben'    },
    preterito: { yo: 'subí',    vos: 'subiste', el_ella: 'subió',   nosotros: 'subimos',   ustedes: 'subieron', ellos: 'subieron' },
    futuro:    { yo: 'subiré',  vos: 'subirás', el_ella: 'subirá',  nosotros: 'subiremos', ustedes: 'subirán',  ellos: 'subirán'  },
  },

  // ── T ──────────────────────────────────────────────────────────────────────

  trabajar: {
    irregular: false,
    presente:  { yo: 'trabajo',    vos: 'trabajás',   el_ella: 'trabaja',    nosotros: 'trabajamos',   ustedes: 'trabajan',    ellos: 'trabajan'    },
    preterito: { yo: 'trabajé',    vos: 'trabajaste', el_ella: 'trabajó',    nosotros: 'trabajamos',   ustedes: 'trabajaron',  ellos: 'trabajaron'  },
    futuro:    { yo: 'trabajaré',  vos: 'trabajarás', el_ella: 'trabajará',  nosotros: 'trabajaremos', ustedes: 'trabajarán',  ellos: 'trabajarán'  },
  },

  // ── V ──────────────────────────────────────────────────────────────────────

  viajar: {
    irregular: false,
    presente:  { yo: 'viajo',    vos: 'viajás',   el_ella: 'viaja',    nosotros: 'viajamos',   ustedes: 'viajan',    ellos: 'viajan'    },
    preterito: { yo: 'viajé',    vos: 'viajaste', el_ella: 'viajó',    nosotros: 'viajamos',   ustedes: 'viajaron',  ellos: 'viajaron'  },
    futuro:    { yo: 'viajaré',  vos: 'viajarás', el_ella: 'viajará',  nosotros: 'viajaremos', ustedes: 'viajarán',  ellos: 'viajarán'  },
  },

  visitar: {
    irregular: false,
    presente:  { yo: 'visito',    vos: 'visitás',   el_ella: 'visita',    nosotros: 'visitamos',   ustedes: 'visitan',    ellos: 'visitan'    },
    preterito: { yo: 'visité',    vos: 'visitaste', el_ella: 'visitó',    nosotros: 'visitamos',   ustedes: 'visitaron',  ellos: 'visitaron'  },
    futuro:    { yo: 'visitaré',  vos: 'visitarás', el_ella: 'visitará',  nosotros: 'visitaremos', ustedes: 'visitarán',  ellos: 'visitarán'  },
  },

  volarse: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); vos stays regular',
    reflexive: true,
    presente:  { yo: 'me vuelo',   vos: 'te volás',   el_ella: 'se vuela',   nosotros: 'nos volamos',   ustedes: 'se vuelan',   ellos: 'se vuelan'   },
    preterito: { yo: 'me volé',    vos: 'te volaste', el_ella: 'se voló',    nosotros: 'nos volamos',   ustedes: 'se volaron',  ellos: 'se volaron'  },
    futuro:    { yo: 'me volaré',  vos: 'te volarás', el_ella: 'se volará',  nosotros: 'nos volaremos', ustedes: 'se volarán',  ellos: 'se volarán'  },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOP 100-150 CONVERSATIONAL VERBS — additions
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Core copulas & auxiliaries ─────────────────────────────────────────────

  ser: {
    irregular: true,
    irregular_note: 'completely irregular; pretérito same form as ir (fui, fue...)',
    presente:  { yo: 'soy',   vos: 'sos',    el_ella: 'es',    nosotros: 'somos',   ustedes: 'son',     ellos: 'son'     },
    preterito: { yo: 'fui',   vos: 'fuiste', el_ella: 'fue',   nosotros: 'fuimos',  ustedes: 'fueron',  ellos: 'fueron'  },
    futuro:    { yo: 'seré',  vos: 'serás',  el_ella: 'será',  nosotros: 'seremos', ustedes: 'serán',   ellos: 'serán'   },
  },

  estar: {
    irregular: true,
    irregular_note: 'irregular yo=estoy; irregular preterite stem: estuv-',
    presente:  { yo: 'estoy',   vos: 'estás',      el_ella: 'está',    nosotros: 'estamos',    ustedes: 'están',      ellos: 'están'      },
    preterito: { yo: 'estuve',  vos: 'estuviste',  el_ella: 'estuvo',  nosotros: 'estuvimos',  ustedes: 'estuvieron', ellos: 'estuvieron' },
    futuro:    { yo: 'estaré',  vos: 'estarás',    el_ella: 'estará',  nosotros: 'estaremos',  ustedes: 'estarán',    ellos: 'estarán'    },
  },

  tener: {
    irregular: true,
    irregular_note: 'yo=tengo; irregular preterite stem: tuv-; future stem: tendr-',
    presente:  { yo: 'tengo',   vos: 'tenés',    el_ella: 'tiene',   nosotros: 'tenemos',   ustedes: 'tienen',    ellos: 'tienen'    },
    preterito: { yo: 'tuve',    vos: 'tuviste',  el_ella: 'tuvo',    nosotros: 'tuvimos',   ustedes: 'tuvieron',  ellos: 'tuvieron'  },
    futuro:    { yo: 'tendré',  vos: 'tendrás',  el_ella: 'tendrá',  nosotros: 'tendremos', ustedes: 'tendrán',   ellos: 'tendrán'   },
  },

  hacer: {
    irregular: true,
    irregular_note: 'yo=hago; preterite hice/hizo; future stem: har-',
    presente:  { yo: 'hago',   vos: 'hacés',  el_ella: 'hace',   nosotros: 'hacemos',  ustedes: 'hacen',   ellos: 'hacen'   },
    preterito: { yo: 'hice',   vos: 'hiciste', el_ella: 'hizo',  nosotros: 'hicimos',  ustedes: 'hicieron', ellos: 'hicieron' },
    futuro:    { yo: 'haré',   vos: 'harás',  el_ella: 'hará',   nosotros: 'haremos',  ustedes: 'harán',   ellos: 'harán'   },
  },

  // ── Modal / high-frequency irregular ──────────────────────────────────────

  poder: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); vos stays regular; preterite pud-; future: podr-',
    presente:  { yo: 'puedo',   vos: 'podés',   el_ella: 'puede',   nosotros: 'podemos',   ustedes: 'pueden',   ellos: 'pueden'   },
    preterito: { yo: 'pude',    vos: 'pudiste', el_ella: 'pudo',    nosotros: 'pudimos',   ustedes: 'pudieron', ellos: 'pudieron' },
    futuro:    { yo: 'podré',   vos: 'podrás',  el_ella: 'podrá',   nosotros: 'podremos',  ustedes: 'podrán',   ellos: 'podrán'   },
  },

  querer: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); vos stays regular; preterite quis-; future: querr-',
    presente:  { yo: 'quiero',   vos: 'querés',   el_ella: 'quiere',   nosotros: 'queremos',   ustedes: 'quieren',   ellos: 'quieren'   },
    preterito: { yo: 'quise',    vos: 'quisiste', el_ella: 'quiso',    nosotros: 'quisimos',   ustedes: 'quisieron', ellos: 'quisieron' },
    futuro:    { yo: 'querré',   vos: 'querrás',  el_ella: 'querrá',   nosotros: 'querremos',  ustedes: 'querrán',   ellos: 'querrán'   },
  },

  decir: {
    irregular: true,
    irregular_note: 'yo=digo; e→i present; preterite dij-; future stem: dir-',
    presente:  { yo: 'digo',   vos: 'decís',   el_ella: 'dice',   nosotros: 'decimos',  ustedes: 'dicen',    ellos: 'dicen'    },
    preterito: { yo: 'dije',   vos: 'dijiste', el_ella: 'dijo',   nosotros: 'dijimos',  ustedes: 'dijeron',  ellos: 'dijeron'  },
    futuro:    { yo: 'diré',   vos: 'dirás',   el_ella: 'dirá',   nosotros: 'diremos',  ustedes: 'dirán',    ellos: 'dirán'    },
  },

  ir: {
    irregular: true,
    irregular_note: 'completely irregular; present uses voy/va; pretérito same form as ser (fui, fue...)',
    presente:  { yo: 'voy',   vos: 'vás',   el_ella: 'va',    nosotros: 'vamos',   ustedes: 'van',    ellos: 'van'    },
    preterito: { yo: 'fui',   vos: 'fuiste', el_ella: 'fue',  nosotros: 'fuimos',  ustedes: 'fueron', ellos: 'fueron' },
    futuro:    { yo: 'iré',   vos: 'irás',   el_ella: 'irá',   nosotros: 'iremos',  ustedes: 'irán',   ellos: 'irán'   },
  },

  ver: {
    irregular: true,
    irregular_note: 'yo=veo; pretérito vi/vio (no accent marks)',
    presente:  { yo: 'veo',   vos: 'vés',    el_ella: 've',    nosotros: 'vemos',   ustedes: 'ven',    ellos: 'ven'    },
    preterito: { yo: 'vi',    vos: 'viste',  el_ella: 'vio',   nosotros: 'vimos',   ustedes: 'vieron', ellos: 'vieron' },
    futuro:    { yo: 'veré',  vos: 'verás',  el_ella: 'verá',  nosotros: 'veremos', ustedes: 'verán',  ellos: 'verán'  },
  },

  dar: {
    irregular: true,
    irregular_note: 'yo=doy; pretérito di/dio (no accent marks)',
    presente:  { yo: 'doy',   vos: 'dás',    el_ella: 'da',    nosotros: 'damos',   ustedes: 'dan',    ellos: 'dan'    },
    preterito: { yo: 'di',    vos: 'diste',  el_ella: 'dio',   nosotros: 'dimos',   ustedes: 'dieron', ellos: 'dieron' },
    futuro:    { yo: 'daré',  vos: 'darás',  el_ella: 'dará',  nosotros: 'daremos', ustedes: 'darán',  ellos: 'darán'  },
  },

  saber: {
    irregular: true,
    irregular_note: 'yo=sé; irregular preterite stem: sup-; future stem: sabr-',
    presente:  { yo: 'sé',      vos: 'sabés',   el_ella: 'sabe',   nosotros: 'sabemos',   ustedes: 'saben',    ellos: 'saben'    },
    preterito: { yo: 'supe',    vos: 'supiste', el_ella: 'supo',   nosotros: 'supimos',   ustedes: 'supieron', ellos: 'supieron' },
    futuro:    { yo: 'sabré',   vos: 'sabrás',  el_ella: 'sabrá',  nosotros: 'sabremos',  ustedes: 'sabrán',   ellos: 'sabrán'   },
  },

  conocer: {
    irregular: true,
    irregular_note: 'yo=conozco (c→zc); rest is regular',
    presente:  { yo: 'conozco',    vos: 'conocés',    el_ella: 'conoce',    nosotros: 'conocemos',    ustedes: 'conocen',     ellos: 'conocen'     },
    preterito: { yo: 'conocí',     vos: 'conociste',  el_ella: 'conoció',   nosotros: 'conocimos',    ustedes: 'conocieron',  ellos: 'conocieron'  },
    futuro:    { yo: 'conoceré',   vos: 'conocerás',  el_ella: 'conocerá',  nosotros: 'conoceremos',  ustedes: 'conocerán',   ellos: 'conocerán'   },
  },

  venir: {
    irregular: true,
    irregular_note: 'yo=vengo; e→ie (él, ustedes/ellos); vos stays regular; preterite vin-; future: vendr-',
    presente:  { yo: 'vengo',   vos: 'venís',    el_ella: 'viene',   nosotros: 'venimos',   ustedes: 'vienen',   ellos: 'vienen'   },
    preterito: { yo: 'vine',    vos: 'viniste',  el_ella: 'vino',    nosotros: 'vinimos',   ustedes: 'vinieron', ellos: 'vinieron' },
    futuro:    { yo: 'vendré',  vos: 'vendrás',  el_ella: 'vendrá',  nosotros: 'vendremos', ustedes: 'vendrán',  ellos: 'vendrán'  },
  },

  salir: {
    irregular: true,
    irregular_note: 'yo=salgo; future stem: saldr-',
    presente:  { yo: 'salgo',   vos: 'salís',    el_ella: 'sale',    nosotros: 'salimos',   ustedes: 'salen',    ellos: 'salen'    },
    preterito: { yo: 'salí',    vos: 'saliste',  el_ella: 'salió',   nosotros: 'salimos',   ustedes: 'salieron', ellos: 'salieron' },
    futuro:    { yo: 'saldré',  vos: 'saldrás',  el_ella: 'saldrá',  nosotros: 'saldremos', ustedes: 'saldrán',  ellos: 'saldrán'  },
  },

  poner: {
    irregular: true,
    irregular_note: 'yo=pongo; irregular preterite stem: pus-; future stem: pondr-',
    presente:  { yo: 'pongo',   vos: 'ponés',    el_ella: 'pone',    nosotros: 'ponemos',   ustedes: 'ponen',    ellos: 'ponen'    },
    preterito: { yo: 'puse',    vos: 'pusiste',  el_ella: 'puso',    nosotros: 'pusimos',   ustedes: 'pusieron', ellos: 'pusieron' },
    futuro:    { yo: 'pondré',  vos: 'pondrás',  el_ella: 'pondrá',  nosotros: 'pondremos', ustedes: 'pondrán',  ellos: 'pondrán'  },
  },

  traer: {
    irregular: true,
    irregular_note: 'yo=traigo; irregular preterite stem: traj-',
    presente:  { yo: 'traigo',   vos: 'traés',    el_ella: 'trae',    nosotros: 'traemos',   ustedes: 'traen',    ellos: 'traen'    },
    preterito: { yo: 'traje',    vos: 'trajiste', el_ella: 'trajo',   nosotros: 'trajimos',  ustedes: 'trajeron', ellos: 'trajeron' },
    futuro:    { yo: 'traeré',   vos: 'traerás',  el_ella: 'traerá',  nosotros: 'traeremos', ustedes: 'traerán',  ellos: 'traerán'  },
  },

  // ── Stem-changing ──────────────────────────────────────────────────────────

  contar: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'cuento',   vos: 'contás',   el_ella: 'cuenta',   nosotros: 'contamos',   ustedes: 'cuentan',   ellos: 'cuentan'   },
    preterito: { yo: 'conté',    vos: 'contaste', el_ella: 'contó',    nosotros: 'contamos',   ustedes: 'contaron',  ellos: 'contaron'  },
    futuro:    { yo: 'contaré',  vos: 'contarás', el_ella: 'contará',  nosotros: 'contaremos', ustedes: 'contarán',  ellos: 'contarán'  },
  },

  dormir: {
    irregular: true,
    irregular_note: 'stem change o→ue in present (yo, él, ustedes/ellos); o→u in preterite (él, ellos); vos stays regular',
    presente:  { yo: 'duermo',   vos: 'dormís',   el_ella: 'duerme',   nosotros: 'dormimos',   ustedes: 'duermen',   ellos: 'duermen'   },
    preterito: { yo: 'dormí',    vos: 'dormiste', el_ella: 'durmió',   nosotros: 'dormimos',   ustedes: 'durmieron', ellos: 'durmieron' },
    futuro:    { yo: 'dormiré',  vos: 'dormirás', el_ella: 'dormirá',  nosotros: 'dormiremos', ustedes: 'dormirán',  ellos: 'dormirán'  },
  },

  empezar: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); vos stays regular; yo preterite: empecé',
    presente:  { yo: 'empiezo',   vos: 'empezás',   el_ella: 'empieza',   nosotros: 'empezamos',   ustedes: 'empiezan',   ellos: 'empiezan'   },
    preterito: { yo: 'empecé',    vos: 'empezaste', el_ella: 'empezó',    nosotros: 'empezamos',   ustedes: 'empezaron',  ellos: 'empezaron'  },
    futuro:    { yo: 'empezaré',  vos: 'empezarás', el_ella: 'empezará',  nosotros: 'empezaremos', ustedes: 'empezarán',  ellos: 'empezarán'  },
  },

  encontrar: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'encuentro',   vos: 'encontrás',   el_ella: 'encuentra',   nosotros: 'encontramos',   ustedes: 'encuentran',   ellos: 'encuentran'   },
    preterito: { yo: 'encontré',    vos: 'encontraste', el_ella: 'encontró',    nosotros: 'encontramos',   ustedes: 'encontraron',  ellos: 'encontraron'  },
    futuro:    { yo: 'encontraré',  vos: 'encontrarás', el_ella: 'encontrará',  nosotros: 'encontraremos', ustedes: 'encontrarán',  ellos: 'encontrarán'  },
  },

  entender: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'entiendo',   vos: 'entendés',   el_ella: 'entiende',   nosotros: 'entendemos',   ustedes: 'entienden',   ellos: 'entienden'   },
    preterito: { yo: 'entendí',    vos: 'entendiste', el_ella: 'entendió',   nosotros: 'entendimos',   ustedes: 'entendieron', ellos: 'entendieron' },
    futuro:    { yo: 'entenderé',  vos: 'entenderás', el_ella: 'entenderá',  nosotros: 'entenderemos', ustedes: 'entenderán',  ellos: 'entenderán'  },
  },

  pedir: {
    irregular: true,
    irregular_note: 'stem change e→i in present (yo, él, ustedes/ellos); e→i in preterite (él, ellos); vos stays regular',
    presente:  { yo: 'pido',    vos: 'pedís',    el_ella: 'pide',    nosotros: 'pedimos',   ustedes: 'piden',    ellos: 'piden'    },
    preterito: { yo: 'pedí',    vos: 'pediste',  el_ella: 'pidió',   nosotros: 'pedimos',   ustedes: 'pidieron', ellos: 'pidieron' },
    futuro:    { yo: 'pediré',  vos: 'pedirás',  el_ella: 'pedirá',  nosotros: 'pediremos', ustedes: 'pedirán',  ellos: 'pedirán'  },
  },

  pensar: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'pienso',   vos: 'pensás',   el_ella: 'piensa',   nosotros: 'pensamos',   ustedes: 'piensan',   ellos: 'piensan'   },
    preterito: { yo: 'pensé',    vos: 'pensaste', el_ella: 'pensó',    nosotros: 'pensamos',   ustedes: 'pensaron',  ellos: 'pensaron'  },
    futuro:    { yo: 'pensaré',  vos: 'pensarás', el_ella: 'pensará',  nosotros: 'pensaremos', ustedes: 'pensarán',  ellos: 'pensarán'  },
  },

  perder: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'pierdo',   vos: 'perdés',   el_ella: 'pierde',   nosotros: 'perdemos',   ustedes: 'pierden',   ellos: 'pierden'   },
    preterito: { yo: 'perdí',    vos: 'perdiste', el_ella: 'perdió',   nosotros: 'perdimos',   ustedes: 'perdieron', ellos: 'perdieron' },
    futuro:    { yo: 'perderé',  vos: 'perderás', el_ella: 'perderá',  nosotros: 'perderemos', ustedes: 'perderán',  ellos: 'perderán'  },
  },

  probar: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'pruebo',   vos: 'probás',   el_ella: 'prueba',   nosotros: 'probamos',   ustedes: 'prueban',   ellos: 'prueban'   },
    preterito: { yo: 'probé',    vos: 'probaste', el_ella: 'probó',    nosotros: 'probamos',   ustedes: 'probaron',  ellos: 'probaron'  },
    futuro:    { yo: 'probaré',  vos: 'probarás', el_ella: 'probará',  nosotros: 'probaremos', ustedes: 'probarán',  ellos: 'probarán'  },
  },

  sentir: {
    irregular: true,
    irregular_note: 'stem change e→ie in present (yo, él, ustedes/ellos); e→i in preterite (él, ellos); vos stays regular',
    presente:  { yo: 'siento',   vos: 'sentís',   el_ella: 'siente',   nosotros: 'sentimos',   ustedes: 'sienten',   ellos: 'sienten'   },
    preterito: { yo: 'sentí',    vos: 'sentiste', el_ella: 'sintió',   nosotros: 'sentimos',   ustedes: 'sintieron', ellos: 'sintieron' },
    futuro:    { yo: 'sentiré',  vos: 'sentirás', el_ella: 'sentirá',  nosotros: 'sentiremos', ustedes: 'sentirán',  ellos: 'sentirán'  },
  },

  volver: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); vos stays regular',
    presente:  { yo: 'vuelvo',   vos: 'volvés',   el_ella: 'vuelve',   nosotros: 'volvemos',   ustedes: 'vuelven',   ellos: 'vuelven'   },
    preterito: { yo: 'volví',    vos: 'volviste', el_ella: 'volvió',   nosotros: 'volvimos',   ustedes: 'volvieron', ellos: 'volvieron' },
    futuro:    { yo: 'volveré',  vos: 'volverás', el_ella: 'volverá',  nosotros: 'volveremos', ustedes: 'volverán',  ellos: 'volverán'  },
  },

  // ── Reflexive additions ────────────────────────────────────────────────────

  acostarse: {
    irregular: true,
    irregular_note: 'stem change o→ue (yo, él, ustedes/ellos); vos stays regular; reflexive verb',
    reflexive: true,
    presente:  { yo: 'me acuesto',   vos: 'te acostás',   el_ella: 'se acuesta',   nosotros: 'nos acostamos',   ustedes: 'se acuestan',   ellos: 'se acuestan'   },
    preterito: { yo: 'me acosté',    vos: 'te acostaste', el_ella: 'se acostó',    nosotros: 'nos acostamos',   ustedes: 'se acostaron',  ellos: 'se acostaron'  },
    futuro:    { yo: 'me acostaré',  vos: 'te acostarás', el_ella: 'se acostará',  nosotros: 'nos acostaremos', ustedes: 'se acostarán',  ellos: 'se acostarán'  },
  },

  levantarse: {
    irregular: false,
    reflexive: true,
    presente:  { yo: 'me levanto',   vos: 'te levantás',   el_ella: 'se levanta',   nosotros: 'nos levantamos',   ustedes: 'se levantan',   ellos: 'se levantan'   },
    preterito: { yo: 'me levanté',   vos: 'te levantaste', el_ella: 'se levantó',   nosotros: 'nos levantamos',   ustedes: 'se levantaron', ellos: 'se levantaron' },
    futuro:    { yo: 'me levantaré', vos: 'te levantarás', el_ella: 'se levantará', nosotros: 'nos levantaremos', ustedes: 'se levantarán', ellos: 'se levantarán' },
  },

  sentarse: {
    irregular: true,
    irregular_note: 'stem change e→ie (yo, él, ustedes/ellos); vos stays regular; reflexive verb',
    reflexive: true,
    presente:  { yo: 'me siento',   vos: 'te sentás',   el_ella: 'se sienta',   nosotros: 'nos sentamos',   ustedes: 'se sientan',   ellos: 'se sientan'   },
    preterito: { yo: 'me senté',    vos: 'te sentaste', el_ella: 'se sentó',    nosotros: 'nos sentamos',   ustedes: 'se sentaron',  ellos: 'se sentaron'  },
    futuro:    { yo: 'me sentaré',  vos: 'te sentarás', el_ella: 'se sentará',  nosotros: 'nos sentaremos', ustedes: 'se sentarán',  ellos: 'se sentarán'  },
  },

  vestirse: {
    irregular: true,
    irregular_note: 'stem change e→i in present (yo, él, ustedes/ellos); e→i in preterite (él, ellos); vos stays regular; reflexive verb',
    reflexive: true,
    presente:  { yo: 'me visto',   vos: 'te vestís',   el_ella: 'se viste',   nosotros: 'nos vestimos',   ustedes: 'se visten',   ellos: 'se visten'   },
    preterito: { yo: 'me vestí',   vos: 'te vestiste', el_ella: 'se vistió',  nosotros: 'nos vestimos',   ustedes: 'se vistieron', ellos: 'se vistieron' },
    futuro:    { yo: 'me vestiré', vos: 'te vestirás', el_ella: 'se vestirá', nosotros: 'nos vestiremos', ustedes: 'se vestirán',  ellos: 'se vestirán'  },
  },

  // ── Regular -ar additions ──────────────────────────────────────────────────

  bajar: {
    irregular: false,
    presente:  { yo: 'bajo',    vos: 'bajás',   el_ella: 'baja',    nosotros: 'bajamos',   ustedes: 'bajan',    ellos: 'bajan'    },
    preterito: { yo: 'bajé',    vos: 'bajaste', el_ella: 'bajó',    nosotros: 'bajamos',   ustedes: 'bajaron',  ellos: 'bajaron'  },
    futuro:    { yo: 'bajaré',  vos: 'bajarás', el_ella: 'bajará',  nosotros: 'bajaremos', ustedes: 'bajarán',  ellos: 'bajarán'  },
  },

  cambiar: {
    irregular: false,
    presente:  { yo: 'cambio',    vos: 'cambiás',   el_ella: 'cambia',    nosotros: 'cambiamos',   ustedes: 'cambian',    ellos: 'cambian'    },
    preterito: { yo: 'cambié',    vos: 'cambiaste', el_ella: 'cambió',    nosotros: 'cambiamos',   ustedes: 'cambiaron',  ellos: 'cambiaron'  },
    futuro:    { yo: 'cambiaré',  vos: 'cambiarás', el_ella: 'cambiará',  nosotros: 'cambiaremos', ustedes: 'cambiarán',  ellos: 'cambiarán'  },
  },

  dejar: {
    irregular: false,
    presente:  { yo: 'dejo',    vos: 'dejás',   el_ella: 'deja',    nosotros: 'dejamos',   ustedes: 'dejan',    ellos: 'dejan'    },
    preterito: { yo: 'dejé',    vos: 'dejaste', el_ella: 'dejó',    nosotros: 'dejamos',   ustedes: 'dejaron',  ellos: 'dejaron'  },
    futuro:    { yo: 'dejaré',  vos: 'dejarás', el_ella: 'dejará',  nosotros: 'dejaremos', ustedes: 'dejarán',  ellos: 'dejarán'  },
  },

  entrar: {
    irregular: false,
    presente:  { yo: 'entro',    vos: 'entrás',   el_ella: 'entra',    nosotros: 'entramos',   ustedes: 'entran',    ellos: 'entran'    },
    preterito: { yo: 'entré',    vos: 'entraste', el_ella: 'entró',    nosotros: 'entramos',   ustedes: 'entraron',  ellos: 'entraron'  },
    futuro:    { yo: 'entraré',  vos: 'entrarás', el_ella: 'entrará',  nosotros: 'entraremos', ustedes: 'entrarán',  ellos: 'entrarán'  },
  },

  esperar: {
    irregular: false,
    presente:  { yo: 'espero',    vos: 'esperás',   el_ella: 'espera',    nosotros: 'esperamos',   ustedes: 'esperan',    ellos: 'esperan'    },
    preterito: { yo: 'esperé',    vos: 'esperaste', el_ella: 'esperó',    nosotros: 'esperamos',   ustedes: 'esperaron',  ellos: 'esperaron'  },
    futuro:    { yo: 'esperaré',  vos: 'esperarás', el_ella: 'esperará',  nosotros: 'esperaremos', ustedes: 'esperarán',  ellos: 'esperarán'  },
  },

  explicar: {
    irregular: true,
    irregular_note: 'yo preterite spelling change: expliqué',
    presente:  { yo: 'explico',    vos: 'explicás',   el_ella: 'explica',    nosotros: 'explicamos',   ustedes: 'explican',    ellos: 'explican'    },
    preterito: { yo: 'expliqué',   vos: 'explicaste', el_ella: 'explicó',    nosotros: 'explicamos',   ustedes: 'explicaron',  ellos: 'explicaron'  },
    futuro:    { yo: 'explicaré',  vos: 'explicarás', el_ella: 'explicará',  nosotros: 'explicaremos', ustedes: 'explicarán',  ellos: 'explicarán'  },
  },

  ganar: {
    irregular: false,
    presente:  { yo: 'gano',    vos: 'ganás',   el_ella: 'gana',    nosotros: 'ganamos',   ustedes: 'ganan',    ellos: 'ganan'    },
    preterito: { yo: 'gané',    vos: 'ganaste', el_ella: 'ganó',    nosotros: 'ganamos',   ustedes: 'ganaron',  ellos: 'ganaron'  },
    futuro:    { yo: 'ganaré',  vos: 'ganarás', el_ella: 'ganará',  nosotros: 'ganaremos', ustedes: 'ganarán',  ellos: 'ganarán'  },
  },

  lavar: {
    irregular: false,
    presente:  { yo: 'lavo',    vos: 'lavás',   el_ella: 'lava',    nosotros: 'lavamos',   ustedes: 'lavan',    ellos: 'lavan'    },
    preterito: { yo: 'lavé',    vos: 'lavaste', el_ella: 'lavó',    nosotros: 'lavamos',   ustedes: 'lavaron',  ellos: 'lavaron'  },
    futuro:    { yo: 'lavaré',  vos: 'lavarás', el_ella: 'lavará',  nosotros: 'lavaremos', ustedes: 'lavarán',  ellos: 'lavarán'  },
  },

  llegar: {
    irregular: true,
    irregular_note: 'yo preterite spelling change: llegué',
    presente:  { yo: 'llego',    vos: 'llegás',   el_ella: 'llega',    nosotros: 'llegamos',   ustedes: 'llegan',    ellos: 'llegan'    },
    preterito: { yo: 'llegué',   vos: 'llegaste', el_ella: 'llegó',    nosotros: 'llegamos',   ustedes: 'llegaron',  ellos: 'llegaron'  },
    futuro:    { yo: 'llegaré',  vos: 'llegarás', el_ella: 'llegará',  nosotros: 'llegaremos', ustedes: 'llegarán',  ellos: 'llegarán'  },
  },

  llevar: {
    irregular: false,
    presente:  { yo: 'llevo',    vos: 'llevás',   el_ella: 'lleva',    nosotros: 'llevamos',   ustedes: 'llevan',    ellos: 'llevan'    },
    preterito: { yo: 'llevé',    vos: 'llevaste', el_ella: 'llevó',    nosotros: 'llevamos',   ustedes: 'llevaron',  ellos: 'llevaron'  },
    futuro:    { yo: 'llevaré',  vos: 'llevarás', el_ella: 'llevará',  nosotros: 'llevaremos', ustedes: 'llevarán',  ellos: 'llevarán'  },
  },

  llorar: {
    irregular: false,
    presente:  { yo: 'lloro',    vos: 'llorás',   el_ella: 'llora',    nosotros: 'lloramos',   ustedes: 'lloran',    ellos: 'lloran'    },
    preterito: { yo: 'lloré',    vos: 'lloraste', el_ella: 'lloró',    nosotros: 'lloramos',   ustedes: 'lloraron',  ellos: 'lloraron'  },
    futuro:    { yo: 'lloraré',  vos: 'llorarás', el_ella: 'llorará',  nosotros: 'lloraremos', ustedes: 'llorarán',  ellos: 'llorarán'  },
  },

  llamar: {
    irregular: false,
    presente:  { yo: 'llamo',    vos: 'llamás',   el_ella: 'llama',    nosotros: 'llamamos',   ustedes: 'llaman',    ellos: 'llaman'    },
    preterito: { yo: 'llamé',    vos: 'llamaste', el_ella: 'llamó',    nosotros: 'llamamos',   ustedes: 'llamaron',  ellos: 'llamaron'  },
    futuro:    { yo: 'llamaré',  vos: 'llamarás', el_ella: 'llamará',  nosotros: 'llamaremos', ustedes: 'llamarán',  ellos: 'llamarán'  },
  },

  necesitar: {
    irregular: false,
    presente:  { yo: 'necesito',    vos: 'necesitás',   el_ella: 'necesita',    nosotros: 'necesitamos',   ustedes: 'necesitan',    ellos: 'necesitan'    },
    preterito: { yo: 'necesité',    vos: 'necesitaste', el_ella: 'necesitó',    nosotros: 'necesitamos',   ustedes: 'necesitaron',  ellos: 'necesitaron'  },
    futuro:    { yo: 'necesitaré',  vos: 'necesitarás', el_ella: 'necesitará',  nosotros: 'necesitaremos', ustedes: 'necesitarán',  ellos: 'necesitarán'  },
  },

  pagar: {
    irregular: true,
    irregular_note: 'yo preterite spelling change: pagué',
    presente:  { yo: 'pago',    vos: 'pagás',   el_ella: 'paga',    nosotros: 'pagamos',   ustedes: 'pagan',    ellos: 'pagan'    },
    preterito: { yo: 'pagué',   vos: 'pagaste', el_ella: 'pagó',    nosotros: 'pagamos',   ustedes: 'pagaron',  ellos: 'pagaron'  },
    futuro:    { yo: 'pagaré',  vos: 'pagarás', el_ella: 'pagará',  nosotros: 'pagaremos', ustedes: 'pagarán',  ellos: 'pagarán'  },
  },

  pasar: {
    irregular: false,
    presente:  { yo: 'paso',    vos: 'pasás',   el_ella: 'pasa',    nosotros: 'pasamos',   ustedes: 'pasan',    ellos: 'pasan'    },
    preterito: { yo: 'pasé',    vos: 'pasaste', el_ella: 'pasó',    nosotros: 'pasamos',   ustedes: 'pasaron',  ellos: 'pasaron'  },
    futuro:    { yo: 'pasaré',  vos: 'pasarás', el_ella: 'pasará',  nosotros: 'pasaremos', ustedes: 'pasarán',  ellos: 'pasarán'  },
  },

  preguntar: {
    irregular: false,
    presente:  { yo: 'pregunto',    vos: 'preguntás',   el_ella: 'pregunta',    nosotros: 'preguntamos',   ustedes: 'preguntan',    ellos: 'preguntan'    },
    preterito: { yo: 'pregunté',    vos: 'preguntaste', el_ella: 'preguntó',    nosotros: 'preguntamos',   ustedes: 'preguntaron',  ellos: 'preguntaron'  },
    futuro:    { yo: 'preguntaré',  vos: 'preguntarás', el_ella: 'preguntará',  nosotros: 'preguntaremos', ustedes: 'preguntarán',  ellos: 'preguntarán'  },
  },

  quedar: {
    irregular: false,
    presente:  { yo: 'quedo',    vos: 'quedás',   el_ella: 'queda',    nosotros: 'quedamos',   ustedes: 'quedan',    ellos: 'quedan'    },
    preterito: { yo: 'quedé',    vos: 'quedaste', el_ella: 'quedó',    nosotros: 'quedamos',   ustedes: 'quedaron',  ellos: 'quedaron'  },
    futuro:    { yo: 'quedaré',  vos: 'quedarás', el_ella: 'quedará',  nosotros: 'quedaremos', ustedes: 'quedarán',  ellos: 'quedarán'  },
  },

  sacar: {
    irregular: true,
    irregular_note: 'yo preterite spelling change: saqué',
    presente:  { yo: 'saco',    vos: 'sacás',   el_ella: 'saca',    nosotros: 'sacamos',   ustedes: 'sacan',    ellos: 'sacan'    },
    preterito: { yo: 'saqué',   vos: 'sacaste', el_ella: 'sacó',    nosotros: 'sacamos',   ustedes: 'sacaron',  ellos: 'sacaron'  },
    futuro:    { yo: 'sacaré',  vos: 'sacarás', el_ella: 'sacará',  nosotros: 'sacaremos', ustedes: 'sacarán',  ellos: 'sacarán'  },
  },

  terminar: {
    irregular: false,
    presente:  { yo: 'termino',    vos: 'terminás',   el_ella: 'termina',    nosotros: 'terminamos',   ustedes: 'terminan',    ellos: 'terminan'    },
    preterito: { yo: 'terminé',    vos: 'terminaste', el_ella: 'terminó',    nosotros: 'terminamos',   ustedes: 'terminaron',  ellos: 'terminaron'  },
    futuro:    { yo: 'terminaré',  vos: 'terminarás', el_ella: 'terminará',  nosotros: 'terminaremos', ustedes: 'terminarán',  ellos: 'terminarán'  },
  },

  tocar: {
    irregular: true,
    irregular_note: 'yo preterite spelling change: toqué',
    presente:  { yo: 'toco',    vos: 'tocás',   el_ella: 'toca',    nosotros: 'tocamos',   ustedes: 'tocan',    ellos: 'tocan'    },
    preterito: { yo: 'toqué',   vos: 'tocaste', el_ella: 'tocó',    nosotros: 'tocamos',   ustedes: 'tocaron',  ellos: 'tocaron'  },
    futuro:    { yo: 'tocaré',  vos: 'tocarás', el_ella: 'tocará',  nosotros: 'tocaremos', ustedes: 'tocarán',  ellos: 'tocarán'  },
  },

  tomar: {
    irregular: false,
    presente:  { yo: 'tomo',    vos: 'tomás',   el_ella: 'toma',    nosotros: 'tomamos',   ustedes: 'toman',    ellos: 'toman'    },
    preterito: { yo: 'tomé',    vos: 'tomaste', el_ella: 'tomó',    nosotros: 'tomamos',   ustedes: 'tomaron',  ellos: 'tomaron'  },
    futuro:    { yo: 'tomaré',  vos: 'tomarás', el_ella: 'tomará',  nosotros: 'tomaremos', ustedes: 'tomarán',  ellos: 'tomarán'  },
  },

  usar: {
    irregular: false,
    presente:  { yo: 'uso',    vos: 'usás',   el_ella: 'usa',    nosotros: 'usamos',   ustedes: 'usan',    ellos: 'usan'    },
    preterito: { yo: 'usé',    vos: 'usaste', el_ella: 'usó',    nosotros: 'usamos',   ustedes: 'usaron',  ellos: 'usaron'  },
    futuro:    { yo: 'usaré',  vos: 'usarás', el_ella: 'usará',  nosotros: 'usaremos', ustedes: 'usarán',  ellos: 'usarán'  },
  },

  // ── Regular -er/-ir additions ──────────────────────────────────────────────

  beber: {
    irregular: false,
    presente:  { yo: 'bebo',    vos: 'bebés',   el_ella: 'bebe',    nosotros: 'bebemos',   ustedes: 'beben',    ellos: 'beben'    },
    preterito: { yo: 'bebí',    vos: 'bebiste', el_ella: 'bebió',   nosotros: 'bebimos',   ustedes: 'bebieron', ellos: 'bebieron' },
    futuro:    { yo: 'beberé',  vos: 'beberás', el_ella: 'beberá',  nosotros: 'beberemos', ustedes: 'beberán',  ellos: 'beberán'  },
  },

  comer: {
    irregular: false,
    presente:  { yo: 'como',    vos: 'comés',   el_ella: 'come',    nosotros: 'comemos',   ustedes: 'comen',    ellos: 'comen'    },
    preterito: { yo: 'comí',    vos: 'comiste', el_ella: 'comió',   nosotros: 'comimos',   ustedes: 'comieron', ellos: 'comieron' },
    futuro:    { yo: 'comeré',  vos: 'comerás', el_ella: 'comerá',  nosotros: 'comeremos', ustedes: 'comerán',  ellos: 'comerán'  },
  },

  creer: {
    irregular: true,
    irregular_note: 'irregular preterite: creyó, creyeron (i→y)',
    presente:  { yo: 'creo',    vos: 'creés',   el_ella: 'cree',    nosotros: 'creemos',   ustedes: 'creen',    ellos: 'creen'    },
    preterito: { yo: 'creí',    vos: 'creíste', el_ella: 'creyó',   nosotros: 'creímos',   ustedes: 'creyeron', ellos: 'creyeron' },
    futuro:    { yo: 'creeré',  vos: 'creerás', el_ella: 'creerá',  nosotros: 'creeremos', ustedes: 'creerán',  ellos: 'creerán'  },
  },

  recibir: {
    irregular: false,
    presente:  { yo: 'recibo',    vos: 'recibís',   el_ella: 'recibe',    nosotros: 'recibimos',   ustedes: 'reciben',    ellos: 'reciben'    },
    preterito: { yo: 'recibí',    vos: 'recibiste', el_ella: 'recibió',   nosotros: 'recibimos',   ustedes: 'recibieron', ellos: 'recibieron' },
    futuro:    { yo: 'recibiré',  vos: 'recibirás', el_ella: 'recibirá',  nosotros: 'recibiremos', ustedes: 'recibirán',  ellos: 'recibirán'  },
  },

  reír: {
    irregular: true,
    irregular_note: 'highly irregular present (río, ríe, ríen); e→i stem change; vos stays regular',
    presente:  { yo: 'río',    vos: 'reís',   el_ella: 'ríe',    nosotros: 'reímos',   ustedes: 'ríen',    ellos: 'ríen'    },
    preterito: { yo: 'reí',    vos: 'reíste', el_ella: 'rió',    nosotros: 'reímos',   ustedes: 'rieron',  ellos: 'rieron'  },
    futuro:    { yo: 'reiré',  vos: 'reirás', el_ella: 'reirá',  nosotros: 'reiremos', ustedes: 'reirán',  ellos: 'reirán'  },
  },

  vender: {
    irregular: false,
    presente:  { yo: 'vendo',    vos: 'vendés',   el_ella: 'vende',    nosotros: 'vendemos',   ustedes: 'venden',    ellos: 'venden'    },
    preterito: { yo: 'vendí',    vos: 'vendiste', el_ella: 'vendió',   nosotros: 'vendimos',   ustedes: 'vendieron', ellos: 'vendieron' },
    futuro:    { yo: 'venderé',  vos: 'venderás', el_ella: 'venderá',  nosotros: 'venderemos', ustedes: 'venderán',  ellos: 'venderán'  },
  },

  vivir: {
    irregular: false,
    presente:  { yo: 'vivo',    vos: 'vivís',   el_ella: 'vive',    nosotros: 'vivimos',   ustedes: 'viven',    ellos: 'viven'    },
    preterito: { yo: 'viví',    vos: 'viviste', el_ella: 'vivió',   nosotros: 'vivimos',   ustedes: 'vivieron', ellos: 'vivieron' },
    futuro:    { yo: 'viviré',  vos: 'vivirás', el_ella: 'vivirá',  nosotros: 'viviremos', ustedes: 'vivirán',  ellos: 'vivirán'  },
  },
};
