#!/usr/bin/env node
// Validate all deck files for syntax errors

const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '..', 'src/data/decks');
const files = fs.readdirSync(decksDir).filter(f => f.endsWith('.ts'));

let totalErrors = 0;

files.forEach(file => {
  const filePath = path.join(decksDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let errors = [];
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // Check for example: with mixed quotes (starts with ", ends with ` or vice versa)
    if (line.includes('example:')) {
      const exampleMatch = line.match(/example:\s*(["'`])(.*?)\1\s*,?$/);
      if (!exampleMatch) {
        // Check for malformed example
        if (line.match(/example:\s*"[^"]*`/) || line.match(/example:\s*`[^`]*"/) ||
            line.match(/example:\s*'[^']*`/) || line.match(/example:\s*`[^`]*'/)) {
          errors.push({line: lineNum, text: line.trim(), issue: 'Mixed quote styles'});
        } else if (line.match(/example:\s*["'`]/) && !line.match(/example:\s*[`"'].*[`"']\s*,?$/)) {
          errors.push({line: lineNum, text: line.trim(), issue: 'Unterminated or malformed string'});
        }
      }
    }
    
    // Check for front: with mixed quotes
    if (line.includes('front:')) {
      const match = line.match(/front:\s*(["'`])(.*?)\1\s*,?$/);
      if (!match && line.match(/front:\s*["']/)) {
        errors.push({line: lineNum, text: line.trim(), issue: 'Malformed front string'});
      }
    }
    
    // Check for back: with mixed quotes
    if (line.includes('back:')) {
      const match = line.match(/back:\s*(["'`])(.*?)\1\s*,?$/);
      if (!match && line.match(/back:\s*["']/)) {
        errors.push({line: lineNum, text: line.trim(), issue: 'Malformed back string'});
      }
    }
    
    // Check for unclosed template literals
    const openBackticks = (line.match(/`/g) || []).length;
    if (openBackticks % 2 !== 0 && !line.includes('${')) {
      // Check if it's part of a multiline (next line continues)
      if (idx < lines.length - 1 && !lines[idx + 1].includes('`')) {
        // Might be unclosed, check context
        if (line.match(/example:\s*`[^`]*$/) || line.match(/front:\s*`[^`]*$/) || line.match(/back:\s*`[^`]*$/)) {
          errors.push({line: lineNum, text: line.trim(), issue: 'Possibly unterminated backtick string'});
        }
      }
    }
  });
  
  if (errors.length > 0) {
    console.log(`\n❌ ${file}:`);
    errors.forEach(err => {
      console.log(`  Line ${err.line}: ${err.issue}`);
      console.log(`    ${err.text.substring(0, 80)}...`);
    });
    totalErrors += errors.length;
  }
});

if (totalErrors === 0) {
  console.log('✅ All files look good! No obvious syntax errors found.');
} else {
  console.log(`\n❌ Total errors found: ${totalErrors}`);
  process.exit(1);
}
