#!/usr/bin/env node
// Comprehensive syntax validation for all deck files

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
  let braceStack = [];
  let bracketStack = [];
  let inString = false;
  let stringChar = null;
  let lineNumber = 0;
  
  for (let i = 0; i < lines.length; i++) {
    lineNumber = i + 1;
    const line = lines[i];
    
    // Skip empty lines and comments
    if (line.trim().startsWith('//') || line.trim() === '') continue;
    
    // Check for mismatched quotes in string literals
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j-1] : null;
      
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = null;
      }
    }
    
    // Count braces (only outside strings)
    if (!inString) {
      for (const char of line) {
        if (char === '{') braceStack.push(lineNumber);
        if (char === '}') {
          if (braceStack.length === 0) {
            errors.push({line: lineNumber, text: line.trim(), issue: 'Unmatched closing brace }'});
          } else {
            braceStack.pop();
          }
        }
        if (char === '[') bracketStack.push(lineNumber);
        if (char === ']') {
          if (bracketStack.length === 0) {
            errors.push({line: lineNumber, text: line.trim(), issue: 'Unmatched closing bracket ]'});
          } else {
            bracketStack.pop();
          }
        }
      }
    }
    
    // Check for common mistakes
    // ID field issues
    if (line.match(/id:\s*['"`][0-9]*[^'"`0-9]/)) {
      errors.push({line: lineNumber, text: line.trim(), issue: 'ID field has wrong quote type'});
    }
    
    // Mixed quote styles in example
    if (line.match(/example:\s*["'][^"'`]*[`'"][^"'`]*['"`]/)) {
      const hasSingleStart = line.match(/example:\s*'/);
      const hasDoubleStart = line.match(/example:\s*"/);
      const hasBacktickStart = line.match(/example:\s*`/);
      const hasSingleEnd = line.match(/'\s*,?$/);
      const hasDoubleEnd = line.match(/"\s*,?$/);
      const hasBacktickEnd = line.match(/`\s*,?$/);
      
      if ((hasSingleStart && hasBacktickEnd) || 
          (hasDoubleStart && hasBacktickEnd) ||
          (hasBacktickStart && hasSingleEnd) ||
          (hasBacktickStart && hasDoubleEnd)) {
        errors.push({line: lineNumber, text: line.trim(), issue: 'Mixed quote styles'});
      }
    }
  }
  
  // Check for unclosed strings at end of file
  if (inString) {
    errors.push({line: lineNumber, text: 'End of file', issue: `Unclosed string (started with ${stringChar})`});
  }
  
  // Check for unclosed braces
  if (braceStack.length > 0) {
    errors.push({line: braceStack[braceStack.length-1], text: 'Multiple lines', issue: `Unclosed opening brace { (opened at line ${braceStack[braceStack.length-1]})`});
  }
  if (bracketStack.length > 0) {
    errors.push({line: bracketStack[bracketStack.length-1], text: 'Multiple lines', issue: `Unclosed opening bracket [ (opened at line ${bracketStack[bracketStack.length-1]})`});
  }
  
  if (errors.length > 0) {
    console.log(`\n❌ ${file}:`);
    errors.forEach(err => {
      console.log(`  Line ${err.line}: ${err.issue}`);
      if (err.text.length > 60) {
        console.log(`    ${err.text.substring(0, 60)}...`);
      } else {
        console.log(`    ${err.text}`);
      }
    });
    totalErrors += errors.length;
  }
});

if (totalErrors === 0) {
  console.log('✅ All files look good! No syntax errors found.');
} else {
  console.log(`\n❌ Total errors found: ${totalErrors}`);
  process.exit(1);
}
