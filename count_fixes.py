#!/usr/bin/env python3
import re
import os

decks_dir = '/home/ubuntu/.openclaw/workspace/Colombian-Spanish/src/data/decks'

# Priority order
priority_decks = [
    'conversation.ts',
    'expressions.ts',
    'slang.ts',
    'paisa.ts',
    'culture.ts',
    'dating.ts',
    'business.ts',
    'rolo.ts',
    'colombian_food.ts',
    'food.ts',
]

# Get all .ts files and sort them by priority
all_files = [f for f in os.listdir(decks_dir) if f.endswith('.ts')]

# Sort files: priority first, then others alphabetically
def sort_key(f):
    if f in priority_decks:
        return (0, priority_decks.index(f))
    else:
        return (1, f)

all_files.sort(key=sort_key)

print(f"Found {len(all_files)} deck files to process")
print(f"Priority order: {all_files[:11]}")

for filename in all_files:
    filepath = os.path.join(decks_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Count examples without pipe
    examples_without_pipe = len(re.findall(r"example: '[^'|]+',\s*\n", content))
    
    if examples_without_pipe == 0:
        print(f"✓ {filename}: All examples already have translations")
        continue
    
    print(f"→ {filename}: {examples_without_pipe} examples need translation")
