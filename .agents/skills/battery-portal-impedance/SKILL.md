---
name: battery-portal-impedance
description: Analyze Battery Data Portal EIS data with impedance.py when SEO, CSV, or normalized impedance data needs frequency and impedance validation, Nyquist or Bode data, equivalent-circuit fitting, fitted parameters, reproducible figure artifacts, or PPT-ready EIS results.
---

# Battery Portal Impedance Analysis

Use this project-local skill for EIS ingestion and analysis. Start with the portal SEO/CSV parser and clear column interpretation; use impedance.py only after frequency, Zreal, and Zimag are verified.

## Read First

Read `AGENTS.md`, `docs/SESSION_MEMORY.md`, `backend/parsers/`, `backend/analysis/`, and the relevant tests before changing EIS behavior.

## Workflow

1. Preserve the source EIS file as a `raw` dataset artifact.
2. Normalize valid fields to frequency (Hz), Zreal (Ohm), Zimag (Ohm), magnitude (Ohm), and phase (degree) when present.
3. Explain detected fields in Korean in the UI; do not expose raw internal field names without context.
4. Check the project runtime before fitting:

   ```powershell
   .\.venv\Scripts\python.exe -c "import impedance; print('impedance available')"
   ```

5. Use impedance.py only with an explicit circuit string and initial guesses. Store measured points, fitted points, parameters, warnings, and fit settings as an analysis artifact.
6. Render Nyquist and Bode figures from the stored data and keep the figure caption reproducible.

## Quality Rules

- Do not fit data blindly when frequency, Zreal, or Zimag cannot be identified.
- Keep measured and fitted data together; never replace measurements with fitted values.
- Make circuit choice, initial guesses, and units visible in output metadata.
- Add or update a focused test in `tests/` when parser, plot, or fitting behavior changes.

## Boundaries

- Do not modify or delete `C:\\Users\\user\\.codex\\skills\\impedance-py\\SKILL.md`.
- Do not claim a fit is scientifically valid solely because numerical fitting completed.
