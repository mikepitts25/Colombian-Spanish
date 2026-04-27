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
};
