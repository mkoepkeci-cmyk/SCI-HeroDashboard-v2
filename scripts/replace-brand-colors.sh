#!/bin/bash

# Script to replace hardcoded brand colors with Tailwind CSS variables
# Run from project root: bash scripts/replace-brand-colors.sh

echo "Replacing hardcoded brand colors with Tailwind CSS variables..."

# Pattern 1: bg-[#9B2F6A] → bg-brand
find src/components -name "*.tsx" -type f -exec sed -i 's/bg-\[#9B2F6A\]/bg-brand/g' {} \;

# Pattern 2: text-[#9B2F6A] → text-brand
find src/components -name "*.tsx" -type f -exec sed -i 's/text-\[#9B2F6A\]/text-brand/g' {} \;

# Pattern 3: border-[#9B2F6A] → border-brand
find src/components -name "*.tsx" -type f -exec sed -i 's/border-\[#9B2F6A\]/border-brand/g' {} \;

# Pattern 4: bg-[#7d2555] (darker) → bg-brand-dark
find src/components -name "*.tsx" -type f -exec sed -i 's/bg-\[#7d2555\]/bg-brand-dark/g' {} \;

# Pattern 5: hover:bg-[#7d2555] → hover:bg-brand-dark
find src/components -name "*.tsx" -type f -exec sed -i 's/hover:bg-\[#7d2555\]/hover:bg-brand-dark/g' {} \;

# Pattern 6: focus:ring-[#9B2F6A] → focus:ring-brand
find src/components -name "*.tsx" -type f -exec sed -i 's/focus:ring-\[#9B2F6A\]/focus:ring-brand/g' {} \;

echo "✅ Replacement complete!"
echo ""
echo "Instances replaced:"
grep -r "bg-brand\|text-brand\|border-brand" src/components --include="*.tsx" | wc -l

echo ""
echo "Remaining hardcoded instances (should be 0):"
grep -r "#9B2F6A\|#7d2555" src/components --include="*.tsx" | wc -l
