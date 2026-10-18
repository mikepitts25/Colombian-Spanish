// Static review boards only. No runtime imports, app changes or network access.
const fs = require('node:fs');
const path = require('node:path');
const { Resvg } = require(process.argv[2] || '@resvg/resvg-js');
const palette = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../2026-10-18-barrio-foundation/palette.json'), 'utf8'),
);
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
let p = [];
function box(x, y, w, h, fill, r = 0, stroke = 'none') {
  p.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`,
  );
}
function txt(x, y, s, size, color, weight = 400) {
  p.push(
    `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`,
  );
}
function lines(x, y, ss, size, color, weight = 400, step = size * 1.35) {
  ss.forEach((s, i) => txt(x, y + i * step, s, size, color, weight));
}
function button(t, x, y, w, label) {
  box(x, y, w, 52, t.primary, 13);
  txt(x + 18, y + 33, label, 17, t.onPrimary, 700);
  txt(x + w - 30, y + 33, '›', 22, t.onPrimary);
}
function link(t, x, y, w, label) {
  box(x, y, w, 50, t.raised, 12, t.border);
  txt(x + 14, y + 31, label, 16, t.text, 700);
}
function cup(t, x, y) {
  p.push(
    `<path d="M${x} ${y}h32v20q-16 16-32 0z M${x + 32} ${y + 4}q22-2 10 16h-10 M${x - 6} ${y + 32}h48 M${x + 7} ${y - 7}q-6-5 0-11 M${x + 22} ${y - 7}q-6-5 0-11" fill="none" stroke="${t.accent}" stroke-width="2.3" stroke-linecap="round"/>`,
  );
}
function nav(t, en, y) {
  box(0, y, 390, 78, t.surface, 0, t.border);
  const labels = en
    ? ['Home', 'Study', 'Progress', 'Settings']
    : ['Inicio', 'Estudiar', 'Progreso', 'Ajustes'];
  labels.forEach((s, i) => {
    if (i === 0) box(8, y + 12, 87, 52, t.primary, 14);
    txt(18 + i * 96, y + 44, s, 14, i === 0 ? t.onPrimary : t.secondary, i === 0 ? 700 : 400);
  });
}
function phone(t, en) {
  box(0, 0, 390, 1244, t.bg, 24, t.border);
  txt(24, 30, '9:41', 13, t.text, 700);
  txt(24, 73, 'COLOMBIAN SPANISH', 11, t.secondary, 700);
  txt(24, 115, en ? 'Good morning' : '¡Buenos días!', 29, t.text, 700);
  txt(
    24,
    143,
    en ? 'A little practice for today.' : 'Un poco de práctica para hoy.',
    16,
    t.secondary,
  );
  cup(t, 306, 99);
  box(20, 169, 350, 288, t.surface, 20, t.border);
  txt(40, 201, en ? 'YOUR DAILY PLAN' : 'TU PLAN DIARIO', 11, t.secondary, 700);
  txt(40, 237, en ? 'Pick up where you left off' : 'Un paso para hoy', en ? 22 : 26, t.text, 700);
  lines(
    40,
    266,
    en
      ? ['Written reply · editorial draft', 'Review finished · one greeting next']
      : ['5 tarjetas · unos 3 min', 'Repaso breve con tarjetas nuevas'],
    15,
    t.secondary,
  );
  box(40, 307, 310, 52, t.raised, 12);
  txt(54, 339, en ? 'Review  ✓     →     Reply  •' : '1  Repasar tarjetas', 16, t.text, 700);
  button(t, 40, 379, 310, en ? 'Continue my plan' : 'Empezar mi plan');
  txt(40, 447, en ? 'Manage plan' : 'Tiempo y nivel: en Ajustes', 13, t.secondary);
  txt(24, 493, en ? 'TODAY’S ACTIVITY' : 'ACTIVIDAD DE HOY', 11, t.secondary, 700);
  txt(
    24,
    522,
    en ? '2 of 5 reviews · 3-day streak' : '2 de 5 repasos · racha de 3 días',
    15,
    t.text,
    700,
  );
  box(24, 538, 342, 5, t.raised, 3);
  box(24, 538, 137, 5, t.primary, 3);
  txt(
    24,
    570,
    en ? '6 due · up to 4 new today' : '6 pendientes · hasta 4 nuevas hoy',
    14,
    t.secondary,
  );
  txt(24, 617, en ? 'A word for today' : 'Una palabra para hoy', 21, t.text, 700);
  box(20, 635, 350, 116, t.surface, 16, t.border);
  txt(40, 674, 'tinto', 27, t.text, 700);
  txt(40, 701, 'black coffee (small cup)', 15, t.secondary);
  txt(40, 729, 'Colombian Food', 12, t.secondary);
  link(t, 290, 653, 60, en ? 'Play' : 'Oír');
  txt(24, 793, en ? 'Keep exploring' : 'Sigue explorando', 21, t.text, 700);
  link(t, 20, 811, 170, en ? 'Quiz' : 'Quiz');
  link(t, 200, 811, 170, en ? 'Difficult words' : 'Palabras difíciles');
  link(t, 20, 873, 170, en ? 'Favorites' : 'Favoritas');
  link(t, 200, 873, 170, en ? 'Phrases' : 'Frases');
  link(t, 20, 935, 350, en ? 'Explore · decks and your cards' : 'Explorar · decks y tus tarjetas');
  txt(24, 1020, en ? 'Decks with reviews due' : 'Decks con repasos pendientes', 20, t.text, 700);
  box(20, 1040, 350, 83, t.surface, 12, t.border);
  txt(38, 1074, 'Colombian Food', 17, t.text, 700);
  txt(38, 1099, en ? '4 reviews due · opens deck' : '4 pendientes · abre el deck', 14, t.secondary);
  txt(24, 1155, en ? 'Browse all decks  →' : 'Ver todos los decks  →', 16, t.primary, 700);
  nav(t, en, 1166);
}
function maximum(t) {
  box(0, 0, 390, 1244, t.bg, 24, t.border);
  txt(24, 30, '9:41', 13, t.text, 700);
  lines(24, 84, ['¡Buenos', 'días!'], 39, t.text, 700, 46);
  lines(24, 170, ['Un poco de práctica', 'para hoy.'], 25, t.secondary, 400, 34);
  box(18, 237, 354, 558, t.surface, 20, t.border);
  txt(38, 281, 'TU PLAN DIARIO', 18, t.secondary, 700);
  lines(38, 331, ['Un paso', 'para hoy'], 35, t.text, 700, 44);
  lines(38, 429, ['5 tarjetas', 'Unos 3 min'], 27, t.secondary, 400, 38);
  lines(38, 526, ['Repaso breve con', 'tarjetas nuevas'], 25, t.secondary, 400, 34);
  box(38, 611, 314, 62, t.raised, 12);
  txt(52, 651, '1  Repasar tarjetas', 25, t.text, 700);
  box(38, 695, 314, 78, t.primary, 13);
  lines(54, 727, ['Empezar mi', 'plan  →'], 26, t.onPrimary, 700, 31);
  txt(24, 839, 'ACTIVIDAD DE HOY', 18, t.secondary, 700);
  lines(24, 885, ['2 de 5 repasos', 'Racha de 3 días'], 27, t.text, 700, 38);
  lines(24, 979, ['Contenido restante', 'en el mismo scroll:'], 24, t.secondary, 400, 34);
  lines(
    24,
    1056,
    ['Palabra · herramientas', 'Decks · todos los accesos'],
    23,
    t.secondary,
    400,
    34,
  );
  // Schematic two-row tab reflow, matching the existing large-text navigation policy.
  box(0, 1125, 390, 119, t.surface, 0, t.border);
  box(10, 1135, 178, 46, t.primary, 10);
  txt(25, 1167, 'Inicio', 24, t.onPrimary, 700);
  txt(212, 1167, 'Estudiar', 24, t.secondary);
  txt(25, 1221, 'Progreso', 24, t.secondary);
  txt(212, 1221, 'Ajustes', 24, t.secondary);
}
function frame(x, y, label, fn) {
  txt(x, y, label, 18, '#18352F', 700);
  p.push(`<g transform="translate(${x} ${y + 22})">`);
  fn();
  p.push('</g>');
}
function save(name, w, h) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${p.join('')}</svg>`;
  fs.writeFileSync(path.join(__dirname, `${name}.svg`), svg);
  fs.writeFileSync(path.join(__dirname, `${name}.png`), new Resvg(svg).render().asPng());
}
box(0, 0, 1320, 1430, '#E8E5DD');
txt(30, 41, 'Barrio Home · one clear next action', 29, '#18352F', 700);
txt(
  30,
  72,
  'PROPOSAL · illustrative data · Classic unchanged · no runtime or editorial acceptance',
  16,
  '#486258',
);
frame(30, 113, 'Light / Spanish · production review-only', () => phone(palette.light, false));
frame(465, 113, 'Dark / English · development draft resume', () => phone(palette.dark, true));
frame(900, 113, 'Large text · schematic scroll/reflow', () => maximum(palette.light));
txt(
  30,
  1411,
  'Full-page composition studies; phone viewports scroll. Large-text drawing is not a native size certification.',
  14,
  '#486258',
);
save('home-composition', 1320, 1430);
p = [];
box(0, 0, 1320, 1040, '#E8E5DD');
txt(30, 44, 'The plan card must tell the truth', 29, '#18352F', 700);
txt(
  30,
  76,
  'PROPOSAL · selected examples · one current action · no invented progress, ability or released mission',
  16,
  '#486258',
);
const states = [
  [
    'Loading',
    'Checking your plan',
    ['No zero-count success claims.', 'Keep the same card position.'],
    'Loading…',
    true,
  ],
  [
    'Read / start error',
    'Could not open your plan',
    ['Keep the saved checkpoint.', 'Retry the existing operation.'],
    'Try again',
    false,
  ],
  [
    'No eligible cards',
    'Choose something to study',
    ['Library empty or new-card cap reached.', 'Explain which condition applies.'],
    'Browse decks',
    false,
  ],
  [
    'Review resume',
    'Your saved cards are ready',
    ['Continue the exact remaining queue.', 'A changed preference does not replace it.'],
    'Continue my plan',
    false,
  ],
  [
    'Completed today',
    'Today’s plan is complete',
    ['Practice recorded, not a fluency claim.', 'Optional practice remains available.'],
    'View completed plan',
    false,
  ],
  [
    'Development draft',
    'One practical reply next',
    ['Editorial draft · one greeting only.', 'Omit when unavailable in production.'],
    'Continue my plan',
    false,
  ],
];
states.forEach(([tag, title, body, action, disabled], i) => {
  const x = 30 + (i % 2) * 650,
    y = 120 + Math.floor(i / 2) * 288,
    t = i % 2 ? palette.dark : palette.light;
  box(x, y, 620, 263, t.bg, 20, t.border);
  txt(x + 22, y + 34, tag.toUpperCase(), 12, t.secondary, 700);
  txt(x + 22, y + 73, title, 26, t.text, 700);
  lines(x + 22, y + 109, body, 17, t.secondary);
  if (disabled) {
    box(x + 22, y + 183, 576, 52, t.disabledBg, 13);
    txt(x + 40, y + 216, action, 17, t.disabledText, 700);
  } else button(t, x + 22, y + 183, 576, action);
});
txt(
  30,
  1020,
  'Catch-up is a bounded recommendation; old unfinished plans win over a new day. No decorative step creates state.',
  16,
  '#486258',
);
save('plan-states', 1320, 1040);
