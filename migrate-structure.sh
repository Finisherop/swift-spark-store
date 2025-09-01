#!/bin/bash

# Cleanup: make sure target folders exist
mkdir -p components lib hooks styles assets

# Mapping
declare -A moves=(
  ["src/components"]="components"
  ["src/lib"]="lib"
  ["src/hooks"]="hooks"
  ["src/assets"]="assets"
  ["src/index.css"]="styles/index.css"
  ["src/App.css"]="styles/App.css"
)

# Move according to mapping
for src in "${!moves[@]}"; do
  dest=${moves[$src]}
  if [ -e "$src" ]; then
    mkdir -p "$(dirname "$dest")"
    mv "$src" "$dest"
    echo "✅ Moved $src → $dest"
  else
    echo "⚠️ Skipped $src (not found)"
  fi
done

# Special: integrations folder → lib/integrations
if [ -d "src/integrations" ]; then
  mkdir -p lib
  mv src/integrations lib/integrations
  echo "✅ Moved src/integrations → lib/integrations"
fi

# Cleanup src folder if empty
rmdir src 2>/dev/null || true

echo "🎉 Migration completed! Now update imports if needed."
