#!/usr/bin/env node
// Convert ALL front, back, and example strings to template literals

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Match front: '...' or front: "..." and convert to backticks
  content = content.replace(/front: (['"])((?:\\\1|[^\1])*?)\1(,?)$/gm, (match, quote, inner, trailing) => {
    const unescaped = inner.replace(new RegExp('\\\\' + quote, 'g'), quote);
    fixed++;
    return `front: \`${unescaped}\`${trailing}`;
  });
  
  // Match back: '...' or back: "..." and convert to backticks
  content = content.replace(/back: (['"])((?:\\\1|[^\1])*?)\1(,?)$/gm, (match, quote, inner, trailing) => {
    const unescaped = inner.replace(new RegExp('\\\\' + quote, 'g'), quote);
    fixed++;
    return `back: \`${unescaped}\`${trailing}`;
  });
  
  // Match example: `...` that might have malformed content
  // Fix any that have mixed quotes like `..."...'` 
  content = content.replace(/example: `([^`]*)"([^']*)'\s*,$/gm, (match, p1, p2) => {
    fixed++;
    return `example: \`${p1}"${p2}\`,`;
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixed} strings in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed} strings`);
