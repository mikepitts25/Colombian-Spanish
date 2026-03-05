#!/usr/bin/env node
// Fix remaining syntax errors in deck files

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Fix id: '...` → id: '...'
  content = content.replace(/id: '([a-z0-9-]*)`\s*,/g, (match, p1) => {
    fixed++;
    return `id: '${p1}',`;
  });
  
  // Fix example: `...'` → example: `...`
  content = content.replace(/example: `([^`]+)'(\s*,)$/gm, (match, p1, p2) => {
    fixed++;
    return `example: \`${p1}\`${p2}`;
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixed} issues in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed}`);
