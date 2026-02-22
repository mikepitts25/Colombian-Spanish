const fs = require('fs');
const path = require('path');

const decksDir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks';

// Simple translations for common patterns
const translateExample = (spanish) => {
  // This is a simplified approach - in reality we'd want proper translations
  // For now, we'll mark which ones need manual translation
  return `${spanish} | [Translation needed]`;
};

// Process a single deck file
function processDeckFile(filename) {
  const filepath = path.join(decksDir, filename);
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Track changes
  let changes = 0;
  
  // Find all example fields without pipe separator
  // Pattern: example: 'text without pipe',
  const exampleRegex = /example: '([^'|]+)',/g;
  
  content = content.replace(exampleRegex, (match, spanishText) => {
    // Skip if it already contains special characters that might break the format
    if (spanishText.includes('|')) return match;
    
    changes++;
    const translated = translateExample(spanishText.trim());
    return `example: '${translated}',`;
  });
  
  if (changes > 0) {
    fs.writeFileSync(filepath, content);
    console.log(`✅ ${filename}: ${changes} examples updated`);
  } else {
    console.log(`⏭️  ${filename}: No changes needed`);
  }
  
  return changes;
}

// Get all deck files
const files = fs.readdirSync(decksDir)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts');

console.log(`Processing ${files.length} deck files...\n`);

let totalChanges = 0;

files.forEach(file => {
  try {
    const changes = processDeckFile(file);
    totalChanges += changes;
  } catch (err) {
    console.error(`❌ ${file}: ${err.message}`);
  }
});

console.log(`\n📊 Total: ${totalChanges} examples marked for translation`);
console.log('\n⚠️  Note: Examples are marked with "[Translation needed]"');
console.log('Please review and add proper English translations.');
