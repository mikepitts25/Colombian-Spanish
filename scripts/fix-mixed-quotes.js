#!/usr/bin/env node
// Fix all mixed quote errors

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Fix example: "...` (starts with double quote, ends with backtick)
  content = content.replace(/example: "([^"]*)`\s*,$/gm, (match, p1) => {
    fixed++;
    return `example: \`${p1}\`,`;
  });
  
  // Fix example: '...` (starts with single quote, ends with backtick)
  content = content.replace(/example: '([^']*)`\s*,$/gm, (match, p1) => {
    fixed++;
    return `example: \`${p1}\`,`;
  });
  
  // Fix back: "...` (starts with double quote, ends with backtick)
  content = content.replace(/back: "([^"]*)`\s*,$/gm, (match, p1) => {
    fixed++;
    return `back: \`${p1}\`,`;
  });
  
  // Fix back: '...` (starts with single quote, ends with backtick)
  content = content.replace(/back: '([^']*)`\s*,$/gm, (match, p1) => {
    fixed++;
    return `back: \`${p1}\`,`;
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixed} mixed quotes in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed}`);
