# Kevin product reference photos

**Canonical local pack:** `~/Downloads/3. Mitipi Kevin 3 Content` (69 files, Jun 2026)  
Also mirrored on [Google Drive](https://drive.google.com/drive/folders/16kLAXwX-Yv8ZcbgZpS8As5G5LWYIFXtB?usp=sharing).

Re-sync from your Mac:

```bash
./scripts/sync-kevin3-product-refs.sh
# or: KEVIN3_CONTENT_DIR="/path/to/folder" ./scripts/sync-kevin3-product-refs.sh
```

**Do not commit this folder to git** — `assets/reference/` is gitignored (~1 GB). Generated hero outputs live in `assets/kevin-hero-product-*`.

## Download summary

| Status | Count | Notes |
|--------|------:|-------|
| Downloaded | 57 | ~964 MB |
| Failed (rate limit / permissions) | 9 | See below |

### Subfolders

| Folder | Files | Use for Higgsfield |
|--------|------:|-------------------|
| `Edited - white BG/` | 14 JPG | **Primary** — studio product shots, specs, solution hero |
| `Edited - no BG/` | 14 PNG | Transparent cutouts, compositing |
| `Unedited png/` | 22 PNG | High-res source, detail angles |
| Root | 7 | Color variants + web thumbnails |

### Hero slide 1 — product rotator (live theme)

| View | Source in local pack | Theme asset |
|------|----------------------|-------------|
| Front 3/4 | `Unedited png/810_4993.png` | `kevin-hero-product-front.webp` |
| Side | `Edited - no BG/Copy of Copy of 810_4992.png` | `kevin-hero-product-side.webp` |
| Top | `Edited - no BG/Copy of Copy of 810_5008.png` | `kevin-hero-product-top.webp` |
| Back | `Edited - no BG/Copy of 5004 & 5005.png` | `kevin-hero-product-back.webp` |

Avoid prototype frames `810_4982`–`810_4989` (internal LED grid, not retail Kevin .3).

### Canonical references (legacy scripts)

| Alias | Path | Purpose |
|-------|------|---------|
| Studio hero | `clean-01-studio-white.png` | Marketing still, 3D regen front ref |
| Side profile | `Edited - white BG/810_4992.jpg` | `multi_image_to_3d` side ref |
| Close-up | `Edited - white BG/810_5010.jpg` | Specs, fabric detail |

### Failed downloads (retry manually or re-share folder)

- `clean-04-features.png`
- `glass-01-hero.png` … `glass-07-bundle-4.png`
- `KEVIN Logo.pdf`

Retry after fixing Drive permissions or waiting for rate limit:

```bash
python3 -m pip install gdown --user
python3 -m gdown --folder "https://drive.google.com/drive/folders/16kLAXwX-Yv8ZcbgZpS8As5G5LWYIFXtB?usp=sharing" \
  -O assets/reference --remaining-ok
```

Full file list: `INVENTORY.txt`
