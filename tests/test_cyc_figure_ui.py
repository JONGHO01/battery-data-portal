"""Regression checks for the CYC Fig rendering path."""

from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class CycFigureUiTests(unittest.TestCase):
    def setUp(self):
        self.app_js = (ROOT / "public" / "app.js").read_text(encoding="utf-8")

    def test_cyc_figure_has_one_authoritative_renderer(self):
        self.assertEqual(self.app_js.count("function renderCycFigure(d)"), 1)

    def test_capacity_series_ignores_nonpositive_cycle_numbers(self):
        self.assertIn("if (!Number.isFinite(cycle) || cycle < 1 || !Number.isFinite(capacity)) continue;", self.app_js)
        self.assertIn("if (Math.abs(cycle - wholeCycle) > 1e-6) continue;", self.app_js)

    def test_capacity_series_reduces_repeated_measurements_to_one_point_per_cycle(self):
        self.assertIn("const finalCapacityByCycle = new Map();", self.app_js)
        self.assertIn("if (!previous || point.y > previous.y)", self.app_js)
        self.assertIn("const raw = [...finalCapacityByCycle.values()]", self.app_js)

    def test_cyc_figure_prioritizes_an_explicit_c_rate_column(self):
        self.assertIn('cRate: findColumn(columns, ["crate", "cratec", "ratec"', self.app_js)
        self.assertIn("const explicitSegments = explicitCRateSegments(rows, minCycle, maxCycle);", self.app_js)
        self.assertIn("if (explicitSegments.length >= 1) return explicitSegments;", self.app_js)

    def test_c_rate_filename_ignores_sample_index_before_fractional_rate(self):
        self.assertIn("const firstFractionalRate = labels.findIndex", self.app_js)
        self.assertIn("if (firstFractionalRate > 0) labels = labels.slice(firstFractionalRate);", self.app_js)

    def test_c_rate_guide_lines_require_complete_positive_displayed_cycles(self):
        self.assertIn("function cRateFigureSegments(segments, capPts)", self.app_js)
        self.assertIn("coveredCycles.length < 2", self.app_js)
        self.assertIn("cRateFigureSegments(inferCRateSegments(d, rows, capPts), capPts)", self.app_js)

    def test_cyc_capacity_axis_limits_dense_ticks_for_bad_outliers(self):
        # Specific capacity retains the safe 20 mAh g-1 tick logic, while a
        # raw Ah column needs its own numeric scale rather than that unit.
        self.assertIn("const isSpecificCapacity = capacityUnit === \"mAh g-1\";", self.app_js)
        self.assertIn("Math.max(20, Math.ceil(upper / 9 / 20) * 20)", self.app_js)
        self.assertIn("cycCapacityTickStep(capDomain[1], isSpecificCapacity)", self.app_js)
        self.assertIn("plot.x - yLabelOffset", self.app_js)

    def test_cyc_figure_style_controls_support_grid_line_and_marker_size(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="figureShowGrid"', html)
        self.assertIn('id="figureConnectPoints"', html)
        self.assertIn('id="figureMarkerSize"', html)
        self.assertIn("function normalizeFigureMarkerSize", self.app_js)
        self.assertIn("style.showGrid", self.app_js)
        self.assertIn("style.connectPoints", self.app_js)
        self.assertIn('markerPoints(capPts, sx, sy, "capPt", style.markerSize)', self.app_js)

    def test_voltage_profile_supports_shared_c_rate_colors(self):
        """A C-rate override colors its charge/discharge pair and remains saved."""

        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="profileSeriesSelect"', html)
        self.assertIn('id="profileSeriesColor"', html)
        self.assertIn('id="profileSeriesColorReset"', html)
        self.assertIn("C-rate 선택", html)
        self.assertIn("C-rate 색상", html)
        self.assertIn("function cycProfileSeriesKey", self.app_js)
        self.assertIn("function cycRateColorKey", self.app_js)
        self.assertIn("function uniqueCycRateSeries", self.app_js)
        self.assertIn("function cycRateColor", self.app_js)
        self.assertIn(
            "return cycRateColor(style, series, allSeries, colors, style?.seriesColorOverrides);",
            self.app_js,
        )
        self.assertIn("function syncProfileSeriesControls", self.app_js)
        self.assertIn("function changeProfileSeriesColor", self.app_js)
        self.assertIn("function resetProfileSeriesColor", self.app_js)
        self.assertIn("seriesColorOverrides", self.app_js)
        self.assertIn("rateColorOverrides", self.app_js)
        self.assertIn("cycProfileSeriesColor(style, series", self.app_js)
        self.assertIn('on("profileSeriesSelect", "change", changeProfileSeriesSelection)', self.app_js)
        self.assertIn('on("profileSeriesColor", "input", changeProfileSeriesColor)', self.app_js)
        self.assertIn('on("profileSeriesColorReset", "click", resetProfileSeriesColor)', self.app_js)
        self.assertIn("syncProfileSeriesControls(null);", self.app_js)

    def test_dqdv_shares_c_rate_colors_and_has_a_bottom_legend(self):
        """dQ/dV reads shared C-rate colors and keeps its legend below the plot."""

        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="dqdvSeriesControls"', html)
        self.assertIn('id="dqdvSeriesSelect"', html)
        self.assertIn('id="dqdvSeriesColor"', html)
        self.assertIn('id="dqdvSeriesColorReset"', html)
        self.assertIn('aria-label="dQ/dV C-rate 선택"', html)
        self.assertIn("function cycDqdvSeriesColor", self.app_js)
        self.assertIn(
            "return cycRateColor(style, series, allSeries, colors, style?.dqdvSeriesColorOverrides);",
            self.app_js,
        )
        self.assertIn("function syncDqdvSeriesControls", self.app_js)
        self.assertIn("function changeDqdvSeriesColor", self.app_js)
        self.assertIn("function resetDqdvSeriesColor", self.app_js)
        self.assertIn("dqdvSeriesColorOverrides", self.app_js)
        self.assertIn("style.rateColorOverrides = {", self.app_js)
        self.assertIn("syncDqdvSeriesControls(analysis, style);", self.app_js)
        self.assertIn("const legendTop = y + h + 76;", self.app_js)
        self.assertIn('on("dqdvSeriesSelect", "change", changeDqdvSeriesSelection)', self.app_js)
        self.assertIn('on("dqdvSeriesColor", "input", changeDqdvSeriesColor)', self.app_js)
        self.assertIn('on("dqdvSeriesColorReset", "click", resetDqdvSeriesColor)', self.app_js)

    def test_cyc_connection_line_keeps_gaps_between_missing_cycles(self):
        self.assertIn('Math.abs(p.x - prev.x) > 1.5 ? "M" : "L"', self.app_js)
        self.assertIn('style.connectPoints && capPath ? `<path d="${capPath}" class="capLine"/>` : ""', self.app_js)

    def test_cyc_fig_choice_uses_distinct_rendering_paths(self):
        self.assertIn('const kind = ["cycling-performance", "voltage-profile", "dqdv"].includes(d.figureKind)', self.app_js)
        self.assertIn('if (kind === "voltage-profile") return renderCycVoltageProfileFigure(d);', self.app_js)
        self.assertIn('if (kind === "dqdv") return renderCycDqdvFigure(d);', self.app_js)
        self.assertNotIn('if (kind === "cyc-combined") return renderCycCombinedFigure(d);', self.app_js)

    def test_cyc_fig_choices_are_single_panel_only(self):
        self.assertNotIn('["cyc-combined",', self.app_js)
        self.assertIn('["cycling-performance",', self.app_js)
        self.assertIn('["voltage-profile",', self.app_js)
        self.assertIn('["dqdv",', self.app_js)

    def test_cyc_fig_choices_include_dqdv(self):
        self.assertIn('["dqdv", "dQ/dV', self.app_js)
        self.assertIn('"dqdv": "dQ/dV Fig"', self.app_js)

    def test_dqdv_requires_real_within_cycle_voltage_capacity_traces(self):
        self.assertIn("function cycDqdvSeries(rows, rateSegments = [])", self.app_js)
        self.assertIn("function dqdvCurveFromPoints(points)", self.app_js)
        self.assertIn("points.length < 8", self.app_js)
        self.assertIn("voltageValues.size < 6 || capacityValues.size < 6", self.app_js)
        self.assertIn("function cycDqdvPanel", self.app_js)
        self.assertIn(r"dQ/dV\uc6a9 \uc6d0\ubcf8 \uc804\uc555-\uc6a9\ub7c9 \ud2b8\ub808\uc774\uc2a4", self.app_js)

    def test_summary_only_cyc_data_cannot_save_a_blank_dqdv_figure(self):
        self.assertIn('id === "dqdv" && !hasDqdvTrace', self.app_js)
        self.assertIn('figureKind === "dqdv" && !cycDqdvSeries(rows).hasRawTrace', self.app_js)

    def test_saved_raw_cyc_rows_are_normalized_for_saved_figure_rendering(self):
        self.assertIn("function normalizeSavedCycDataset", self.app_js)
        self.assertIn('canonicalRows("cyc", columns, sourceRows.map', self.app_js)
        self.assertIn("state.datasets = savedDatasets.map(normalizeSavedCycDataset);", self.app_js)

    def test_saved_list_hydrates_raw_rows_only_for_the_selected_dataset(self):
        """Large WRD files must not be duplicated into the initial list response."""

        self.assertIn("async function hydrateDatasetRows(datasetId)", self.app_js)
        self.assertIn("d.rowsLoaded === false", self.app_js)
        self.assertIn("datasetDetailRequests: new Map()", self.app_js)

    def test_compact_search_and_saved_cards_display_the_exact_dataset_row_count(self):
        authoritative = self.app_js[self.app_js.rindex("// Authoritative saved-Fig labels.") :]

        self.assertIn("function datasetPointCount(dataset)", self.app_js)
        self.assertGreaterEqual(self.app_js.count("datasetPointCount("), 5)
        self.assertIn('String(datasetPointCount(dataset)) + " points"', authoritative)
        self.assertNotIn('String(dataset.rows?.length || 0) + " points"', authoritative)

    def test_cyc_comparison_hydrates_every_selected_metadata_only_dataset(self):
        authoritative = self.app_js[self.app_js.rindex("// Authoritative saved-Fig labels.") :]

        self.assertIn("async function renderCycComparison()", authoritative)
        self.assertIn("await Promise.all(", authoritative)
        self.assertIn("hydrateCycComparisonSeries(datasetId)", authoritative)
        self.assertIn("/comparison-series", self.app_js)
        self.assertIn("state.comparisonSeriesByDatasetId = new Map()", self.app_js)
        no_series_guard = '    return;\n  }\n'
        color_map = "  const colorMap = Object.fromEntries("
        self.assertIn(no_series_guard + color_map, authoritative)
        self.assertNotIn('    return;\n' + color_map, authoritative)

    def test_raw_ah_capacity_keeps_its_real_unit_for_cyc_figures(self):
        """A raw discharge-Q column must not be labeled as specific capacity."""

        self.assertIn("function cycCapacityUnitFromColumn", self.app_js)
        self.assertIn("function cycCapacityAxisLabel(rows)", self.app_js)
        self.assertIn("capacityUnit: dischargeUnit", self.app_js)
        self.assertIn("ylabel: dqdvAxisLabel(analysis.capacityUnit)", self.app_js)
        self.assertIn("const capacityAxisLabel = cycCapacityAxisLabel(rows);", self.app_js)
        self.assertNotIn("point.y * factor", self.app_js)

    def test_figure_choice_copy_keeps_the_full_option_width(self):
        """Radio labels and readiness hints must share the wide second grid column."""

        style_css = (ROOT / "public" / "style.css").read_text(encoding="utf-8")
        self.assertIn('class="figureChoiceBody"', self.app_js)
        self.assertIn('class="figureChoiceLabel"', self.app_js)
        self.assertIn(".figureChoiceBody", style_css)
        self.assertIn(".figureChoiceLabel", style_css)

    def test_render_figure_rebuilds_raw_cyc_rows_after_a_saved_edit(self):
        """CYC drawing must not depend on a prior page reload to restore capacity."""

        self.assertIn("function activeCycFigureViewKind", self.app_js)
        self.assertIn("const figureKind = activeCycFigureViewKind(normalized);", self.app_js)
        self.assertIn("renderCycFigureViewPicker(normalized, figureKind);", self.app_js)
        self.assertIn("return renderCycFigure({ ...normalized, figureKind });", self.app_js)

    def test_saved_cyc_figure_can_switch_back_to_raw_data_views(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        style_css = (ROOT / "public" / "style.css").read_text(encoding="utf-8")
        self.assertIn('id="cycFigureViewPicker"', html)
        self.assertIn("data-cyc-figure-view", self.app_js)
        self.assertIn("state.cycFigureViewKinds[dataset.id] = figureKind;", self.app_js)
        self.assertIn("cycFigureViewPicker", style_css)

    def test_generic_specific_capacity_header_is_accepted_for_wrd_discharge_traces(self):
        """WBCS WRD exports label the discharge trace as generic specific capacity."""

        self.assertIn(
            'role === "dischargeSpecific" && !chargeOnly && capacity && specific',
            self.app_js,
        )

    def test_legacy_null_capacity_rows_are_rebuilt_from_parser_rows(self):
        """Saved pre-fix CYC rows must not block parser-artifact recovery."""

        self.assertIn("const hasUsableCapacity = item.rows.some", self.app_js)
        self.assertIn('typeof row?.capacity === "number" && Number.isFinite(row.capacity) && row.capacity > 0', self.app_js)
        self.assertIn("Array.isArray(item.renderRows) && item.renderRows.length", self.app_js)

    def test_dqdv_unavailable_state_has_a_specific_data_reason(self):
        self.assertIn("function dqdvUnavailableMessage(rows)", self.app_js)

    def test_cyc_fig_choices_explain_which_result_will_be_created(self):
        self.assertIn("function dqdvReadinessSummary(analysis)", self.app_js)
        self.assertIn("function cycDqdvReadiness(rows)", self.app_js)
        self.assertIn('data-figure-kind="${id}"', self.app_js)
        self.assertIn("CYC performance Fig: one point per cycle", self.app_js)
        self.assertIn("dQ/dV ready:", self.app_js)

    def test_inspection_does_not_depend_on_a_duplicate_canonical_response_payload(self):
        """Large WRD inspections should derive preview-only C-rate data from sampled rows."""

        self.assertIn('explicitCRateValues(inspectionCanonicalRows("cyc"))', self.app_js)
        self.assertNotIn("explicitCRateValues(a.canonicalRows || [])", self.app_js)

    def test_large_inspection_releases_the_busy_overlay_before_rendering_results(self):
        """A heavy preview must not leave the browser behind a completed-analysis modal."""

        self.assertIn("function nextBrowserPaint()", self.app_js)
        self.assertIn("setBusy(false);\n    await nextBrowserPaint();", self.app_js)
        self.assertLess(
            self.app_js.index("await nextBrowserPaint();"),
            self.app_js.index("state.analysis = body;"),
        )

    def test_inspection_reuses_one_canonical_cyc_preview(self):
        """Initial CYC rendering must not normalize the same preview twice."""

        self.assertIn("function inspectionCanonicalRows(type)", self.app_js)
        self.assertIn('explicitCRateValues(inspectionCanonicalRows("cyc"))', self.app_js)
        self.assertIn('const cycRows = type === "cyc" ? inspectionCanonicalRows("cyc") : [];', self.app_js)

    def test_refresh_keeps_the_user_selected_cyc_figure_kind(self):
        """Inspection refresh must not silently reset dQ/dV back to performance."""

        self.assertIn('const selectedFigureKind = document.querySelector("input[name=\'figureKind\']:checked")?.value || "";', self.app_js)
        self.assertIn("const hasSelectedFigureKind = options.some", self.app_js)
        self.assertIn("const checked = hasSelectedFigureKind ? id === selectedFigureKind : idx === 0;", self.app_js)

    def test_large_tables_are_paginated_without_reindexing_raw_rows(self):
        index_html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.assertIn("const TABLE_PAGE_SIZE = 250", self.app_js)
        self.assertIn("const visibleRows = d.rows.slice(rowStart, rowEnd)", self.app_js)
        self.assertIn("const rowIndex = rowStart + visibleIndex", self.app_js)
        self.assertIn("function changeExcelTablePage(delta)", self.app_js)
        self.assertIn('id="excelTablePagination"', index_html)

    def test_selected_cyc_figure_updates_the_create_action_label(self):
        """A dQ/dV selection must never still look like a performance-Fig action."""

        self.assertIn('$("figureChoices").onchange = updateCreateFigureButton;', self.app_js)
        self.assertIn('dqdv: "dQ/dV Fig \\uc0dd\\uc131"', self.app_js)

    def test_cell_information_action_does_not_claim_to_create_a_figure(self):
        """The metadata action is separate from the selected Fig creation action."""

        self.assertIn('applyButton.textContent = "\\uc140 \\uc815\\ubcf4\\ub9cc \\uc801\\uc6a9";', self.app_js)

    def test_voltage_profile_requires_real_curve_points(self):
        self.assertIn("function cycVoltageProfileSeries(rows, rateSegments = [])", self.app_js)
        self.assertIn("Number.isFinite(Number(row?.capacity)) ? Number(row.capacity) : Number(row?.chargeCapacity)", self.app_js)
        self.assertIn('[["charge", charge], ["discharge", discharge]]', self.app_js)
        self.assertIn("sortedPoints.length < 6 || xValues.size < 6", self.app_js)

    def test_raw_trace_figures_keep_charge_discharge_pairs_per_c_rate(self):
        """A representative C-rate must retain its matching charge/discharge pair."""

        self.assertIn("function selectRepresentativeCycTraces", self.app_js)
        self.assertIn("selected.push(...tracesForCycle(cycle, String(segment.label || \"\")));", self.app_js)
        self.assertIn("function orientDqdvCurve", self.app_js)
        self.assertIn("series: selectRepresentativeCycTraces(usable, rateSegments)", self.app_js)
        self.assertIn("series: selectRepresentativeCycTraces(candidates, rateSegments)", self.app_js)
        self.assertIn("cycVoltageProfileSeries(rows, rateSegments)", self.app_js)
        self.assertIn("cycDqdvSeries(rows, rateSegments)", self.app_js)
        self.assertIn('series.direction === "discharge" ? "6 3" : ""', self.app_js)

    def test_raw_cyc_direction_is_preserved_before_current_sign_fallback(self):
        """WBCS rows explicitly label charge/discharge even when current is rounded."""

        self.assertIn('direction: findColumn(columns, ["direction", "step direction", "mode", "state"])', self.app_js)
        self.assertIn("function cycDirectionFromValue(value, current = NaN)", self.app_js)
        self.assertIn("const direction = cycDirectionFromValue(r[col.direction], current);", self.app_js)
        self.assertIn("        direction,", self.app_js)
        self.assertIn('point.direction === "charge"', self.app_js)
        self.assertIn('point.direction === "discharge"', self.app_js)

    def test_summary_only_cyc_data_has_a_voltage_and_current_fallback(self):
        self.assertIn("function cycVoltageCurrentTrend(rows)", self.app_js)
        self.assertIn("function cycVoltageCurrentTrendPanel", self.app_js)
        self.assertIn("Current (mA, +charge / -discharge)", self.app_js)
        self.assertIn("Cycle-summary only: mean voltage and current by cycle", self.app_js)

    def test_raw_voltage_profile_legend_includes_current(self):
        self.assertIn("function formatCurrentForFigure", self.app_js)
        self.assertIn("Iavg", self.app_js)
        self.assertIn("Voltage/current behavior", self.app_js)

    def test_raw_voltage_profile_legend_uses_a_dedicated_bottom_band(self):
        """C-rate labels must remain readable without covering the voltage curves."""

        self.assertIn("const legendRowHeight = 26;", self.app_js)
        self.assertIn("const legendReserve = 72 + legendRows * legendRowHeight;", self.app_js)
        self.assertIn("const plotH = Math.max(150, h - legendReserve);", self.app_js)
        self.assertIn("const legendTop = y + plotH + 56;", self.app_js)
        self.assertIn('class="profileLegendPanel"', self.app_js)
        self.assertIn('class="profileLegendNote"', self.app_js)
        self.assertIn(r"\uc2e4\uc120: \ucda9\uc804, \uc810\uc120: \ubc29\uc804", self.app_js)
        self.assertNotIn("const ly = y + 18 + Math.floor(index / columns) * 32;", self.app_js)

    def test_c_rate_segment_labels_match_axis_tick_typography(self):
        """C-rate labels should not use a visually unrelated font or size."""
        expected = '.rateLabel{font:12px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}'
        self.assertIn(expected, self.app_js)
        self.assertNotIn('.rateLabel{font:10px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}', self.app_js)

    def test_user_annotations_match_figure_label_typography(self):
        """Custom annotations should use the regular label font, not bold text."""
        annotation_font = "font:400 ${clampFontSize(a.size)}px 'Segoe UI','Noto Sans KR',Arial,sans-serif"
        self.assertEqual(self.app_js.count(annotation_font), 2)
        self.assertNotIn(
            "font:700 ${clampFontSize(a.size)}px 'Segoe UI','Noto Sans KR',Arial,sans-serif",
            self.app_js,
        )

    def test_empty_figure_and_table_messages_are_clear_korean(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.assertIn("\uc120\ud0dd\ud55c Dataset \uc5c6\uc74c", html)
        self.assertIn(r"\uc120\ud0dd\ud55c Dataset \uc5c6\uc74c", self.app_js)
        self.assertIn(r"\ud45c\uc2dc\ud560 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.", self.app_js)
        self.assertIn('$("figureTitle").textContent = "\\uc120\\ud0dd\\ud55c Dataset \\uc5c6\\uc74c";', self.app_js)
        self.assertNotIn('textContent = "No dataset"', self.app_js)

    def test_saved_fig_comparison_uses_the_authoritative_readable_label_path(self):
        start = self.app_js.rindex("// Authoritative saved-Fig labels.")
        saved_fig_ui = self.app_js[start:]
        for escaped_label in (
            r"\uc800\uc7a5\ub41c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
            r"CYC \ube44\uad50 Fig",
            r"\ube44\uad50 Fig \uc800\uc7a5",
            r"CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uba74",
        ):
            self.assertIn(escaped_label, saved_fig_ui)
        self.assertIn("function renderCycComparison()", saved_fig_ui)
        self.assertIn("function saveComparisonFigure()", saved_fig_ui)

    def test_cyc_comparison_can_export_to_ppt(self):
        start = self.app_js.rindex("// Authoritative saved-Fig labels.")
        saved_fig_ui = self.app_js[start:]
        self.assertIn('id="exportComparisonPpt"', saved_fig_ui)
        self.assertIn('$("exportComparisonPpt")?.addEventListener("click", exportComparisonPpt);', saved_fig_ui)
        self.assertIn("function exportComparisonPpt()", self.app_js)
        self.assertIn('exportSvgAsPpt($("comparisonFigure"), "cyc-comparison.pptx", savedFigText().exportMissing)', self.app_js)
        self.assertIn("async function exportSvgAsPpt(svg, fileName, missingMessage)", self.app_js)

    def test_saved_fig_list_uses_the_authoritative_readable_renderer(self):
        start = self.app_js.rindex("// Authoritative saved-Fig labels.")
        saved_list = self.app_js[start:]
        for escaped_label in (
            r"\uc800\uc7a5\ub41c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
            r"CYC \ube44\uad50 \uc120\ud0dd",
            r"CYC Fig\ub9cc \ube44\uad50\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
            r"Fig \uc5f4\uae30",
            r"\ub0a0\uc9dc \uc5c6\uc74c",
            r"\uc800\uc7a5\ub41c Fig \uc0ad\uc81c",
            r"\uc800\uc7a5\ub41c Fig\ub97c \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.",
            r"\uc131\ub2a5 \ud14c\uc2a4\ud2b8 Fig",
            r"\uc804\uc555 \ud504\ub85c\ud30c\uc77c Fig",
            r"Nyquist + DRT Fig",
        ):
            self.assertIn(escaped_label, saved_list)
        self.assertIn("function renderSavedList()", saved_list)

    def test_cyc_header_shows_raw_and_saved_electrode_details_with_clear_sources(self):
        html = (ROOT / "public" / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="cycElectrodeSummary"', html)
        self.assertIn('class="figureIdentity"', html)
        self.assertIn("function filenameElectrodeMassLabels", self.app_js)
        self.assertIn("function renderCycFigureElectrodeSummary", self.app_js)
        self.assertIn(r"\uc6d0\ubcf8 \ud30c\uc77c\uba85 \uc9c8\ub7c9", self.app_js)
        self.assertIn(r"\uc800\uc7a5 \uc804\uadf9 \uacc4\uc0b0", self.app_js)
        self.assertIn("renderCycFigureElectrodeSummary(normalized);", self.app_js)
        self.assertIn("activeLoading_g_cm2", self.app_js)
        self.assertIn("electrodeMass_g", self.app_js)


if __name__ == "__main__":
    unittest.main()
