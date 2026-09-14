# EIS-only DRT analysis

## Repeated measurements and upload checks (v0.2.4)

The EIS view splits acquisition-order data at an explicit sweep change, a repeated positive frequency, or a reversal of frequency direction. These are inferred measurement segments, not automatically identified physical cycles. No points are sorted, averaged or removed. All-segment viewing breaks the connecting line at every boundary; select one segment to calculate DRT. Prior aggregate fits are not displayed in all-segment mode.

The existing authorized analyses POST accepts optional `parameters.spectrumIndex`: a **zero-based integer** identifying this deterministic segmentation of original Dataset rows. Boolean, string, fractional, negative and out-of-range values return the existing controlled HTTP 400. The server selects the segment before quality normalization and preserves original `rowIndex` in reconstruction. Result metadata add `spectrumIndex` and `spectrumCount`. Omitting the parameter preserves legacy API behavior; the current UI does not submit an unselected multi-segment fit. No schema or storage migration is required.

Before selected-segment POST, the browser requires GET /api/health to advertise eisDrtSpectrumSelection=true. It also verifies returned selection metadata before displaying a fit, so an older running backend cannot silently save or show an aggregate result as a selected segment. Restart an existing local backend only with user approval. Browser upload inspection of the reported stored SEO source completed successfully; an unspecified separate upload failure has not been reproduced. Inspecting does not finalize a duplicate Dataset or Fig.

## Scope and data flow

The existing EIS renderer dispatches combined and Nyquist views to `public/eis-drt.js`. Standalone Bode uses the prior renderer. The module owns an EIS-only WeakMap and abortable view listeners. It does not change global state, CSS, sidebar, header, login, routing, shared parsers, CYC/CV, or storage configuration.

Existing upload → parser → canonical BDF rows / immutable artifacts → Dataset → EIS adapter → existing authorized `POST /api/datasets/{id}/analyses` (`analysisName=eis-drt`) → `backend/analysis/eis_drt.py` → separate analysis artifact and metadata. GET restores a matching saved analysis without recalculating or writing. Existing permissions remain enforced. There is no new endpoint or migration.

SEO/SDE parsers preserve signed imaginary values. Shared BDF mapping does not correct negative-imaginary headers. The EIS adapter normalizes frequency_Hz, z_real_ohm, z_imag_ohm, including original `_raw` headers. Im(Z)/Z'' are preserved; -Im(Z)/-Z'' are negated once. Already corrected canonical values are not negated again. Raw rows are never rewritten. Left coordinates are (Re, −Im); right coordinates are (Re, Im). Input order and sweep breaks are retained, never sorted by real impedance. HF means maximum valid frequency.

## Numerical contract

`Z = Re + i Im`, `omega = 2 pi f`.

`Zfit = Rs + i omega L + integral gamma(ln tau)/(1 + i omega tau) d(ln tau)`.

- M=100 initially; log grid from `0.1/omega_max` to `10/omega_min`.
- Trapezoidal log-grid weights: h internally, h/2 at both endpoints.
- `Z0=median(abs(Z))`, `omega_ref=max(omega)`, epsilon=`1e-12 Z0`.
- Variables r=Rs/Z0, ell=omega_ref L/Z0, g=gamma/Z0. Real kernel q/(1+(omega tau)^2); imaginary kernel −q omega tau/(1+(omega tau)^2).
- Equal real/imaginary weights `Z0/(max(abs(Z),epsilon) sqrt(N))`.
- Gamma-only second differences scaled by `sqrt(h)/h^2`; Rs/L are unregularized.
- Augmented least squares `[WA; lambda B]` with all variables nonnegative; SciPy 1.17.1 `lsq_linear(method="bvls")`, no matrix inverse. Disabling L removes its column and yields exactly zero L.
- Manual lambda starts at 0.001. Optional L-curve uses 41 log-spaced values 1e-6…10. Positive curvature, interior location, meaningful curve variation and nontrivial RC mass are heuristic reliability checks, not physical validation. Ambiguous corners fall back to the explicitly entered manual lambda with a warning.
- Peak P1/P2 regions end at neighboring numerical minima. Region resistance integrates gamma in ln(tau), with interpolated boundaries. Rs is not a peak. Peaks never automatically identify SEI, charge transfer or ionic transport.
- Reconstruction is evaluated at every valid original frequency. `relative_complex_RMSE_percent = 100 sqrt(mean(abs(Zfit-Z)^2 / max(abs(Z),epsilon)^2))`.

## Quality, bounds and persistence

Only missing/nonfinite values and nonpositive frequency are excluded from DRT. Original data remain intact. Duplicate frequencies remain separate and produce a warning; multiple sweeps may not represent one stationary spectrum. Negative imaginary values are valid. Without frequency, both Nyquists remain available and DRT displays its required-input message.

For bounded synchronous work: M=20…200; at most 2,000 source rows; at least three distinct positive frequencies; supported f=1e-12…1e15 Hz and finite impedance magnitude ≤1e100 ohm. Larger inputs are rejected explicitly, not silently averaged/subsampled. Auto-search checks a 45-second budget between solves (not a hard interruption of an individual solve). The browser waits up to 120 seconds; a timeout does not prove server cancellation. Reopen the Fig to check whether a result was saved before retrying.

The measured information band is 1/omega_max…1/omega_min. Yellow outside-band shading warns against overinterpretation. A nonnegative RC model cannot necessarily fit inductive loops or nonstationary data; the serial L term models series inductance only. Error above 5% warns of mismatch, not automatic outlier removal. Defaults are not claimed optimal.

Settings/data/file changes invalidate displayed fits. A revision guard rejects late responses; raw-triplet equality prevents applying saved fits to different data. Saved metadata include lambda, M, tau limits, Rs, L, includeL, sign convention, excluded count, solver, quality, and provenance. CSV exports use numeric fixed columns. Existing SVG/PNG export the same three-panel SVG; metadata JSON includes quality and warnings.

## Verification

Numerical and UI tests cover signed/negative headers, nonmutation, single RC, two RC plus L, exact-zero L, pure resistance, ambiguous auto-selection, invalid/missing/duplicate frequency, failed solver, log-time integration, stale file responses, CSV and SVG contents. Synthetic two-RC manual fitting returned Rs≈2.991 ohm, L≈1.001 microhenry, region resistances≈5.004 and 15.15 ohm, and relative RMSE≈1.091%.

An isolated disposable local server with synthetic data verified browser login; EIS calculation/save/reopen; three panels and both reconstruction paths; L-off recalculation; missing-frequency Nyquist; integration; DRT enlargement; DRT CSV (100 rows), reconstruction CSV (161 rows), metadata JSON, SVG and PNG downloads. CYC, CV, upload, organization and member screens rendered without DRT controls leaking into them. Real account/experiment data were not modified by these browser tests. Automated event tests cover changing files while a calculation is in flight; a native file-picker change during calculation was not separately exercised.

Final suite results are recorded in SESSION_MEMORY.md. This repository has no build or lint script: attempting those commands reports missing scripts; syntax checks and executable tests are separate checks, not substitutes claimed as build/lint success. Actual uploaded instrument-file fitting, PPT export, production Neon/B2 access, Render deployment, and updating the already-running 4174 backend require separate verification.
