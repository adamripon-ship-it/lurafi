#!/usr/bin/env python3
"""Build transparent hero product PNGs from Kevin 3 no-BG cutouts."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = Path.home() / "Downloads/3. Mitipi Kevin 3 Content/Edited - no BG"
OUT = ROOT / "assets"
MAX_EDGE = 2400

ANGLES = (
    ("Copy of 4993 & 4994.png", "kevin-hero-product-front.png"),
    ("Copy of Copy of 810_4992.png", "kevin-hero-product-side.png"),
    ("Copy of Copy of 810_5008.png", "kevin-hero-product-top.png"),
    ("Copy of 5004 & 5005.png", "kevin-hero-product-back.png"),
)


def export(src_name: str, dest_name: str) -> None:
    src = SRC / src_name
    dest = OUT / dest_name
    if not src.is_file():
        raise FileNotFoundError(src)
    img = Image.open(src).convert("RGBA")
    img.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, format="PNG", optimize=True)
    print(f"  {dest.name}: {dest.stat().st_size // 1024} KB, alpha OK")


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"Missing source folder: {SRC}")
    print(f"Source: {SRC}")
    for src_name, dest_name in ANGLES:
        export(src_name, dest_name)
    front = OUT / "kevin-hero-product-front.png"
    burglary = OUT / "kevin-hero-burglary-prevention.png"
    burglary.write_bytes(front.read_bytes())
    print("Done.")


if __name__ == "__main__":
    main()
