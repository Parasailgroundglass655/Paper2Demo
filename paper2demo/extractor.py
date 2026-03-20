"""
Extract text and figures from a PDF using PyMuPDF.
"""

import fitz  # PyMuPDF
import json
import shutil
from pathlib import Path
from PIL import Image
import io


MIN_FIGURE_WIDTH = 200
MIN_FIGURE_HEIGHT = 150
MAX_FIGURES = 8  # Keep only the most informative figures


def extract(pdf_path: str, output_dir: str) -> dict:
    """
    Extract text and figures from a PDF file.

    Returns a dict with:
        - text: str (full document text)
        - pages: list of per-page text
        - figures: list of {path, caption, page, width, height}
    """
    pdf_path = Path(pdf_path)
    output_dir = Path(output_dir)
    figures_dir = output_dir / "figures_raw"
    figures_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))

    all_pages_text = []
    full_text_parts = []
    figures = []
    seen_xrefs = set()

    for page_num, page in enumerate(doc):
        page_text = page.get_text("text")
        all_pages_text.append(page_text)
        full_text_parts.append(page_text)

        # Get all text blocks with positions for caption matching
        text_blocks = page.get_text("blocks")  # (x0,y0,x1,y1,text,block_no,block_type)
        caption_blocks = [
            b for b in text_blocks
            if b[6] == 0  # text block (not image block)
            and b[4].strip().lower().startswith(("figure", "fig.", "fig "))
        ]

        # Extract images on this page
        image_list = page.get_images(full=True)
        for img_info in image_list:
            xref = img_info[0]
            if xref in seen_xrefs:
                continue
            seen_xrefs.add(xref)

            try:
                base_image = doc.extract_image(xref)
                img_bytes = base_image["image"]

                img = Image.open(io.BytesIO(img_bytes))
                w, h = img.size

                # Skip small images (icons, logos, decorations)
                if w < MIN_FIGURE_WIDTH or h < MIN_FIGURE_HEIGHT:
                    continue
                if h < 100:
                    continue

                # Convert to PNG for consistency
                out_name = f"fig_p{page_num + 1}_{xref}.png"
                out_path = figures_dir / out_name
                img.convert("RGB").save(str(out_path), "PNG")

                # Find the nearest caption block to this image
                img_rects = page.get_image_rects(xref)
                img_rect = img_rects[0] if img_rects else None
                caption = _find_nearest_caption(img_rect, caption_blocks, page_num)

                figures.append({
                    "path": str(out_path),
                    "filename": out_name,
                    "caption": caption,
                    "page": page_num + 1,
                    "width": w,
                    "height": h,
                    "area": w * h,
                })
            except Exception:
                continue

    doc.close()

    # Sort by area (largest = most informative) and keep top N
    figures.sort(key=lambda f: f["area"], reverse=True)
    figures = figures[:MAX_FIGURES]

    full_text = "\n".join(full_text_parts)

    return {
        "text": full_text,
        "pages": all_pages_text,
        "figures": figures,
        "num_pages": len(all_pages_text),
    }


def _find_nearest_caption(img_rect, caption_blocks: list, page_num: int) -> str:
    """
    Find the caption block spatially closest to the image bounding box.
    Captions are usually directly below (or occasionally above) the figure.
    """
    if not caption_blocks:
        return f"Figure from page {page_num + 1}"

    if img_rect is None:
        # No position info — fall back to first caption on page
        return caption_blocks[0][4].strip()[:300]

    img_cx = (img_rect.x0 + img_rect.x1) / 2
    img_bottom = img_rect.y1
    img_top = img_rect.y0

    best, best_dist = None, float("inf")
    for block in caption_blocks:
        bx0, by0, bx1, by1, btext, _, _ = block
        bcx = (bx0 + bx1) / 2

        # Prefer blocks below the image; allow above with penalty
        if by0 >= img_bottom:
            vertical_dist = by0 - img_bottom          # below: no penalty
        else:
            vertical_dist = (img_top - by1) + 200     # above: add penalty

        horizontal_dist = abs(bcx - img_cx)
        dist = vertical_dist + horizontal_dist * 0.3

        if dist < best_dist:
            best_dist = dist
            best = btext.strip()[:300]

    return best or f"Figure from page {page_num + 1}"


def copy_figures_to_public(figures: list, public_paper_dir: str) -> list:
    """
    Copy extracted figure PNGs into public/paper/ so Remotion can serve them.
    Returns figures list with updated 'public_path' and 'static_path' fields.
    """
    pub_dir = Path(public_paper_dir)
    pub_dir.mkdir(parents=True, exist_ok=True)

    updated = []
    for fig in figures:
        src = Path(fig["path"])
        dst = pub_dir / fig["filename"]
        shutil.copy2(str(src), str(dst))
        updated.append({
            **fig,
            "static_path": f"paper/{fig['filename']}",  # for staticFile()
        })
    return updated
