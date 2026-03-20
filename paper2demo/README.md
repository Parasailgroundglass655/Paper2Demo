# paper2demo — Python Pipeline

Converts an academic PDF into a Remotion video demo.

## Setup

```bash
cd paper2demo
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
```

## Usage

```bash
python main.py /path/to/paper.pdf
```

The script will:
1. Extract text and figures from the PDF (PyMuPDF)
2. Send content to Claude API for structured analysis
3. Write `public/paper/paper-data.json` + copy figures to `public/paper/`

Then open Remotion Studio and select the **PaperDemo** composition:

```bash
npm run dev
```

## Output structure

```
public/paper/
├── paper-data.json        ← structured video script
├── fig_p2_42.png          ← extracted figures
└── fig_p4_87.png
```

## Adaptive themes

| Paper type            | Theme name | Colors              |
|-----------------------|------------|---------------------|
| model_compression     | efficiency | Blue / Purple       |
| image_generation      | creative   | Purple / Pink       |
| nlp_llm               | language   | Teal / Green        |
| reinforcement_learning| action     | Orange / Amber      |
| computer_vision       | vision     | Sky / Indigo        |
| multimodal            | fusion     | Cyan / Magenta      |
| robotics              | robotics   | Steel / Orange      |
| medical               | medical    | Blue / Aqua         |
| theory_optimization   | academic   | Gold / Purple       |
| systems               | systems    | Emerald / Blue      |
