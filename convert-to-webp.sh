#!/bin/bash
# Convert all PNG/JPG images to WebP using macOS built-in sips
# Originals are kept — only .webp files are added

BASE="assets/images"

convert_to_webp() {
  local input="$1"
  local output="${input%.*}.webp"

  if [ -f "$output" ]; then
    echo "  ⏭  Already exists: $output"
    return
  fi

  sips -s format webp "$input" --out "$output" --setProperty formatOptions 85 > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    local orig_size=$(du -k "$input" | cut -f1)
    local new_size=$(du -k "$output" | cut -f1)
    echo "  ✅ $(basename "$input") → $(basename "$output") (${orig_size}KB → ${new_size}KB)"
  else
    echo "  ❌ Failed: $input"
  fi
}

echo "🔄 Converting images to WebP..."
echo ""

find "$BASE" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | sort | while read file; do
  convert_to_webp "$file"
done

echo ""
echo "✅ Done! WebP files created alongside originals."
echo "   Next: update src paths in index.html to use .webp extensions."
