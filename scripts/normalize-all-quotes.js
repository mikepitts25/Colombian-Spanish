#!/usr/bin/env node
// Mass fix all quote issues - normalize everything

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Fix id: `...` → id: '...' (backticks to single quotes for IDs)
  content = content.replace(/id: `([^`]*)`/g, (match, p1) => {
    fixed++;
    return `id: '${p1}'`;
  });
  
  // Fix id: "..." → id: '...' (double quotes to single quotes for IDs)
  content = content.replace(/id: "([^"]*)"/g, (match, p1) => {
    fixed++;
    return `id: '${p1}'`;
  });
  
  // Fix front: '...' → front: `...` (single quotes to backticks)
  content = content.replace(/front: '([^']*)'/g, (match, p1) => {
    fixed++;
    return `front: \`${p1}\``;
  });
  
  // Fix front: "..." → front: `...` (double quotes to backticks)
  content = content.replace(/front: "([^"]*)"/g, (match, p1) => {
    fixed++;
    return `front: \`${p1}\``;
  });
  
  // Fix back: '...' → back: `...` (single quotes to backticks)
  content = content.replace(/back: '([^']*)'/g, (match, p1) => {
    fixed++;
    return `back: \`${p1}\``;
  });
  
  // Fix back: "..." → back: `...` (double quotes to backticks)
  content = content.replace(/back: "([^"]*)"/g, (match, p1) => {
    fixed++;
    return `back: \`${p1}\``;
  });
  
  // Fix example: '...' → example: `...` (single quotes to backticks)
  content = content.replace(/example: '([^']*)'/g, (match, p1) => {
    fixed++;
    return `example: \`${p1}\``;
  });
  
  // Fix example: "..." → example: `...` (double quotes to backticks)
  content = content.replace(/example: "([^"]*)"/g, (match, p1) => {
    fixed++;
    return `example: \`${p1}\``;
  });
  
  // Fix escaped quotes \\\" → '
  content = content.replace(/\\"/g, () => {
    fixed++;
    return "'";
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixed} issues in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed}`);
