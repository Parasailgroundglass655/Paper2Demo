#!/usr/bin/env python3
"""
paper2demo — CLI entry point

Usage:
    python main.py paper.pdf                          # DeepSeek (default)
    python main.py paper.pdf --provider gemini        # Gemini
    python main.py paper.pdf --output /path/to/my-video
"""

import argparse
import json
import os
import sys
import shutil
from pathlib import Path

from extractor import extract, copy_figures_to_public
from analyzer import analyze, analyze_deepseek


def resolve_project_root(output_arg: str | None) -> Path:
    """Find the Remotion project root (where package.json lives)."""
    if output_arg:
        return Path(output_arg).resolve()
    # Default: assume we're inside <project>/paper2demo/
    here = Path(__file__).parent
    candidate = here.parent
    if (candidate / "package.json").exists():
        return candidate
    return Path.cwd()


def main():
    parser = argparse.ArgumentParser(
        description="Convert an academic PDF into a Remotion video demo."
    )
    parser.add_argument("pdf", help="Path to the input PDF file")
    parser.add_argument(
        "--output",
        default=None,
        help="Remotion project root (default: parent of this script)",
    )
    parser.add_argument(
        "--provider",
        choices=["deepseek", "gemini"],
        default="deepseek",
        help="AI provider to use (default: deepseek)",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf).resolve()
    if not pdf_path.exists():
        print(f"[error] PDF not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    project_root = resolve_project_root(args.output)
    public_paper_dir = project_root / "public" / "paper"
    paper_data_path = project_root / "public" / "paper" / "paper-data.json"

    print(f"📄 Input PDF  : {pdf_path}")
    print(f"📁 Project    : {project_root}")
    print()

    # ── Step 1: Extract ──────────────────────────────────────────────────────
    print("🔍 Extracting text and figures from PDF…")
    extracted = extract(str(pdf_path), str(project_root / "paper2demo" / "output"))
    print(f"   → {extracted['num_pages']} pages, {len(extracted['figures'])} figures kept")

    # Copy figures to public/paper/
    figures_with_paths = copy_figures_to_public(
        extracted["figures"], str(public_paper_dir)
    )
    extracted["figures"] = figures_with_paths

    # ── Step 2: Analyze ───────────────────────────────────────────────────────
    if args.provider == "deepseek":
        print("🤖 Analyzing paper with DeepSeek…")
        api_key = os.environ.get("DEEPSEEK_API_KEY")
        if not api_key:
            print("[error] DEEPSEEK_API_KEY environment variable not set.", file=sys.stderr)
            sys.exit(1)
        paper_data = analyze_deepseek(extracted, api_key)
    else:
        print("🤖 Analyzing paper with Gemini…")
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("[error] GEMINI_API_KEY environment variable not set.", file=sys.stderr)
            sys.exit(1)
        paper_data = analyze(extracted, api_key)

    # Resolve figure filenames → static paths (so Remotion can find them)
    available_filenames = {f["filename"]: f["static_path"] for f in figures_with_paths}
    for scene in paper_data.get("scenes", []):
        fig = scene.get("figure")
        if fig and fig in available_filenames:
            scene["figure"] = available_filenames[fig]
        elif fig:
            # Model hallucinated a filename — clear it
            scene["figure"] = None
            scene["figure_caption"] = None

    # ── Step 3: Write paper-data.json ────────────────────────────────────────
    public_paper_dir.mkdir(parents=True, exist_ok=True)
    with open(paper_data_path, "w", encoding="utf-8") as f:
        json.dump(paper_data, f, ensure_ascii=False, indent=2)

    print(f"✅ paper-data.json written to: {paper_data_path}")
    print()

    title = paper_data["meta"].get("title", "Unknown")
    ptype = paper_data["meta"].get("paper_type", "other")
    theme = paper_data.get("theme", {}).get("name", "default")
    print(f"   Title      : {title}")
    print(f"   Paper type : {ptype}")
    print(f"   Theme      : {theme}")
    print()
    print("🎬 Open Remotion Studio and select the 'PaperDemo' composition.")
    print("   npx remotion studio")


if __name__ == "__main__":
    main()
