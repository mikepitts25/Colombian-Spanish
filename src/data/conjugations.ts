// Colombian Spanish verb conjugations
// Uses vos (not tú) and excludes vosotros - authentic Colombian conventions
// Pretérito simple for past tense (not compound perfect)

export type ConjugationTense = {
  yo: string;
  vos: string;      // Colombian informal (replaces tú)
  el: string;       // él/ella/usted
  nosotros: string;
  ustedes: string;  // ellos/ellas/ustedes (no vosotros in Colombia)
};

export interface ConjugationTable {
  presente: ConjugationTense;
  preterito: ConjugationTense;  // pretérito simple
  futuro: ConjugationTense;     // simple future
  irregular?: boolean;
  irregularNote?: string;       // e.g., "stem change o→ue (yo, él, ustedes); vos stays regular"
}

// Helper to generate regular -ar conjugations
function generateArConjugation(stem: string): ConjugationTense {
  return {
    yo: `${stem}o`,
    vos: `${stem}ás`,
    el: `${stem}a`,
    nosotros: `${stem}amos`,
    ustedes: `${stem}an`,
  };
}

// Helper to generate regular -er conjugations
function generateErConjugation(stem: string): ConjugationTense {
  return {
    yo: `${stem}o`,
    vos: `${stem}és`,
    el: `${stem}e`,
    nosotros: `${stem}emos`,
    ustedes: `${stem}en`,
  };
}

// Helper to generate regular -ir conjugations
function generateIrConjugation(stem: string): ConjugationTense {
  return {
    yo: `${stem}o`,
    vos: `${stem}ís`,
    el: `${stem}e`,
    nosotros: `${stem}imos`,
    ustedes: `${stem}en`,
  };
}

// Main conjugation database
export const CONJUGATIONS: Record<string, ConjugationTable> = {
  // === REGULAR -AR VERBS ===
  hablar: {
    presente: generateArConjugation('habl'),
    preterito: { yo: 'hablé', vos: 'hablaste', el: 'habló', nosotros: 'hablamos', ustedes: 'hablaron' },
    futuro: generateArConjugation('hablar'),
  },
  saltar: {
    presente: generateArConjugation('salt'),
    preterito: { yo: 'salté', vos: 'saltaste', el: 'saltó', nosotros: 'saltamos', ustedes: 'saltaron' },
    futuro: generateArConjugation('saltar'),
  },
  bailar: {
    presente: generateArConjugation('bail'),
    preterito: { yo: 'bailé', vos: 'bailaste', el: 'bailó', nosotros: 'bailamos', ustedes: 'bailaron' },
    futuro: generateArConjugation('bailar'),
  },
  cantar: {
    presente: generateArConjugation('cant'),
    preterito: { yo: 'canté', vos: 'cantaste', el: 'cantó', nosotros: 'cantamos', ustedes: 'cantaron' },
    futuro: generateArConjugation('cantar'),
  },
  dibujar: {
    presente: generateArConjugation('dibuj'),
    preterito: { yo: 'dibujé', vos: 'dibujaste', el: 'dibujó', nosotros: 'dibujamos', ustedes: 'dibujaron' },
    futuro: generateArConjugation('dibujar'),
  },
  ayudar: {
    presente: generateArConjugation('ayud'),
    preterito: { yo: 'ayudé', vos: 'ayudaste', el: 'ayudó', nosotros: 'ayudamos', ustedes: 'ayudaron' },
    futuro: generateArConjugation('ayudar'),
  },
  buscar: {
    presente: { yo: 'busco', vos: 'buscás', el: 'busca', nosotros: 'buscamos', ustedes: 'buscan' },
    preterito: { yo: 'busqué', vos: 'buscaste', el: 'buscó', nosotros: 'buscamos', ustedes: 'buscaron' },
    futuro: generateArConjugation('buscar'),
  },
  olvidar: {
    presente: generateArConjugation('olvid'),
    preterito: { yo: 'olvidé', vos: 'olvidaste', el: 'olvidó', nosotros: 'olvidamos', ustedes: 'olvidaron' },
    futuro: generateArConjugation('olvidar'),
  },
  visitar: {
    presente: generateArConjugation('visit'),
    preterito: { yo: 'visité', vos: 'visitaste', el: 'visitó', nosotros: 'visitamos', ustedes: 'visitaron' },
    futuro: generateArConjugation('visitar'),
  },
  mirar: {
    presente: generateArConjugation('mir'),
    preterito: { yo: 'miré', vos: 'miraste', el: 'miró', nosotros: 'miramos', ustedes: 'miraron' },
    futuro: generateArConjugation('mirar'),
  },
  pintar: {
    presente: generateArConjugation('pint'),
    preterito: { yo: 'pinté', vos: 'pintaste', el: 'pintó', nosotros: 'pintamos', ustedes: 'pintaron' },
    futuro: generateArConjugation('pintar'),
  },
  trabajar: {
    presente: generateArConjugation('trabaj'),
    preterito: { yo: 'trabajé', vos: 'trabajaste', el: 'trabajó', nosotros: 'trabajamos', ustedes: 'trabajaron' },
    futuro: generateArConjugation('trabajar'),
  },
  estudiar: {
    presente: generateArConjugation('estudi'),
    preterito: { yo: 'estudié', vos: 'estudiaste', el: 'estudió', nosotros: 'estudiamos', ustedes: 'estudiaron' },
    futuro: generateArConjugation('estudiar'),
  },
  caminar: {
    presente: generateArConjugation('camin'),
    preterito: { yo: 'caminé', vos: 'caminaste', el: 'caminó', nosotros: 'caminamos', ustedes: 'caminaron' },
    futuro: generateArConjugation('caminar'),
  },
  llamar: {
    presente: generateArConjugation('llam'),
    preterito: { yo: 'llamé', vos: 'llamaste', el: 'llamó', nosotros: 'llamamos', ustedes: 'llamaron' },
    futuro: generateArConjugation('llamar'),
  },
  esperar: {
    presente: generateArConjugation('esper'),
    preterito: { yo: 'esperé', vos: 'esperaste', el: 'esperó', nosotros: 'esperamos', ustedes: 'esperaron' },
    futuro: generateArConjugation('esperar'),
  },
  tomar: {
    presente: generateArConjugation('tom'),
    preterito: { yo: 'tomé', vos: 'tomaste', el: 'tomó', nosotros: 'tomamos', ustedes: 'tomaron' },
    futuro: generateArConjugation('tomar'),
  },
  nadar: {
    presente: generateArConjugation('nad'),
    preterito: { yo: 'nadé', vos: 'nadaste', el: 'nadó', nosotros: 'nadamos', ustedes: 'nadaron' },
    futuro: generateArConjugation('nadar'),
  },
  lavar: {
    presente: generateArConjugation('lav'),
    preterito: { yo: 'lavé', vos: 'lavaste', el: 'lavó', nosotros: 'lavamos', ustedes: 'lavaron' },
    futuro: generateArConjugation('lavar'),
  },
  cocinar: {
    presente: generateArConjugation('cocin'),
    preterito: { yo: 'cociné', vos: 'cocinaste', el: 'cocinó', nosotros: 'cocinamos', ustedes: 'cocinaron' },
    futuro: generateArConjugation('cocinar'),
  },
  comprar: {
    presente: generateArConjugation('compr'),
    preterito: { yo: 'compré', vos: 'compraste', el: 'compró', nosotros: 'compramos', ustedes: 'compraron' },
    futuro: generateArConjugation('comprar'),
  },
  pagar: {
    presente: { yo: 'pago', vos: 'pagás', el: 'paga', nosotros: 'pagamos', ustedes: 'pagan' },
    preterito: { yo: 'pagué', vos: 'pagaste', el: 'pagó', nosotros: 'pagamos', ustedes: 'pagaron' },
    futuro: generateArConjugation('pagar'),
  },
  enseñar: {
    presente: generateArConjugation('enseñ'),
    preterito: { yo: 'enseñé', vos: 'enseñaste', el: 'enseñó', nosotros: 'enseñamos', ustedes: 'enseñaron' },
    futuro: generateArConjugation('enseñar'),
  },
  limpiar: {
    presente: generateArConjugation('limpi'),
    preterito: { yo: 'limpié', vos: 'limpiaste', el: 'limpió', nosotros: 'limpiamos', ustedes: 'limpiaron' },
    futuro: generateArConjugation('limpiar'),
  },
  descansar: {
    presente: generateArConjugation('descans'),
    preterito: { yo: 'descansé', vos: 'descansaste', el: 'descansó', nosotros: 'descansamos', ustedes: 'descansaron' },
    futuro: generateArConjugation('descansar'),
  },
  viajar: {
    presente: generateArConjugation('viaj'),
    preterito: { yo: 'viajé', vos: 'viajaste', el: 'viajó', nosotros: 'viajamos', ustedes: 'viajaron' },
    futuro: generateArConjugation('viajar'),
  },
  escuchar: {
    presente: generateArConjugation('escuch'),
    preterito: { yo: 'escuché', vos: 'escuchaste', el: 'escuchó', nosotros: 'escuchamos', ustedes: 'escucharon' },
    futuro: generateArConjugation('escuchar'),
  },
  practicar: {
    presente: { yo: 'practico', vos: 'practicás', el: 'practica', nosotros: 'practicamos', ustedes: 'practican' },
    preterito: { yo: 'practiqué', vos: 'practicaste', el: 'practicó', nosotros: 'practicamos', ustedes: 'practicaron' },
    futuro: generateArConjugation('practicar'),
  },
  contestar: {
    presente: generateArConjugation('contest'),
    preterito: { yo: 'contesté', vos: 'contestaste', el: 'contestó', nosotros: 'contestamos', ustedes: 'contestaron' },
    futuro: generateArConjugation('contestar'),
  },
  charlar: {
    presente: generateArConjugation('charl'),
    preterito: { yo: 'charlé', vos: 'charlaste', el: 'charló', nosotros: 'charlamos', ustedes: 'charlaron' },
    futuro: generateArConjugation('charlar'),
  },
  entregar: {
    presente: generateArConjugation('entreg'),
    preterito: { yo: 'entregué', vos: 'entregaste', el: 'entregó', nosotros: 'entregamos', ustedes: 'entregaron' },
    futuro: generateArConjugation('entregar'),
  },
  revisar: {
    presente: generateArConjugation('revis'),
    preterito: { yo: 'revisé', vos: 'revisaste', el: 'revisó', nosotros: 'revisamos', ustedes: 'revisaron' },
    futuro: generateArConjugation('revisar'),
  },
  aprobar: {
    presente: { yo: 'apruebo', vos: 'aprobás', el: 'aprueba', nosotros: 'aprobamos', ustedes: 'aprueban' },
    preterito: { yo: 'aprobé', vos: 'aprobaste', el: 'aprobó', nosotros: 'aprobamos', ustedes: 'aprobaron' },
    futuro: generateArConjugation('aprobar'),
  },
  cambiar: {
    presente: generateArConjugation('cambi'),
    preterito: { yo: 'cambié', vos: 'cambiaste', el: 'cambió', nosotros: 'cambiamos', ustedes: 'cambiaron' },
    futuro: generateArConjugation('cambiar'),
  },
  probarse: {
    presente: { yo: 'me pruebo', vos: 'te probás', el: 'se prueba', nosotros: 'nos probamos', ustedes: 'se prueban' },
    preterito: { yo: 'me probé', vos: 'te probaste', el: 'se probó', nosotros: 'nos probamos', ustedes: 'se probaron' },
    futuro: { yo: 'me probaré', vos: 'te probarás', el: 'se probará', nosotros: 'nos probaremos', ustedes: 'se probarán' },
  },
  devolver: {
    presente: { yo: 'devuelvo', vos: 'devolvés', el: 'devuelve', nosotros: 'devolvemos', ustedes: 'devuelven' },
    preterito: { yo: 'devolví', vos: 'devolviste', el: 'devolvió', nosotros: 'devolvimos', ustedes: 'devolvieron' },
    futuro: generateArConjugation('devolver'),
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular',
  },
  planchar: {
    presente: generateArConjugation('planch'),
    preterito: { yo: 'planché', vos: 'planchaste', el: 'planchó', nosotros: 'planchamos', ustedes: 'planchron' },
    futuro: generateArConjugation('planchar'),
  },
  fregar: {
    presente: { yo: 'friego', vos: 'fregás', el: 'friega', nosotros: 'fregamos', ustedes: 'friegan' },
    preterito: { yo: 'fregué', vos: 'fregaste', el: 'fregó', nosotros: 'fregamos', ustedes: 'fregaron' },
    futuro: generateArConjugation('fregar'),
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular',
  },
  cargar: {
    presente: { yo: 'cargo', vos: 'cargás', el: 'carga', nosotros: 'cargamos', ustedes: 'cargan' },
    preterito: { yo: 'cargué', vos: 'cargaste', el: 'cargó', nosotros: 'cargamos', ustedes: 'cargaron' },
    futuro: generateArConjugation('cargar'),
  },
  descargar: {
    presente: { yo: 'descargo', vos: 'descargás', el: 'descarga', nosotros: 'descargamos', ustedes: 'descargan' },
    preterito: { yo: 'descargué', vos: 'descargaste', el: 'descargó', nosotros: 'descargamos', ustedes: 'descargaron' },
    futuro: generateArConjugation('descargar'),
  },
  subir: {
    presente: generateIrConjugation('sub'),
    preterito: { yo: 'subí', vos: 'subiste', el: 'subió', nosotros: 'subimos', ustedes: 'subieron' },
    futuro: generateArConjugation('subir'),
  },
  enviar: {
    presente: { yo: 'envío', vos: 'enviás', el: 'envía', nosotros: 'enviamos', ustedes: 'envían' },
    preterito: { yo: 'envié', vos: 'enviaste', el: 'envió', nosotros: 'enviamos', ustedes: 'enviaron' },
    futuro: generateArConjugation('enviar'),
  },
  buscar_online: {
    presente: generateArConjugation('busc'),
    preterito: { yo: 'busqué', vos: 'buscaste', el: 'buscó', nosotros: 'buscamos', ustedes: 'buscaron' },
    futuro: generateArConjugation('buscar'),
  },
  actualizar: {
    presente: generateArConjugation('actualiz'),
    preterito: { yo: 'actualicé', vos: 'actualizaste', el: 'actualizó', nosotros: 'actualizamos', ustedes: 'actualizaron' },
    futuro: generateArConjugation('actualizar'),
  },
  despertar: {
    presente: { yo: 'despierto', vos: 'despertás', el: 'despierta', nosotros: 'despertamos', ustedes: 'despiertan' },
    preterito: { yo: 'desperté', vos: 'despertaste', el: 'despertó', nosotros: 'despertamos', ustedes: 'despertaron' },
    futuro: generateArConjugation('despertar'),
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular',
  },

  // === REGULAR -ER VERBS ===
  comer: {
    presente: generateErConjugation('com'),
    preterito: { yo: 'comí', vos: 'comiste', el: 'comió', nosotros: 'comimos', ustedes: 'comieron' },
    futuro: generateErConjugation('comer'),
  },
  beber: {
    presente: generateErConjugation('beb'),
    preterito: { yo: 'bebí', vos: 'bebiste', el: 'bebió', nosotros: 'bebimos', ustedes: 'bebieron' },
    futuro: generateErConjugation('beber'),
  },
  aprender: {
    presente: generateErConjugation('aprend'),
    preterito: { yo: 'aprendí', vos: 'aprendiste', el: 'aprendió', nosotros: 'aprendimos', ustedes: 'aprendieron' },
    futuro: generateErConjugation('aprender'),
  },
  correr: {
    presente: generateErConjugation('corr'),
    preterito: { yo: 'corrí', vos: 'corriste', el: 'corrió', nosotros: 'corrimos', ustedes: 'corrieron' },
    futuro: generateErConjugation('correr'),
  },
  vender: {
    presente: generateErConjugation('vend'),
    preterito: { yo: 'vendí', vos: 'vendiste', el: 'vendió', nosotros: 'vendimos', ustedes: 'vendieron' },
    futuro: generateErConjugation('vender'),
  },
  responder: {
    presente: generateErConjugation('respond'),
    preterito: { yo: 'respondí', vos: 'respondiste', el: 'respondió', nosotros: 'respondimos', ustedes: 'respondieron' },
    futuro: generateErConjugation('responder'),
  },
  deber: {
    presente: generateErConjugation('deb'),
    preterito: { yo: 'debí', vos: 'debiste', el: 'debió', nosotros: 'debimos', ustedes: 'debieron' },
    futuro: generateErConjugation('deber'),
  },

  // === REGULAR -IR VERBS ===
  vivir: {
    presente: generateIrConjugation('viv'),
    preterito: { yo: 'viví', vos: 'viviste', el: 'vivió', nosotros: 'vivimos', ustedes: 'vivieron' },
    futuro: generateIrConjugation('vivir'),
  },
  escribir: {
    presente: generateIrConjugation('escrib'),
    preterito: { yo: 'escribí', vos: 'escribiste', el: 'escribió', nosotros: 'escribimos', ustedes: 'escribieron' },
    futuro: generateIrConjugation('escribir'),
  },
  abrir: {
    presente: generateIrConjugation('abr'),
    preterito: { yo: 'abrí', vos: 'abriste', el: 'abrió', nosotros: 'abrimos', ustedes: 'abrieron' },
    futuro: generateIrConjugation('abrir'),
  },
  recibir: {
    presente: generateIrConjugation('recib'),
    preterito: { yo: 'recibí', vos: 'recibiste', el: 'recibió', nosotros: 'recibimos', ustedes: 'recibieron' },
    futuro: generateIrConjugation('recibir'),
  },
  compartir: {
    presente: generateIrConjugation('compart'),
    preterito: { yo: 'compartí', vos: 'compartiste', el: 'compartió', nosotros: 'compartimos', ustedes: 'compartieron' },
    futuro: generateIrConjugation('compartir'),
  },
  discutir: {
    presente: generateIrConjugation('discut'),
    preterito: { yo: 'discutí', vos: 'discutiste', el: 'discutió', nosotros: 'discutimos', ustedes: 'discutieron' },
    futuro: generateIrConjugation('discutir'),
  },
  cumplir: {
    presente: generateIrConjugation('cumpl'),
    preterito: { yo: 'cumplí', vos: 'cumpliste', el: 'cumplió', nosotros: 'cumplimos', ustedes: 'cumplieron' },
    futuro: generateIrConjugation('cumplir'),
  },

  // === STEM-CHANGING VERBS (e→ie) ===
  cerrar: {
    presente: { yo: 'cierro', vos: 'cerrás', el: 'cierra', nosotros: 'cerramos', ustedes: 'cierran' },
    preterito: { yo: 'cerré', vos: 'cerraste', el: 'cerró', nosotros: 'cerramos', ustedes: 'cerraron' },
    futuro: generateArConjugation('cerrar'),
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular',
  },
  pensar: {
    presente: { yo: 'pienso', vos: 'pensás', el: 'piensa', nosotros: 'pensamos', ustedes: 'piensan' },
    preterito: { yo: 'pensé', vos: 'pensaste', el: 'pensó', nosotros: 'pensamos', ustedes: 'pensaron' },
    futuro: generateArConjugation('pensar'),
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular',
  },
  entender: {
    presente: { yo: 'entiendo', vos: 'entendés', el: 'entiende', nosotros: 'entendemos', ustedes: 'entienden' },
    preterito: { yo: 'entendí', vos: 'entendiste', el: 'entendió', nosotros: 'entendimos', ustedes: 'entendieron' },
    futuro: generateErConjugation('entender'),
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular',
  },
  empezar: {
    presente: { yo: 'empiezo', vos: 'empezás', el: 'empieza', nosotros: 'empezamos', ustedes: 'empiezan' },
    preterito: { yo: 'empecé', vos: 'empezaste', el: 'empezó', nosotros: 'empezamos', ustedes: 'empezaron' },
    futuro: generateArConjugation('empezar'),
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular; z in yo form',
  },
  perder: {
    presente: { yo: 'pierdo', vos: 'perdés', el: 'pierde', nosotros: 'perdemos', ustedes: 'pierden' },
    preterito: { yo: 'perdí', vos: 'perdiste', el: 'perdió', nosotros: 'perdimos', ustedes: 'perdieron' },
    futuro: generateErConjugation('perder'),
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular',
  },
  querer: {
    presente: { yo: 'quiero', vos: 'querés', el: 'quiere', nosotros: 'queremos', ustedes: 'quieren' },
    preterito: { yo: 'quise', vos: 'quisiste', el: 'quiso', nosotros: 'quisimos', ustedes: 'quisieron' },
    futuro: { yo: 'querré', vos: 'querrás', el: 'querrá', nosotros: 'querremos', ustedes: 'querrán' },
    irregular: true,
    irregularNote: 'stem change e→ie (present); irregular preterite and future',
  },

  // === STEM-CHANGING VERBS (o→ue) ===
  dormir: {
    presente: { yo: 'duermo', vos: 'dormís', el: 'duerme', nosotros: 'dormimos', ustedes: 'duermen' },
    preterito: { yo: 'dormí', vos: 'dormiste', el: 'durmió', nosotros: 'dormimos', ustedes: 'durmieron' },
    futuro: generateIrConjugation('dormir'),
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular; u in preterite él/ustedes',
  },
  volver: {
    presente: { yo: 'vuelvo', vos: 'volvés', el: 'vuelve', nosotros: 'volvemos', ustedes: 'vuelven' },
    preterito: { yo: 'volví', vos: 'volviste', el: 'volvió', nosotros: 'volvimos', ustedes: 'volvieron' },
    futuro: generateErConjugation('volver'),
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular',
  },
  poder: {
    presente: { yo: 'puedo', vos: 'podés', el: 'puede', nosotros: 'podemos', ustedes: 'pueden' },
    preterito: { yo: 'pude', vos: 'pudiste', el: 'pudo', nosotros: 'pudimos', ustedes: 'pudieron' },
    futuro: { yo: 'podré', vos: 'podrás', el: 'podrá', nosotros: 'podremos', ustedes: 'podrán' },
    irregular: true,
    irregularNote: 'stem change o→ue (present); irregular preterite and future',
  },
  jugar: {
    presente: { yo: 'juego', vos: 'jugás', el: 'juega', nosotros: 'jugamos', ustedes: 'juegan' },
    preterito: { yo: 'jugué', vos: 'jugaste', el: 'jugó', nosotros: 'jugamos', ustedes: 'jugaron' },
    futuro: generateArConjugation('jugar'),
    irregular: true,
    irregularNote: 'stem change u→ue (yo, él, ustedes); vos stays regular; gu in preterite yo',
  },
  recordar: {
    presente: { yo: 'recuerdo', vos: 'recordás', el: 'recuerda', nosotros: 'recordamos', ustedes: 'recuerdan' },
    preterito: { yo: 'recordé', vos: 'recordaste', el: 'recordó', nosotros: 'recordamos', ustedes: 'recordaron' },
    futuro: generateArConjugation('recordar'),
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular',
  },
  encontrar: {
    presente: { yo: 'encuentro', vos: 'encontrás', el: 'encuentra', nosotros: 'encontramos', ustedes: 'encuentran' },
    preterito: { yo: 'encontré', vos: 'encontraste', el: 'encontró', nosotros: 'encontramos', ustedes: 'encontraron' },
    futuro: generateArConjugation('encontrar'),
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular',
  },
  costar: {
    presente: { yo: 'cuesto', vos: 'costás', el: 'cuesta', nosotros: 'costamos', ustedes: 'cuestan' },
    preterito: { yo: 'costé', vos: 'costaste', el: 'costó', nosotros: 'costamos', ustedes: 'costaron' },
    futuro: generateArConjugation('costar'),
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular',
  },
  almorzar: {
    presente: { yo: 'almuerzo', vos: 'almorzás', el: 'almuerza', nosotros: 'almorzamos', ustedes: 'almuerzan' },
    preterito: { yo: 'almorcé', vos: 'almorzaste', el: 'almorzó', nosotros: 'almorzamos', ustedes: 'almorzaron' },
    futuro: generateArConjugation('almorzar'),
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular; c in preterite yo',
  },

  // === STEM-CHANGING VERBS (e→i) ===
  sentir: {
    presente: { yo: 'siento', vos: 'sentís', el: 'siente', nosotros: 'sentimos', ustedes: 'sienten' },
    preterito: { yo: 'sentí', vos: 'sentiste', el: 'sintió', nosotros: 'sentimos', ustedes: 'sintieron' },
    futuro: generateIrConjugation('sentir'),
    irregular: true,
    irregularNote: 'stem change e→i (yo, él, ustedes); vos stays regular; i in preterite él/ustedes',
  },
  pedir: {
    presente: { yo: 'pido', vos: 'pedís', el: 'pide', nosotros: 'pedimos', ustedes: 'piden' },
    preterito: { yo: 'pedí', vos: 'pediste', el: 'pidió', nosotros: 'pedimos', ustedes: 'pidieron' },
    futuro: generateIrConjugation('pedir'),
    irregular: true,
    irregularNote: 'stem change e→i (yo, él, ustedes); vos stays regular; i in preterite él/ustedes',
  },
  repetir: {
    presente: { yo: 'repito', vos: 'repetís', el: 'repite', nosotros: 'repetimos', ustedes: 'repiten' },
    preterito: { yo: 'repetí', vos: 'repetiste', el: 'repitió', nosotros: 'repetimos', ustedes: 'repitieron' },
    futuro: generateIrConjugation('repetir'),
    irregular: true,
    irregularNote: 'stem change e→i (yo, él, ustedes); vos stays regular; i in preterite él/ustedes',
  },
  servir: {
    presente: { yo: 'sirvo', vos: 'servís', el: 'sirve', nosotros: 'servimos', ustedes: 'sirven' },
    preterito: { yo: 'serví', vos: 'serviste', el: 'sirvió', nosotros: 'servimos', ustedes: 'sirvieron' },
    futuro: generateIrConjugation('servir'),
    irregular: true,
    irregularNote: 'stem change e→i (yo, él, ustedes); vos stays regular; i in preterite él/ustedes',
  },
  vestirse: {
    presente: { yo: 'me visto', vos: 'te vestís', el: 'se viste', nosotros: 'nos vestimos', ustedes: 'se visten' },
    preterito: { yo: 'me vestí', vos: 'te vestiste', el: 'se vistió', nosotros: 'nos vestimos', ustedes: 'se vistieron' },
    futuro: { yo: 'me vestiré', vos: 'te vestirás', el: 'se vestirá', nosotros: 'nos vestiremos', ustedes: 'se vestirán' },
    irregular: true,
    irregularNote: 'stem change e→i (yo, él, ustedes); vos stays regular; i in preterite él/ustedes',
  },
  despedirse: {
    presente: { yo: 'me despido', vos: 'te despedís', el: 'se despide', nosotros: 'nos despedimos', ustedes: 'se despiden' },
    preterito: { yo: 'me despedí', vos: 'te despediste', el: 'se despidió', nosotros: 'nos despedimos', ustedes: 'se despidieron' },
    futuro: { yo: 'me despediré', vos: 'te despedirás', el: 'se despedirá', nosotros: 'nos despediremos', ustedes: 'se despedirán' },
    irregular: true,
    irregularNote: 'stem change e→i (yo, él, ustedes); vos stays regular; i in preterite él/ustedes',
  },

  // === IRREGULAR VERBS ===
  ser: {
    presente: { yo: 'soy', vos: 'sos', el: 'es', nosotros: 'somos', ustedes: 'son' },
    preterito: { yo: 'fui', vos: 'fuiste', el: 'fue', nosotros: 'fuimos', ustedes: 'fueron' },
    futuro: { yo: 'seré', vos: 'serás', el: 'será', nosotros: 'seremos', ustedes: 'serán' },
    irregular: true,
    irregularNote: 'completely irregular in all tenses',
  },
  ir: {
    presente: { yo: 'voy', vos: 'vas', el: 'va', nosotros: 'vamos', ustedes: 'van' },
    preterito: { yo: 'fui', vos: 'fuiste', el: 'fue', nosotros: 'fuimos', ustedes: 'fueron' },
    futuro: { yo: 'iré', vos: 'irás', el: 'irá', nosotros: 'iremos', ustedes: 'irán' },
    irregular: true,
    irregularNote: 'completely irregular; shares preterite with ser',
  },
  tener: {
    presente: { yo: 'tengo', vos: 'tenés', el: 'tiene', nosotros: 'tenemos', ustedes: 'tienen' },
    preterito: { yo: 'tuve', vos: 'tuviste', el: 'tuvo', nosotros: 'tuvimos', ustedes: 'tuvieron' },
    futuro: { yo: 'tendré', vos: 'tendrás', el: 'tendrá', nosotros: 'tendremos', ustedes: 'tendrán' },
    irregular: true,
    irregularNote: 'g in yo form; stem change e→ie (él, ustedes); irregular preterite and future',
  },
  hacer: {
    presente: { yo: 'hago', vos: 'hacés', el: 'hace', nosotros: 'hacemos', ustedes: 'hacen' },
    preterito: { yo: 'hice', vos: 'hiciste', el: 'hizo', nosotros: 'hicimos', ustedes: 'hicieron' },
    futuro: { yo: 'haré', vos: 'harás', el: 'hará', nosotros: 'haremos', ustedes: 'harán' },
    irregular: true,
    irregularNote: 'g in yo form; c→z in preterite él; irregular future',
  },
  decir: {
    presente: { yo: 'digo', vos: 'decís', el: 'dice', nosotros: 'decimos', ustedes: 'dicen' },
    preterito: { yo: 'dije', vos: 'dijiste', el: 'dijo', nosotros: 'dijimos', ustedes: 'dijeron' },
    futuro: { yo: 'diré', vos: 'dirás', el: 'dirá', nosotros: 'diremos', ustedes: 'dirán' },
    irregular: true,
    irregularNote: 'g in yo form; e→i (él, ustedes); j in preterite and future',
  },
  saber: {
    presente: { yo: 'sé', vos: 'sabés', el: 'sabe', nosotros: 'sabemos', ustedes: 'saben' },
    preterito: { yo: 'supe', vos: 'supiste', el: 'supo', nosotros: 'supimos', ustedes: 'supieron' },
    futuro: { yo: 'sabré', vos: 'sabrás', el: 'sabrá', nosotros: 'sabremos', ustedes: 'sabrán' },
    irregular: true,
    irregularNote: 'accented é in yo form; irregular preterite and future',
  },
  ver: {
    presente: { yo: 'veo', vos: 'ves', el: 've', nosotros: 'vemos', ustedes: 'ven' },
    preterito: { yo: 'vi', vos: 'viste', el: 'vio', nosotros: 'vimos', ustedes: 'vieron' },
    futuro: { yo: 'veré', vos: 'verás', el: 'verá', nosotros: 'veremos', ustedes: 'verán' },
    irregular: true,
    irregularNote: 'extra -e- in yo form',
  },
  dar: {
    presente: { yo: 'doy', vos: 'das', el: 'da', nosotros: 'damos', ustedes: 'dan' },
    preterito: { yo: 'di', vos: 'diste', el: 'dio', nosotros: 'dimos', ustedes: 'dieron' },
    futuro: { yo: 'daré', vos: 'darás', el: 'dará', nosotros: 'daremos', ustedes: 'darán' },
    irregular: true,
    irregularNote: 'y in yo form; irregular preterite',
  },
  poner: {
    presente: { yo: 'pongo', vos: 'ponés', el: 'pone', nosotros: 'ponemos', ustedes: 'ponen' },
    preterito: { yo: 'puse', vos: 'pusiste', el: 'puso', nosotros: 'pusimos', ustedes: 'pusieron' },
    futuro: { yo: 'pondré', vos: 'pondrás', el: 'pondrá', nosotros: 'pondremos', ustedes: 'pondrán' },
    irregular: true,
    irregularNote: 'g in yo form; irregular preterite and future',
  },
  traer: {
    presente: { yo: 'traigo', vos: 'traés', el: 'trae', nosotros: 'traemos', ustedes: 'traen' },
    preterito: { yo: 'traje', vos: 'trajiste', el: 'trajo', nosotros: 'trajimos', ustedes: 'trajeron' },
    futuro: { yo: 'traeré', vos: 'traerás', el: 'traerá', nosotros: 'traeremos', ustedes: 'traerán' },
    irregular: true,
    irregularNote: 'g in yo form; j in preterite',
  },
  salir: {
    presente: { yo: 'salgo', vos: 'salís', el: 'sale', nosotros: 'salimos', ustedes: 'salen' },
    preterito: { yo: 'salí', vos: 'saliste', el: 'salió', nosotros: 'salimos', ustedes: 'salieron' },
    futuro: { yo: 'saldré', vos: 'saldrás', el: 'saldrá', nosotros: 'saldremos', ustedes: 'saldrán' },
    irregular: true,
    irregularNote: 'g in yo form; irregular future',
  },
  venir: {
    presente: { yo: 'vengo', vos: 'venís', el: 'viene', nosotros: 'venimos', ustedes: 'vienen' },
    preterito: { yo: 'vine', vos: 'viniste', el: 'vino', nosotros: 'vinimos', ustedes: 'vinieron' },
    futuro: { yo: 'vendré', vos: 'vendrás', el: 'vendrá', nosotros: 'vendremos', ustedes: 'vendrán' },
    irregular: true,
    irregularNote: 'g in yo form; stem change e→ie (él, ustedes); irregular preterite and future',
  },
  conocer: {
    presente: { yo: 'conozco', vos: 'conocés', el: 'conoce', nosotros: 'conocemos', ustedes: 'conocen' },
    preterito: { yo: 'conocí', vos: 'conociste', el: 'conoció', nosotros: 'conocimos', ustedes: 'conocieron' },
    futuro: generateErConjugation('conocer'),
    irregular: true,
    irregularNote: 'z in yo form',
  },
  leer: {
    presente: generateErConjugation('le'),
    preterito: { yo: 'leí', vos: 'leíste', el: 'leyó', nosotros: 'leímos', ustedes: 'leyeron' },
    futuro: generateErConjugation('leer'),
    irregular: true,
    irregularNote: 'y in preterite él/ustedes',
  },
  oír: {
    presente: { yo: 'oigo', vos: 'oís', el: 'oye', nosotros: 'oímos', ustedes: 'oyen' },
    preterito: { yo: 'oí', vos: 'oíste', el: 'oyó', nosotros: 'oímos', ustedes: 'oyeron' },
    futuro: { yo: 'oiré', vos: 'oirás', el: 'oirá', nosotros: 'oiremos', ustedes: 'oirán' },
    irregular: true,
    irregularNote: 'g in yo form; y in preterite and present él/ustedes',
  },
  construir: {
    presente: generateIrConjugation('constru'),
    preterito: { yo: 'construí', vos: 'construiste', el: 'construyó', nosotros: 'construimos', ustedes: 'construyeron' },
    futuro: generateIrConjugation('construir'),
    irregular: true,
    irregularNote: 'y in preterite él/ustedes',
  },
  huir: {
    presente: { yo: 'huyo', vos: 'huís', el: 'huye', nosotros: 'huimos', ustedes: 'huyen' },
    preterito: { yo: 'huí', vos: 'huiste', el: 'huyó', nosotros: 'huimos', ustedes: 'huyeron' },
    futuro: generateIrConjugation('huir'),
    irregular: true,
    irregularNote: 'y in present and preterite él/ustedes',
  },
  influir: {
    presente: { yo: 'influyo', vos: 'influís', el: 'influye', nosotros: 'influimos', ustedes: 'influyen' },
    preterito: { yo: 'influí', vos: 'influiste', el: 'influyó', nosotros: 'influimos', ustedes: 'influyeron' },
    futuro: generateIrConjugation('influir'),
    irregular: true,
    irregularNote: 'y in present and preterite él/ustedes',
  },

  // === REFLEXIVE VERBS ===
  levantarse: {
    presente: { yo: 'me levanto', vos: 'te levantás', el: 'se levanta', nosotros: 'nos levantamos', ustedes: 'se levantan' },
    preterito: { yo: 'me levanté', vos: 'te levantaste', el: 'se levantó', nosotros: 'nos levantamos', ustedes: 'se levantaron' },
    futuro: { yo: 'me levantaré', vos: 'te levantarás', el: 'se levantará', nosotros: 'nos levantaremos', ustedes: 'se levantarán' },
  },
  sentarse: {
    presente: { yo: 'me siento', vos: 'te sentás', el: 'se sienta', nosotros: 'nos sentamos', ustedes: 'se sientan' },
    preterito: { yo: 'me senté', vos: 'te sentaste', el: 'se sentó', nosotros: 'nos sentamos', ustedes: 'se sentaron' },
    futuro: { yo: 'me sentaré', vos: 'te sentarás', el: 'se sentará', nosotros: 'nos sentaremos', ustedes: 'se sentarán' },
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular',
  },
  ducharse: {
    presente: { yo: 'me ducho', vos: 'te duchás', el: 'se ducha', nosotros: 'nos duchamos', ustedes: 'se duchan' },
    preterito: { yo: 'me duché', vos: 'te duchaste', el: 'se duchó', nosotros: 'nos duchamos', ustedes: 'se ducharon' },
    futuro: { yo: 'me ducharé', vos: 'te ducharás', el: 'se duchará', nosotros: 'nos ducharemos', ustedes: 'se ducharán' },
  },
  acostarse: {
    presente: { yo: 'me acuesto', vos: 'te acostás', el: 'se acuesta', nosotros: 'nos acostamos', ustedes: 'se acuestan' },
    preterito: { yo: 'me acosté', vos: 'te acostaste', el: 'se acostó', nosotros: 'nos acostamos', ustedes: 'se acostaron' },
    futuro: { yo: 'me acostaré', vos: 'te acostarás', el: 'se acostará', nosotros: 'nos acostaremos', ustedes: 'se acostarán' },
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular',
  },
  despertarse: {
    presente: { yo: 'me despierto', vos: 'te despertás', el: 'se despierta', nosotros: 'nos despertamos', ustedes: 'se despiertan' },
    preterito: { yo: 'me desperté', vos: 'te despertaste', el: 'se despertó', nosotros: 'nos despertamos', ustedes: 'se despertaron' },
    futuro: { yo: 'me despertaré', vos: 'te despertarás', el: 'se despertará', nosotros: 'nos despertaremos', ustedes: 'se despertarán' },
    irregular: true,
    irregularNote: 'stem change e→ie (yo, él, ustedes); vos stays regular',
  },
  cepillarse: {
    presente: { yo: 'me cepillo', vos: 'te cepillás', el: 'se cepilla', nosotros: 'nos cepillamos', ustedes: 'se cepillan' },
    preterito: { yo: 'me cepillé', vos: 'te cepillaste', el: 'se cepilló', nosotros: 'nos cepillamos', ustedes: 'se cepillaron' },
    futuro: { yo: 'me cepillaré', vos: 'te cepillarás', el: 'se cepillará', nosotros: 'nos cepillaremos', ustedes: 'se cepillarán' },
  },
  peinarse: {
    presente: { yo: 'me peino', vos: 'te peinás', el: 'se peina', nosotros: 'nos peinamos', ustedes: 'se peinan' },
    preterito: { yo: 'me peiné', vos: 'te peinaste', el: 'se peinó', nosotros: 'nos peinamos', ustedes: 'se peinaron' },
    futuro: { yo: 'me peinaré', vos: 'te peinarás', el: 'se peinará', nosotros: 'nos peinaremos', ustedes: 'se peinarán' },
  },
  preocuparse: {
    presente: { yo: 'me preocupo', vos: 'te preocupás', el: 'se preocupa', nosotros: 'nos preocupamos', ustedes: 'se preocupan' },
    preterito: { yo: 'me preocupé', vos: 'te preocupaste', el: 'se preocupó', nosotros: 'nos preocupamos', ustedes: 'se preocuparon' },
    futuro: { yo: 'me preocuparé', vos: 'te preocuparás', el: 'se preocupará', nosotros: 'nos preocuparemos', ustedes: 'se preocuparán' },
  },
  olvidarse: {
    presente: { yo: 'me olvido', vos: 'te olvidás', el: 'se olvida', nosotros: 'nos olvidamos', ustedes: 'se olvidan' },
    preterito: { yo: 'me olvidé', vos: 'te olvidaste', el: 'se olvidó', nosotros: 'nos olvidamos', ustedes: 'se olvidaron' },
    futuro: { yo: 'me olvidaré', vos: 'te olvidarás', el: 'se olvidará', nosotros: 'nos olvidaremos', ustedes: 'se olvidarán' },
  },
  acordarse: {
    presente: { yo: 'me acuerdo', vos: 'te acordás', el: 'se acuerda', nosotros: 'nos acordamos', ustedes: 'se acuerdan' },
    preterito: { yo: 'me acordé', vos: 'te acordaste', el: 'se acordó', nosotros: 'nos acordamos', ustedes: 'se acordaron' },
    futuro: { yo: 'me acordaré', vos: 'te acordarás', el: 'se acordará', nosotros: 'nos acordaremos', ustedes: 'se acordarán' },
    irregular: true,
    irregularNote: 'stem change o→ue (yo, él, ustedes); vos stays regular',
  },
  quejarse: {
    presente: { yo: 'me quejo', vos: 'te quejás', el: 'se queja', nosotros: 'nos quejamos', ustedes: 'se quejan' },
    preterito: { yo: 'me quejé', vos: 'te quejaste', el: 'se quejó', nosotros: 'nos quejamos', ustedes: 'se quejaron' },
    futuro: { yo: 'me quejaré', vos: 'te quejarás', el: 'se quejará', nosotros: 'nos quejaremos', ustedes: 'se quejarán' },
  },
  arrepentirse: {
    presente: { yo: 'me arrepiento', vos: 'te arrepentís', el: 'se arrepiente', nosotros: 'nos arrepentimos', ustedes: 'se arrepienten' },
    preterito: { yo: 'me arrepentí', vos: 'te arrepentiste', el: 'se arrepintió', nosotros: 'nos arrepentimos', ustedes: 'se arrepintieron' },
    futuro: { yo: 'me arrepentiré', vos: 'te arrepentirás', el: 'se arrepentirá', nosotros: 'nos arrepentiremos', ustedes: 'se arrepentirán' },
    irregular: true,
    irregularNote: 'stem change e→i (yo, él, ustedes); vos stays regular; i in preterite él/ustedes',
  },
  irse: {
    presente: { yo: 'me voy', vos: 'te vas', el: 'se va', nosotros: 'nos vamos', ustedes: 'se van' },
    preterito: { yo: 'me fui', vos: 'te fuiste', el: 'se fue', nosotros: 'nos fuimos', ustedes: 'se fueron' },
    futuro: { yo: 'me iré', vos: 'te irás', el: 'se irá', nosotros: 'nos iremos', ustedes: 'se irán' },
    irregular: true,
    irregularNote: 'completely irregular; shares preterite with ser',
  },
  ponerse: {
    presente: { yo: 'me pongo', vos: 'te ponés', el: 'se pone', nosotros: 'nos ponemos', ustedes: 'se ponen' },
    preterito: { yo: 'me puse', vos: 'te pusiste', el: 'se puso', nosotros: 'nos pusimos', ustedes: 'se pusieron' },
    futuro: { yo: 'me pondré', vos: 'te pondrás', el: 'se pondrá', nosotros: 'nos pondremos', ustedes: 'se pondrán' },
    irregular: true,
    irregularNote: 'g in yo form; irregular preterite and future',
  },
  quedarse: {
    presente: { yo: 'me quedo', vos: 'te quedás', el: 'se queda', nosotros: 'nos quedamos', ustedes: 'se quedan' },
    preterito: { yo: 'me quedé', vos: 'te quedaste', el: 'se quedó', nosotros: 'nos quedamos', ustedes: 'se quedaron' },
    futuro: { yo: 'me quedaré', vos: 'te quedarás', el: 'se quedará', nosotros: 'nos quedaremos', ustedes: 'se quedarán' },
  },
  fijarse: {
    presente: { yo: 'me fijo', vos: 'te fijás', el: 'se fija', nosotros: 'nos fijamos', ustedes: 'se fijan' },
    preterito: { yo: 'me fijé', vos: 'te fijaste', el: 'se fijó', nosotros: 'nos fijamos', ustedes: 'se fijaron' },
    futuro: { yo: 'me fijaré', vos: 'te fijarás', el: 'se fijará', nosotros: 'nos fijaremos', ustedes: 'se fijarán' },
  },

  // === ADDITIONAL COMMON VERBS ===
  gustar: {
    presente: { yo: 'me gusta', vos: 'te gusta', el: 'le gusta', nosotros: 'nos gusta', ustedes: 'les gusta' },
    preterito: { yo: 'me gustó', vos: 'te gustó', el: 'le gustó', nosotros: 'nos gustó', ustedes: 'les gustó' },
    futuro: { yo: 'me gustará', vos: 'te gustará', el: 'le gustará', nosotros: 'nos gustará', ustedes: 'les gustará' },
    irregular: true,
    irregularNote: 'indirect object pronouns required; 3rd person verb form',
  },
  encantar: {
    presente: { yo: 'me encanta', vos: 'te encanta', el: 'le encanta', nosotros: 'nos encanta', ustedes: 'les encanta' },
    preterito: { yo: 'me encantó', vos: 'te encantó', el: 'le encantó', nosotros: 'nos encantó', ustedes: 'les encantó' },
    futuro: { yo: 'me encantará', vos: 'te encantará', el: 'le encantará', nosotros: 'nos encantará', ustedes: 'les encantará' },
    irregular: true,
    irregularNote: 'indirect object pronouns required; 3rd person verb form',
  },
  importar: {
    presente: { yo: 'me importa', vos: 'te importa', el: 'le importa', nosotros: 'nos importa', ustedes: 'les importa' },
    preterito: { yo: 'me importó', vos: 'te importó', el: 'le importó', nosotros: 'nos importó', ustedes: 'les importó' },
    futuro: { yo: 'me importará', vos: 'te importará', el: 'le importará', nosotros: 'nos importará', ustedes: 'les importará' },
    irregular: true,
    irregularNote: 'indirect object pronouns required; 3rd person verb form',
  },
  doler: {
    presente: { yo: 'me duele', vos: 'te duele', el: 'le duele', nosotros: 'nos duele', ustedes: 'les duele' },
    preterito: { yo: 'me dolió', vos: 'te dolió', el: 'le dolió', nosotros: 'nos dolió', ustedes: 'les dolió' },
    futuro: { yo: 'me dolerá', vos: 'te dolerá', el: 'le dolerá', nosotros: 'nos dolerá', ustedes: 'les dolerá' },
    irregular: true,
    irregularNote: 'stem change o→ue; indirect object pronouns required; 3rd person verb form',
  },
  faltar: {
    presente: { yo: 'me falta', vos: 'te falta', el: 'le falta', nosotros: 'nos falta', ustedes: 'les falta' },
    preterito: { yo: 'me faltó', vos: 'te faltó', el: 'le faltó', nosotros: 'nos faltó', ustedes: 'les faltó' },
    futuro: { yo: 'me faltará', vos: 'te faltará', el: 'le faltará', nosotros: 'nos faltará', ustedes: 'les faltará' },
    irregular: true,
    irregularNote: 'indirect object pronouns required; 3rd person verb form',
  },
  parecer: {
    presente: { yo: 'me parece', vos: 'te parece', el: 'le parece', nosotros: 'nos parece', ustedes: 'les parece' },
    preterito: { yo: 'me pareció', vos: 'te pareció', el: 'le pareció', nosotros: 'nos pareció', ustedes: 'les pareció' },
    futuro: { yo: 'me parecerá', vos: 'te parecerá', el: 'le parecerá', nosotros: 'nos parecerá', ustedes: 'les parecerá' },
    irregular: true,
    irregularNote: 'indirect object pronouns required; 3rd person verb form; z→c in preterite yo',
  },
  quedar: {
    presente: { yo: 'me queda', vos: 'te queda', el: 'le queda', nosotros: 'nos queda', ustedes: 'les queda' },
    preterito: { yo: 'me quedó', vos: 'te quedó', el: 'le quedó', nosotros: 'nos quedó', ustedes: 'les quedó' },
    futuro: { yo: 'me quedará', vos: 'te quedará', el: 'le quedará', nosotros: 'nos quedará', ustedes: 'les quedará' },
    irregular: true,
    irregularNote: 'indirect object pronouns required; 3rd person verb form (for "to fit/remain")',
  },
  tocar: {
    presente: { yo: 'toco', vos: 'tocás', el: 'toca', nosotros: 'tocamos', ustedes: 'tocan' },
    preterito: { yo: 'toqué', vos: 'tocaste', el: 'tocó', nosotros: 'tocamos', ustedes: 'tocaron' },
    futuro: generateArConjugation('tocar'),
  },
  joder: {
    presente: generateErConjugation('jod'),
    preterito: { yo: 'jodí', vos: 'jodiste', el: 'jodió', nosotros: 'jodimos', ustedes: 'jodieron' },
    futuro: generateErConjugation('joder'),
  },
  molestar: {
    presente: generateArConjugation('molest'),
    preterito: { yo: 'molesté', vos: 'molestaste', el: 'molestó', nosotros: 'molestamos', ustedes: 'molestaron' },
    futuro: generateArConjugation('molestar'),
  },
  sonreír: {
    presente: { yo: 'sonrío', vos: 'sonreís', el: 'sonríe', nosotros: 'sonreímos', ustedes: 'sonríen' },
    preterito: { yo: 'sonreí', vos: 'sonreíste', el: 'sonrió', nosotros: 'sonreímos', ustedes: 'sonrieron' },
    futuro: generateIrConjugation('sonreir'),
    irregular: true,
    irregularNote: 'accented í in present/future; i in preterite él/ustedes',
  },
  vacilar: {
    presente: generateArConjugation('vacil'),
    preterito: { yo: 'vacilé', vos: 'vacilaste', el: 'vaciló', nosotros: 'vacilamos', ustedes: 'vacilaron' },
    futuro: generateArConjugation('vacilar'),
  },
  pelar: {
    presente: generateArConjugation('pel'),
    preterito: { yo: 'pelé', vos: 'pelaste', el: 'peló', nosotros: 'pelamos', ustedes: 'pelaron' },
    futuro: generateArConjugation('pelar'),
  },
  embarrar: {
    presente: generateArConjugation('embarr'),
    preterito: { yo: 'embarré', vos: 'embarraste', el: 'embarró', nosotros: 'embarramos', ustedes: 'embarraron' },
    futuro: generateArConjugation('embarrar'),
  },
  parar: {
    presente: generateArConjugation('par'),
    preterito: { yo: 'paré', vos: 'paraste', el: 'paró', nosotros: 'paramos', ustedes: 'pararon' },
    futuro: generateArConjugation('parar'),
  },
  embolatar: {
    presente: generateArConjugation('embolat'),
    preterito: { yo: 'embolaté', vos: 'embolataste', el: 'embolató', nosotros: 'embolatamos', ustedes: 'embolataron' },
    futuro: generateArConjugation('embolatar'),
  },
  enterar: {
    presente: generateArConjugation('enter'),
    preterito: { yo: 'enteré', vos: 'enteraste', el: 'enteró', nosotros: 'enteramos', ustedes: 'enteraron' },
    futuro: generateArConjugation('enterar'),
  },
  cortar: {
    presente: generateArConjugation('cort'),
    preterito: { yo: 'corté', vos: 'cortaste', el: 'cortó', nosotros: 'cortamos', ustedes: 'cortaron' },
    futuro: generateArConjugation('cortar'),
  },
  meter: {
    presente: generateErConjugation('met'),
    preterito: { yo: 'metí', vos: 'metiste', el: 'metió', nosotros: 'metimos', ustedes: 'metieron' },
    futuro: generateErConjugation('meter'),
  },
  parrandear: {
    presente: generateArConjugation('parrande'),
    preterito: { yo: 'parrandeé', vos: 'parrandeaste', el: 'parrandeó', nosotros: 'parrandeamos', ustedes: 'parrandearon' },
    futuro: generateArConjugation('parrandear'),
  },
  rumbear: {
    presente: generateArConjugation('rumbe'),
    preterito: { yo: 'rumbeé', vos: 'rumbeaste', el: 'rumbeó', nosotros: 'rumbeamos', ustedes: 'rumbearon' },
    futuro: generateArConjugation('rumbear'),
  },
  pasarla: {
    presente: { yo: 'la paso', vos: 'la pasás', el: 'la pasa', nosotros: 'la pasamos', ustedes: 'la pasan' },
    preterito: { yo: 'la pasé', vos: 'la pasaste', el: 'la pasó', nosotros: 'la pasamos', ustedes: 'la pasaron' },
    futuro: { yo: 'la pasaré', vos: 'la pasarás', el: 'la pasará', nosotros: 'la pasaremos', ustedes: 'la pasarán' },
    irregular: true,
    irregularNote: 'requires direct object pronoun "la"',
  },
  montar: {
    presente: generateArConjugation('mont'),
    preterito: { yo: 'monté', vos: 'montaste', el: 'montó', nosotros: 'montamos', ustedes: 'montaron' },
    futuro: generateArConjugation('montar'),
  },
  hacerse: {
    presente: { yo: 'me hago', vos: 'te hacés', el: 'se hace', nosotros: 'nos hacemos', ustedes: 'se hacen' },
    preterito: { yo: 'me hice', vos: 'te hiciste', el: 'se hizo', nosotros: 'nos hicimos', ustedes: 'se hicieron' },
    futuro: { yo: 'me haré', vos: 'te harás', el: 'se hará', nosotros: 'nos haremos', ustedes: 'se harán' },
    irregular: true,
    irregularNote: 'g in yo form; c→z in preterite él; irregular future',
  },
  pegar: {
    presente: { yo: 'pego', vos: 'pegás', el: 'pega', nosotros: 'pegamos', ustedes: 'pegan' },
    preterito: { yo: 'pegué', vos: 'pegaste', el: 'pegó', nosotros: 'pegamos', ustedes: 'pegaron' },
    futuro: generateArConjugation('pegar'),
  },
  camellar: {
    presente: generateArConjugation('camell'),
    preterito: { yo: 'camelé', vos: 'camellaste', el: 'camelló', nosotros: 'camellamos', ustedes: 'camellaron' },
    futuro: generateArConjugation('camellar'),
  },
  guerrear: {
    presente: generateArConjugation('guerre'),
    preterito: { yo: 'guerreé', vos: 'guerreaste', el: 'guerreó', nosotros: 'guerreamos', ustedes: 'guerrieron' },
    futuro: generateArConjugation('guerrear'),
  },
  armar: {
    presente: generateArConjugation('arm'),
    preterito: { yo: 'armé', vos: 'armaste', el: 'armó', nosotros: 'armamos', ustedes: 'armaron' },
    futuro: generateArConjugation('armar'),
  },
  pelar_bolo: {
    presente: { yo: 'pelo bolo', vos: 'pelás bolo', el: 'pela bolo', nosotros: 'pelamos bolo', ustedes: 'pelan bolo' },
    preterito: { yo: 'pelé bolo', vos: 'pelaste bolo', el: 'peló bolo', nosotros: 'pelamos bolo', ustedes: 'pelaron bolo' },
    futuro: { yo: 'pelaré bolo', vos: 'pelarás bolo', el: 'pelará bolo', nosotros: 'pelaremos bolo', ustedes: 'pelarán bolo' },
    irregular: true,
    irregularNote: 'colloquial phrase; "bolo" is fixed',
  },
  estar: {
    presente: { yo: 'estoy', vos: 'estás', el: 'está', nosotros: 'estamos', ustedes: 'están' },
    preterito: { yo: 'estuve', vos: 'estuviste', el: 'estuvo', nosotros: 'estuvimos', ustedes: 'estuvieron' },
    futuro: { yo: 'estaré', vos: 'estarás', el: 'estará', nosotros: 'estaremos', ustedes: 'estarán' },
    irregular: true,
    irregularNote: 'completely irregular in all tenses',
  },
  despedir: {
    presente: { yo: 'despido', vos: 'despedís', el: 'despide', nosotros: 'despedimos', ustedes: 'despiden' },
    preterito: { yo: 'despedí', vos: 'despediste', el: 'despidió', nosotros: 'despedimos', ustedes: 'despidieron' },
    futuro: generateIrConjugation('despedir'),
    irregular: true,
    irregularNote: 'stem change e→i (yo, él, ustedes); vos stays regular; i in preterite él/ustedes',
  },
  renunciar: {
    presente: generateArConjugation('renunci'),
    preterito: { yo: 'renuncié', vos: 'renunciaste', el: 'renunció', nosotros: 'renunciamos', ustedes: 'renunciaron' },
    futuro: generateArConjugation('renunciar'),
  },
  mandar: {
    presente: generateArConjugation('mand'),
    preterito: { yo: 'mandé', vos: 'mandaste', el: 'mandó', nosotros: 'mandamos', ustedes: 'mandaron' },
    futuro: generateArConjugation('mandar'),
  },
  hacer_mandado: {
    presente: { yo: 'hago mandado', vos: 'hacés mandado', el: 'hace mandado', nosotros: 'hacemos mandado', ustedes: 'hacen mandado' },
    preterito: { yo: 'hice mandado', vos: 'hiciste mandado', el: 'hizo mandado', nosotros: 'hicimos mandado', ustedes: 'hicieron mandado' },
    futuro: { yo: 'haré mandado', vos: 'harás mandado', el: 'hará mandado', nosotros: 'haremos mandado', ustedes: 'harán mandado' },
    irregular: true,
    irregularNote: 'g in yo form; c→z in preterite él; irregular future',
  },
  hacerse_el_cojo: {
    presente: { yo: 'me hago el cojo', vos: 'te hacés el cojo', el: 'se hace el cojo', nosotros: 'nos hacemos el cojo', ustedes: 'se hacen el cojo' },
    preterito: { yo: 'me hice el cojo', vos: 'te hiciste el cojo', el: 'se hizo el cojo', nosotros: 'nos hicimos el cojo', ustedes: 'se hicieron el cojo' },
    futuro: { yo: 'me haré el cojo', vos: 'te harás el cojo', el: 'se hará el cojo', nosotros: 'nos haremos el cojo', ustedes: 'se harán el cojo' },
    irregular: true,
    irregularNote: 'g in yo form; c→z in preterite él; irregular future; reflexive',
  },
  tirar_la_stone: {
    presente: { yo: 'tiro la stone', vos: 'tirás la stone', el: 'tira la stone', nosotros: 'tiramos la stone', ustedes: 'tiran la stone' },
    preterito: { yo: 'tiré la stone', vos: 'tiraste la stone', el: 'tiró la stone', nosotros: 'tiramos la stone', ustedes: 'tiraron la stone' },
    futuro: { yo: 'tiraré la stone', vos: 'tirarás la stone', el: 'tirará la stone', nosotros: 'tiraremos la stone', ustedes: 'tirarán la stone' },
    irregular: true,
    irregularNote: 'colloquial phrase; "stone" is fixed English word',
  },
  esconder_la_mano: {
    presente: { yo: 'escondo la mano', vos: 'escondés la mano', el: 'esconde la mano', nosotros: 'escondemos la mano', ustedes: 'esconden la mano' },
    preterito: { yo: 'escondí la mano', vos: 'escondiste la mano', el: 'escondió la mano', nosotros: 'escondimos la mano', ustedes: 'escondieron la mano' },
    futuro: { yo: 'esconderé la mano', vos: 'esconderás la mano', el: 'esconderá la mano', nosotros: 'esconderemos la mano', ustedes: 'esconderán la mano' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression',
  },
  quedar_en_tablas: {
    presente: { yo: 'quedo en tablas', vos: 'quedás en tablas', el: 'queda en tablas', nosotros: 'quedamos en tablas', ustedes: 'quedan en tablas' },
    preterito: { yo: 'quedé en tablas', vos: 'quedaste en tablas', el: 'quedó en tablas', nosotros: 'quedamos en tablas', ustedes: 'quedaron en tablas' },
    futuro: { yo: 'quedaré en tablas', vos: 'quedarás en tablas', el: 'quedará en tablas', nosotros: 'quedaremos en tablas', ustedes: 'quedarán en tablas' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression',
  },
  meterse_en_camisa_de_once_varas: {
    presente: { yo: 'me meto en camisa de once varas', vos: 'te metés en camisa de once varas', el: 'se mete en camisa de once varas', nosotros: 'nos metemos en camisa de once varas', ustedes: 'se meten en camisa de once varas' },
    preterito: { yo: 'me metí en camisa de once varas', vos: 'te metiste en camisa de once varas', el: 'se metió en camisa de once varas', nosotros: 'nos metimos en camisa de once varas', ustedes: 'se metieron en camisa de once varas' },
    futuro: { yo: 'me meteré en camisa de once varas', vos: 'te meterás en camisa de once varas', el: 'se meterá en camisa de once varas', nosotros: 'nos meteremos en camisa de once varas', ustedes: 'se meterán en camisa de once varas' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression; reflexive',
  },
  estar_en_la_mierda: {
    presente: { yo: 'estoy en la mierda', vos: 'estás en la mierda', el: 'está en la mierda', nosotros: 'estamos en la mierda', ustedes: 'están en la mierda' },
    preterito: { yo: 'estuve en la mierda', vos: 'estuviste en la mierda', el: 'estuvo en la mierda', nosotros: 'estuvimos en la mierda', ustedes: 'estuvieron en la mierda' },
    futuro: { yo: 'estaré en la mierda', vos: 'estarás en la mierda', el: 'estará en la mierda', nosotros: 'estaremos en la mierda', ustedes: 'estarán en la mierda' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression; irregular like estar',
  },
  saber_la_puntica: {
    presente: { yo: 'sé la puntica', vos: 'sabés la puntica', el: 'sabe la puntica', nosotros: 'sabemos la puntica', ustedes: 'saben la puntica' },
    preterito: { yo: 'supe la puntica', vos: 'supiste la puntica', el: 'supo la puntica', nosotros: 'supimos la puntica', ustedes: 'supieron la puntica' },
    futuro: { yo: 'sabré la puntica', vos: 'sabrás la puntica', el: 'sabrá la puntica', nosotros: 'sabremos la puntica', ustedes: 'sabrán la puntica' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression; irregular like saber',
  },
  echarse_una_cabeza: {
    presente: { yo: 'me echo una cabeza', vos: 'te echás una cabeza', el: 'se echa una cabeza', nosotros: 'nos echamos una cabeza', ustedes: 'se echan una cabeza' },
    preterito: { yo: 'me eché una cabeza', vos: 'te echaste una cabeza', el: 'se echó una cabeza', nosotros: 'nos echamos una cabeza', ustedes: 'se echaron una cabeza' },
    futuro: { yo: 'me echaré una cabeza', vos: 'te echarás una cabeza', el: 'se echará una cabeza', nosotros: 'nos echaremos una cabeza', ustedes: 'se echarán una cabeza' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression; reflexive',
  },
  echarse_un_polvo: {
    presente: { yo: 'me echo un polvo', vos: 'te echás un polvo', el: 'se echa un polvo', nosotros: 'nos echamos un polvo', ustedes: 'se echan un polvo' },
    preterito: { yo: 'me eché un polvo', vos: 'te echaste un polvo', el: 'se echó un polvo', nosotros: 'nos echamos un polvo', ustedes: 'se echaron un polvo' },
    futuro: { yo: 'me echaré un polvo', vos: 'te echarás un polvo', el: 'se echará un polvo', nosotros: 'nos echaremos un polvo', ustedes: 'se echarán un polvo' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression; reflexive',
  },
  dar_papaya: {
    presente: { yo: 'doy papaya', vos: 'das papaya', el: 'da papaya', nosotros: 'damos papaya', ustedes: 'dan papaya' },
    preterito: { yo: 'di papaya', vos: 'diste papaya', el: 'dio papaya', nosotros: 'dimos papaya', ustedes: 'dieron papaya' },
    futuro: { yo: 'daré papaya', vos: 'darás papaya', el: 'dará papaya', nosotros: 'daremos papaya', ustedes: 'darán papaya' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression; irregular like dar',
  },
  caminar_mucho: {
    presente: { yo: 'camino mucho', vos: 'caminás mucho', el: 'camina mucho', nosotros: 'caminamos mucho', ustedes: 'caminan mucho' },
    preterito: { yo: 'caminé mucho', vos: 'caminaste mucho', el: 'caminó mucho', nosotros: 'caminamos mucho', ustedes: 'caminaron mucho' },
    futuro: { yo: 'caminaré mucho', vos: 'caminarás mucho', el: 'caminará mucho', nosotros: 'caminaremos mucho', ustedes: 'caminarán mucho' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression',
  },
  chinear: {
    presente: generateArConjugation('chine'),
    preterito: { yo: 'chineé', vos: 'chineaste', el: 'chineó', nosotros: 'chineamos', ustedes: 'chinearon' },
    futuro: generateArConjugation('chinear'),
  },
  pelar_el_diente: {
    presente: { yo: 'pelo el diente', vos: 'pelás el diente', el: 'pela el diente', nosotros: 'pelamos el diente', ustedes: 'pelan el diente' },
    preterito: { yo: 'pelé el diente', vos: 'pelaste el diente', el: 'peló el diente', nosotros: 'pelamos el diente', ustedes: 'pelaron el diente' },
    futuro: { yo: 'pelaré el diente', vos: 'pelarás el diente', el: 'pelará el diente', nosotros: 'pelaremos el diente', ustedes: 'pelarán el diente' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression',
  },
  estar_alerta: {
    presente: { yo: 'estoy alerta', vos: 'estás alerta', el: 'está alerta', nosotros: 'estamos alerta', ustedes: 'están alerta' },
    preterito: { yo: 'estuve alerta', vos: 'estuviste alerta', el: 'estuvo alerta', nosotros: 'estuvimos alerta', ustedes: 'estuvieron alerta' },
    futuro: { yo: 'estaré alerta', vos: 'estarás alerta', el: 'estará alerta', nosotros: 'estaremos alerta', ustedes: 'estarán alerta' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression; irregular like estar',
  },
  rumbear_valluno: {
    presente: generateArConjugation('rumbe'),
    preterito: { yo: 'rumbeé', vos: 'rumbeaste', el: 'rumbeó', nosotros: 'rumbeamos', ustedes: 'rumbearon' },
    futuro: generateArConjugation('rumbear'),
  },
  parchear: {
    presente: generateArConjugation('parche'),
    preterito: { yo: 'parcheé', vos: 'parcheaste', el: 'parcheó', nosotros: 'parcheamos', ustedes: 'parchearon' },
    futuro: generateArConjugation('parchear'),
  },
  rochear: {
    presente: generateArConjugation('roche'),
    preterito: { yo: 'rocheé', vos: 'rocheaste', el: 'rocheó', nosotros: 'rocheamos', ustedes: 'rochearon' },
    futuro: generateArConjugation('rochear'),
  },
  chatear: {
    presente: generateArConjugation('chate'),
    preterito: { yo: 'chateé', vos: 'chateaste', el: 'chateó', nosotros: 'chateamos', ustedes: 'chatearon' },
    futuro: generateArConjugation('chatear'),
  },
  golear: {
    presente: generateArConjugation('gole'),
    preterito: { yo: 'goleé', vos: 'goleaste', el: 'goleó', nosotros: 'goleamos', ustedes: 'golearon' },
    futuro: generateArConjugation('golear'),
  },
  golear_mucho: {
    presente: { yo: 'goleo mucho', vos: 'goleás mucho', el: 'golea mucho', nosotros: 'goleamos mucho', ustedes: 'golean mucho' },
    preterito: { yo: 'goleé mucho', vos: 'goleaste mucho', el: 'goleó mucho', nosotros: 'goleamos mucho', ustedes: 'golearon mucho' },
    futuro: { yo: 'golearé mucho', vos: 'golearás mucho', el: 'goleará mucho', nosotros: 'golearemos mucho', ustedes: 'golearán mucho' },
    irregular: true,
    irregularNote: 'colloquial phrase; fixed expression',
  },
};

// Helper function to check if a card is a verb
export function isVerb(card: { back: string }): boolean {
  return card.back.startsWith('to ');
}

// Helper function to get the infinitive from a card
export function getInfinitive(card: { front: string }): string | null {
  const infinitive = card.front.toLowerCase().trim();
  if (CONJUGATIONS[infinitive]) {
    return infinitive;
  }
  return null;
}

// Helper function to look up conjugation
export function lookupConjugation(infinitive: string): ConjugationTable | null {
  return CONJUGATIONS[infinitive.toLowerCase().trim()] || null;
}
