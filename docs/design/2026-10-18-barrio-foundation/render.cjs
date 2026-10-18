// Review artifacts only. Does not import, build or mutate the app.
const fs = require('node:fs');
const path = require('node:path');
const { Resvg } = require(process.argv[2] || '@resvg/resvg-js');
const palette = JSON.parse(fs.readFileSync(path.join(__dirname, 'palette.json'), 'utf8'));
const escape = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
let parts;
function rect(x, y, w, h, fill, r = 0, stroke = 'none', sw = 1) {
  parts.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,
  );
}
function text(x, y, value, size, color, weight = 400, anchor = 'start') {
  parts.push(
    `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${escape(value)}</text>`,
  );
}
function line(x, y, w, color, sw = 1) {
  parts.push(`<path d="M${x} ${y}h${w}" fill="none" stroke="${color}" stroke-width="${sw}"/>`);
}
function button(t, x, y, w, label, state = 'normal') {
  const disabled = state === 'disabled';
  if (state === 'focus') rect(x - 5, y - 5, w + 10, 58, 'none', 17, t.focus, 2);
  rect(
    x,
    y,
    w,
    48,
    disabled ? t.disabledBg : state === 'pressed' ? t.primaryPressed : t.primary,
    12,
  );
  text(x + w / 2, y + 30, label, 16, disabled ? t.disabledText : t.onPrimary, 700, 'middle');
}
function art(t, x, y) {
  rect(x, y, 92, 68, t.raised, 16);
  parts.push(
    `<path d="M${x + 9} ${y + 46}Q${x + 27} ${y + 12} ${x + 45} ${y + 40}Q${x + 65} ${y + 14} ${x + 84} ${y + 46}" fill="none" stroke="${t.secondary}" stroke-width="1.8"/>`,
  );
  rect(x + 31, y + 28, 29, 24, t.surface, 5);
  parts.push(
    `<path d="M${x + 60} ${y + 33}C${x + 76} ${y + 27} ${x + 76} ${y + 51} ${x + 60} ${y + 46}M${x + 26} ${y + 56}h40" fill="none" stroke="${t.accent}" stroke-width="2.6"/>`,
  );
}
function navIcon(t, x, y, i, active) {
  const color = active ? t.primary : t.secondary;
  const paths = [
    `M${x - 8} ${y}l8-7 8 7v10h-6v-6h-4v6h-6z`,
    `M${x} ${y + 10}V${y - 6}M${x - 10} ${y - 6}q5-2 10 1q5-3 10-1v15q-5-2-10 1q-5-3-10-1z`,
    `M${x - 9} ${y + 10}v-8h5v8m4 0V${y - 5}h5v15m4 0V${y - 10}h5v20`,
    `M${x - 9} ${y - 6}h18M${x - 9} ${y + 1}h18M${x - 9} ${y + 8}h18`,
  ];
  parts.push(
    `<path d="${paths[i]}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/>`,
  );
  if (i === 3)
    for (const [dx, dy] of [
      [-3, -6],
      [4, 1],
      [-1, 8],
    ])
      parts.push(
        `<circle cx="${x + dx}" cy="${y + dy}" r="2.5" fill="${t.surface}" stroke="${color}" stroke-width="1.5"/>`,
      );
}
function phone(t, en) {
  rect(0, 0, 390, 844, t.bg, 28, t.border);
  text(24, 29, '9:41', 13, t.text, 700);
  text(343, 29, '●', 12, t.text);
  text(24, 74, 'COLOMBIAN SPANISH', 11, t.secondary, 700);
  text(24, 116, en ? 'Good morning!' : '¡Buenos días!', 30, t.text, 700);
  text(24, 145, en ? 'Ready to learn today?' : '¿Listo para aprender hoy?', 16, t.secondary);
  rect(24, 176, 342, 296, t.surface, 20);
  text(44, 207, en ? 'TODAY' : 'HOY', 12, t.secondary, 700);
  text(44, 242, en ? '6 reviews due' : '6 repasos', 26, t.text, 700);
  if (!en) text(44, 271, 'pendientes', 26, t.text, 700);
  art(t, 254, 218);
  text(
    44,
    307,
    en ? 'New cards available today: 4' : 'Tarjetas nuevas disponibles: 4',
    14,
    t.secondary,
  );
  text(44, 340, en ? 'Daily goal' : 'Meta diaria', 14, t.secondary);
  text(345, 340, '2/5', 14, t.text, 700, 'end');
  rect(44, 352, 302, 6, t.raised, 3);
  rect(44, 352, 121, 6, t.primary, 3);
  text(44, 389, en ? 'About 3 min · estimate' : 'Unos 3 min · estimación', 14, t.secondary);
  button(t, 44, 410, 302, en ? 'Start daily plan' : 'Empezar mi plan diario');
  text(24, 515, en ? 'A word for today' : 'Una palabra para hoy', 20, t.text, 700);
  rect(24, 532, 342, 106, t.surface, 16);
  text(44, 570, 'tinto', 26, t.text, 700);
  text(44, 597, 'black coffee (small cup)', 14, t.secondary);
  text(44, 620, 'Colombian Food', 12, t.secondary);
  rect(298, 549, 48, 48, t.raised, 12, t.border);
  parts.push(
    `<path d="M309 567h5l7-6v24l-7-6h-5zM326 566q7 7 0 14" fill="none" stroke="${t.primary}" stroke-width="2"/>`,
  );
  const labels = en
    ? ['Quiz', 'Difficult words', 'Phrases', 'Add card']
    : ['Quiz', 'Difíciles', 'Frases', 'Agregar'];
  labels.forEach((label, i) => {
    const x = 24 + (i % 2) * 176,
      y = 659 + Math.floor(i / 2) * 56;
    rect(x, y, 166, 48, t.raised, 12);
    text(x + 83, y + 30, label, 15, t.text, 700, 'middle');
  });
  rect(0, 778, 390, 66, t.surface, 0);
  const tabs = en
    ? ['Home', 'Study', 'Progress', 'Settings']
    : ['Inicio', 'Estudiar', 'Progreso', 'Ajustes'];
  tabs.forEach((label, i) => {
    const x = 48 + i * 98;
    if (!i) rect(x - 33, 787, 66, 49, t.raised, 12);
    navIcon(t, x, 800, i, i === 0);
    text(x, 828, label, 13, i === 0 ? t.primary : t.secondary, i === 0 ? 700 : 400, 'middle');
  });
}
function output(file, w, h) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${parts.join('\n')}</svg>`;
  fs.writeFileSync(path.join(__dirname, file + '.svg'), svg);
  fs.writeFileSync(
    path.join(__dirname, file + '.png'),
    new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng(),
  );
}
parts = [];
rect(0, 0, 1120, 1110, '#E8E9E3');
text(56, 54, 'Barrio · one identity, two appearances', 30, '#18352F', 700);
text(
  56,
  87,
  'Review proposal · Original artwork · Illustrative counts · Existing four tabs and learning routes',
  15,
  '#486258',
);
[
  ['light', false, 80, 'Light · español'],
  ['dark', true, 650, 'Dark · English'],
].forEach(([mode, en, x, label]) => {
  text(x, 145, label, 20, '#18352F', 700);
  parts.push(`<g transform="translate(${x},168)">`);
  phone(palette[mode], en);
  parts.push('</g>');
});
text(
  56,
  1066,
  'Review-only example. Draft exercises remain gated. Neither image is native layout or accessibility evidence.',
  14,
  '#486258',
);
output('home-light-dark', 1120, 1110);
parts = [];
rect(0, 0, 1440, 1170, '#E8E9E3');
text(44, 52, 'Barrio · controls and semantic states', 30, '#18352F', 700);
text(
  44,
  85,
  'Minimum 48-point actions · Scalable text · Labels plus color · System fonts · No required animation',
  16,
  '#486258',
);
Object.entries(palette).forEach(([mode, t], index) => {
  const x = 44 + index * 698;
  rect(x, 120, 654, 985, t.bg, 24);
  text(x + 24, 164, mode === 'light' ? 'Light appearance' : 'Dark appearance', 24, t.text, 700);
  [
    ['Background', 'bg'],
    ['Surface', 'surface'],
    ['Text', 'text'],
    ['Primary', 'primary'],
    ['Accent', 'accent'],
  ].forEach(([label, key], i) => {
    const sx = x + 24 + i * 123;
    rect(sx, 184, 106, 44, t[key], 10, t.border);
    text(sx, 248, label, 12, t.secondary);
    text(sx, 268, t[key], 12, t.text, 700);
  });
  const states = [
    ['normal', 'Start daily plan'],
    ['pressed', 'Start daily plan'],
    ['focus', 'Start daily plan'],
    ['disabled', 'Audio unavailable'],
  ];
  states.forEach(([state, label], i) => {
    const y = 303 + i * 72;
    text(x + 24, y + 28, state[0].toUpperCase() + state.slice(1), 14, t.secondary, 600);
    button(t, x + 173, y, 449, label, state);
  });
  text(x + 24, 628, 'Your answer', 16, t.text, 700);
  rect(x + 24, 644, 606, 62, t.surface, 12, t.border, 1.5);
  text(x + 42, 683, 'Buenos días', 20, t.text);
  rect(x + 19, 639, 616, 72, 'none', 17, t.focus, 2);
  text(x + 24, 736, 'Visible focus · preserved input · no color-only errors', 14, t.secondary);
  rect(x + 24, 760, 606, 126, t.dangerMuted, 16, t.danger);
  text(x + 44, 795, '!  Could not save', 18, t.danger, 700);
  text(x + 44, 822, 'Your response is retained. Try again.', 16, t.danger);
  text(x + 44, 860, 'Retry save →', 16, t.danger, 700);
  [
    ['Success', 'success', 'successMuted'],
    ['Information', 'info', 'infoMuted'],
    ['Warning', 'warning', 'warningMuted'],
  ].forEach(([label, fg, bg], i) => {
    const sx = x + 24 + i * 204;
    rect(sx, 912, 194, 58, t[bg], 12);
    text(sx + 12, 948, label, 15, t[fg], 700);
  });
  text(x + 24, 1013, 'Decorative accents never replace a label or state icon.', 14, t.secondary);
  text(
    x + 24,
    1040,
    'Runtime layouts must grow, scroll and respect reduced motion.',
    14,
    t.secondary,
  );
});
text(
  44,
  1142,
  'Static design only · Explicit color-pair calculations are in contrast-report.json · Runtime, keyboard and device checks remain separate.',
  14,
  '#486258',
);
output('controls-light-dark', 1440, 1170);
function luminance(hex) {
  return hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
}
const pairs = [];
for (const [appearance, t] of Object.entries(palette)) {
  const checks = [];
  for (const fg of ['text', 'secondary', 'tertiary'])
    for (const bg of ['bg', 'surface', 'raised', 'pressed']) checks.push([fg, bg, 4.5]);
  for (const bg of ['primary', 'primaryPressed']) checks.push(['onPrimary', bg, 4.5]);
  for (const state of ['danger', 'success', 'warning', 'info'])
    checks.push([state, state + 'Muted', 4.5]);
  checks.push(
    ['disabledText', 'disabledBg', 4.5],
    ['primary', 'raised', 4.5],
    ['accent', 'bg', 4.5],
  );
  for (const bg of ['bg', 'surface', 'raised']) checks.push(['border', bg, 3], ['focus', bg, 3]);
  for (const [foreground, background, target] of checks) {
    const a = luminance(t[foreground]),
      b = luminance(t[background]);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    pairs.push({
      appearance,
      foreground,
      background,
      foregroundHex: t[foreground],
      backgroundHex: t[background],
      ratio: Number(ratio.toFixed(3)),
      target,
      pass: ratio >= target,
    });
  }
}
fs.writeFileSync(
  path.join(__dirname, 'contrast-report.json'),
  JSON.stringify(
    { scope: 'Proposed opaque token pairs only; not runtime/accessibility certification', pairs },
    null,
    2,
  ) + '\n',
);
const failed = pairs.filter((p) => !p.pass);
console.log(`${pairs.length} proposed pairs checked; ${failed.length} below project targets.`);
if (failed.length) {
  console.log(failed);
  process.exitCode = 1;
}
