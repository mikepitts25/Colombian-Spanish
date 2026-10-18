/* eslint-env node */
// Original 24-unit monoline glyphs; PNGs are bundled so no SVG runtime is needed.
const fs = require('fs');
const { Resvg } = require(process.env.BARRIO_RESVG_MODULE || '@resvg/resvg-js');
const paths = {
  home: '<path d="m3 10 9-7 9 7v10H6V10m4 10v-7h4v7"/>',
  study: '<path d="M12 5C9 3 5 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1v15"/>',
  progress: '<path d="M5 20v-7m7 7V8m7 12V3M3 21h19"/>',
  settings:
    '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="white"/><circle cx="15" cy="17" r="3" fill="white"/>',
  audio: '<path d="M10 5 5 9H2v6h3l5 4V5m5 3c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
  add: '<path d="M12 4v16M4 12h16"/>',
  back: '<path d="m12 4-8 8 8 8M4 12h17"/>',
};
for (const [name, content] of Object.entries(paths)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
  fs.writeFileSync(`${__dirname}/${name}.svg`, svg);
  fs.writeFileSync(
    `${__dirname}/${name}.png`,
    new Resvg(svg, { fitTo: { mode: 'width', value: 96 } }).render().asPng(),
  );
}
