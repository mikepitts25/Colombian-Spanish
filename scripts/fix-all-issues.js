#!/usr/bin/env node
// Fix ALL syntax errors in deck files comprehensively

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Fix example lines that end with single quote instead of backtick
  content = content.replace(/example: `([^`]+)'(\s*,)$/gm, (match, p1, p2) => {
    fixed++;
    return `example: \`${p1}\`${p2}`;
  });
  
  // Fix front lines that end with single quote instead of backtick  
  content = content.replace(/front: `([^`]+)'(\s*,)$/gm, (match, p1, p2) => {
    fixed++;
    return `front: \`${p1}\`${p2}`;
  });
  
  // Fix back lines that end with single quote instead of backtick
  content = content.replace(/back: `([^`]+)'(\s*,)$/gm, (match, p1, p2) => {
    fixed++;
    return `back: \`${p1}\`${p2}`;
  });
  
  // Fix stray double quotes inside backtick strings (replace with single quote)
  content = content.replace(/`([^`]*)"([^`]*)`/g, (match, p1, p2) => {
    if (match.includes('"') && !match.includes("'")) {
      fixed++;
      return `\`${p1}'${p2}\``;
    }
    return match;
  });
  
  // Remove escaped quotes that shouldn't be escaped
  content = content.replace(/\\'/g, "'");
  
  // Fix mixed quote starts/ends
  // If line starts with example: ' and ends with `, fix it
  content = content.replace(/example: '([^']+)`(\s*,)$/gm, (match, p1, p2) => {
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
