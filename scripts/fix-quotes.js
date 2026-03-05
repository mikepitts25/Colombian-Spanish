#!/usr/bin/env node
// Fix malformed quote escaping in example strings

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;
  
  // Match example: "..." with escaped quotes or mixed quotes
  // The pattern matches example strings that have issues
  const regex = /example: "([^"]*)\\"([^"]*)'\s*,$/gm;
  
  content = content.replace(regex, (match, p1, p2) => {
    fixed++;
    // Combine the parts and replace escaped quote with apostrophe
    const combined = p1 + '"' + p2;
    // Use template literal (backticks) to safely contain any quotes
    return `example: \`${combined}\`,`;
  });
  
  // Also fix: example: "...", that ends with single quote
  const regex2 = /example: "([^"]*)'\s*,$/gm;
  content = content.replace(regex2, (match, p1) => {
    fixed++;
    return `example: \`${p1}\`,`;
  });
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${fixed} examples in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed} examples`);
