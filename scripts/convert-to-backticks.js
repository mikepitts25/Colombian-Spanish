#!/usr/bin/env node
// Convert ALL example strings to template literals (backticks)
// This safely handles any combination of quotes inside

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Match example: '...' or example: "..." (properly quoted)
  // and convert to example: `...`
  const regex = /example: (['"`])((?:\\\1|[^\1])*?)\1(,?)$/gm;
  
  content = content.replace(regex, (match, quote, inner, trailing) => {
    // Unescape any escaped quotes that match the outer quote
    const unescaped = inner.replace(new RegExp('\\\\' + quote, 'g'), quote);
    fixed++;
    return `example: \`${unescaped}\`${trailing}`;
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Converted ${fixed} examples in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal converted: ${totalFixed} examples`);
