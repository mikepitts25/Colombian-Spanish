// Shared by device speech and the Node recording generator.
function sentence(text) {
  return /[.!?…]$/.test(text) ? text : `${text}.`;
}

function expandEnding(word, ending) {
  if (/^[ao]s?$/i.test(ending)) {
    return word.replace(/[aeo]s?$/i, '') + ending;
  }
  return ending;
}

function pronunciationText(text) {
  if (!text.includes('/')) return text;
  // Inline notation belongs to a word; repeat the surrounding phrase for each form.
  const inline = /([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)((?:\/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+)/;
  const match = inline.exec(text);
  if (match) {
    const [original, word, endings] = match;
    return [
      word,
      ...endings
        .slice(1)
        .split('/')
        .map((ending) => expandEnding(word, ending)),
    ]
      .map((form) =>
        pronunciationText(
          text.slice(0, match.index) + form + text.slice(match.index + original.length),
        ),
      )
      .map(sentence)
      .join(' ');
  }
  // Spaced slashes usually separate complete alternatives. A single related word
  // ("Estoy perdido / perdida") inherits the first phrase's context.
  const parts = text
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  const first = /^(.*\s)?([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)([.!?…]*)$/.exec(parts[0] || '');
  return parts
    .map((part, index) => {
      if (
        index &&
        first &&
        /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/.test(part) &&
        first[2].replace(/[ao]$/, '') === part.replace(/[ao]$/, '')
      ) {
        part = (first[1] || '') + part + first[3];
      }
      return sentence(part);
    })
    .join(' ');
}

module.exports = { pronunciationText };
