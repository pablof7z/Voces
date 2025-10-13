#!/bin/bash

# Script to fix hardcoded dark mode colors in Svelte components
# This will replace common dark mode color patterns with theme-aware Tailwind classes

echo "🎨 Fixing hardcoded dark mode colors..."

# Find all .svelte files in src/lib
find src/lib -name "*.svelte" -type f | while read -r file; do
  echo "Processing: $file"

  # Create a backup
  cp "$file" "$file.bak"

  # Fix background colors
  sed -i '' \
    -e 's/bg-black\([^-]\)/bg-background\1/g' \
    -e 's/bg-neutral-900\([^/]\)/bg-card\1/g' \
    -e 's/bg-neutral-900\/50/bg-card\/50/g' \
    -e 's/bg-neutral-900\/30/bg-card\/30/g' \
    -e 's/bg-neutral-800\([^/]\)/bg-muted\1/g' \
    -e 's/bg-neutral-800\/50/bg-muted\/50/g' \
    -e 's/bg-neutral-800\/30/bg-muted\/30/g' \
    -e 's/bg-neutral-950/bg-card/g' \
    "$file"

  # Fix text colors
  sed -i '' \
    -e 's/text-white\([^-]\)/text-foreground\1/g' \
    -e 's/text-neutral-100/text-foreground/g' \
    -e 's/text-neutral-200/text-foreground/g' \
    -e 's/text-neutral-300/text-muted-foreground/g' \
    -e 's/text-neutral-400/text-muted-foreground/g' \
    -e 's/text-neutral-500/text-muted-foreground/g' \
    "$file"

  # Fix border colors
  sed -i '' \
    -e 's/border-neutral-800\([^/]\)/border-border\1/g' \
    -e 's/border-neutral-800\/50/border-border/g' \
    -e 's/border-neutral-700/border-border/g' \
    "$file"

  # Fix hover states
  sed -i '' \
    -e 's/hover:bg-neutral-800\([^/]\)/hover:bg-muted\1/g' \
    -e 's/hover:bg-neutral-800\/50/hover:bg-muted/g' \
    -e 's/hover:bg-neutral-900/hover:bg-card/g' \
    -e 's/hover:text-neutral-300/hover:text-foreground/g' \
    "$file"

  # Fix orange/accent colors to use primary
  sed -i '' \
    -e 's/text-orange-500/text-primary/g' \
    -e 's/text-orange-600/text-primary/g' \
    -e 's/bg-orange-500\/10/bg-primary\/10/g' \
    -e 's/bg-orange-500\/20/bg-primary\/20/g' \
    -e 's/hover:text-orange-500/hover:text-primary/g' \
    "$file"

  # Fix additional neutral colors
  sed -i '' \
    -e 's/bg-neutral-700/bg-muted/g' \
    -e 's/text-neutral-600/text-muted-foreground/g' \
    "$file"
done

echo "✅ Done! Backup files created with .bak extension"
echo "🧪 Test the changes, then run: find src/lib -name '*.svelte.bak' -delete to remove backups"
