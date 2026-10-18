/* Original SVG proposal artwork. Run: node render.cjs /absolute/path/to/@resvg/resvg-js */
const fs = require('node:fs');
const path = require('node:path');
const { Resvg } = require(process.argv[2] || '@resvg/resvg-js');
const themes = [
  {
    name: 'A · Barrio',
    note: 'Warm, calm and practical · recommended',
    bg: '#F7F3EA',
    panel: '#FFFFFF',
    ink: '#18352F',
    muted: '#486258',
    primary: '#23624E',
    on: '#FFFFFF',
    accent: '#B7562F',
    soft: '#E7EBDD',
  },
  {
    name: 'B · Noche',
    note: 'Continuity with the current dark theme',
    bg: '#0B1220',
    panel: '#162238',
    ink: '#F4F5F0',
    muted: '#B5C3D6',
    primary: '#FFD75A',
    on: '#172238',
    accent: '#F5B596',
    soft: '#24364A',
  },
  {
    name: 'C · Ruta',
    note: 'A visible path through the daily practice',
    bg: '#F3F7FA',
    panel: '#FFFFFF',
    ink: '#172A4A',
    muted: '#4D6080',
    primary: '#254BBD',
    on: '#FFFFFF',
    accent: '#147B83',
    soft: '#E4ECF9',
  },
];
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
let parts = [];
function rect(x, y, w, h, fill, r = 0, stroke = 'none') {
  parts.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`,
  );
}
function text(x, y, s, size, fill, weight = 400) {
  parts.push(
    `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`,
  );
}
function lines(x, y, arr, size, fill, gap = 24, weight = 400) {
  arr.forEach((s, i) => text(x, y + i * gap, s, size, fill, weight));
}
function button(t, y, label, secondary = false) {
  rect(24, y, 342, 52, secondary ? t.soft : t.primary, 14);
  text(195, y + 33, label, 16, secondary ? t.ink : t.on, 700);
}
function startScreen(t, title) {
  rect(0, 0, 390, 844, t.bg, 24);
  text(24, 30, '9:41', 13, t.ink, 700);
  text(316, 30, '● ▰', 13, t.ink);
  text(24, 76, 'COLOMBIAN SPANISH', 12, t.muted, 700);
  text(24, 122, title, 29, t.ink, 700);
}
function nav(t, active) {
  rect(0, 770, 390, 74, t.panel);
  ['Inicio', 'Estudiar', 'Progreso', 'Ajustes'].forEach((s, i) => {
    const x = 24 + i * 96;
    rect(x + 17, 781, 22, 4, s === active ? t.primary : t.soft, 2);
    text(x, 815, s, 13, s === active ? t.primary : t.muted, s === active ? 700 : 400);
  });
}
function art(t, x, y) {
  rect(x, y, 100, 72, t.soft, 14);
  parts.push(
    `<path d="M${x + 8} ${y + 48} Q${x + 28} ${y + 8} ${x + 49} ${y + 40} Q${x + 70} ${y + 10} ${x + 92} ${y + 48}" fill="none" stroke="${t.muted}" stroke-width="2"/>`,
  );
  rect(x + 35, y + 28, 28, 24, t.panel, 5);
  parts.push(
    `<path d="M${x + 63} ${y + 33} C${x + 80} ${y + 29} ${x + 80} ${y + 51} ${x + 63} ${y + 47} M${x + 30} ${y + 56} H${x + 69}" fill="none" stroke="${t.accent}" stroke-width="3"/>`,
  );
}
function home(t, variant) {
  startScreen(t, 'Buenos días.');
  text(24, 152, 'Un paso útil para tu día.', 16, t.muted);
  rect(24, 178, 342, 314, t.panel, 20);
  text(44, 210, 'TU PLAN DE HOY', 12, t.muted, 700);
  text(44, 244, 'Un saludo por', 25, t.ink, 700);
  text(44, 274, 'la mañana', 25, t.ink, 700);
  art(t, 246, 218);
  text(44, 318, '6 repasos + 1 respuesta escrita', 16, t.ink);
  text(44, 344, 'Unos 5 min · estimación', 14, t.muted);
  rect(44, 363, 131, 25, t.soft, 8);
  text(54, 381, 'Respuesta: borrador', 11, t.ink, 700);
  if (variant === 2) {
    text(44, 413, '01 Repasa   →   02 Responde', 14, t.accent, 700);
  } else {
    text(44, 413, 'Pequeña práctica, uso cotidiano.', 14, t.muted);
  }
  button(t, 430, 'Empezar mi plan');
  text(24, 530, 'Una palabra para hoy', 20, t.ink, 700);
  rect(24, 548, 342, 96, t.panel, 16);
  text(44, 584, 'tinto', 26, t.ink, 700);
  text(44, 611, 'Café negro · ver palabra →', 15, t.muted);
  rect(277, 565, 70, 24, t.soft, 7);
  text(287, 582, 'Borrador', 11, t.ink);
  rect(24, 665, 164, 64, t.soft, 14);
  rect(202, 665, 164, 64, t.soft, 14);
  text(44, 703, 'Explorar →', 16, t.ink, 700);
  text(222, 703, 'Guardadas →', 16, t.ink, 700);
  nav(t, 'Inicio');
}
function mission(t) {
  startScreen(t, 'Una respuesta práctica');
  text(24, 151, 'Texto · saludo de la mañana', 15, t.muted);
  rect(24, 178, 342, 33, t.soft, 9);
  text(37, 200, 'BORRADOR EDITORIAL · VISTA PREVIA', 11, t.ink, 700);
  art(t, 145, 238);
  text(24, 352, 'Saluda al personal', 25, t.ink, 700);
  lines(24, 390, ['Saluda al llegar por la mañana.'], 16, t.muted);
  text(24, 444, 'Tu respuesta', 14, t.ink, 700);
  rect(24, 460, 342, 64, t.panel, 12, t.muted);
  text(42, 500, 'Buenos días', 20, t.ink);
  text(24, 551, '¿Necesitas ayuda? Ver pista', 15, t.primary, 700);
  button(t, 580, 'Comprobar respuesta');
  lines(24, 676, ['Práctica de escritura.', 'No evalúa escucha, voz ni nivel.'], 14, t.muted, 23);
  text(24, 752, '← Salir de la práctica', 15, t.primary, 700);
}
function progress(t) {
  startScreen(t, 'Tu práctica, más clara');
  text(24, 152, 'Actividad ilustrativa · esta semana', 15, t.muted);
  rect(24, 182, 342, 110, t.panel, 18);
  text(44, 216, 'SEÑALES SEPARADAS', 12, t.muted, 700);
  text(44, 254, 'Cada habilidad cuenta su historia.', 16, t.ink, 700);
  const rows = [
    ['Reconocimiento', '8 respuestas comprobadas'],
    ['Recuerdo escrito', '3 respuestas sin pista'],
    ['Con ayuda', '2 respuestas con pista'],
    ['Tarjetas', '12 repasos autoevaluados'],
  ];
  rows.forEach((r, i) => {
    let y = 312 + i * 78;
    rect(24, y, 342, 68, t.panel, 13);
    text(42, y + 26, r[0], 17, t.ink, 700);
    text(42, y + 51, r[1], 14, t.muted);
  });
  lines(
    24,
    653,
    ['Escucha y voz: sin datos en este ejemplo.', 'La actividad no equivale a dominio.'],
    14,
    t.muted,
    23,
  );
  button(t, 704, 'Ir a Estudiar');
  nav(t, 'Progreso');
}
function board(file, title, subtitle, frames) {
  parts = [];
  rect(0, 0, 1320, 1100, '#E8E9E6');
  text(42, 53, title, 29, '#18352F', 700);
  text(42, 85, subtitle, 15, '#486258');
  frames.forEach((f, i) => {
    let x = 42 + i * 418;
    text(x, 131, f.label, 21, '#18352F', 700);
    text(x, 158, f.note, 13, '#486258');
    parts.push(`<g transform="translate(${x},184)">`);
    f.draw();
    parts.push('</g>');
  });
  text(
    42,
    1064,
    'PROPOSAL ONLY · Illustrative data · Editorial drafts remain gated · Static artwork is not native accessibility evidence.',
    14,
    '#486258',
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="1100" viewBox="0 0 1320 1100">${parts.join('\n')}</svg>`;
  fs.writeFileSync(path.join(__dirname, file + '.svg'), svg);
  fs.writeFileSync(
    path.join(__dirname, file + '.png'),
    new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng(),
  );
}
// Center button labels independently from ordinary left-aligned text.
const originalText = text;
text = function (x, y, s, size, fill, weight = 400) {
  if (x === 195) {
    parts.push(
      `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`,
    );
  } else originalText(x, y, s, size, fill, weight);
};
board(
  'home-directions',
  'Three directions. One useful daily action.',
  'Compare visual character with the same proposed content and navigation.',
  themes.map((t, i) => ({ label: t.name, note: t.note, draw: () => home(t, i) })),
);
board(
  'barrio-flow',
  'Barrio · a calm path from plan to practice',
  'Recommended direction for review; this does not enable draft content in production.',
  [
    {
      label: '01 · Home',
      note: 'One primary action; secondary tools stay reachable.',
      draw: () => home(themes[0], 0),
    },
    {
      label: '02 · Written response',
      note: 'The current greeting draft, after daily reviews.',
      draw: () => mission(themes[0]),
    },
    {
      label: '03 · Progress',
      note: 'Activity and assistance are distinct from mastery.',
      draw: () => progress(themes[0]),
    },
  ],
);
