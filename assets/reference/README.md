# Kevin product reference photos

Downloaded from [Google Drive — Mitipi product photos](https://drive.google.com/drive/folders/16kLAXwX-Yv8ZcbgZpS8As5G5LWYIFXtB?usp=sharing) on 2026-06-30 via `gdown`.

**Do not commit this folder to git** — add `assets/reference/` to `.gitignore` if pushing theme assets (964 MB). Reference files stay local for Higgsfield generation; generated outputs go in `assets/` with kebab-case names.

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

### Canonical references (used by `scripts/generate-mitipi-visuals.sh`)

| Alias | Path | Purpose |
|-------|------|---------|
| Lifestyle | `../kevin-hero-burglary-prevention.jpg` | Hero slides 2–6, personas, lifestyle scenes |
| Studio | `Edited - white BG/810_4982.jpg` | Product-on-white, solution section |
| Close-up | `Edited - white BG/810_5010.jpg` | Specs, fabric detail |
| 3/4 angle | `clean-01-studio-white.png` | Steps section device angle |
| Multi-angle | `Edited - white BG/810_4998.jpg` | Shadow projection demo |

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
