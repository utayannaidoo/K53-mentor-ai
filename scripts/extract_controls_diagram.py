#!/usr/bin/env python3
"""
Extract the labelled vehicle-controls diagram from page 5 of the iDriving-School
K53 manual to public/diagrams/car-controls.png.

Usage:
    py -3.13 scripts/extract_controls_diagram.py
"""
import os
import fitz  # PyMuPDF

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PDF = os.path.join(os.path.dirname(ROOT), "iDriving-School-K53_optimized.pdf")
OUT = os.path.join(ROOT, "public", "diagrams", "car-controls.png")

# Page 5 (0-based index 4); region holding the labelled diagram. Includes the
# "MOTOR VEHICLE CONTROLS" heading and full callout labels (top and bottom),
# and stops just above the controls table so no label text is clipped.
PAGE = 4
CLIP = fitz.Rect(4, 140, 591, 472)


def main():
    doc = fitz.open(PDF)
    pix = doc[PAGE].get_pixmap(matrix=fitz.Matrix(3, 3), clip=CLIP, alpha=False)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    pix.save(OUT)
    print(f"Wrote {OUT}  ({pix.width}x{pix.height})")


if __name__ == "__main__":
    main()
