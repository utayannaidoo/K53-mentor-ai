#!/usr/bin/env python3
"""
Extract official SA road-sign images from the iDriving-School K53 manual.

The manual lays out the sign catalogue (pages ~6-91) as a single column:
a vector road-sign on the left and its description on the right, one per row.
Signs are vector drawings (not embedded rasters), so we render a tight crop of
each sign region to a PNG and pair it with the adjacent description text.

Usage:
    py -3.13 scripts/extract_signs.py            # full run (writes images + JSON)
    py -3.13 scripts/extract_signs.py --summary  # print per-page counts only
    py -3.13 scripts/extract_signs.py --pages 6-30

Outputs:
    public/signs/<category>/<id>.png
    scripts/signs.catalog.json
"""
from __future__ import annotations
import argparse, json, os, re, sys

import fitz  # PyMuPDF

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PDF = os.path.join(os.path.dirname(ROOT), "iDriving-School-K53_optimized.pdf")
IMG_ROOT = os.path.join(ROOT, "public", "signs")
CATALOG = os.path.join(ROOT, "src", "lib", "content", "signs.catalog.json")

# 1-based inclusive page range that holds the sign catalogue.
SIGN_PAGES = (6, 91)

SECTION_KEYS = [
    ("ROAD SURFACE MARKING", "marking"),
    ("ROAD MARKING", "marking"),
    ("REGULATORY", "regulatory"),
    ("WARNING", "warning"),
    ("INFORMATION", "information"),
    ("GUIDANCE", "guidance"),
]

FOOTER_MARKS = ("K53 LEARNERS", "K53 DRIVERS", "IDRIVING", "LEARNERS LICENSE", "DRIVERS LICENSE")


def slugify(text: str, maxlen: int = 48) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:maxlen].strip("-")


def classify(header: str):
    h = header.upper()
    for key, cat in SECTION_KEYS:
        if key in h:
            return cat
    return None


LIGATURES = {"ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl", "ﬃ": "ffi", "ﬄ": "ffl", "’": "'", "‘": "'",
             "“": '"', "”": '"', "–": "-", "—": "-"}


def clean(text: str) -> str:
    for k, v in LIGATURES.items():
        text = text.replace(k, v)
    return re.sub(r"\s+", " ", text).strip()


def auto_name(meaning: str, subcat: str, idx: int) -> str:
    """Best-effort short label from the description; curated later in TS."""
    if not meaning:
        return f"{subcat} {idx}" if subcat else f"Sign {idx}"
    first = re.split(r"[.;:]", meaning)[0]
    words = first.split()
    if len(words) > 9:
        first = " ".join(words[:9]) + "…"
    return first[:80]


def page_header(blocks):
    cand = [b for b in blocks if b[1] < 85 and ("SIGN" in b[4].upper() or "MARKING" in b[4].upper())]
    if not cand:
        return None
    cand.sort(key=lambda b: b[1])
    return clean(cand[0][4])


def footer_top(blocks, default=805.0):
    ys = [b[1] for b in blocks if any(m in b[4].upper() for m in FOOTER_MARKS)]
    return min(ys) if ys else default


def description_blocks(blocks, ftop):
    """Right-column description rows (exclude header / intro / footer).

    Used only to define how many rows the page has and where they sit; the
    actual meaning text is re-gathered per band from words (blocks fragment)."""
    out = []
    for b in blocks:
        x0, y0, x1, y1, txt = b[0], b[1], b[2], b[3], clean(b[4])
        if not txt or len(txt) < 6:
            continue
        if y0 < 85 or y0 >= ftop:
            continue
        if any(m in txt.upper() for m in FOOTER_MARKS):
            continue
        # intro paragraphs hug the left margin; descriptions are indented past the sign column
        if x0 < 100:
            continue
        out.append([x0, y0, x1, y1])
    out.sort(key=lambda b: (b[1] + b[3]) / 2)
    # merge blocks whose vertical gap is small (a wrapped paragraph split in two)
    merged = []
    for b in out:
        if merged and b[1] - merged[-1][3] < 16:
            m = merged[-1]
            m[0] = min(m[0], b[0]); m[1] = min(m[1], b[1])
            m[2] = max(m[2], b[2]); m[3] = max(m[3], b[3])
        else:
            merged.append(b)
    return merged


def band_meaning(page, btop, bbot, split_x, ftop):
    """All right-column words whose centre falls in the row band, in reading order."""
    words = []
    for w in page.get_text("words"):
        x0, y0, x1, y1, txt = w[0], w[1], w[2], w[3], w[4]
        yc = (y0 + y1) / 2
        if yc < btop or yc >= bbot or yc >= ftop:
            continue
        if x0 < split_x:            # left of the text column = part of the sign
            continue
        words.append((round(y0 / 4), x0, txt))   # bucket y to keep lines together
    words.sort(key=lambda t: (t[0], t[1]))
    return clean(" ".join(t[2] for t in words))


def sign_drawings(page, desc_left, ftop):
    rects = []
    for d in page.get_drawings():
        r = d["rect"]
        yc = (r.y0 + r.y1) / 2
        if r.x1 > desc_left - 4:          # must sit left of the text column
            continue
        if r.width < 7 or r.height < 7:
            continue
        if r.width > 210 or r.height > 230:  # skip page-wide background bars
            continue
        if yc < 85 or yc > ftop:
            continue
        rects.append(r)
    return rects


def bands(descs, ftop):
    """Vertical row boundaries from midpoints between description centres."""
    centers = [(b[1] + b[3]) / 2 for b in descs]
    bnds = []
    for i in range(len(centers)):
        top = 85.0 if i == 0 else (centers[i - 1] + centers[i]) / 2
        bot = ftop if i == len(centers) - 1 else (centers[i] + centers[i + 1]) / 2
        bnds.append((top, bot))
    return bnds


def render_crop(page, bbox, out_path):
    pad = 5.0
    clip = fitz.Rect(bbox.x0 - pad, bbox.y0 - pad, bbox.x1 + pad, bbox.y1 + pad)
    longest = max(clip.width, clip.height)
    zoom = max(1.6, min(5.5, 480.0 / longest))
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=clip, alpha=False)
    pix.save(out_path)
    return pix.width, pix.height


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--summary", action="store_true", help="counts only, no writes")
    ap.add_argument("--pages", default=None, help="1-based range e.g. 6-30")
    args = ap.parse_args()

    p0, p1 = SIGN_PAGES
    if args.pages:
        a, b = args.pages.split("-")
        p0, p1 = int(a), int(b)

    doc = fitz.open(PDF)
    catalog = []
    per_cat = {}
    print(f"PDF: {PDF}\nPages {p0}-{p1}  (summary={args.summary})\n")

    for pno in range(p0 - 1, p1):
        page = doc[pno]
        blocks = [b for b in page.get_text("blocks") if b[6] == 0]
        header = page_header(blocks)
        cat = classify(header) if header else None
        if not cat:
            print(f"  p{pno+1:>3}  (skip: no sign header)")
            continue
        subcat = ""
        if header and ":" in header:
            subcat = clean(header.split(":", 1)[1]).title()
        ftop = footer_top(blocks)
        descs = description_blocks(blocks, ftop)
        if not descs:
            print(f"  p{pno+1:>3}  {cat:<11} {subcat:<34} desc=0 (skip)")
            continue
        desc_left = min(b[0] for b in descs)
        split_x = desc_left - 6
        draws = sign_drawings(page, desc_left, ftop)
        bnds = bands(descs, ftop)

        made = 0
        for i, (btop, bbot) in enumerate(bnds, start=1):
            in_band = [r for r in draws if btop <= (r.y0 + r.y1) / 2 < bbot]
            if not in_band:
                continue
            x0 = min(r.x0 for r in in_band); y0 = min(r.y0 for r in in_band)
            x1 = max(r.x1 for r in in_band); y1 = max(r.y1 for r in in_band)
            if (x1 - x0) < 12 or (y1 - y0) < 12:
                continue
            bbox = fitz.Rect(x0, y0, x1, y1)
            meaning = band_meaning(page, btop, bbot, split_x, ftop)
            sid = f"{cat}-{pno+1:03d}-{i:02d}"
            rel = f"signs/{cat}/{sid}.png"
            entry = {
                "id": sid,
                "category": cat,
                "subcategory": subcat,
                "autoName": auto_name(meaning, subcat, i),
                "meaning": meaning,
                "image": "/" + rel,
                "page": pno + 1,
            }
            if not args.summary:
                out_dir = os.path.join(IMG_ROOT, cat)
                os.makedirs(out_dir, exist_ok=True)
                w, h = render_crop(page, bbox, os.path.join(ROOT, "public", rel.replace("/", os.sep)))
                entry["w"], entry["h"] = w, h
            catalog.append(entry)
            per_cat[cat] = per_cat.get(cat, 0) + 1
            made += 1
        print(f"  p{pno+1:>3}  {cat:<11} {subcat:<34} desc={len(descs):>2} signs={made:>2}")

    print(f"\nTOTAL signs: {len(catalog)}")
    for c, n in sorted(per_cat.items()):
        print(f"  {c:<12} {n}")

    if not args.summary:
        with open(CATALOG, "w", encoding="utf-8") as f:
            json.dump(catalog, f, ensure_ascii=False, indent=2)
        print(f"\nWrote {CATALOG}")
        print(f"Images under {IMG_ROOT}")


if __name__ == "__main__":
    main()
