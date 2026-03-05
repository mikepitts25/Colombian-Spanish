#!/usr/bin/env node
// Fix apostrophes in example strings - convert single quotes to double quotes

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Match example: '...' with apostrophes inside
  const regex = /example: '([^']*'[a-zA-Z][^']*)'/g;
  
  content = content.replace(regex, (match, p1) => {
    fixed++;
    // Escape any double quotes in the content
    const escaped = p1.replace(/"/g, '\\"');
    return `example: "${escaped}"`;
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixed} examples in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed} examples across ${files.length} files`);
