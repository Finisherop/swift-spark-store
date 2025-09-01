#!/bin/bash

Ensure app folder exists

mkdir -p app

Mapping pages → app

declare -A routes=(
["pages/index.tsx"]="app/page.tsx"
["pages/about.tsx"]="app/about/page.tsx"
["pages/contact.tsx"]="app/contact/page.tsx"
["pages/products.tsx"]="app/products/page.tsx"
["pages/admin/dashboard.tsx"]="app/admin/dashboard/page.tsx"
["pages/admin/login.tsx"]="app/admin/login/page.tsx"
["pages/category/[slug].tsx"]="app/category/[slug]/page.tsx"
["pages/product/[id].tsx"]="app/product/[id]/page.tsx"
["pages/_app.tsx"]="app/layout.tsx"
)

Move files according to mapping

for src in "${!routes[@]}"; do
dest=${routes[$src]}
mkdir -p "$(dirname "$dest")"
if [ -f "$src" ]; then
mv "$src" "$dest"
echo "✅ Moved $src → $dest"
else
echo "⚠️ Skipped $src (not found)"
fi
done

echo "🎉 Migration completed! Now update imports and adjust layout.tsx"


