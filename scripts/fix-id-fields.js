#!/usr/bin/env node
// Fix all syntax errors including id fields with wrong quotes

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Fix id: '...` (single quote start, backtick end)
  content = content.replace(/id: '([^']*)`\s*,$/gm, (match, p1) => {
    fixed++;
    return `id: '${p1}',`;
  });
  
  // Fix id: `...' (backtick start, single quote end)
  content = content.replace(/id: `([^`]*)'\s*,$/gm, (match, p1) => {
    fixed++;
    return `id: '${p1}',`;
  });
  
  // Fix id: "...` (double quote start, backtick end)
  content = content.replace(/id: "([^"]*)`\s*,$/gm, (match, p1) => {
    fixed++;
    return `id: '${p1}',`;
  });
  
  // Fix id: `...` (backticks should be single quotes for IDs)
  content = content.replace(/id: `([^`]*)`\s*,$/gm, (match, p1) => {
    fixed++;
    return `id: '${p1}',`;
  });
  
  // Fix tags: [`...`] (backticks in tags array should be single quotes)
  content = content.replace(/tags: \[`([^`]*)`\]/g, (match, p1) => {
    fixed++;
    return `tags: ['${p1}']`;
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixed} issues in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed}`);
