import type { AdventureDefinition } from './content';
import type { ChoiceNode, LocalizedText, MissionNode, ProductionNode } from '../missions/schema';

const l = (en: string, es: string): LocalizedText => ({ en, es });
const phrases = 'deck-useful-phrases';
const dining = 'deck-restaurant-phrases';

function typed(
  id: string,
  title: LocalizedText,
  prompt: LocalizedText,
  cardId: string,
  deckId: string,
  answers: string[],
  hint: LocalizedText,
): ProductionNode {
  return {
    id,
    kind: 'production',
    title,
    prompt,
    hints: [hint],
    next: '',
    correction: l(`You can say: ${answers[0]}.`, `Puedes decir: ${answers[0]}.`),
    exercise: {
      schemaVersion: 1,
      id,
      contentVersion: 1,
      cardId,
      deckId,
      kind: 'typed-recall',
      prompt: prompt.en,
      acceptedAnswers: answers,
      explanation: title.en,
      hints: [hint.en],
    },
  };
}
function choice(
  id: string,
  title: LocalizedText,
  prompt: LocalizedText,
  cardId: string,
  deckId: string,
  options: [LocalizedText, LocalizedText, LocalizedText],
  correct: number,
  explanation: LocalizedText,
): ChoiceNode {
  return {
    id,
    kind: 'choice',
    title,
    prompt,
    cardId,
    deckId,
    hints: [explanation],
    options: options.map((text, index) => ({
      id: `option-${index + 1}`,
      text,
      correct: index === correct,
      ...(index === correct ? { next: '' } : {}),
      feedback: explanation,
    })),
  };
}
function episode(
  id: string,
  previous: string,
  title: LocalizedText,
  scene: LocalizedText,
  warmupCardIds: string[],
  tasks: (ProductionNode | ChoiceNode)[],
  ending: LocalizedText,
): AdventureDefinition {
  const nodes: MissionNode[] = tasks.map((node, index) => {
    const next = tasks[index + 1]?.id ?? 'complete';
    if (node.kind === 'production')
      return { ...node, next, exercise: { ...node.exercise, id: `${id}-${node.id}` } };
    return { ...node, options: node.options.map((o) => (o.correct ? { ...o, next } : o)) };
  });
  return {
    pack: {
      schemaVersion: 1,
      id,
      contentVersion: 1,
      title,
      entry: 'welcome',
      prerequisites: [previous],
      media: [],
      nodes: [
        { id: 'welcome', kind: 'scene', title, text: scene, hints: [], next: tasks[0].id },
        ...nodes,
        {
          id: 'complete',
          kind: 'complete',
          title: l('Visit complete', 'Visita terminada'),
          text: ending,
          hints: [],
        },
      ],
    },
    requiredNodeIds: tasks.map((n) => n.id),
    warmupCardIds,
  };
}

// Editorial drafts: use the same preview/acceptance resolver as the original café visits.
export const NEIGHBOURHOOD_ADVENTURES: readonly AdventureDefinition[] = [
  episode(
    'the-bill-please',
    'back-at-anas-cafe',
    l('The bill, please', 'La cuenta, por favor'),
    l(
      'Breakfast is over. Nico puts away his book while Ana clears the table. Ask for the bill, check the total and find out how to pay.',
      'Terminó el desayuno. Nico guarda su libro mientras Ana recoge la mesa. Pide la cuenta, confirma el total y averigua cómo pagar.',
    ),
    ['phrase-019', 'phrase-016', 'phrase-013'],
    [
      typed(
        'bill',
        l('Ask for the bill', 'Pide la cuenta'),
        l('Ask Ana for the bill politely.', 'Pídele la cuenta a Ana de forma cortés.'),
        'phrase-019',
        phrases,
        ['La cuenta, por favor', 'Me regala la cuenta, por favor', 'Me trae la cuenta, por favor'],
        l('The bill is la cuenta.', 'La cuenta es lo que quieres pedir.'),
      ),
      choice(
        'total',
        l('Check the total', 'Confirma el total'),
        l(
          'Ana says: «Son doce mil pesos en total». How much is the bill?',
          'Ana dice: «Son doce mil pesos en total». ¿Cuánto hay que pagar?',
        ),
        'phrase-013',
        phrases,
        [
          l('2,000 pesos', '2.000 pesos'),
          l('12,000 pesos', '12.000 pesos'),
          l('20,000 pesos', '20.000 pesos'),
        ],
        1,
        l(
          'Doce mil means twelve thousand; en total refers to the whole bill.',
          'Doce mil son 12.000; en total se refiere a toda la cuenta.',
        ),
      ),
      typed(
        'card',
        l('Ask about card payment', 'Pregunta por el pago con tarjeta'),
        l('Ask whether the café accepts cards.', 'Pregunta si la cafetería acepta tarjetas.'),
        'phrase-016',
        phrases,
        ['¿Aceptan tarjeta?', '¿Se puede pagar con tarjeta?', '¿Puedo pagar con tarjeta?'],
        l('A payment card is una tarjeta.', 'Puedes usar la palabra tarjeta.'),
      ),
      choice(
        'receipt',
        l('Understand the payment reply', 'Entiende la respuesta sobre el pago'),
        l(
          'Ana replies: «Sí, aceptamos tarjeta». What can you do?',
          'Ana responde: «Sí, aceptamos tarjeta». ¿Qué puedes hacer?',
        ),
        'phrase-016',
        phrases,
        [
          l('Pay by card', 'Pagar con tarjeta'),
          l('Pay only in cash', 'Pagar solo en efectivo'),
          l('Leave without paying', 'Irte sin pagar'),
        ],
        0,
        l(
          'Aceptamos tarjeta confirms that card payment is available.',
          'Aceptamos tarjeta confirma que puedes pagar con tarjeta.',
        ),
      ),
    ],
    l(
      'You checked the bill and payment method. Nico suggests picking up breakfast to go on your next visit.',
      'Confirmaste la cuenta y la forma de pago. Nico propone pedir un desayuno para llevar en la próxima visita.',
    ),
  ),
  episode(
    'breakfast-to-go',
    'the-bill-please',
    l('Breakfast to go', 'Desayuno para llevar'),
    l(
      'Nico is heading out and asks you to bring breakfast. Ana is at the counter. Order something to take away and choose an alternative if needed.',
      'Nico va a salir y te pide que lleves el desayuno. Ana está en el mostrador. Pide algo para llevar y elige una alternativa si hace falta.',
    ),
    ['rest-028', '0019', '0020'],
    [
      typed(
        'takeaway',
        l('Say it is to go', 'Di que es para llevar'),
        l(
          'Ana asks whether you will eat here or take the order away. Reply that it is to go.',
          'Ana pregunta si vas a comer aquí o llevar el pedido. Responde que es para llevar.',
        ),
        'rest-028',
        dining,
        ['Para llevar', 'Para llevar, por favor', 'Es para llevar'],
        l('Begin with para…', 'Empieza con para…'),
      ),
      choice(
        'alternative',
        l('Choose breakfast', 'Elige el desayuno'),
        l(
          'Ana says: «No hay arepas. Tenemos pan y café». Which breakfast is available?',
          'Ana dice: «No hay arepas. Tenemos pan y café». ¿Qué desayuno está disponible?',
        ),
        '0020',
        'deck-food',
        [
          l('Arepa and water', 'Arepa y agua'),
          l('Arepa and coffee', 'Arepa y café'),
          l('Bread and coffee', 'Pan y café'),
        ],
        2,
        l('Pan y café are available; there are no arepas.', 'Hay pan y café; no hay arepas.'),
      ),
      typed(
        'bread',
        l('Make a polite request', 'Haz un pedido cortés'),
        l('Ask for bread politely.', 'Pide pan de forma cortés.'),
        '0020',
        'deck-food',
        [
          'Pan, por favor',
          'Un pan, por favor',
          'Quisiera pan, por favor',
          'Me regala un pan, por favor',
        ],
        l('Include por favor.', 'Incluye por favor.'),
      ),
      choice(
        'pickup',
        l('Check the order', 'Revisa el pedido'),
        l(
          'Ana says: «El pan y el café son para llevar». Which order is yours?',
          'Ana dice: «El pan y el café son para llevar». ¿Cuál es tu pedido?',
        ),
        'rest-028',
        dining,
        [
          l('Bread and coffee to eat here', 'Pan y café para comer aquí'),
          l('Bread and coffee to go', 'Pan y café para llevar'),
          l('Arepa and coffee to go', 'Arepa y café para llevar'),
        ],
        1,
        l('Para llevar means the order is to go.', 'Para llevar indica que te llevas el pedido.'),
      ),
    ],
    l(
      'Breakfast is packed. Ana mentions a fruit stall nearby; Nico would like to stop there with you.',
      'El desayuno está empacado. Ana te habla de un puesto de frutas cercano; Nico quiere ir contigo.',
    ),
  ),
  episode(
    'at-the-fruit-stall',
    'breakfast-to-go',
    l('At the fruit stall', 'En el puesto de frutas'),
    l(
      'Nico takes you to the fruit stall near the café. You spot green mango. Make a small request, ask the price and check the quantity.',
      'Nico te lleva al puesto de frutas cerca de la cafetería. Ves mango biche. Haz un pedido pequeño, pregunta el precio y confirma la cantidad.',
    ),
    ['0269', 'phrase-013', 'phrase-008'],
    [
      typed(
        'mango',
        l('Ask for mango', 'Pide mango'),
        l('Ask for one green mango politely.', 'Pide un mango biche de forma cortés.'),
        '0269',
        'deck-food',
        [
          'Un mango biche, por favor',
          'Quisiera un mango biche, por favor',
          'Me regala un mango biche, por favor',
        ],
        l('Use un for one, and include por favor.', 'Usa un para la cantidad e incluye por favor.'),
      ),
      choice(
        'quantity',
        l('Check the quantity', 'Confirma la cantidad'),
        l(
          'The vendor asks: «¿Uno o dos?» You want one mango. Choose your reply.',
          'El vendedor pregunta: «¿Uno o dos?» Quieres un mango. Elige tu respuesta.',
        ),
        '0269',
        'deck-food',
        [
          l('Uno, por favor.', 'Uno, por favor.'),
          l('Dos, por favor.', 'Dos, por favor.'),
          l('Tres, por favor.', 'Tres, por favor.'),
        ],
        0,
        l('Uno confirms that you want one mango.', 'Uno confirma que quieres un mango.'),
      ),
      typed(
        'price',
        l('Ask the price', 'Pregunta el precio'),
        l('Ask how much it costs.', 'Pregunta cuánto cuesta.'),
        'phrase-013',
        phrases,
        ['¿Cuánto cuesta?', '¿Cuánto vale?', '¿Cuánto cuesta el mango?', '¿Cuánto vale el mango?'],
        l('Begin with cuánto…', 'Empieza con cuánto…'),
      ),
      choice(
        'amount',
        l('Understand the price', 'Entiende el precio'),
        l(
          'The vendor says: «Un mango cuesta tres mil pesos». How much is your one mango?',
          'El vendedor dice: «Un mango cuesta tres mil pesos». ¿Cuánto cuesta tu mango?',
        ),
        'phrase-013',
        phrases,
        [
          l('30,000 pesos', '30.000 pesos'),
          l('2,000 pesos', '2.000 pesos'),
          l('3,000 pesos', '3.000 pesos'),
        ],
        2,
        l('Tres mil pesos means 3,000 pesos.', 'Tres mil pesos son 3.000 pesos.'),
      ),
    ],
    l(
      'You checked the quantity and price. Nico suggests taking your fruit to the plaza, but first you need directions.',
      'Confirmaste la cantidad y el precio. Nico propone llevar la fruta a la plaza, pero primero necesitan indicaciones.',
    ),
  ),
  episode(
    'finding-the-plaza',
    'at-the-fruit-stall',
    l('Finding the plaza', 'Camino a la plaza'),
    l(
      'You and Nico leave the fruit stall. A neighbour offers to help you find the plaza. Ask for directions and follow the landmarks.',
      'Tú y Nico salen del puesto de frutas. Una vecina se ofrece a ayudarles a encontrar la plaza. Pide indicaciones y fíjate en los puntos de referencia.',
    ),
    ['phrase-021', 'phrase-022', 'phrase-034'],
    [
      typed(
        'directions',
        l('Ask how to get there', 'Pregunta cómo llegar'),
        l('Ask how to get to the plaza.', 'Pregunta cómo llegar a la plaza.'),
        'phrase-021',
        phrases,
        [
          '¿Cómo llego a la plaza?',
          '¿Cómo puedo llegar a la plaza?',
          '¿Me puede decir cómo llegar a la plaza?',
        ],
        l('Begin with cómo llego…', 'Empieza con cómo llego…'),
      ),
      choice(
        'turn',
        l('Follow the turn', 'Sigue la indicación'),
        l(
          'The neighbour says: «Gire a la derecha en la panadería». Where do you turn?',
          'La vecina dice: «Gire a la derecha en la panadería». ¿Dónde debes girar?',
        ),
        'phrase-022',
        phrases,
        [
          l('Left at the bakery', 'A la izquierda en la panadería'),
          l('Right at the bakery', 'A la derecha en la panadería'),
          l('Right at the café', 'A la derecha en la cafetería'),
        ],
        1,
        l(
          'A la derecha is right; la panadería is the bakery.',
          'Debes girar a la derecha al llegar a la panadería.',
        ),
      ),
      typed(
        'repeat',
        l('Ask for repetition', 'Pide que repitan'),
        l(
          'You missed the next instruction. Ask the neighbour to repeat it politely.',
          'No entendiste la siguiente indicación. Pídele a la vecina que la repita de forma cortés.',
        ),
        'phrase-034',
        phrases,
        [
          '¿Puede repetir?',
          '¿Puede repetir, por favor?',
          '¿Me puede repetir?',
          '¿Podría repetir, por favor?',
        ],
        l('The verb repetir means to repeat.', 'Puedes usar el verbo repetir.'),
      ),
      choice(
        'landmark',
        l('Find the plaza', 'Encuentra la plaza'),
        l(
          'She repeats: «Siga derecho. La plaza está al lado de la iglesia». Where is the plaza?',
          'Ella repite: «Siga derecho. La plaza está al lado de la iglesia». ¿Dónde está la plaza?',
        ),
        'phrase-024',
        phrases,
        [
          l('Next to the café', 'Al lado de la cafetería'),
          l('Inside the bakery', 'Dentro de la panadería'),
          l('Next to the church', 'Al lado de la iglesia'),
        ],
        2,
        l(
          'Al lado de la iglesia means next to the church. Siga derecho means continue straight.',
          'Al lado de la iglesia indica dónde está la plaza. Siga derecho indica que debes seguir de frente.',
        ),
      ),
    ],
    l(
      'You reach the plaza together. Later, you and Nico will take a taxi to meet Ana across town.',
      'Llegan juntos a la plaza. Más tarde, tú y Nico tomarán un taxi para encontrarse con Ana al otro lado de la ciudad.',
    ),
  ),
  episode(
    'a-taxi-across-town',
    'finding-the-plaza',
    l('A taxi across town', 'Un taxi al otro lado de la ciudad'),
    l(
      'You and Nico have arranged to meet Ana near the museum. A taxi stops beside the plaza. Tell the driver your destination and check the fare before leaving.',
      'Tú y Nico quedaron de encontrarse con Ana cerca del museo. Un taxi se detiene junto a la plaza. Dile al conductor adónde van y confirma la tarifa antes de salir.',
    ),
    ['phrase-018', 'phrase-013', 'phrase-016'],
    [
      typed(
        'destination',
        l('Give your destination', 'Di tu destino'),
        l(
          'Tell the driver you want to go to the museum politely.',
          'Dile al conductor que quieres ir al museo de forma cortés.',
        ),
        'phrase-018',
        phrases,
        [
          'Quiero ir al museo, por favor',
          'Quisiera ir al museo, por favor',
          'Al museo, por favor',
          'Lléveme al museo, por favor',
        ],
        l(
          'The museum is el museo. You can begin with quiero ir…',
          'Puedes empezar con quiero ir… El destino es el museo.',
        ),
      ),
      choice(
        'confirm',
        l('Confirm the destination', 'Confirma el destino'),
        l(
          'The driver asks: «¿Al museo, al lado del parque?» What is being confirmed?',
          'El conductor pregunta: «¿Al museo, al lado del parque?» ¿Qué está confirmando?',
        ),
        'phrase-018',
        phrases,
        [
          l('The museum next to the park', 'El museo al lado del parque'),
          l('The café next to the plaza', 'La cafetería al lado de la plaza'),
          l('The airport outside town', 'El aeropuerto fuera de la ciudad'),
        ],
        0,
        l(
          'Al museo gives the destination; al lado del parque identifies its location.',
          'Al museo indica el destino; al lado del parque precisa su ubicación.',
        ),
      ),
      typed(
        'fare',
        l('Ask the fare', 'Pregunta la tarifa'),
        l(
          'Ask how much the trip to the museum costs.',
          'Pregunta cuánto cuesta el viaje al museo.',
        ),
        'phrase-013',
        phrases,
        [
          '¿Cuánto cuesta ir al museo?',
          '¿Cuánto cuesta el viaje al museo?',
          '¿Cuánto cuesta?',
          '¿Cuánto me cobra hasta el museo?',
          '¿Cuánto vale el viaje al museo?',
        ],
        l('Use cuánto cuesta to ask the price.', 'Usa cuánto cuesta para preguntar el precio.'),
      ),
      choice(
        'payment',
        l('Check fare and payment', 'Confirma la tarifa y el pago'),
        l(
          'The driver says: «Son quince mil pesos. Solo efectivo». Which payment matches?',
          'El conductor dice: «Son quince mil pesos. Solo efectivo». ¿Qué pago corresponde?',
        ),
        'phrase-016',
        phrases,
        [
          l('50,000 pesos by card', '50.000 pesos con tarjeta'),
          l('15,000 pesos in cash', '15.000 pesos en efectivo'),
          l('15,000 pesos by card', '15.000 pesos con tarjeta'),
        ],
        1,
        l(
          'Quince mil is 15,000; solo efectivo means cash only.',
          'Quince mil son 15.000; solo efectivo indica que no puedes pagar con tarjeta.',
        ),
      ),
    ],
    l(
      'You arrive near the museum. Ana waves from a lunch spot, and Nico finds a table for your next visit.',
      'Llegan cerca del museo. Ana los saluda desde un restaurante y Nico busca una mesa para la próxima visita.',
    ),
  ),
  episode(
    'lunch-with-nico',
    'a-taxi-across-town',
    l('Lunch with Nico', 'Almuerzo con Nico'),
    l(
      'Ana and Nico join you for lunch near the museum. Find out what the set lunch includes, place your order and ask for a small change.',
      'Ana y Nico te acompañan a almorzar cerca del museo. Averigua qué incluye el menú del día, haz tu pedido y pide un pequeño cambio.',
    ),
    ['rest-008', 'rest-007', 'rest-012'],
    [
      typed(
        'includes',
        l('Ask what is included', 'Pregunta qué incluye'),
        l('Ask what the set lunch includes.', 'Pregunta qué incluye el menú del día.'),
        'rest-008',
        dining,
        [
          '¿Qué incluye el menú del día?',
          '¿Qué tiene el menú del día?',
          '¿Qué incluye el almuerzo?',
          '¿Qué tiene el menú ejecutivo?',
        ],
        l('You can begin with qué incluye…', 'Puedes empezar con qué incluye…'),
      ),
      choice(
        'menu',
        l('Understand the set lunch', 'Entiende el menú del día'),
        l(
          'The server says: «El menú incluye sopa, pollo con arroz y jugo». Which drink is included?',
          'El mesero dice: «El menú incluye sopa, pollo con arroz y jugo». ¿Qué bebida está incluida?',
        ),
        '0023',
        'deck-food',
        [l('Coffee', 'Café'), l('Milk', 'Leche'), l('Juice', 'Jugo')],
        2,
        l(
          'Jugo is juice; it is the drink listed with the meal.',
          'El jugo es la bebida que se menciona en el menú.',
        ),
      ),
      typed(
        'order',
        l('Order your lunch', 'Pide tu almuerzo'),
        l(
          'Order the set lunch for yourself politely.',
          'Pide el menú del día para ti de forma cortés.',
        ),
        'rest-007',
        dining,
        [
          'Para mí, el menú del día, por favor',
          'El menú del día, por favor',
          'Quisiera el menú del día, por favor',
          'Me regala el menú del día, por favor',
        ],
        l('You can begin with para mí…', 'Puedes empezar con para mí…'),
      ),
      choice(
        'change',
        l('Request a small change', 'Pide un pequeño cambio'),
        l(
          'You would like your lunch without spicy seasoning. Which request fits?',
          'Quieres tu almuerzo sin condimento picante. ¿Qué petición corresponde?',
        ),
        'rest-012',
        dining,
        [
          l('Sin picante, por favor.', 'Sin picante, por favor.'),
          l('Más picante, por favor.', 'Más picante, por favor.'),
          l('La cuenta, por favor.', 'La cuenta, por favor.'),
        ],
        0,
        l(
          'Sin picante asks for the meal without spicy seasoning.',
          'Sin picante pide que no añadan condimento picante.',
        ),
      ),
    ],
    l(
      'Lunch is ordered. Ana and Nico settle in to chat. You can revisit any of your neighbourhood visits or return to your daily practice.',
      'El almuerzo está pedido. Ana y Nico se acomodan para conversar. Puedes repetir cualquiera de tus visitas por el barrio o volver a tu práctica diaria.',
    ),
  ),
];
