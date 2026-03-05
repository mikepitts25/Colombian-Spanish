#!/usr/bin/env node
// Fix all remaining quote issues - replace \" with ' and fix mixed quotes

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Replace escaped quote \" with apostrophe '
  content = content.replace(/\\"/g, () => {
    fixed++;
    return "'";
  });
  
  // Fix any remaining mixed: example: "...' (double start, single end)
  content = content.replace(/example: "([^"]*)'\s*,$/gm, (match, p1) => {
    fixed++;
    return `example: \`${p1}\`,`;
  });
  
  // Fix any remaining mixed: example: '..." (single start, double end)
  content = content.replace(/example: '([^']*)"\s*,$/gm, (match, p1) => {
    fixed++;
    return `example: \`${p1}\`,`;
  });
  
  // Fix any remaining example: "..." (convert to backticks)
  content = content.replace(/example: "([^"]*)"\s*,$/gm, (match, p1) => {
    fixed++;
    return `example: \`${p1}\`,`;
  });
  
  // Fix any remaining example: '...' (convert to backticks)
  content = content.replace(/example: '([^']*)'\s*,$/gm, (match, p1) => {
    fixed++;
    return `example: \`${p1}\`,`;
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixed} issues in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed}`);
