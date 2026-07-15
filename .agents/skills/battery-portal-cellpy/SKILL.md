---
name: battery-portal-cellpy
description: Analyze Battery Data Portal CYC and charge-discharge data with cellpy when a supported cycler file needs normalized cycle summaries, capacity or efficiency metrics, capacity-voltage curves, dQ/dV outputs, BDF mapping, or reproducible portal and PPT artifacts.
---

# Battery Portal Cellpy Analysis

Use this project-local skill for CYC and charge-discharge analysis. Prefer the portal parser and BDF workflow first; use cellpy when its loader supports the source file and it adds repeatable analysis value.

## Read First

Read `AGENTS.md`, `docs/SESSION_MEMORY.md`, `backend/parsers/`, `backend/schemas/bdf.py`, and the relevant test before changing analysis behavior.

## Workflow

1. Preserve the uploaded raw file under the dataset's `raw` artifact path.
2. Identify columns and units through the parser and map them to BDF canonical fields.
3. Check the project runtime before using cellpy:

   ```powershell
   .\.venv\Scripts\python.exe -c "import cellpy; print(cellpy.__version__)"
   ```

4. Use cellpy for supported files to create cycle summaries, capacity-voltage data, and optional dQ/dV results.
5. Store parsed and analysis artifacts separately from the raw file. Include source file name, parser version, unit assumptions, active mass/loading assumptions, and analysis parameters.
6. Return compact JSON data for the static UI and preserve the same numbers for figure and PPT export.

## Required Outputs

- cycle number
- charge and discharge capacity
- coulombic efficiency when calculable
- voltage or capacity-voltage series when available
- warnings and quality-review findings

## Quality Rules

- Never overwrite raw data.
- Never silently convert Ah and mAh/g without recording the conversion.
- Validate a small representative file before batch processing.
- Add or update a focused test in `tests/` when parser or analysis behavior changes.

## Boundaries

- Do not modify or delete `C:\\Users\\user\\.codex\\skills\\cellpy\\SKILL.md`.
- Do not present unsupported vendor formats as successful cellpy imports.
