#!/usr/bin/env node
// Fix ALL quote mismatches comprehensively

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let fixed = 0;
  let newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if line contains example: with mismatched quotes
    // Pattern: example: "...' or example: '..."
    if (line.match(/example:\s*["']/) && line.match(/['"]\s*,?$/)) {
      const firstQuote = line.match(/example:\s*(["'])/)?.[1];
      const lastQuote = line.match(/(["'`])\s*,?$/)?.[1];
      
      if (firstQuote && lastQuote && firstQuote !== lastQuote) {
        // Extract content between quotes
        const match = line.match(/example:\s*["'](.+)["'`]\s*,?$/);
        if (match) {
          let inner = match[1];
          // Replace escaped quotes with apostrophes
          inner = inner.replace(/\\"/g, "'");
          line = `example: \`${inner}\`,`;
          fixed++;
        }
      }
    }
    
    newLines.push(line);
  }
  
  if (fixed > 0) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`Fixed ${fixed} lines in ${file}`);
    totalFixed += fixed;
  }
});

console.log(`\nTotal fixed: ${totalFixed}`);
