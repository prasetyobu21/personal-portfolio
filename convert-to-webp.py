#!/usr/bin/env python3
"""Convert all PNG/JPG images in assets/images to WebP using Pillow."""

import os
import sys

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow not installed. Run: pip3 install Pillow")
    sys.exit(1)

BASE = "assets/images"
QUALITY = 85

def convert(src):
    dst = os.path.splitext(src)[0] + ".webp"
    if os.path.exists(dst):
        print(f"  ⏭  Already exists: {dst}")
        return
    try:
        img = Image.open(src)
        # Preserve transparency for PNGs
        if img.mode in ("RGBA", "LA"):
            img.save(dst, "WEBP", quality=QUALITY, method=6)
        else:
            img = img.convert("RGB")
            img.save(dst, "WEBP", quality=QUALITY, method=6)
        orig_kb = os.path.getsize(src) // 1024
        new_kb  = os.path.getsize(dst) // 1024
        saved   = round((1 - new_kb / orig_kb) * 100) if orig_kb else 0
        print(f"  ✅ {os.path.basename(src):50s} {orig_kb:>5}KB → {new_kb:>4}KB  ({saved}% smaller)")
    except Exception as e:
        print(f"  ❌ Failed {src}: {e}")

print("🔄 Converting images to WebP...\n")

files = []
for root, _, filenames in os.walk(BASE):
    for f in filenames:
        if f.lower().endswith((".png", ".jpg", ".jpeg")):
            files.append(os.path.join(root, f))

files.sort()
for f in files:
    convert(f)

print("\n✅ All done! WebP files created alongside originals.")
