"""
Analyze extracted PDF content with Gemini or DeepSeek API to produce a
structured paper-data.json for Remotion.

Providers:
  gemini   — Google Gemini (requires GEMINI_API_KEY)
  deepseek — DeepSeek (requires DEEPSEEK_API_KEY, recommended for China)
"""

import json
import google.generativeai as genai
from openai import OpenAI

PAPER_TYPES = [
    "model_compression",   # pruning, quantization, distillation
    "image_generation",    # diffusion, GAN, VAE
    "nlp_llm",             # language models, NLP tasks
    "reinforcement_learning",
    "computer_vision",     # detection, segmentation, classification
    "multimodal",          # vision-language, audio-visual
    "robotics",
    "medical",
    "theory_optimization", # theoretical, optimization, math
    "systems",             # system efficiency, distributed, hardware
    "other",
]

THEMES = {
    "model_compression": {
        "name": "efficiency",
        "primary":   "#4f9cff",
        "secondary": "#9b6dff",
        "accent":    "#4fcf8e",
        "bg_dark":   "#080d1a",
        "bg_mid":    "#0e1b35",
        "tag_color": "#4f9cff",
    },
    "image_generation": {
        "name": "creative",
        "primary":   "#d06fff",
        "secondary": "#ff6db0",
        "accent":    "#ffb347",
        "bg_dark":   "#12071a",
        "bg_mid":    "#1e0d2e",
        "tag_color": "#d06fff",
    },
    "nlp_llm": {
        "name": "language",
        "primary":   "#2dd4bf",
        "secondary": "#34d399",
        "accent":    "#a3e635",
        "bg_dark":   "#051a17",
        "bg_mid":    "#0a2e29",
        "tag_color": "#2dd4bf",
    },
    "reinforcement_learning": {
        "name": "action",
        "primary":   "#ff7849",
        "secondary": "#fbbf24",
        "accent":    "#f87171",
        "bg_dark":   "#1a0a04",
        "bg_mid":    "#2e1508",
        "tag_color": "#ff7849",
    },
    "computer_vision": {
        "name": "vision",
        "primary":   "#38bdf8",
        "secondary": "#818cf8",
        "accent":    "#f472b6",
        "bg_dark":   "#04111a",
        "bg_mid":    "#081e30",
        "tag_color": "#38bdf8",
    },
    "multimodal": {
        "name": "fusion",
        "primary":   "#06b6d4",
        "secondary": "#e879f9",
        "accent":    "#fbbf24",
        "bg_dark":   "#050d1a",
        "bg_mid":    "#0a1428",
        "tag_color": "#06b6d4",
    },
    "robotics": {
        "name": "robotics",
        "primary":   "#94a3b8",
        "secondary": "#64748b",
        "accent":    "#f97316",
        "bg_dark":   "#080c12",
        "bg_mid":    "#111820",
        "tag_color": "#94a3b8",
    },
    "medical": {
        "name": "medical",
        "primary":   "#60a5fa",
        "secondary": "#a5f3fc",
        "accent":    "#34d399",
        "bg_dark":   "#040d1a",
        "bg_mid":    "#081528",
        "tag_color": "#60a5fa",
    },
    "theory_optimization": {
        "name": "academic",
        "primary":   "#fbbf24",
        "secondary": "#f59e0b",
        "accent":    "#a78bfa",
        "bg_dark":   "#0d0a00",
        "bg_mid":    "#1a1400",
        "tag_color": "#fbbf24",
    },
    "systems": {
        "name": "systems",
        "primary":   "#6ee7b7",
        "secondary": "#4ade80",
        "accent":    "#38bdf8",
        "bg_dark":   "#030d08",
        "bg_mid":    "#06190f",
        "tag_color": "#6ee7b7",
    },
    "other": {
        "name": "default",
        "primary":   "#4f9cff",
        "secondary": "#9b6dff",
        "accent":    "#4fcf8e",
        "bg_dark":   "#080d1a",
        "bg_mid":    "#0e1b35",
        "tag_color": "#4f9cff",
    },
}

SYSTEM_PROMPT = """You are a research paper analyst that extracts structured information
from academic papers to create engaging video presentations. You output ONLY valid JSON.
"""

USER_PROMPT_TEMPLATE = """Analyze this academic paper and produce a structured JSON for a video presentation.

--- PAPER TEXT (first 12000 chars) ---
{text}

--- AVAILABLE FIGURES (filename → caption) ---
{figures_summary}

IMPORTANT: When choosing a figure for a scene, read the captions carefully and pick the
filename whose caption best matches the scene content. For "method" scenes pick figures
whose caption describes the model architecture or pipeline (e.g. "Figure 1: Overview of...").
For "results" scenes pick figures whose caption describes comparisons or benchmarks.
Only use filenames that appear exactly in the list above, or null.

---

Produce a JSON object with EXACTLY this structure (fill in all fields):

{{
  "meta": {{
    "title": "<full paper title>",
    "authors": ["<author1>", "<author2>"],
    "venue": "<conference or journal, or 'arXiv' if preprint>",
    "year": <year as int>,
    "paper_type": "<one of: {paper_types}>",
    "domain_tags": ["<tag1>", "<tag2>"]
  }},
  "scenes": [
    {{
      "type": "title",
      "duration_seconds": 5
    }},
    {{
      "type": "problem",
      "title": "<section title, e.g. The Challenge>",
      "bullets": [
        {{"icon": "<emoji>", "title": "<short title>", "desc": "<1-2 sentence description>"}},
        {{"icon": "<emoji>", "title": "<short title>", "desc": "<1-2 sentence description>"}},
        {{"icon": "<emoji>", "title": "<short title>", "desc": "<1-2 sentence description>"}}
      ],
      "duration_seconds": 6
    }},
    {{
      "type": "method",
      "title": "<method section title>",
      "pipeline_steps": ["<step1>", "<step2>", "<step3>", "<step4>", "<step5>"],
      "key_points": [
        {{"icon": "<emoji>", "text": "<key insight 1>"}},
        {{"icon": "<emoji>", "text": "<key insight 2>"}},
        {{"icon": "<emoji>", "text": "<key insight 3>"}}
      ],
      "figure": "<filename of best overview figure, or null>",
      "figure_caption": "<caption text, or null>",
      "duration_seconds": 8
    }},
    {{
      "type": "contributions",
      "title": "Key Contributions",
      "items": [
        {{"num": "01", "title": "<title>", "desc": "<2-3 sentence description>"}},
        {{"num": "02", "title": "<title>", "desc": "<2-3 sentence description>"}},
        {{"num": "03", "title": "<title>", "desc": "<2-3 sentence description>"}},
        {{"num": "04", "title": "<title>", "desc": "<2-3 sentence description>"}}
      ],
      "duration_seconds": 7
    }},
    {{
      "type": "results",
      "title": "Empirical Results",
      "stats": [
        {{"value": "<metric>", "label": "<what it means>"}},
        {{"value": "<metric>", "label": "<what it means>"}},
        {{"value": "<metric>", "label": "<what it means>"}},
        {{"value": "<metric>", "label": "<what it means>"}}
      ],
      "figure": "<filename of best results figure, or null>",
      "figure_caption": "<caption text, or null>",
      "duration_seconds": 7
    }}
  ]
}}

Rules:
- Use vivid, engaging language — this is a video script, not a paper review.
- Emojis should match the content (🧠 for brain/cognition, ⚡ for speed, etc.)
- pipeline_steps should be 4-6 concise step labels (fit on small cards)
- stats values should be concise (e.g. "50%↓", "SOTA", "2×", "+3.2 FID")
- figure filenames must match EXACTLY one of the filenames listed in AVAILABLE FIGURES, or null
- Output ONLY the JSON object, no markdown fences, no explanation.
"""


CHUNK_SIZE = 3000  # chars per chunk for free tier
CHUNK_SUMMARY_PROMPT = """You are summarizing a chunk of an academic paper.
Extract the key information: problem, method, contributions, results, any numbers or metrics.
Be concise but comprehensive. Plain text, no JSON.

--- CHUNK ---
{chunk}
"""


def _call(model, prompt: str) -> str:
    response = model.generate_content(prompt)
    raw = response.text.strip()
    if raw.startswith("```"):
        raw = "\n".join(raw.split("\n")[1:-1])
    return raw


def analyze(extracted: dict, api_key: str) -> dict:
    """
    Split full text into chunks → summarize each → generate final JSON.
    """
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT,
    )

    full_text = extracted["text"]
    figures = extracted.get("figures", [])

    # ── Step 1: summarize each chunk ─────────────────────────────────────────
    chunks = [full_text[i:i + CHUNK_SIZE] for i in range(0, len(full_text), CHUNK_SIZE)]
    print(f"   → Analyzing in {len(chunks)} chunks…")

    summaries = []
    for idx, chunk in enumerate(chunks, 1):
        print(f"   → Chunk {idx}/{len(chunks)}…")
        summary = _call(model, CHUNK_SUMMARY_PROMPT.format(chunk=chunk))
        summaries.append(summary)

    combined_summary = "\n\n".join(
        f"[Chunk {i+1}]\n{s}" for i, s in enumerate(summaries)
    )

    # ── Step 2: generate structured JSON from all summaries ──────────────────
    figures_summary = "\n".join(
        f"- filename: {f['filename']}\n  caption: {f['caption']}\n  page: {f['page']}"
        for f in figures
    ) or "No figures extracted."

    paper_types_str = ", ".join(PAPER_TYPES)

    print(f"   → Generating structured JSON…")
    prompt = USER_PROMPT_TEMPLATE.format(
        text=combined_summary,
        figures_summary=figures_summary,
        paper_types=paper_types_str,
    )

    raw = _call(model, prompt)
    data = json.loads(raw)

    # Inject theme
    paper_type = data["meta"].get("paper_type", "other")
    data["theme"] = THEMES.get(paper_type, THEMES["other"])

    return data


# ─── DeepSeek provider ────────────────────────────────────────────────────────

def _deepseek_call(client: OpenAI, system: str, user: str) -> str:
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.3,
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = "\n".join(raw.split("\n")[1:-1])
    return raw


META_PROMPT = """Extract metadata from the first page of this academic paper.
Output ONLY a JSON object with these fields:
{{
  "title": "<exact full paper title>",
  "authors": ["<author1>", "<author2>"],
  "venue": "<conference or journal name, or 'arXiv' if preprint>",
  "year": <year as int>
}}
No explanation, no markdown fences.

--- FIRST PAGE ---
{page}
"""


def analyze_deepseek(extracted: dict, api_key: str) -> dict:
    """
    1. Extract metadata from first page (title, authors, venue, year)
    2. Summarize full text in chunks
    3. Generate structured JSON, injecting the accurate metadata
    """
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.deepseek.com",
    )

    pages = extracted.get("pages", [])
    full_text = extracted["text"]
    figures = extracted.get("figures", [])

    # ── Step 1: extract metadata from first 2 pages ───────────────────────────
    print("   → Extracting metadata from first pages…")
    first_pages = "\n".join(pages[:2])
    meta_raw = _deepseek_call(
        client,
        system="You are a precise metadata extractor for academic papers. Output only valid JSON.",
        user=META_PROMPT.format(page=first_pages[:3000]),
    )
    try:
        meta = json.loads(meta_raw)
    except json.JSONDecodeError:
        meta = {}

    # ── Step 2: summarize each chunk ─────────────────────────────────────────
    chunks = [full_text[i:i + CHUNK_SIZE] for i in range(0, len(full_text), CHUNK_SIZE)]
    print(f"   → Analyzing in {len(chunks)} chunks…")

    summaries = []
    for idx, chunk in enumerate(chunks, 1):
        print(f"   → Chunk {idx}/{len(chunks)}…")
        summary = _deepseek_call(
            client,
            system="You are summarizing a chunk of an academic paper. Extract key information: problem, method, contributions, results, metrics. Be concise. Plain text, no JSON.",
            user=chunk,
        )
        summaries.append(summary)

    combined_summary = "\n\n".join(
        f"[Chunk {i+1}]\n{s}" for i, s in enumerate(summaries)
    )

    # ── Step 3: generate structured JSON ─────────────────────────────────────
    figures_summary = "\n".join(
        f"- filename: {f['filename']}\n  caption: {f['caption']}\n  page: {f['page']}"
        for f in figures
    ) or "No figures extracted."

    paper_types_str = ", ".join(PAPER_TYPES)

    print("   → Generating structured JSON…")
    raw = _deepseek_call(
        client,
        system=SYSTEM_PROMPT,
        user=USER_PROMPT_TEMPLATE.format(
            text=combined_summary,
            figures_summary=figures_summary,
            paper_types=paper_types_str,
        ),
    )

    data = json.loads(raw)

    # ── Overwrite meta with the accurate first-page extraction ────────────────
    if meta.get("title"):
        data["meta"]["title"] = meta["title"]
    if meta.get("authors"):
        data["meta"]["authors"] = meta["authors"]
    if meta.get("venue"):
        data["meta"]["venue"] = meta["venue"]
    if meta.get("year"):
        data["meta"]["year"] = meta["year"]

    paper_type = data["meta"].get("paper_type", "other")
    data["theme"] = THEMES.get(paper_type, THEMES["other"])

    return data
