const PORTAL_VERSION = "0.2.3";
const PORTAL_VERSION_LABEL = `Battery Portal v${PORTAL_VERSION}`;

// Keep this short in-app release list aligned with README and CHANGELOG.md.
// CHANGELOG.md remains the complete source for released change details.
const RELEASE_HISTORY = [
  {
    "version": "0.2.3",
    "date": "2026-09-14",
    "changes": [
      "Use readable round Y-axis ticks for CYC voltage, current, dQ/dV and combined performance views.",
      "Preserve axis limits, measured values and units; validate eight real WRD files without re-uploading."
    ]
  },
  {
    "version": "0.2.2",
    "date": "2026-09-14",
    "changes": [
      "Use round CYC capacity ticks and reserve space between numbers and the Y-axis title.",
      "Keep measured Ah and specific-capacity units unchanged; no data or storage changes."
    ]
  },
  {
    "version": "0.2.1",
    "date": "2026-09-14",
    "changes": [
      "Restore saved CYC graphs when optional specific-capacity cells are empty or artifact columns differ from saved headers.",
      "Keep measured Ah units and scale small capacities visibly; do not invent zero discharge cycles from missing values.",
      "Preserve original files, storage, login, layout and EIS/CV behavior."
    ]
  },
  {
    "version": "0.2.0",
    "date": "2026-09-10",
    "changes": [
      "EIS \uacb0\uacfc \ub0b4\ubd80\uc758 \uc624\ub978\ucabd Bode \ub450 \ud328\ub110\uc744 DRT\uc640 \uc2e4\uc81c Im(Z) Nyquist\ub85c \uad50\uccb4\ud588\uc2b5\ub2c8\ub2e4.",
      "\ube44\uc74c\uc218 RC-DRT, \uc120\ud0dd\uc801 \uc9c1\ub82c L, L-curve, \uad6c\uac04 \uc800\ud56d \uc801\ubd84, \uc7ac\uad6c\uc131 \uc624\ucc28\uc640 CSV \uc800\uc7a5\uc744 \ucd94\uac00\ud588\uc2b5\ub2c8\ub2e4.",
      "\uae30\uc874 \uc0ac\uc774\ub4dc\ubc14\u00b7\ud5e4\ub354\u00b7\ub85c\uadf8\uc778\u00b7\ub2e4\ub978 \ubd84\uc11d \ud398\uc774\uc9c0\uc640 Neon/B2 \uc800\uc7a5 \uad6c\uc870\ub294 \uc720\uc9c0\ud569\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.80",
    "date": "2026-09-10",
    "changes": [
      "Clear stale analysis results before uploads, retain failed single-file selections, and prevent duplicate analysis clicks.",
      "Explain network failures without silently replaying uploads or sending files to another server.",
      "Run blocking inspection work outside the request event loop so other requests can proceed."
    ]
  },
  {
    "version": "0.1.79",
    "date": "2026-09-10",
    "changes": [
      "Local text update: explicitly spell the administrator refresh button in Korean and guard all six refresh labels with regression tests."
    ]
  },
  {
    "version": "0.1.78",
    "date": "2026-09-10",
    "changes": [
      "Local update: render saved EIS BDF rows in Nyquist, Bode, and Fig thumbnails alongside legacy imports.",
      "Keep original measurements unchanged and explain missing EIS plot values instead of drawing empty axes."
    ]
  },
  {
    "version": "0.1.77",
    "date": "2026-09-10",
    "changes": [
      "Replace the administrator raw-row table with a readable card for each Dataset.",
      "Show owner, date, row and column counts, source size, and local-backup state without exposing storage paths.",
      "Download immutable source files through the existing second administrator check from local or private B2 storage."
    ]
  },
  {
    "version": "0.1.76",
    "date": "2026-09-10",
    "changes": [
      "Repair visible Korean status and pagination text, and keep search actions inside each result card.",
      "Compare unopened saved CYC Figs through a small authorized cycle-capacity projection instead of full trace transfer.",
      "Show exact stored point counts on compact cards and complete five fresh-browser button-audit passes.",
      "Document the Neon metadata, private B2 artifact, and verified Windows archive boundaries clearly."
    ]
  },
  {
    "version": "0.1.75",
    "date": "2026-09-09",
    "changes": [
      "Confirm Backblaze B2 as the private artifact store while Neon keeps accounts and metadata.",
      "Reject unofficial or region-mismatched B2 endpoints before upload, read, signed-download, or delete operations.",
      "Expose the active storage provider in health diagnostics and B2-specific administrator guidance."
    ]
  },
  {
    "version": "0.1.74",
    "date": "2026-08-26",
    "changes": [
      "Keep production account and Dataset/Fig metadata in PostgreSQL while storing full normalized rows in private object storage.",
      "Back up raw artifacts to a Windows archive with exact size and SHA-256 verification before cloud cleanup is considered.",
      "Remove the public administrator account identifier from the login screen."
    ]
  },
  {
    "version": "0.1.73",
    "date": "2026-08-20",
    "changes": [
      "Repair the Search scope and saved-date labels so they display readable Korean.",
      "Verify saved Figs are separated by experiment dates embedded in source filenames."
    ]
  },
  {
    "version": "0.1.72",
    "date": "2026-08-20",
    "changes": [
      "Prefer experiment dates embedded in source filenames when grouping saved Figs.",
      "Keep the date shown on each Fig card aligned with its date group."
    ]
  },
  {
    "version": "0.1.71",
    "date": "2026-08-18",
    "changes": [
      "Infer missing C-rates from explicit 1C current or electrode metadata.",
      "Show inferred C-rate segments and their calculation basis during upload review."
    ]
  },
  {
    "version": "0.1.70",
    "date": "2026-08-18",
    "changes": [
      "Add a dedicated saved-files column to administrator member management.",
      "Open the protected raw-data archive filtered to the selected member.",
      "Separate saved-file access from account management actions."
    ]
  },
  {
    "version": "0.1.69",
    "date": "2026-08-12",
    "changes": [
      "Group saved Figs by date with the newest date expanded first.",
      "Separate CYC, EIS, CV, and other Figs inside each date group.",
      "Preserve existing open, compare, and delete actions in the grouped gallery."
    ]
  },
  {
    "version": "0.1.68",
    "date": "2026-08-12",
    "changes": [
      "Add editable X/Y minimum and maximum ranges to the Fig editor.",
      "Save axis ranges independently for CYC performance, voltage/current, dQ/dV, EIS Nyquist, and CV figures.",
      "Restore any selected graph to its automatic axis range with one click."
    ]
  },
  {
    "version": "0.1.67",
    "date": "2026-08-11",
    "changes": [
      "Mark the actual highest-frequency Nyquist point as the EIS start point.",
      "Fit Nyquist axes closely to the measured impedance range with meaningful zero origins.",
      "Increase the Nyquist/Bode panel spacing so Bode labels are not clipped."
    ]
  },
  {
    "version": "0.1.65",
    "date": "2026-08-11",
    "changes": [
      "Add an upload-data action to every administrator member row.",
      "Open the administrator raw-data browser filtered to the selected account, with a one-click return to all-member data.",
      "Keep member datasets protected by the existing administrator-only second confirmation gate."
    ]
  },
  {
    "version": "0.1.64",
    "date": "2026-08-11",
    "changes": [
      "Accept meaningful interrupted low-capacity WRD traces when measured point count, capacity change, and voltage span provide enough evidence for a cycling curve.",
      "Reject scientifically unusable tiny WRD fragments without stopping the rest of a multi-file batch.",
      "Show per-file analysis, Dataset-save, and Fig-save progress and summarize successful and excluded files at the end of a batch."
    ]
  },
  {
    "version": "0.1.63",
    "date": "2026-08-05",
    "changes": [
      "Refine saved CYC Fig records so their retained raw rows can reopen as performance, voltage/current, or dQ/dV views without overwriting source data.",
      "Unify C-rate colors and clean legends, annotations, electrode summaries, and raw-data context across CYC Fig views.",
      "Refine the combined EIS Figure layout with a balanced Nyquist panel and a shared Bode frequency axis."
    ]
  },
  {
    "version": "0.1.62",
    "date": "2026-07-23",
    "changes": [
      "Recognize neutral WBCS WRD specific-capacity headers as discharge capacity and rebuild legacy rows whose empty capacity field previously hid valid saved CYC performance, voltage/current, and dQ/dV Figs."
    ]
  },
  {
    "version": "0.1.61",
    "date": "2026-07-23",
    "changes": [
      "Keep complete raw CYC traces in the Dataset while paging the editable table at 250 rows, so large files remain responsive without losing later cycles or dQ/dV source points."
    ]
  },
  {
    "version": "0.1.60",
    "date": "2026-07-23",
    "changes": [
      "Keep complete WBCS WRD point traces instead of retaining only the first 5,000 rows, so every stored cycle remains available for CYC and dQ/dV analysis.",
      "Automatically rebuild legacy WRD datasets saved at the former 5,000-row cap from their immutable raw artifact, and preserve an explicitly selected CYC Fig type during inspection refresh."
    ]
  },
  {
    "version": "0.1.59",
    "date": "2026-07-23",
    "changes": [
      "Normalize raw CYC rows when saved datasets reopen, so valid voltage-capacity traces render as performance, voltage/current, and dQ/dV Figs instead of blank charts.",
      "Explain whether dQ/dV is unavailable because source voltage-capacity points are missing, too few distinct points exist within a cycle, or no valid derivative segment remains."
    ]
  },
  {
    "version": "0.1.58",
    "date": "2026-07-23",
    "changes": [
      "Make normal CYC Fig output single-panel only. Capacity performance, voltage/current behavior, and dQ/dV remain separate Fig choices; legacy combined records open as the performance Fig."
    ]
  },
  {
    "version": "0.1.57",
    "date": "2026-07-23",
    "changes": [
      "Preserve point-level WBCS WRD voltage-capacity traces, refresh older saved WRD datasets from their raw artifacts, and use those traces for valid dQ/dV analysis."
    ]
  },
  {
    "version": "0.1.56",
    "date": "2026-07-23",
    "changes": [
      "Prevent dQ/dV from differentiating cycle-summary rows in both the Fig workflow and Analysis Lab. Only a real within-cycle voltage-capacity trace can create a dQ/dV result."
    ]
  },
  {
    "version": "0.1.55",
    "date": "2026-07-22",
    "changes": [
      "Add a CYC dQ/dV Fig that uses only raw within-cycle voltage-capacity traces, and keep summary-only CYC tables from being shown as invented electrochemical curves."
    ]
  },
  {
    "version": "0.1.54",
    "date": "2026-07-22",
    "changes": [
      "Prevent hosted sign-up from using an ephemeral SQLite account store, verify registration through a fresh database connection, and show the server's specific sign-up error."
    ]
  },
  {
    "version": "0.1.53",
    "date": "2026-07-22",
    "changes": [
      "Allow a second local portal instance to use an explicit port and port-specific logs, so it can be verified without stopping an already running portal."
    ]
  },
  {
    "version": "0.1.52",
    "date": "2026-07-22",
    "changes": [
      "Administrators can issue a replacement temporary password from the member directory. Existing passwords remain hashed and are never displayed or returned."
    ]
  },
  {
    "version": "0.1.51",
    "date": "2026-07-22",
    "changes": [
      "SDE EIS datasets saved by an older parser version are automatically rebuilt from their preserved raw artifact, preventing frequency values from being reused as the Nyquist real-impedance axis."
    ]
  },
  {
    "version": "0.1.50",
    "date": "2026-07-22",
    "changes": [
      "The Organization workspace now renders a role-linked organization chart from the selected organization's actual owner, admin, researcher, and viewer memberships."
    ]
  },
  {
    "version": "0.1.49",
    "date": "2026-07-22",
    "changes": [
      "Administrators can review registered account IDs, display names, signup dates, organization memberships, and roles from the dedicated member-management screen."
    ]
  },
  {
    "version": "0.1.48",
    "date": "2026-07-22",
    "changes": [
      "CYC comparison Figs can now be exported as a one-slide PowerPoint file while preserving the current chart, legend, and selected series colors."
    ]
  },
  {
    "version": "0.1.47",
    "date": "2026-07-22",
    "changes": [
      "CYC performance Fig now supports an aligned grid toggle, point-connection toggle, and adjustable marker size while preserving gaps between missing cycles."
    ]
  },
  {
    "version": "0.1.46",
    "date": "2026-07-22",
    "changes": [
      "Add a project-local launcher that safely starts or reuses Battery Data Portal v2 on localhost port 4174."
    ]
  },
  {
    "version": "0.1.45",
    "date": "2026-07-21",
    "changes": [
      "Saved Fig colors now apply to EIS Nyquist and Bode traces as well as CYC and CV traces."
    ]
  },
  {
    "version": "0.1.44",
    "date": "2026-07-21",
    "changes": [
      "Fig cards and saved records now use the linked Dataset type and actual source filename, preventing EIS data from being presented as CYC."
    ]
  },
  {
    "version": "0.1.43",
    "date": "2026-07-21",
    "changes": [
      "Repairs legacy SDE datasets where Z' was incorrectly stored as frequency by reparsing the preserved raw artifact; reimports refresh that stale result instead of reusing it."
    ]
  },
  {
    "version": "0.1.42",
    "date": "2026-07-21",
    "changes": [
      "EIS Nyquist Fig now connects measured points in frequency order, keeps equal real/imaginary axis scale, and renders separate Nyquist, Bode, and combined layouts."
    ]
  },
  {
    "version": "0.1.41",
    "date": "2026-07-21",
    "changes": [
      "Repaired visible Korean text in hierarchy, upload, dataset, and Fig workflow messages; frontend source now uses safe Unicode escapes."
    ]
  },
  {
    "version": "0.1.40",
    "date": "2026-07-21",
    "changes": [
      "Render service stays online for health diagnostics when durable storage is not configured; Dataset writes fail safely."
    ]
  },
  {
    "version": "0.1.39",
    "date": "2026-07-21",
    "changes": [
      "Storage diagnostics identify missing environment-variable names without exposing values."
    ]
  },
  {
    "version": "0.1.38",
    "date": "2026-07-21",
    "changes": [
      "Saved Fig comparison labels and duplicate raw-source upload reuse were restored."
    ]
  },
  {
    "version": "0.1.37",
    "date": "2026-07-20",
    "changes": [
      "\ud30c\uc77c \uc5c5\ub85c\ub4dc \uc548\ub0b4, \uc624\ub958 \uba54\uc2dc\uc9c0, Fig \uc120\ud0dd \ubb38\uad6c\ub97c \uc815\ub9ac\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.36",
    "date": "2026-07-20",
    "changes": [
      "Filename C-rate parsing ignores leading cell/sample numbers before fractional C-rate labels."
    ]
  },
  {
    "version": "0.1.35",
    "date": "2026-07-20",
    "changes": [
      "\uc800\uc7a5\ub41c Fig \uce74\ub4dc, Fig \uc885\ub958, \uad00\ub9ac\uc790 \ud45c\uc2dc \ubb38\uad6c\ub97c \ubcf5\uad6c\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.34",
    "date": "2026-07-20",
    "changes": [
      "Fig workspace and editable table empty-state guidance were clarified."
    ]
  },
  {
    "version": "0.1.33",
    "date": "2026-07-20",
    "changes": [
      "ZIVE SmartManager SDE files are supported through the EIS binary parser."
    ]
  },
  {
    "version": "0.1.32",
    "date": "2026-07-20",
    "changes": [
      "\ub2e4\uc911 \ud30c\uc77c \uc791\uc5c5\uc5d0 \uc120\ud0dd\ub41c Cell \uc815\ubcf4\ub97c \uc801\uc6a9\ud558\ub3c4\ub85d \uc218\uc815\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.31",
    "date": "2026-07-20",
    "changes": [
      "\ub2e4\uc911 \ud30c\uc77c \uc791\uc5c5 \ud6c4 \ud30c\uc77c \uc120\ud0dd\uae30\ub97c \ucd08\uae30\ud654\ud558\ub3c4\ub85d \uc218\uc815\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.30",
    "date": "2026-07-20",
    "changes": [
      "Long artifact paths are compacted and C-rate axis guides are kept readable."
    ]
  },
  {
    "version": "0.1.29",
    "date": "2026-07-20",
    "changes": [
      "\uc5ec\ub7ec \ud30c\uc77c\uc744 \uc120\ud0dd\ud558\uba74 \uc21c\ucc28 \ubd84\uc11d\uacfc Fig \uc0dd\uc131\uc744 \uc9c4\ud589\ud569\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.28",
    "date": "2026-07-20",
    "changes": [
      "\ub370\uc2a4\ud06c\ud1b1 \uc0ac\uc774\ub4dc\ubc14 \ub108\ube44\ub97c \ub298\ub824 \uc120\ud0dd \ud30c\uc77c \uc815\ubcf4\uac00 \uc798\ub9ac\uc9c0 \uc54a\uac8c \ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.27",
    "date": "2026-07-20",
    "changes": [
      "\uae34 \ud30c\uc77c\uba85\uc73c\ub85c \uc778\ud55c Windows \uc800\uc7a5 \uacbd\ub85c \uc624\ub958\ub97c \ubcf4\uc644\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.26",
    "date": "2026-07-20",
    "changes": [
      "\uba54\ub274 \ubc84\ud2bc \ub77c\ubca8\uacfc \uc7ac\uc2dc\ub3c4 \uc800\uc7a5 \ub3d9\uc791\uc744 \uac1c\uc120\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.25",
    "date": "2026-07-16",
    "changes": [
      "SQLite WAL mode and a write timeout reduce transient Dataset-save failures."
    ]
  },
  {
    "version": "0.1.24",
    "date": "2026-07-16",
    "changes": [
      "CYC summary data now shows voltage and current trends by cycle."
    ]
  },
  {
    "version": "0.1.23",
    "date": "2026-07-16",
    "changes": [
      "CYC performance, voltage/current, and combined Fig kinds were separated."
    ]
  },
  {
    "version": "0.1.22",
    "date": "2026-07-16",
    "changes": [
      "\ub9cc\ub8cc\ub41c \ub85c\uadf8\uc778 \ud1a0\ud070\uc744 \uc548\uc804\ud558\uac8c \ucd08\uae30\ud654\ud558\ub3c4\ub85d \uc218\uc815\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.21",
    "date": "2026-07-16",
    "changes": [
      "\ub2e4\uc911 \ud30c\uc77c Dataset \ubc0f Fig \uc791\uc5c5\uc744 \ucd94\uac00\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.20",
    "date": "2026-07-16",
    "changes": [
      "\uba85\uc2dc\uc801 C-rate \uceec\ub7fc\uc744 Fig \uad6c\uac04 \uad6c\ubd84\uc5d0 \uc6b0\uc120 \uc0ac\uc6a9\ud569\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.19",
    "date": "2026-07-16",
    "changes": [
      "\ud3ec\ud0c8 \uc804\uccb4 \uc6a9\uc5b4\ub97c Fig\ub85c \ud1b5\uc77c\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.18",
    "date": "2026-07-16",
    "changes": [
      "WBCS WRD parsing and C-rate guide rendering were improved."
    ]
  },
  {
    "version": "0.1.17",
    "date": "2026-07-16",
    "changes": [
      "\ud30c\uc77c \uc885\ub958 \uc790\ub3d9 \ud310\ubcc4\uc640 \uc9c1\uc811 \uc120\ud0dd \ubaa8\ub4dc\ub97c \uad6c\ubd84\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.16",
    "date": "2026-07-16",
    "changes": [
      "Analysis Lab navigation was hidden while its stored analysis history remains intact."
    ]
  },
  {
    "version": "0.1.15",
    "date": "2026-07-15",
    "changes": [
      "\ub85c\uadf8\uc778 \uc785\ub825\ucc3d\uc5d0\uc11c Enter\ub85c \uc81c\ucd9c\ud560 \uc218 \uc788\uac8c \ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.14",
    "date": "2026-07-15",
    "changes": [
      "The default upload limit was raised to support larger WBCS CYC WRD files."
    ]
  },
  {
    "version": "0.1.13",
    "date": "2026-07-15",
    "changes": [
      "\uad00\ub9ac\uc790 \ud654\uba74\uacfc README\uc5d0 \ubc84\uc804 \uc774\ub825\uc744 \ucd94\uac00\ud588\uc2b5\ub2c8\ub2e4."
    ]
  },
  {
    "version": "0.1.12",
    "date": "2026-07-15",
    "changes": [
      "AI Summary was removed from the normal portal UI."
    ]
  },
  {
    "version": "0.1.11",
    "date": "2026-07-15",
    "changes": [
      "CYC capacity metrics and Dataset deletion cleanup were strengthened."
    ]
  },
  {
    "version": "0.1.10",
    "date": "2026-07-15",
    "changes": [
      "Authentication, CORS, upload limits, and artifact cleanup were hardened."
    ]
  },
  {
    "version": "0.1.9",
    "date": "2026-07-15",
    "changes": [
      "\ubc84\uc804 \uad00\ub9ac\uc640 \ud504\ub85c\uc81d\ud2b8 \uc778\uc218\uc778\uacc4 \uaddc\uce59\uc744 \ucd94\uac00\ud588\uc2b5\ub2c8\ub2e4."
    ]
  }
];

// ?\u044b\uae49 ?\uafa9\uaedc?\uba2f\uaf4c \u6028\ub4ed\uc440?\uc10e\ub497 ?\ubdbe\u3203 ?\uacf9\uae6d?\ub085\ub572??
// ?\uc495\ucfad\\u003f\\u003f\\u003f\u0080?\u03bb\ub9ba\\u003f\\u003f\\u003f\uacd7\uc520?\uacd5\ub497 datasets\\u003f\\u003f\\u003f\u317c\ubf31?\u317a\ud02c, ?\ubdbe\u3203 ?\uafaa\uaf63 \u5bc3\uaccc\ub0b5??filtered\\u003f\\u003f\\u003f\uacd5\uc908 ?\u3013\ub572??
// ?\ub300\uc803\u5bc3?\u907a\uafa8\u2501?\uc10e\u3203 \u5bc3\u0080??\u8b70\uaccc\uad54??\u8adb\ubdbd\ud4ed\\u003f\\u003f\\u003f\uba2e\ub0af ?\uacd7\uc520??\uf9cf\u2478\uc909\\u003f\\u003f\\u003f\u317c\ub586 \u907a\ub348\uc72d?\u317c? ?\ub506\ube18\\u003f\\u003f\\u003f\u2478\ub572??
const TABLE_PAGE_SIZE = 250;
const state = { datasets: [], filtered: [], selectedId: null, user: null, users: [], feedbacks: [], hierarchy: [], organizations: [], selectedOrganizationId: "", organizationMembers: [], cellWorkspace: null, cellWorkspaceRequestId: 0, analysis: null, batchFigureResults: [], batchInProgress: false, analysisRuns: [], selectedAnalysisRunId: null, pendingAnalysisName: "", selectedAnnotation: null, manualInfo: null, inspectToken: 0, annotations: {}, layoutEdits: {}, figureStyles: {}, activeFigureModule: "cyc", searchType: "all", compareIds: [], comparisonColors: {}, cycFigureViewKinds: {}, selectedProfileSeriesKey: "", selectedDqdvSeriesKey: "", tableSaveTimer: null, tableSelection: null, tableUndoStack: [], tablePage: 0, electrodeProfiles: [], selectedElectrodeProfileId: null, electrodeCalcSlots: [], datasetDetailRequests: new Map(), adminRawAccessToken: "", adminRawAccessExpiresAt: 0, adminRawDatasets: [], adminRawOwnerId: "", adminRawOwnerName: "", adminRawStorage: null };
state.comparisonSeriesByDatasetId = new Map();
state.comparisonSeriesRequests = new Map();
let lastElectrodeCalcAt = "";
let busyUnlockTimer = null;

// ?\uafa7\ub808 C-rate \u6028\uafa9\uad9b ?\u0080?\u03bc\ub0fc\\u003f\\u003f\\u003f\uacd7\uaf51 \u91c9\ub6ae\uc52a?\uacd7? localStorage\\u003f\\u003f\\u003f\u0080?\u03bd\ube40?\ub348\ub58e.
// ?\uc88f\uae6e??CYC\\u003f\\u003f\\u003f\uacf8\uc29c?\uc10e\u3203 \u6d39?\u6028\uafa9\uad9b\u5a9b\ubbea? CYC ?\uacd7\uc520?\uacd7\uc4fd cell.electrodeCalc\u6fe1??\u317c\ubf31\u5a9b\u0080 DB?\uba2e\ub8c4 ?\u2463\ud361 ?\u0080?\u03bb\ub9d7?\ub348\ub58e.
const ELECTRODE_PROFILE_KEY = "batteryElectrodeRateProfiles";
const ELECTRODE_CALC_SLOT_KEY = "batteryElectrodeCalcSlotsV1";
const ELECTRODE_CALC_SLOT_COUNT = 8;
const ELECTRODE_INPUT_IDS = ["calcElectrodeType", "calcTotalMass", "calcCollectorMass", "calcTotalThickness", "calcCollectorThickness", "calcDiameter", "calcCapacity", "calcNcmRatio", "calcSuperRatio", "calcPtfeRatio"];
const ELECTRODE_SLOT_FIELDS = [
  {
    "id": "calcTotalMass",
    "label": "\uc804\uadf9 \uc804\uccb4 \ubb34\uac8c (g)",
    "step": "0.000001"
  },
  {
    "id": "calcTotalThickness",
    "label": "\uc804\uadf9 \uc804\uccb4 \ub450\uaed8 (mm)",
    "step": "0.001"
  },
  {
    "id": "calcCollectorMass",
    "label": "\uc9d1\uc804\uccb4 \ubb34\uac8c (g)",
    "step": "0.000001"
  },
  {
    "id": "calcCollectorThickness",
    "label": "\uc9d1\uc804\uccb4 \ub450\uaed8 (mm)",
    "step": "0.001"
  },
  {
    "id": "calcDiameter",
    "label": "\uc804\uadf9 \uc9c0\ub984 (mm)",
    "step": "0.1"
  },
  {
    "id": "calcCapacity",
    "label": "\uc774\ub860 \uc6a9\ub7c9 (mAh g-1)",
    "step": "1"
  },
  {
    "id": "calcNcmRatio",
    "label": "\ud65c\ubb3c\uc9c8 (%)",
    "step": "0.1"
  },
  {
    "id": "calcSuperRatio",
    "label": "\ub3c4\uc804\uc7ac (%)",
    "step": "0.1"
  },
  {
    "id": "calcPtfeRatio",
    "label": "\ubc14\uc778\ub354 (%)",
    "step": "0.1"
  }
];
const FILE_INSPECT_TIMEOUT_MS = 150000;
const BATCH_FIGURE_FILE_LIMIT = 10;
const BATCH_FIGURE_KIND_BY_TYPE = { cyc: "cycling-performance", cv: "cv-curve", eis: "eis-combined" };

const $ = (id) => document.getElementById(id);
const fmt = (n, d = 4) => Number.isFinite(n) ? Number(n).toPrecision(d) : "";
const on = (id, event, fn) => {
  const el = $(id);
  if (el) el.addEventListener(event, fn);
};
const todayLocal = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

function setStatus(text) {
  const node = $("saveStatus");
  if (node) node.textContent = cleanDisplayText(text, "\uc0c1\ud0dc \ud655\uc778");
}

function setBusy(on, message = "\ub370\uc774\ud130\ub97c \ucc98\ub9ac\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4.", timeoutMs = 45000) {
  const overlay = $("busyOverlay");
  if (!overlay) return;
  if (busyUnlockTimer) {
    clearTimeout(busyUnlockTimer);
    busyUnlockTimer = null;
  }
  $("busyMessage").textContent = message;
  overlay.classList.toggle("hidden", !on);
  if (on && timeoutMs > 0) {
    busyUnlockTimer = window.setTimeout(() => {
      overlay.classList.add("hidden");
      setStatus("\ubd84\uc11d \uc9c0\uc5f0");
      setAnalysisMessage(
        "\ud30c\uc77c \ubd84\uc11d \uc751\ub2f5\uc774 \uc624\ub798 \uac78\ub824 \ud654\uba74 \uc7a0\uae08\uc744 \uc790\ub3d9\uc73c\ub85c \ud480\uc5c8\uc2b5\ub2c8\ub2e4. \uc0c8\ub85c\uace0\uce68\ud558\uc9c0 \ub9d0\uace0, \ud30c\uc77c\uc744 \ub2e4\uc2dc \uc120\ud0dd\ud55c \ub4a4 '\ud30c\uc77c \ubd84\uc11d'\uc744 \ud55c \ubc88\ub9cc \ub20c\ub7ec\uc8fc\uc138\uc694.",
        "\ubd84\uc11d\uc774 \uc624\ub798 \uac78\ub9bd\ub2c8\ub2e4"
      );
    }, timeoutMs);
  }
}

function setAnalysisMessage(text, title = "\ud655\uc778 \ud544\uc694") {
  const panel = $("analysisPanel");
  if (!panel || !text) return;
  panel.classList.remove("hidden");
  $("createFigure")?.classList.add("hidden");
  const old = panel.querySelector(".analysisMessage");
  if (old) old.remove();
  const msg = document.createElement("div");
  msg.className = "analysisMessage";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const body = document.createElement("span");
  body.textContent = text;
  msg.append(heading, body);
  panel.prepend(msg);
}

function apiErrorMessage(body, fallback) {
  const message = String(body?.error || body?.detail || "").replace(/\s+/g, " ").trim();
  if (!message || message === "Internal Server Error" || message.startsWith("<")) return fallback;
  return message.slice(0, 260);
}

function authHeaders(extra = {}) {
  if (!state.user) return extra;
  if (state.user.token) return { ...extra, Authorization: `Bearer ${state.user.token}`, "X-User-Id": state.user.id };
  return { ...extra, "X-User-Id": state.user.id };
}

function setLoginError(text) {
  $("loginError").textContent = text || "";
}

function setLoginSuccess(text) {
  $("loginSuccess").textContent = text || "";
}

function applyUser(user) {
  clearAdminRawAccess();
  state.user = user;
  if (user) {
    localStorage.setItem("eisUser", JSON.stringify(user));
    $("loginScreen").classList.add("hidden");
    showHome();
    document.body.classList.toggle("isAdmin", user.role === "admin");
    $("userChip").textContent = `${user.name || user.id} (${user.role === "admin" ? "\uad00\ub9ac\uc790" : user.id})`;
    $("ownerPreview").value = `${user.name || user.id} / ${user.id}`;
    loadData().catch((err) => setStatus(err.message));
    loadHierarchy().catch((err) => setStatus(err.message));
    loadOrganizations().catch((err) => setStatus(err.message));
    if (user.role === "admin") {
      loadUsers().catch(() => {});
      loadFeedbacks().catch(() => {});
      ensureAdminRawDataNavigation();
    }
  } else {
    localStorage.removeItem("eisUser");
    $("loginScreen").classList.remove("hidden");
    if ($("moduleHome")) $("moduleHome").classList.add("hidden");
    $("dataWorkspace").classList.add("hidden");
    document.body.classList.remove("isAdmin");
    $("userChip").textContent = "Not signed in";
    $("ownerPreview").value = "";
    state.datasets = [];
    state.filtered = [];
    state.users = [];
    state.feedbacks = [];
    state.batchFigureResults = [];
    state.analysisRuns = [];
    state.selectedAnalysisRunId = null;
    state.hierarchy = [];
    state.organizations = [];
    state.selectedOrganizationId = "";
    state.organizationMembers = [];
    state.cellWorkspace = null;
    state.selectedId = null;
    renderSelect();
    renderCurrent();
    renderUsers();
    renderFeedbackAdmin();
    renderOrganizationView();
  }
}

function showHome() {
  if ($("moduleHome")) $("moduleHome").classList.remove("hidden");
  $("dataWorkspace").classList.add("hidden");
  setStatus("\uba54\ub274");
}

function showWorkspace() {
  if ($("moduleHome")) $("moduleHome").classList.add("hidden");
  $("dataWorkspace").classList.remove("hidden");
  setStatus("Data workspace");
}

// ?\uacf7\ub592 \uf9ce\ubdbe\ub3f1\\u003f\\u003f\\u003f?\ubfc9??"\u5bc3\u0080??, "?\uafa7\ub808 \u6028\uafa9\uad9b", "\u907a\uafa9\uaf4d" \u5a9b\uc208? \\u003f\\u003f\\u003f\ubdbe\u3203?\uc1f0\uc908 ?\ub300\ub8de\\u003f\\u003f\\u003f??\u044a\uc29c?\u2478\ub572??
// \u5a9b??\ubdbe\u3203\\u003f\\u003f\\u003f\\u003f\\u003f\\u003f?\uafa9\uc282\\u003f\\u003f\\u003f\ub6ae\ub711\uf9cd\uacf7\ub8c4 ?\u0448\ub9b0\\u003f\\u003f\\u003f?\u8e30\ub349\ubfc9 ?\u317d\ubefe?\u2478\ub572??
function openWorkspaceView(viewName) {
  if ($("moduleHome")) $("moduleHome").classList.add("hidden");
  $("dataWorkspace").classList.remove("hidden");
  if (viewName === "search") {
    setSearchType(state.searchType || "all");
  }
  activateView(viewName);
  if (viewName === "search") renderSearchResults();
  if (viewName === "electrodeCalc") renderElectrodeCalc();
  if (viewName === "analysisLab") {
    renderAnalysisLab();
    loadAnalysisRuns().catch((err) => setStatus(err.message));
  }
  if (viewName === "organization") {
    renderOrganizationView();
    loadOrganizations().catch((err) => setStatus(err.message));
  }
  if (viewName === "feedbackAdmin") loadFeedbacks().catch((err) => setStatus(err.message));
  if (viewName === "releaseHistory") renderReleaseHistory();
  if (viewName === "users") loadUsers().catch((err) => setStatus(err.message));
  if (viewName === "adminRawData") renderAdminRawData();
  renderSelect();
  renderSavedList();
  renderCurrent();
  const label = { search: "\uac80\uc0c9", savedFigures: "Fig \ubaa8\uc74c", electrodeCalc: "\uc804\uadf9 \uacc4\uc0b0", analysisLab: "Analysis Lab", feedbackAdmin: "\uc758\uacac\ud568", releaseHistory: "\ubc84\uc804 \uc774\ub825", users: "\uc0ac\uc6a9\uc790 \uad00\ub9ac", adminRawData: "\ub85c\uc6b0 \ub370\uc774\ud130 \uc5f4\ub78c", figure: "Fig" }[viewName] || "\uc791\uc5c5 \ud654\uba74";
  setStatus(label);
  if (viewName === "electrodeCalc") setElectrodeCalcMode("calc");
}

// ?\uacf7\ub592 ?\uc495\u223c?\u317c\uc2ab \uf9ce\ubdbe\ub3f1??\u6028\ub4ef\ub13b ?\uc1f1\uc2a6?\uacd7\uc5ef?\ub348\ub58e.
// \u8e30\uafaa\ub4c9??data-view, data-module \u5a9b\uc208? ?\ub77f\uaf66\\u003f\\u003f\\u003f\u044a\ube18?\uba2e\u3203 \\u003f\\u003f\\u003f\u2465\ub2d4\u5a9b\u0080 ?\ub6ae\ucb6a?\u0080 ?\ubdbe\u3203?\uc1f0\uc908 \u8e42\ub300\uae44?\ub348\ub58e.
function navigateMenuTarget(target) {
  const module = target?.dataset?.module;
  const view = target?.dataset?.view;
  const focusSection = target?.dataset?.focusSection;
  const electrodeMode = target?.dataset?.electrodeMode;
  const analysisName = target?.dataset?.analysisName;
  if (view === "search") return openSearchView(target.dataset.searchType || "all");
  if (module) return showModule(module);
  if (view) {
    if (view === "analysisLab" && analysisName) state.pendingAnalysisName = analysisName;
    openWorkspaceView(view);
    if (view === "electrodeCalc") {
      setElectrodeCalcMode(electrodeMode || "calc");
    }
    if (focusSection) {
      window.setTimeout(() => {
        document.querySelector(`.${focusSection}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }
}

// ?\uafa7\ub808 \u6028\uafa9\uad9b ?\ubdbe\u3203?\u0080 \u6028\uafa9\uad9b ?\ub085\uc830 \uf9cf\u2464\ubc76?\u0080 ?\u0080?\u03bc\ub0fc \uf9cf\u2464\ubc76\u745c??\u2463\ud361 ?\uacf7\ub572??
// ?\u0080?\u03bc\ub0fc \uf9ce\ubdbe\ub3f1\u745c??\uafa8\u2164\uf9ce?profileMode\u745c?\u8033\uc496\uaf4c ?\u0080?\u03bc\ub0fc \u8adb\ubea4\ub4aa\u745c\\u003f\\u003f\\u003f?\uafa9\ubfc9 \u8e42\ub301\uc520\u5bc3??\u2478\ub572??
function setElectrodeCalcMode(mode = "calc") {
  const view = $("electrodeCalcView");
  if (!view) return;
  const storeMode = mode === "store";
  view.classList.toggle("profileMode", storeMode);
  renderElectrodeProfileStore();
  setStatus(storeMode ? "\uc804\uadf9 C-rate \uc800\uc7a5\uc18c" : "\uc804\uadf9 C-rate \uacc4\uc0b0");
}

function openSearchView(type = "all") {
  if ($("moduleHome")) $("moduleHome").classList.add("hidden");
  $("dataWorkspace").classList.remove("hidden");
  setSearchType(type);
  activateView("search");
  applyFilters();
  setStatus("\uac80\uc0c9 \ud398\uc774\uc9c0");
}

function showModule(module) {
  if (["figure", "cyc", "cv", "eis"].includes(module)) {
    state.activeFigureModule = module === "figure" ? "cyc" : module;
    $("moduleHome").classList.add("hidden");
    $("dataWorkspace").classList.remove("hidden");
    ensureSelectedForModule(state.activeFigureModule);
    activateView("figure", state.activeFigureModule);
    const label = { cyc: "CYC Fig", cv: "CV Fig", eis: "EIS Fig" }[state.activeFigureModule] || "Fig \ub9cc\ub4e4\uae30";
    const hint = {
      cyc: "CYC \ud30c\uc77c\uc744 \ub123\uc73c\uba74 \uc0ac\uc774\ud074, \ubc29\uc804\uc6a9\ub7c9, C-rate\ub97c \uc790\ub3d9 \ud310\ubcc4\ud569\ub2c8\ub2e4.",
      cv: "CV \ud30c\uc77c\uc744 \ub123\uc73c\uba74 \uc804\uc555-\uc804\ub958 \uace1\uc120\uacfc scan rate\ub97c \uc790\ub3d9 \ud310\ubcc4\ud569\ub2c8\ub2e4.",
      eis: "EIS \ud30c\uc77c\uc744 \ub123\uc73c\uba74 Nyquist/Bode Fig \ub370\uc774\ud130\ub97c \uc790\ub3d9 \ud310\ubcc4\ud569\ub2c8\ub2e4.",
    }[state.activeFigureModule];
        if ($("fileHint") && hint) $("fileHint").textContent = `${hint} CSV/XLSX/XLSB/WRD/SEO/SDE \uc9c0\uc6d0.`;
    renderSelect();
    renderSavedList();
    renderCurrent();
    setStatus(label);
    return;
  }
  if (module === "electrodeCalc") {
    $("moduleHome").classList.add("hidden");
    $("dataWorkspace").classList.remove("hidden");
    activateView("electrodeCalc");
    renderElectrodeCalc();
    setElectrodeCalcMode("calc");
    return;
  }
}

function ensureSelectedForModule(module) {
  if (!["cyc", "cv", "eis"].includes(module)) return;
  const current = state.datasets.find((x) => x.id === state.selectedId);
  if (current?.dataType === module) return;
  const next = state.filtered.find((x) => x.dataType === module) || state.datasets.find((x) => x.dataType === module);
  state.selectedId = next?.id || null;
}

async function login(ev) {
  ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  const fd = new FormData(ev.currentTarget);
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: fd.get("id"), password: fd.get("password") }),
  });
  const body = await res.json();
  if (!res.ok) return setLoginError(body.error || "\ub85c\uadf8\uc778 \uc2e4\ud328");
  ev.currentTarget.reset();
  applyUser(body.user);
}

async function register(ev) {
  ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  const fd = new FormData(ev.currentTarget);
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: fd.get("id"), name: fd.get("name"), password: fd.get("password") }),
  });
  const body = await res.json();
  if (!res.ok) return setLoginError(body.error || "\uc544\uc774\ub514 \uc0dd\uc131 \uc2e4\ud328");
  ev.currentTarget.reset();
  setLoginSuccess(`${body.user.id} \uc544\uc774\ub514\uac00 \uc0dd\uc131\ub418\uc5c8\uc2b5\ub2c8\ub2e4.`);
  applyUser(body.user);
  setStatus(`${body.user.id} \uc544\uc774\ub514\uac00 \uc0dd\uc131\ub418\uc5c8\uc2b5\ub2c8\ub2e4.`);
}

async function safeLogin(ev) {
  if (ev) ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  try {
    const form = $("loginForm");
    const fd = new FormData(form);
    if (!$("loginId").value || !$("loginPassword").value) {
      return setLoginError("\uc544\uc774\ub514\uc640 \ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud558\uc138\uc694.");
    }
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fd.get("id"), password: fd.get("password") }),
    });
    const body = await res.json();
    if (!res.ok) return setLoginError(body.detail || body.error || "\ub85c\uadf8\uc778 \uc2e4\ud328");
    form.reset();
    applyUser(body.user);
  } catch (error) {
    setLoginError(`\ub85c\uadf8\uc778 \ucc98\ub9ac \uc911 \uc624\ub958: ${error.message}`);
  }
}

async function safeRegister(ev) {
  if (ev) ev.preventDefault();
  setLoginError("");
  setLoginSuccess("");
  try {
    const form = $("registerForm");
    const fd = new FormData(form);
    if (!$("registerId").value || !$("registerPassword").value) {
      return setLoginError("\uc544\uc774\ub514\uc640 \ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud558\uc138\uc694.");
    }
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fd.get("id"), name: fd.get("name"), password: fd.get("password") }),
    });
    const body = await res.json();
    if (!res.ok) return setLoginError(body.detail || body.error || "\uc544\uc774\ub514 \uc0dd\uc131 \uc2e4\ud328");
    form.reset();
    setLoginSuccess(`${body.user.id} \uc544\uc774\ub514\uac00 \uc0dd\uc131\ub418\uc5c8\uc2b5\ub2c8\ub2e4.`);
    applyUser(body.user);
    setStatus(`${body.user.id} \uc544\uc774\ub514\uac00 \uc0dd\uc131\ub418\uc5c8\uc2b5\ub2c8\ub2e4.`);
  } catch (error) {
    setLoginError(`\uc544\uc774\ub514 \uc0dd\uc131 \uc911 \uc624\ub958: ${error.message}`);
  }
}

async function loadUsers() {
  if (!state.user || state.user.role !== "admin") return;
  const res = await fetch("/api/users", { headers: authHeaders() });
  if (!res.ok) return;
  state.users = await res.json();
  renderUsers();
}

function formatUserCreatedAt(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

function organizationRoleLabel(role) {
  return {
    owner: "\uc18c\uc720\uc790",
    admin: "\uc870\uc9c1 \uad00\ub9ac\uc790",
    researcher: "\uc5f0\uad6c\uc6d0",
    viewer: "\uc5f4\ub78c\uc790",
  }[role] || "\uba64\ubc84";
}

function renderUsers() {
  const body = $("usersTable");
  const summary = $("usersSummary");
  if (!body) return;
  if (!state.user || state.user.role !== "admin") {
    body.innerHTML = "";
    if (summary) summary.textContent = "";
    return;
  }
  const users = Array.isArray(state.users) ? state.users : [];
  const organizationMemberCount = users.filter((user) => Array.isArray(user.organizations) && user.organizations.length).length;
  if (summary) {
    summary.textContent = `${users.length}\uba85\uc758 \uac00\uc785 \ud68c\uc6d0 \uc911 ${organizationMemberCount}\uba85\uc774 \ud558\ub098 \uc774\uc0c1\uc758 \uc870\uc9c1\uc5d0 \uc18c\uc18d\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4.`;
  }
  body.innerHTML = users.map((user) => {
    const isSelf = user.id === state.user.id;
    const dataAction = `<button type="button" class="smallReset memberFileButton" data-view-user-data="${escapeAttr(user.id)}">\uc800\uc7a5 \ud30c\uc77c \ubcf4\uae30</button>`;
    const resetAction = `<button class="smallReset" data-reset-user="${escapeAttr(user.id)}">\uc784\uc2dc \ube44\ubc00\ubc88\ud638 \uc7ac\uc124\uc815</button>`;
    const manageAction = isSelf
      ? `${resetAction}<span class="mutedText">\ud604\uc7ac \uacc4\uc815</span>`
      : `${resetAction}<button class="smallDanger" data-delete-user="${escapeAttr(user.id)}">\ud0c8\ud1f4</button>`;
    const organizations = Array.isArray(user.organizations) ? user.organizations : [];
    const organizationText = organizations.length
      ? organizations.map((organization) => `${organization.name} (${organizationRoleLabel(organization.role)})`).join(", ")
      : "\uc18c\uc18d \uc870\uc9c1 \uc5c6\uc74c";
    return `<tr><td>${escapeXml(user.id)}</td><td>${escapeXml(user.name || "-")}</td><td>${escapeXml(formatUserCreatedAt(user.createdAt))}</td><td>${escapeXml(organizationText)}</td><td>${user.role === "admin" ? "\uad00\ub9ac\uc790" : "\uc77c\ubc18"}</td><td class="memberFileCell">${dataAction}</td><td><div class="memberManageActions">${manageAction}</div></td></tr>`;
  }).join("");
  for (const btn of body.querySelectorAll("[data-delete-user]")) {
    btn.addEventListener("click", () => deleteUser(btn.dataset.deleteUser));
  }
  for (const btn of body.querySelectorAll("[data-reset-user]")) {
    btn.addEventListener("click", () => resetUserPassword(btn.dataset.resetUser));
  }
  for (const btn of body.querySelectorAll("[data-view-user-data]")) {
    btn.addEventListener("click", () => openUserRawData(btn.dataset.viewUserData).catch((error) => setStatus(error.message)));
  }
}

async function openUserRawData(userId) {
  const selectedUser = state.users.find((item) => item.id === userId);
  state.adminRawOwnerId = userId;
  state.adminRawOwnerName = selectedUser?.name || userId;
  state.adminRawDatasets = [];
  state.adminRawStorage = null;
  openWorkspaceView("adminRawData");
  if (hasAdminRawAccess()) {
    await loadAdminRawDatasets();
  } else {
    renderAdminRawData();
    $("adminRawAccessPassword")?.focus();
  }
}

async function clearAdminRawOwnerFilter() {
  state.adminRawOwnerId = "";
  state.adminRawOwnerName = "";
  state.adminRawDatasets = [];
  state.adminRawStorage = null;
  if (hasAdminRawAccess()) await loadAdminRawDatasets();
  else renderAdminRawData();
}

function clearAdminRawAccess() {
  state.adminRawAccessToken = "";
  state.adminRawAccessExpiresAt = 0;
  state.adminRawDatasets = [];
  state.adminRawStorage = null;
}

function hasAdminRawAccess() {
  return Boolean(
    state.user?.role === "admin"
    && state.adminRawAccessToken
    && state.adminRawAccessExpiresAt > Date.now()
  );
}

function setAdminRawDataNotice(message = "", isError = false) {
  const notice = $("adminRawDataNotice");
  if (!notice) return;
  notice.textContent = message;
  notice.classList.toggle("error", Boolean(message && isError));
}

function ensureAdminRawDataNavigation() {
  const panel = document.querySelector(".menuGroup.adminOnly .menuPanel");
  if (!panel || panel.querySelector('[data-view="adminRawData"]')) return;
  const item = document.createElement("button");
  item.type = "button";
  item.className = "menuItem";
  item.dataset.view = "adminRawData";
  item.textContent = "\ub85c\uc6b0 \ub370\uc774\ud130 \uc5f4\ub78c";
  item.addEventListener("click", () => openWorkspaceView("adminRawData"));
  panel.append(item);
}

function adminRawHeaders(extra = {}) {
  return authHeaders(state.adminRawAccessToken ? { ...extra, "X-Admin-Raw-Access": state.adminRawAccessToken } : extra);
}

function adminRawErrorMessage(response, body, fallback) {
  if (response.status === 401) return "\ud655\uc778 \ube44\ubc00\ubc88\ud638\uac00 \ub9de\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.";
  if (response.status === 403) return "\uad00\ub9ac\uc790 \ud655\uc778 \uad8c\ud55c\uc774 \ub9cc\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \ud655\uc778\ud574 \uc8fc\uc138\uc694.";
  if (response.status === 503) return "\uad00\ub9ac\uc790 \ud655\uc778 \uc124\uc815\uc774 \uc644\ub8cc\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4.";
  return apiErrorMessage(body, fallback);
}

function formatAdminStorageBytes(value) {
  const bytes = Math.max(0, Number(value || 0));
  if (bytes >= 1024 ** 3) return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${Math.round(bytes)} B`;
}

async function requestAdminRawAccess(event) {
  event.preventDefault();
  const input = $("adminRawAccessPassword");
  const password = String(input?.value || "");
  if (!state.user || state.user.role !== "admin") {
    setAdminRawDataNotice("\uad00\ub9ac\uc790\ub9cc \uc5f4\ub78c\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.", true);
    return;
  }
  if (!password) {
    setAdminRawDataNotice("\ud655\uc778 \ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.", true);
    input?.focus();
    return;
  }
  setAdminRawDataNotice("\uad00\ub9ac\uc790 \ud655\uc778 \uc911\uc785\ub2c8\ub2e4.");
  try {
    const response = await fetch("/api/admin/raw-data/access", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ password }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.accessToken) {
      throw new Error(adminRawErrorMessage(response, body, "\uad00\ub9ac\uc790 \ud655\uc778\uc744 \uc644\ub8cc\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4."));
    }
    state.adminRawAccessToken = String(body.accessToken);
    state.adminRawAccessExpiresAt = Date.now() + Math.max(60, Number(body.expiresInSeconds || 600)) * 1000;
    if (input) input.value = "";
    await loadAdminRawDatasets();
    setAdminRawDataNotice("Dataset \ubaa9\ub85d \uc811\uadfc \uad8c\ud55c\uc774 \ud65c\uc131\ud654\ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
  } catch (error) {
    clearAdminRawAccess();
    renderAdminRawData();
    setAdminRawDataNotice(error.message || "\uad00\ub9ac\uc790 \ud655\uc778\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.", true);
  } finally {
    if (input) input.value = "";
  }
}

async function loadAdminRawDatasets() {
  if (!hasAdminRawAccess()) {
    renderAdminRawData();
    return;
  }
  const params = new URLSearchParams();
  if (state.adminRawOwnerId) params.set("owner_id", state.adminRawOwnerId);
  const query = params.toString();
  const response = await fetch(`/api/admin/raw-data/datasets${query ? `?${query}` : ""}`, { headers: adminRawHeaders() });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) clearAdminRawAccess();
    renderAdminRawData();
    throw new Error(adminRawErrorMessage(response, body, "\ub85c\uc6b0 \ub370\uc774\ud130 \ubaa9\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4."));
  }
  state.adminRawDatasets = Array.isArray(body.items) ? body.items : [];
  state.adminRawStorage = body.storage && typeof body.storage === "object" ? body.storage : null;
  renderAdminRawData();
}

async function downloadAdminRawDataset(datasetId, button) {
  const dataset = state.adminRawDatasets.find((item) => item.id === datasetId);
  if (!dataset || !dataset.hasRawDownload) return;
  const originalText = button?.textContent || "\uc6d0\ubcf8 \ub2e4\uc6b4\ub85c\ub4dc";
  if (button) {
    button.disabled = true;
    button.textContent = "\ub2e4\uc6b4\ub85c\ub4dc \uc911...";
  }
  try {
    const response = await fetch(`/api/admin/raw-data/datasets/${encodeURIComponent(datasetId)}/download`, {
      headers: adminRawHeaders(),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        clearAdminRawAccess();
        renderAdminRawData();
      }
      const fallback = "\uc6d0\ubcf8 \ud30c\uc77c\uc744 \ub2e4\uc6b4\ub85c\ub4dc\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.";
      const message = response.status === 401 || response.status === 403
        ? adminRawErrorMessage(response, body, fallback)
        : apiErrorMessage(body, fallback);
      throw new Error(message);
    }
    const blob = await response.blob();
    const sourceName = String(dataset.sourceName || "dataset-download").split(/[\\/]/).pop();
    const filename = sourceName.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_") || "dataset-download";
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    setAdminRawDataNotice(`${filename} \uc6d0\ubcf8 \ud30c\uc77c \ub2e4\uc6b4\ub85c\ub4dc\ub97c \uc2dc\uc791\ud588\uc2b5\ub2c8\ub2e4.`);
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

function adminRawBackupLabel(value) {
  if (value === "verified") return "\uac80\uc99d \uc644\ub8cc";
  if (value === "pending") return "\ub300\uae30 \uc911";
  return "\ubbf8\ub4f1\ub85d";
}

function adminRawDatasetCard(item) {
  const sourceName = item.sourceName || item.id || "Dataset";
  const owner = item.ownerName || item.ownerId || "-";
  const dataType = String(item.dataType || "data").toUpperCase();
  const createdAt = formatUserCreatedAt(item.createdAt);
  const rowCount = Math.max(0, Number(item.rowCount || 0)).toLocaleString("ko-KR");
  const columnCount = Math.max(0, Number(item.columnCount || 0)).toLocaleString("ko-KR");
  const downloadDisabled = item.hasRawDownload ? "" : " disabled";
  const downloadText = item.hasRawDownload ? "\uc6d0\ubcf8 \ub2e4\uc6b4\ub85c\ub4dc" : "\uc6d0\ubcf8 \ud30c\uc77c \uc5c6\uc74c";
  const facts = [
    ["\ub4f1\ub85d\uc790", owner],
    ["\ub4f1\ub85d\uc77c", createdAt],
    ["\ub370\uc774\ud130 \ud06c\uae30", `${rowCount} \ud589 \u00b7 ${columnCount} \uc5f4`],
    ["\uc6d0\ubcf8 \ud30c\uc77c", formatAdminStorageBytes(item.rawSizeBytes)],
    ["\ub85c\uceec \ubc31\uc5c5", adminRawBackupLabel(item.rawBackupState)],
  ];
  return `<article class="adminRawDatasetCard">
    <div class="adminRawDatasetCardHeader"><span class="adminRawDatasetType">${escapeXml(dataType)}</span><h4 title="${escapeAttr(sourceName)}">${escapeXml(sourceName)}</h4></div>
    <dl class="adminRawDatasetFacts">${facts.map(([label, value]) => `<div><dt>${escapeXml(label)}</dt><dd>${escapeXml(value)}</dd></div>`).join("")}</dl>
    <div class="adminRawDatasetActions"><button type="button" data-admin-raw-download="${escapeAttr(item.id)}"${downloadDisabled}>${downloadText}</button></div>
  </article>`;
}

function renderAdminRawData() {
  const accessPanel = $("adminRawAccessPanel");
  const browser = $("adminRawDataBrowser");
  const refresh = $("refreshAdminRawData");
  const ownerFilter = $("adminRawOwnerFilter");
  const ownerFilterText = $("adminRawOwnerFilterText");
  const storageStatus = $("adminRawStorageStatus");
  if (!accessPanel || !browser || !refresh) return;
  const isAdmin = state.user?.role === "admin";
  const active = isAdmin && hasAdminRawAccess();
  accessPanel.classList.toggle("hidden", active);
  browser.classList.toggle("hidden", !active);
  refresh.classList.toggle("hidden", !active);
  refresh.disabled = !active;
  if (ownerFilter) ownerFilter.classList.toggle("hidden", !state.adminRawOwnerId);
  if (ownerFilterText) {
    ownerFilterText.textContent = state.adminRawOwnerId
      ? `${state.adminRawOwnerName || state.adminRawOwnerId} (${state.adminRawOwnerId})`
      : "";
  }
  if (!isAdmin) {
    setAdminRawDataNotice("\uad00\ub9ac\uc790\ub9cc \uc774 \ud654\uba74\uc744 \uc5f4 \uc218 \uc788\uc2b5\ub2c8\ub2e4.", true);
    return;
  }
  if (!active) {
    setAdminRawDataNotice("\ub85c\uadf8\uc778 \ud6c4 \ubcc4\ub3c4\uc758 \uad00\ub9ac\uc790 \ud655\uc778\uc744 \uc644\ub8cc\ud558\uba74 Dataset \ubaa9\ub85d\uacfc \uc6d0\ubcf8 \ud30c\uc77c\uc744 \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.");
    return;
  }
  setAdminRawDataNotice("");
  if (storageStatus) {
    const storage = state.adminRawStorage;
    const pendingCount = Number(storage?.pending?.count || 0);
    const verifiedCount = Number(storage?.verified?.count || 0);
    const hardLimit = Number(storage?.hardLimitBytes || 0);
    const storageProviderLabel = storage?.provider === "b2" ? "B2" : "\uac1d\uccb4 \uc800\uc7a5\uc18c";
    storageStatus.textContent = storage
      ? `${storageProviderLabel} \uc6d0\ubcf8 ${formatAdminStorageBytes(storage.totalBytes)} / \uad00\ub9ac \uae30\uc900 ${formatAdminStorageBytes(hardLimit)} \u00b7 \ub85c\uceec \ubc31\uc5c5 \ub300\uae30 ${pendingCount}\uac74 \u00b7 \uac80\uc99d \uc644\ub8cc ${verifiedCount}\uac74`
      : "";
  }
  const datasets = Array.isArray(state.adminRawDatasets) ? state.adminRawDatasets : [];
  const list = $("adminRawDatasetList");
  const count = $("adminRawDatasetCount");
  if (count) count.textContent = `${datasets.length.toLocaleString("ko-KR")}\uac1c Dataset`;
  if (list) {
    list.innerHTML = datasets.length
      ? datasets.map(adminRawDatasetCard).join("")
      : `<div class="adminRawDatasetEmpty"><strong>\ud45c\uc2dc\ud560 Dataset\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</strong><span>\ud68c\uc6d0 \ud544\ud130\ub97c \ud574\uc81c\ud558\uac70\ub098 Dataset \ubaa9\ub85d\uc744 \uc0c8\ub85c\uace0\uce68\ud574 \ubcf4\uc138\uc694.</span></div>`;
  }
}

function nextBrowserPaint() {
  // Let the browser visibly remove a completed-analysis overlay before the
  // result panel builds its preview. The fallback also resolves in throttled
  // background tabs where requestAnimationFrame may be delayed indefinitely.
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(fallback);
      resolve();
    };
    const fallback = window.setTimeout(finish, 120);
    if (typeof window.requestAnimationFrame !== "function") {
      finish();
      return;
    }
    window.requestAnimationFrame(() => window.requestAnimationFrame(finish));
  });
}

function formatFeedbackTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

async function loadFeedbacks() {
  if (!state.user || state.user.role !== "admin") {
    state.feedbacks = [];
    renderFeedbackAdmin();
    return;
  }
  const res = await fetch("/api/feedback", { headers: authHeaders() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "\uc758\uacac \ubaa9\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  state.feedbacks = Array.isArray(body) ? body : [];
  renderFeedbackAdmin();
}

function renderFeedbackAdmin() {
  const summary = $("feedbackAdminSummary");
  const list = $("feedbackList");
  if (!summary || !list) return;
  if (!state.user || state.user.role !== "admin") {
    summary.innerHTML = "";
    list.innerHTML = `<p class="emptySaved">\uad00\ub9ac\uc790\ub9cc \uc758\uacac\ud568\uc744 \ubcfc \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p>`;
    return;
  }
  const feedbacks = state.feedbacks || [];
  const latest = feedbacks[0]?.createdAt ? formatFeedbackTime(feedbacks[0].createdAt) : "-";
  const withContact = feedbacks.filter((item) => item.email).length;
  summary.innerHTML = `
    <div><strong>${feedbacks.length}</strong><span>\uc804\uccb4 \uc758\uacac</span></div>
    <div><strong>${withContact}</strong><span>\uc5f0\ub77d\ucc98 \uc788\uc74c</span></div>
    <div><strong>${escapeXml(latest)}</strong><span>\ucd5c\uadfc \uc811\uc218</span></div>
  `;
  if (!feedbacks.length) {
    list.innerHTML = `<p class="emptySaved">\uc544\uc9c1 \uc811\uc218\ub41c \uc758\uacac\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</p>`;
    return;
  }
  list.innerHTML = feedbacks.map((item) => {
    const author = item.name || item.userName || item.userId || "\uc775\uba85";
    const contact = item.email || "\uc5f0\ub77d\ucc98 \uc5c6\uc74c";
    const page = item.page || "\ud398\uc774\uc9c0 \ubbf8\uc9c0\uc815";
    const user = item.userId ? `${item.userName || item.userId} / ${item.userId}` : "\ube44\ub85c\uadf8\uc778 \ub610\ub294 \uc0ac\uc6a9\uc790 \uc815\ubcf4 \uc5c6\uc74c";
    return `
      <article class="feedbackCard">
        <div class="feedbackCardTop">
          <div>
            <strong>${escapeXml(author)}</strong>
            <span>${escapeXml(formatFeedbackTime(item.createdAt))}</span>
          </div>
          <em>${escapeXml(item.status || "open")}</em>
        </div>
        <div class="feedbackMeta">
          <span>\uc5f0\ub77d\ucc98: ${escapeXml(contact)}</span>
          <span>\uad00\ub828 \ud398\uc774\uc9c0: ${escapeXml(page)}</span>
          <span>\uc791\uc131 \uacc4\uc815: ${escapeXml(user)}</span>
        </div>
        <p>${escapeXml(item.message || "")}</p>
      </article>`;
  }).join("");
}

function renderReleaseHistory() {
  const current = $("releaseCurrentVersion");
  const list = $("releaseHistoryList");
  if (!list) return;
  if (current) current.textContent = `\ud604\uc7ac \ubc84\uc804 v${PORTAL_VERSION}`;
  list.innerHTML = RELEASE_HISTORY.map((release) => `
    <article class="releaseHistoryCard">
      <div class="releaseHistoryCardHeader">
        <h3>v${escapeXml(release.version)}</h3>
        <time datetime="${escapeXml(release.date)}">${escapeXml(release.date)}</time>
      </div>
      <ul>${release.changes.map((change) => `<li>${escapeXml(change)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

async function deleteUser(id) {
  if (!confirm(`${id} \uc0ac\uc6a9\uc790\ub97c \ud0c8\ud1f4\uc2dc\ud0a4\uace0 \uc774 \uc0ac\uc6a9\uc790\uc758 \ub370\uc774\ud130\ub97c \uc0ad\uc81c\ud560\uae4c\uc694?`)) return;
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    setStatus(body.error || "\uc0ac\uc6a9\uc790 \uc0ad\uc81c \uc2e4\ud328");
    return;
  }
  setStatus(`${id} deleted`);
  await Promise.all([loadUsers(), loadData()]);
}

async function resetUserPassword(id) {
  const password = window.prompt(`${id} \uc0ac\uc6a9\uc790\uc5d0\uac8c \uc804\ub2ec\ud560 \uc0c8 \uc784\uc2dc \ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud558\uc138\uc694. (8~128\uc790)`);
  if (password === null) return;
  if (password.length < 8 || password.length > 128) {
    setStatus("\uc784\uc2dc \ube44\ubc00\ubc88\ud638\ub294 8~128\uc790\ub85c \uc785\ub825\ud574 \uc8fc\uc138\uc694.");
    return;
  }
  const confirmation = window.prompt("\uc784\uc2dc \ube44\ubc00\ubc88\ud638\ub97c \ud55c \ubc88 \ub354 \uc785\ub825\ud558\uc138\uc694.");
  if (confirmation === null) return;
  if (password !== confirmation) {
    setStatus("\uc784\uc2dc \ube44\ubc00\ubc88\ud638\uac00 \uc77c\uce58\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.");
    return;
  }
  const res = await fetch(`/api/users/${encodeURIComponent(id)}/password`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    setStatus(body.error || "\ube44\ubc00\ubc88\ud638 \uc7ac\uc124\uc815\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
    return;
  }
  setStatus(`${id} \uc0ac\uc6a9\uc790\uc758 \uc784\uc2dc \ube44\ubc00\ubc88\ud638\ub97c \uc7ac\uc124\uc815\ud588\uc2b5\ub2c8\ub2e4. \uc0c8 \ube44\ubc00\ubc88\ud638\ub97c \uc0ac\uc6a9\uc790\uc5d0\uac8c \uc548\uc804\ud558\uac8c \uc804\ub2ec\ud558\uc138\uc694.`);
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter((x) => x.trim());
  if (lines.length < 2) throw new Error("CSV\uc5d0 \ub370\uc774\ud130\uac00 \ubd80\uc871\ud569\ub2c8\ub2e4.");
  const headers = splitCsvLine(lines[0]).map((x) => x.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const find = (names) => headers.findIndex((h) => names.includes(h));
  const fi = find(["frequency", "freq", "f", "hz"]);
  const ri = find(["zreal", "real", "re", "zr", "zprime"]);
  const ii = find(["zimag", "imag", "im", "zi", "zdoubleprime"]);
  if (fi < 0 || ri < 0 || ii < 0) throw new Error("frequency, zreal, zimag \uceec\ub7fc\uc744 \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const frequency = Number(cols[fi]);
    const zreal = Number(cols[ri]);
    const zimag = Number(cols[ii]);
    const mag = Math.hypot(zreal, zimag);
    const phase = Math.atan2(zimag, zreal) * 180 / Math.PI;
    return { frequency, zreal, zimag, mag, phase };
  }).filter((r) => Number.isFinite(r.frequency) && Number.isFinite(r.zreal) && Number.isFinite(r.zimag));
}

function keyOf(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9\uac00-\ud7a3]/g, "");
}

function findColumn(columns, terms) {
  return columns.find((col) => terms.some((term) => keyOf(col).includes(term))) || null;
}

function hasAnyTerm(key, terms) {
  return terms.some((term) => key.includes(term));
}

function isDischargeColumn(key) {
  return hasAnyTerm(key, ["\ubc29\uc804", "discharge", "dchg", "dch"]);
}

function isChargeOnlyColumn(key) {
  return key.includes("\ucda9\uc804") || key.startsWith("charge") || key.startsWith("chg");
}

function isSpecificCapacityColumn(key) {
  return hasAnyTerm(key, ["specificcapacity", "\ube44\uc6a9\ub7c9", "mahg", "ahg"]);
}

function isCapacityColumn(key) {
  return hasAnyTerm(key, ["capacity", "cap", "\uc6a9\ub7c9", "mah", "ah"]);
}

function findBestCycColumn(columns, role) {
  const scored = columns.map((col) => {
    const key = keyOf(col);
    const discharge = isDischargeColumn(key);
    const chargeOnly = isChargeOnlyColumn(key);
    const specific = isSpecificCapacityColumn(key);
    const capacity = isCapacityColumn(key);
    let score = 0;

    // WBCS WRD exports use the neutral header "specific capacity (mAh g-1)"
    // for a discharge trace. Prefer an explicit discharge label, but accept the
    // neutral form when it is not marked as a charge-only column.
    if (role === "dischargeSpecific" && !chargeOnly && capacity && specific) score = discharge ? 120 : 110;
    if (role === "chargeSpecific" && chargeOnly && capacity && specific) score = 120;
    if (role === "dischargeCapacity" && discharge && capacity) score = specific ? 70 : 100;
    if (role === "chargeCapacity" && chargeOnly && capacity) score = specific ? 70 : 100;

    if (role.startsWith("discharge") && chargeOnly) score = 0;
    if (role.startsWith("charge") && discharge) score = 0;
    if (key.includes("\uc5d0\ub108\uc9c0") || key.includes("energy")) score -= 40;
    if (key.includes("final") || key.includes("\ucd5c\uc885") || key.includes("last")) score -= 40;

    return { col, score };
  }).filter((item) => item.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.col || null;
}

function findCycFallbackColumn(columns, role, terms) {
  const filteredColumns = columns.filter((col) => {
    const key = keyOf(col);
    if (role.startsWith("discharge")) return !isChargeOnlyColumn(key);
    if (role.startsWith("charge")) return !isDischargeColumn(key);
    return true;
  });
  return findColumn(filteredColumns, terms);
}

function numberValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// C-rate is often written as a number, "0.33 C", or a fraction such as "C/10".
// Convert those equivalent labels to one numeric value before plotting groups.
function parseCRateValue(value) {
  const direct = numberValue(value);
  if (Number.isFinite(direct) && direct > 0 && direct <= 20) return direct;
  const text = String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
  const fraction = text.match(/^c\/([0-9]+(?:\.[0-9]+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[1]);
    return Number.isFinite(denominator) && denominator > 0 ? 1 / denominator : null;
  }
  const decimal = text.match(/^(?:re)?([0-9]+(?:\.[0-9]+)?)c?$/);
  const rate = decimal ? Number(decimal[1]) : NaN;
  return Number.isFinite(rate) && rate > 0 && rate <= 20 ? rate : null;
}

// Prefer the parser's explicit direction. Current sign remains a fallback for
// older CSV/XLSX files that do not expose an instrument step direction.
function cycDirectionFromValue(value, current = NaN) {
  const text = String(value ?? "").trim().toLowerCase();
  if (text.includes("discharge") || text.includes("dchg") || text.includes("\ubc29\uc804")) return "discharge";
  if (text.includes("charge") || text.includes("chg") || text.includes("\ucda9\uc804")) return "charge";
  if (Number.isFinite(current) && current > 1e-9) return "charge";
  if (Number.isFinite(current) && current < -1e-9) return "discharge";
  return "trace";
}

function smartManagerEisColumns(columns, rows) {
  if (!columns.includes("8") || !columns.includes("11") || !columns.includes("12")) return null;
  const sample = rows.slice(0, 80);
  const matches = sample.filter((r) => {
    const frequency = numberValue(r["8"]);
    const zreal = numberValue(r["11"]);
    const zimag = numberValue(r["12"]);
    return Number.isFinite(frequency) && frequency > 0 && Number.isFinite(zreal) && Number.isFinite(zimag);
  }).length;
  return matches >= 10 ? { frequency: "8", zreal: "11", zimag: "12" } : null;
}

function canonicalRows(type, columns, rows) {
  if (type === "cyc") {
    // Artifact rows use BDF keys, while saved metadata may still list vendor
    // headers. Include actual keys; an empty optional specific-capacity
    // column must not hide a measured Ah discharge column.
    columns = [...new Set([...columns, ...rows.flatMap((row) => Object.keys(row))])]
      .filter((column) => rows.some((row) => Object.hasOwn(row, column)))
      .filter((column) => !isCapacityColumn(keyOf(column))
        || rows.some((row) => scaledCycValue(row, column) !== null));
  }
  const col = {
    frequency: findColumn(columns, ["frequency", "freq", "hz", "\uc8fc\ud30c\uc218"]),
    zreal: findColumn(columns, ["zreal", "real", "re", "zr", "zprime", "\uc2e4\uc218"]),
    zimag: findColumn(columns, ["zimag", "imag", "im", "zi", "zdoubleprime", "\ud5c8\uc218"]),
    cycle: findColumn(columns, ["cycle", "\uc0ac\uc774\ud074"]),
    cRate: findColumn(columns, ["crate", "cratec", "ratec", "c-rate", "c rate", "c\ub808\uc774\ud2b8"]),
    specificCapacity: findBestCycColumn(columns, "dischargeSpecific") || findCycFallbackColumn(columns, "dischargeSpecific", ["dischargecapacityahg", "specificcapacity", "mahg", "\ubc29\uc804\uc6a9\ub7c9ahg"]),
    chargeSpecificCapacity: findBestCycColumn(columns, "chargeSpecific") || findCycFallbackColumn(columns, "chargeSpecific", ["chargecapacityahg", "\ucda9\uc804\uc6a9\ub7c9ahg"]),
    capacity: findBestCycColumn(columns, "dischargeCapacity") || findCycFallbackColumn(columns, "dischargeCapacity", ["dischargecapacity", "dischargecap", "dchgcap", "dchcap", "\ubc29\uc804\uc6a9\ub7c9", "\ubc29\uc804"]),
    chargeCapacity: findBestCycColumn(columns, "chargeCapacity") || findCycFallbackColumn(columns, "chargeCapacity", ["chargecapacity", "chargecap", "chgcap", "\ucda9\uc804\uc6a9\ub7c9", "\ucda9\uc804"]),
    efficiency: findColumn(columns, ["coulombicefficiency", "coulombefficiency", "\ucfe8\ub86c\ud6a8\uc728", "\ud6a8\uc728", "efficiency", "coulomb", "ce"]),
    voltage: findColumn(columns, ["voltage", "potential", "\uc804\uc555"]),
    current: findColumn(columns, ["current", "\uc804\ub958"]),
    time: findColumn(columns, ["time", "\uc2dc\uac04"]),
    direction: findColumn(columns, ["direction", "step direction", "mode", "state"]),
  };
  if (type === "eis") {
    const smartCols = smartManagerEisColumns(columns, rows);
    if (smartCols) {
      col.frequency = smartCols.frequency;
      col.zreal = smartCols.zreal;
      col.zimag = smartCols.zimag;
    }
  }
  if (type === "eis") {
    return rows.map((r) => {
      const zreal = numberValue(r[col.zreal]);
      const zimag = numberValue(r[col.zimag]);
      const frequency = numberValue(r[col.frequency]);
      return { frequency, zreal, zimag, mag: Math.hypot(zreal || 0, zimag || 0), phase: Math.atan2(zimag || 0, zreal || 0) * 180 / Math.PI };
    }).filter((r) => Number.isFinite(r.frequency) && Number.isFinite(r.zreal) && Number.isFinite(r.zimag));
  }
  if (type === "cyc") {
    return rows.map((r, i) => {
      const dischargeCapacity = scaledCycValue(r, col.specificCapacity) ?? scaledCycValue(r, col.capacity);
      const chargeCapacity = scaledCycValue(r, col.chargeSpecificCapacity) ?? scaledCycValue(r, col.chargeCapacity);
      const dischargeUnit = cycCapacityUnitFromColumn(col.specificCapacity || col.capacity);
      const chargeUnit = cycCapacityUnitFromColumn(col.chargeSpecificCapacity || col.chargeCapacity);
      const current = numberValue(r[col.current]);
      return {
        index: i + 1,
        cycle: numberValue(r[col.cycle]) ?? i + 1,
        capacity: dischargeCapacity,
        chargeCapacity,
        capacityUnit: dischargeUnit,
        chargeCapacityUnit: chargeUnit,
        efficiency: numberValue(r[col.efficiency]),
        voltage: numberValue(r[col.voltage]),
        current,
        time: numberValue(r[col.time]),
        cRate: parseCRateValue(r[col.cRate]),
        direction: cycDirectionFromValue(r[col.direction], current),
      };
    }).filter((r) => [r.capacity, r.chargeCapacity, r.efficiency, r.voltage].some((v) => Number.isFinite(v)));
  }
  if (type === "cv") {
    return rows.map((r, i) => ({
      index: i + 1,
      voltage: numberValue(r[col.voltage]),
      current: numberValue(r[col.current]),
      cycle: numberValue(r[col.cycle]),
    })).filter((r) => Number.isFinite(r.voltage) && Number.isFinite(r.current));
  }
  return rows;
}

function inspectionCanonicalRows(type) {
  const analysis = state.analysis;
  if (!analysis || analysis.detection?.type !== type) return [];
  const cache = analysis._inspectionCanonicalRows || (analysis._inspectionCanonicalRows = {});
  if (!Array.isArray(cache[type])) {
    cache[type] = canonicalRows(type, analysis.columns || [], analysis.rows || []);
  }
  return cache[type];
}

function scaleCycCapacity(value, columnName = "") {
  if (!Number.isFinite(value)) return value;
  const key = keyOf(columnName);
  if (key.includes("ahg") && !key.includes("mahg")) return value * 1000;
  return value;
}

function cycCapacityUnitFromColumn(columnName = "") {
  const key = keyOf(columnName);
  if (!key) return "reported unit";
  if (key.includes("mahg") || key.includes("specificcapacity") || (key.includes("ahg") && !key.includes("mah"))) return "mAh g-1";
  if (key.includes("mah")) return "mAh";
  if (key.includes("ah")) return "Ah";
  return "reported unit";
}

function cycCapacityUnit(rows) {
  return (rows || [])
    .map((row) => String(row?.capacityUnit || "").trim())
    .find((unit) => unit && unit !== "reported unit") || "reported unit";
}

function cycCapacityAxisLabel(rows) {
  const unit = cycCapacityUnit(rows);
  if (unit === "mAh g-1") return "Specific capacity (mAh g-1)";
  return unit === "reported unit" ? "Discharge capacity (reported unit)" : `Discharge capacity (${unit})`;
}

function dqdvAxisLabel(unit) {
  return unit && unit !== "reported unit" ? `dQ/dV (${unit} / V)` : "dQ/dV (reported capacity / V)";
}

function scaledCycValue(row, columnName) {
  if (!columnName) return null;
  const raw = row[columnName];
  if (raw == null || typeof raw === "boolean" || (typeof raw === "string" && !raw.trim())) return null;
  const value = numberValue(row[columnName]);
  return Number.isFinite(value) ? scaleCycCapacity(value, columnName) : null;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = FILE_INSPECT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let body = {};
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (_) {
        body = { error: text };
      }
    }
    return { res, body };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("\ud30c\uc77c \ubd84\uc11d \uc2dc\uac04\uc774 \ub108\ubb34 \uae38\uc5b4 \uc911\ub2e8\ub418\uc5c8\uc2b5\ub2c8\ub2e4. XLS \ud30c\uc77c\uc740 Excel\uc5d0\uc11c XLSX\ub85c \ub2e4\uc2dc \uc800\uc7a5\ud55c \ud6c4 \uc7ac\uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function inspectFileUpload(file) {
  try {
    return await fetchJsonWithTimeout("/api/inspect-upload", {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/octet-stream",
        "X-Filename": encodeURIComponent(file.name),
      }),
      body: file,
    });
  } catch (error) {
    if (error instanceof TypeError) throw new Error(uploadFailureMessage());
    throw error;
  }
}

function uploadFailureMessage() {
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  const hint = local && window.location.port !== "4174"
    ? " \ub85c\uceec \ud3ec\ud0c8 http://localhost:4174/\uc5d0\uc11c \ud30c\uc77c\uc744 \ub2e4\uc2dc \uc120\ud0dd\ud574 \uc8fc\uc138\uc694."
    : " \uc11c\ubc84 \uc2e4\ud589 \uc0c1\ud0dc\uc640 \ub124\ud2b8\uc6cc\ud06c \uc5f0\uacb0\uc744 \ud655\uc778\ud55c \ub4a4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.";
  return "\uc11c\ubc84 \uc5f0\uacb0\uc774 \ub04a\uaca8 \ud30c\uc77c \ubd84\uc11d \uacb0\uacfc\ub97c \ubc1b\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4. \uc790\ub3d9\uc73c\ub85c \uc7ac\uc804\uc1a1\ud558\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4." + hint;
}

function selectedUploadFiles() {
  return Array.from($("smartFile")?.files || []);
}

// Browser file inputs do not fire a new change event when the same file list
// stays selected. Clear only the picker after a batch has finished so the user
// can immediately select another batch while keeping the result summary shown.
function clearUploadSelectionAfterProcessing() {
  const input = $("smartFile");
  if (input) {
    input.value = "";
    input.disabled = false;
  }
  updateSelectedFileName();
  updateBatchFigureControl();
}

function baseNameWithoutExtension(filename) {
  return String(filename || "").replace(/\.[^.]+$/, "").trim() || "batch-file";
}

async function saveDatasetFromInspection(analysis, dataType, cell, figureKind) {
  const rows = canonicalRows(dataType, analysis.columns, analysis.rows);
  if (!rows.length) {
    throw new Error("\uc774 \ud30c\uc77c\uc5d0\uc11c Fig\uc5d0 \uc0ac\uc6a9\ud560 \uc22b\uc790 \ub370\uc774\ud130\ub97c \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  }
  const { res, body: saved } = await fetchJsonWithTimeout("/api/datasets", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      cell,
      rows,
      columns: analysis.columns,
      sourceName: analysis.filename,
      dataType,
      figureKind,
      uploadId: analysis.uploadId || "",
      canonicalRows: Array.isArray(analysis.canonicalRows) ? analysis.canonicalRows : [],
      columnMapping: analysis.columnMapping || {},
      quality: analysis.quality || {},
      parser: analysis.parser || {},
      ...hierarchySelectionPayload(),
    }),
  });
  if (!res.ok) {
    throw new Error(apiErrorMessage(saved, "Dataset \uc800\uc7a5 \uc911 \uc11c\ubc84 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \ud398\uc774\uc9c0\ub97c \uc0c8\ub85c\uace0\uce68\ud55c \ub4a4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694."));
  }
  return saved;
}

async function saveFigureRecord(dataset) {
  const res = await fetch("/api/figures", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      datasetId: dataset.id,
      name: `${sampleLabel(dataset)} Fig`,
      figureKind: dataset.figureKind,
      edits: dataset.figureEdits || {},
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(apiErrorMessage(body, "Fig \uae30\ub85d\uc744 \uc800\uc7a5\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4."));
  }
  return body;
}

function renderBatchFigureResults() {
  const panel = $("batchFigureResults");
  if (!panel) return;
  const results = state.batchFigureResults || [];
  if (!results.length) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }
  const completed = results.filter((item) => item.ok).length;
  panel.classList.remove("hidden");
  panel.innerHTML = `
    <strong>\uc5ec\ub7ec \ud30c\uc77c Fig \uc0dd\uc131 \uacb0\uacfc: ${completed}/${results.length}\uac1c \uc644\ub8cc</strong>
    <p>\ud30c\uc77c\uc740 \uc21c\uc11c\ub300\ub85c \ucc98\ub9ac\ub429\ub2c8\ub2e4. \uc77c\ubd80 \ud30c\uc77c\uc774 \uc2e4\ud328\ud574\ub3c4 \ub098\uba38\uc9c0 \ud30c\uc77c\uc740 \uacc4\uc18d \ubd84\uc11d\ud569\ub2c8\ub2e4.</p>
    <ul>
      ${results.map((item) => `
        <li class="batchFigureResult ${item.ok ? "isOk" : "hasError"}">
          <div>
            <strong>${escapeXml(item.fileName)}</strong>
            <span>${item.ok ? `${String(item.dataType || "").toUpperCase()} Dataset \ubc0f Fig \uc800\uc7a5 \uc644\ub8cc${item.note ? ` \u00b7 ${escapeXml(item.note)}` : ""}` : escapeXml(item.message || "\ucc98\ub9ac\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.")}</span>
            ${item.note ? `<span>${escapeXml(item.note)}</span>` : ""}
          </div>
          ${item.ok ? `<button type="button" class="smallAction" data-open-batch-figure="${escapeAttr(item.datasetId)}">Fig \uc5f4\uae30</button>` : ""}
        </li>
      `).join("")}
    </ul>
  `;
}

async function createBatchFigures() {
  const files = selectedUploadFiles();
  if (state.batchInProgress) {
    return setStatus("\uc5ec\ub7ec \ud30c\uc77c \ubd84\uc11d\uc774 \uc774\ubbf8 \uc9c4\ud589 \uc911\uc785\ub2c8\ub2e4. \uc644\ub8cc\ub420 \ub54c\uae4c\uc9c0 \uae30\ub2e4\ub824\uc8fc\uc138\uc694.");
  }
  if (files.length < 2) {
    return setStatus("\uc5ec\ub7ec \ud30c\uc77c Fig \uc0dd\uc131\uc740 \ud30c\uc77c\uc744 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud574\uc57c \ud569\ub2c8\ub2e4.");
  }
  if (files.length > BATCH_FIGURE_FILE_LIMIT) {
    return setStatus(`\ud55c \ubc88\uc5d0 \ucd5c\ub300 ${BATCH_FIGURE_FILE_LIMIT}\uac1c \ud30c\uc77c\uae4c\uc9c0 \ucc98\ub9ac\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.`);
  }

  const cell = batchCellForUpload(collectCellForm());
  // Use the selected hierarchy Cell when available. Without one, the backend creates the default Project/Campaign/Cell hierarchy from each file.
  state.inspectToken += 1;
  state.analysis = null;
  state.batchFigureResults = [];
  state.batchInProgress = true;
  const fileInput = $("smartFile");
  const inspectButton = $("inspectFile");
  if (fileInput) fileInput.disabled = true;
  if (inspectButton) inspectButton.disabled = true;
  renderAnalysis();
  renderBatchFigureResults();
  setStatus(`\uc5ec\ub7ec \ud30c\uc77c \ubd84\uc11d\uc744 \uc2dc\uc791\ud588\uc2b5\ub2c8\ub2e4. ${files.length}\uac1c \ud30c\uc77c\uc744 \uc21c\uc11c\ub300\ub85c Dataset\uacfc Fig\ub85c \uc800\uc7a5\ud569\ub2c8\ub2e4.`);
  setBusy(true, `${files.length}\uac1c \ud30c\uc77c\uc744 \ubd84\uc11d\ud558\uace0 Dataset \ubc0f Fig\ub97c \uc0dd\uc131\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4.`, 0);

  try {
    for (const [index, file] of files.entries()) {
      try {
        setBusy(true, `${index + 1}/${files.length} \ud30c\uc77c \ubd84\uc11d \uc911: ${file.name}`, 0);
        setStatus(`${index + 1}/${files.length} ${file.name} \ubd84\uc11d \uc911...`);
        const { res, body } = await inspectFileUpload(file);
        if (!res.ok) {
          throw new Error(apiErrorMessage(body, "\ud30c\uc77c \ubd84\uc11d\uc744 \uc2dc\uc791\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4."));
        }
        const dataType = body?.detection?.type;
        if (!BATCH_FIGURE_KIND_BY_TYPE[dataType]) {
          throw new Error("CYC, CV, EIS\ub85c \ud310\ubcc4\ub418\uc9c0 \uc54a\uc740 \ud30c\uc77c\uc785\ub2c8\ub2e4.");
        }
        const fileCell = {
          ...cell,
          sampleName: cell.sampleName || baseNameWithoutExtension(file.name),
        };
        setBusy(true, `${index + 1}/${files.length} Dataset \uc800\uc7a5 \uc911: ${file.name}`, 0);
        setStatus(`${index + 1}/${files.length} ${file.name} Dataset \uc800\uc7a5 \uc911...`);
        const saved = await saveDatasetFromInspection(body, dataType, fileCell, BATCH_FIGURE_KIND_BY_TYPE[dataType]);
        if (!state.datasets.some((dataset) => dataset.id === saved.id)) state.datasets.unshift(saved);
        let note = saved.reusedExistingSource ? "\uac19\uc740 \uc6d0\ubcf8 \ud30c\uc77c\uc774\ub77c \uae30\uc874 Dataset\uacfc Fig\ub97c \uc7ac\uc0ac\uc6a9\ud588\uc2b5\ub2c8\ub2e4." : "";
        try {
          setBusy(true, `${index + 1}/${files.length} Fig \uc800\uc7a5 \uc911: ${file.name}`, 0);
          setStatus(`${index + 1}/${files.length} ${file.name} Fig \uc800\uc7a5 \uc911...`);
          await saveFigureRecord(saved);
        } catch (error) {
          note = `Dataset\uc740 \uc800\uc7a5\ud588\uc9c0\ub9cc Fig \uae30\ub85d\uc744 \uc800\uc7a5\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4: ${error.message}`;
        }
        state.batchFigureResults.push({ ok: true, fileName: file.name, dataType, datasetId: saved.id, note });
      } catch (error) {
        state.batchFigureResults.push({ ok: false, fileName: file.name, message: error.message || "\ucc98\ub9ac\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4." });
        setStatus(`${index + 1}/${files.length} ${file.name} \uc81c\uc678: ${error.message || "\ucc98\ub9ac\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4."} \ub2e4\uc74c \ud30c\uc77c\uc744 \uacc4\uc18d \ucc98\ub9ac\ud569\ub2c8\ub2e4.`);
      }
      renderBatchFigureResults();
    }
    if (state.batchFigureResults.some((item) => item.ok)) {
      await loadHierarchy();
      applyFilters();
    }
    const completed = state.batchFigureResults.filter((item) => item.ok).length;
    const failed = state.batchFigureResults.filter((item) => !item.ok);
    const failedNames = failed.map((item) => item.fileName).join(", ");
    setStatus(
      failed.length
        ? `\uc5ec\ub7ec \ud30c\uc77c \ucc98\ub9ac \uc644\ub8cc: ${completed}\uac1c \uc131\uacf5, ${failed.length}\uac1c \uc81c\uc678 (${failedNames}). \uc544\ub798 \uacb0\uacfc\uc5d0\uc11c \uc81c\uc678 \uc0ac\uc720\ub97c \ud655\uc778\ud574 \uc8fc\uc138\uc694.`
        : `\uc5ec\ub7ec \ud30c\uc77c \ucc98\ub9ac \uc644\ub8cc: ${completed}/${files.length}\uac1c Dataset \ubc0f Fig \uc800\uc7a5 \uc131\uacf5`,
    );
  } catch (error) {
    setStatus(`\uc5ec\ub7ec \ud30c\uc77c Fig \uc0dd\uc131 \uc911 \uc624\ub958: ${error.message}`);
  } finally {
    state.batchInProgress = false;
    clearUploadSelectionAfterProcessing();
    if (inspectButton) inspectButton.disabled = false;
    setBusy(false);
  }
}
function isExpiredLoginResponse(res, body) {
  if (Number(res?.status) !== 401 || !state.user?.token) return false;
  const message = apiErrorMessage(body, "");
  return !message || message.includes("\ud1a0\ud070") || message.includes("\ub85c\uadf8\uc778");
}

function clearExpiredLogin(res, body) {
  if (!isExpiredLoginResponse(res, body)) return false;
  const message = "\ub85c\uadf8\uc778 \uc2dc\uac04\uc774 \ub9cc\ub8cc\ub418\uc5c8\uac70\ub098 \uc11c\ubc84\uac00 \ub2e4\uc2dc \uc2dc\uc791\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \ub85c\uadf8\uc778\ud574 \uc8fc\uc138\uc694.";
  setBusy(false);
  applyUser(null);
  setLoginError(message);
  setStatus(message);
  return true;
}

async function inspectSelectedFile() {
  if ($("inspectFile")?.disabled || state.batchInProgress) return;
  const files = selectedUploadFiles();
  const file = files[0];
  if (!file) return setStatus("\uba3c\uc800 \ud30c\uc77c\uc744 \uc120\ud0dd\ud574 \uc8fc\uc138\uc694.");
  if (files.length > 1) return createBatchFigures();
  const token = ++state.inspectToken;
  state.analysis = null;
  renderAnalysis();
  const fileInput = $("smartFile");
  if (fileInput) fileInput.disabled = true;
  const inspectButton = $("inspectFile");
  if (inspectButton) {
    inspectButton.disabled = true;
    inspectButton.textContent = "\ud30c\uc77c \ubd84\uc11d \uc911...";
  }
  setStatus("\ud30c\uc77c \ubd84\uc11d \uc911...");
  setBusy(true, "\uc120\ud0dd\ud55c \ud30c\uc77c\uc744 \uc77d\uace0 \ub370\uc774\ud130 \uc885\ub958\ub97c \ucd94\uc815\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4.", 0);
  try {
    const { res, body } = await inspectFileUpload(file);
    if (token !== state.inspectToken) return;
    if (!res.ok) {
      if (clearExpiredLogin(res, body)) return;
      setStatus("\ud30c\uc77c \ubd88\ub7ec\uc624\uae30 \uc2e4\ud328");
      setAnalysisMessage(body.detail || body.error || "\ud30c\uc77c\uc744 \ubd88\ub7ec\uc624\uac70\ub098 \ubd84\uc11d\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.", "\ud30c\uc77c \ubd88\ub7ec\uc624\uae30 \uc2e4\ud328");
      return;
    }
    // The upload response is complete. Hide the overlay before rendering the
    // preview so dense WRD previews cannot look as if analysis is still stuck.
    setBusy(false);
    await nextBrowserPaint();
    if (token !== state.inspectToken) return;
    state.analysis = body;
    renderAnalysis();
    setStatus(`${body.detection.type.toUpperCase()} \ub370\uc774\ud130 \ud655\uc778 \uc644\ub8cc`);
  } catch (error) {
    if (token !== state.inspectToken) return;
    setStatus("\ud30c\uc77c \ubd88\ub7ec\uc624\uae30 \uc2e4\ud328");
    setAnalysisMessage(`\ud30c\uc77c\uc744 \ubd88\ub7ec\uc624\ub294 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4: ${error.message}`, "\ud30c\uc77c \ubd88\ub7ec\uc624\uae30 \uc2e4\ud328");
  } finally {
    if (token === state.inspectToken) {
      setBusy(false);
      if (fileInput) fileInput.disabled = false;
      if (inspectButton) {
        inspectButton.disabled = false;
        inspectButton.textContent = "\ud30c\uc77c \ubd84\uc11d";
      }
    }
  }
}

async function inspectManualFile() {
  const file = $("manualFile")?.files?.[0];
  if (!file) return setStatus("\uba3c\uc800 \ub9e4\ub274\uc5bc \uc5d1\uc140 \ud30c\uc77c\uc744 \uc120\ud0dd\ud558\uc138\uc694.");
  setBusy(true, "\ub9e4\ub274\uc5bc \uc5d1\uc140\uc5d0\uc11c \uc804\ub958\uc640 \ub85c\ub529 \uc815\ubcf4\ub97c \uc77d\uace0 \uc788\uc2b5\ub2c8\ub2e4.");
  try {
    const { res, body } = await fetchJsonWithTimeout("/api/inspect-manual", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ filename: file.name, contentBase64: await fileToBase64(file) }),
    });
    if (!res.ok) {
      if (clearExpiredLogin(res, body)) return;
      setStatus(body.error || "\ub9e4\ub274\uc5bc \ubd84\uc11d \uc2e4\ud328");
      return;
    }
    state.manualInfo = body;
    renderExperimentInfo(state.datasets.find((x) => x.id === state.selectedId));
    setStatus("\ub9e4\ub274\uc5bc \uc2e4\ud5d8 \uc815\ubcf4 \ubd84\uc11d \uc644\ub8cc");
    activateView("experimentInfo");
  } catch (error) {
    setStatus(`\ub9e4\ub274\uc5bc \ubd84\uc11d \uc2e4\ud328: ${error.message}`);
  } finally {
    setBusy(false);
  installBrokenUiTextRepair();
  }
}

function isBadText(text) {
  const s = String(text || "");
  if (!s.trim()) return true;
  return /\ufffd|\u00ec|\u00eb|\u00ea|\u00ed|\u00c3|\u00c2|\u613f|\u7531|\u912d|\u6028|\u4e2d|\uba2f|\ube18|\ub348|\ub4bf|\uca0c|\uc88e|\ub181|\u0080/.test(s);
}

function renderValidationSummaryLegacy(validation, quality = {}) {
  return renderValidationSummary(validation, quality);
}

function renderValidationSummary(validation, quality = {}) {
  if (!validation) return "";
  const notes = Array.isArray(validation.notes) ? validation.notes : [];
  const warnings = Array.isArray(validation.warnings) ? validation.warnings : [];
  const stats = validation.stats || {};
  const chips = [
    stats.rowCount ? `${stats.rowCount} rows` : "",
    Number.isFinite(stats.cycleMin) && Number.isFinite(stats.cycleMax) ? `cycle ${stats.cycleMin}-${stats.cycleMax}` : "",
    Number.isFinite(stats.capacityMin) && Number.isFinite(stats.capacityMax) ? `${fmt(stats.capacityMin, 3)}-${fmt(stats.capacityMax, 3)} mAh g-1` : "",
  ].filter(Boolean).map((item) => `<span>${escapeXml(item)}</span>`).join("");
  const noteHtml = notes.slice(0, 4).map((item) => `<li>${escapeXml(item)}</li>`).join("");
  const warningHtml = warnings.slice(0, 4).map((item) => `<li>${escapeXml(item)}</li>`).join("");
  const qualityCounts = quality?.counts || {};
  const qualityNote = quality?.status === "review"
    ? `<p class="qualityReview">\ucd94\uac00 \uac80\ud1a0\uac00 \ud544\uc694\ud55c ${Number(qualityCounts.review || 0)}\uac1c \ud589\uc774 \uc788\uc5b4 \ubd84\uc11d \uacb0\uacfc\ub97c \ud655\uc778\ud574 \uc8fc\uc138\uc694.</p>`
    : quality?.status === "ok"
      ? `<p class="qualityOk">\ud45c\uc900 \ub2e8\uc704\uc640 \ubc94\uc704 \uae30\uc900\uc758 \uae30\ubcf8 \ud488\uc9c8 \uac80\ud1a0\ub97c \ud1b5\uacfc\ud588\uc2b5\ub2c8\ub2e4.</p>`
      : "";
  return `
    <div class="validationSummary ${warnings.length ? "hasWarning" : "isOk"}">
      <div class="validationHead">
        <strong>${warnings.length ? "\ub370\uc774\ud130 \uac80\ud1a0 \ud544\uc694" : "\ub370\uc774\ud130 \uac80\ud1a0 \uc644\ub8cc"}</strong>
        <div class="validationChips">${chips}</div>
      </div>
      ${noteHtml ? `<ul>${noteHtml}</ul>` : ""}
      ${warningHtml ? `<ul class="validationWarnings">${warningHtml}</ul>` : ""}
      ${qualityNote}
    </div>`;
}

function displayUserName(d) {
  const name = d?.ownerName;
  return name && !isBadText(name) ? name : (d?.ownerId || "admin");
}

function activateView(viewName, moduleName = state.activeFigureModule) {
  document.querySelectorAll(".tab").forEach((x) => {
    const sameView = x.dataset.view === viewName;
    const sameModule = !x.dataset.module || x.dataset.module === moduleName;
    x.classList.toggle("active", sameView && sameModule);
  });
  document.querySelectorAll(".menuTrigger").forEach((x) => {
    const moduleActive = viewName === "figure" && x.dataset.module === moduleName;
    const viewActive = x.dataset.view === viewName;
    x.classList.toggle("active", moduleActive || viewActive);
  });
  document.querySelectorAll(".view").forEach((x) => x.classList.remove("active"));
  const view = $(`${viewName}View`);
  if (view) view.classList.add("active");
  const wideOnly = viewName === "electrodeCalc" || viewName === "savedFigures" || viewName === "cycRecord" || viewName === "search" || viewName === "analysisLab" || viewName === "organization" || viewName === "feedbackAdmin" || viewName === "releaseHistory" || viewName === "users" || viewName === "adminRawData";
  $("dataWorkspace")?.classList.toggle("calcOnly", wideOnly);
  $("workspaceToolbar")?.classList.toggle("hidden", viewName !== "figure");
}

function renderAnalysis() {
  const panel = $("analysisPanel");
  const createBtn = $("createFigure");
  const a = state.analysis;
  if (!a) {
    panel.replaceChildren();
    panel.classList.add("hidden");
    createBtn.classList.add("hidden");
    return;
  }
  const typeLabel = { eis: "EIS", cyc: "CYC", cv: "CV", unknown: "\uc54c \uc218 \uc5c6\ub294" }[a.detection.type] || a.detection.type;
  const shortName = a.filename.length > 42 ? `${a.filename.slice(0, 22)}...${a.filename.slice(-14)}` : a.filename;
  const readableColumns = a.columns.filter((c) => !isBadText(c));
  const badCount = a.columns.length - readableColumns.length;
  const columnPreview = readableColumns.length
    ? readableColumns.slice(0, 12).map((c) => `<span>${escapeXml(c)}</span>`).join("")
    : `<span>\uceec\ub7fc\uba85\uc744 \uba85\ud655\ud788 \uc77d\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.</span>`;
  const badNotice = badCount > 0 ? `<p>\uc77d\uae30 \uc5b4\ub824\uc6b4 \uceec\ub7fc\uba85 ${badCount}\uac1c\ub294 \uc228\uacbc\uc2b5\ub2c8\ub2e4. \ub370\uc774\ud130 \uc885\ub958\uac00 \ud2c0\ub9ac\uba74 \uc9c1\uc811 \uc120\ud0dd\ud574 \uc8fc\uc138\uc694.</p>` : "";
  const detectedCRates = a.detection.type === "cyc"
    ? explicitCRateValues(inspectionCanonicalRows("cyc"))
    : [];
  const inferredCRate = a.cRateInference && typeof a.cRateInference === "object"
    ? a.cRateInference
    : null;
  const inferredSegments = Array.isArray(inferredCRate?.segments)
    ? inferredCRate.segments
    : [];
  const inferredLabels = [...new Set(
    inferredSegments.map((item) => String(item?.label || "").trim()).filter(Boolean)
  )];
  const inferredBasis = String(inferredCRate?.one_c_label || "").trim();
  const inferredReason = String(inferredCRate?.reason || "").trim();
  const cRateNotice = detectedCRates.length
    ? `<div class="cRateInference"><strong>C-rate \uc5f4 \uac10\uc9c0</strong><div class="cRateInferenceRates">${detectedCRates.map((value) => `<span>${escapeXml(formatExplicitCRate(value))}</span>`).join("")}</div><p>\uc800\uc7a5 \ud6c4 CYC Fig\uc5d0\uc11c \uc774 \uac12\uc73c\ub85c cycle \uad6c\uac04\uc744 \uad6c\ubd84\ud569\ub2c8\ub2e4.</p></div>`
    : inferredCRate?.available
      ? `<div class="cRateInference"><strong>C-rate \uc790\ub3d9 \uacc4\uc0b0</strong>${inferredLabels.length ? `<div class="cRateInferenceRates">${inferredLabels.map((label) => `<span>${escapeXml(label)}</span>`).join("")}</div>` : ""}${inferredBasis ? `<p>\uacc4\uc0b0 \uae30\uc900: ${escapeXml(inferredBasis)}</p>` : ""}</div>`
      : inferredCRate
        ? `<div class="cRateInference cRateInferenceUnavailable"><strong>C-rate \uc790\ub3d9 \uacc4\uc0b0 \ubd88\uac00</strong><p>${escapeXml(inferredReason || "1C \uae30\uc900 \uc804\ub958\ub97c \uacc4\uc0b0\ud560 \uc804\uadf9 \uc815\ubcf4\uac00 \ubd80\uc871\ud569\ub2c8\ub2e4.")}</p></div>`
        : "";
  const eisColumnGuide = a.detection.type === "eis" ? `
    <div class="eisColumnGuide">
      <strong>EIS \uc5f4 \uc548\ub0b4</strong>
      <ul>
        <li><code>sweep</code>: \ubc18\ubcf5 \uce21\uc815 \ud68c\ucc28, <code>point</code>: \ud68c\ucc28 \uc548\uc758 \uce21\uc815 \uc21c\uc11c\uc785\ub2c8\ub2e4.</li>
        <li><code>frequency</code>: \uc778\uac00\ud55c \uad50\ub958 \uc8fc\ud30c\uc218(Hz)\uc785\ub2c8\ub2e4.</li>
        <li><code>zreal</code>: \uc784\ud53c\ub358\uc2a4\uc758 \uc2e4\uc218\ubd80 Z'(ohm), <code>zimag</code>: \ud5c8\uc218\ubd80 Z''(ohm)\uc785\ub2c8\ub2e4. Nyquist \uadf8\ub798\ud504\ub294 \uad00\ub840\uc0c1 <code>-Z''</code>\ub97c \uc138\ub85c\ucd95\uc5d0 \ud45c\uc2dc\ud569\ub2c8\ub2e4.</li>
        <li><code>mag</code>: \uc784\ud53c\ub358\uc2a4 \ud06c\uae30 |Z|(ohm), <code>phase</code>: \uc704\uc0c1\uac01(degree)\uc785\ub2c8\ub2e4.</li>
      </ul>
      <p>Fig \uc0dd\uc131\uc5d0\ub294 \uc8fc\ub85c frequency, zreal, zimag\ub97c \uc0ac\uc6a9\ud569\ub2c8\ub2e4. \ub098\uba38\uc9c0 \uc5f4\uc740 \uce21\uc815 \uc21c\uc11c \ud655\uc778\uacfc Bode \uadf8\ub798\ud504\uc5d0 \ud568\uaed8 \uc4f0\uc785\ub2c8\ub2e4.</p>
    </div>` : "";
  const isUnknown = a.detection.type === "unknown" || a.detection.confidence < 0.35;
  const heading = isUnknown
    ? "\ub370\uc774\ud130 \uc885\ub958\ub97c \uc790\ub3d9\uc73c\ub85c \ud310\ub2e8\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4."
    : `${typeLabel} \ub370\uc774\ud130\ub85c \ubcf4\uc785\ub2c8\ub2e4. \ub9de\ub098\uc694?`;
  const confirmChoice = isUnknown
    ? ""
    : `<label class="detectedTypeChoice selected"><input type="radio" name="detectedType" value="${a.detection.type}" checked /> \uc790\ub3d9 \uc120\ud0dd\ub428: ${typeLabel} \ub370\uc774\ud130\ub85c \uacc4\uc18d</label>`;
  const typeSelectMarkup = `
    <div class="typeSelect typeSelectProminent" role="group" aria-label="\ub370\uc774\ud130 \uc885\ub958 \uc120\ud0dd">
      <strong>\ub370\uc774\ud130 \uc885\ub958 \uc120\ud0dd</strong>
      ${confirmChoice}
      <label class="detectedTypeChoice"><input type="radio" name="detectedType" value="manual" ${isUnknown ? "checked" : ""} /> ${isUnknown ? "\ub370\uc774\ud130 \uc885\ub958\ub97c \uc9c1\uc811 \uc120\ud0dd\ud558\uaca0\uc2b5\ub2c8\ub2e4." : "\uc544\ub2c8\uc624, \uc9c1\uc811 \uc120\ud0dd\ud558\uaca0\uc2b5\ub2c8\ub2e4."}</label>
      <select id="manualType">
        <option value="">\ub370\uc774\ud130 \uc885\ub958 \uc120\ud0dd</option>
        <option value="eis">EIS</option>
        <option value="cyc">CYC</option>
        <option value="cv">CV</option>
        <option value="unknown">\ubaa9\ub85d\uc5d0 \uc5c6\ub294 \ub370\uc774\ud130</option>
      </select>
      <span class="typeSelectHint">\ubaa9\ub85d\uc744 \ubc14\ub85c \uace0\ub974\uba74 \uc9c1\uc811 \uc120\ud0dd\uc73c\ub85c \ubc14\ub01d\ub2c8\ub2e4.</span>
    </div>`;
  panel.classList.remove("hidden");
  createBtn.classList.toggle("hidden", isUnknown);
  panel.innerHTML = `
    <h3>${heading}</h3>
    <p title="${escapeAttr(a.filename)}">${escapeXml(shortName)} \u00b7 ${a.sheetName ? `sheet ${escapeXml(a.sheetName)} \u00b7 ` : ""}${a.rowCount} rows \u00b7 confidence ${(a.detection.confidence * 100).toFixed(0)}%</p>
    ${typeSelectMarkup}
    <p class="columnPreviewHint">\uc544\ub798 \ud56d\ubaa9\uc740 \ud30c\uc77c\uc5d0\uc11c \uc77d\uc740 \uc5f4 \uc774\ub984\uc785\ub2c8\ub2e4. \uc120\ud0dd\ud560 \ud544\uc694\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>
    <div class="columnPreview">${columnPreview}</div>
    ${cRateNotice}
    ${eisColumnGuide}
    ${renderValidationSummary(a.validation, a.quality)}
    ${badNotice}
    <h3 id="figureQuestion">${isUnknown ? "\uba3c\uc800 \ub370\uc774\ud130 \uc885\ub958\ub97c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694." : "\uc5b4\ub5a4 Fig\ub97c \ub9cc\ub4e4\uc5b4 \ub4dc\ub9b4\uae4c\uc694?"}</h3>
    <div class="choiceGrid" id="figureChoices"></div>
  `;
  for (const radio of panel.querySelectorAll("input[name='detectedType']")) {
    radio.addEventListener("change", updateFigureChoices);
  }
  const manualType = $("manualType");
  manualType.addEventListener("change", () => {
    const manualRadio = panel.querySelector("input[name='detectedType'][value='manual']");
    if (manualType.value && manualRadio) manualRadio.checked = true;
    updateFigureChoices();
  });
  updateFigureChoices();
}

function selectedType() {
  const checked = document.querySelector("input[name='detectedType']:checked");
  if (!checked) return state.analysis?.detection.type || "unknown";
  return checked.value === "manual" ? $("manualType").value : checked.value;
}

function collectCellForm() {
  const fd = new FormData($("datasetForm"));
  const cell = Object.fromEntries(["date", "cellId", "sampleName", "material", "electrolyte", "condition", "notes"].map((k) => [k, fd.get(k) || ""]));
  if (!cell.date) {
    cell.date = todayLocal();
    const form = $("datasetForm");
    if (form?.elements.date) form.elements.date.value = cell.date;
  }
  return cell;
}

function batchCellForUpload(cell) {
  const selectedCell = selectedHierarchyCell();
  if (!selectedCell?.cellId || String(cell?.cellId || "").trim()) return cell;
  return {
    ...cell,
    cellId: selectedCell.cellId,
    sampleName: cell.sampleName || selectedCell.sampleName || "",
    material: cell.material || selectedCell.material || "",
    electrolyte: cell.electrolyte || selectedCell.electrolyte || "",
    condition: cell.condition || selectedCell.condition || "",
    notes: cell.notes || selectedCell.notes || "",
  };
}

function fillCellForm(d) {
  const form = $("datasetForm");
  if (!form || !d) return;
  const cell = d.cell || {};
  for (const key of ["date", "cellId", "sampleName", "material", "electrolyte", "condition", "notes"]) {
    if (form.elements[key]) form.elements[key].value = cell[key] || "";
  }
  selectHierarchyForDataset(d);
}

function updateSelectedFileName() {
  const files = selectedUploadFiles();
  const label = $("selectedFileName");
  if (!label) return;
  if (!files.length) {
    label.textContent = "\uc120\ud0dd\ub41c \ud30c\uc77c \uc5c6\uc74c";
  } else if (files.length === 1) {
    label.textContent = files[0].name;
  } else {
    const visibleNames = files.slice(0, 2).map((file) => file.name).join(", ");
    label.textContent = `${files.length}\uac1c \ud30c\uc77c \uc120\ud0dd\ub428: ${visibleNames}${files.length > 2 ? " ..." : ""}`;
  }
}

function updateBatchFigureControl() {
  const button = $("batchCreateFigures");
  if (!button) return;
  button.classList.toggle("hidden", selectedUploadFiles().length < 2);
}

function resetAnalysisForNewFile() {
  updateSelectedFileName();
  updateBatchFigureControl();
  state.inspectToken += 1;
  state.analysis = null;
  state.batchFigureResults = [];
  state.selectedId = null;
  state.selectedAnnotation = null;
  setBusy(false);
  renderAnalysis();
  renderBatchFigureResults();
  renderSelect();
  renderCurrent();
  setStatus("\ud30c\uc77c \uc120\ud0dd \uc644\ub8cc - \ud30c\uc77c \ubd84\uc11d\uc744 \ub20c\ub7ec\uc8fc\uc138\uc694.");
}

function updateFigureChoices() {
  const manual = document.querySelector("input[name='detectedType'][value='manual']")?.checked;
  for (const choice of document.querySelectorAll(".typeSelectProminent .detectedTypeChoice")) {
    choice.classList.toggle("selected", Boolean(choice.querySelector("input")?.checked));
  }
  const type = selectedType();
  const question = $("figureQuestion");
  const createBtn = $("createFigure");
  if (!type || type === "unknown") {
    $("figureChoices").innerHTML = `<p>\ud604\uc7ac \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ub370\uc774\ud130\uc785\ub2c8\ub2e4. \uc5b4\ub5a4 \ub370\uc774\ud130\uc778\uc9c0 \uc54c\ub824\uc8fc\uc2dc\uba74 \uba54\ub274\uc640 Fig\ub97c \ucd94\uac00\ud558\uaca0\uc2b5\ub2c8\ub2e4.</p>`;
    if (question) question.textContent = type === "unknown" ? "\uc9c0\uc6d0 \ubaa9\ub85d\uc5d0 \uc5c6\ub294 \ub370\uc774\ud130\uc785\ub2c8\ub2e4." : "\uba3c\uc800 \ub370\uc774\ud130 \uc885\ub958\ub97c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694.";
    if (createBtn) createBtn.classList.add("hidden");
    return;
  }
  if (question) question.textContent = "\uc5b4\ub5a4 Fig\ub97c \ub9cc\ub4e4\uc5b4 \ub4dc\ub9b4\uae4c\uc694?";
  if (createBtn) createBtn.classList.remove("hidden");
  const options = {
    eis: [["eis-combined", "Nyquist + Bode \ud1b5\ud569 Fig"], ["nyquist", "Nyquist plot"], ["bode", "Bode magnitude/phase"]],
    cyc: [["cycling-performance", "\uc140 \uc131\ub2a5 \ud14c\uc2a4\ud2b8: capacity/efficiency vs cycle"], ["voltage-profile", "\uc804\uc555/\uc804\ub958 \uac70\ub3d9: voltage-capacity/time \ub610\ub294 voltage/current vs cycle"], ["dqdv", "dQ/dV \ud53c\ud06c: \uc804\uc555\uc5d0 \ub530\ub978 \uc6a9\ub7c9 \ubcc0\ud654"]],
    cv: [["cv-curve", "CV curve: current vs voltage"], ["cv-comparison", "Scan rate \ube44\uad50 Fig"]],
    unknown: [["table-preview", "\ud45c \ud615\ud0dc\ub85c \ubbf8\ub9ac\ubcf4\uae30"]],
  }[type] || [["table-preview", "\ud45c \ud615\ud0dc\ub85c \ubbf8\ub9ac\ubcf4\uae30"]];
  const cycRows = type === "cyc" ? inspectionCanonicalRows("cyc") : [];
  // Inspection uses only a sampled browser payload. Do not sort and
  // differentiate every trace here; the full dQ/dV calculation happens only
  // after the user explicitly creates that Fig from the saved Dataset.
  const dqdvAnalysis = type === "cyc" ? cycDqdvReadiness(cycRows) : null;
  const hasDqdvTrace = type !== "cyc" || dqdvAnalysis.hasRawTrace;
  // Preserve a deliberate choice while cell metadata or inspection details refresh.
  // Otherwise selecting dQ/dV could silently jump back to the default performance Fig.
  const selectedFigureKind = document.querySelector("input[name='figureKind']:checked")?.value || "";
  const hasSelectedFigureKind = options.some(([id]) => id === selectedFigureKind && !(id === "dqdv" && !hasDqdvTrace));
  $("figureChoices").innerHTML = options.map(([id, label], idx) => {
    const disabled = id === "dqdv" && !hasDqdvTrace;
    const help = disabled ? ` <small>(${dqdvUnavailableMessage(cycRows)})</small>` : "";
    const hint = id === "cycling-performance"
      ? " <small class=\"figureChoiceHint\">CYC performance Fig: one point per cycle</small>"
      : id === "dqdv" && hasDqdvTrace
        ? ` <small class=\"figureChoiceHint\">${dqdvReadinessSummary(dqdvAnalysis)}</small>`
        : "";
    const checked = hasSelectedFigureKind ? id === selectedFigureKind : idx === 0;
    return `<label data-figure-kind="${id}"${disabled ? " class=\"figureChoiceDisabled\"" : ""}><input type="radio" name="figureKind" value="${id}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}/><span class="figureChoiceBody"><span class="figureChoiceLabel">${label}</span>${hint}${help}</span></label>`;
  }).join("");
  // Keep the command text aligned with the radio choice so dQ/dV is not mistaken for the default performance Fig.
  $("figureChoices").onchange = updateCreateFigureButton;
  const applyButton = $("applyCellInfo");
  if (applyButton) {
    applyButton.textContent = "\uc140 \uc815\ubcf4\ub9cc \uc801\uc6a9";
    applyButton.title = "Fig\ub97c \ub9cc\ub4e4\uc9c0 \uc54a\uace0 \uc785\ub825\ud55c \uc140 \uc815\ubcf4\ub9cc \uc801\uc6a9\ud569\ub2c8\ub2e4.";
  }
  updateCreateFigureButton();
}

function updateCreateFigureButton() {
  const button = $("createFigure");
  if (!button) return;
  const kind = document.querySelector("input[name='figureKind']:checked")?.value;
  const labels = {
    "cycling-performance": "\uc131\ub2a5 Fig \uc0dd\uc131",
    "voltage-profile": "\uc804\uc555/\uc804\ub958 Fig \uc0dd\uc131",
    dqdv: "dQ/dV Fig \uc0dd\uc131",
    "eis-combined": "Nyquist + Bode Fig \uc0dd\uc131",
    nyquist: "Nyquist Fig \uc0dd\uc131",
    bode: "Bode Fig \uc0dd\uc131",
    "cv-curve": "CV Fig \uc0dd\uc131",
    "cv-comparison": "CV \ube44\uad50 Fig \uc0dd\uc131",
  };
  button.textContent = labels[kind] || "\uc120\ud0dd\ud55c Fig \uc0dd\uc131";
}

async function createSmartFigure() {
  if (!state.analysis) return setStatus("\uba3c\uc800 \ud30c\uc77c\uc744 \ubd84\uc11d\ud558\uc138\uc694.");
  setBusy(true, "\uc120\ud0dd\ud55c \ub370\uc774\ud130\ub85c Fig\ub97c \ub9cc\ub4e4\uace0 \uc788\uc2b5\ub2c8\ub2e4.");
  try {
    const dataType = selectedType();
    if (!dataType) {
      setStatus("\uba3c\uc800 \ub370\uc774\ud130 \uc885\ub958\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
      setAnalysisMessage("\uba3c\uc800 \ub370\uc774\ud130 \uc885\ub958\ub97c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694.");
      return;
    }
    if (dataType === "unknown") {
      setStatus("\uc5c6\ub294 \ub370\uc774\ud130 \ud615\uc2dd\uc785\ub2c8\ub2e4.");
      setAnalysisMessage("\uc544\uc9c1 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \ub370\uc774\ud130\uc785\ub2c8\ub2e4. \uc5b4\ub5a4 \ub370\uc774\ud130\uc778\uc9c0 \uc54c\ub824\uc8fc\uc2dc\uba74 \uba54\ub274\uc640 Fig\ub97c \ucd94\uac00\ud558\uaca0\uc2b5\ub2c8\ub2e4.");
      return;
    }
    const figureKind = document.querySelector("input[name='figureKind']:checked")?.value || `${dataType}-combined`;
    const rows = canonicalRows(dataType, state.analysis.columns, state.analysis.rows);
    if (!rows.length) {
      setStatus("\uc22b\uc790 \uceec\ub7fc\uc744 \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
      setAnalysisMessage("\uc120\ud0dd\ud55c \ub370\uc774\ud130 \ud0c0\uc785\uc5d0 \ub9de\ub294 \uc22b\uc790 \uceec\ub7fc\uc744 \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4. \ub2e4\ub978 \ub370\uc774\ud130 \uc885\ub958\ub97c \uc120\ud0dd\ud558\uac70\ub098 \uceec\ub7fc\uba85\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.");
      return;
    }
    // dQ/dV requires a genuine voltage-capacity trace within a cycle. Do not
    // save a blank Fig when the selected CYC table contains summary rows only.
    if (figureKind === "dqdv" && !cycDqdvSeries(rows).hasRawTrace) {
      const message = dqdvUnavailableMessage(rows);
      setStatus(message);
      setAnalysisMessage(message);
      return;
    }
    const cell = collectCellForm();
    const { res, body: saved } = await fetchJsonWithTimeout("/api/datasets", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        cell,
        rows,
        columns: state.analysis.columns,
        sourceName: state.analysis.filename,
        dataType,
        figureKind,
        uploadId: state.analysis.uploadId || "",
        canonicalRows: Array.isArray(state.analysis.canonicalRows) ? state.analysis.canonicalRows : [],
        columnMapping: state.analysis.columnMapping || {},
        quality: state.analysis.quality || {},
        parser: state.analysis.parser || {},
        ...hierarchySelectionPayload(),
      }),
    });
    if (!res.ok) {
      const message = apiErrorMessage(saved, "\ub370\uc774\ud130\uc14b \uc800\uc7a5 \uc911 \uc11c\ubc84 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \ud398\uc774\uc9c0\ub97c \uc0c8\ub85c\uace0\uce68\ud55c \ub4a4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.");
      setStatus(message);
      setAnalysisMessage(message);
      return;
    }
    state.datasets = [saved, ...state.datasets.filter((dataset) => dataset.id !== saved.id)];
    await loadHierarchy();
    state.analysis = null;
    renderAnalysis();
    showDatasetImmediately(saved);
    showModule(["cyc", "cv", "eis"].includes(dataType) ? dataType : "figure");
    setStatus(`${dataType.toUpperCase()} Fig \uc0dd\uc131 \uc644\ub8cc`);
  } catch (error) {
    setStatus("Fig \uc0dd\uc131 \uc2e4\ud328");
    setAnalysisMessage(`Fig \uc0dd\uc131 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

// Saved datasets preserve raw source columns for traceability. Convert older CYC
// rows back to the same rendering shape used immediately after file analysis.
function normalizeSavedCycDataset(item) {
  if (!item || String(item.dataType || "").toLowerCase() !== "cyc" || !Array.isArray(item.rows) || !item.rows.length) return item;
  // Older portal versions saved frontend-normalized rows with `capacity: null`.
  // Treat those rows as unresolved, not as a usable CYC series. The server adds
  // `renderRows` from its immutable parser artifact when it can repair them.
  // Do not coerce null or an empty string here: Number(null) is 0, which made
  // legacy rows with an unresolved capacity look like valid CYC data and left
  // their plot blank. A usable cycle summary needs a real, positive number.
  const sourceRows = Array.isArray(item.renderRows) && item.renderRows.length ? item.renderRows : item.rows;
  const columns = Array.isArray(item.columns) && item.columns.length ? item.columns : Object.keys(sourceRows[0] || {});
  const normalizedRows = canonicalRows("cyc", columns, sourceRows.map((row) => ({
    ...(row?._raw && typeof row._raw === "object" ? row._raw : {}),
    ...row,
  })));
  const hasNormalizedCapacity = normalizedRows.some((row) => (
    typeof row?.capacity === "number" && Number.isFinite(row.capacity) && row.capacity > 0
  ));
  if (hasNormalizedCapacity) return { ...item, rows: normalizedRows };

  const hasUsableCapacity = item.rows.some((row) => (
    typeof row?.capacity === "number" && Number.isFinite(row.capacity) && row.capacity > 0
  ));
  if (!hasUsableCapacity) return item;
  const savedCapacityColumn = findBestCycColumn(columns, "dischargeSpecific") || findBestCycColumn(columns, "dischargeCapacity");
  const capacityUnit = cycCapacityUnitFromColumn(savedCapacityColumn);
  return {
    ...item,
    rows: item.rows.map((row) => ({ ...row, capacityUnit: row?.capacityUnit || capacityUnit })),
  };
}

async function loadData() {
  if (!state.user) return;
  const res = await fetch("/api/datasets", { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (clearExpiredLogin(res, body)) return;
    throw new Error(body.error || "\ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  }
  const savedDatasets = await res.json();
  state.datasets = savedDatasets.map(normalizeSavedCycDataset);
  applyFilters();
  setStatus(`${state.datasets.length} datasets`);
}

// Project -> Campaign -> Cell is loaded separately from datasets so the same
// experiment structure can be reused when CYC, EIS, and CV files are added.
async function loadHierarchy() {
  if (!state.user) return;
  const res = await fetch("/api/hierarchy", { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (clearExpiredLogin(res, body)) return;
    throw new Error(body.error || "\uc2e4\ud5d8 \uacc4\uce35\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  }
  state.hierarchy = await res.json();
  const current = state.datasets.find((item) => item.id === state.selectedId);
  renderHierarchyControls(current ? {
    projectId: current.projectId || "",
    campaignId: current.campaignId || "",
    cellRecordId: current.cellRecordId || "",
    datasetGroupId: current.datasetGroupId || "",
  } : {});
}

function selectedHierarchyProject() {
  return state.hierarchy.find((item) => item.id === $("projectSelect")?.value) || null;
}

// Organizations are optional: an empty organizationId means a private personal project.
async function loadOrganizations() {
  if (!state.user) return;
  const res = await fetch("/api/organizations", { headers: authHeaders() });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) {
    if (clearExpiredLogin(res, body)) return;
    throw new Error(body.error || "\uc870\uc9c1 \ubaa9\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  }
  state.organizations = Array.isArray(body) ? body : [];
  if (!state.organizations.some((item) => item.id === state.selectedOrganizationId)) {
    state.selectedOrganizationId = state.organizations[0]?.id || "";
  }
  renderOrganizationSelectors();
  renderOrganizationView();
  if (state.selectedOrganizationId) await loadOrganizationMembers();
}

function selectedOrganization() {
  return state.organizations.find((item) => item.id === state.selectedOrganizationId) || null;
}

function renderOrganizationSelectors() {
  const projectSelect = $("projectOrganizationSelect");
  const organizationSelect = $("organizationSelect");
  const optionMarkup = state.organizations
    .map((item) => `<option value="${escapeAttr(item.id)}">${escapeXml(item.name)} \u00b7 ${escapeXml(item.myRole || "member")}</option>`)
    .join("");
  if (projectSelect) {
    const previous = projectSelect.value;
    projectSelect.innerHTML = `<option value="">\uac1c\uc778 \ud504\ub85c\uc81d\ud2b8 (\ub098\ub9cc \ubcf4\uae30)</option>${optionMarkup}`;
    projectSelect.value = state.organizations.some((item) => item.id === previous) ? previous : "";
  }
  if (organizationSelect) {
    organizationSelect.innerHTML = state.organizations.length
      ? optionMarkup
      : `<option value="">\ucc38\uc5ec \uc911\uc778 \uc870\uc9c1\uc774 \uc5c6\uc2b5\ub2c8\ub2e4</option>`;
    organizationSelect.value = state.selectedOrganizationId;
  }
}

function canManageSelectedOrganization() {
  const role = selectedOrganization()?.myRole || "";
  return state.user?.role === "admin" || role === "owner" || role === "admin";
}

// The dataset list contains metadata only.  Raw rows are fetched once, only
// for the selected Dataset, so a large WRD cannot freeze the saved-list page.
async function hydrateDatasetRows(datasetId) {
  const existing = state.datasets.find((item) => item.id === datasetId);
  if (!existing || existing.rowsLoaded !== false) return existing;
  if (state.datasetDetailRequests.has(datasetId)) return state.datasetDetailRequests.get(datasetId);

  const request = (async () => {
    const res = await fetch(`/api/datasets/${encodeURIComponent(datasetId)}`, { headers: authHeaders() });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (clearExpiredLogin(res, body)) return null;
      throw new Error(body.error || "Dataset \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
    }
    const hydrated = normalizeSavedCycDataset({ ...body, rowsLoaded: true });
    state.datasets = state.datasets.map((item) => item.id === datasetId ? hydrated : item);
    state.filtered = state.filtered.map((item) => item.id === datasetId ? hydrated : item);
    return hydrated;
  })();
  state.datasetDetailRequests.set(datasetId, request);
  try {
    return await request;
  } finally {
    state.datasetDetailRequests.delete(datasetId);
  }
}

async function hydrateCycComparisonSeries(datasetId) {
  if (state.comparisonSeriesByDatasetId.has(datasetId)) {
    return state.comparisonSeriesByDatasetId.get(datasetId);
  }
  if (state.comparisonSeriesRequests.has(datasetId)) {
    return state.comparisonSeriesRequests.get(datasetId);
  }
  const dataset = state.datasets.find((item) => item.id === datasetId);
  if (!dataset || String(dataset.dataType || "").toLowerCase() !== "cyc") return [];
  if (dataset.rowsLoaded !== false) {
    const points = dischargeSeries((dataset.rows || []).filter((row) => Number.isFinite(row.cycle)).sort((a, b) => a.cycle - b.cycle));
    state.comparisonSeriesByDatasetId.set(datasetId, points);
    return points;
  }

  const request = (async () => {
    const response = await fetch(`/api/datasets/${encodeURIComponent(datasetId)}/comparison-series`, { headers: authHeaders() });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (clearExpiredLogin(response, body)) return [];
      throw new Error(apiErrorMessage(body, "CYC \ube44\uad50 \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4."));
    }
    if (body.datasetId !== datasetId || body.dataType !== "cyc" || !Array.isArray(body.points)) {
      throw new Error("CYC \ube44\uad50 \ub370\uc774\ud130 \ud615\uc2dd\uc774 \uc62c\ubc14\ub974\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.");
    }
    const points = body.points.map((point) => ({
      x: Number(point?.cycle),
      y: Number(point?.capacity),
    })).filter((point) => Number.isFinite(point.x) && point.x >= 1 && Number.isFinite(point.y));
    state.comparisonSeriesByDatasetId.set(datasetId, points);
    return points;
  })();
  state.comparisonSeriesRequests.set(datasetId, request);
  try {
    return await request;
  } finally {
    state.comparisonSeriesRequests.delete(datasetId);
  }
}

function renderOrganizationChart(organization) {
  const chart = $("organizationChart");
  if (!chart) return;
  if (!organization) {
    chart.innerHTML = `<p class="organizationChartEmpty">\uc870\uc9c1\uc744 \uc120\ud0dd\ud558\uba74 \uc2e4\uc81c \uba64\ubc84\uc640 \uad8c\ud55c \uad6c\uc870\ub97c \uc870\uc9c1\ub3c4\ub85c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p>`;
    return;
  }
  const members = Array.isArray(state.organizationMembers) ? state.organizationMembers : [];
  if (!members.length) {
    chart.innerHTML = `<p class="organizationChartEmpty">\ub4f1\ub85d\ub41c \uba64\ubc84\uac00 \uc5c6\uac70\ub098 \uba64\ubc84 \uc815\ubcf4\ub97c \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.</p>`;
    return;
  }
  const roleGroups = [
    { role: "owner", label: "\uc870\uc9c1 \ucc45\uc784\uc790" },
    { role: "admin", label: "\uc870\uc9c1 \uad00\ub9ac\uc790" },
    { role: "researcher", label: "\uc5f0\uad6c\uc6d0" },
    { role: "viewer", label: "\uc5f4\ub78c\uc790" },
  ];
  const groups = roleGroups.map(({ role, label }) => {
    const roleMembers = members.filter((member) => (member.role || "viewer") === role);
    if (!roleMembers.length) return "";
    const cards = roleMembers.map((member) => {
      const user = member.user || {};
      const systemAdmin = user.role === "admin"
        ? `<em>\uc2dc\uc2a4\ud15c \uad00\ub9ac\uc790</em>`
        : "";
      return `<article class="organizationChartMember"><strong>${escapeXml(user.name || user.id || "-")}</strong><span>${escapeXml(user.id || "-")}</span>${systemAdmin}</article>`;
    }).join("");
    return `<section class="organizationChartGroup" data-organization-role="${role}"><div class="organizationChartGroupHeader"><span>${label}</span><span>${roleMembers.length}\uba85</span></div><div class="organizationChartMembers">${cards}</div></section>`;
  }).filter(Boolean).join("");
  chart.innerHTML = groups || `<p class="organizationChartEmpty">\ud45c\uc2dc\ud560 \uba64\ubc84 \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>`;
}

function renderOrganizationView() {
  renderOrganizationSelectors();
  const hint = $("organizationRoleHint");
  const list = $("organizationMembersList");
  const addButton = $("addOrganizationMember");
  const memberId = $("organizationMemberId");
  const memberRole = $("organizationMemberRole");
  const organization = selectedOrganization();
  const canManage = canManageSelectedOrganization();
  if (hint) {
    hint.textContent = organization
      ? `${organization.name} \u00b7 \ub0b4 \uc5ed\ud560: ${organization.myRole || "member"}`
      : "\uc0c8 \uc870\uc9c1\uc744 \ub9cc\ub4e4\uac70\ub098, \uc870\uc9c1 \uad00\ub9ac\uc790\uc5d0\uac8c \ucd08\ub300\ub97c \uc694\uccad\ud558\uc138\uc694.";
  }
  for (const element of [addButton, memberId, memberRole]) {
    if (element) element.disabled = !organization || !canManage;
  }
  if (!organization && list) {
    list.innerHTML = `<p class="organizationEmpty">\uc120\ud0dd\ub41c \uc870\uc9c1\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</p>`;
  } else if (organization && !state.organizationMembers.length && list) {
    list.innerHTML = `<p class="organizationEmpty">\uba64\ubc84 \uc815\ubcf4\ub97c \ubd88\ub7ec\uc624\ub294 \uc911\uc774\uac70\ub098 \ub4f1\ub85d\ub41c \uba64\ubc84\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>`;
  } else if (list) {
    list.innerHTML = state.organizationMembers.map((member) => {
      const user = member.user || {};
      const remove = canManage && member.role !== "owner"
        ? `<button type="button" class="smallDanger" data-remove-organization-member="${escapeAttr(user.id)}">\uc81c\uac70</button>`
        : "";
      return `<div class="organizationMemberRow"><div><strong>${escapeXml(user.name || user.id)}</strong><span>${escapeXml(user.id)} \u00b7 ${escapeXml(member.role || "viewer")}</span></div>${remove}</div>`;
    }).join("");
  }
  renderOrganizationChart(organization);
}

async function loadOrganizationMembers() {
  const organization = selectedOrganization();
  if (!organization) {
    state.organizationMembers = [];
    renderOrganizationView();
    return;
  }
  const res = await fetch(`/api/organizations/${encodeURIComponent(organization.id)}/members`, { headers: authHeaders() });
  const body = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error(body.error || "\uc870\uc9c1 \uba64\ubc84\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  state.organizationMembers = Array.isArray(body) ? body : [];
  renderOrganizationView();
}

async function createOrganizationFromInput() {
  const input = $("newOrganizationName");
  const name = input?.value.trim() || "";
  if (!name) return setStatus("\uc870\uc9c1 \uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.");
  const res = await fetch("/api/organizations", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "\uc870\uc9c1 \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  input.value = "";
  state.selectedOrganizationId = body.id;
  await loadOrganizations();
  setStatus(`\uc870\uc9c1 '${body.name}'\uc744 \ub9cc\ub4e4\uc5c8\uc2b5\ub2c8\ub2e4.`);
}

async function addOrganizationMember() {
  const organization = selectedOrganization();
  const input = $("organizationMemberId");
  const memberUserId = input?.value.trim() || "";
  const role = $("organizationMemberRole")?.value || "researcher";
  if (!organization) return setStatus("\uba3c\uc800 \uc870\uc9c1\uc744 \uc120\ud0dd\ud574\uc8fc\uc138\uc694.");
  if (!memberUserId) return setStatus("\ud68c\uc6d0\uac00\uc785\ud55c \uc0ac\uc6a9\uc790 \uc544\uc774\ub514\ub97c \uc785\ub825\ud574\uc8fc\uc138\uc694.");
  const res = await fetch(`/api/organizations/${encodeURIComponent(organization.id)}/members/${encodeURIComponent(memberUserId)}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ role }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "\uba64\ubc84 \uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  input.value = "";
  await loadOrganizationMembers();
  setStatus(`${memberUserId} \uacc4\uc815\uc5d0 ${role} \uc5ed\ud560\uc744 \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.`);
}

async function removeOrganizationMember(memberUserId) {
  const organization = selectedOrganization();
  if (!organization || !memberUserId) return;
  if (!window.confirm(`${memberUserId} \uacc4\uc815\uc744 \uc870\uc9c1\uc5d0\uc11c \uc81c\uac70\ud560\uae4c\uc694?`)) return;
  const res = await fetch(`/api/organizations/${encodeURIComponent(organization.id)}/members/${encodeURIComponent(memberUserId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return setStatus(body.error || "\uba64\ubc84 \uc81c\uac70\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  await loadOrganizationMembers();
  setStatus(`${memberUserId} \uacc4\uc815\uc744 \uc870\uc9c1\uc5d0\uc11c \uc81c\uac70\ud588\uc2b5\ub2c8\ub2e4.`);
}

function selectedHierarchyCampaign(project = selectedHierarchyProject()) {
  return project?.campaigns?.find((item) => item.id === $("campaignSelect")?.value) || null;
}

function selectedHierarchyCell(campaign = selectedHierarchyCampaign()) {
  return campaign?.cells?.find((item) => item.id === $("cellRecordSelect")?.value) || null;
}

function selectedHierarchyDatasetGroup(cell = selectedHierarchyCell()) {
  return cell?.datasetGroups?.find((item) => item.id === $("datasetGroupSelect")?.value) || null;
}

function hierarchySelectionPayload() {
  return {
    projectId: $("projectSelect")?.value || "",
    campaignId: $("campaignSelect")?.value || "",
    cellRecordId: $("cellRecordSelect")?.value || "",
    datasetGroupId: $("datasetGroupSelect")?.value || "",
    datasetGroupName: $("newDatasetGroupName")?.value.trim() || "",
  };
}

function hierarchyLabel(dataset) {
  if (!dataset) return "";
  const project = state.hierarchy.find((item) => item.id === dataset.projectId);
  const campaign = project?.campaigns?.find((item) => item.id === dataset.campaignId);
  const cell = campaign?.cells?.find((item) => item.id === dataset.cellRecordId);
  const group = cell?.datasetGroups?.find((item) => item.id === dataset.datasetGroupId);
  return [project?.name, campaign?.name, cell?.cellId || dataset.cell?.cellId, group?.name]
    .filter(Boolean)
    .map((value) => cleanDisplayText(value, "\uc774\uc804 \uc800\uc7a5 \uc815\ubcf4"))
    .filter(Boolean)
    .join(" / ");
}

function renderHierarchyControls(preferred = {}) {
  const projectSelect = $("projectSelect");
  const campaignSelect = $("campaignSelect");
  const cellSelect = $("cellRecordSelect");
  const datasetGroupSelect = $("datasetGroupSelect");
  if (!projectSelect || !campaignSelect || !cellSelect || !datasetGroupSelect) return;

  const previousProject = preferred.projectId ?? projectSelect.value;
  projectSelect.innerHTML = `<option value="">\ud504\ub85c\uc81d\ud2b8\ub97c \uc120\ud0dd\ud558\uac70\ub098 \uc0c8\ub85c \ub9cc\ub4dc\uc138\uc694</option>` + state.hierarchy
    .map((project) => `<option value="${escapeAttr(project.id)}">${escapeXml(cleanDisplayText(project.name, "\uc774\uc804 \ud504\ub85c\uc81d\ud2b8"))}</option>`)
    .join("");
  const project = state.hierarchy.find((item) => item.id === previousProject) || state.hierarchy[0] || null;
  projectSelect.value = project?.id || "";

  const previousCampaign = preferred.campaignId ?? campaignSelect.value;
  const campaigns = project?.campaigns || [];
  campaignSelect.innerHTML = `<option value="">\uc2e4\ud5d8 \ubc30\uce58\ub97c \uc120\ud0dd\ud558\uac70\ub098 \uc0c8\ub85c \ub9cc\ub4dc\uc138\uc694</option>` + campaigns
    .map((campaign) => `<option value="${escapeAttr(campaign.id)}">${escapeXml(cleanDisplayText(campaign.name, "\uc774\uc804 \uc2e4\ud5d8 \ubc30\uce58"))}</option>`)
    .join("");
  const campaign = campaigns.find((item) => item.id === previousCampaign) || campaigns[0] || null;
  campaignSelect.value = campaign?.id || "";

  const previousCell = preferred.cellRecordId ?? cellSelect.value;
  const cells = campaign?.cells || [];
  cellSelect.innerHTML = `<option value="">\uc140 ID\ub97c \uc785\ub825\ud558\uba74 \ub370\uc774\ud130 \uc800\uc7a5 \uc2dc \uc790\ub3d9 \ub4f1\ub85d\ub429\ub2c8\ub2e4</option>` + cells
    .map((cell) => `<option value="${escapeAttr(cell.id)}">${escapeXml(cleanDisplayText(cell.cellId, "\uc774\uc804 \uc140"))}${cell.sampleName ? ` \u00b7 ${escapeXml(cleanDisplayText(cell.sampleName, "\uc0d8\ud50c \uc815\ubcf4 \ud655\uc778"))}` : ""}</option>`)
    .join("");
  cellSelect.value = cells.some((item) => item.id === previousCell) ? previousCell : "";

  const selectedCell = selectedHierarchyCell(campaign);
  const previousDatasetGroup = preferred.datasetGroupId ?? datasetGroupSelect.value;
  const datasetGroups = selectedCell?.datasetGroups || [];
  datasetGroupSelect.innerHTML = `<option value="">Dataset \uc774\ub984\uc744 \uc785\ub825\ud558\uac70\ub098 \uae30\uc874 Dataset\uc744 \uc120\ud0dd\ud558\uc138\uc694</option>` + datasetGroups
    .map((group) => `<option value="${escapeAttr(group.id)}">${escapeXml(cleanDisplayText(group.name, "\uc774\uc804 Dataset"))}</option>`)
    .join("");
  datasetGroupSelect.value = datasetGroups.some((item) => item.id === previousDatasetGroup) ? previousDatasetGroup : "";

  const path = $("hierarchyPath");
  if (path) {
    const selectedGroup = selectedHierarchyDatasetGroup(selectedCell);
    path.textContent = [project?.name, campaign?.name, selectedCell?.cellId || "\uc140 \ubbf8\uc120\ud0dd", selectedGroup?.name || "Dataset \ubbf8\uc120\ud0dd"]
      .map((value) => cleanDisplayText(value, "\uc774\uc804 \uc800\uc7a5 \uc815\ubcf4"))
      .filter(Boolean)
      .join(" / ") || "\ud504\ub85c\uc81d\ud2b8\uc640 \uc2e4\ud5d8 \ubc30\uce58\ub97c \uba3c\uc800 \uc120\ud0dd\ud558\uc138\uc694.";
  }
}

function selectHierarchyForDataset(dataset) {
  if (!dataset || !state.hierarchy.length) return;
  renderHierarchyControls({
    projectId: dataset.projectId || "",
    campaignId: dataset.campaignId || "",
    cellRecordId: dataset.cellRecordId || "",
    datasetGroupId: dataset.datasetGroupId || "",
  });
}

async function createProjectFromInput() {
  const input = $("newProjectName");
  const name = input?.value.trim() || "";
  if (!name) return setStatus("\uc0c8 \ud504\ub85c\uc81d\ud2b8 \uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.");
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name, organizationId: $("projectOrganizationSelect")?.value || "" }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "\ud504\ub85c\uc81d\ud2b8 \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({ projectId: body.id });
  setStatus(`\ud504\ub85c\uc81d\ud2b8 '${body.name}'\ub97c \ub9cc\ub4e4\uc5c8\uc2b5\ub2c8\ub2e4.`);
}

async function createCampaignFromInput() {
  const project = selectedHierarchyProject();
  const input = $("newCampaignName");
  const name = input?.value.trim() || "";
  if (!project) return setStatus("\uba3c\uc800 \ud504\ub85c\uc81d\ud2b8\ub97c \uc120\ud0dd\ud558\uac70\ub098 \uc0c8\ub85c \ub9cc\ub4e4\uc5b4\uc8fc\uc138\uc694.");
  if (!name) return setStatus("\uc0c8 \uc2e4\ud5d8 \ubc30\uce58 \uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.");
  const res = await fetch(`/api/projects/${encodeURIComponent(project.id)}/campaigns`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "\uc2e4\ud5d8 \ubc30\uce58 \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({ projectId: project.id, campaignId: body.id });
  setStatus(`\uc2e4\ud5d8 \ubc30\uce58 '${body.name}'\ub97c \ub9cc\ub4e4\uc5c8\uc2b5\ub2c8\ub2e4.`);
}

async function createDatasetGroupFromInput() {
  const cell = selectedHierarchyCell();
  const input = $("newDatasetGroupName");
  const name = input?.value.trim() || "";
  if (!cell) return setStatus("\uba3c\uc800 \uae30\uc874 \uc140\uc744 \uc120\ud0dd\ud558\uac70\ub098, \uc0c8 \uc140\uc740 \ub370\uc774\ud130 \uc800\uc7a5 \uc2dc Dataset \uc774\ub984\uacfc \ud568\uaed8 \ub4f1\ub85d\ud574\uc8fc\uc138\uc694.");
  if (!name) return setStatus("\uc0c8 Dataset \uc774\ub984\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694.");
  const res = await fetch(`/api/cells/${encodeURIComponent(cell.id)}/dataset-groups`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  if (!res.ok) return setStatus(body.error || "Dataset \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  input.value = "";
  await loadHierarchy();
  renderHierarchyControls({
    projectId: cell.projectId,
    campaignId: cell.campaignId,
    cellRecordId: cell.id,
    datasetGroupId: body.id,
  });
  setStatus(`Dataset '${body.name}'\ub97c \ub9cc\ub4e4\uc5c8\uc2b5\ub2c8\ub2e4.`);
}

function applyFilters() {
  renderDateOptions();
  const selectedDate = $("savedDateSelect")?.value || "";
  const from = $("fromDate")?.value || "";
  const to = $("toDate")?.value || "";
  const q = ($("query")?.value || "").trim().toLowerCase();
  const type = state.searchType || "all";
  state.filtered = state.datasets.filter((d) => {
    const date = d.cell?.date || "";
    const hay = [d.cell?.cellId, d.cell?.sampleName, d.cell?.material, d.cell?.electrolyte, d.cell?.condition, d.cell?.notes, d.sourceName, d.dataType, hierarchyLabel(d)].join(" ").toLowerCase();
    return (!type || type === "all" || d.dataType === type) && (!selectedDate || date === selectedDate) && (!from || date >= from) && (!to || date <= to) && (!q || hay.includes(q));
  });
  if (!state.filtered.some((d) => d.id === state.selectedId)) state.selectedId = state.filtered[0]?.id || null;
  renderSelect();
  renderSavedList();
  renderSearchResults();
  renderCurrent();
}

function setSearchType(type = "all") {
  state.searchType = ["cyc", "cv", "eis"].includes(type) ? type : "all";
  document.querySelectorAll(".searchType").forEach((btn) => {
    btn.classList.toggle("active", (btn.dataset.searchType || "all") === state.searchType);
  });
}

function clearSearchFilters() {
  if ($("savedDateSelect")) $("savedDateSelect").value = "";
  if ($("fromDate")) $("fromDate").value = "";
  if ($("toDate")) $("toDate").value = "";
  if ($("query")) $("query").value = "";
  setSearchType("all");
  applyFilters();
}

function typeDisplay(type) {
  return { cyc: "CYC", cv: "CV", eis: "EIS", all: "\uc804\uccb4" }[type || "all"] || "DATA";
}

function renderSearchResults() {
  const list = $("searchResultList");
  if (!list) return;
  const count = $("searchResultCount");
  const scope = $("searchScopeLabel");
  if (count) count.textContent = `${state.filtered.length}\uac1c`;
  if (scope) scope.textContent = typeDisplay(state.searchType);
  document.querySelectorAll(".searchType").forEach((btn) => {
    btn.classList.toggle("active", (btn.dataset.searchType || "all") === (state.searchType || "all"));
  });
  if (!state.filtered.length) {
    list.innerHTML = `
      <div class="searchEmpty">
        <strong>\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</strong>
        <span>\ub0a0\uc9dc \ubc94\uc704\ub97c \ub113\ud788\uac70\ub098 \uc18c\uc7ac/\uc140 ID \uac80\uc0c9\uc5b4\ub97c \uc904\uc5ec\ubcf4\uc138\uc694.</span>
      </div>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const meta = [cell.date || "\ub0a0\uc9dc \uc5c6\uc74c", typeDisplay(d.dataType), `${datasetPointCount(d)} points`, displayUserName(d)].filter(Boolean).join(" \u00b7 ");
    const detail = [hierarchyLabel(d), cell.material, cell.sampleName, cell.condition, d.sourceName].filter(Boolean).join(" / ");
    return `
      <article class="searchResultCard${active}">
        <button type="button" class="searchResultOpen" data-dataset-id="${escapeAttr(d.id)}">
          <span class="resultType">${escapeXml(typeDisplay(d.dataType))}</span>
          <strong>${escapeXml(title)}</strong>
          <em>${escapeXml(meta)}</em>
          <p>${escapeXml(detail || "\uc800\uc7a5\ub41c \uc2e4\ud5d8 \ub370\uc774\ud130")}</p>
        </button>
        <div class="searchResultActions">
          <button type="button" data-open-figure="${escapeAttr(d.id)}">Fig \uc5f4\uae30</button>
          <button type="button" class="secondaryAction" data-open-saved="${escapeAttr(d.id)}">\ubaa8\uc74c\uc5d0\uc11c \ubcf4\uae30</button>
        </div>
      </article>`;
  }).join("");
  for (const btn of list.querySelectorAll("[data-dataset-id], [data-open-figure]")) {
    btn.addEventListener("click", () => {
      const id = btn.dataset.datasetId || btn.dataset.openFigure;
      const item = state.datasets.find((d) => d.id === id);
      state.selectedId = id;
      state.selectedAnnotation = null;
      if (item?.dataType && ["cyc", "cv", "eis"].includes(item.dataType)) state.activeFigureModule = item.dataType;
      renderSelect();
      renderSavedList();
      renderSearchResults();
      renderCurrent();
      activateView("figure", state.activeFigureModule);
      setStatus("\uac80\uc0c9 \uacb0\uacfc\ub97c Fig\ub85c \uc5f4\uc5c8\uc2b5\ub2c8\ub2e4.");
    });
  }
  for (const btn of list.querySelectorAll("[data-open-saved]")) {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.openSaved;
      state.selectedAnnotation = null;
      renderSelect();
      renderSavedList();
      renderSearchResults();
      renderCurrent();
      activateView("savedFigures");
      setStatus("\uac80\uc0c9 \uacb0\uacfc\ub97c Fig \ubaa8\uc74c\uc5d0\uc11c \uc5f4\uc5c8\uc2b5\ub2c8\ub2e4.");
    });
  }
}

function renderDateOptions() {
  const sel = $("savedDateSelect");
  if (!sel) return;
  const current = sel.value;
  const dates = [...new Set(state.datasets.map((d) => d.cell?.date).filter(Boolean))].sort().reverse();
  sel.innerHTML = `<option value="">\uc804\uccb4 \ub0a0\uc9dc</option>` + dates.map((date) => `<option value="${escapeAttr(date)}">${escapeXml(date)}</option>`).join("");
  sel.value = dates.includes(current) ? current : "";
}

function showDatasetImmediately(d) {
  if (!d) return;
  if ($("fromDate")) $("fromDate").value = "";
  if ($("toDate")) $("toDate").value = "";
  if ($("savedDateSelect")) $("savedDateSelect").value = "";
  if ($("query")) $("query").value = "";
  setSearchType("all");
  state.selectedId = d.id;
  state.filtered = state.datasets;
  renderSelect();
  renderSavedList();
  renderSearchResults();
  renderCurrent();
}

function renderSelect() {
  const sel = $("datasetSelect");
  if (!sel) return;
  sel.innerHTML = "";
  if (!state.filtered.length) {
    sel.innerHTML = `<option>\uac80\uc0c9 \uacb0\uacfc \uc5c6\uc74c</option>`;
    return;
  }
  for (const d of state.filtered) {
    const opt = document.createElement("option");
    opt.value = d.id;
    const owner = state.user?.role === "admin" ? ` | ${displayUserName(d)}` : "";
    opt.textContent = `${d.cell.date || "no date"} | ${d.cell.cellId || d.id} | ${d.cell.sampleName || d.cell.material || "EIS"}${owner}`;
    opt.selected = d.id === state.selectedId;
    sel.appendChild(opt);
  }
}

function datasetDisplayName(d) {
  return figureDatasetLabel(d);
}

function datasetPointCount(dataset) {
  const loadedCount = Array.isArray(dataset?.rows) ? dataset.rows.length : 0;
  const storedCount = Number(dataset?.rowCount);
  if (!Number.isFinite(storedCount) || storedCount < 0) return loadedCount;
  return Math.max(Math.round(storedCount), loadedCount);
}

function figureDatasetLabel(d) {
  const type = typeDisplay(d?.dataType);
  const sourceName = String(d?.sourceName || "").trim().replace(/\\/g, "/").split("/").pop();
  if (sourceName) return `${type} \u00b7 ${sourceName}`;
  const cell = d.cell || {};
  const fallback = cell.cellId || cell.sampleName || cell.material || String(d?.id || "Dataset").split("-").pop();
  return `${type} \u00b7 ${fallback}`;
}

/* Legacy duplicate renderSavedList renderer removed; the clean authoritative definition below is used. */

function figureLabel(d) {
  const labels = {
    "cycling-performance": "\uc6a9\ub7c9 \uc720\uc9c0\uc728 Fig",
    "voltage-profile": "\uc804\uc555/\uc804\ub958 Fig",
    "dqdv": "dQ/dV Fig",
    "cyc-combined": "\uc131\ub2a5 \ud14c\uc2a4\ud2b8 Fig",
    "nyquist": "Nyquist Fig",
    "bode": "Bode Fig",
    "eis-combined": "EIS \ud1b5\ud569 Fig",
    "cv-curve": "CV Fig",
    "cv-comparison": "CV \ube44\uad50 Fig",
    "table-preview": "\ud45c \ubbf8\ub9ac\ubcf4\uae30",
  };
  return labels[d.figureKind] || `${(d.dataType || "data").toUpperCase()} Fig`;
}

// Adapt persisted BDF columns and legacy imports only for display. Never
// rewrite the measured rows or turn missing measurements into zeroes.
function eisPlotRows(rows) {
  const measuredNumber = (value) => {
    if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return NaN;
    return Number(value);
  };
  return (rows || []).filter((row) => row && typeof row === "object").map((row) => {
    const frequency = measuredNumber(Object.hasOwn(row, "frequency_hz") ? row.frequency_hz : row.frequency);
    const zreal = measuredNumber(Object.hasOwn(row, "z_real_ohm") ? row.z_real_ohm : row.zreal);
    const zimag = measuredNumber(Object.hasOwn(row, "z_imag_ohm") ? row.z_imag_ohm : row.zimag);
    return { ...row, frequency, zreal, zimag, mag: Math.hypot(zreal, zimag), phase: Math.atan2(zimag, zreal) * 180 / Math.PI };
  }).filter((row) => Number.isFinite(row.frequency) && row.frequency > 0 && Number.isFinite(row.zreal) && Number.isFinite(row.zimag))
    .sort((left, right) => right.frequency - left.frequency);
}

function figureThumb(d) {
  const rows = (d.rows || []).filter(Boolean);
  const type = String(d.dataType || "").toLowerCase();
  if (!rows.length) {
    return `<svg class="savedThumb" viewBox="0 0 150 72" aria-hidden="true"><rect width="150" height="72" fill="#f8fafc"/><text x="75" y="39" text-anchor="middle" font-size="10" fill="#64748b">No data</text></svg>`;
  }
  let pts = [];
  if (type === "cyc") {
    pts = rows
      .map((r, i) => ({ x: Number.isFinite(r.cycle) ? r.cycle : i + 1, y: Number.isFinite(r.capacity) ? r.capacity : NaN }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  } else if (type === "eis") {
    pts = eisPlotRows(rows)
      .map((r) => ({ x: r.zreal, y: Math.abs(r.zimag) }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  } else {
    const keys = Object.keys(rows[0] || {}).filter((k) => Number.isFinite(rows[0][k]));
    const yKey = keys.find((k) => !/index|cycle/i.test(k)) || keys[0];
    pts = rows
      .map((r, i) => ({ x: i + 1, y: Number(r[yKey]) }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  }
  if (pts.length < 2) {
    return `<svg class="savedThumb" viewBox="0 0 150 72" aria-hidden="true"><rect width="150" height="72" fill="#f8fafc"/><text x="75" y="39" text-anchor="middle" font-size="10" fill="#64748b">${escapeXml(type.toUpperCase() || "FIG")}</text></svg>`;
  }
  const sampleEvery = Math.max(1, Math.floor(pts.length / 36));
  pts = pts.filter((_, i) => i % sampleEvery === 0 || i === pts.length - 1);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const sx = (x) => 12 + ((x - xmin) / (xmax - xmin || 1)) * 126;
  const sy = (y) => 58 - ((y - ymin) / (ymax - ymin || 1)) * 44;
  const path = pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const circles = pts.slice(0, 18).map((p) => `<circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="1.8"/>`).join("");
  return `
    <svg class="savedThumb" viewBox="0 0 150 72" aria-hidden="true">
      <rect width="150" height="72" fill="#ffffff"/>
      <line x1="12" y1="58" x2="138" y2="58" stroke="#111827" stroke-width="1"/>
      <line x1="12" y1="14" x2="12" y2="58" stroke="#111827" stroke-width="1"/>
      <path d="${path}" fill="none" stroke="#ec7dbf" stroke-width="2"/>
      <g fill="#fff" stroke="#ec7dbf" stroke-width="1.3">${circles}</g>
    </svg>`;
}

function renderSavedList() {
  const list = $("savedList");
  const count = $("savedCount");
  if (!list) return;
  if (count) count.textContent = `${state.filtered.length}\uac1c`;
  if (!state.filtered.length) {
    list.innerHTML = `<p class="emptySaved">\uc800\uc7a5\ub41c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const sub = [figureLabel(d), `${datasetPointCount(d)} points`, hierarchyLabel(d), displayUserName(d)].filter(Boolean).join(" \u00b7 ");
    return `
      <article class="savedItem${active}" data-dataset-id="${escapeAttr(d.id)}">
        <label class="compareCheck${String(d.dataType || "").toLowerCase() === "cyc" ? "" : " disabled"}" title="${String(d.dataType || "").toLowerCase() === "cyc" ? "CYC \ube44\uad50 \uc120\ud0dd" : "CYC Fig\ub9cc \ube44\uad50\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."}">
          <input type="checkbox" data-compare-id="${escapeAttr(d.id)}"${state.compareIds.includes(d.id) ? " checked" : ""}${String(d.dataType || "").toLowerCase() === "cyc" ? "" : " disabled"} />
          <span>\ube44\uad50</span>
        </label>
        <button type="button" class="savedOpen" data-dataset-id="${escapeAttr(d.id)}" title="Fig \uc5f4\uae30">
          ${figureThumb(d)}
          <span class="savedInfo">
            <strong>${escapeXml(title)}</strong>
            <span>${escapeXml(cell.date || "\ub0a0\uc9dc \uc5c6\uc74c")} \u00b7 ${escapeXml(sub)}</span>
            <em>${escapeXml(d.sourceName || d.id)}</em>
          </span>
        </button>
        <button type="button" class="savedDelete" data-dataset-id="${escapeAttr(d.id)}" title="\uc800\uc7a5\ub41c Fig \uc0ad\uc81c">\u00d7</button>
      </article>`;
  }).join("");
  for (const btn of list.querySelectorAll(".savedOpen")) {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.datasetId;
      state.selectedAnnotation = null;
      renderSelect();
      renderSavedList();
      renderCurrent();
      state.activeFigureModule = state.datasets.find((d) => d.id === state.selectedId)?.dataType || state.activeFigureModule;
      activateView("figure", state.activeFigureModule);
      setStatus("\uc800\uc7a5\ub41c Fig\ub97c \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.");
    });
  }
  for (const btn of list.querySelectorAll(".savedDelete")) {
    btn.addEventListener("click", (event) => deleteSavedFigure(btn.dataset.datasetId, event));
  }
  for (const input of list.querySelectorAll("input[data-compare-id]")) {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", () => toggleCompareSelection(input.dataset.compareId, input.checked));
  }
}

// The saved-Fig comparison UI uses this readable Korean render path.
// It overrides older generated labels that remain in legacy code above.
function renderSavedList() {
  const list = $("savedList");
  const count = $("savedCount");
  if (!list) return;
  if (count) count.textContent = `${state.filtered.length}\uac1c`;
  if (!state.filtered.length) {
    list.innerHTML = `<p class="emptySaved">\uc800\uc7a5\ub41c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>`;
    return;
  }
  list.innerHTML = state.filtered.map((d) => {
    const cell = d.cell || {};
    const active = d.id === state.selectedId ? " active" : "";
    const title = datasetDisplayName(d);
    const sub = [figureLabel(d), `${datasetPointCount(d)} points`, hierarchyLabel(d), displayUserName(d)].filter(Boolean).join(" \u00b7 ");
    const isCyc = String(d.dataType || "").toLowerCase() === "cyc";
    return `
      <article class="savedItem${active}" data-dataset-id="${escapeAttr(d.id)}">
        <label class="compareCheck${isCyc ? "" : " disabled"}" title="${isCyc ? "CYC \ube44\uad50 \uc120\ud0dd" : "CYC Fig\ub9cc \ube44\uad50\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."}">
          <input type="checkbox" data-compare-id="${escapeAttr(d.id)}"${state.compareIds.includes(d.id) ? " checked" : ""}${isCyc ? "" : " disabled"} />
          <span>\ube44\uad50</span>
        </label>
        <button type="button" class="savedOpen" data-dataset-id="${escapeAttr(d.id)}" title="Fig \uc5f4\uae30">
          ${figureThumb(d)}
          <span class="savedInfo">
            <strong>${escapeXml(title)}</strong>
            <span>${escapeXml(cell.date || "\ub0a0\uc9dc \uc5c6\uc74c")} \u00b7 ${escapeXml(sub)}</span>
            <em>${escapeXml(d.sourceName || d.id)}</em>
          </span>
        </button>
        <button type="button" class="savedDelete" data-dataset-id="${escapeAttr(d.id)}" title="\uc800\uc7a5\ub41c Fig \uc0ad\uc81c">\u00d7</button>
      </article>`;
  }).join("");
  for (const btn of list.querySelectorAll(".savedOpen")) {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.datasetId;
      state.selectedAnnotation = null;
      renderSelect();
      renderSavedList();
      renderCurrent();
      state.activeFigureModule = state.datasets.find((d) => d.id === state.selectedId)?.dataType || state.activeFigureModule;
      activateView("figure", state.activeFigureModule);
      setStatus("\uc800\uc7a5\ub41c Fig\ub97c \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.");
    });
  }
  for (const btn of list.querySelectorAll(".savedDelete")) {
    btn.addEventListener("click", (event) => deleteSavedFigure(btn.dataset.datasetId, event));
  }
  for (const input of list.querySelectorAll("input[data-compare-id]")) {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", () => toggleCompareSelection(input.dataset.compareId, input.checked));
  }
}

function toggleCompareSelection(id, checked) {
  if (!id) return;
  const target = state.datasets.find((d) => d.id === id);
  if (target?.dataType !== "cyc") {
    setStatus("CYC Fig\ub9cc \ube44\uad50\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.");
    return;
  }
  if (checked && !state.compareIds.includes(id)) state.compareIds.push(id);
  if (!checked) state.compareIds = state.compareIds.filter((x) => x !== id);
  setStatus(`${state.compareIds.length}\uac1c CYC Fig \uc120\ud0dd\ub428`);
}

function clearCompareSelection() {
  state.compareIds = [];
  renderSavedList();
  const preview = $("comparisonPreview");
  if (preview) {
    preview.classList.add("hidden");
    preview.innerHTML = "";
  }
  setStatus("\ube44\uad50 \uc120\ud0dd\uc744 \ud574\uc81c\ud588\uc2b5\ub2c8\ub2e4.");
}

const comparisonPalette = ["#0f766e", "#ef476f", "#3b82f6", "#f59e0b", "#7c3aed", "#64748b", "#10b981", "#dc2626"];

function comparisonColor(id, idx) {
  const fallback = comparisonPalette[idx % comparisonPalette.length];
  const color = normalizeHexColor(state.comparisonColors[id] || fallback, fallback);
  state.comparisonColors[id] = color;
  return color;
}

function comparisonRowsFromSeries(series) {
  return series.flatMap((s) => s.points.map((p) => ({
    sourceId: s.d?.id || s.sourceId || s.name,
    sourceName: s.name,
    cycle: p.x,
    capacity: p.y,
  })));
}

function seriesFromComparisonDataset(d) {
  const colors = d?.figureEdits?.comparisonColors || {};
  const groups = new Map();
  for (const row of d?.rows || []) {
    const key = row.sourceId || row.sourceName || "series";
    if (!groups.has(key)) groups.set(key, { sourceId: key, name: row.sourceName || key, points: [] });
    if (Number.isFinite(row.cycle) && Number.isFinite(row.capacity)) groups.get(key).points.push({ x: row.cycle, y: row.capacity });
  }
  return [...groups.values()].map((s, idx) => ({
    ...s,
    points: s.points.sort((a, b) => a.x - b.x),
    color: normalizeHexColor(colors[s.sourceId] || comparisonPalette[idx % comparisonPalette.length]),
  }));
}

function renderComparisonSvg(series, colorMap = {}, svgId = "comparisonFigure") {
  const normalized = series.map((s, idx) => ({
    ...s,
    color: normalizeHexColor(colorMap[s.d?.id || s.sourceId || s.name] || s.color || comparisonPalette[idx % comparisonPalette.length]),
  })).filter((s) => s.points?.length);
  const allPoints = normalized.flatMap((s) => s.points);
  const maxCycle = Math.max(...allPoints.map((p) => p.x));
  const xTickMax = Math.max(5, Math.ceil(maxCycle / 5) * 5);
  const maxCap = Math.max(...allPoints.map((p) => p.y), 1);
  const yMax = maxCap <= 180 ? 180 : Math.ceil(maxCap * 1.05 / 20) * 20;
  const svgW = 840, svgH = 520;
  const plot = { x: 82, y: 64, w: 560, h: 340 };
  const sx = makeScale([0, xTickMax], [plot.x, plot.x + plot.w]);
  const sy = makeScale([0, yMax], [plot.y + plot.h, plot.y]);
  const xTicks = Array.from({ length: Math.floor(xTickMax / 5) + 1 }, (_, i) => i * 5);
  const yStep = yMax <= 200 ? 20 : Math.max(20, Math.ceil(yMax / 6 / 20) * 20);
  const yTicks = Array.from({ length: Math.floor(yMax / yStep) + 1 }, (_, i) => i * yStep);
  const paths = normalized.map((s) => {
    const path = linePath(s.points, sx, sy);
    const pts = s.points.map((p) => `<circle cx="${sx(p.x).toFixed(2)}" cy="${sy(p.y).toFixed(2)}" r="3.7"/>`).join("");
    return `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="2"/><g fill="#fff" stroke="${s.color}" stroke-width="1.6">${pts}</g>`;
  }).join("");
  const legend = normalized.map((s, idx) => {
    const y = plot.y + 18 + idx * 24;
    return `<g><circle cx="${plot.x + plot.w + 38}" cy="${y}" r="4" fill="#fff" stroke="${s.color}" stroke-width="1.8"/><text x="${plot.x + plot.w + 50}" y="${y + 4}" class="cmpLegend">${escapeXml(s.name)}</text></g>`;
  }).join("");
  return `
    <svg id="${svgId}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .cmpAxis{stroke:#111;stroke-width:1.2;shape-rendering:crispEdges}.cmpGrid{stroke:#e8edf2;stroke-width:.7}
        .cmpTick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.cmpLabel{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
        .cmpTitle{font:700 18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.cmpLegend{font:12px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      </style>
      <rect width="${svgW}" height="${svgH}" fill="#fff"/>
      <text x="${plot.x}" y="34" class="cmpTitle">Discharge capacity comparison</text>
      <rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="none" class="cmpAxis"/>
      ${xTicks.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${plot.y + plot.h}" y2="${plot.y + plot.h - 8}" class="cmpAxis"/><text x="${sx(v)}" y="${plot.y + plot.h + 25}" text-anchor="middle" class="cmpTick">${v}</text>`).join("")}
      ${yTicks.map((v) => `<line x1="${plot.x}" x2="${plot.x + plot.w}" y1="${sy(v)}" y2="${sy(v)}" class="cmpGrid"/><line x1="${plot.x}" x2="${plot.x + 8}" y1="${sy(v)}" y2="${sy(v)}" class="cmpAxis"/><text x="${plot.x - 12}" y="${sy(v) + 4}" text-anchor="end" class="cmpTick">${v}</text>`).join("")}
      ${paths}
      <text x="${plot.x + plot.w / 2}" y="${plot.y + plot.h + 58}" text-anchor="middle" class="cmpLabel">Cycle number</text>
      <text transform="translate(${plot.x - 56},${plot.y + plot.h / 2}) rotate(-90)" text-anchor="middle" class="cmpLabel">Specific capacity (mAh g-1)</text>
      ${legend}
    </svg>`;
}

/* Legacy duplicate renderCycComparison renderer removed; the clean authoritative definition below is used. */

async function deleteSavedFigure(id, event) {
  if (event) event.stopPropagation();
  const target = state.datasets.find((d) => d.id === id);
  const name = target ? datasetDisplayName(target) : id;
  if (!id || !confirm(`\uc800\uc7a5\ub41c Fig "${name}"\ub97c \uc0ad\uc81c\ud560\uae4c\uc694?`)) return;
  const res = await fetch(`/api/datasets/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    setStatus(body.error || "Fig \uc0ad\uc81c \uc2e4\ud328");
    return;
  }
  state.datasets = state.datasets.filter((d) => d.id !== id);
  state.filtered = state.filtered.filter((d) => d.id !== id);
  state.compareIds = state.compareIds.filter((x) => x !== id);
  delete state.annotations[id];
  if (state.selectedId === id) state.selectedId = state.filtered[0]?.id || state.datasets[0]?.id || null;
  renderDateOptions();
  renderSelect();
  renderSavedList();
  renderCurrent();
  setStatus("\uc800\uc7a5\ub41c Fig\ub97c \uc0ad\uc81c\ud588\uc2b5\ub2c8\ub2e4.");
}

function niceBounds(values) {
  const finite = values.filter((v) => Number.isFinite(v));
  if (!finite.length) return [0, 1];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const span = max - min || Math.abs(max) || 1;
  let lower = min - span * 0.08;
  const upper = max + span * 0.08;
  if (min >= 0 && lower < 0) lower = 0;
  return [lower, upper];
}

function makeScale(domain, range) {
  const [d0, d1] = domain, [r0, r1] = range;
  return (v) => r0 + (v - d0) * (r1 - r0) / (d1 - d0 || 1);
}

function logScale(domain, range) {
  const [d0, d1] = domain.map((v) => Math.log10(Math.max(v, 1e-12)));
  const [r0, r1] = range;
  return (v) => r0 + (Math.log10(Math.max(v, 1e-12)) - d0) * (r1 - r0) / (d1 - d0 || 1);
}

function positiveLogBounds(values) {
  const finite = values.filter((v) => Number.isFinite(v) && v > 0);
  if (!finite.length) return [1, 10];
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const lower = 10 ** Math.floor(Math.log10(min));
  const upper = 10 ** Math.ceil(Math.log10(max));
  return lower === upper ? [lower / 10, upper * 10] : [lower, upper];
}

function logTicks(domain) {
  const start = Math.ceil(Math.log10(Math.max(domain[0], 1e-12)));
  const end = Math.floor(Math.log10(Math.max(domain[1], 1e-12)));
  const ticks = [];
  for (let exp = start; exp <= end; exp += 1) ticks.push(10 ** exp);
  return ticks.length ? ticks : [domain[0], domain[1]];
}

function formatLogTick(value) {
  const exp = Math.round(Math.log10(Math.max(value, 1e-12)));
  return `1e${exp}`;
}

function ticks(min, max, count = 5) {
  const step = (max - min) / (count - 1 || 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

function panel({ x, y, w, h, xlabel, ylabel, title, xDomain, yDomain, points, logX = false, logY = false, line = true, extra = "", showXTickLabels = true, showXLabel = true, yLabelOffset = 58, readableY = false }) {
  const sx = logX ? logScale(xDomain, [x, x + w]) : makeScale(xDomain, [x, x + w]);
  const sy = logY ? logScale(yDomain, [y + h, y]) : makeScale(yDomain, [y + h, y]);
  const path = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(" ");
  const circles = points.map((p) => `<circle cx="${sx(p.x).toFixed(2)}" cy="${sy(p.y).toFixed(2)}" r="3.2"/>`).join("");
  const xt = logX
    ? logTicks(xDomain)
    : ticks(xDomain[0], xDomain[1]);
  const yt = logY ? logTicks(yDomain) : readableY ? cycReadableAxisTicks(yDomain) : ticks(yDomain[0], yDomain[1]);
  if (readableY) yLabelOffset = Math.max(yLabelOffset, 1 + cycCapacityLabelOffset(yt.map(cycCapacityTickLabel)));
  return `
    <g class="plot">
      <text x="${x}" y="${y - 18}" class="panelTitle">${title}</text>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>
      ${xt.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${y}" y2="${y + h}" class="grid"/>${showXTickLabels ? `<text x="${sx(v)}" y="${y + h + 23}" class="tick" text-anchor="middle">${logX ? formatLogTick(v) : fmt(v, 3)}</text>` : ""}`).join("")}
      ${yt.map((v) => `<line x1="${x}" x2="${x + w}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/><text x="${x - 10}" y="${sy(v) + 4}" class="tick" text-anchor="end">${logY ? formatLogTick(v) : readableY ? cycCapacityTickLabel(v) : fmt(v, 3)}</text>`).join("")}
      <line x1="${x}" x2="${x + w}" y1="${y + h}" y2="${y + h}" class="axis"/>
      <line x1="${x}" x2="${x}" y1="${y}" y2="${y + h}" class="axis"/>
      ${line ? `<path d="${path}" class="seriesLine"/>` : ""}
      <g class="points">${circles}</g>
      ${extra}
      ${showXLabel ? `<text x="${x + w / 2}" y="${y + h + 54}" class="label" text-anchor="middle">${xlabel}</text>` : ""}
      <text transform="translate(${x - yLabelOffset},${y + h / 2}) rotate(-90)" class="label" text-anchor="middle">${ylabel}</text>
    </g>`;
}

function cleanNyquistBounds(points) {
  const xs = points.map((point) => point.x).filter(Number.isFinite);
  const ys = points.map((point) => point.y).filter(Number.isFinite);
  if (!xs.length || !ys.length) return { x: [0, 1], y: [0, 1] };
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xSpan = Math.max(xMax - xMin, Math.abs(xMax) * 0.08, 1e-9);
  const ySpan = Math.max(yMax - yMin, Math.abs(yMax) * 0.08, 1e-9);
  // Keep the data close to the axes. The previous forced square scale created
  // large negative margins and made the first high-frequency point ambiguous.
  const xLower = xMin >= 0 ? 0 : xMin - xSpan * 0.06;
  const yLower = yMin >= 0 ? 0 : yMin - ySpan * 0.06;
  return {
    x: [xLower, xMax + xSpan * 0.06],
    y: [yLower, yMax <= 0 ? 0 : yMax + ySpan * 0.08],
  };
}

function nyquistPanel({ x, y, w, h, title, xlabel, ylabel, points }) {
  const domains = cleanNyquistBounds(points);
  const resolvedDomains = resolveFigureAxisDomains(domains.x, domains.y, "eis");
  const sx = makeScale(resolvedDomains.x, [x, x + w]);
  const sy = makeScale(resolvedDomains.y, [y + h, y]);
  const xTicks = ticks(resolvedDomains.x[0], resolvedDomains.x[1]);
  const yTicks = ticks(resolvedDomains.y[0], resolvedDomains.y[1]);
  const path = linePath(points, sx, sy);
  const pointStep = Math.max(1, Math.ceil(points.length / 48));
  const visiblePoints = points.filter((_, index) => index % pointStep === 0 || index === points.length - 1);
  const pointMarkers = markerPoints(visiblePoints, sx, sy, "nyquistPoint", points.length > 90 ? 1.7 : 2.7);
  const startPoint = points.reduce((best, point) => {
    const pointFrequency = Number(point.frequency);
    const bestFrequency = Number(best?.frequency);
    if (!Number.isFinite(pointFrequency)) return best;
    if (!best || !Number.isFinite(bestFrequency) || pointFrequency > bestFrequency) return point;
    return best;
  }, points[0]);
  const startX = startPoint ? sx(startPoint.x) : 0;
  const startY = startPoint ? sy(startPoint.y) : 0;
  const startLabelX = Math.min(x + w - 54, startX + 10);
  const startLabelY = Math.max(y + 17, startY - 9);
  return `
    <g class="plot nyquistPlot">
      <text x="${x}" y="${y - 18}" class="panelTitle">${title}</text>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" class="nyquistFrame"/>
      ${xTicks.map((value) => `<line x1="${sx(value)}" x2="${sx(value)}" y1="${y}" y2="${y + h}" class="nyquistGrid"/><text x="${sx(value)}" y="${y + h + 23}" class="tick" text-anchor="middle">${fmt(value, 3)}</text>`).join("")}
      ${yTicks.map((value) => `<line x1="${x}" x2="${x + w}" y1="${sy(value)}" y2="${sy(value)}" class="nyquistGrid"/><text x="${x - 10}" y="${sy(value) + 4}" class="tick" text-anchor="end">${fmt(value, 3)}</text>`).join("")}
      <path d="${path}" class="nyquistLine"/>
      <g>${pointMarkers}</g>
      ${startPoint ? `<circle cx="${startX.toFixed(2)}" cy="${startY.toFixed(2)}" r="4.8" class="nyquistStart"/><text x="${startLabelX.toFixed(2)}" y="${startLabelY.toFixed(2)}" class="nyquistStartLabel">HF start</text>` : ""}
      <text x="${x + w / 2}" y="${y + h + 54}" class="label" text-anchor="middle">${xlabel}</text>
      <text transform="translate(${x - 58},${y + h / 2}) rotate(-90)" class="label" text-anchor="middle">${ylabel}</text>
    </g>`;
}

function renderEisFigure(d) {
  if (typeof EisDrt !== "undefined" && d.figureKind !== "bode") return EisDrt.render(d);
  const style = currentFigureStyle();
  syncFigureControls(style);
  const seriesColor = normalizeHexColor(style.seriesColor);
  // EIS needs a compact, wide canvas. Reusing the general paper preset made
  // the two Bode panels feel detached from the Nyquist plot and left a large
  // unused area below the figure.
  const compactEisSize = figureSvgSize(style, "eis");
  const svgSize = compactEisSize;
  const kind = ["eis-combined", "nyquist", "bode"].includes(d.figureKind) ? d.figureKind : "eis-combined";
  const rows = eisPlotRows(d.rows);
  if (!rows.length) {
    $("figureTitle").textContent = figureDatasetLabel(d);
    $("figureSubtitle").textContent = "0 points";
    $("metaGrid").innerHTML = "";
    $("figureCanvas").innerHTML = '<p class="empty" role="status">\uadf8\ub798\ud504\ub85c \ud45c\uc2dc\ud560 \uc218 \uc788\ub294 EIS \uce21\uc815\uac12\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uc8fc\ud30c\uc218(Hz), \uc2e4\uc218\ubd80(\u03a9), \ud5c8\uc218\ubd80(\u03a9) \uc5f4\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.</p>';
    return;
  }
  const negativeImaginary = rows.filter((row) => row.zimag < 0).length >= rows.filter((row) => row.zimag > 0).length;
  const nyquist = rows.map((row) => ({
    x: row.zreal,
    y: negativeImaginary ? -row.zimag : row.zimag,
    frequency: row.frequency,
  }));
  const bodeMag = rows.map((row) => ({ x: row.frequency, y: row.mag }));
  const bodePhase = rows.map((row) => ({ x: row.frequency, y: -row.phase }));
  const fDomain = positiveLogBounds(rows.map((row) => row.frequency));
  const magDomain = positiveLogBounds(rows.map((row) => row.mag));
  const phaseDomain = niceBounds(bodePhase.map((point) => point.y));
  const title = figureDatasetLabel(d);
  const nyquistTitle = kind === "nyquist" ? "Nyquist impedance" : "Nyquist plot";
  const nyquistYLabel = negativeImaginary ? "-Z'' / \u03a9" : "Z'' / \u03a9";
  const margin = 68;
  const panels = [];
  if (kind !== "bode") {
    const isOnlyNyquist = kind === "nyquist";
    const side = isOnlyNyquist
      ? Math.min(svgSize.w - margin * 2, svgSize.h - 228)
      : Math.max(300, Math.min(Math.round(svgSize.w * 0.45), Math.round(svgSize.h * 0.70)));
    const nx = isOnlyNyquist ? Math.round((svgSize.w - side) / 2) : margin;
    const ny = 110;
    panels.push(nyquistPanel({ x: nx, y: ny, w: side, h: side, title: nyquistTitle, xlabel: "Z' / \u03a9", ylabel: nyquistYLabel, points: nyquist }));
    if (!isOnlyNyquist) {
      const combinedPanelGap = 140;
      const bodeX = nx + side + combinedPanelGap;
      const bodeW = Math.max(230, svgSize.w - bodeX - margin);
      const bodeGap = 52;
      const bodeH = Math.max(132, Math.round((side - bodeGap) / 2));
      panels.push(panel({ x: bodeX, y: ny, w: bodeW, h: bodeH, xlabel: "Frequency / Hz", ylabel: "|Z| / \u03a9", title: "Bode magnitude", xDomain: fDomain, yDomain: magDomain, points: bodeMag, logX: true, logY: true, line: true, showXTickLabels: false, showXLabel: false, yLabelOffset: 40 }));
      panels.push(panel({ x: bodeX, y: ny + bodeH + bodeGap, w: bodeW, h: bodeH, xlabel: "Frequency / Hz", ylabel: "-Phase angle, -\u03b8 / deg", title: "Bode phase", xDomain: fDomain, yDomain: phaseDomain, points: bodePhase, logX: true, line: true, yLabelOffset: 40 }));
    }
  } else {
    const bodeW = svgSize.w - margin * 2;
    const bodeY = 116;
    const bodeGap = 62;
    const bodeH = Math.max(168, Math.round((svgSize.h - bodeY - 126 - bodeGap) / 2));
    panels.push(panel({ x: margin, y: bodeY, w: bodeW, h: bodeH, xlabel: "Frequency / Hz", ylabel: "|Z| / \u03a9", title: "Bode magnitude", xDomain: fDomain, yDomain: magDomain, points: bodeMag, logX: true, logY: true, line: true, showXTickLabels: false, showXLabel: false }));
    panels.push(panel({ x: margin, y: bodeY + bodeH + bodeGap, w: bodeW, h: bodeH, xlabel: "Frequency / Hz", ylabel: "-Phase angle, -\u03b8 / deg", title: "Bode phase", xDomain: fDomain, yDomain: phaseDomain, points: bodePhase, logX: true, line: true }));
  }
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} ${d.cell.material ? "\u00b7 " + d.cell.material : ""} ${rows.length} points`;
  $("metaGrid").innerHTML = [["Material", d.cell.material], ["Electrolyte", d.cell.electrolyte], ["Condition", d.cell.condition], ["Owner", d.ownerName || d.ownerId], ["Notes", d.cell.notes]].map(([key, value]) => `<div class="metaItem"><strong>${key}</strong>${isBadText(value) ? "-" : (value || "-")}</div>`).join("");
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .axis,.nyquistFrame{stroke:#1f2937;stroke-width:1.35}.grid{stroke:#e2e8f0;stroke-width:.9}.nyquistGrid{stroke:#94a3b8;stroke-width:.9;stroke-dasharray:2 6}
        .seriesLine{fill:none;stroke:${seriesColor};stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.points circle{fill:#fff;stroke:${seriesColor};stroke-width:1.65}
        .nyquistLine{fill:none;stroke:${seriesColor};stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}.nyquistPoint{fill:#fff;stroke:${seriesColor};stroke-width:1.25}
        .nyquistStart{fill:${seriesColor};stroke:#fff;stroke-width:1.8}.nyquistStartLabel{font:700 11px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:${seriesColor};paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round}
        .label{font:16px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.tick{font:12px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#475569}
        .panelTitle{font:700 18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.caption{font:14px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#64748b}
      </style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#ffffff"/>
      <text x="72" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="72" y="74" class="caption">${escapeXml(d.cell.date || "")} ${escapeXml(d.cell.condition || "")}</text>
      ${panels.join("")}
    </svg>`;
  applyAnnotationsToSvg();
}

const CYC_FIGURE_VIEW_OPTIONS = [
  { kind: "cycling-performance", label: "\uc131\ub2a5", detail: "capacity / efficiency vs cycle" },
  { kind: "voltage-profile", label: "\uc804\uc555 / \uc804\ub958", detail: "voltage-capacity and current behavior" },
  { kind: "dqdv", label: "dQ/dV", detail: "differential capacity vs voltage" },
];

function activeCycFigureViewKind(dataset) {
  const selected = state.cycFigureViewKinds[dataset?.id];
  if (CYC_FIGURE_VIEW_OPTIONS.some((option) => option.kind === selected)) return selected;
  return CYC_FIGURE_VIEW_OPTIONS.some((option) => option.kind === dataset?.figureKind)
    ? dataset.figureKind
    : "cycling-performance";
}

function renderCycFigureViewPicker(dataset, activeKind = "") {
  const picker = $("cycFigureViewPicker");
  if (!picker) return;
  picker.replaceChildren();
  if (!dataset || dataset.dataType !== "cyc" || dataset.rowsLoaded === false) {
    picker.hidden = true;
    return;
  }

  picker.hidden = false;
  const intro = document.createElement("div");
  intro.className = "cycFigureViewPickerIntro";
  const title = document.createElement("strong");
  title.textContent = "\uc6d0\ubcf8 \ub85c\uc6b0\ub370\uc774\ud130 \ubcf4\uae30";
  const hint = document.createElement("span");
  hint.textContent = "\uc800\uc7a5\ub41c \uc6d0\ubcf8 \ud589\uc73c\ub85c \ud604\uc7ac \ubcf4\uae30\ub9cc \ubc14\uafb8\uba70, \uc800\uc7a5\ub41c Fig\uc640 \ud45c\ub294 \ubcc0\uacbd\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.";
  intro.append(title, hint);

  const choices = document.createElement("div");
  choices.className = "cycFigureViewPickerChoices";
  for (const option of CYC_FIGURE_VIEW_OPTIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cycFigureViewPickerButton";
    button.dataset.cycFigureView = option.kind;
    button.setAttribute("aria-pressed", String(option.kind === activeKind));
    button.title = option.detail;
    button.textContent = option.label;
    choices.append(button);
  }
  picker.append(intro, choices);
}

function renderFigure(d) {
  renderCycFigureViewPicker(null);
  renderCycFigureElectrodeSummary(null);
  syncProfileSeriesControls(null);
  syncDqdvSeriesControls(null);
  if (!d) {
    $("figureCanvas").innerHTML = "";
    $("figureTitle").textContent = "\uc120\ud0dd\ud55c Dataset \uc5c6\uc74c";
    $("figureSubtitle").textContent = "\ub370\uc774\ud130\ub97c \ub4f1\ub85d\ud558\uac70\ub098 \uc120\ud0dd\ud558\uc138\uc694.";
    $("metaGrid").innerHTML = "";
    return;
  }
  if (d.rowsLoaded === false) {
    $("figureCanvas").innerHTML = `<p class="emptySaved">\uc120\ud0dd\ud55c Dataset\uc758 \uc6d0\uc2dc \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.</p>`;
    $("figureTitle").textContent = figureDatasetLabel(d);
    $("figureSubtitle").textContent = "\uc6d0\uc2dc \ub370\uc774\ud130 \ub85c\ub529 \uc911";
    $("metaGrid").innerHTML = "";
    return;
  }
  if (d.dataType === "cyc-comparison") return renderSavedCycComparison(d);

  // Saved API responses keep their editable raw columns. Rebuild a temporary
  // CYC view at render time so a figure setting or cell edit cannot erase the
  // capacity series from an already parsed WRD file.
  if (d.dataType === "cyc") {
    const normalized = normalizeSavedCycDataset(d);
    const figureKind = activeCycFigureViewKind(normalized);
    renderCycFigureElectrodeSummary(normalized);
    renderCycFigureViewPicker(normalized, figureKind);
    return renderCycFigure({ ...normalized, figureKind });
  }
  if (d.dataType === "cv") return renderCvFigure(d);
  if (d.dataType === "eis") return renderEisFigure(d);
  const style = currentFigureStyle();
  syncFigureControls(style);
  const svgSize = figureSvgSize(style, "paper");
  const eisPlot = {
    nyquist: {
      x: Math.max(76, Math.round(svgSize.w * 0.085)),
      y: Math.max(110, Math.round(svgSize.h * 0.16)),
      w: Math.max(300, Math.round(svgSize.w * 0.38)),
      h: Math.max(300, Math.round(svgSize.h * 0.52)),
    },
    bodeX: Math.max(430, Math.round(svgSize.w * 0.59)),
    bodeW: Math.max(260, Math.round(svgSize.w * 0.32)),
    bodeH: Math.max(150, Math.round(svgSize.h * 0.23)),
  };
  const rows = [...d.rows]
    .map((r) => {
      const frequency = Number(r.frequency);
      const zreal = Number(r.zreal);
      const zimag = Number(r.zimag);
      return {
        ...r,
        frequency,
        zreal,
        zimag,
        mag: Math.hypot(zreal, zimag),
        phase: Math.atan2(zimag, zreal) * 180 / Math.PI,
      };
    })
    .filter((r) => Number.isFinite(r.frequency) && r.frequency > 0 && Number.isFinite(r.zreal) && Number.isFinite(r.zimag))
    .sort((a, b) => b.frequency - a.frequency);
  const ny = rows.map((r) => ({ x: r.zreal, y: -r.zimag }));
  const bodeMag = rows.map((r) => ({ x: r.frequency, y: r.mag }));
  const bodePhase = rows.map((r) => ({ x: r.frequency, y: -r.phase }));
  const xNy = niceBounds(ny.map((p) => p.x));
  const yNy = niceBounds(ny.map((p) => p.y));
  const fDomain = [Math.min(...rows.map((r) => r.frequency)), Math.max(...rows.map((r) => r.frequency))];
  const magDomain = positiveLogBounds(rows.map((r) => r.mag));
  const phaseDomain = niceBounds(bodePhase.map((p) => p.y));
  const title = figureDatasetLabel(d);
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} ${d.cell.material ? "\u00b7 " + d.cell.material : ""} ${d.rows.length} points`;
  $("metaGrid").innerHTML = [
    ["Material", d.cell.material],
    ["Electrolyte", d.cell.electrolyte],
    ["Condition", d.cell.condition],
    ["Owner", d.ownerName || d.ownerId],
    ["Notes", d.cell.notes],
  ].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .axis{stroke:#111827;stroke-width:1.6}.grid{stroke:#e5e7eb;stroke-width:1}
        .seriesLine{fill:none;stroke:#0f766e;stroke-width:2.4}.points circle{fill:#fff;stroke:#0f766e;stroke-width:1.8}
        .label{font:18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.tick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#374151}
        .panelTitle{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.caption{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#4b5563}
      </style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#ffffff"/>
      <text x="72" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="72" y="74" class="caption">${escapeXml(d.cell.date || "")} ${escapeXml(d.cell.condition || "")}</text>
      ${panel({ x: eisPlot.nyquist.x, y: eisPlot.nyquist.y, w: eisPlot.nyquist.w, h: eisPlot.nyquist.h, xlabel: "Z' / \u03a9", ylabel: "-Z'' / \u03a9", title: "Nyquist plot", xDomain: xNy, yDomain: yNy, points: ny, line: false })}
      ${panel({ x: eisPlot.bodeX, y: eisPlot.nyquist.y, w: eisPlot.bodeW, h: eisPlot.bodeH, xlabel: "Frequency / Hz", ylabel: "|Z| / \u03a9", title: "Bode magnitude", xDomain: fDomain, yDomain: magDomain, points: bodeMag, logX: true, logY: true, line: false })}
      ${panel({ x: eisPlot.bodeX, y: Math.round(svgSize.h * 0.58), w: eisPlot.bodeW, h: eisPlot.bodeH, xlabel: "Frequency / Hz", ylabel: "-Phase angle, -\u03b8 / deg", title: "Bode phase", xDomain: fDomain, yDomain: phaseDomain, points: bodePhase, logX: true, line: false })}
    </svg>`;
  applyAnnotationsToSvg();
}

function renderLegacyCycFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const svgSize = figureSvgSize(style, "paper");
  const rows = d.rows.filter((r) => Number.isFinite(r.cycle));
  const title = figureDatasetLabel(d);
  const capRows = rows.filter((r) => Number.isFinite(r.capacity));
  const effRows = rows.filter((r) => Number.isFinite(r.efficiency));
  const voltRows = rows.filter((r) => Number.isFinite(r.voltage) && (Number.isFinite(r.capacity) || Number.isFinite(r.time)));
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} \u00b7 CYC \u00b7 ${d.rows.length} points`;
  $("metaGrid").innerHTML = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Owner", displayUserName(d)], ["Source", d.sourceName]].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  const panels = [];
  if (d.figureKind !== "voltage-profile" && capRows.length) {
    const domains = resolveFigureAxisDomains(
      niceBounds(capRows.map((r) => r.cycle)),
      niceBounds(capRows.map((r) => r.capacity)),
      "performance",
    );
    panels.push(panel({ x: 95, y: 130, w: 420, h: 390, xlabel: "Cycle number", ylabel: "Capacity (mAh g-1)", title: "Cycling performance", xDomain: domains.x, yDomain: domains.y, points: capRows.map((r) => ({ x: r.cycle, y: r.capacity })) }));
  }
  if (d.figureKind !== "voltage-profile" && effRows.length) {
    panels.push(panel({ x: 620, y: 130, w: 380, h: 390, xlabel: "Cycle number", ylabel: "Efficiency (%)", title: "Coulombic efficiency", xDomain: niceBounds(effRows.map((r) => r.cycle)), yDomain: niceBounds(effRows.map((r) => r.efficiency)), points: effRows.map((r) => ({ x: r.cycle, y: r.efficiency })) }));
  }
  if ((d.figureKind === "voltage-profile" || d.figureKind === "cyc-combined" || !panels.length) && voltRows.length) {
    const xKey = voltRows.some((r) => Number.isFinite(r.capacity)) ? "capacity" : "time";
    const domains = resolveFigureAxisDomains(
      niceBounds(voltRows.map((r) => r[xKey])),
      niceBounds(voltRows.map((r) => r.voltage)),
      "voltage",
    );
    panels.push(panel({ x: 95, y: panels.length ? 530 : 130, w: panels.length ? 905 : 760, h: panels.length ? 140 : 390, xlabel: xKey === "capacity" ? "Capacity (mAh g-1)" : "Time", ylabel: "Voltage (V)", title: "Voltage profile", xDomain: domains.x, yDomain: domains.y, points: voltRows.map((r) => ({ x: r[xKey], y: r.voltage })) }));
  }
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      <style>.axis{stroke:#111827;stroke-width:1.6}.grid{stroke:#e5e7eb;stroke-width:1}.seriesLine{fill:none;stroke:#0f766e;stroke-width:2.4}.points circle{fill:#fff;stroke:#0f766e;stroke-width:1.8}.label{font:18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.tick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#374151}.panelTitle{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.caption{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#4b5563}</style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#ffffff"/>
      <text x="72" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="72" y="74" class="caption">CYC \u00b7 ${escapeXml(d.cell.condition || "")}</text>
      ${panels.join("")}
    </svg>`;
}

function cleanDomain(values, pad = 0.08) {
  const nums = values.filter(Number.isFinite);
  if (!nums.length) return [0, 1];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || Math.max(Math.abs(max), 1);
  return [min - span * pad, max + span * pad];
}

function axisTicks(domain, count = 6) {
  const [a, b] = domain;
  const step = (b - a) / (count - 1 || 1);
  return Array.from({ length: count }, (_, i) => a + step * i);
}

function integerTicks(min, max, count = 6) {
  const start = Math.max(0, Math.floor(min));
  const end = Math.ceil(max);
  if (end <= start) return [start];
  const span = end - start;
  const step = span >= 15 ? 5 : Math.max(1, Math.ceil(span / (count - 1)));
  const out = [];
  for (let v = start; v <= end; v += step) out.push(v);
  if (out[out.length - 1] !== end) out.push(end);
  return out;
}

function linePath(points, sx, sy) {
  return points.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(" ");
}

function markerPoints(points, sx, sy, cls, r = 4) {
  return points.map((p) => `<circle class="${cls}" cx="${sx(p.x).toFixed(2)}" cy="${sy(p.y).toFixed(2)}" r="${r}"/>`).join("");
}

function median(nums) {
  const arr = nums.filter(Number.isFinite).sort((a, b) => a - b);
  if (!arr.length) return NaN;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function dischargeSeries(rows) {
  // A CYC export can contain many point-level measurements for the same cycle.
  // Keep the final (largest) discharge capacity once per cycle so the figure
  // cannot turn repeated raw rows into a vertical band of overlapping markers.
  const finalCapacityByCycle = new Map();
  for (const row of rows || []) {
    const cycle = Number(row?.cycle);
    if (row?.capacity == null || typeof row.capacity === "boolean"
      || (typeof row.capacity === "string" && !row.capacity.trim())) continue;
    const capacity = Number(row?.capacity);
    if (!Number.isFinite(cycle) || cycle < 1 || !Number.isFinite(capacity)) continue;
    const wholeCycle = Math.round(cycle);
    if (Math.abs(cycle - wholeCycle) > 1e-6) continue;
    const point = { x: wholeCycle, y: capacity };
    const previous = finalCapacityByCycle.get(wholeCycle);
    if (!previous || point.y > previous.y) finalCapacityByCycle.set(wholeCycle, point);
  }
  const raw = [...finalCapacityByCycle.values()].sort((a, b) => a.x - b.x);
  // Capacity already has the unit declared by its source column. Do not use
  // its magnitude as a unit guess: a valid Ah trace is often below 10.
  const med = median(raw.map((p) => Math.abs(p.y)).filter((v) => v > 0));
  const upper = Number.isFinite(med) ? Math.max(250, med * 2.2) : Infinity;
  const lower = Number.isFinite(med) ? med * 0.05 : 0;
  return raw.filter((p) => p.y >= lower && p.y <= upper);
}

function formatCRateLabel(token) {
  const clean = String(token || "")
    .trim()
    .replace(/^rate/i, "")
    .replace(/^re[\s_-]?/i, "re ")
    .replace(/_/g, ".");
  const match = clean.match(/^(re)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (!match) return "";
  const value = Number(match[2]);
  if (!Number.isFinite(value) || value <= 0 || value > 10) return "";
  const prefix = match[1] ? "re " : "";
  return `${prefix}${value.toString()} C`;
}

function hasStandardRateLadder(text) {
  const compact = String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, ".");
  const variants = [
    "0.1,0.33,1,2,3,4,re0.33",
    "0.1,0.33.1.2.3.4.re0.33",
    "0.1.0.33.1.2.3.4.re0.33",
  ];
  if (variants.some((pattern) => compact.includes(pattern))) return true;
  return /0\.1.*0\.33.*(?:^|[,.(-])1(?:[,.)-]|$).*2.*3.*4.*re0\.33/.test(compact);
}

function tokenizeCRateBlock(block) {
  let text = String(block || "").toLowerCase();
  if (hasStandardRateLadder(text)) return defaultRateLabels(7);
  text = text
    .replace(/re\s*0[_-]33/g, "re0.33")
    .replace(/0[_-]33/g, "0.33")
    .replace(/0[_-]1/g, "0.1")
    .replace(/[()[\]{}]/g, " ");
  const matches = text.match(/re\s*[0-9]+(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?/gi) || [];
  const labels = matches.map(formatCRateLabel).filter(Boolean);
  return labels.filter((label, idx) => idx === 0 || label !== labels[idx - 1]);
}

function parseCRateLabels(d) {
  const text = [d.sourceName, d.cell?.condition, d.cell?.notes].filter(Boolean).join(" ");
  if (hasStandardRateLadder(text)) return defaultRateLabels(7);
  const candidates = [];
  const parenBlocks = [...text.matchAll(/\(([^)]*(?:re|0[._-]1|0[._-]33|,\s*1\s*,)[^)]*)\)/gi)].map((m) => m[1]);
  candidates.push(...parenBlocks);

  const commonPattern = /0[._-]1[,_\s-]+0[._-]33[,_\s-]+1[,_\s-]+2[,_\s-]+3[,_\s-]+4[,_\s-]+re\s*0[._-]33/i;
  const common = text.match(commonPattern);
  if (common) candidates.push(common[0]);

  const beforeCyc = text.match(/([0-9reRE.,_\s-]{12,})[._-]*cyc/i);
  if (beforeCyc) candidates.push(beforeCyc[1]);

  for (const block of candidates) {
    let labels = tokenizeCRateBlock(block);
    // WBCS names can put a cell/sample number between the electrode mass and
    // the first rate, for example `0.0511392g_4_0.33_1_re0.33`.  When a
    // fractional C-rate exists, values before it are identifiers, not rates.
    const firstFractionalRate = labels.findIndex((label) => {
      const value = Number(String(label).replace(/^re\s+/i, "").replace(/\s*C$/i, ""));
      return Number.isFinite(value) && value > 0 && value < 1;
    });
    if (firstFractionalRate > 0) labels = labels.slice(firstFractionalRate);
    const start = labels.findIndex((label, idx) => {
      const next = labels[idx + 1];
      return label === "0.1 C" && next === "0.33 C";
    });
    if (start >= 0) labels = labels.slice(start);
    if (labels.length >= 2) return labels.slice(0, 8);
  }
  return [];
}

function defaultRateLabels(count) {
  const base = ["0.1 C", "0.33 C", "1 C", "2 C", "3 C", "4 C", "re 0.33 C"];
  if (count <= base.length) return base.slice(0, count);
  return base;
}

function fiveCycleSegments(labels, minCycle, maxCycle) {
  if (!labels.length) return [];
  const startCycle = Math.max(1, Math.floor(minCycle));
  return labels.map((label, idx) => ({
    label,
    start: startCycle + idx * 5,
    end: startCycle + idx * 5 + 4,
  })).filter((s) => s.start <= maxCycle);
}

function hasRateStepPattern(capPts, segments) {
  if (segments.length < 2 || capPts.length < 8) return false;
  const means = segments.map((s) => {
    const values = capPts.filter((p) => p.x >= s.start && p.x <= s.end).map((p) => p.y);
    return average(values);
  }).filter(Number.isFinite);
  if (means.length < Math.min(3, segments.length)) return false;
  const spread = Math.max(...means) - Math.min(...means);
  const baseline = Math.max(1, Math.max(...means));
  return spread >= 25 || spread / baseline >= 0.18;
}

function formatExplicitCRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate <= 0) return "";
  return `${Number(rate.toFixed(4)).toString()} C`;
}

function explicitCRateValues(rows) {
  const values = new Map();
  for (const row of rows || []) {
    const rate = parseCRateValue(row?.cRate ?? row?.c_rate);
    if (!Number.isFinite(rate)) continue;
    values.set(rate.toFixed(4), rate);
  }
  return [...values.values()].sort((a, b) => a - b);
}

// When the source file has a C-rate column, it is more reliable than a filename
// convention or an inferred current ratio. Group consecutive cycles by that value.
function explicitCRateSegments(rows, minCycle, maxCycle) {
  const ratesByCycle = new Map();
  for (const row of rows || []) {
    const cycle = Number(row?.cycle);
    const rate = parseCRateValue(row?.cRate ?? row?.c_rate);
    if (!Number.isFinite(cycle) || !Number.isFinite(rate) || cycle < minCycle || cycle > maxCycle) continue;
    const key = Math.round(cycle);
    const values = ratesByCycle.get(key) || [];
    values.push(rate);
    ratesByCycle.set(key, values);
  }
  const points = [...ratesByCycle.entries()]
    .map(([cycle, values]) => ({ cycle: Number(cycle), rate: average(values) }))
    .filter((point) => Number.isFinite(point.rate))
    .sort((a, b) => a.cycle - b.cycle);
  const groups = [];
  for (const point of points) {
    const previous = groups[groups.length - 1];
    const isConsecutive = previous && point.cycle <= previous.end + 1;
    const sameRate = previous && Math.abs(point.rate - previous.rate) / Math.max(previous.rate, 1e-12) <= 0.02;
    if (!previous || !isConsecutive || !sameRate) {
      groups.push({ start: point.cycle, end: point.cycle, rate: point.rate, count: 1 });
      continue;
    }
    previous.rate = (previous.rate * previous.count + point.rate) / (previous.count + 1);
    previous.count += 1;
    previous.end = point.cycle;
  }
  const distinctRates = new Set(groups.map((group) => group.rate.toFixed(4)));
  if (groups.length < 2 || groups.length > 12 || distinctRates.size < 2) return [];
  return groups.map((group) => ({
    start: group.start,
    end: group.end,
    cRate: group.rate,
    label: formatExplicitCRate(group.rate),
  }));
}

function inferCRateSegments(d, rows, capPts) {
  const cycles = [...new Set(capPts.map((p) => p.x).filter(Number.isFinite))].sort((a, b) => a - b);
  if (!cycles.length) return [];
  const minCycle = Math.min(...cycles);
  const maxCycle = Math.max(...cycles);
  const explicitSegments = explicitCRateSegments(rows, minCycle, maxCycle);
  if (explicitSegments.length >= 2) return explicitSegments;
  const parsedLabels = parseCRateLabels(d);
  const parsedSegments = fiveCycleSegments(parsedLabels, minCycle, maxCycle);
  if (hasRateStepPattern(capPts, parsedSegments)) return parsedSegments;

  const currentRows = rows.filter((r) => Number.isFinite(r.cycle) && Number.isFinite(r.current) && r.current !== 0);
  if (currentRows.length >= 2) {
    const sorted = currentRows.sort((a, b) => a.cycle - b.cycle);
    const ref = Math.min(...sorted.map((r) => Math.abs(r.current)).filter((v) => v > 0));
    const groups = [];
    for (const r of sorted) {
      const c = Math.abs(r.current);
      const last = groups[groups.length - 1];
      if (!last || Math.abs(c - last.current) / Math.max(last.current, 1e-12) > 0.08) {
        groups.push({ start: r.cycle, end: r.cycle, current: c });
      } else {
        last.end = r.cycle;
        last.current = (last.current + c) / 2;
      }
    }
    const currents = groups.map((g) => g.current).filter((v) => v > 0);
    const ratio = currents.length ? Math.max(...currents) / Math.min(...currents) : 1;
    const currentSegments = groups
      .filter((g) => g.end >= g.start)
      .map((g, idx) => ({ ...g, label: parsedLabels[idx] || `${fmt(g.current / ref, 2)} C` }));
    if (currentSegments.length >= 2 && currentSegments.length <= 8 && ratio >= 1.3 && hasRateStepPattern(capPts, currentSegments)) {
      return currentSegments;
    }
  }

  return [];
}

// Only draw C-rate guide lines for complete, displayed cycle ranges.  A raw
// cycler export can contain fractional/duplicate cycle records; using those
// directly would pile guide lines and labels on top of the y-axis.
function cRateFigureSegments(segments, capPts) {
  const observedCycles = [...new Set((capPts || [])
    .map((point) => Math.round(Number(point?.x)))
    .filter((cycle) => Number.isFinite(cycle) && cycle >= 1))]
    .sort((a, b) => a - b);
  if (observedCycles.length < 2) return [];

  const minCycle = observedCycles[0];
  const maxCycle = observedCycles[observedCycles.length - 1];
  const visibleSegments = [];
  for (const segment of segments || []) {
    const start = Math.max(minCycle, Math.ceil(Number(segment?.start)));
    const end = Math.min(maxCycle, Math.floor(Number(segment?.end)));
    const coveredCycles = observedCycles.filter((cycle) => cycle >= start && cycle <= end);
    const previous = visibleSegments[visibleSegments.length - 1];
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start || coveredCycles.length < 2) continue;
    if (previous && start <= previous.end) continue;
    visibleSegments.push({ ...segment, start, end });
    if (visibleSegments.length === 8) break;
  }
  return visibleSegments;
}

function rateAnnotations(segments, ax, xDomain, opts = {}) {
  const [plotMin, plotMax] = xDomain;
  const plotY = opts.plotY ?? 130;
  const plotBottom = opts.plotBottom ?? 520;
  const bandY = opts.bandY ?? 102;
  const bandHeight = opts.bandHeight ?? 24;
  const labelY = opts.labelY ?? 119;
  return segments.map((s, idx) => {
    const leftBoundary = idx ? segments[idx - 1].end : plotMin;
    const rightBoundary = s.end;
    const x1 = ax.sx(Math.max(plotMin, leftBoundary));
    const x2 = ax.sx(Math.min(plotMax, rightBoundary));
    const cx = (x1 + x2) / 2;
    const line = idx ? `<line x1="${x1.toFixed(2)}" x2="${x1.toFixed(2)}" y1="${plotY + 1}" y2="${plotBottom - 10}" class="rateLine"/>` : "";
    return `
      <rect x="${x1.toFixed(2)}" y="${bandY}" width="${Math.max(0, x2 - x1).toFixed(2)}" height="${bandHeight}" class="${idx % 2 ? "rateBandAlt" : "rateBand"}"/>
      ${line}
      <text x="${cx.toFixed(2)}" y="${labelY}" class="rateLabel" text-anchor="middle">${escapeXml(s.label)}</text>`;
  }).join("");
}

function currentAnnotations() {
  if (!state.selectedId) return [];
  if (!state.annotations[state.selectedId]) {
    const d = state.datasets.find((x) => x.id === state.selectedId);
    const saved = d?.figureEdits?.annotations;
    state.annotations[state.selectedId] = Array.isArray(saved)
      ? saved.map((a) => ({ text: String(a.text || ""), x: Number(a.x) || 0, y: Number(a.y) || 0, size: clampFontSize(a.size) }))
      : [];
  }
  return state.annotations[state.selectedId];
}

function currentLayoutEdits() {
  if (!state.selectedId) return {};
  const d = state.datasets.find((x) => x.id === state.selectedId);
  const saved = d?.figureEdits?.layout;
  if (!state.layoutEdits) state.layoutEdits = {};
  if (!state.layoutEdits[state.selectedId]) {
    state.layoutEdits[state.selectedId] = saved && typeof saved === "object" ? { ...saved } : {};
  }
  return state.layoutEdits[state.selectedId];
}

function normalizeHexColor(value, fallback = "#0f766e") {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : fallback;
}

function lightenHexColor(hex, amount = 0.72) {
  const color = normalizeHexColor(hex).slice(1);
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  const mix = (v) => Math.round(v + (255 - v) * amount).toString(16).padStart(2, "0");
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

function normalizeFigureAspectRatio(value) {
  return ["journal", "wide", "square", "portrait"].includes(value) ? value : "journal";
}

function normalizeFigureMarkerSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size)) return 4;
  return Math.max(2, Math.min(10, Math.round(size)));
}

const FIGURE_AXIS_RANGE_KEYS = ["performance", "voltage", "dqdv", "eis", "cv"];

function normalizeAxisRangeValue(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeFigureAxisRange(value) {
  return {
    xMin: normalizeAxisRangeValue(value?.xMin),
    xMax: normalizeAxisRangeValue(value?.xMax),
    yMin: normalizeAxisRangeValue(value?.yMin),
    yMax: normalizeAxisRangeValue(value?.yMax),
  };
}

function normalizeFigureAxisRanges(value) {
  return Object.fromEntries(
    FIGURE_AXIS_RANGE_KEYS.map((key) => [key, normalizeFigureAxisRange(value?.[key])]),
  );
}

function resolveFigureAxisDomains(autoX, autoY, key) {
  const range = normalizeFigureAxisRange(currentFigureStyle().axisRanges?.[key]);
  const xDomain = [range.xMin ?? autoX[0], range.xMax ?? autoX[1]];
  const yDomain = [range.yMin ?? autoY[0], range.yMax ?? autoY[1]];
  return {
    x: xDomain[0] < xDomain[1] ? xDomain : autoX,
    y: yDomain[0] < yDomain[1] ? yDomain : autoY,
  };
}

function selectedFigureAxisRangeTarget() {
  const target = $("figureAxisRangeTarget")?.value || "performance";
  return FIGURE_AXIS_RANGE_KEYS.includes(target) ? target : "performance";
}

function syncFigureAxisRangeControls(style = currentFigureStyle()) {
  const range = normalizeFigureAxisRange(style.axisRanges?.[selectedFigureAxisRangeTarget()]);
  const values = {
    figureXMin: range.xMin,
    figureXMax: range.xMax,
    figureYMin: range.yMin,
    figureYMax: range.yMax,
  };
  Object.entries(values).forEach(([id, value]) => {
    const input = $(id);
    if (input) input.value = value === null ? "" : String(value);
  });
}

function figureSvgSize(style, kind = "paper") {
  const ratio = normalizeFigureAspectRatio(style?.aspectRatio);
  const presets = kind === "rate"
    ? {
      journal: { w: 640, h: 480 },
      wide: { w: 760, h: 428 },
      square: { w: 560, h: 560 },
      portrait: { w: 520, h: 650 },
    }
    : kind === "eis"
      ? {
        // Combined EIS figures are naturally landscape: Nyquist uses a square
        // panel while the two Bode panels share its height on the right.
        journal: { w: 1080, h: 650 },
        wide: { w: 1240, h: 620 },
        square: { w: 860, h: 780 },
        portrait: { w: 720, h: 850 },
      }
    : {
      journal: { w: 1120, h: 840 },
      wide: { w: 1280, h: 720 },
      square: { w: 900, h: 900 },
      portrait: { w: 760, h: 950 },
    };
  return presets[ratio] || presets.journal;
}

function syncFigureControls(style = currentFigureStyle()) {
  const colorInput = $("figureSeriesColor");
  const ratioInput = $("figureAspectRatio");
  const gridInput = $("figureShowGrid");
  const connectInput = $("figureConnectPoints");
  const markerInput = $("figureMarkerSize");
  if (colorInput) colorInput.value = normalizeHexColor(style.seriesColor || "#0f766e");
  if (ratioInput) ratioInput.value = normalizeFigureAspectRatio(style.aspectRatio);
  if (gridInput) gridInput.checked = style.showGrid !== false;
  if (connectInput) connectInput.checked = style.connectPoints !== false;
  if (markerInput) markerInput.value = normalizeFigureMarkerSize(style.markerSize);
  syncFigureAxisRangeControls(style);
  syncProfileSeriesControls(null);
  syncDqdvSeriesControls(null);
}

function currentFigureStyle() {
  if (!state.selectedId) return { seriesColor: "#0f766e", rateColorOverrides: {}, seriesColorOverrides: {}, dqdvSeriesColorOverrides: {}, aspectRatio: "journal", showGrid: true, connectPoints: true, markerSize: 4, axisRanges: normalizeFigureAxisRanges() };
  const d = state.datasets.find((x) => x.id === state.selectedId);
  const saved = d?.figureEdits?.style;
  if (!state.figureStyles[state.selectedId]) {
    state.figureStyles[state.selectedId] = {
      seriesColor: normalizeHexColor(saved?.seriesColor || "#0f766e"),
      rateColorOverrides: normalizeProfileSeriesColorOverrides(saved?.rateColorOverrides),
      seriesColorOverrides: normalizeProfileSeriesColorOverrides(saved?.seriesColorOverrides),
      dqdvSeriesColorOverrides: normalizeProfileSeriesColorOverrides(saved?.dqdvSeriesColorOverrides),
      aspectRatio: normalizeFigureAspectRatio(saved?.aspectRatio),
      showGrid: saved?.showGrid !== false,
      connectPoints: saved?.connectPoints !== false,
      markerSize: normalizeFigureMarkerSize(saved?.markerSize),
      axisRanges: normalizeFigureAxisRanges(saved?.axisRanges),
    };
  }
  return state.figureStyles[state.selectedId];
}

function movableWrap(key, x, y, inner, extra = "") {
  return `<g class="figureMovable" data-layout-key="${escapeAttr(key)}" data-base-x="${x}" data-base-y="${y}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" ${extra}>${inner}</g>`;
}

function clampFontSize(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 13;
  return Math.max(8, Math.min(40, Math.round(n)));
}

async function saveFigureEdits(silent = true) {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return;
  const figureEdits = { ...(d.figureEdits || {}), annotations: currentAnnotations(), layout: currentLayoutEdits(), style: currentFigureStyle() };
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ figureEdits }),
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || "Fig \uc218\uc815 \uc800\uc7a5 \uc2e4\ud328");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    state.annotations[saved.id] = Array.isArray(saved.figureEdits?.annotations) ? saved.figureEdits.annotations : [];
    state.figureStyles[saved.id] = {
      seriesColor: normalizeHexColor(saved.figureEdits?.style?.seriesColor),
      rateColorOverrides: normalizeProfileSeriesColorOverrides(saved.figureEdits?.style?.rateColorOverrides),
      seriesColorOverrides: normalizeProfileSeriesColorOverrides(saved.figureEdits?.style?.seriesColorOverrides),
      dqdvSeriesColorOverrides: normalizeProfileSeriesColorOverrides(saved.figureEdits?.style?.dqdvSeriesColorOverrides),
      aspectRatio: normalizeFigureAspectRatio(saved.figureEdits?.style?.aspectRatio),
      showGrid: saved.figureEdits?.style?.showGrid !== false,
      connectPoints: saved.figureEdits?.style?.connectPoints !== false,
      markerSize: normalizeFigureMarkerSize(saved.figureEdits?.style?.markerSize),
      axisRanges: normalizeFigureAxisRanges(saved.figureEdits?.style?.axisRanges),
    };
    const figureRes = await fetch("/api/figures", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ datasetId: saved.id, name: `${sampleLabel(saved)} figure`, figureKind: saved.figureKind, edits: saved.figureEdits }),
    });
    const figureBody = await figureRes.json().catch(() => ({}));
    if (!figureRes.ok) throw new Error(figureBody.error || "Fig \ub77c\uc774\ube0c\ub7ec\ub9ac \uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
    if (state.cellWorkspace?.cell?.id === saved.cellRecordId) loadCellWorkspace(saved);
    if (!silent) setStatus("Fig \uc218\uc815 \ub0b4\uc6a9\uc774 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
  } catch (error) {
    setStatus(`Fig \uc218\uc815 \uc800\uc7a5 \uc2e4\ud328: ${error.message}`);
  }
}

function annotationSvg() {
  return currentAnnotations().map((a, idx) => `<text class="userAnnotation${idx === state.selectedAnnotation ? " selected" : ""}" data-annotation-index="${idx}" x="${a.x}" y="${a.y}" style="font:400 ${clampFontSize(a.size)}px 'Segoe UI','Noto Sans KR',Arial,sans-serif">${escapeXml(a.text)}</text>`).join("");
}

function applyAnnotationsToSvg() {
  const svg = document.getElementById("paperFigure");
  if (!svg) return;
  applyLayoutEditsToSvg(svg);
  for (const old of svg.querySelectorAll(".userAnnotation")) old.remove();
  const ns = "http://www.w3.org/2000/svg";
  currentAnnotations().forEach((a, idx) => {
    const el = document.createElementNS(ns, "text");
    el.textContent = a.text;
    el.setAttribute("class", `userAnnotation${idx === state.selectedAnnotation ? " selected" : ""}`);
    el.setAttribute("data-annotation-index", String(idx));
    el.setAttribute("x", String(a.x));
    el.setAttribute("y", String(a.y));
    el.setAttribute("style", `font:400 ${clampFontSize(a.size)}px 'Segoe UI','Noto Sans KR',Arial,sans-serif;fill:${idx === state.selectedAnnotation ? "#0f766e" : "#111"};cursor:move;user-select:none`);
    svg.appendChild(el);
  });
  attachAnnotationDrag();
}

function applyLayoutEditsToSvg(svg) {
  const edits = currentLayoutEdits();
  for (const el of svg.querySelectorAll(".figureMovable")) {
    const key = el.dataset.layoutKey;
    const baseX = Number(el.dataset.baseX) || 0;
    const baseY = Number(el.dataset.baseY) || 0;
    const edit = edits[key] || {};
    const dx = Number(edit.dx) || 0;
    const dy = Number(edit.dy) || 0;
    el.setAttribute("transform", `translate(${baseX + dx} ${baseY + dy})`);
  }
  attachLayoutDrag(svg);
}

function attachLayoutDrag(svg) {
  const edits = currentLayoutEdits();
  for (const el of svg.querySelectorAll(".figureMovable")) {
    el.style.cursor = "move";
    el.style.userSelect = "none";
    el.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      el.setPointerCapture(event.pointerId);
      const key = el.dataset.layoutKey;
      const baseX = Number(el.dataset.baseX) || 0;
      const baseY = Number(el.dataset.baseY) || 0;
      const current = edits[key] || { dx: 0, dy: 0 };
      const startDx = Number(current.dx) || 0;
      const startDy = Number(current.dy) || 0;
      const rect = svg.getBoundingClientRect();
      const view = svg.viewBox.baseVal;
      const px = event.clientX;
      const py = event.clientY;
      const move = (ev) => {
        const dx = startDx + (ev.clientX - px) * view.width / rect.width;
        const dy = startDy + (ev.clientY - py) * view.height / rect.height;
        edits[key] = { dx, dy };
        el.setAttribute("transform", `translate(${baseX + dx} ${baseY + dy})`);
      };
      const up = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        saveFigureEdits(true);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
    });
  }
}

function selectAnnotation(idx) {
  state.selectedAnnotation = Number.isFinite(idx) ? idx : null;
  const input = $("annotationText");
  const sizeInput = $("annotationSize");
  const button = $("addAnnotation");
  const ann = state.selectedAnnotation === null ? null : currentAnnotations()[state.selectedAnnotation];
  if (input && ann) input.value = ann.text;
  if (sizeInput) sizeInput.value = ann ? clampFontSize(ann.size) : clampFontSize(sizeInput.value);
  if (button) button.textContent = ann ? "\uae00 \uc218\uc815" : "\uae00 \ucd94\uac00";
  for (const el of document.querySelectorAll(".userAnnotation")) {
    const selected = Number(el.dataset.annotationIndex) === state.selectedAnnotation;
    el.classList.toggle("selected", selected);
    el.setAttribute("fill", selected ? "#0f766e" : "#111");
    el.style.fill = selected ? "#0f766e" : "#111";
  }
}

function addOrUpdateAnnotation() {
  const input = $("annotationText");
  const text = input?.value.trim();
  const size = clampFontSize($("annotationSize")?.value);
  if (!state.selectedId) return setStatus("\uba3c\uc800 \ud30c\uc77c \ubd84\uc11d \ud6c4 Fig\ub97c \uc0dd\uc131\ud558\uac70\ub098, \uae30\uc874 Fig\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
  if (!text) return setStatus("\ucd94\uac00\ud560 \uae00\uc744 \uc785\ub825\ud558\uc138\uc694.");
  const annotations = currentAnnotations();
  if (state.selectedAnnotation !== null && annotations[state.selectedAnnotation]) {
    annotations[state.selectedAnnotation].text = text;
    annotations[state.selectedAnnotation].size = size;
  } else {
    const svg = document.getElementById("paperFigure");
    const view = svg?.viewBox?.baseVal;
    annotations.push({ text, x: view ? view.width * 0.62 : 355, y: view ? view.height * 0.22 : 82, size });
    state.selectedAnnotation = annotations.length - 1;
  }
  renderCurrent();
  saveFigureEdits(false);
}

function clearAnnotations() {
  if (!state.selectedId) return;
  state.annotations[state.selectedId] = [];
  state.selectedAnnotation = null;
  const input = $("annotationText");
  if (input) input.value = "";
  const sizeInput = $("annotationSize");
  if (sizeInput) sizeInput.value = 13;
  const button = $("addAnnotation");
  if (button) button.textContent = "\uae00 \ucd94\uac00";
  renderCurrent();
  saveFigureEdits(false);
}

function changeAnnotationSize(delta) {
  const input = $("annotationSize");
  const next = clampFontSize((Number(input?.value) || 13) + delta);
  if (input) input.value = next;
  const annotations = currentAnnotations();
  if (state.selectedAnnotation !== null && annotations[state.selectedAnnotation]) {
    annotations[state.selectedAnnotation].size = next;
    renderCurrent();
    saveFigureEdits(false);
  }
}

function changeFigureSeriesColor() {
  if (!state.selectedId) return setStatus("\uba3c\uc800 \ud30c\uc77c \ubd84\uc11d \ud6c4 Fig\ub97c \uc0dd\uc131\ud558\uac70\ub098, \uae30\uc874 Fig\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
  const input = $("figureSeriesColor");
  const style = currentFigureStyle();
  style.seriesColor = normalizeHexColor(input?.value, style.seriesColor);
  if (input) input.value = style.seriesColor;
  renderCurrent();
  saveFigureEdits(false);
}

function changeFigureAspectRatio() {
  if (!state.selectedId) return setStatus("\uba3c\uc800 Fig\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
  const input = $("figureAspectRatio");
  const style = currentFigureStyle();
  style.aspectRatio = normalizeFigureAspectRatio(input?.value);
  if (input) input.value = style.aspectRatio;
  renderCurrent();
  saveFigureEdits(false);
}

function changeProfileSeriesSelection() {
  state.selectedProfileSeriesKey = String($("profileSeriesSelect")?.value || "");
  renderCurrent();
}

function changeProfileSeriesColor() {
  if (!state.selectedId || !state.selectedProfileSeriesKey) return;
  const input = $("profileSeriesColor");
  const style = currentFigureStyle();
  const color = normalizeHexColor(input?.value, "");
  if (!color) return;
  style.rateColorOverrides = {
    ...normalizeProfileSeriesColorOverrides(style.rateColorOverrides),
    [state.selectedProfileSeriesKey]: color,
  };
  if (input) input.value = color;
  renderCurrent();
  saveFigureEdits(false);
}

function resetProfileSeriesColor() {
  if (!state.selectedId || !state.selectedProfileSeriesKey) return;
  const style = currentFigureStyle();
  const overrides = normalizeProfileSeriesColorOverrides(style.rateColorOverrides);
  delete overrides[state.selectedProfileSeriesKey];
  style.rateColorOverrides = overrides;
  renderCurrent();
  saveFigureEdits(false);
}

function changeDqdvSeriesSelection() {
  state.selectedDqdvSeriesKey = String($("dqdvSeriesSelect")?.value || "");
  renderCurrent();
}

function changeDqdvSeriesColor() {
  if (!state.selectedId || !state.selectedDqdvSeriesKey) return;
  const input = $("dqdvSeriesColor");
  const style = currentFigureStyle();
  const color = normalizeHexColor(input?.value, "");
  if (!color) return;
  style.rateColorOverrides = {
    ...normalizeProfileSeriesColorOverrides(style.rateColorOverrides),
    [state.selectedDqdvSeriesKey]: color,
  };
  if (input) input.value = color;
  renderCurrent();
  saveFigureEdits(false);
}

function resetDqdvSeriesColor() {
  if (!state.selectedId || !state.selectedDqdvSeriesKey) return;
  const style = currentFigureStyle();
  const overrides = normalizeProfileSeriesColorOverrides(style.rateColorOverrides);
  delete overrides[state.selectedDqdvSeriesKey];
  style.rateColorOverrides = overrides;
  renderCurrent();
  saveFigureEdits(false);
}

function changeFigureGridVisibility() {
  if (!state.selectedId) return setStatus("\uBA3C\uC800 Fig\uB97C \uC120\uD0DD\uD558\uC138\uC694.");
  const input = $("figureShowGrid");
  const style = currentFigureStyle();
  style.showGrid = input?.checked !== false;
  renderCurrent();
  saveFigureEdits(false);
}

function changeFigureConnectionVisibility() {
  if (!state.selectedId) return setStatus("\uBA3C\uC800 Fig\uB97C \uC120\uD0DD\uD558\uC138\uC694.");
  const input = $("figureConnectPoints");
  const style = currentFigureStyle();
  style.connectPoints = input?.checked !== false;
  renderCurrent();
  saveFigureEdits(false);
}

function changeFigureMarkerSize() {
  if (!state.selectedId) return setStatus("\uBA3C\uC800 Fig\uB97C \uC120\uD0DD\uD558\uC138\uC694.");
  const input = $("figureMarkerSize");
  const style = currentFigureStyle();
  style.markerSize = normalizeFigureMarkerSize(input?.value);
  if (input) input.value = style.markerSize;
  renderCurrent();
  saveFigureEdits(false);
}

function readFigureAxisRangeInput(id) {
  const raw = String($(id)?.value ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function setFigureAxisRangeMessage(message = "", isError = false) {
  const output = $("figureAxisRangeMessage");
  if (!output) return;
  output.textContent = message;
  output.classList.toggle("isError", isError);
}

function applyFigureAxisRange() {
  if (!state.selectedId) return setStatus("\uba3c\uc800 Fig\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
  const target = selectedFigureAxisRangeTarget();
  const range = {
    xMin: readFigureAxisRangeInput("figureXMin"),
    xMax: readFigureAxisRangeInput("figureXMax"),
    yMin: readFigureAxisRangeInput("figureYMin"),
    yMax: readFigureAxisRangeInput("figureYMax"),
  };
  if (range.xMin !== null && range.xMax !== null && range.xMin >= range.xMax) {
    return setFigureAxisRangeMessage("X \ucd5c\uc18c\uac12\uc740 X \ucd5c\ub300\uac12\ubcf4\ub2e4 \uc791\uc544\uc57c \ud569\ub2c8\ub2e4.", true);
  }
  if (range.yMin !== null && range.yMax !== null && range.yMin >= range.yMax) {
    return setFigureAxisRangeMessage("Y \ucd5c\uc18c\uac12\uc740 Y \ucd5c\ub300\uac12\ubcf4\ub2e4 \uc791\uc544\uc57c \ud569\ub2c8\ub2e4.", true);
  }
  const style = currentFigureStyle();
  style.axisRanges = {
    ...normalizeFigureAxisRanges(style.axisRanges),
    [target]: normalizeFigureAxisRange(range),
  };
  syncFigureAxisRangeControls(style);
  setFigureAxisRangeMessage("\ucd95 \ubc94\uc704\ub97c \uc801\uc6a9\ud588\uc2b5\ub2c8\ub2e4.");
  renderCurrent();
  saveFigureEdits(false);
}

function resetFigureAxisRange() {
  if (!state.selectedId) return setStatus("\uba3c\uc800 Fig\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
  const target = selectedFigureAxisRangeTarget();
  const style = currentFigureStyle();
  style.axisRanges = {
    ...normalizeFigureAxisRanges(style.axisRanges),
    [target]: normalizeFigureAxisRange(),
  };
  syncFigureAxisRangeControls(style);
  setFigureAxisRangeMessage("\uc790\ub3d9 \ubc94\uc704\ub85c \ub418\ub3cc\ub838\uc2b5\ub2c8\ub2e4.");
  renderCurrent();
  saveFigureEdits(false);
}

function changeFigureAxisRangeTarget() {
  syncFigureAxisRangeControls(currentFigureStyle());
  setFigureAxisRangeMessage("");
}

function attachAnnotationDrag() {
  const svg = document.getElementById("paperFigure");
  if (!svg) return;
  for (const el of svg.querySelectorAll(".userAnnotation")) {
    el.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      const idx = Number(el.dataset.annotationIndex);
      selectAnnotation(idx);
      const rect = svg.getBoundingClientRect();
      const view = svg.viewBox.baseVal;
      const start = currentAnnotations()[idx];
      const sx = Number(el.getAttribute("x"));
      const sy = Number(el.getAttribute("y"));
      const px = event.clientX;
      const py = event.clientY;
      const move = (ev) => {
        const dx = (ev.clientX - px) * view.width / rect.width;
        const dy = (ev.clientY - py) * view.height / rect.height;
        el.setAttribute("x", sx + dx);
        el.setAttribute("y", sy + dy);
      };
      const up = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        if (start) {
          start.x = Number(el.getAttribute("x"));
          start.y = Number(el.getAttribute("y"));
        }
        saveFigureEdits(true);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
    });
  }
  selectAnnotation(state.selectedAnnotation);
}

function cycStyle(seriesColor = "#0f766e", showGrid = true) {
  const stroke = normalizeHexColor(seriesColor);
  const fill = lightenHexColor(stroke, 0.72);
  return `
    <style>
      .axis{stroke:#111;stroke-width:1;shape-rendering:crispEdges}.grid{stroke:#e5e9ee;stroke-width:.5;opacity:${showGrid ? 1 : 0}}
      .capLine{fill:none;stroke:${stroke};stroke-width:1.35}.capPt{fill:${fill};stroke:${stroke};stroke-width:1.45}
      .tick{font:12px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.label{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.panelTitle{font:700 14px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      .legend{font:9px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.caption{font:8px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.panelLetter{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      .rateBand,.rateBandAlt{fill:transparent}.rateLine{stroke:#777;stroke-width:.75;stroke-dasharray:1.6 1.6}.rateLabel{font:12px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}
      .frame{fill:none;stroke:#111;stroke-width:1;shape-rendering:crispEdges}
      .figureMovable{cursor:move;user-select:none}.figureMovable:hover text{fill:#0f766e}
      .userAnnotation{font:700 13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111;cursor:move;user-select:none}
      .userAnnotation.selected{fill:#0f766e;text-decoration:underline}
    </style>`;
}

function cycReadableAxisTicks(domain) {
  const [min, max] = domain;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) return [];
  if (max === min) return [min];
  const target = (max - min) / 5;
  const power = 10 ** Math.floor(Math.log10(target));
  const fraction = target / power;
  const step = (fraction < Math.sqrt(2) ? 1 : fraction < Math.sqrt(10) ? 2 : fraction < Math.sqrt(50) ? 5 : 10) * power;
  const start = Math.ceil(min / step - 1e-9);
  const end = Math.floor(max / step + 1e-9);
  return Array.from({ length: Math.max(0, Math.min(12, end - start + 1)) }, (_, i) => Number(((start + i) * step).toPrecision(15)))
    .filter(value => value >= min && value <= max);
}

function drawPaperAxes({ x, y, w, h, xDomain, yDomain, y2Domain, xlabel, ylabel, y2label, integerX = false, xTicks = null, yTicks = null, xlabelOffset = 54, ylabelOffset = 72 }) {
  const sx = makeScale(xDomain, [x, x + w]);
  const sy = makeScale(yDomain, [y + h, y]);
  const sy2 = y2Domain ? makeScale(y2Domain, [y + h, y]) : null;
  const parts = [];
  parts.push(`<line x1="${x}" x2="${x + w}" y1="${y + h}" y2="${y + h}" class="axis"/><line x1="${x}" x2="${x}" y1="${y}" y2="${y + h}" class="axis"/>`);
  if (y2Domain) parts.push(`<line x1="${x + w}" x2="${x + w}" y1="${y}" y2="${y + h}" class="axis"/>`);
  const xTickValues = xTicks || (integerX ? integerTicks(xDomain[0], xDomain[1], 6) : axisTicks(xDomain, 6));
  const yTickValues = yTicks || cycReadableAxisTicks(yDomain);
  ylabelOffset = Math.max(ylabelOffset, 6 + cycCapacityLabelOffset(yTickValues.map(cycCapacityTickLabel)));
  parts.push(xTickValues.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${y + h}" y2="${y + h + 8}" class="axis"/><text x="${sx(v)}" y="${y + h + 35}" class="tick" text-anchor="middle">${integerX ? Math.round(v) : fmt(v, 3)}</text>`).join(""));
  parts.push(yTickValues.map((v) => {
    const isBoundary = Math.abs(v - yDomain[0]) < 1e-9 || Math.abs(v - yDomain[1]) < 1e-9;
    const grid = isBoundary ? "" : `<line x1="${x}" x2="${x + w}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/>`;
    return `<line x1="${x - 8}" x2="${x}" y1="${sy(v)}" y2="${sy(v)}" class="axis"/>${grid}<text x="${x - 15}" y="${sy(v) + 5}" class="tick cycYAxisTick" text-anchor="end">${cycCapacityTickLabel(v)}</text>`;
  }).join(""));
  if (y2Domain) parts.push(cycReadableAxisTicks(y2Domain).map((v) => `<line x1="${x + w}" x2="${x + w + 7}" y1="${sy2(v)}" y2="${sy2(v)}" class="axis"/><text x="${x + w + 13}" y="${sy2(v) + 5}" class="tick cycY2AxisTick">${cycCapacityTickLabel(v)}</text>`).join(""));
  parts.push(`<text x="${x + w / 2}" y="${y + h + xlabelOffset}" class="label" text-anchor="middle">${xlabel}</text>`);
  parts.push(`<text transform="translate(${x - ylabelOffset},${y + h / 2}) rotate(-90)" class="label" text-anchor="middle">${ylabel}</text>`);
  if (y2label) parts.push(`<text transform="translate(${x + w + 86},${y + h / 2}) rotate(90)" class="label" text-anchor="middle">${y2label}</text>`);
  return { sx, sy, sy2, svg: parts.join("") };
}

function loadingCaption(d) {
  const savedLoading = Number(d.cell?.electrodeCalc?.activeLoading_g_cm2);
  if (Number.isFinite(savedLoading) && savedLoading > 0) {
    return `${fixed(savedLoading * 1000, 4)} mg cm-2`;
  }
  const text = [d.sourceName, d.cell?.sampleName, d.cell?.condition, d.cell?.notes].filter(Boolean).join(" ");
  const match = text.match(/(\d+(?:\.\d+)?)\s*mg/i);
  return match ? `${Number(match[1]).toString()} mg cm-2` : "";
}

function filenameElectrodeMassLabels(sourceName) {
  const labels = [];
  const seen = new Set();
  const source = String(sourceName || "");
  const matcher = /(\d+(?:[.,]\d+)?)\s*(mg|g)(?![a-z])/gi;
  let match;
  while ((match = matcher.exec(source))) {
    const value = Number(String(match[1]).replace(",", "."));
    const unit = String(match[2] || "").toLowerCase();
    if (!Number.isFinite(value) || value <= 0) continue;
    const milligrams = unit === "g" ? value * 1000 : value;
    if (!Number.isFinite(milligrams) || milligrams <= 0 || milligrams > 100000) continue;
    const label = `${fixed(milligrams, 4)} mg`;
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  return labels.slice(0, 3);
}

function compactElectrodeSummaryValue(value, digits, unit) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? `${fixed(number, digits)} ${unit}` : "";
}

function renderCycFigureElectrodeSummary(dataset) {
  const summary = $("cycElectrodeSummary");
  if (!summary) return;
  summary.replaceChildren();
  summary.hidden = true;
  if (!dataset || dataset.dataType !== "cyc") return;

  const rows = [];
  const rawMasses = filenameElectrodeMassLabels(dataset.sourceName);
  if (rawMasses.length) {
    rows.push({
      label: "\uc6d0\ubcf8 \ud30c\uc77c\uba85 \uc9c8\ub7c9",
      value: rawMasses.join(" \u00b7 "),
    });
  }

  const calc = dataset.cell?.electrodeCalc && typeof dataset.cell.electrodeCalc === "object"
    ? dataset.cell.electrodeCalc
    : null;
  if (calc) {
    const savedValues = [];
    const profileName = String(calc.profileName || calc.electrodeType || "").trim();
    if (profileName) savedValues.push(profileName);
    const electrodeMass = compactElectrodeSummaryValue(calc.electrodeMass_g, 6, "g");
    if (electrodeMass) savedValues.push(`\uc804\uadf9 \uc9c8\ub7c9 ${electrodeMass}`);
    const loading = compactElectrodeSummaryValue(Number(calc.activeLoading_g_cm2) * 1000, 4, "mg cm-2");
    if (loading) savedValues.push(`loading ${loading}`);
    const area = compactElectrodeSummaryValue(calc.area_cm2, 4, "cm2");
    if (area) savedValues.push(`area ${area}`);
    const oneC = compactElectrodeSummaryValue(calc.oneC_mA, 4, "mA");
    if (oneC) savedValues.push(`1C ${oneC}`);
    if (savedValues.length) {
      rows.push({ label: "\uc800\uc7a5 \uc804\uadf9 \uacc4\uc0b0", value: savedValues.join(" \u00b7 ") });
    }
  }

  if (!rows.length) return;
  const title = document.createElement("strong");
  title.className = "cycElectrodeSummaryTitle";
  title.textContent = "\uac04\ub2e8 \uc804\uadf9 \uc815\ubcf4";
  const rowList = document.createElement("div");
  rowList.className = "cycElectrodeSummaryRows";
  for (const row of rows) {
    const item = document.createElement("div");
    item.className = "cycElectrodeSummaryRow";
    const label = document.createElement("strong");
    label.textContent = row.label;
    const value = document.createElement("span");
    value.textContent = row.value;
    item.append(label, value);
    rowList.append(item);
  }
  const hint = document.createElement("p");
  hint.className = "cycElectrodeSummaryHint";
  hint.textContent = "\ud30c\uc77c\uba85 \uc9c8\ub7c9 \ud45c\uae30\uc640 \uc800\uc7a5\ub41c \uc804\uadf9 \uacc4\uc0b0\uac12\uc740 \ucd9c\ucc98\ub97c \uad6c\ubd84\ud574 \ud45c\uc2dc\ud569\ub2c8\ub2e4.";
  summary.append(title, rowList, hint);
  summary.hidden = false;
}

function renderCycFigure(d) {
  // Legacy combined records stay available, but now open as one performance Fig.
  const kind = ["cycling-performance", "voltage-profile", "dqdv"].includes(d.figureKind)
    ? d.figureKind
    : "cycling-performance";
  if (kind === "voltage-profile") return renderCycVoltageProfileFigure(d);
  if (kind === "dqdv") return renderCycDqdvFigure(d);
  return renderCycPerformanceFigure(d);
}

// A CYC record can have both compact cycle summaries and thousands of raw
// voltage/current points.  This workspace keeps those two views together
// without guessing electrode properties that are not present in the WRD file.
function cycRecordNumber(value, digits = 4, suffix = "") {
  const number = Number(value);
  return Number.isFinite(number) ? `${fixed(number, digits)}${suffix}` : "-";
}

function cycRecordFact(label, value) {
  return `<div class="cycRecordFact"><span>${escapeXml(label)}</span><strong>${escapeXml(value || "-")}</strong></div>`;
}

function cycRecordRateText(rate) {
  const cRate = rate?.rate ?? rate?.cRate ?? rate?.label ?? "";
  const current = rate?.current_mA ?? rate?.current ?? rate?.currentMa;
  const currentText = Number.isFinite(Number(current)) ? ` ${fixed(Number(current), 4)} mA` : "";
  return `${String(cRate || "-")} C${currentText}`;
}

function renderCycRecordElectrode(dataset) {
  const cell = dataset.cell || {};
  const calc = cell.electrodeCalc && typeof cell.electrodeCalc === "object" ? cell.electrodeCalc : null;
  const profiles = Array.isArray(state.electrodeProfiles) ? state.electrodeProfiles : [];
  const selector = profiles.length ? `
    <label class="cycRecordProfilePicker">
      <span>\uc800\uc7a5\ub41c \uc804\uadf9 \uacc4\uc0b0\uac12 \uc5f0\uacb0</span>
      <select data-cyc-record-profile>
        <option value="">\uc5f0\uacb0\ud560 \uc804\uadf9 \ud504\ub85c\ud544\uc744 \uace0\ub974\uc138\uc694</option>
        ${profiles.map((profile) => `<option value="${escapeAttr(profile.id)}">${escapeXml(profile.name || "\uc804\uadf9 \ud504\ub85c\ud544")}</option>`).join("")}
      </select>
    </label>` : "";
  if (!calc) {
    return `<section class="cycRecordSection cycRecordElectrode">
      <div class="cycRecordSectionHeader"><div><p class="cycRecordEyebrow">Electrode link</p><h3>\uc5f0\uacb0\ub41c \uc804\uadf9 \uc815\ubcf4</h3></div></div>
      <p class="cycRecordEmpty">\uc774 WRD \uc6d0\ubcf8\uc5d0\ub294 \uc804\uadf9 \ub85c\ub529, \uba74\uc801, 1C \uc815\ubcf4\uac00 \uc9c1\uc811 \uae30\ub85d\ub418\uc5b4 \uc788\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4. \uc800\uc7a5\ub41c \uc804\uadf9 \uacc4\uc0b0\uac12\uc744 \uc5f0\uacb0\ud558\uba74 \uc544\ub798 \uae30\ub85d\uc5d0 \uac19\uc774 \ubcf4\uc5ec\uc90d\ub2c8\ub2e4.</p>
      ${selector}
    </section>`;
  }
  const loading = Number(calc.activeLoading_g_cm2);
  const totalLoading = Number(calc.totalLoading_g_cm2);
  const rates = Array.isArray(calc.rates) ? calc.rates : [];
  return `<section class="cycRecordSection cycRecordElectrode">
    <div class="cycRecordSectionHeader"><div><p class="cycRecordEyebrow">Electrode link</p><h3>\uc5f0\uacb0\ub41c \uc804\uadf9 \uc815\ubcf4</h3><p>\uc6d0\ubcf8 WRD\uc5d0\uc11c \ucd94\uc815\ud55c \uac12\uc774 \uc544\ub2c8\ub77c, \uc800\uc7a5\ub41c \uc804\uadf9 \uacc4\uc0b0 \ud504\ub85c\ud544\uc5d0\uc11c \uc5f0\uacb0\ud55c \uac12\uc785\ub2c8\ub2e4.</p></div>${selector}</div>
    <div class="cycRecordFacts">
      ${cycRecordFact("\ud504\ub85c\ud544", String(calc.profileName || "-"))}
      ${cycRecordFact("\ud65c\ubb3c\uc9c8", String(calc.active || cell.material || "-"))}
      ${cycRecordFact("1C \uc804\ub958", cycRecordNumber(calc.oneC_mA, 4, " mA"))}
      ${cycRecordFact("\ud65c\ubb3c\uc9c8 loading", Number.isFinite(loading) ? `${fixed(loading * 1000, 4)} mg cm-2` : "-")}
      ${cycRecordFact("\uc804\uadf9 \uc9c8\ub7c9", cycRecordNumber(calc.electrodeMass_g, 6, " g"))}
      ${cycRecordFact("\uc804\uadf9 \uba74\uc801", cycRecordNumber(calc.area_cm2, 4, " cm2"))}
      ${cycRecordFact("\uc804\uadf9 \ub450\uaed8", cycRecordNumber(calc.electrodeThickness_mm, 4, " mm"))}
      ${cycRecordFact("\uc804\uccb4 loading", Number.isFinite(totalLoading) ? `${fixed(totalLoading * 1000, 4)} mg cm-2` : "-")}
    </div>
    <div class="cycRecordRateList">${rates.length ? rates.map((rate) => `<span>${escapeXml(cycRecordRateText(rate))}</span>`).join("") : "<span>\uc800\uc7a5\ub41c C-rate \uc804\ub958 \uac12\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</span>"}</div>
  </section>`;
}

function renderCycRecordRawPreview(dataset) {
  const rows = Array.isArray(dataset.rows) ? dataset.rows : [];
  const first = rows.find((row) => row && typeof row === "object") || {};
  const preferred = ["cycle", "capacity", "dischargeCapacity", "chargeCapacity", "voltage", "current", "time", "direction", "range"];
  const columns = [...new Set([...preferred.filter((key) => Object.prototype.hasOwnProperty.call(first, key)), ...Object.keys(first)])]
    .filter((key) => key !== "raw" && key !== "record_index")
    .slice(0, 8);
  if (!rows.length) return `<section class="cycRecordSection"><h3>\uc6d0\ubcf8 \ub85c\uc6b0\ub370\uc774\ud130</h3><p class="cycRecordEmpty">\uc800\uc7a5\ub41c \uc6d0\ubcf8 \ud589\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.</p></section>`;
  const previewRows = rows.slice(0, 8);
  const cellValue = (value) => {
    if (Number.isFinite(Number(value))) return fixed(Number(value), 6);
    return String(value ?? "-");
  };
  return `<section class="cycRecordSection cycRecordRaw">
    <div class="cycRecordSectionHeader"><div><p class="cycRecordEyebrow">Raw WRD data</p><h3>\uc6d0\ubcf8 \ub85c\uc6b0\ub370\uc774\ud130 \ubbf8\ub9ac\ubcf4\uae30</h3><p>${rows.length.toLocaleString("ko-KR")}\uac1c \ud589 \uc911 \uc55e 8\uac1c\ub97c \ud45c\uc2dc\ud569\ub2c8\ub2e4. \uc804\uccb4 \ub85c\uc6b0\ub370\uc774\ud130\ub294 \uc544\ub798 \ud45c\uc5d0\uc11c \uc218\uc815\u00b7\ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p></div></div>
    <div class="cycRecordTableWrap"><table><thead><tr>${columns.map((column) => `<th>${escapeXml(column)}</th>`).join("")}</tr></thead><tbody>${previewRows.map((row) => `<tr>${columns.map((column) => `<td>${escapeXml(cellValue(row?.[column]))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  </section>`;
}

function captureCycRecordPanel(dataset, figureKind) {
  const canvas = $("figureCanvas");
  const title = $("figureTitle");
  const subtitle = $("figureSubtitle");
  const meta = $("metaGrid");
  if (!canvas || !title || !subtitle || !meta) {
    return `<article class="cycRecordChart"><p class="cycRecordEmpty">\uadf8\ub798\ud504 \uc601\uc5ed\uc744 \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.</p></article>`;
  }
  const previous = { canvas: canvas.innerHTML, title: title.textContent, subtitle: subtitle.textContent, meta: meta.innerHTML };
  const labels = { "cycling-performance": "\uc0ac\uc774\ud074 \uc131\ub2a5", "voltage-profile": "\uc804\uc555 \ud504\ub85c\ud30c\uc77c / \uc804\ub958", dqdv: "dQ/dV" };
  try {
    renderCycFigure({ ...dataset, figureKind });
    const svg = canvas.innerHTML;
    return `<article class="cycRecordChart"><div class="cycRecordChartHeader"><h3>${labels[figureKind] || "CYC"}</h3><span>${escapeXml(figureLabel({ ...dataset, figureKind }))}</span></div>${svg || `<p class="cycRecordEmpty">\ud45c\uc2dc\ud560 \uadf8\ub798\ud504\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>`}</article>`;
  } catch (error) {
    console.error("CYC integrated record chart failed", figureKind, error);
    return `<article class="cycRecordChart"><div class="cycRecordChartHeader"><h3>${labels[figureKind] || "CYC"}</h3></div><p class="cycRecordEmpty">\uc6d0\ubcf8 \ub370\uc774\ud130\uc5d0\uc11c \uc774 \uadf8\ub798\ud504\ub97c \uc548\uc804\ud558\uac8c \uadf8\ub9b4 \uc815\ubcf4\uac00 \ubd80\uc871\ud569\ub2c8\ub2e4.</p></article>`;
  } finally {
    canvas.innerHTML = previous.canvas;
    title.textContent = previous.title;
    subtitle.textContent = previous.subtitle;
    meta.innerHTML = previous.meta;
  }
}

async function renderCycRecordView() {
  const root = $("cycRecordContent");
  if (!root) return;
  const selectedId = state.selectedId;
  let dataset = state.datasets.find((item) => item.id === selectedId);
  if (!dataset || String(dataset.dataType || "").toLowerCase() !== "cyc") {
    root.innerHTML = `<section class="cycRecordEmptyState"><h2>CYC \ud1b5\ud569 \uae30\ub85d</h2><p>\uc800\uc7a5\ub41c CYC Fig\ub97c \uc120\ud0dd\ud55c \ub4a4 \ud1b5\ud569 \uae30\ub85d \uc5f4\uae30\ub97c \ub20c\ub7ec\uc8fc\uc138\uc694.</p></section>`;
    activateView("cycRecord", "cyc");
    return;
  }
  activateView("cycRecord", "cyc");
  root.innerHTML = `<section class="cycRecordEmptyState"><h2>CYC \ud1b5\ud569 \uae30\ub85d\uc744 \uc900\ube44\ud558\ub294 \uc911\uc785\ub2c8\ub2e4.</h2><p>\uc800\uc7a5\ub41c \uc6d0\ubcf8 WRD \ud589\uacfc \uc5f0\uacb0 \uc804\uadf9 \uc815\ubcf4\ub97c \ubd88\ub7ec\uc635\ub2c8\ub2e4.</p></section>`;
  let rawNotice = "";
  try {
    dataset = await hydrateDatasetRows(selectedId) || dataset;
  } catch (error) {
    rawNotice = `<p class="cycRecordWarning">\uc6d0\ubcf8 \ub85c\uc6b0\ub370\uc774\ud130\ub97c \ub2e4\uc2dc \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud574 \uc800\uc7a5\ub41c \uc694\uc57d \uc815\ubcf4\ub9cc \ubcf4\uc5ec\uc90d\ub2c8\ub2e4.</p>`;
  }
  const cell = dataset.cell || {};
  const summary = [
    cycRecordFact("\uce21\uc815\uc77c", String(cell.date || "-")),
    cycRecordFact("\uc140 ID", String(cell.cellId || "-")),
    cycRecordFact("\uc0d8\ud50c", String(cell.sampleName || "-")),
    cycRecordFact("\uc6d0\ubcf8 \ud30c\uc77c", String(dataset.sourceName || "-")),
    cycRecordFact("\ub370\uc774\ud130 \ud589", `${(dataset.rows || []).length.toLocaleString("ko-KR")} rows`),
    cycRecordFact("\uc0ac\uc774\ud074 \ubc94\uc704", String(dataset.quality?.cycleRange || "-")),
  ].join("");
  const performance = captureCycRecordPanel(dataset, "cycling-performance");
  const voltageProfile = captureCycRecordPanel(dataset, "voltage-profile");
  const dqdv = captureCycRecordPanel(dataset, "dqdv");
  root.innerHTML = `<section class="cycRecordHero"><div><p class="cycRecordEyebrow">Saved CYC record</p><h2>${escapeXml(datasetDisplayName(dataset))}</h2><p>\uc6d0\ubcf8 WRD \ub85c\uc6b0\ub370\uc774\ud130, \uc0ac\uc774\ud074 \uc694\uc57d, \uc804\uc555/\uc804\ub958, dQ/dV, \uc5f0\uacb0 \uc804\uadf9 \uc815\ubcf4\ub97c \ud55c \uacf3\uc5d0\uc11c \ud655\uc778\ud569\ub2c8\ub2e4.</p></div><button type="button" class="secondaryAction" data-cyc-record-back>\uc800\uc7a5\ub41c Fig \ubaa9\ub85d</button></section>
    ${rawNotice}
    <section class="cycRecordSummary"><div class="cycRecordFacts">${summary}</div></section>
    ${renderCycRecordElectrode(dataset)}
    <section class="cycRecordSection"><div class="cycRecordSectionHeader"><div><p class="cycRecordEyebrow">CYC analysis</p><h3>\uc6d0\ubcf8 \uae30\ubc18 \uadf8\ub798\ud504</h3><p>\uac01 \uadf8\ub798\ud504\ub294 \uac19\uc740 \uc800\uc7a5 CYC \uc6d0\ubcf8\uc5d0\uc11c \uadf8\ub824\uc9d1\ub2c8\ub2e4. \ud3ec\uc778\ud2b8 \uc815\ubcf4\uac00 \ubd80\uc871\ud55c \uacbd\uc6b0 \uc5b5\uc9c0\ub85c \ucd94\uc815\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.</p></div></div><div class="cycRecordCharts">${performance}${voltageProfile}${dqdv}</div></section>
    ${renderCycRecordRawPreview(dataset)}`;
  root.querySelector("[data-cyc-record-back]")?.addEventListener("click", () => activateView("savedFigures", "cyc"));
  root.querySelectorAll("[data-cyc-record-profile]").forEach((select) => {
    select.addEventListener("change", async () => {
      const profileId = select.value;
      if (!profileId) return;
      await applyElectrodeProfileToSelectedCyc(profileId);
      await renderCycRecordView();
    });
  });
}

function evenlySpacedItems(items, maxItems) {
  if (!Array.isArray(items) || !items.length || maxItems < 1) return [];
  const count = Math.min(items.length, Math.max(1, Math.floor(maxItems)));
  if (count === items.length) return [...items];
  if (count === 1) return [items[0]];
  const indices = new Set();
  for (let index = 0; index < count; index += 1) {
    indices.add(Math.round(index * (items.length - 1) / (count - 1)));
  }
  return [...indices].map((index) => items[index]);
}

// Keep the charge/discharge pair from the same representative C-rate cycle.
function selectRepresentativeCycTraces(candidates, rateSegments = [], maxRateGroups = 5) {
  if (!Array.isArray(candidates) || !candidates.length) return [];
  const byCycle = new Map();
  for (const candidate of candidates) {
    const cycle = Number(candidate?.cycle);
    if (!Number.isFinite(cycle)) continue;
    const group = byCycle.get(cycle) || [];
    group.push(candidate);
    byCycle.set(cycle, group);
  }
  const cycles = [...byCycle.keys()].sort((left, right) => left - right);
  const tracesForCycle = (cycle, rateLabel = "") => (byCycle.get(cycle) || []).map((candidate) => ({
    ...candidate,
    rateLabel: rateLabel || candidate.rateLabel || "",
  }));
  const usableSegments = (rateSegments || []).filter((segment) => {
    const start = Number(segment?.start);
    const end = Number(segment?.end);
    return Number.isFinite(start) && Number.isFinite(end) && end >= start;
  });
  const selected = [];
  const usedCycles = new Set();
  for (const segment of evenlySpacedItems(usableSegments, maxRateGroups)) {
    const start = Number(segment.start);
    const end = Number(segment.end);
    const segmentCycles = cycles.filter((cycle) => cycle >= start && cycle <= end);
    if (!segmentCycles.length) continue;
    const midpoint = (start + end) / 2;
    const cycle = segmentCycles.reduce((best, current) => (
      Math.abs(current - midpoint) < Math.abs(best - midpoint) ? current : best
    ));
    if (usedCycles.has(cycle)) continue;
    usedCycles.add(cycle);
    selected.push(...tracesForCycle(cycle, String(segment.label || "")));
  }
  if (selected.length) return selected;
  return evenlySpacedItems(cycles, 3).flatMap((cycle) => tracesForCycle(cycle));
}

function figureTraceLabel(series) {
  const basis = series.rateLabel || `cycle ${series.cycle}`;
  return series.direction === "trace" ? basis : `${basis} ${series.direction}`;
}

function traceStyleByRate(series, allSeries, colors) {
  const keys = [...new Set(allSeries.map((item) => item.rateLabel || `cycle-${item.cycle}`))];
  const key = series.rateLabel || `cycle-${series.cycle}`;
  const index = Math.max(0, keys.indexOf(key));
  return {
    color: colors[index % colors.length],
    dash: series.direction === "discharge" ? "6 3" : "",
  };
}

function normalizeProfileSeriesColorOverrides(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([key, color]) => String(key || "").trim() && /^#[0-9a-f]{6}$/i.test(String(color || "").trim()))
    .map(([key, color]) => [String(key).trim(), String(color).trim().toLowerCase()]));
}

function cycProfileSeriesKey(series) {
  const rate = String(series?.rateLabel || `cycle-${series?.cycle ?? "unknown"}`).trim().toLowerCase();
  const direction = String(series?.direction || "trace").trim().toLowerCase();
  const cycle = Number.isFinite(Number(series?.cycle)) ? Math.round(Number(series.cycle)) : "unknown";
  return `${rate}|${direction}|${cycle}`;
}

function cycRateColorKey(series) {
  return String(series?.rateLabel || `cycle-${series?.cycle ?? "unknown"}`).trim().toLowerCase().replace(/\s+/g, "");
}

function uniqueCycRateSeries(series) {
  const seen = new Set();
  return (Array.isArray(series) ? series : []).filter((item) => {
    const key = cycRateColorKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function cycRateColorLabel(series) {
  const rate = series?.rateLabel || `cycle ${series?.cycle ?? "?"}`;
  return `${rate} (\ucda9\uc804/\ubc29\uc804 \ud568\uaed8)`;
}

function cycRateColor(style, series, allSeries, colors, legacyOverrides) {
  const sharedOverrides = normalizeProfileSeriesColorOverrides(style?.rateColorOverrides);
  const legacy = normalizeProfileSeriesColorOverrides(legacyOverrides);
  return sharedOverrides[cycRateColorKey(series)]
    || legacy[cycProfileSeriesKey(series)]
    || traceStyleByRate(series, allSeries, colors).color;
}

function cycProfileSeriesColor(style, series, allSeries, colors) {
  return cycRateColor(style, series, allSeries, colors, style?.seriesColorOverrides);
}

function syncProfileSeriesControls(profile, style = currentFigureStyle()) {
  const controls = $("profileSeriesControls");
  const select = $("profileSeriesSelect");
  const color = $("profileSeriesColor");
  const reset = $("profileSeriesColorReset");
  if (!controls || !select || !color || !reset) return;
  const series = Array.isArray(profile?.series) ? profile.series : [];
  if (!series.length) {
    controls.hidden = true;
    state.selectedProfileSeriesKey = "";
    select.replaceChildren();
    return;
  }
  const rateSeries = uniqueCycRateSeries(series);
  const keys = rateSeries.map(cycRateColorKey);
  if (!keys.includes(state.selectedProfileSeriesKey)) state.selectedProfileSeriesKey = keys[0];
  select.replaceChildren(...rateSeries.map((item) => {
    const option = document.createElement("option");
    option.value = cycRateColorKey(item);
    option.textContent = cycRateColorLabel(item);
    return option;
  }));
  select.value = state.selectedProfileSeriesKey;
  const selected = rateSeries.find((item) => cycRateColorKey(item) === state.selectedProfileSeriesKey) || rateSeries[0];
  const overrides = normalizeProfileSeriesColorOverrides(style?.rateColorOverrides);
  color.value = cycProfileSeriesColor(style, selected, series, ["#0f766e", "#2563eb", "#db2777", "#b45309", "#7c3aed"]);
  reset.disabled = !overrides[state.selectedProfileSeriesKey];
  controls.hidden = false;
}

function cycDqdvSeriesColor(style, series, allSeries, colors) {
  return cycRateColor(style, series, allSeries, colors, style?.dqdvSeriesColorOverrides);
}

function syncDqdvSeriesControls(analysis, style = currentFigureStyle()) {
  const controls = $("dqdvSeriesControls");
  const select = $("dqdvSeriesSelect");
  const color = $("dqdvSeriesColor");
  const reset = $("dqdvSeriesColorReset");
  if (!controls || !select || !color || !reset) return;
  const series = Array.isArray(analysis?.series) ? analysis.series : [];
  if (!series.length) {
    controls.hidden = true;
    state.selectedDqdvSeriesKey = "";
    select.replaceChildren();
    return;
  }
  const rateSeries = uniqueCycRateSeries(series);
  const keys = rateSeries.map(cycRateColorKey);
  if (!keys.includes(state.selectedDqdvSeriesKey)) state.selectedDqdvSeriesKey = keys[0];
  select.replaceChildren(...rateSeries.map((item) => {
    const option = document.createElement("option");
    option.value = cycRateColorKey(item);
    option.textContent = cycRateColorLabel(item);
    return option;
  }));
  select.value = state.selectedDqdvSeriesKey;
  const selected = rateSeries.find((item) => cycRateColorKey(item) === state.selectedDqdvSeriesKey) || rateSeries[0];
  const overrides = normalizeProfileSeriesColorOverrides(style?.rateColorOverrides);
  color.value = cycDqdvSeriesColor(style, selected, series, ["#0f766e", "#2563eb", "#db2777", "#b45309", "#7c3aed"]);
  reset.disabled = !overrides[state.selectedDqdvSeriesKey];
  controls.hidden = false;
}

function cycVoltageProfileSeries(rows, rateSegments = []) {
  const sourceRows = (rows || []).map((row) => ({
    cycle: Number(row?.cycle),
    voltage: Number(row?.voltage),
    capacity: Number.isFinite(Number(row?.capacity)) ? Number(row.capacity) : Number(row?.chargeCapacity),
    time: Number(row?.time),
    current: Number(row?.current),
    direction: cycDirectionFromValue(row?.direction, Number(row?.current)),
  })).filter((row) => Number.isFinite(row.cycle) && row.cycle >= 1 && Number.isFinite(row.voltage));
  const useCapacity = sourceRows.filter((row) => Number.isFinite(row.capacity)).length >= 8;
  const byCycle = new Map();
  for (const row of sourceRows) {
    const x = useCapacity ? row.capacity : row.time;
    if (!Number.isFinite(x)) continue;
    const cycle = Math.round(row.cycle);
    const points = byCycle.get(cycle) || [];
    points.push({ x, y: row.voltage, current: row.current, direction: row.direction });
    byCycle.set(cycle, points);
  }
  const usable = [];
  for (const [cycle, points] of [...byCycle.entries()].sort(([left], [right]) => left - right)) {
    const charge = points.filter((point) => point.direction === "charge");
    const discharge = points.filter((point) => point.direction === "discharge");
    const directional = [["charge", charge], ["discharge", discharge]].filter(([, group]) => group.length >= 6);
    const groups = directional.length ? directional : [["trace", points]];
    for (const [direction, group] of groups) {
      const sortedPoints = [...group].sort((a, b) => a.x - b.x);
      const xValues = new Set(sortedPoints.map((point) => point.x.toFixed(8)));
      if (sortedPoints.length < 6 || xValues.size < 6) continue;
      const currentValues = sortedPoints.map((point) => point.current).filter(Number.isFinite);
      usable.push({
        cycle,
        direction,
        points: sortedPoints,
        currentA: currentValues.length ? currentValues.reduce((sum, value) => sum + value, 0) / currentValues.length : null,
      });
    }
  }
  return {
    xLabel: useCapacity ? cycCapacityAxisLabel(rows) : "Time (reported unit)",
    series: selectRepresentativeCycTraces(usable, rateSegments),
  };
}

function formatCurrentForFigure(currentA) {
  if (!Number.isFinite(currentA)) return "Iavg unavailable";
  const magnitude = Math.abs(currentA);
  if (magnitude > 0 && magnitude < 1) return `Iavg ${fmt(currentA * 1000, 4)} mA`;
  return `Iavg ${fmt(currentA, 4)} A`;
}

// CYC ?\ubdbf\ube5f ?\ub6af\uc52a?\uba2e\ub497 cycle\uf9cd\ub348\ub58e ?\uafa9\ube2c\u6028??\uafa8\uca9f\u5a9b\u0080 \\u003f\\u003f\\u003f\uba2f\ubd6b\uf9cd??\ub349\uc4e3 \\u003f\\u003f\\u003f\ub349\ub4bf?\ub348\ub58e.
// ??\u5bc3\uc38c\uc2a6 ?\uafa9\ube2c-?\u2478\uc6fe \u6028\u226a\uaf51?\uc1f0\uc908 ?\u317d\ube50?\uc10f? ?\ub504\ud02c, cycle\u8e42??\ub42f\ud1cf ?\uafa9\ube2c/?\uafa8\uca9f \u7570\ubdbf\uaf6d\u745c?\u8e42\uafa8\ub8c4\u6fe1?\u6d39\uba83\u2530?\ub348\ub58e.
function cycVoltageCurrentTrend(rows) {
  const byCycle = new Map();
  for (const row of rows || []) {
    const rawCycle = Number(row?.cycle);
    const cycle = Math.round(rawCycle);
    if (!Number.isFinite(rawCycle) || rawCycle < 1 || Math.abs(rawCycle - cycle) > 1e-6) continue;
    const group = byCycle.get(cycle) || { voltages: [], currents: [] };
    const voltage = Number(row?.voltage);
    const currentA = Number(row?.current);
    if (Number.isFinite(voltage)) group.voltages.push(voltage);
    if (Number.isFinite(currentA)) group.currents.push(currentA);
    byCycle.set(cycle, group);
  }
  const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const entries = [...byCycle.entries()].sort(([left], [right]) => left - right);
  return {
    voltage: entries.filter(([, group]) => group.voltages.length).map(([cycle, group]) => ({ x: cycle, y: average(group.voltages) })),
    // BDF\uc758 \ud45c\uc900 current_a(A)\ub97c \uc0ac\uc6a9\uc790\uc5d0\uac8c \uc77d\uae30 \uc26c\uc6b4 mA \ucd95\uc73c\ub85c \ubcc0\ud658\ud569\ub2c8\ub2e4.
    current: entries.filter(([, group]) => group.currents.length).map(([cycle, group]) => ({ x: cycle, y: average(group.currents) * 1000 })),
  };
}

function cycProfilePanel({ x, y, w, h, profile, style }) {
  if (!profile.series.length) {
    return `
      <g>
        <text x="${x}" y="${y - 18}" class="panelTitle">Voltage profile</text>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" class="profileEmpty"/>
        <text x="${x + w / 2}" y="${y + h / 2 - 16}" class="profileEmptyTitle" text-anchor="middle">\uc804\uc555 \ud504\ub85c\ud30c\uc77c\uc744 \ub9cc\ub4e4 \uc218 \uc788\ub294 \ud3ec\uc778\ud2b8\uac00 \ubd80\uc871\ud569\ub2c8\ub2e4.</text>
        <text x="${x + w / 2}" y="${y + h / 2 + 14}" class="profileEmptyText" text-anchor="middle">\ud604\uc7ac \ud30c\uc77c\uc5d0\ub294 cycle\ubcc4 \uc694\uc57d\uac12\ub9cc \uc788\uc5b4 \uc804\uc555-\uc6a9\ub7c9 \ub610\ub294 \uc804\uc555-\uc2dc\uac04 \uace1\uc120\uc744 \ub9cc\ub4e4 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.</text>
        <text x="${x + w / 2}" y="${y + h / 2 + 40}" class="profileEmptyText" text-anchor="middle">cycle \ub0b4\uc5d0 \uc5ec\ub7ec voltage\uc640 capacity \ub610\ub294 time \ud3ec\uc778\ud2b8\uac00 \uc788\ub294 \uc6d0\ubcf8 \ub370\uc774\ud130\ub97c \uc0ac\uc6a9\ud574 \uc8fc\uc138\uc694.</text>
      </g>`;
  }
  const allPoints = profile.series.flatMap((series) => series.points);
  const xDomain = niceBounds(allPoints.map((point) => point.x));
  const yDomain = niceBounds(allPoints.map((point) => point.y));
  const colors = ["#0f766e", "#2563eb", "#db2777", "#b45309", "#7c3aed"];
  const columns = Math.min(4, Math.max(1, profile.series.length));
  const legendRowHeight = 26;
  const legendRows = Math.ceil(profile.series.length / columns);
  const legendReserve = 72 + legendRows * legendRowHeight;
  const plotH = Math.max(150, h - legendReserve);
  const legendTop = y + plotH + 56;
  const legendNote = "\uc2e4\uc120: \ucda9\uc804, \uc810\uc120: \ubc29\uc804 \u00b7 0.1 C\ub294 10\uc2dc\uac04, 1 C\ub294 1\uc2dc\uac04 \uae30\uc900\uc785\ub2c8\ub2e4. Iavg\ub294 \uad6c\uac04 \ud3c9\uade0 \uc804\ub958\uc785\ub2c8\ub2e4.";
  const axes = drawPaperAxes({
    x,
    y,
    w,
    h: plotH,
    xDomain,
    yDomain,
    xlabel: profile.xLabel,
    ylabel: "Voltage (V)",
    xlabelOffset: 42,
    ylabelOffset: 64,
  });
  const lines = profile.series.map((series) => {
    const { dash } = traceStyleByRate(series, profile.series, colors);
    const color = cycProfileSeriesColor(style, series, profile.series, colors);
    const dashAttribute = dash ? ` stroke-dasharray="${dash}"` : "";
    return `<path d="${linePath(series.points, axes.sx, axes.sy)}" class="profileLine" stroke="${color}"${dashAttribute}/>${markerPoints(series.points, axes.sx, axes.sy, "profilePt", 2.8).replaceAll('class="profilePt"', `class="profilePt" fill="${color}" stroke="${color}"`)}`;
  }).join("");
  const legend = profile.series.map((series, index) => {
    const { dash } = traceStyleByRate(series, profile.series, colors);
    const color = cycProfileSeriesColor(style, series, profile.series, colors);
    const lx = x + 12 + (index % columns) * Math.max(126, Math.floor((w - 24) / columns));
    const ly = legendTop + Math.floor(index / columns) * legendRowHeight;
    const dashAttribute = dash ? ` stroke-dasharray="${dash}"` : "";
    return `<line x1="${lx}" x2="${lx + 16}" y1="${ly}" y2="${ly}" class="profileLegendLine" stroke="${color}"${dashAttribute}/><text x="${lx + 22}" y="${ly + 4}" class="profileLegend">${figureTraceLabel(series)}</text><text x="${lx + 22}" y="${ly + 16}" class="profileLegend">${formatCurrentForFigure(series.currentA)}</text>`;
  }).join("");
  return `
    <g>
      <text x="${x}" y="${y - 18}" class="panelTitle">Voltage profile</text>
      <rect x="${x}" y="${y}" width="${w}" height="${plotH}" class="frame"/>
      ${axes.svg}
      ${lines}
      <rect x="${x}" y="${legendTop - 16}" width="${w}" height="${legendRows * legendRowHeight + 30}" rx="4" class="profileLegendPanel"/>
      ${legend}
      <text x="${x + w / 2}" y="${legendTop + legendRows * legendRowHeight + 7}" class="profileLegendNote" text-anchor="middle">${escapeXml(legendNote)}</text>
    </g>`;
}

function cycVoltageCurrentTrendPanel({ x, y, w, h, trend }) {
  if (!trend.voltage.length) {
    return `<g><text x="${x}" y="${y - 18}" class="panelTitle">Voltage/current behavior</text><rect x="${x}" y="${y}" width="${w}" height="${h}" class="profileEmpty"/><text x="${x + w / 2}" y="${y + h / 2}" class="profileEmptyTitle" text-anchor="middle">\uc804\uc555 \ub370\uc774\ud130\uac00 \uc5c6\uc5b4 \uc804\ub958\uc5d0 \ub530\ub978 \ubcc0\ud654\ub97c \ud45c\uc2dc\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.</text></g>`;
  }
  const allCycles = [...trend.voltage, ...trend.current].map((point) => point.x);
  const hasCurrent = trend.current.length > 0;
  const domains = resolveFigureAxisDomains(
    niceBounds(allCycles),
    niceBounds(trend.voltage.map((point) => point.y)),
    "voltage",
  );
  const axes = drawPaperAxes({
    x,
    y,
    w,
    h,
    xDomain: domains.x,
    yDomain: domains.y,
    y2Domain: hasCurrent ? niceBounds(trend.current.map((point) => point.y)) : null,
    xlabel: "Cycle number",
    ylabel: "Voltage (V)",
    // ?\u317b\u2168\uf9df??\uafa8\uca9f \u7570??\uc495\u3049?\u0080 ?\u2464\uaf38 ??\ubfc9 \uf9cd\uc68e\ub5a0 ?\uafa8\uc612?\uba2f\uaf4c \uf9de\uacf8\uc812 \u8adb\uacd7\ud282?\u2478\ub572??
    y2label: "",
    integerX: true,
    xlabelOffset: 48,
    ylabelOffset: 64,
  });
  const voltageLine = `<path d="${linePath(trend.voltage, axes.sx, axes.sy)}" class="voltageTrendLine"/>${markerPoints(trend.voltage, axes.sx, axes.sy, "voltageTrendPt", 3.3)}`;
  const currentLine = hasCurrent && axes.sy2
    ? `<path d="${linePath(trend.current, axes.sx, axes.sy2)}" class="currentTrendLine"/>${markerPoints(trend.current, axes.sx, axes.sy2, "currentTrendPt", 3.1)}`
    : "";
  return `
    <g>
      <text x="${x}" y="${y - 32}" class="panelTitle">Voltage/current behavior</text>
      <text x="${x}" y="${y - 17}" class="caption">Cycle-summary only: mean voltage and current by cycle</text>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" class="frame"/>
      ${axes.svg}
      ${voltageLine}
      ${currentLine}
      <line x1="${x + 12}" x2="${x + 28}" y1="${y + 18}" y2="${y + 18}" class="voltageTrendLine"/><text x="${x + 34}" y="${y + 22}" class="profileLegend">Voltage (V)</text>
      ${hasCurrent ? `<line x1="${x + 122}" x2="${x + 138}" y1="${y + 18}" y2="${y + 18}" class="currentTrendLine"/><text x="${x + 144}" y="${y + 22}" class="profileLegend">Current (mA)</text><text transform="translate(${x + w + 54},${y + h / 2}) rotate(90)" class="label" text-anchor="middle">Current (mA, +charge / -discharge)</text>` : `<text x="${x + 122}" y="${y + 22}" class="profileLegend">Current column unavailable</text>`}
    </g>`;
}

function dqdvCurveFromPoints(points) {
  if (points.length < 8) return [];
  const ordered = [...points].sort((left, right) => {
    if (Number.isFinite(left.time) && Number.isFinite(right.time) && left.time !== right.time) return left.time - right.time;
    return left.index - right.index;
  });
  const unique = [];
  for (const point of ordered) {
    const previous = unique[unique.length - 1];
    if (!previous || Math.abs(point.voltage - previous.voltage) > 1e-7 || Math.abs(point.capacity - previous.capacity) > 1e-7) unique.push(point);
  }
  if (unique.length < 8) return [];
  const raw = [];
  for (let index = 1; index < unique.length - 1; index += 1) {
    const left = unique[index - 1];
    const right = unique[index + 1];
    const deltaVoltage = right.voltage - left.voltage;
    const deltaCapacity = right.capacity - left.capacity;
    if (!Number.isFinite(deltaVoltage) || !Number.isFinite(deltaCapacity) || Math.abs(deltaVoltage) < 1e-5) continue;
    const value = deltaCapacity / deltaVoltage;
    if (Number.isFinite(value)) raw.push({ x: (left.voltage + right.voltage) / 2, y: value });
  }
  if (raw.length < 4) return [];
  const bins = new Map();
  for (const point of raw) {
    const key = Math.round(point.x / 0.005);
    const values = bins.get(key) || [];
    values.push(point.y);
    bins.set(key, values);
  }
  return [...bins.entries()].map(([key, values]) => ({
    x: key * 0.005,
    y: values.reduce((sum, value) => sum + value, 0) / values.length,
  })).sort((left, right) => left.x - right.x);
}

function orientDqdvCurve(curve, direction) {
  if (!curve.length || direction === "trace") return curve;
  const values = curve.map((point) => point.y).filter(Number.isFinite).sort((left, right) => left - right);
  const median = values.length ? values[Math.floor(values.length / 2)] : 0;
  const shouldFlip = (direction === "charge" && median < 0) || (direction === "discharge" && median > 0);
  return shouldFlip ? curve.map((point) => ({ ...point, y: -point.y })) : curve;
}

function cycDqdvReadiness(rows) {
  const traces = new Map();
  (rows || []).forEach((row) => {
    const rawCycle = Number(row?.cycle);
    const cycle = Math.round(rawCycle);
    const voltage = Number(row?.voltage);
    const capacity = Number.isFinite(Number(row?.capacity)) ? Number(row.capacity) : Number(row?.chargeCapacity);
    if (!Number.isFinite(rawCycle) || rawCycle < 1 || Math.abs(rawCycle - cycle) > 1e-6 || !Number.isFinite(voltage) || !Number.isFinite(capacity)) return;

    const current = Number(row?.current);
    const direction = cycDirectionFromValue(row?.direction, current);
    const key = String(cycle) + ":" + direction;
    const trace = traces.get(key) || { count: 0, voltages: new Set(), capacities: new Set() };
    trace.count += 1;
    // Only distinct-count evidence is needed at inspection time. Capping the
    // sets avoids unnecessary allocations for dense cycler exports.
    if (trace.voltages.size < 8) trace.voltages.add(voltage.toFixed(6));
    if (trace.capacities.size < 8) trace.capacities.add(capacity.toFixed(6));
    traces.set(key, trace);
  });

  const traceCount = [...traces.values()].filter((trace) =>
    trace.count >= 8 && trace.voltages.size >= 6 && trace.capacities.size >= 6
  ).length;
  return {
    hasRawTrace: traceCount > 0,
    traceCount,
    plottedPointCount: 0,
    previewOnly: true,
  };
}

function cycDqdvSeries(rows, rateSegments = []) {
  const byCycle = new Map();
  (rows || []).forEach((row, index) => {
    const rawCycle = Number(row?.cycle);
    const cycle = Math.round(rawCycle);
    const voltage = Number(row?.voltage);
    const capacity = Number.isFinite(Number(row?.capacity)) ? Number(row.capacity) : Number(row?.chargeCapacity);
    if (!Number.isFinite(rawCycle) || rawCycle < 1 || Math.abs(rawCycle - cycle) > 1e-6 || !Number.isFinite(voltage) || !Number.isFinite(capacity)) return;
    const points = byCycle.get(cycle) || [];
    const current = Number(row?.current);
    points.push({
      index,
      voltage,
      capacity,
      time: Number(row?.time),
      current,
      direction: cycDirectionFromValue(row?.direction, current),
    });
    byCycle.set(cycle, points);
  });
  const candidates = [];
  for (const [cycle, points] of [...byCycle.entries()].sort(([left], [right]) => left - right)) {
    const charge = points.filter((point) => point.direction === "charge");
    const discharge = points.filter((point) => point.direction === "discharge");
    const directional = [["charge", charge], ["discharge", discharge]].filter(([, group]) => group.length >= 8);
    const groups = directional.length ? directional : [["trace", points]];
    for (const [direction, group] of groups) {
      const voltageValues = new Set(group.map((point) => point.voltage.toFixed(6)));
      const capacityValues = new Set(group.map((point) => point.capacity.toFixed(6)));
      if (group.length < 8 || voltageValues.size < 6 || capacityValues.size < 6) continue;
      const curve = orientDqdvCurve(dqdvCurveFromPoints(group), direction);
      if (curve.length >= 4) candidates.push({ cycle, direction, points: curve });
    }
  }
  return {
    series: selectRepresentativeCycTraces(candidates, rateSegments),
    hasRawTrace: candidates.length > 0,
    traceCount: candidates.length,
    plottedPointCount: candidates.reduce((count, candidate) => count + candidate.points.length, 0),
    capacityUnit: cycCapacityUnit(rows),
  };
}

function dqdvReadinessSummary(analysis) {
  if (!analysis?.hasRawTrace) return "dQ/dV unavailable";
  if (analysis.previewOnly) {
    return "dQ/dV raw trace detected: " + analysis.traceCount + " trace" + (analysis.traceCount === 1 ? "" : "s");
  }
  return `dQ/dV ready: ${analysis.traceCount} raw trace${analysis.traceCount === 1 ? "" : "s"}, ${analysis.plottedPointCount} plotted points`;
}

function dqdvUnavailableMessage(rows) {
  const sourcePoints = (rows || []).filter((row) => {
    const cycle = Number(row?.cycle);
    const voltage = Number(row?.voltage);
    const capacity = Number.isFinite(Number(row?.capacity)) ? Number(row.capacity) : Number(row?.chargeCapacity);
    return Number.isFinite(cycle) && cycle >= 1 && Number.isFinite(voltage) && Number.isFinite(capacity);
  });
  if (!sourcePoints.length) {
    return "dQ/dV Fig\ub97c \ub9cc\ub4e4 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. cycle \ub0b4\ubd80\uc758 \uc804\uc555\uacfc \uc6a9\ub7c9\uc744 \ud568\uaed8 \uac00\uc9c4 \uc6d0\ubcf8 \ud3ec\uc778\ud2b8\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.";
  }
  const byCycle = new Map();
  sourcePoints.forEach((point) => {
    const cycle = Math.round(Number(point.cycle));
    const values = byCycle.get(cycle) || [];
    values.push(point);
    byCycle.set(cycle, values);
  });
  const usableCycleCount = [...byCycle.values()].filter((points) => {
    const voltages = new Set(points.map((point) => Number(point.voltage).toFixed(6)));
    const capacities = new Set(points.map((point) => (Number.isFinite(Number(point.capacity)) ? Number(point.capacity) : Number(point.chargeCapacity)).toFixed(6)));
    return points.length >= 8 && voltages.size >= 6 && capacities.size >= 6;
  }).length;
  if (!usableCycleCount) {
    return `dQ/dV Fig\ub97c \ub9cc\ub4e4 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \uc6d0\ubcf8 \ud3ec\uc778\ud2b8\ub294 ${sourcePoints.length}\uac1c\uc774\uc9c0\ub9cc, \ud558\ub098\uc758 cycle \uc548\uc5d0 \uc11c\ub85c \ub2e4\ub978 \uc804\uc555\u00b7\uc6a9\ub7c9 \ud3ec\uc778\ud2b8\uac00 \ucd5c\uc18c 8\uac1c \ud544\uc694\ud569\ub2c8\ub2e4.`;
  }
  return "dQ/dV Fig\ub97c \ub9cc\ub4e4 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \uc6d0\ubcf8 \ud3ec\uc778\ud2b8\ub294 \uc788\uc9c0\ub9cc \uc720\ud6a8\ud55c \uc804\uc555-\uc6a9\ub7c9 \ubbf8\ubd84 \uad6c\uac04\uc744 \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.";
}

function cycDqdvPanel({ x, y, w, h, analysis, style }) {
  if (!analysis.series.length) {
    return `
      <g>
        <text x="${x}" y="${y - 18}" class="panelTitle">dQ/dV</text>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" class="profileEmpty"/>
        <text x="${x + w / 2}" y="${y + h / 2 - 14}" class="profileEmptyTitle" text-anchor="middle">dQ/dV\uc6a9 \uc6d0\ubcf8 \uc804\uc555-\uc6a9\ub7c9 \ud2b8\ub808\uc774\uc2a4\uac00 \ubd80\uc871\ud569\ub2c8\ub2e4.</text>
        <text x="${x + w / 2}" y="${y + h / 2 + 14}" class="profileEmptyText" text-anchor="middle">cycle \ub0b4 8\uac1c \uc774\uc0c1\uc758 \uc11c\ub85c \ub2e4\ub978 voltage\uc640 capacity \ud3ec\uc778\ud2b8\uac00 \ud544\uc694\ud569\ub2c8\ub2e4.</text>
        <text x="${x + w / 2}" y="${y + h / 2 + 38}" class="profileEmptyText" text-anchor="middle">\uc694\uc57d \ud14c\uc774\ube14\uc5d0\uc11c\ub294 \uc778\uc704\uc801\uc778 dQ/dV \uace1\uc120\uc744 \ub9cc\ub4e4\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.</text>
      </g>`;
  }
  const points = analysis.series.flatMap((series) => series.points);
  const domains = resolveFigureAxisDomains(
    niceBounds(points.map((point) => point.x)),
    niceBounds(points.map((point) => point.y)),
    "dqdv",
  );
  const axes = drawPaperAxes({
    x,
    y,
    w,
    h,
    xDomain: domains.x,
    yDomain: domains.y,
    xlabel: "Voltage (V)",
    ylabel: dqdvAxisLabel(analysis.capacityUnit),
    xlabelOffset: 48,
    ylabelOffset: 64,
  });
  const colors = [normalizeHexColor(style?.seriesColor || "#0f766e"), "#2563eb", "#db2777", "#b45309", "#7c3aed"];
  const legendColumns = Math.min(3, Math.max(1, analysis.series.length));
  const legendRows = Math.ceil(analysis.series.length / legendColumns);
  const legendRowHeight = 20;
  const legendTop = y + h + 34;
  const legendHeight = 18 + legendRows * legendRowHeight;
  const legendColumnWidth = Math.max(160, Math.floor((w - 28) / legendColumns));
  const lines = analysis.series.map((series, index) => {
    const { dash } = traceStyleByRate(series, analysis.series, colors);
    const color = cycDqdvSeriesColor(style, series, analysis.series, colors);
    const dashAttribute = dash ? ` stroke-dasharray="${dash}"` : "";
    return `<path d="${linePath(series.points, axes.sx, axes.sy)}" class="profileLine" stroke="${color}"${dashAttribute}/>${markerPoints(series.points, axes.sx, axes.sy, "profilePt", 2.8).replaceAll('class="profilePt"', `class="profilePt" fill="${color}" stroke="${color}"`)}`;
  }).join("");
  const legend = analysis.series.map((series, index) => {
    const { dash } = traceStyleByRate(series, analysis.series, colors);
    const color = cycDqdvSeriesColor(style, series, analysis.series, colors);
    const lx = x + 12 + (index % legendColumns) * legendColumnWidth;
    const ly = legendTop + Math.floor(index / legendColumns) * legendRowHeight;
    const dashAttribute = dash ? ` stroke-dasharray="${dash}"` : "";
    return `<line x1="${lx}" x2="${lx + 16}" y1="${ly}" y2="${ly}" class="profileLegendLine" stroke="${color}"${dashAttribute}/><text x="${lx + 22}" y="${ly + 4}" class="profileLegend">${figureTraceLabel(series)}</text>`;
  }).join("");
  return `<g><text x="${x}" y="${y - 32}" class="panelTitle">dQ/dV</text><text x="${x}" y="${y - 17}" class="caption">Raw within-cycle voltage-capacity trace only</text><rect x="${x}" y="${y}" width="${w}" height="${h}" class="frame"/>${axes.svg}${lines}<rect x="${x}" y="${legendTop - 12}" width="${w}" height="${legendHeight}" rx="5" class="profileLegendPanel"/>${legend}</g>`;
}

function cycPerformancePanel({ x, y, w, h, points, capacityAxisLabel = "Specific capacity (mAh g-1)" }) {
  if (!points.length) {
    return `<g><text x="${x}" y="${y - 18}" class="panelTitle">Cycling performance</text><rect x="${x}" y="${y}" width="${w}" height="${h}" class="profileEmpty"/><text x="${x + w / 2}" y="${y + h / 2}" class="profileEmptyTitle" text-anchor="middle">\uc6a9\ub7c9 \ub370\uc774\ud130\ub97c \ucc3e\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.</text></g>`;
  }
  const domains = resolveFigureAxisDomains(
    niceBounds(points.map((point) => point.x)),
    niceBounds(points.map((point) => point.y)),
    "performance",
  );
  return panel({
    x,
    y,
    w,
    h,
    xlabel: "Cycle number",
    ylabel: capacityAxisLabel,
    title: "Cycling performance",
    readableY: true,
    xDomain: domains.x,
    yDomain: domains.y,
    points,
  });
}

function renderCycAlternativeFigure(d, mode) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const rows = (d.rows || []).filter((row) => Number.isFinite(row.cycle)).sort((a, b) => a.cycle - b.cycle);
  const title = figureDatasetLabel(d);
  const capPts = dischargeSeries(rows);
  const rateSegments = cRateFigureSegments(inferCRateSegments(d, rows, capPts), capPts);
  const profile = cycVoltageProfileSeries(rows, rateSegments);
  syncProfileSeriesControls(profile, style);
  const electricalTrend = cycVoltageCurrentTrend(rows);
  const hasRawVoltageProfile = profile.series.length > 0;
  const electricalTitle = hasRawVoltageProfile ? "Voltage-capacity profiles" : "Voltage/current trend (cycle summary)";
  const capacityAxisLabel = cycCapacityAxisLabel(rows);
  const svgSize = figureSvgSize(style, "paper");
  const combined = mode === "combined";
  const padX = Math.max(72, Math.round(svgSize.w * 0.08));
  const rightAxisPad = 112;
  const plotY = Math.max(110, Math.round(svgSize.h * 0.18));
  const plotH = Math.max(280, Math.round(svgSize.h * 0.56));
  const gap = combined ? Math.max(68, Math.round(svgSize.w * 0.06)) : 0;
  const panelW = combined ? Math.max(280, Math.floor((svgSize.w - padX - rightAxisPad - gap) / 2)) : Math.max(360, svgSize.w - padX - rightAxisPad);
  const rateText = rateSegments.map((segment) => segment.label).join(" | ");
  const metaRows = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Figure", combined ? `Performance + ${electricalTitle}` : electricalTitle], ["C-rate traces", rateText || "Representative cycles"], ["Owner", displayUserName(d)], ["Source", d.sourceName]];
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} - CYC - ${combined ? `Performance + ${electricalTitle} Fig` : `${electricalTitle} Fig`}`;
  $("metaGrid").innerHTML = metaRows.map(([key, value]) => `<div class="metaItem"><strong>${key}</strong>${isBadText(value) ? "-" : (value || "-")}</div>`).join("");
  const performance = combined ? cycPerformancePanel({ x: padX, y: plotY, w: panelW, h: plotH, points: capPts, capacityAxisLabel }) : "";
  const electricalX = combined ? padX + panelW + gap : padX;
  const profilePanel = hasRawVoltageProfile
    ? cycProfilePanel({ x: electricalX, y: plotY, w: panelW, h: plotH, profile, style })
    : cycVoltageCurrentTrendPanel({ x: electricalX, y: plotY, w: panelW, h: plotH, trend: electricalTrend });
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" class="cycAlternativeFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      ${cycStyle(style.seriesColor, style.showGrid)}
      <style>
        .seriesLine{fill:none;stroke:${normalizeHexColor(style.seriesColor)};stroke-width:2.1}.points circle{fill:#fff;stroke:${normalizeHexColor(style.seriesColor)};stroke-width:1.6}
        .profileLine{fill:none;stroke-width:2}.profilePt{stroke-width:1.2}.profileLegend{font:9px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.profileLegendLine{stroke-width:2}.profileLegendPanel{fill:#f8fafc;stroke:#d6e8eb;stroke-width:1}.profileLegendNote{font:10px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#475569}
        .voltageTrendLine{fill:none;stroke:#0f766e;stroke-width:2}.currentTrendLine{fill:none;stroke:#db2777;stroke-width:2;stroke-dasharray:5 3}.voltageTrendPt{fill:#fff;stroke:#0f766e;stroke-width:1.5}.currentTrendPt{fill:#fff;stroke:#db2777;stroke-width:1.4}
        .profileEmpty{fill:#f8fafc;stroke:#cbd5e1;stroke-width:1}.profileEmptyTitle{font:700 13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#334155}.profileEmptyText{font:11px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#64748b}
      </style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#fff"/>
      <text x="${padX}" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="${padX}" y="72" class="caption">${combined ? `Cycling performance + ${electricalTitle}` : electricalTitle}</text>
      ${performance}
      ${profilePanel}
    </svg>`;
  applyAnnotationsToSvg();
}

function renderCycVoltageProfileFigure(d) {
  renderCycAlternativeFigure(d, "voltage-profile");
}

function renderCycDqdvFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const rows = (d.rows || []).filter((row) => Number.isFinite(row.cycle));
  const title = figureDatasetLabel(d);
  const capPts = dischargeSeries(rows);
  const rateSegments = cRateFigureSegments(inferCRateSegments(d, rows, capPts), capPts);
  const analysis = cycDqdvSeries(rows, rateSegments);
  syncDqdvSeriesControls(analysis, style);
  const svgSize = figureSvgSize(style, "paper");
  const padX = Math.max(72, Math.round(svgSize.w * 0.1));
  const plotY = Math.max(118, Math.round(svgSize.h * 0.2));
  const plotW = Math.max(380, svgSize.w - padX * 2);
  const plotH = Math.max(300, Math.round(svgSize.h * 0.58));
  const legendColumns = Math.min(3, Math.max(1, analysis.series.length || 1));
  const legendRows = analysis.series.length ? Math.ceil(analysis.series.length / legendColumns) : 0;
  const figureHeight = svgSize.h + (legendRows ? 56 + legendRows * 20 : 0);
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} - CYC - dQ/dV Fig - ${dqdvReadinessSummary(analysis)}`;
  const rateText = rateSegments.map((segment) => segment.label).join(" | ");
  $("metaGrid").innerHTML = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Figure", "dQ/dV (raw trace only)"], ["C-rate traces", rateText || "Representative cycles"], ["Trace status", dqdvReadinessSummary(analysis)], ["Owner", displayUserName(d)], ["Source", d.sourceName]].map(([key, value]) => `<div class="metaItem"><strong>${key}</strong>${isBadText(value) ? "-" : (value || "-")}</div>`).join("");
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" class="cycAlternativeFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${figureHeight}" xmlns="http://www.w3.org/2000/svg">
      ${cycStyle(style.seriesColor, style.showGrid)}
      <style>.profileLine{fill:none;stroke-width:2}.profilePt{stroke-width:1.2}.profileLegend{font:9px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111}.profileLegendLine{stroke-width:2}.profileLegendPanel{fill:#f8fafc;stroke:#d6e8eb;stroke-width:1}.profileEmpty{fill:#f8fafc;stroke:#cbd5e1;stroke-width:1}.profileEmptyTitle{font:700 13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#334155}.profileEmptyText{font:11px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#64748b}</style>
      <rect width="${svgSize.w}" height="${figureHeight}" fill="#fff"/>
      <text x="${padX}" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="${padX}" y="72" class="caption">dQ/dV is calculated only from raw within-cycle voltage-capacity traces</text>
      ${cycDqdvPanel({ x: padX, y: plotY, w: plotW, h: plotH, analysis, style })}
    </svg>`;
  applyAnnotationsToSvg();
}

function renderCycCombinedFigure(d) {
  renderCycAlternativeFigure(d, "combined");
}

function cycPerformanceCapacityDomain(points, isSpecificCapacity) {
  const measuredMax = Math.max(0, ...points.map((p) => p.y).filter(Number.isFinite));
  const maxCap = measuredMax > 0 ? measuredMax : 1;
  if (isSpecificCapacity) return [0, maxCap <= 180 ? 180 : Math.ceil(maxCap * 1.05 / 20) * 20];
  const upper = maxCap * 1.08;
  const step = cycCapacityTickStep(upper, false);
  return [0, Number((Math.ceil(upper / step) * step).toPrecision(12))];
}

function cycCapacityTickStep(upper, isSpecificCapacity) {
  if (isSpecificCapacity) return Math.max(20, Math.ceil(upper / 9 / 20) * 20);
  // About five intervals, rounded up to a readable 1/2/5 power-of-ten step.
  const target = (Number.isFinite(upper) && upper > 0 ? upper : 1) / 5;
  const power = 10 ** Math.floor(Math.log10(target));
  const fraction = target / power;
  const multiple = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return multiple * power;
}

function cycCapacityTickLabel(value) {
  // Remove floating-point tails without rounding small Ah readings to zero.
  return String(Number(value.toPrecision(15)));
}

function cycCapacityLabelOffset(labels) {
  // 12px tick text: reserve seven SVG units per character, plus a title gap.
  return 9 + Math.max(...labels.map((label) => label.length), 1) * 7 + 20;
}

function renderCycPerformanceFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const rows = d.rows.filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle);
  const title = figureDatasetLabel(d);
  const capPts = dischargeSeries(rows);
  const capacityAxisLabel = cycCapacityAxisLabel(rows);
  const capacityUnit = cycCapacityUnit(rows);
  const isSpecificCapacity = capacityUnit === "mAh g-1";
  const rateSegments = cRateFigureSegments(inferCRateSegments(d, rows, capPts), capPts);
  const isRateFigure = rateSegments.length >= 2;
  const detectedCRates = explicitCRateValues(rows);
  const cRateText = isRateFigure
    ? rateSegments.map((segment) => segment.label).join(" | ")
    : detectedCRates.map(formatExplicitCRate).join(" | ");
  $("figureTitle").textContent = title;
  const cycleCount = new Set(capPts.map((point) => point.x)).size;
  const traceSummary = `Detected ${cycleCount} discharge cycle${cycleCount === 1 ? "" : "s"} from ${d.rows.length.toLocaleString()} raw points`;
  $("figureSubtitle").textContent = `${d.cell.date || ""} - CYC performance Fig - ${traceSummary}`;
  const metaRows = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Figure", "CYC performance (one point per cycle)"], [cRateText ? "C-rate" : "Mode", cRateText || "Long cycle"], ["Owner", displayUserName(d)], ["Source", d.sourceName]];
  $("metaGrid").innerHTML = metaRows.map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  const cycleValues = capPts.length ? capPts.map((r) => r.x) : rows.map((r) => r.cycle);
  const maxRateCycle = Math.max(...rateSegments.map((s) => s.end).filter(Number.isFinite), Math.max(...cycleValues));
  const xTickMax = Math.max(5, Math.ceil(maxRateCycle / 5) * 5);
  const xMax = xTickMax + Math.max(1, xTickMax * 0.025);
  const xDomain = [0, xMax];
  const capDomain = cycPerformanceCapacityDomain(capPts, isSpecificCapacity);
  const yTickStep = cycCapacityTickStep(capDomain[1], isSpecificCapacity);
  const yTicks = Array.from({ length: Math.floor(capDomain[1] / yTickStep + 1e-9) + 1 }, (_, i) => i * yTickStep);
  const yLabels = yTicks.map(cycCapacityTickLabel);
  const yLabelOffset = cycCapacityLabelOffset(yLabels);
  const svgSize = figureSvgSize(style, "rate");
  const margin = {
    left: Math.max(yLabelOffset + 22, Math.round(svgSize.w * 0.14)),
    right: Math.max(28, Math.round(svgSize.w * 0.08)),
    top: Math.max(44, Math.round(svgSize.h * 0.13)),
    bottom: Math.max(58, Math.round(svgSize.h * 0.14)),
  };
  const plot = {
    x: margin.left,
    y: margin.top,
    w: Math.max(220, svgSize.w - margin.left - margin.right),
    h: Math.max(180, svgSize.h - margin.top - margin.bottom),
  };
  const sx = makeScale(xDomain, [plot.x, plot.x + plot.w]);
  const sy = makeScale(capDomain, [plot.y + plot.h, plot.y]);
  const xTickStep = xTickMax <= 18 ? 3 : 5;
  const xTicks = Array.from({ length: Math.floor(xTickMax / xTickStep) + 1 }, (_, i) => i * xTickStep);
  const rateSvg = isRateFigure ? rateSegments.map((s, idx) => {
    const left = s.start;
    const right = s.end;
    const boundary = idx ? s.start - 0.5 : null;
    const x1 = sx(Math.max(xDomain[0], left - 0.5));
    const x2 = sx(Math.min(xDomain[1], right + 0.5));
    const cx = (x1 + x2) / 2;
    const bx = boundary === null ? null : sx(boundary);
    const line = bx === null ? "" : `<line x1="${bx.toFixed(2)}" x2="${bx.toFixed(2)}" y1="${plot.y}" y2="${plot.y + plot.h}" class="rateLine"/>`;
    return `${line}${movableWrap(`rate-${idx}`, cx, plot.y - 10, `<text class="rateLabel" text-anchor="middle">${escapeXml(s.label)}</text>`)}`;
  }).join("") : "";
  const capPath = capPts.map((p, idx) => {
    const prev = capPts[idx - 1];
    const command = !prev || Math.abs(p.x - prev.x) > 1.5 ? "M" : "L";
    return `${command}${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`;
  }).join(" ");
  const gridSvg = style.showGrid ? `
    ${xTicks.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${plot.y}" y2="${plot.y + plot.h}" class="grid"/>`).join("")}
    ${yTicks.map((v) => `<line x1="${plot.x}" x2="${plot.x + plot.w}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/>`).join("")}` : "";
  const axesSvg = `
    <rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" class="frame"/>
    ${gridSvg}
    ${xTicks.map((v) => `<line x1="${sx(v)}" x2="${sx(v)}" y1="${plot.y + plot.h}" y2="${plot.y + plot.h - 7}" class="axis"/><text x="${sx(v)}" y="${plot.y + plot.h + 18}" class="tick" text-anchor="middle">${v}</text>`).join("")}
    ${yTicks.map((v, i) => `<line x1="${plot.x}" x2="${plot.x + 7}" y1="${sy(v)}" y2="${sy(v)}" class="axis"/><text x="${plot.x - 9}" y="${sy(v) + 4}" class="tick cycCapacityTick" text-anchor="end">${yLabels[i]}</text>`).join("")}
    <text x="${plot.x + plot.w / 2}" y="${plot.y + plot.h + 40}" class="label" text-anchor="middle">Cycle number</text>
    <text transform="translate(${plot.x - yLabelOffset},${plot.y + plot.h / 2}) rotate(-90)" class="label cycCapacityTitle" text-anchor="middle">${escapeXml(capacityAxisLabel)}</text>`;
  const loading = loadingCaption(d);
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" class="rateFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      ${cycStyle(style.seriesColor, style.showGrid)}<rect width="${svgSize.w}" height="${svgSize.h}" fill="#fff"/>
      ${rateSvg}
      ${axesSvg}
      ${style.connectPoints && capPath ? `<path d="${capPath}" class="capLine"/>` : ""}
      ${markerPoints(capPts, sx, sy, "capPt", style.markerSize)}
      ${movableWrap("legend", plot.x + 24, plot.y + plot.h - 44, `
        <circle class="capPt" cx="0" cy="0" r="${Math.max(2.4, style.markerSize * 0.85)}"/><text class="legend" x="10" y="3.4">Discharge capacity</text>
      `)}
      ${loading ? movableWrap("loading-caption", plot.x + plot.w - 10, plot.y + plot.h - 22, `<text class="caption" text-anchor="end">${escapeXml(loading)}</text>`) : ""}
    </svg>`;
  applyAnnotationsToSvg();
}

function renderCvFigure(d) {
  const style = currentFigureStyle();
  syncFigureControls(style);
  const svgSize = figureSvgSize(style, "paper");
  const cvPlot = {
    x: Math.max(110, Math.round(svgSize.w * 0.12)),
    y: Math.max(120, Math.round(svgSize.h * 0.18)),
    w: Math.max(420, Math.round(svgSize.w * 0.72)),
    h: Math.max(300, Math.round(svgSize.h * 0.58)),
  };
  const rows = d.rows.filter((r) => Number.isFinite(r.voltage) && Number.isFinite(r.current));
  const cvDomains = resolveFigureAxisDomains(
    niceBounds(rows.map((r) => r.voltage)),
    niceBounds(rows.map((r) => r.current)),
    "cv",
  );
  const title = figureDatasetLabel(d);
  $("figureTitle").textContent = title;
  $("figureSubtitle").textContent = `${d.cell.date || ""} \u00b7 CV \u00b7 ${d.rows.length} points`;
  $("metaGrid").innerHTML = [["Material", d.cell.material], ["Condition", d.cell.condition], ["Owner", displayUserName(d)], ["Source", d.sourceName]].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  $("figureCanvas").innerHTML = `
    <svg id="paperFigure" style="--figure-width:${svgSize.w}px" viewBox="0 0 ${svgSize.w} ${svgSize.h}" xmlns="http://www.w3.org/2000/svg">
      <style>.axis{stroke:#111827;stroke-width:1.6}.grid{stroke:#e5e7eb;stroke-width:1}.seriesLine{fill:none;stroke:#0f766e;stroke-width:2.4}.points circle{fill:#fff;stroke:#0f766e;stroke-width:1.8}.label{font:18px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.tick{font:13px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#374151}.panelTitle{font:700 20px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#111827}.caption{font:15px "Segoe UI","Noto Sans KR",Arial,sans-serif;fill:#4b5563}</style>
      <rect width="${svgSize.w}" height="${svgSize.h}" fill="#ffffff"/>
      <text x="72" y="48" class="panelTitle">${escapeXml(title)}</text>
      <text x="72" y="74" class="caption">CV \u00b7 ${escapeXml(d.cell.condition || "")}</text>
      ${panel({ x: cvPlot.x, y: cvPlot.y, w: cvPlot.w, h: cvPlot.h, xlabel: "Voltage (V)", ylabel: "Current", title: "Cyclic voltammetry", xDomain: cvDomains.x, yDomain: cvDomains.y, points: rows.map((r) => ({ x: r.voltage, y: r.current })) })}
    </svg>`;
  applyAnnotationsToSvg();
}

function cleanDisplayText(value, fallback = "\uc815\ubcf4 \ud655\uc778") {
  const text = String(value ?? "").replace(/\s*\uca0c\s*/g, " \u00b7 ");
  if (!/[\u4e00-\u9fff\ufffd]|\?{2,}/.test(text)) return text;
  return fallback;
}

function repairBrokenUiText(root = document.body) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) continue;
    if (/[\u4e00-\u9fff\ufffd\uca0c]|\?{2,}/.test(node.nodeValue || "")) nodes.push(node);
  }
  nodes.forEach((textNode) => { textNode.nodeValue = cleanDisplayText(textNode.nodeValue); });
  root.querySelectorAll?.("[title], [aria-label], [placeholder]").forEach((element) => {
    for (const attribute of ["title", "aria-label", "placeholder"]) {
      const value = element.getAttribute(attribute);
      if (value && /[\u4e00-\u9fff\ufffd\uca0c]|\?{2,}/.test(value)) element.setAttribute(attribute, cleanDisplayText(value));
    }
  });
}

function installBrokenUiTextRepair() {
  repairBrokenUiText();
  let queued = false;
  const queueRepair = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; repairBrokenUiText(); });
  };
  new MutationObserver(queueRepair).observe(document.body, { childList: true, subtree: true, characterData: true });
}

function escapeXml(s) {
  return cleanDisplayText(s, "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
}

function escapeAttr(s) {
  return escapeXml(s).replace(/'/g, "&#39;");
}

function rateNumber(label) {
  const match = String(label || "").match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : null;
}

function average(nums) {
  const arr = nums.filter(Number.isFinite);
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function bestManualSample() {
  const sheets = state.manualInfo?.sheets || [];
  for (const sheet of sheets) {
    const sample = (sheet.samples || []).find((s) => Number.isFinite(Number(s.oneC_mA)) && Number(s.oneC_mA) > 0);
    if (sample) return { sheet, sample };
  }
  return null;
}

function renderExperimentInfo(d) {
  const panel = $("experimentInfoPanel");
  if (!panel) return;
  const manual = bestManualSample();
  const savedCalc = d?.cell?.electrodeCalc || null;
  const blocks = [];
  if (d?.dataType === "cyc") {
    const rows = d.rows.filter((row) => Number.isFinite(row.cycle)).sort((a, b) => a.cycle - b.cycle);
    const capPts = dischargeSeries(rows);
    const segments = inferCRateSegments(d, rows, capPts);
    const oneC = Number(savedCalc?.oneC_mA ?? manual?.sample?.oneC_mA);
    const segmentRows = segments.map((segment) => {
      const within = rows.filter((row) => row.cycle >= segment.start && row.cycle <= segment.end);
      const capacity = average(within.map((row) => row.capacity).filter(Number.isFinite).map((value) => Math.abs(value) < 10 ? value * 1000 : value));
      const current = average(within.map((row) => row.current).filter(Number.isFinite).map(Math.abs));
      const rate = rateNumber(segment.label);
      const expected = Number.isFinite(oneC) && Number.isFinite(rate) ? oneC * rate : null;
      return [segment.label, `${segment.start}-${segment.end}`, capacity, current, expected];
    });
    blocks.push(`
      <section class="infoBlock">
        <h3>\ud604\uc7ac CYC \ub370\uc774\ud130 \uc694\uc57d</h3>
        <div class="infoCards">
          <div><strong>\ub370\uc774\ud130</strong><span>${escapeXml(d.sourceName || d.id)}</span></div>
          <div><strong>\ud589 \uc218</strong><span>${d.rows.length} rows</span></div>
          <div><strong>C-rate</strong><span>${segments.map((segment) => segment.label).join(" | ") || "-"}</span></div>
          <div><strong>\uc804\uadf9 \uacc4\uc0b0</strong><span>${savedCalc ? `${escapeXml(savedCalc.profileName || "\uae30\uc900 \uacc4\uc0b0")} \u00b7 1C ${fixed(oneC, 4)} mA` : (manual ? "\ub9e4\ub274\uc5bc \uae30\uc900" : "-")}</span></div>
        </div>
        <table><thead><tr><th>C-rate</th><th>Cycle</th><th>\ud3c9\uade0 \ubc29\uc804 \uc6a9\ub7c9 (mAh g-1)</th><th>\ud3c9\uade0 \uc804\ub958 (mA)</th><th>\uc608\uc0c1 \uc804\ub958 (mA)</th></tr></thead>
        <tbody>${segmentRows.map(([label, range, capacity, current, expected]) => `<tr><td>${escapeXml(label)}</td><td>${escapeXml(range)}</td><td>${capacity == null ? "-" : fmt(capacity, 5)}</td><td>${current == null ? "-" : fmt(current, 5)}</td><td>${expected == null ? "-" : fmt(expected, 5)}</td></tr>`).join("")}</tbody></table>
      </section>`);
  }
  if (state.manualInfo) {
    const sheetCards = (state.manualInfo.sheets || []).slice(0, 8).map((sheet) => {
      const samples = (sheet.samples || []).slice(0, 8);
      return `<section class="infoBlock"><h3>${escapeXml(sheet.sheet)}</h3>
        <div class="infoCards"><div><strong>\uc774\ub860 \uc6a9\ub7c9</strong><span>${sheet.theoreticalCapacity_mAh_g || "-"} mAh g-1</span></div><div><strong>\uc0d8\ud50c \uc218</strong><span>${sheet.sampleCount || 0}</span></div><div><strong>\uc870\uc131</strong><span>${Object.entries(sheet.composition || {}).map(([key, value]) => `${key} ${value}`).join(" / ") || "-"}</span></div></div>
        <table><thead><tr><th>\uc0d8\ud50c</th><th>1C \uc804\ub958 (mA)</th><th>\uc804\uadf9 \ubb34\uac8c (g)</th><th>\ub450\uaed8 (mm)</th><th>NCM mass (g)</th><th>C-rate\ubcc4 \uc804\ub958</th></tr></thead><tbody>${samples.map((sample) => `<tr><td>${escapeXml(sample.sample)}</td><td>${escapeXml(sample.oneC_mA)}</td><td>${escapeXml(sample.electrodeWeight_g)}</td><td>${escapeXml(sample.thickness_mm)}</td><td>${escapeXml(sample.ncmMass_g)}</td><td>${(sample.rateCurrents || []).map((rate) => `${escapeXml(rate.rate)} ${escapeXml(rate.current_mA)} mA`).join(" / ") || "-"}</td></tr>`).join("")}</tbody></table></section>`;
    }).join("");
    blocks.push(`<section class="infoBlock"><h3>\ub9e4\ub274\uc5bc \ucc38\uace0 \ud30c\uc77c</h3><p>${escapeXml(state.manualInfo.filename)} \u00b7 ${state.manualInfo.sheetCount} sheets</p></section>${sheetCards}`);
  }
  if (!blocks.length) blocks.push('<section class="infoBlock emptyInfo"><h3>\uc2e4\ud5d8 \uc815\ubcf4 \uc5c6\uc74c</h3><p>CYC Fig\ub97c \uc120\ud0dd\ud558\uac70\ub098 \ub9e4\ub274\uc5bc \ucc38\uace0 \ud30c\uc77c\uc744 \ubd88\ub7ec\uc624\uba74 C-rate\uc640 \uc804\ub958 \uc815\ubcf4\ub97c \uc5ec\uae30\uc5d0 \uc815\ub9ac\ud569\ub2c8\ub2e4.</p></section>');
  panel.innerHTML = blocks.join("");
}

function renderCellWorkspace(d) {
  const title = $("cellRecordTitle");
  const path = $("cellRecordPath");
  const tags = $("cellRecordTags");
  const groupList = $("datasetGroupLibrary");
  const segmentList = $("protocolSegmentList");
  const figureList = $("cellFigureLibrary");
  const reportList = $("cellReportLibrary");
  const form = $("cellMetadataForm");
  if (!title || !path || !tags || !groupList || !segmentList || !figureList || !reportList || !form) return;

  if (!d) {
    title.textContent = "\uc140\uc744 \uc120\ud0dd\ud574\uc8fc\uc138\uc694";
    path.textContent = "Project \u2192 Campaign \u2192 Cell \u2192 Dataset";
    tags.innerHTML = "";
    groupList.innerHTML = segmentList.innerHTML = figureList.innerHTML = reportList.innerHTML = `<span class="recordEmpty">\uc120\ud0dd\ud55c \uc140\uc758 \uae30\ub85d\uc774 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4.</span>`;
    form.reset();
    return;
  }

  const workspace = state.cellWorkspace?.cell?.id === d.cellRecordId ? state.cellWorkspace : null;
  const metadata = workspace?.metadata?.metadata || {};
  const savedTags = Array.isArray(workspace?.metadata?.tags) ? workspace.metadata.tags : [];
  title.textContent = workspace?.cell?.cellId || d.cell?.cellId || "Cell record";
  path.textContent = hierarchyLabel(d) || "Project \u2192 Campaign \u2192 Cell \u2192 Dataset";
  tags.innerHTML = savedTags.map((tag) => `<span>${escapeXml(tag)}</span>`).join("") || `<span class="recordChip">\ud0dc\uadf8 \uc5c6\uc74c</span>`;
  for (const key of ["cathode", "anode", "separator", "spacer", "cellFormat"]) {
    if (form.elements[key]) form.elements[key].value = metadata[key] || "";
  }
  if (form.elements.tags) form.elements.tags.value = savedTags.join(", ");

  const groups = workspace?.datasetGroups || [];
  groupList.innerHTML = groups.length ? groups.map((group) => {
    const typeText = Object.entries(group.dataTypes || {}).map(([type, count]) => `${String(type).toUpperCase()} ${count}`).join(" \u00b7 ") || "\uc544\uc9c1 \ub370\uc774\ud130 \uc5c6\uc74c";
    const current = group.id === d.datasetGroupId ? "\ud604\uc7ac \uc120\ud0dd" : "\uc120\ud0dd";
    return `<div class="recordListItem"><span><strong>${escapeXml(group.name)}</strong><br/><em>${escapeXml(typeText)}</em></span><button type="button" data-select-dataset-group="${escapeAttr(group.id)}">${current}</button></div>`;
  }).join("") : `<span class="recordEmpty">Dataset \ubb36\uc74c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</span>`;

  const segments = workspace?.protocolSegments || [];
  segmentList.innerHTML = segments.length ? segments.map((segment) => {
    const rate = Number.isFinite(Number(segment.cRate)) ? `${segment.cRate} C` : "C-rate \ubbf8\uc785\ub825";
    return `<div class="recordListItem"><span><strong>${escapeXml(segment.label)}</strong><br/><em>${segment.startCycle}-${segment.endCycle} cycle \u00b7 ${escapeXml(rate)} \u00b7 ${escapeXml(segment.mode || "other")}</em></span><button type="button" class="smallDanger" data-delete-segment="${escapeAttr(segment.id)}">\uc0ad\uc81c</button></div>`;
  }).join("") : `<span class="recordEmpty">\ub4f1\ub85d\ud55c \ud504\ub85c\ud1a0\ucf5c \uad6c\uac04\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</span>`;

  const figures = workspace?.figures || [];
  figureList.innerHTML = figures.length ? figures.map((figure) => `<div class="recordListItem"><span><strong>${escapeXml(figure.name)}</strong><br/><em>${escapeXml(figure.figureKind || "figure")}</em></span><button type="button" data-open-figure-record="${escapeAttr(figure.datasetId)}">\uc5f4\uae30</button></div>`).join("") : `<span class="recordEmpty">\uc800\uc7a5\ud55c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</span>`;

  const reports = workspace?.reports || [];
  reportList.innerHTML = reports.length ? reports.map((report) => {
    const lead = String(report.content?.main || report.content?.sections?.main || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 90);
    return `<div class="recordListItem"><span><strong>${escapeXml(report.title)}</strong><br/><em>${escapeXml(lead || report.reportType || "report")}</em></span><button type="button" data-open-report-record="${escapeAttr(report.id)}">\ubcf4\uae30</button></div>`;
  }).join("") : `<span class="recordEmpty">\uc800\uc7a5\ud55c AI \ubcf4\uace0\uc11c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</span>`;

  for (const button of groupList.querySelectorAll("[data-select-dataset-group]")) {
    button.addEventListener("click", () => {
      const select = $("datasetGroupSelect");
      if (select) select.value = button.dataset.selectDatasetGroup;
      renderHierarchyControls({ ...hierarchySelectionPayload(), datasetGroupId: button.dataset.selectDatasetGroup });
      setStatus("\uc120\ud0dd\ud55c Dataset \ubb36\uc74c\uc744 \ub2e4\uc74c \uc800\uc7a5 \uc704\uce58\ub85c \uc124\uc815\ud588\uc2b5\ub2c8\ub2e4.");
    });
  }
  for (const button of segmentList.querySelectorAll("[data-delete-segment]")) {
    button.addEventListener("click", () => deleteProtocolSegment(button.dataset.deleteSegment));
  }
  for (const button of figureList.querySelectorAll("[data-open-figure-record]")) {
    button.addEventListener("click", () => openCellRecordDataset(button.dataset.openFigureRecord));
  }
  for (const button of reportList.querySelectorAll("[data-open-report-record]")) {
    button.addEventListener("click", () => openCellReport(button.dataset.openReportRecord));
  }
}

async function loadCellWorkspace(d = currentDataset()) {
  if (!d?.cellRecordId) {
    state.cellWorkspace = null;
    renderCellWorkspace(d);
    return;
  }
  const requestId = ++state.cellWorkspaceRequestId;
  try {
    const res = await fetch(`/api/cells/${encodeURIComponent(d.cellRecordId)}/workspace`, { headers: authHeaders() });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "\uc140 \uae30\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
    if (requestId !== state.cellWorkspaceRequestId || currentDataset()?.cellRecordId !== d.cellRecordId) return;
    state.cellWorkspace = body;
    renderCellWorkspace(d);
  } catch (error) {
    if (requestId !== state.cellWorkspaceRequestId) return;
    setStatus(error.message || "\uc140 \uae30\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  }
}

async function saveCellMetadata(event) {
  event.preventDefault();
  const d = currentDataset();
  if (!d?.cellRecordId) return setStatus("\uba3c\uc800 \uc800\uc7a5\ub41c \uc140 \ub370\uc774\ud130\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694.");
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form));
  const tags = String(values.tags || "").split(",").map((item) => item.trim()).filter(Boolean);
  delete values.tags;
  try {
    const res = await fetch(`/api/cells/${encodeURIComponent(d.cellRecordId)}/metadata`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ metadata: values, tags }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "\uc140 \uba54\ud0c0\ub370\uc774\ud130 \uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
    state.cellWorkspace = { ...(state.cellWorkspace || {}), cell: state.cellWorkspace?.cell || { id: d.cellRecordId }, metadata: body };
    renderCellWorkspace(d);
    setStatus("\uc140 \uba54\ud0c0\ub370\uc774\ud130\uc640 \ud0dc\uadf8\ub97c \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.");
  } catch (error) {
    setStatus(error.message || "\uc140 \uba54\ud0c0\ub370\uc774\ud130 \uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  }
}

async function saveProtocolSegment(event) {
  event.preventDefault();
  const d = currentDataset();
  if (!d?.cellRecordId) return setStatus("\uba3c\uc800 \uc800\uc7a5\ub41c \uc140 \ub370\uc774\ud130\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694.");
  const values = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const res = await fetch(`/api/cells/${encodeURIComponent(d.cellRecordId)}/protocol-segments`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ ...values, datasetGroupId: d.datasetGroupId || "" }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "\ud504\ub85c\ud1a0\ucf5c \uad6c\uac04 \uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
    event.currentTarget.reset();
    await loadCellWorkspace(d);
    setStatus(`${body.label} \uad6c\uac04\uc744 \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.`);
  } catch (error) {
    setStatus(error.message || "\ud504\ub85c\ud1a0\ucf5c \uad6c\uac04 \uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  }
}

async function deleteProtocolSegment(segmentId) {
  if (!segmentId) return;
  if (!window.confirm("\uc774 \ud504\ub85c\ud1a0\ucf5c \uad6c\uac04\uc744 \uc0ad\uc81c\ud560\uae4c\uc694?")) return;
  try {
    const res = await fetch(`/api/protocol-segments/${encodeURIComponent(segmentId)}`, { method: "DELETE", headers: authHeaders() });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "\ud504\ub85c\ud1a0\ucf5c \uad6c\uac04 \uc0ad\uc81c\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
    await loadCellWorkspace();
    setStatus("\ud504\ub85c\ud1a0\ucf5c \uad6c\uac04\uc744 \uc0ad\uc81c\ud588\uc2b5\ub2c8\ub2e4.");
  } catch (error) {
    setStatus(error.message || "\ud504\ub85c\ud1a0\ucf5c \uad6c\uac04 \uc0ad\uc81c\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  }
}

function openCellRecordDataset(datasetId) {
  const target = state.datasets.find((item) => item.id === datasetId);
  if (!target) return setStatus("\ud604\uc7ac \ubaa9\ub85d\uc5d0\uc11c Fig \ub370\uc774\ud130\uc14b\uc744 \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.");
  state.selectedId = target.id;
  state.activeFigureModule = target.dataType || state.activeFigureModule;
  renderSelect();
  renderSavedList();
  renderCurrent();
  activateView("figure", state.activeFigureModule);
}

function openCellReport(reportId) {
  const report = state.cellWorkspace?.reports?.find((item) => item.id === reportId);
  if (!report) return;
  const message = Object.values(report.content || {}).map((value) => String(value).replace(/<[^>]*>/g, " ")).join("\n\n").slice(0, 4000);
  window.alert(`${report.title}\n\n${message || "\uc800\uc7a5\ub41c \ub0b4\uc6a9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}`);
}

function currentDataset() {
  return state.datasets.find((x) => x.id === state.selectedId) || null;
}

function analysisLabel(name) {
  return {
    retention: "Retention / SOH",
    dqdv: "dQ/dV",
    dva: "DVA (dV/dQ)",
    eis: "EIS summary",
    "pulse-resistance": "Pulse resistance",
    "rate-capability": "Rate capability",
  }[name] || name || "\ubd84\uc11d";
}

function analysisMetricLabel(key) {
  return {
    cycle_count: "\ubd84\uc11d cycle \uc218",
    capacity_field: "\uc6a9\ub7c9 \uae30\uc900 \ud544\ub4dc",
    capacity_unit: "\uc6a9\ub7c9 \ub2e8\uc704",
    initial_capacity: "\ucd08\uae30 \uc6a9\ub7c9",
    final_capacity: "\ub9c8\uc9c0\ub9c9 \uc6a9\ub7c9",
    initial_capacity_mah: "\ucd08\uae30 \uc6a9\ub7c9 (mAh)",
    final_capacity_mah: "\ub9c8\uc9c0\ub9c9 \uc6a9\ub7c9 (mAh)",
    initial_capacity_mah_g: "\ucd08\uae30 \uc6a9\ub7c9 (mAh g-1)",
    final_capacity_mah_g: "\ub9c8\uc9c0\ub9c9 \uc6a9\ub7c9 (mAh g-1)",
    final_retention_pct: "\uc6a9\ub7c9 \uc720\uc9c0\uc728 (%)",
    point_count: "\ubd84\uc11d \ud3ec\uc778\ud2b8 \uc218",
    pulse_count: "pulse \uc218",
    group_count: "C-rate \uadf8\ub8f9 \uc218",
  }[key] || key.replaceAll("_", " ");
}

function formatAnalysisMetric(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value.toPrecision(6) : "-";
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function renderAnalysisResult(run) {
  const resultNode = $("analysisRunResult");
  const statusNode = $("analysisRunStatus");
  if (!resultNode || !statusNode) return;
  const dataset = currentDataset();
  if (!dataset) {
    statusNode.innerHTML = "<strong>\ubd84\uc11d\ud560 \ub370\uc774\ud130\uc14b\uc744 \uba3c\uc800 \uc120\ud0dd\ud558\uc138\uc694.</strong>";
    resultNode.innerHTML = "";
    return;
  }
  const provenance = run?.provenance || {};
  statusNode.innerHTML = `
    <strong>${escapeXml(datasetDisplayName(dataset))}</strong>
    <span>${escapeXml((dataset.dataType || "data").toUpperCase())} - ${dataset.parsedArtifact?.objectKey ? "BDF \uc815\uaddc\ud654 \ub370\uc774\ud130 \uc6b0\uc120" : "\uae30\uc874 \ub370\uc774\ud130"}</span>
    ${run ? `<span>${escapeXml(analysisLabel(run.analysisName))} - ${escapeXml(run.createdAt || "")}</span>` : "<span>\ubd84\uc11d \ubc29\ubc95\uc744 \uc120\ud0dd\ud558\uace0 \uc2e4\ud589\ud574 \uc8fc\uc138\uc694.</span>"}
    ${run?.provenance ? `<small>\ub370\uc774\ud130 \ucd9c\ucc98: ${escapeXml(provenance.rowSource || "dataset-rows")} - \ud488\uc9c8 \uc81c\uc678 \ud589: ${Number(provenance.excludedQualityRowCount || 0)}</small>` : ""}
  `;
  if (!run) {
    resultNode.innerHTML = "<p class=\"analysisEmpty\">\ubd84\uc11d \ubc29\ubc95\uc744 \uc120\ud0dd\ud558\uace0 \uc2e4\ud589\ud558\uba74 \uacb0\uacfc\uac00 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4.</p>";
    return;
  }
  const result = run.result || {};
  if (run.status !== "ok") {
    resultNode.innerHTML = `<div class="analysisUnavailable"><strong>\ubd84\uc11d \uacb0\uacfc\ub97c \ub9cc\ub4e4 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.</strong><span>${escapeXml(result.reason || "\ub370\uc774\ud130 \ud615\uc2dd\uacfc \ud544\uc218 \uceec\ub7fc\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.")}</span></div>`;
    return;
  }
  const metrics = Object.entries(result)
    .filter(([key, value]) => !["status", "reason", "parameters", "points", "groups", "pulses", "frequency_hz", "z_real_ohm", "z_imag_ohm"].includes(key) && (typeof value !== "object" || value === null));
  const metricHtml = metrics.length
    ? `<dl class="analysisMetricGrid">${metrics.map(([key, value]) => `<div><dt>${escapeXml(analysisMetricLabel(key))}</dt><dd>${escapeXml(formatAnalysisMetric(value))}</dd></div>`).join("")}</dl>`
    : "";
  const rangeHtml = ["frequency_hz", "z_real_ohm", "z_imag_ohm"].filter((key) => result[key]).map((key) => {
    const range = result[key] || {};
    return `<div><dt>${escapeXml(analysisMetricLabel(key))}</dt><dd>${escapeXml(formatAnalysisMetric(range.min))} to ${escapeXml(formatAnalysisMetric(range.max))}</dd></div>`;
  }).join("");
  const groupHtml = Array.isArray(result.groups) && result.groups.length
    ? `<div class="analysisDataTable"><h4>C-rate capacity</h4><table><thead><tr><th>C-rate</th><th>cycles</th><th>mean capacity</th></tr></thead><tbody>${result.groups.map((group) => `<tr><td>${escapeXml(formatAnalysisMetric(group.c_rate))}</td><td>${escapeXml(formatAnalysisMetric(group.cycle_count))}</td><td>${escapeXml(formatAnalysisMetric(group.mean_specific_capacity_mah_g))}</td></tr>`).join("")}</tbody></table></div>`
    : "";
  const pulseHtml = Array.isArray(result.pulses) && result.pulses.length
    ? `<div class="analysisDataTable"><h4>Pulse resistance</h4><table><thead><tr><th>time (s)</th><th>delta I (A)</th><th>R (ohm)</th></tr></thead><tbody>${result.pulses.slice(0, 12).map((pulse) => `<tr><td>${escapeXml(formatAnalysisMetric(pulse.time_s))}</td><td>${escapeXml(formatAnalysisMetric(pulse.delta_current_a))}</td><td>${escapeXml(formatAnalysisMetric(pulse.resistance_ohm))}</td></tr>`).join("")}</tbody></table></div>`
    : "";
  const pointNote = Array.isArray(result.points) ? `<p class="analysisPointNote">\uace1\uc120 \ucd94\ucd9c\uc5d0 \uc0ac\uc6a9\ud55c ${result.points.length}\uac1c \ud3ec\uc778\ud2b8\ub294 \uacb0\uacfc JSON \uc544\ud2f0\ud329\ud2b8\uc5d0 \ubcf4\uc874\ub429\ub2c8\ub2e4.</p>` : "";
  resultNode.innerHTML = `<div class="analysisResultTitle"><span class="analysisState ok">\uc644\ub8cc</span><h3>${escapeXml(analysisLabel(run.analysisName))}</h3></div>${metricHtml}${rangeHtml ? `<dl class="analysisMetricGrid">${rangeHtml}</dl>` : ""}${groupHtml}${pulseHtml}${pointNote}`;
}

function renderAnalysisLab() {
  const select = $("analysisLabDatasetSelect");
  const typeSelect = $("analysisType");
  const binField = $("dqdvBinField");
  if (!select || !typeSelect) return;
  const selectedId = state.selectedId || state.datasets[0]?.id || "";
  if (selectedId && selectedId !== state.selectedId) state.selectedId = selectedId;
  select.innerHTML = state.datasets.length
    ? state.datasets.map((dataset) => `<option value="${escapeAttr(dataset.id)}" ${dataset.id === state.selectedId ? "selected" : ""}>${escapeXml(datasetDisplayName(dataset))} \u00b7 ${escapeXml((dataset.dataType || "data").toUpperCase())}</option>`).join("")
    : "<option value=\"\">\uc800\uc7a5\ub41c \ub370\uc774\ud130\uc14b\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</option>";
  if (state.pendingAnalysisName) {
    typeSelect.value = state.pendingAnalysisName;
    state.pendingAnalysisName = "";
  } else if (!typeSelect.value && currentDataset()?.dataType === "eis") {
    typeSelect.value = "eis";
  }
  binField?.classList.toggle("hidden", typeSelect.value !== "dqdv");
  const selectedRun = state.analysisRuns.find((run) => run.id === state.selectedAnalysisRunId) || state.analysisRuns[0] || null;
  if (selectedRun && selectedRun.id !== state.selectedAnalysisRunId) state.selectedAnalysisRunId = selectedRun.id;
  renderAnalysisResult(selectedRun);
  const list = $("analysisRunList");
  if (!list) return;
  list.innerHTML = state.analysisRuns.length
    ? state.analysisRuns.map((run) => `<button type="button" class="analysisRunItem${run.id === state.selectedAnalysisRunId ? " active" : ""}" data-analysis-run-id="${escapeAttr(run.id)}"><strong>${escapeXml(analysisLabel(run.analysisName))}</strong><span>${escapeXml(run.status)} \u00b7 ${escapeXml(run.createdAt || "")}</span></button>`).join("")
    : "<p class=\"analysisEmpty\">\uc774 \ub370\uc774\ud130\uc14b\uc758 \ubd84\uc11d \uc774\ub825\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.</p>";
  for (const button of list.querySelectorAll("[data-analysis-run-id]")) {
    button.addEventListener("click", () => {
      state.selectedAnalysisRunId = button.dataset.analysisRunId;
      renderAnalysisLab();
    });
  }
}

async function loadAnalysisRuns() {
  const dataset = currentDataset();
  if (!dataset) {
    state.analysisRuns = [];
    state.selectedAnalysisRunId = null;
    renderAnalysisLab();
    return;
  }
  const res = await fetch(`/api/datasets/${encodeURIComponent(dataset.id)}/analyses`, { headers: authHeaders() });
  const body = await res.json().catch(() => []);
  if (!res.ok) throw new Error(body.detail || body.error || "\ubd84\uc11d \uc774\ub825\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
  state.analysisRuns = Array.isArray(body) ? body : [];
  if (!state.analysisRuns.some((run) => run.id === state.selectedAnalysisRunId)) state.selectedAnalysisRunId = state.analysisRuns[0]?.id || null;
  renderAnalysisLab();
}

async function runSelectedDatasetAnalysis() {
  const datasetId = $("analysisLabDatasetSelect")?.value || state.selectedId;
  const analysisName = $("analysisType")?.value || "retention";
  if (!datasetId) return setStatus("\ubd84\uc11d\ud560 \ub370\uc774\ud130\uc14b\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.");
  state.selectedId = datasetId;
  const parameters = { includeReviewRows: Boolean($("includeReviewRows")?.checked) };
  if (analysisName === "dqdv") parameters.voltageBinV = Number($("dqdvVoltageBin")?.value || 0.005);
  const button = $("runDatasetAnalysis");
  if (button) {
    button.disabled = true;
    button.textContent = "\ubd84\uc11d \uc2e4\ud589 \uc911...";
  }
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(datasetId)}/analyses`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ analysisName, parameters }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.detail || body.error || "\ubd84\uc11d \uc2e4\ud589\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
    state.analysisRuns = [body, ...state.analysisRuns.filter((run) => run.id !== body.id)];
    state.selectedAnalysisRunId = body.id;
    renderAnalysisLab();
    setStatus(`${analysisLabel(analysisName)} \ubd84\uc11d\uc744 \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.`);
  } catch (error) {
    setStatus(error.message || "\ubd84\uc11d \uc2e4\ud589\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "\uc120\ud0dd \ubd84\uc11d \uc2e4\ud589";
    }
  }
}

function sampleLabel(d) {
  if (!d) return "?\uc88f\uae6e ?\ub181\uc4ec";
  return figureDatasetLabel(d);
}

// ?\u30ec\uc604 \u8adb\uacd7\ubff4?\uba2f\uaf4c \uf9e4\uc496\ub0fc/\uf9e4\uc495? \u8e30\ubdbf\uc41e\u745c?\u63f4\u044b\ube40?\ub348\ub58e.
// CV ?\uafa9\ube2c \u8e30\ubdbf\uc41e, EIS \u4e8c\uc1f3\ub646??\u8e30\ubdbf\uc41e\uf9e3\uc10e\uc746 "?\ubdbf\ube5f \u81fe\uba84\uc623\\u003f\\u003f\\u003f?\u8e30\ubdbf\uc41e"\u745c?\uf9cd\ub6ae\ubc7e \\u003f\\u003f\\u003f\u044a\uad97?\u247a\ube40?\ub348\ub58e.
function rangeOf(nums) {
  const arr = nums.filter(Number.isFinite);
  return arr.length ? [Math.min(...arr), Math.max(...arr)] : [null, null];
}

// CYC ?\uacd7\uc520\\u003f\\u003f\\u003f\ubdbf\ube5f\\u003f\\u003f\\u003f\uafa9\uc282\\u003f\\u003f\\u003f\ub4ed\ub596 \uf9de\u0080?\uc495? ??\u8e30\ub349\ubfc9 \u6028\uafa9\uad9b?\u2478\ub572??
// \u73e5\ub347\ub9b0/\uf9cd\ub349?\uf9cd??\u2478\uc6fe?\u0080 ?\uba84\uc520\uf9dd\ub348? \u4ee5\uafa9\uc520?\u317a\ud02c ??3\u5a9b? ??3\u5a9b\uc496\uc4fd ?\ub42f\ud1cf\\u003f\\u003f\\u003f\u044a\uc29c?\u2478\ub572??
function cycStats(d) {
  const rows = (d?.rows || []).filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle);
  const capPts = dischargeSeries(rows).sort((a, b) => a.x - b.x);
  const firstWindow = capPts.slice(0, Math.min(3, capPts.length));
  const lastWindow = capPts.slice(Math.max(0, capPts.length - 3));
  const firstCap = average(firstWindow.map((p) => p.y));
  const lastCap = average(lastWindow.map((p) => p.y));
  const maxCap = Math.max(...capPts.map((p) => p.y).filter(Number.isFinite), NaN);
  const minCap = Math.min(...capPts.map((p) => p.y).filter(Number.isFinite), NaN);
  const retention = Number.isFinite(firstCap) && firstCap > 0 && Number.isFinite(lastCap) ? lastCap / firstCap * 100 : null;
  const fromBest = Number.isFinite(maxCap) && maxCap > 0 && Number.isFinite(lastCap) ? lastCap / maxCap * 100 : null;
  const efficiencyVals = rows.map((r) => Number(r.efficiency)).filter(Number.isFinite);
  const avgEfficiency = average(efficiencyVals);
  const [cycleMin, cycleMax] = rangeOf(rows.map((r) => Number(r.cycle)));
  const segments = inferCRateSegments(d, rows, capPts);
  return { rows, capPts, firstCap, lastCap, maxCap, minCap, retention, fromBest, avgEfficiency, cycleMin, cycleMax, segments };
}

// cycle ?\u044a\uc520?\uba2f\uaf4c ?\u2478\uc6fe??\u6e72\ub42f\uaebd??\u4ee5\uafa9\ubf31??\u63f4\u0448\uced9??\uf9e1\uc5a0\ub4bf?\ub348\ub58e.
// \u6e72\uacd7??\u0080 2% ?\ub301\uae3d \u5a9b\uba2f\ub0fc ?\uba2e\ub497 5 mAh g-1 ?\ub301\uae3d \u5a9b\uba2f\ub0fc?\ub300\u0149, ??\u5a9b\uba2f\ub0fc ?\uc496\uaf4c?\u0080\u6fe1?\uf9e4\uc495? 5\u5a9b\uc495\ucb54 \u8e42\ub301\ubfec\u4ee5\ub77e\ub572??
function degradationSegments(stats) {
  const pts = stats.capPts || [];
  if (pts.length < 4) return [];
  const drops = [];
  for (let i = 1; i < pts.length; i += 1) {
    const prev = pts[i - 1];
    const curr = pts[i];
    if (!prev || !curr || !Number.isFinite(prev.y) || prev.y <= 0) continue;
    const loss = prev.y - curr.y;
    const lossPct = loss / prev.y * 100;
    if (lossPct >= 2 || loss >= 5) {
      drops.push({ start: prev.x, end: curr.x, loss, lossPct, from: prev.y, to: curr.y });
    }
  }
  return drops.sort((a, b) => b.lossPct - a.lossPct).slice(0, 5);
}

// "\\u003f\\u003f\\u003f\uacd7\uc520?\uacd7\uc4fd \u4e8c\uc1f1\uc282 \u5bc3\uaccc\ub0b5 ?\ubdbf\ube5f" \u79fb\ub300\ubc76\\u003f\\u003f\\u003f\u317c\ubf31\u5a9b?HTML??\uf9cd\ub6ae\ubc8a?\ub348\ub58e.
// ?\u317c\uc823 ?\uba83? AI API\u745c??\uba84\ud167?\uc10f? ?\ub504\ud02c, ?\u044b\uae49\\u003f\\u003f\\u003f\ub348\ub497 ?\u317d\ubfd5 ?\uacd7\uc520?\uacd5? \u6028\uafa9\uad9b?\ub301\uaf4c ?\u317b\ucc78??\u81fe\uba84\uc623?\uc1f0\uc908 \u8e42\u0080?\uc111\ube40?\ub348\ub58e.
function aiMainSummaryHtml(d) {
  if (!d) return `<p class="aiEmpty">\uc694\uc57d\ud560 \ub370\uc774\ud130\ub97c \uba3c\uc800 \uc120\ud0dd\ud558\uc138\uc694. \uc67c\ucabd \ub370\uc774\ud130 \ubaa9\ub85d\uc774\ub098 \uac80\uc0c9 \uacb0\uacfc\uc5d0\uc11c CYC/CV/EIS \ub370\uc774\ud130\ub97c \uc120\ud0dd\ud558\uba74 \uc5ec\uae30\uc5d0 \uc790\ub3d9 \uc694\uc57d\uc774 \ud45c\uc2dc\ub429\ub2c8\ub2e4.</p>`;
  const type = String(d.dataType || "").toLowerCase();
  if (type === "cyc") {
    const s = cycStats(d);
    const rateText = s.segments?.length ? s.segments.map((seg) => seg.label).join(" | ") : "\uc790\ub3d9 \uad6c\uac04 \uc5c6\uc74c";
    const quality = s.retention == null ? "\uc6a9\ub7c9 \uc720\uc9c0\uc728\uc744 \uacc4\uc0b0\ud558\uae30\uc5d0\ub294 \ub370\uc774\ud130\uac00 \ubd80\uc871\ud569\ub2c8\ub2e4." : (s.retention >= 95 ? "\uc6a9\ub7c9 \uc720\uc9c0\uac00 \ub9e4\uc6b0 \uc548\uc815\uc801\uc785\ub2c8\ub2e4." : s.retention >= 85 ? "\uc911\uac04 \uc218\uc900\uc758 \uc6a9\ub7c9 \uac10\uc18c\uac00 \uad00\ucc30\ub429\ub2c8\ub2e4." : "\ub69c\ub837\ud55c \uc131\ub2a5 \uc800\ud558\uac00 \uad00\ucc30\ub429\ub2c8\ub2e4.");
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}\ub294 ${s.cycleMin ?? "-"}-${s.cycleMax ?? "-"} cycle \ubc94\uc704\uc758 CYC \ub370\uc774\ud130\uc774\uba70, ${quality}</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>\ucd08\uae30 \uc6a9\ub7c9</strong><span>${s.firstCap == null ? "-" : `${fmt(s.firstCap, 5)} mAh g-1`}</span></div>
        <div class="aiMetric"><strong>\ub9c8\uc9c0\ub9c9 \uc6a9\ub7c9</strong><span>${s.lastCap == null ? "-" : `${fmt(s.lastCap, 5)} mAh g-1`}</span></div>
        <div class="aiMetric"><strong>\uc720\uc9c0\uc728</strong><span>${s.retention == null ? "-" : `${fmt(s.retention, 4)} %`}</span></div>
        <div class="aiMetric"><strong>\ud3c9\uade0 \ud6a8\uc728</strong><span>${s.avgEfficiency == null ? "-" : `${fmt(s.avgEfficiency, 5)} %`}</span></div>
      </div>
      <ul class="aiBulletList">
        <li>\uac00\uc7a5 \ub192\uc740 \ubc29\uc804 \uc6a9\ub7c9\uc740 ${Number.isFinite(s.maxCap) ? `${fmt(s.maxCap, 5)} mAh g-1` : "-"} \uc218\uc900\uc785\ub2c8\ub2e4.</li>
        <li>C-rate \ucd94\uc815 \uad6c\uac04\uc740 ${escapeXml(rateText)}\uc785\ub2c8\ub2e4.</li>
        <li>\uc804\uadf9 \uacc4\uc0b0\uac12\uc774 \uc5f0\uacb0\ub41c \uacbd\uc6b0 loading caption\uacfc \uae30\uc900 \uc804\ub958 \uc124\uba85\uc5d0 \ud568\uaed8 \ubc18\uc601\ub429\ub2c8\ub2e4.</li>
      </ul>`;
  }
  if (type === "eis") {
    const rows = eisPlotRows(d.rows);
    const [fMin, fMax] = rangeOf(rows.map((r) => Number(r.frequency)));
    const [zrMin, zrMax] = rangeOf(rows.map((r) => Number(r.zreal)));
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}\ub294 ${rows.length}\uac1c \ud3ec\uc778\ud2b8\uc758 EIS \ub370\uc774\ud130\uc785\ub2c8\ub2e4. \uc8fc\ud30c\uc218\uc640 \uc784\ud53c\ub358\uc2a4 \ubc94\uc704\ub97c \uc911\uc2ec\uc73c\ub85c Nyquist/Bode \ud574\uc11d\uc5d0 \uc0ac\uc6a9\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>\ud3ec\uc778\ud2b8 \uc218</strong><span>${rows.length}</span></div>
        <div class="aiMetric"><strong>\uc8fc\ud30c\uc218 \ubc94\uc704</strong><span>${fMin == null ? "-" : `${fmt(fMin, 3)}-${fmt(fMax, 3)}`}</span></div>
        <div class="aiMetric"><strong>Z' \ubc94\uc704</strong><span>${zrMin == null ? "-" : `${fmt(zrMin, 4)}-${fmt(zrMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>\ub370\uc774\ud130 \ud0c0\uc785</strong><span>EIS</span></div>
      </div>`;
  }
  if (type === "cv") {
    const rows = d.rows || [];
    const [vMin, vMax] = rangeOf(rows.map((r) => Number(r.voltage)));
    const [iMin, iMax] = rangeOf(rows.map((r) => Number(r.current)));
    return `
      <p class="aiSummaryLead">${escapeXml(sampleLabel(d))}\ub294 ${rows.length}\uac1c \ud3ec\uc778\ud2b8\uc758 CV \ub370\uc774\ud130\uc785\ub2c8\ub2e4. \uc804\uc555-\uc804\ub958 \ubc94\uc704\uc640 peak \ubcc0\ud654 \ube44\uad50\uc5d0 \uc0ac\uc6a9\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p>
      <div class="aiMetricGrid">
        <div class="aiMetric"><strong>\ud3ec\uc778\ud2b8 \uc218</strong><span>${rows.length}</span></div>
        <div class="aiMetric"><strong>\uc804\uc555 \ubc94\uc704</strong><span>${vMin == null ? "-" : `${fmt(vMin, 4)}-${fmt(vMax, 4)} V`}</span></div>
        <div class="aiMetric"><strong>\uc804\ub958 \ubc94\uc704</strong><span>${iMin == null ? "-" : `${fmt(iMin, 4)}-${fmt(iMax, 4)}`}</span></div>
        <div class="aiMetric"><strong>\ub370\uc774\ud130 \ud0c0\uc785</strong><span>CV</span></div>
      </div>`;
  }
  return `<p class="aiEmpty">${escapeXml(typeDisplay(type))} \ub370\uc774\ud130\ub294 \ud604\uc7ac \uae30\ubcf8 \uc694\uc57d\ub9cc \uc9c0\uc6d0\ud569\ub2c8\ub2e4. CYC \ub370\uc774\ud130\ub97c \uc120\ud0dd\ud558\uba74 \uc131\ub2a5 \uc800\ud558\uc640 \ube44\uad50 \uc124\uba85\uae4c\uc9c0 \uc790\ub3d9 \uacc4\uc0b0\ub429\ub2c8\ub2e4.</p>`;
}

// "?\uae45\ub4ab ?\u0080??\u63f4\u0448\uced9 ?\uc496\ub586" \u79fb\ub300\ubc76?\ub085\ub572??
// CYC\u5a9b\u0080 ?\uafa8\ub576 ?\uacd7\uc520?\uacd5\ub497 ?\uafa9\ucb45 ?\u0080??\u63f4\u0448\uced9 \u5a9b\uc495\ub017??\uf9cf\ub087\uc197?\uc10f? ?\ub506\ube18 ?\ub348\uada1 \u81fe\uba78\ub384\uf9cd?\u8e42\ub301\ubfec\u4ee5\ub77e\ub572??
function aiDegradationHtml(d) {
  if (!d) return `<p class="aiEmpty">?\uacd7\uc520?\uacd5? ?\uc88f\uae6e?\uc10e\u3203 ?\uae45\ub4ab ?\u0080??\u63f4\u0448\uced9??\u6028\uafa9\uad9b?\u2478\ub572??</p>`;
  if (String(d.dataType || "").toLowerCase() !== "cyc") return `<p class="aiEmpty">?\uae45\ub4ab ?\u0080??\u63f4\u0448\uced9 ?\uc496\ub586??CYC ?\uacd7\uc520?\uacd7\ubfc9\\u003f\\u003f\\u003f\uacd7\uaf51 \uf9de\u0080?\uba2e\ub9d7?\ub348\ub58e.</p>`;
  const stats = cycStats(d);
  const drops = degradationSegments(stats);
  if (!drops.length) {
    return `<p class="aiSummaryLead">2% ?\ub301\uae3d \u6e72\ub42f\uaebd??cycle-to-cycle ?\u2478\uc6fe ?\u0080?\uc10e\ub497 ?\uc495\uc846?\uc10d\ucfb6 \u8e42\ub301\uc520\uf9de\u0080 ?\ub506\ub4bf?\ub348\ub58e.</p>
      <ul class="aiBulletList">
        <li>?\uafa9\uaedc ?\uc88e\\u003f\\u003f\\u003f ${stats.retention == null ? "-" : `${fmt(stats.retention, 4)} %`}</li>
        <li>\uf9e4\uc493\ud02c ?\u2478\uc6fe ?\u0080\u936e?\uf9cd\ub349?\uf9cd??\u2478\uc6fe: ${stats.fromBest == null ? "-" : `${fmt(stats.fromBest, 4)} %`}</li>
      </ul>`;
  }
  return `<div class="aiDegradeList">${drops.map((drop) => `
    <div class="aiSegment">
      <strong>Cycle ${escapeXml(drop.start)} -> ${escapeXml(drop.end)}</strong>
      <span>?\u2478\uc6fe??${fmt(drop.from, 5)}?\uba2f\uaf4c ${fmt(drop.to, 5)} mAh g-1\u6fe1?\u5a9b\uba2f\ub0fc?\ub349\ub4bf?\ub348\ub58e. \u5a9b\uba2f\ub0fc\\u003f\\u003f\\u003f ${fmt(drop.loss, 4)} mAh g-1, ??${fmt(drop.lossPct, 4)}%?\ub085\ub572??</span>
    </div>`).join("")}</div>`;
}

// "\u936e\uafa7\ud0f3 \u5bc3\uaccc\ub0b5 ?\u317b\ucc78" \u79fb\ub300\ubc76?\ub085\ub572??
// Fig \uf9cf\u2465\uc4ec?\uba2f\uaf4c \uf9e3\ub304\uac95??CYC ?\uacd7\uc520?\uacd5\ubc7e??\u936e\uafa7\ud0f3 ?\u0080?\uacf8\uc45d\u6fe1??\u044a\uc29c?\u2478\ub572??
function comparisonSummaryHtml() {
  const selected = state.compareIds
    .map((id) => state.datasets.find((d) => d.id === id))
    .filter((d) => d && d.dataType === "cyc");
  if (selected.length < 2) {
    return `<p class="aiEmpty">\u936e\uafa7\ud0f3 \u5bc3\uaccc\ub0b5 ?\u317b\ucc78??\u8e42\ub300\uc82e\uf9ce?Fig \uf9cf\u2465\uc4ec?\uba2f\uaf4c CYC ?\uacd7\uc520?\uacd5? 2\u5a9b??\ub301\uae3d \uf9e3\ub304\uac95\\u003f\\u003f\\u003f\\u003f\\u003f\\u003f?\uc10f\uc520\uf9de\u0080\u6fe1??\ub6af\ube18?\u317c\uaf6d?? ?\uafa9\uc631 ?\uc88f\uae6e??\u936e\uafa7\ud0f3 ?\u0080?\uacf8? ${selected.length}\u5a9b\uc496\uc5ef?\ub348\ub58e.</p>`;
  }
  const rows = selected.map((d) => ({ d, stats: cycStats(d) }));
  const ranked = [...rows].sort((a, b) => (b.stats.lastCap || 0) - (a.stats.lastCap || 0));
  const best = ranked[0];
  const stable = [...rows].filter((item) => item.stats.retention != null).sort((a, b) => b.stats.retention - a.stats.retention)[0];
  return `
    <p class="aiSummaryLead">${selected.length}\u5a9b?CYC ?\uacd7\uc520?\uacd5? \u936e\uafa7\ud0f3?\ub349\ub4bf?\ub348\ub58e. \uf9cd\ub349?\uf9cd??\u2478\uc6fe \u6e72\uacd7??\uc1f0\uc908??${escapeXml(sampleLabel(best.d))}\u5a9b\u0080 \u5a9b\u0080\\u003f\\u003f\\u003f\ubbea\ub4bf?\ub348\ub58e.</p>
    <div class="aiCompareList">
      ${ranked.map((item, idx) => `
        <div class="aiCompareItem">
          <strong>${idx + 1}. ${escapeXml(sampleLabel(item.d))}</strong>
          <span>\uf9cd\ub349?\uf9cd??\u2478\uc6fe ${item.stats.lastCap == null ? "-" : `${fmt(item.stats.lastCap, 5)} mAh g-1`} \uca0c ?\uc88e\\u003f\\u003f\\u003f${item.stats.retention == null ? "-" : `${fmt(item.stats.retention, 4)} %`} \uca0c ${item.stats.cycleMin ?? "-"}-${item.stats.cycleMax ?? "-"} cycle</span>
        </div>`).join("")}
    </div>
    <ul class="aiBulletList">
      <li>?\u2478\uc6fe ?\uc88e\\u003f\\u003f\\u003f\u6e72\uacd7??\uc1f0\uc908??${stable ? escapeXml(sampleLabel(stable.d)) : "-"}\u5a9b\u0080 \u5a9b\u0080\\u003f\\u003f\\u003f\ub349\uc819?\uacf8\uc45d\u6fe1?\u8e42\ub301\uc5ef?\ub348\ub58e.</li>
      <li>?\uc1f0\u0426??\u936e\uafa7\ud0f3 ?\u317b\ucc78?\uba2f\uaf4c??\uf9cd\ub349?\uf9cd??\u2478\uc6fe, ?\uc88e\\u003f\\u003f\\u003f cycle \u8e30\ubdbf\uc41e\u745c??\u2463\ud361 ?\uc496\ub586?\uc10e\ub497 \u5bc3\uaecb\uc520 \u91ab\ub5ed\ub4bf?\ub348\ub58e.</li>
    </ul>`;
}

// AI ?\ubdbf\ube5f ?\uc10f\uc520\uf9de\u0080 ?\uafa9\uaedc\u745c??\u317c\ub586 \u6d39\uba83\u2530?\ub348\ub58e.
// ?\uacd7\uc520\\u003f\\u003f\\u003f\uc88f\uae6e, \u936e\uafa7\ud0f3 \uf9e3\ub304\uac95, ?\ub348\uc908\u6028\uc88e\ubb20 \u8e30\uafaa\ub4c9\\u003f\\u003f\\u003f\ub6ae\u252b \\u003f\\u003f\\u003f??\u2465\ub2d4\u745c??\uba84\ud167?\uc10e\u3203 \uf9e4\uc496\ub58a ?\uacf9\uae6d\u5a9b\u0080 \u8adb\uc10f\uc07a?\u2478\ub572??
function aiValue(value, unit = "", digits = 5) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${fmt(n, digits)}${unit ? ` ${unit}` : ""}`;
}

function aiPercent(value, digits = 4) {
  const n = Number(value);
  return Number.isFinite(n) ? `${fmt(n, digits)} %` : "-";
}

function aiStatusFromCyc(stats) {
  const retention = Number(stats?.retention);
  if (!Number.isFinite(retention)) return { label: "\ub370\uc774\ud130 \ubd80\uc871", tone: "neutral", text: "AI \uc694\uc57d \ud654\uba74\uc740 \ud604\uc7ac \ube44\ud65c\uc131\ud654\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4." };
  return { label: retention >= 90 ? "\uc548\uc815" : "\uac80\ud1a0 \ud544\uc694", tone: retention >= 90 ? "good" : "warning", text: "AI \uc694\uc57d \ud654\uba74\uc740 \ud604\uc7ac \ube44\ud65c\uc131\ud654\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4." };
}

function aiMainSummaryV2Html() { return ""; }
function aiDegradationV2Html() { return ""; }
function aiInsightSummaryHtml() { return ""; }
function aiWritingSummaryHtml() { return ""; }
function comparisonSummaryV2Html() { return ""; }
function aiLoadingHtml() { return ""; }
function aiApiNoticeHtml() { return ""; }
function aiSectionFromApiHtml(_section, fallbackHtml) { return fallbackHtml || ""; }

function renderLocalAISummary() {
  // AI Summary is intentionally hidden from the portal UI.
  const status = $("aiSummaryStatus");
  const content = $("aiSummaryContent");
  if (status) status.textContent = "";
  if (content) content.innerHTML = "";
}

/* Legacy duplicate renderTable renderer removed; the clean authoritative definition below is used. */

/* Legacy duplicate bindEditableTable renderer removed; the clean authoritative definition below is used. */

function coerceTableValue(text, previous) {
  const trimmed = String(text ?? "").trim();
  if (trimmed === "") return "";
  const numeric = Number(trimmed.replace(/,/g, ""));
  if (Number.isFinite(numeric) && (typeof previous === "number" || /^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i.test(trimmed.replace(/,/g, "")))) {
    return numeric;
  }
  return trimmed;
}

function applyTableCellEdit(cell) {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return;
  const rowIndex = Number(cell.dataset.rowIndex);
  const key = cell.dataset.key;
  if (!Number.isInteger(rowIndex) || !key || !d.rows[rowIndex]) return;
  const previous = d.rows[rowIndex][key];
  const next = coerceTableValue(cell.textContent, previous);
  if (next === previous || String(next) === String(previous ?? "")) return;
  d.rows[rowIndex][key] = next;
  state.datasets = state.datasets.map((item) => item.id === d.id ? d : item);
  state.filtered = state.filtered.map((item) => item.id === d.id ? d : item);
  renderFigure(d);
  renderExperimentInfo(d);
  scheduleRowsSave(d);
}

function scheduleRowsSave(d) {
  clearTimeout(state.tableSaveTimer);
  setStatus("\ud45c \uc218\uc815 \ub0b4\uc6a9\uc744 \uc800\uc7a5 \uc911...");
  state.tableSaveTimer = setTimeout(() => saveRowsEdit(d), 650);
}

async function saveRowsEdit(d) {
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ rows: d.rows }),
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || "\ud45c \uc800\uc7a5 \uc2e4\ud328");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    setStatus("\ud45c \uc218\uc815 \ub0b4\uc6a9\uc774 Fig\uc640 DB\uc5d0 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
  } catch (error) {
    setStatus(`\ud45c \uc800\uc7a5 \uc2e4\ud328: ${error.message}`);
  }
}

// ?\uc10e\ub592 "?\ubb12? ?\uacd7\uc520?? ?\uc495? ?\ubb12? ?\u317d\ubd3d?\ub348\ubc76?\uc497\ub4c3\uf9e3\uc10e\uc746 ?\u317b\uff08??\u6e72\uacd5\ub4ab?\ub085\ub572??
// ?\u0080 \uf9de\uacf8\uc812 ?\uc10f\uc819, Tab/Enter ?\ub300\ub8de, ?\u0449\uc72d \u79fb?\u907a\uc208\ubfec?\uff4a\ub9b0, ??\u7570\ubdbd?/??\uc823, ?\uba2e\ub8de ?\u0080?\u03bc\uc4e3 ??\u81fe\ub760\uc4ec?\uba2f\uaf4c \uf9e3\uc10e\u2501?\u2478\ub572??
function tableColumnDefs(d) {
  const preferred = {
    cyc: [
      ["cycle", "Cycle"],
      ["capacity", "Discharge capacity"],
      ["chargeCapacity", "Charge capacity"],
      ["efficiency", "Efficiency"],
      ["voltage", "Voltage"],
      ["current", "Current"],
      ["time", "Time"],
    ],
    eis: [
      ["frequency", "Frequency"],
      ["zreal", "Z'"],
      ["zimag", "Z''"],
      ["mag", "|Z|"],
      ["phase", "\u03b8"],
    ],
    cv: [
      ["voltage", "Voltage"],
      ["current", "Current"],
      ["cycle", "Cycle"],
    ],
  };
  const rows = Array.isArray(d?.rows) ? d.rows : [];
  const rowKeys = [...new Set(rows.flatMap((row) => Object.keys(row || {})))];
  const base = preferred[d?.dataType] || rowKeys.map((key) => [key, key]);
  const baseKeys = new Set(base.map(([key]) => key));
  const visibleBase = base.filter(([key]) => rows.some((row) => row[key] !== undefined && row[key] !== null && row[key] !== ""));
  const extras = rowKeys
    .filter((key) => !baseKeys.has(key))
    .filter((key) => rows.some((row) => row[key] !== undefined && row[key] !== null && row[key] !== ""))
    .map((key) => [key, key]);
  const columns = [...visibleBase, ...extras];
  return columns.length ? columns : base.slice(0, Math.min(base.length, 5));
}

// ?\u30ec\uc604??\u8e42\ub2ff\ub9b0 \u91ab\ub5ea\ucfb6 \u4ee5\uafa9\uc520\u6028? \u81fe\uba84\uc604?\ub301? \u6d39\uba83?\u6fe1?\u8e42\ub301\ubfec\u4e8c\uc1f0\ub497 \\u003f\\u003f\\u003f\uc496\ub586\\u003f\\u003f\\u003f\u0449\u338e?\uacd7\uc5ef?\ub348\ub58e.
function formatTableValue(value) {
  return typeof value === "number" ? fmt(value, 6) : (value ?? "");
}

// ?\uc88f\uae6e\\u003f\\u003f\\u003f\uacd7\uc520?\uacd7\ub011??rows\u745c??\ubdbe\u3203 ?\uc495\uc908 \u8e42\u0080?\uc111\ube40?\ub348\ub58e.
// contenteditable ?\u0080??\uf9cd\ub6ae\ubc7e?\ub301\uaf4c ?\u044a\uc29c?\uba2d? \u8adb\ubdbe\uc908 \u5a9b\ubbea\uc4e3 \u6028\uc88e\ud28c \\u003f\\u003f\\u003f\ub347\ucfb6 ?\u2478\ub572??
function renderTable(d) {
  const body = $("dataTable");
  const head = $("excelTableHead");
  const summary = $("excelSummary");
  const pagination = $("excelTablePagination");
  const pageLabel = $("excelTablePageLabel");
  const previousPage = $("excelTablePreviousPage");
  const nextPage = $("excelTableNextPage");
  if (!body || !head) return;
  state.tableSelection = null;
  if (d && d.rowsLoaded === false) {
    head.innerHTML = "";
    body.innerHTML = `<tr><td class="emptyCell" colspan="99">\uc120\ud0dd\ud55c Dataset\uc758 \uc6d0\uc2dc \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.</td></tr>`;
    if (summary) summary.textContent = "loading rows";
    if (pagination) pagination.hidden = true;
    updateExcelUndoButton();
    return;
  }
  if (!d || !Array.isArray(d.rows) || !d.rows.length) {
    head.innerHTML = "";
    body.innerHTML = `<tr><td class="emptyCell" colspan="99">\ud45c\uc2dc\ud560 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</td></tr>`;
    if (summary) summary.textContent = "0 rows";
    if (pagination) pagination.hidden = true;
    updateExcelUndoButton();
    return;
  }
  const previewOnly = datasetRowsArePreview(d);
  const pageCount = Math.max(1, Math.ceil(d.rows.length / TABLE_PAGE_SIZE));
  state.tablePage = Math.max(0, Math.min(state.tablePage || 0, pageCount - 1));
  const rowStart = state.tablePage * TABLE_PAGE_SIZE;
  const rowEnd = Math.min(rowStart + TABLE_PAGE_SIZE, d.rows.length);
  const visibleRows = d.rows.slice(rowStart, rowEnd);
  const columns = [["__index", "#"], ...tableColumnDefs(d)];
  head.innerHTML = `<tr>${columns.map(([, label]) => `<th>${escapeXml(label)}</th>`).join("")}</tr>`;
  body.innerHTML = visibleRows.map((row, visibleIndex) => {
    const rowIndex = rowStart + visibleIndex;
    return `<tr data-row-index="${rowIndex}">${columns.map(([key]) => {
      const value = key === "__index" ? rowIndex + 1 : row[key];
      if (key === "__index") return `<td class="rowIndex" data-row-index="${rowIndex}" title="\ud589 \uc120\ud0dd">${escapeXml(value)}</td>`;
      return `<td class="editableCell${previewOnly ? " previewCell" : ""}"${previewOnly ? "" : " contenteditable=\"true\""} spellcheck="false" data-row-index="${rowIndex}" data-key="${escapeAttr(key)}" title="${previewOnly ? escapeAttr(previewRowsMessage()) : "\ud074\ub9ad\ud574\uc11c \uc218\uc815"}">${escapeXml(formatTableValue(value))}</td>`;
    }).join("")}</tr>`;
  }).join("");
  if (summary) summary.textContent = previewOnly
    ? `${d.rows.length.toLocaleString()} rows \u00b7 ${rowStart + 1}-${rowEnd} \ud45c\uc2dc \u00b7 \ubbf8\ub9ac\ubcf4\uae30(\uc6d0\ubcf8 ${Number(d.rowCount || d.rows.length).toLocaleString()} rows)`
    : `${d.rows.length.toLocaleString()} rows \u00b7 ${rowStart + 1}-${rowEnd} \ud45c\uc2dc \u00b7 editable`;
  if (pagination) pagination.hidden = pageCount <= 1;
  if (pageLabel) pageLabel.textContent = `${state.tablePage + 1} / ${pageCount} page`;
  if (previousPage) previousPage.disabled = state.tablePage === 0;
  if (nextPage) nextPage.disabled = state.tablePage >= pageCount - 1;
  updateExcelEditControls(d);
  updateExcelUndoButton();
  bindEditableTable();
}

// Keep every raw point for analysis while rendering only one editable page.
// This prevents 40k+ cells from freezing the browser or looking truncated.
function changeExcelTablePage(delta) {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d?.rows?.length) return;
  const pageCount = Math.max(1, Math.ceil(d.rows.length / TABLE_PAGE_SIZE));
  state.tablePage = Math.max(0, Math.min((state.tablePage || 0) + delta, pageCount - 1));
  renderTable(d);
}

// \\u003f\\u003f\\u003f\ub349\uc4fd \u5a9b??\u0080\\u003f\\u003f\\u003f\ub300\u2503/?\u317b\ub0ab??\u907a\uc208\ubfec?\uff4a\ub9b0 ?\ub300\uae7d?\uba83? ?\uaccc\uaed0?\u2478\ub572??
// \\u003f\\u003f\\u003f\u2465\ub2d4??renderTable\\u003f\\u003f\\u003f\uc495? ?\ub348\uc908 \u6d39\uba83\u251b \uf9de\uacf9\uc351\uf9cd\ub348\ub58e ?\u317c\ub586 ?\uba84\ud167?\uc10f\ubf31\\u003f\\u003f\\u003f\u2478\ub572??
function bindEditableTable() {
  const body = $("dataTable");
  if (!body) return;
  const d = state.datasets.find((item) => item.id === state.selectedId);
  if (datasetRowsArePreview(d)) return;
  for (const indexCell of body.querySelectorAll(".rowIndex")) {
    indexCell.addEventListener("click", () => selectTableRow(Number(indexCell.dataset.rowIndex)));
  }
  for (const cell of body.querySelectorAll(".editableCell")) {
    cell.addEventListener("focus", () => {
      cell.dataset.originalValue = cell.textContent || "";
      cell.classList.add("editing");
      selectTableCell(cell);
      setStatus("\ud45c \uc218\uc815 \uc911...");
    });
    cell.addEventListener("click", () => selectTableCell(cell));
    cell.addEventListener("paste", (event) => handleTablePaste(event, cell));
    cell.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undoExcelEdit();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        cell.textContent = cell.dataset.originalValue || "";
        cell.blur();
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        const direction = event.shiftKey ? -1 : 1;
        const rowStep = event.key === "Enter" ? direction : 0;
        const colStep = event.key === "Tab" ? direction : 0;
        applyTableCellEdit(cell);
        moveTableFocus(cell, rowStep, colStep);
      }
    });
    cell.addEventListener("blur", () => {
      cell.classList.remove("editing");
      applyTableCellEdit(cell);
    });
  }
}

// ??\u8e30\ub34a\uc0c7\u745c??\uafa8\u2164\uf9ce??\ub300\ub5a6 ?\ub431\uc4e3 ?\uc88f\uae6e?\u2478\ub572??
// ?\uc88f\uae6e \\u003f\\u003f\\u003f?\uc823 \u8e30\uafaa\ub4c9\\u003f\\u003f\\u003f??\uc88f\uae6e ?\ubea3\ub0ab\u745c??\u044a\uc29c?\u2478\ub572??
function selectTableRow(rowIndex) {
  const body = $("dataTable");
  if (!body || !Number.isInteger(rowIndex)) return;
  body.querySelectorAll("tr").forEach((row) => row.classList.toggle("selectedRow", Number(row.dataset.rowIndex) === rowIndex));
  body.querySelectorAll(".selectedCell").forEach((cell) => cell.classList.remove("selectedCell"));
  const firstCell = body.querySelector(`.editableCell[data-row-index="${rowIndex}"]`);
  if (firstCell) {
    firstCell.classList.add("selectedCell");
    state.tableSelection = { rowIndex, key: firstCell.dataset.key };
  } else {
    state.tableSelection = { rowIndex, key: null };
  }
}

// ?\u044a\uc29c?\uba2d? ?\ub300\u2503\\u003f\\u003f\\u003f\u0080\\u003f\\u003f\\u003f\uafa9\uc631 ?\uc88f\uae6e ?\u0080\u6fe1??\uc496\ub586?\u2478\ub572??
// ?\ub6ae? ?\ub6ae\ubaa2\u7531\u044a? ??\u5a9b\ubea4\u201c\\u003f\\u003f\\u003f??\u2465\ub2d4?\uba2f\uaf4c \u907a\uc207\ub497 CSS ?\ub300\uc612?\u317a? ?\ub300\ub5a6?\u2478\ub572??
function selectTableCell(cell) {
  const body = $("dataTable");
  if (!body || !cell) return;
  const rowIndex = Number(cell.dataset.rowIndex);
  body.querySelectorAll("tr").forEach((row) => row.classList.toggle("selectedRow", Number(row.dataset.rowIndex) === rowIndex));
  body.querySelectorAll(".selectedCell").forEach((el) => el.classList.remove("selectedCell"));
  cell.classList.add("selectedCell");
  state.tableSelection = { rowIndex, key: cell.dataset.key };
}

// Enter\\u003f\\u003f\\u003f\uafa8\uc612 ?? Tab?\u0080 \\u003f\\u003f\\u003f\u0080\u6fe1??\ub300\ub8de?\u2478\ub572??
// ?\uc1f0\ucef2 ?\ubb12? \u8b70\uacd7\uc609 \u5a9b\uba2d\uced6??\u5a9b\u0080\u6e90\uc577\ucfb6 \uf9cd\ub6ae\ubc7e\u6e72??\uafaa\ube33 \u8e42\ub301\u201c ?\u2465\ub2d4?\ub085\ub572??
function moveTableFocus(cell, rowStep, colStep) {
  const rowIndex = Number(cell.dataset.rowIndex);
  const cells = [...document.querySelectorAll("#dataTable .editableCell")];
  const index = cells.indexOf(cell);
  if (index < 0) return;
  const rowCells = [...document.querySelectorAll(`#dataTable .editableCell[data-row-index="${rowIndex}"]`)];
  const colIndex = rowCells.indexOf(cell);
  const key = cell.dataset.key || "";
  const escapedKey = window.CSS?.escape ? CSS.escape(key) : key.replace(/"/g, '\\"');
  const next = rowStep
    ? document.querySelector(`#dataTable .editableCell[data-row-index="${rowIndex + rowStep}"][data-key="${escapedKey}"]`)
    : rowCells[colIndex + colStep] || cells[index + colStep];
  if (next) {
    next.focus();
    selectTableCell(next);
  } else {
    cell.blur();
  }
}

// ?\u044a\uc29c?\uba2d? ?\ub085\uc830\\u003f\\u003f\\u003f\ub77f\ub4aa?\uba83? ?\u0080?\u03bd\ube2f\u6e72??\uafa9\ubfc9 ?\u30ec\uc604?\uba84? ?\uba2e\ub592?\u2478\ub572??
// "0.123"\uf9e3\uc10e\uc746 ?\u30ec\uc604\u6fe1??\ub301\uaf4d \u5a9b\u0080?\u03bd\ube33 \u5a9b\ubbea? number\u6fe1??\u0080?\u03bd\ube50??\u6d39\uba83\uc612??\u6028\uafa9\uad9b??\u8adb\ubdbe\uc908 \\u003f\\u003f\\u003f??\ub349\ub4bf?\ub348\ub58e.
function coerceTableValue(text, previous) {
  const trimmed = String(text ?? "").trim();
  if (trimmed === "") return "";
  const numericText = trimmed.replace(/,/g, "");
  const numeric = Number(numericText);
  if (Number.isFinite(numeric) && (typeof previous === "number" || /^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/i.test(numericText))) {
    return numeric;
  }
  return trimmed;
}

// ?\uc496\uc4fd rows\u5a9b\u0080 \u8adb\ubdbe\u0080\ub6ae\u3203 ?\ubdbe\u3203 ?\uacf9\uae6d, Fig, ?\u317d\ubfd5 ?\ubea3\ub0ab, ?\uba2e\ub8de ?\u0080\\u003f\\u003f\\u003f\ub349\ube5f\\u003f\\u003f\\u003f?\u8e30\ub349\ubfc9 \u5a9b\uae46\ub58a?\u2478\ub572??
function cloneTableRows(rows) {
  return JSON.parse(JSON.stringify(Array.isArray(rows) ? rows : []));
}

function datasetRowsArePreview(d) {
  if (!d || !Array.isArray(d.rows)) return false;
  const total = Number(d.rowCount ?? d.fullRowCount ?? d.rows.length);
  return Boolean(d.rowsTruncated) || (Number.isFinite(total) && total > d.rows.length);
}

function previewRowsMessage() {
  return "\ub300\uc6a9\ub7c9 \uc6d0\ubcf8\uc740 \uc548\uc804\ud558\uac8c \ubcf4\uad00\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4. \ud604\uc7ac \ud45c\ub294 \ubbf8\ub9ac\ubcf4\uae30\uc774\ubbc0\ub85c \uc218\uc815\u00b7\uc800\uc7a5\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \uc6d0\ubcf8 \uc804\uccb4\ub97c \ubc14\uafb8\ub824\uba74 \ud30c\uc77c\uc744 \ub2e4\uc2dc \ubd88\ub7ec\uc624\uc138\uc694.";
}

function updateExcelEditControls(d = state.datasets.find((item) => item.id === state.selectedId)) {
  const previewOnly = datasetRowsArePreview(d);
  const controls = ["addExcelRow", "deleteExcelRow", "saveExcelRows"];
  for (const id of controls) {
    const button = $(id);
    if (!button) continue;
    button.disabled = previewOnly || !d?.rowsLoaded;
    button.title = previewOnly ? previewRowsMessage() : "";
  }
}

function updateExcelUndoButton() {
  const btn = $("undoExcelEdit");
  const d = state.datasets.find((item) => item.id === state.selectedId);
  if (btn) {
    btn.disabled = datasetRowsArePreview(d) || !state.tableUndoStack.length;
    btn.title = datasetRowsArePreview(d) ? previewRowsMessage() : "";
  }
}

function pushTableUndo(d) {
  if (!d?.id) return;
  state.tableUndoStack.push({ datasetId: d.id, rows: cloneTableRows(d.rows) });
  if (state.tableUndoStack.length > 30) state.tableUndoStack.shift();
  updateExcelUndoButton();
}

function undoExcelEdit() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("\ub418\ub3cc\ub9b4 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.");
  if (datasetRowsArePreview(d)) return setStatus(previewRowsMessage());
  let snapshot = null;
  while (state.tableUndoStack.length) {
    const candidate = state.tableUndoStack.pop();
    if (candidate.datasetId === d.id) {
      snapshot = candidate;
      break;
    }
  }
  updateExcelUndoButton();
  if (!snapshot) return setStatus("\ub418\ub3cc\ub9b4 \uc218\uc815 \ub0b4\uc5ed\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.");
  d.rows = cloneTableRows(snapshot.rows);
  updateDatasetRows(d);
  renderTable(d);
  setStatus("\ud45c \uc218\uc815\uc744 \uc774\uc804 \uc0c1\ud0dc\ub85c \ub418\ub3cc\ub838\uc2b5\ub2c8\ub2e4.");
}

function updateDatasetRows(d) {
  if (datasetRowsArePreview(d)) return setStatus(previewRowsMessage());
  state.datasets = state.datasets.map((item) => item.id === d.id ? d : item);
  state.filtered = state.filtered.map((item) => item.id === d.id ? d : item);
  renderFigure(d);
  renderExperimentInfo(d);
  scheduleRowsSave(d);
}

// ?\u0080 ?\uc10e\uad79\u745c??\uc10f\uc819\\u003f\\u003f\\u003f??\u317c\uc823 ?\uacd7\uc520?\uacd7\ub011 rows??\u8adb\uc10f\uc07a?\u2478\ub572??
// ?\ub304\uc351 updateDatasetRows\u5a9b\u0080 Fig \u5a9b\uae46\ub58a\u6028??\uc495\ucfad ?\u0080?\u03ba\ud274\uf9de\u0080 ?\ub301\ubf31\u4ee5\ub77e\ub572??
function applyTableCellEdit(cell) {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return false;
  if (datasetRowsArePreview(d)) {
    setStatus(previewRowsMessage());
    return false;
  }
  const rowIndex = Number(cell.dataset.rowIndex);
  const key = cell.dataset.key;
  if (!Number.isInteger(rowIndex) || !key || !d.rows[rowIndex]) return false;
  const previous = d.rows[rowIndex][key];
  const next = coerceTableValue(cell.textContent, previous);
  if (next === previous || String(next) === String(previous ?? "")) return false;
  pushTableUndo(d);
  d.rows[rowIndex][key] = next;
  updateDatasetRows(d);
  return true;
}

// ?\ubb12??\uba2f\uaf4c \u8e42\ub4ed\uad97\\u003f\\u003f\\u003f\u0449\uc72d \u79fb\uba84\uc4e3 \u6d39\uba83?\u6fe1?\u907a\uc208\ubfec?\uff4c\uc4e3 \\u003f\\u003f\\u003f\ub347\ucfb6 ?\u2478\ub572??
// \\u003f\\u003f\\u003f ?? \u4ee5\uafa8\uceee\u8f45\ub349? ?\ub431\uc45d\u6fe1??\ub301\uaf4d?\ub301\uaf4c ?\uafa9\uc282??\u5bc3\uc38c\uc2a6 ?\ub431\uc4e3 ?\uba2e\ub8de?\uc1f0\uc908 ?\uc10e\u2530?\ub348\ub58e.
function handleTablePaste(event, cell) {
  const text = event.clipboardData?.getData("text/plain") || "";
  if (!text) return;
  event.preventDefault();
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return;
  if (datasetRowsArePreview(d)) {
    setStatus(previewRowsMessage());
    return;
  }
  const columns = tableColumnDefs(d).map(([key]) => key);
  const startRow = Number(cell.dataset.rowIndex);
  const startCol = Math.max(0, columns.indexOf(cell.dataset.key));
  const pastedRows = text.replace(/\r/g, "").split("\n").filter((line, i, arr) => line || i < arr.length - 1).map((line) => line.split("\t"));
  pushTableUndo(d);
  for (let r = 0; r < pastedRows.length; r += 1) {
    const targetRow = startRow + r;
    while (d.rows.length <= targetRow) d.rows.push(makeEmptyTableRow(d));
    for (let c = 0; c < pastedRows[r].length; c += 1) {
      const key = columns[startCol + c];
      if (!key) continue;
      d.rows[targetRow][key] = coerceTableValue(pastedRows[r][c], d.rows[targetRow][key]);
    }
  }
  updateDatasetRows(d);
  renderTable(d);
}

function makeEmptyTableRow(d) {
  const row = {};
  for (const [key] of tableColumnDefs(d)) row[key] = "";
  if (Object.prototype.hasOwnProperty.call(row, "cycle")) {
    const lastCycle = [...(d.rows || [])].reverse().map((item) => Number(item.cycle)).find(Number.isFinite);
    row.cycle = Number.isFinite(lastCycle) ? lastCycle + 1 : (d.rows?.length || 0) + 1;
  }
  return row;
}

function addExcelRow() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("\uba3c\uc800 \ub370\uc774\ud130\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
  if (datasetRowsArePreview(d)) return setStatus(previewRowsMessage());
  d.rows = Array.isArray(d.rows) ? d.rows : [];
  pushTableUndo(d);
  d.rows.push(makeEmptyTableRow(d));
  updateDatasetRows(d);
  state.tablePage = Math.floor((d.rows.length - 1) / TABLE_PAGE_SIZE);
  renderTable(d);
  const rowIndex = d.rows.length - 1;
  const firstCell = document.querySelector(`#dataTable .editableCell[data-row-index="${rowIndex}"]`);
  if (firstCell) firstCell.focus();
}

function deleteSelectedExcelRow() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d || !Array.isArray(d.rows) || !d.rows.length) return setStatus("\uc0ad\uc81c\ud560 \ud589\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.");
  if (datasetRowsArePreview(d)) return setStatus(previewRowsMessage());
  const rowIndex = Number(state.tableSelection?.rowIndex);
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= d.rows.length) return setStatus("\uc0ad\uc81c\ud560 \ud589\uc744 \uba3c\uc800 \uc120\ud0dd\ud558\uc138\uc694.");
  pushTableUndo(d);
  d.rows.splice(rowIndex, 1);
  updateDatasetRows(d);
  state.tablePage = Math.min(state.tablePage || 0, Math.max(0, Math.ceil(d.rows.length / TABLE_PAGE_SIZE) - 1));
  renderTable(d);
  setStatus("\uc120\ud0dd\ud55c \ud589\uc744 \uc0ad\uc81c\ud588\uc2b5\ub2c8\ub2e4.");
}

function saveCurrentExcelRows() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("\uc800\uc7a5\ud560 \ub370\uc774\ud130\uc14b\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.");
  if (datasetRowsArePreview(d)) return setStatus(previewRowsMessage());
  clearTimeout(state.tableSaveTimer);
  return saveRowsEdit(d);
}

function scheduleRowsSave(d) {
  if (datasetRowsArePreview(d)) return;
  clearTimeout(state.tableSaveTimer);
  setStatus("\ud45c \uc218\uc815 \ub0b4\uc6a9\uc744 \uc800\uc7a5 \uc911...");
  state.tableSaveTimer = setTimeout(() => saveRowsEdit(d), 650);
}

async function saveRowsEdit(d) {
  if (datasetRowsArePreview(d)) {
    setStatus(previewRowsMessage());
    return;
  }
  try {
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ rows: d.rows }),
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || "\ud45c \uc800\uc7a5 \uc2e4\ud328");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    setStatus("\ud45c \uc218\uc815 \ub0b4\uc6a9\uc774 Fig\uc640 DB\uc5d0 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
  } catch (error) {
    setStatus(`\ud45c \uc800\uc7a5 \uc2e4\ud328: ${error.message}`);
  }
}

function renderCurrent() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  state.selectedAnnotation = null;
  fillCellForm(d);
  renderFigure(d);
  renderTable(d);
  renderExperimentInfo(d);
  renderCellWorkspace(d);
  loadCellWorkspace(d);
  if (d && d.rowsLoaded === false) {
    hydrateDatasetRows(d.id)
      .then((hydrated) => {
        if (hydrated && state.selectedId === hydrated.id) renderCurrent();
      })
      .catch((error) => setStatus(`Dataset \ub370\uc774\ud130 \ub85c\ub529 \uc2e4\ud328: ${error.message}`));
  }
}

async function applyCellInfo() {
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("\uba3c\uc800 \ub370\uc774\ud130\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
  setBusy(true, "\uc785\ub825\ud55c \uc815\ubcf4\ub97c \ud604\uc7ac \ub370\uc774\ud130\uc5d0 \uc801\uc6a9\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4.");
  try {
    const hierarchy = hierarchySelectionPayload();
    delete hierarchy.datasetGroupName;
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ cell: collectCellForm(), ...hierarchy }),
    });
    const saved = await res.json();
    if (!res.ok) {
      setStatus(saved.error || "\uc815\ubcf4 \uc800\uc7a5 \uc2e4\ud328");
      return;
    }
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    state.selectedId = saved.id;
    await loadHierarchy();
    renderSelect();
    renderSavedList();
    renderCurrent();
    setStatus("\uc785\ub825 \uc815\ubcf4\uac00 \ud604\uc7ac Fig\uc5d0 \uc801\uc6a9\ub418\uc5c8\uc2b5\ub2c8\ub2e4.");
  } catch (error) {
    setStatus(`\uc815\ubcf4 \uc800\uc7a5 \uc2e4\ud328: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function saveDataset(ev) {
  ev.preventDefault();
  const form = ev.currentTarget;
  const fd = new FormData(form);
  const file = fd.get("csv");
  if (!file || !file.size) return;
  setStatus("Parsing...");
  const rows = parseCsv(await file.text());
  const cell = Object.fromEntries(["date", "cellId", "sampleName", "material", "electrolyte", "condition", "notes"].map((k) => [k, fd.get(k)]));
  const res = await fetch("/api/datasets", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ cell, rows, ...hierarchySelectionPayload() }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "\uc800\uc7a5 \uc2e4\ud328");
  }
  const saved = await res.json();
  state.datasets.unshift(saved);
  await loadHierarchy();
  form.reset();
  showDatasetImmediately(saved);
  setStatus("Saved");
}

function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportSvg() {
  const svg = $("paperFigure");
  if (!svg) return;
  download("battery-figure.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml");
}

function exportPng() {
  const svg = $("paperFigure");
  if (!svg) return;
  svgToPngBlob(svg).then((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "battery-figure.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }).catch((err) => setStatus(err.message || "PNG \ubcc0\ud658 \uc2e4\ud328"));
}

function svgToPngBlob(svg) {
  const text = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml;charset=utf-8" }));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 2240;
        canvas.height = 1440;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          blob ? resolve(blob) : reject(new Error("PNG \ubcc0\ud658 \uc2e4\ud328"));
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Fig \uc774\ubbf8\uc9c0\ub97c \ubcc0\ud658\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4."));
    };
    img.src = url;
  });
}

function selectedComparisonSeries() {
  return state.compareIds
    .map((id) => state.datasets.find((d) => d.id === id))
    .filter((d) => d?.dataType === "cyc")
    .slice(0, 8)
    .map((d) => ({
      d,
      name: datasetDisplayName(d),
      points: state.comparisonSeriesByDatasetId.get(d.id)
        || dischargeSeries((d.rows || []).filter((r) => Number.isFinite(r.cycle)).sort((a, b) => a.cycle - b.cycle)),
    }))
    .filter((s) => s.points.length);
}

function renderCycComparison() {
  const preview = $("comparisonPreview");
  if (!preview) return;
  const series = selectedComparisonSeries();
  preview.classList.remove("hidden");
  if (series.length < 2) {
    preview.innerHTML = `<p class="emptySaved">CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uba74 \ube44\uad50 \uadf8\ub798\ud504\ub97c \ub9cc\ub4e4 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</p>`;
    setStatus("CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uc138\uc694.");
    return;
  }
  const colorMap = Object.fromEntries(series.map((s, idx) => [s.d.id, comparisonColor(s.d.id, idx)]));
  preview.innerHTML = `
    <div class="comparisonTitle">
      <div>
        <strong>CYC \ube44\uad50 Fig</strong>
        <span>${series.length}\uac1c Fig \ube44\uad50</span>
      </div>
      <div class="comparisonActions">
        <button type="button" id="saveComparisonFigure">\ube44\uad50 Fig \uc800\uc7a5</button>
        <button type="button" id="exportComparisonSvg" class="secondaryAction">SVG</button>
        <button type="button" id="exportComparisonPng" class="secondaryAction">PNG</button>
      </div>
    </div>
    <div class="comparisonControls">
      ${series.map((s, idx) => `
        <label class="comparisonColorItem">
          <input type="color" data-comparison-color="${escapeAttr(s.d.id)}" value="${comparisonColor(s.d.id, idx)}" />
          <span>${escapeXml(s.name)}</span>
        </label>
      `).join("")}
    </div>
    ${renderComparisonSvg(series, colorMap)}`;
  preview.querySelectorAll("[data-comparison-color]").forEach((input) => {
    input.addEventListener("input", () => {
      state.comparisonColors[input.dataset.comparisonColor] = normalizeHexColor(input.value, "#0f766e");
      renderCycComparison();
    });
  });
  $("saveComparisonFigure")?.addEventListener("click", saveComparisonFigure);
  $("exportComparisonSvg")?.addEventListener("click", exportComparisonSvg);
  $("exportComparisonPng")?.addEventListener("click", exportComparisonPng);
  setStatus("CYC \ube44\uad50 Fig\ub97c \ub9cc\ub4e4\uc5c8\uc2b5\ub2c8\ub2e4.");
}

async function saveComparisonFigure() {
  const series = selectedComparisonSeries();
  if (series.length < 2) return setStatus("\uc800\uc7a5\ud558\ub824\uba74 CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uc138\uc694.");
  const comparisonColors = Object.fromEntries(series.map((s, idx) => [s.d.id, comparisonColor(s.d.id, idx)]));
  const payload = {
    dataType: "cyc-comparison",
    figureKind: "cyc-comparison",
    cell: {
      date: todayLocal(),
      cellId: "CYC comparison",
      sampleName: `${series.length} CYC figures`,
      material: "CYC",
      condition: "comparison",
      notes: series.map((s) => s.name).join(" / "),
    },
    rows: comparisonRowsFromSeries(series),
    columns: ["sourceId", "sourceName", "cycle", "capacity"],
    sourceName: series.map((s) => s.name).join(" + "),
    figureEdits: { comparisonColors },
  };
  const res = await fetch("/api/datasets", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return setStatus(body.error || "\ube44\uad50 Fig \uc800\uc7a5 \uc2e4\ud328");
  }
  const saved = await res.json();
  state.datasets.unshift(saved);
  showDatasetImmediately(saved);
  activateView("figure", "cyc");
  setStatus("\ube44\uad50 C-rate Fig\ub97c \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.");
}

function exportComparisonSvg() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus("\uba3c\uc800 \ube44\uad50 Fig\ub97c \ub9cc\ub4e4\uc5b4\uc8fc\uc138\uc694.");
  download("cyc-comparison.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml");
}

function exportComparisonPng() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus("\uba3c\uc800 \ube44\uad50 Fig\ub97c \ub9cc\ub4e4\uc5b4\uc8fc\uc138\uc694.");
  svgToPngBlob(svg).then((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cyc-comparison.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }).catch((err) => setStatus(err.message || "PNG \ubcc0\ud658 \uc2e4\ud328"));
}

function renderSavedCycComparison(d) {
  const series = seriesFromComparisonDataset(d);
  $("figureTitle").textContent = d.cell?.cellId || "CYC comparison";
  $("figureSubtitle").textContent = `${d.cell?.date || ""} - CYC comparison - ${d.rows?.length || 0} points`;
  $("metaGrid").innerHTML = [
    ["Type", "CYC comparison"],
    ["Figures", `${series.length}`],
    ["Owner", displayUserName(d)],
    ["Source", d.sourceName],
  ].map(([k, v]) => `<div class="metaItem"><strong>${k}</strong>${isBadText(v) ? "-" : (v || "-")}</div>`).join("");
  if (series.length < 1) {
    $("figureCanvas").innerHTML = `<p class="emptySaved">\uc800\uc7a5\ub41c \ube44\uad50 Fig \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>`;
    return;
  }
  const colorMap = Object.fromEntries(series.map((s) => [s.sourceId, s.color]));
  $("figureCanvas").innerHTML = renderComparisonSvg(series, colorMap, "paperFigure");
}

function crc32(bytes) {
  if (!crc32.table) {
    crc32.table = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  }
  let c = 0xffffffff;
  for (const b of bytes) c = crc32.table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n) { return [n & 255, (n >>> 8) & 255]; }
function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }

function makeZip(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = file.bytes || encoder.encode(file.text || "");
    const crc = crc32(data);
    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0),
    ]);
    chunks.push(local, name, data);
    central.push({ name, crc, size: data.length, offset });
    offset += local.length + name.length + data.length;
  }
  const centralStart = offset;
  for (const file of central) {
    const header = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(file.crc), ...u32(file.size), ...u32(file.size), ...u16(file.name.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(file.offset),
    ]);
    chunks.push(header, file.name);
    offset += header.length + file.name.length;
  }
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length),
    ...u32(offset - centralStart), ...u32(centralStart), ...u16(0),
  ]);
  chunks.push(end);
  return new Blob(chunks, { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
}

function exportComparisonPpt() {
  return exportSvgAsPpt($("comparisonFigure"), "cyc-comparison.pptx", savedFigText().exportMissing);
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function exportPpt() {
  return exportSvgAsPpt($("paperFigure"), "battery-figure.pptx", "\uba3c\uc800 Fig\ub97c \uc0dd\uc131\ud558\uac70\ub098 \uc120\ud0dd\ud558\uc138\uc694.");
}

async function exportSvgAsPpt(svg, fileName, missingMessage) {
  if (!svg) return setStatus(missingMessage);
  let pngBytes;
  try {
    const pngBlob = await svgToPngBlob(svg);
    pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  } catch (err) {
    return setStatus(err.message || "PPT \ubcc0\ud658 \uc2e4\ud328");
  }
  try {
    const res = await fetch("/api/export-ppt", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        imageBase64: bytesToBase64(pngBytes),
        svgText: new XMLSerializer().serializeToString(svg),
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "PPT \ud30c\uc77c\uc744 \ub9cc\ub4e4\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.");
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
    return setStatus("PPT \ub2e4\uc6b4\ub85c\ub4dc \uc644\ub8cc");
  } catch (err) {
    return setStatus(err.message || "PPT \ub2e4\uc6b4\ub85c\ub4dc \uc2e4\ud328");
  }
  const files = [
    { name: "[Content_Types].xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>
<Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>
<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>
<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>` },
    { name: "_rels/.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>` },
    { name: "docProps/core.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>Battery figure</dc:title><dc:creator>Battery Data Portal</dc:creator><cp:lastModifiedBy>Battery Data Portal</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">2026-06-30T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-30T00:00:00Z</dcterms:modified>
</cp:coreProperties>` },
    { name: "docProps/app.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
<Application>Microsoft PowerPoint</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>1</Slides><Notes>0</Notes><HiddenSlides>0</HiddenSlides><MMClips>0</MMClips><ScaleCrop>false</ScaleCrop>
</Properties>` },
    { name: "ppt/presentation.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
<p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst>
<p:sldSz cx="12192000" cy="6858000" type="wide"/><p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>` },
    { name: "ppt/_rels/presentation.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>
<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>
<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>
</Relationships>` },
    { name: "ppt/presProps.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentationPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>` },
    { name: "ppt/viewProps.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:viewPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:normalViewPr><p:restoredLeft sz="15620"/><p:restoredTop sz="94660"/></p:normalViewPr></p:viewPr>` },
    { name: "ppt/tableStyles.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>` },
    { name: "ppt/slides/slide1.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
<p:pic><p:nvPicPr><p:cNvPr id="2" name="battery-figure.png"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="914400" y="685800"/><a:ext cx="10363200" cy="5486400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>
</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>` },
    { name: "ppt/slides/_rels/slide1.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/battery-figure.png"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>` },
    { name: "ppt/slideMasters/slideMaster1.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>` },
    { name: "ppt/slideMasters/_rels/slideMaster1.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>` },
    { name: "ppt/slideLayouts/slideLayout1.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" type="blank" preserve="1">
<p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>` },
    { name: "ppt/slideLayouts/_rels/slideLayout1.xml.rels", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>` },
    { name: "ppt/theme/theme1.xml", text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Battery Data Portal">
<a:themeElements><a:clrScheme name="Office"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F2937"/></a:dk2><a:lt2><a:srgbClr val="F8FAFC"/></a:lt2><a:accent1><a:srgbClr val="0F766E"/></a:accent1><a:accent2><a:srgbClr val="EC4899"/></a:accent2><a:accent3><a:srgbClr val="64748B"/></a:accent3><a:accent4><a:srgbClr val="A78BFA"/></a:accent4><a:accent5><a:srgbClr val="14B8A6"/></a:accent5><a:accent6><a:srgbClr val="F59E0B"/></a:accent6><a:hlink><a:srgbClr val="2563EB"/></a:hlink><a:folHlink><a:srgbClr val="7C3AED"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Segoe UI"/><a:ea typeface="\ub9d1\uc740 \uace0\ub515"/><a:cs typeface="Segoe UI"/></a:majorFont><a:minorFont><a:latin typeface="Segoe UI"/><a:ea typeface="\ub9d1\uc740 \uace0\ub515"/><a:cs typeface="Segoe UI"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements>
</a:theme>` },
    { name: "ppt/media/battery-figure.png", bytes: pngBytes },
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(makeZip(files));
  a.download = "battery-figure.pptx";
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus("PPT \ub2e4\uc6b4\ub85c\ub4dc \uc644\ub8cc");
}

async function deleteCurrent() {
  if (!state.selectedId || !confirm("\uc120\ud0dd\ud55c \ub370\uc774\ud130\ub97c \uc0ad\uc81c\ud560\uae4c\uc694?")) return;
  await fetch(`/api/datasets/${encodeURIComponent(state.selectedId)}`, { method: "DELETE", headers: authHeaders() });
  state.datasets = state.datasets.filter((d) => d.id !== state.selectedId);
  state.selectedId = null;
  applyFilters();
}

function calcValue(id) {
  const n = Number($(id)?.value);
  return Number.isFinite(n) ? n : 0;
}

function calcNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const electrodePresets = {
  ncm: {
    active: "NCM",
    conductor: "Super P",
    binder: "PTFE",
    collector: "C-coated Al",
    capacity: 180,
    totalMass: 0.01861,
    collectorMass: 0.00386,
    totalThickness: 0.076,
    collectorThickness: 0.017,
    diameter: 11,
    activeRatio: 93,
    conductorRatio: 5,
    binderRatio: 2,
  },
  lfp: {
    active: "LFP",
    conductor: "Super P",
    binder: "PTFE",
    collector: "C-coated Al",
    capacity: 170,
    totalMass: 0.03608,
    collectorMass: 0.00386,
    totalThickness: 0.223,
    collectorThickness: 0.015,
    diameter: 11,
    activeRatio: 95,
    conductorRatio: 3,
    binderRatio: 2,
  },
  graphite: {
    active: "Graphite",
    conductor: "Super P",
    binder: "PTFE",
    collector: "Cu",
    capacity: 372,
    totalMass: 0.03645,
    collectorMass: 0.011387,
    totalThickness: 0.143,
    collectorThickness: 0.011,
    diameter: 11,
    activeRatio: 92,
    conductorRatio: 4,
    binderRatio: 4,
  },
};

const ELECTRODE_PRESET_OPTIONS = [
  { value: "ncm", label: "?\ubb0e\ub808 / NCM" },
  { value: "lfp", label: "?\ubb0e\ub808 / LFP" },
  { value: "graphite", label: "?\ub6ad\ub808 / Graphite" },
];

function electrodePresetByKey(key) {
  return electrodePresets[key] || electrodePresets.ncm;
}

function defaultElectrodeInputs(presetKey = "ncm") {
  const p = electrodePresetByKey(presetKey);
  return {
    calcElectrodeType: presetKey,
    calcTotalMass: p.totalMass,
    calcCollectorMass: p.collectorMass,
    calcTotalThickness: p.totalThickness,
    calcCollectorThickness: p.collectorThickness,
    calcDiameter: p.diameter,
    calcCapacity: p.capacity,
    calcNcmRatio: p.activeRatio,
    calcSuperRatio: p.conductorRatio,
    calcPtfeRatio: p.binderRatio,
  };
}

function currentElectrodePreset() {
  return electrodePresetByKey($("calcElectrodeType")?.value);
}

function applyElectrodePreset() {
  const values = defaultElectrodeInputs($("calcElectrodeType")?.value || "ncm");
  for (const [id, value] of Object.entries(values)) {
    if (id !== "calcElectrodeType" && $(id)) $(id).value = value;
  }
  updateElectrodeLabels();
  renderElectrodeCalc();
}

function updateElectrodeLabels() {
  const p = currentElectrodePreset();
  const labels = {
    calcCollectorMass: `${p.collector} \ubb34\uac8c (g)`,
    calcCollectorThickness: `${p.collector} \ub450\uaed8 (mm)`,
    calcNcmRatio: `${p.active} (%)`,
    calcSuperRatio: `${p.conductor} (%)`,
    calcPtfeRatio: `${p.binder} (%)`,
  };
  for (const [id, text] of Object.entries(labels)) {
    const label = $(id)?.closest("label");
    if (label && label.firstChild) label.firstChild.textContent = text;
  }
}

function fixed(n, d = 6) {
  if (!Number.isFinite(n)) return "";
  return Number(n.toFixed(d)).toString();
}

function calcHelp(text) {
  return `<button class="calcHelpButton" type="button" data-calc-help="${escapeAttr(text)}" aria-label="\uacc4\uc0b0 \uc124\uba85 \ubcf4\uae30">?</button>`;
}

function calcHelpLabel(label, text) {
  return `<span class="calcHelpLabel">${escapeXml(label)} ${calcHelp(text)}</span>`;
}

function electrodeCalcFromInputs(inputs = {}, presetKey = inputs.calcElectrodeType || "ncm") {
  const preset = electrodePresetByKey(presetKey);
  const totalMass = calcNumber(inputs.calcTotalMass);
  const collectorMass = calcNumber(inputs.calcCollectorMass);
  const totalThickness = calcNumber(inputs.calcTotalThickness);
  const collectorThickness = calcNumber(inputs.calcCollectorThickness);
  const diameter = calcNumber(inputs.calcDiameter);
  const capacity = calcNumber(inputs.calcCapacity);
  const ncmRatio = calcNumber(inputs.calcNcmRatio) / 100;
  const superRatio = calcNumber(inputs.calcSuperRatio) / 100;
  const ptfeRatio = calcNumber(inputs.calcPtfeRatio) / 100;
  const electrodeMass = Math.max(totalMass - collectorMass, 0);
  const electrodeThickness = Math.max(totalThickness - collectorThickness, 0);
  const area = Math.PI * Math.pow(diameter / 20, 2);
  const volume = area * (electrodeThickness / 10);
  const ncmMass = electrodeMass * ncmRatio;
  const superMass = electrodeMass * superRatio;
  const ptfeMass = electrodeMass * ptfeRatio;
  const oneC = ncmMass * capacity;
  const rates = [0.05, 0.1, 0.2, 0.33, 0.5, 1, 2, 3, 4, 5].map((rate) => ({ rate, current: oneC * rate }));
  return {
    preset,
    totalMass, collectorMass, totalThickness, collectorThickness, diameter, capacity,
    ncmRatio, superRatio, ptfeRatio,
    electrodeMass, electrodeThickness, area, volume, ncmMass, superMass, ptfeMass, oneC,
    loading: area ? electrodeMass / area : 0,
    ncmLoadingArea: area ? ncmMass / area : 0,
    totalDensity: volume ? electrodeMass / volume : 0,
    ncmLoadingVolume: volume ? ncmMass / volume : 0,
    rates,
  };
}

function electrodeCalcData() {
  return electrodeCalcFromInputs(electrodeInputSnapshot(), $("calcElectrodeType")?.value || "ncm");
}

function electrodeInputSnapshot() {
  return Object.fromEntries(ELECTRODE_INPUT_IDS.map((id) => [id, $(id)?.value ?? ""]));
}

// \u91c9\ub6ae\uc52a?\uacd7? localStorage?\uba2f\uaf4c ?\u0080?\u03bb\ub9c2 ?\uafa7\ub808 C-rate \u6028\uafa9\uad9b\u5a9b?\uf9cf\u2478\uc909??\u907a\ub348\uc72d?\ub4ec\ub572??
// ?\uc495\ucfad DB\\u003f\\u003f\\u003f\u0080?\u03bd\ube2f\u6e72??\uafa9\uc4fd \u5a9b\uc496\uc524 ?\ubb12\ubfbd \u8e42\ub2ff\\u003f\\u003f\\u003f??\ube37?\ub085\ub572??
function loadElectrodeProfiles() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ELECTRODE_PROFILE_KEY) || "[]");
    state.electrodeProfiles = Array.isArray(parsed) ? parsed : [];
  } catch {
    state.electrodeProfiles = [];
  }
  if (!state.selectedElectrodeProfileId && state.electrodeProfiles[0]) {
    state.selectedElectrodeProfileId = state.electrodeProfiles[0].id;
  }
}

// ?\uafa7\ub808 ?\u0080?\u03bc\ub0fc \uf9cf\u2478\uc909??localStorage\\u003f\\u003f\\u003f\u0080?\u03bd\ube2f\u6028??\ubdbe\u3203 \uf9cf\u2478\uc909\\u003f\\u003f\\u003f\u317c\ub586 \u6d39\uba83\u2530?\ub348\ub58e.
function persistElectrodeProfiles() {
  localStorage.setItem(ELECTRODE_PROFILE_KEY, JSON.stringify(state.electrodeProfiles));
  renderElectrodeProfileStore();
  renderElectrodeCalcSlots();
}

// ?\ub300\ucaeb??\u936e\uafa9\uc359?\uba2d\ud02c ?\u0080?\u03bd\ube37 \\u003f\\u003f\\u003f\uba2e\ub8de?\uc1f0\uc908 \u907a\uc207\ub497 ?\ub300\ucaeb?\ub085\ub572??
// ?\uc88e\ucb68, active material, 1C ?\uafa8\uca9f\u5a9b\u0080 ?\u317c\ubf31\u5a9b\u0080\uf9ce??\uc10f\uca37??\uf9e1\uc598\ub9b0\u5a9b\u0080 ?\uc38c\ub4bf?\ub348\ub58e.
function defaultElectrodeProfileName(c) {
  const date = todayLocal().slice(5);
  return `${date} ${c.preset.active} 1C ${fixed(c.oneC, 3)} mA`;
}

// ?\uafa9\uc631 ?\uafa7\ub808 \u6028\uafa9\uad9b ?\ub085\uc830\u5a9b\ubbe8\ub0b5 \u6028\uafa9\uad9b \u5bc3\uaccc\ub0b5\u745c??\uc10e\uad79\\u003f\\u003f\\u003f\u0080??\u5a9b\uc579\uaedc\u6fe1?\u81fe\ub760\ub4bf?\ub348\ub58e.
// ??\u5a9b\uc579\uaedc\u5a9b\u0080 ?\u0080?\u03bc\ub0fc \u79fb\ub300\ubc76\u5a9b\u0080 ?\uc10d\ud02c, ?\uc10f\uca37??CYC ?\uacd7\uc520?\uacd7\ubfc9 ?\uff4c\uc4e3 payload\\u003f\\u003f\\u003f\uba2e\ub0af\\u003f\\u003f\\u003f\u2478\ub572??
function buildElectrodeProfileFromCalc(c, name, inputs, presetKey) {
  return {
    id: `electrode-${Date.now()}`,
    name,
    ownerId: state.user?.id || "",
    createdAt: new Date().toISOString(),
    presetKey,
    preset: c.preset,
    inputs,
    oneC_mA: c.oneC,
    activeLoading_g_cm2: c.ncmLoadingArea,
    totalLoading_g_cm2: c.loading,
    electrodeMass_g: c.electrodeMass,
    electrodeThickness_mm: c.electrodeThickness,
    area_cm2: c.area,
    activeMass_g: c.ncmMass,
    capacity_mAh_g: c.capacity,
    rates: c.rates.map((r) => ({ rate: r.rate, current_mA: r.current })),
  };
}

function buildElectrodeProfile() {
  const inputs = electrodeInputSnapshot();
  const presetKey = $("calcElectrodeType")?.value || "ncm";
  const c = electrodeCalcFromInputs(inputs, presetKey);
  const nameInput = $("electrodeProfileName");
  const name = String(nameInput?.value || "").trim() || defaultElectrodeProfileName(c);
  return buildElectrodeProfileFromCalc(c, name, inputs, presetKey);
}

// ?\uafa9\uc631 \u6028\uafa9\uad9b \u5bc3\uaccc\ub0b5\u745c??\u0080?\u03bc\ub0fc??\u7570\ubdbd??\u2478\ub572??
// \uf9e4\uc493\ub810 ?\u0080?\u03ba\uceea\\u003f\\u003f\\u003f\uafa9\ubfc9 ?\u317b\ub8c4\u6fe1?unshift ?\ubea5\uae6d\u6fe1??\uff4a\ud02c, ?\ub348\u0422 \u800c\u317c?\uf9de\u0080 ?\ub504\ucfb6 40\u5a9b\uc493\ud274\uf9de\u0080\uf9cd??\uc88e??\u2478\ub572??
function saveElectrodeProfile() {
  const profile = buildElectrodeProfile();
  state.electrodeProfiles = [profile, ...state.electrodeProfiles.filter((item) => item.id !== profile.id)].slice(0, 40);
  state.selectedElectrodeProfileId = profile.id;
  persistElectrodeProfiles();
  if ($("electrodeProfileName")) $("electrodeProfileName").value = "";
  setStatus(`\uc804\uadf9 C-rate \uacc4\uc0b0\uac12\uc744 \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4: ${profile.name}`);
}

// ?\u0080?\u03bc\ub0fc?\uba2f\uaf4c ?\uafa9\uc631 ?\uc88f\uae6e??\u6028\uafa9\uad9b ?\uafa8\uc908?\uafa9\uc4e3 \uf9e1\uc5a0\ub4bf?\ub348\ub58e.
function normalizedSlotInputs(inputs = {}, presetKey = "ncm") {
  return { ...defaultElectrodeInputs(presetKey), ...inputs, calcElectrodeType: presetKey };
}

function defaultElectrodeSlot(index, presetKey = "ncm") {
  return {
    id: `electrode-slot-${index + 1}`,
    name: `\uacc4\uc0b0\uae30 ${index + 1}`,
    presetKey,
    inputs: defaultElectrodeInputs(presetKey),
  };
}

function normalizeElectrodeSlot(slot, index) {
  const presetKey = slot?.presetKey || slot?.inputs?.calcElectrodeType || "ncm";
  return {
    id: slot?.id || `electrode-slot-${index + 1}`,
    name: slot?.name || `\uacc4\uc0b0\uae30 ${index + 1}`,
    presetKey,
    inputs: normalizedSlotInputs(slot?.inputs || {}, presetKey),
  };
}

function loadElectrodeCalcSlots() {
  let parsed = [];
  try {
    parsed = JSON.parse(localStorage.getItem(ELECTRODE_CALC_SLOT_KEY) || "[]");
  } catch {
    parsed = [];
  }
  const slots = Array.isArray(parsed) ? parsed.map((slot, index) => normalizeElectrodeSlot(slot, index)) : [];
  while (slots.length < ELECTRODE_CALC_SLOT_COUNT) {
    slots.push(defaultElectrodeSlot(slots.length));
  }
  state.electrodeCalcSlots = slots.slice(0, ELECTRODE_CALC_SLOT_COUNT);
}

function persistElectrodeCalcSlots() {
  localStorage.setItem(ELECTRODE_CALC_SLOT_KEY, JSON.stringify(state.electrodeCalcSlots));
}

function electrodeSlotCalc(slot) {
  const presetKey = slot?.presetKey || slot?.inputs?.calcElectrodeType || "ncm";
  const inputs = normalizedSlotInputs(slot?.inputs || {}, presetKey);
  return electrodeCalcFromInputs(inputs, presetKey);
}

function electrodeSlotFieldLabel(field, preset) {
  if (field.id === "calcCollectorMass") return `${preset.collector} \ubb34\uac8c (g)`;
  if (field.id === "calcCollectorThickness") return `${preset.collector} \ub450\uaed8 (mm)`;
  if (field.id === "calcNcmRatio") return `${preset.active} (%)`;
  if (field.id === "calcSuperRatio") return `${preset.conductor} (%)`;
  if (field.id === "calcPtfeRatio") return `${preset.binder} (%)`;
  return field.label;
}

function renderElectrodeCalcSlots() {
  const box = $("electrodeCalcSlots");
  if (!box) return;
  if (!state.electrodeCalcSlots.length) loadElectrodeCalcSlots();
  box.innerHTML = `
    <div class="calcSlotHeader"><div><h3>\uc804\uadf9 C-rate \uacc4\uc0b0\uae30 8\uce78</h3><p>\uc0d8\ud50c\ubcc4\ub85c \uacc4\uc0b0\ud55c \uac12\uc744 \ubcf4\uad00\ud558\uace0, \ud544\uc694\ud55c \uac12\uc744 \uba54\uc778 \uacc4\uc0b0\uae30\ub098 C-rate \uc800\uc7a5\uc18c\ub85c \ubd88\ub7ec\uc635\ub2c8\ub2e4.</p></div><span>\uc544\ub798\ub85c \uc2a4\ud06c\ub864\ud558\uba74 8\uac1c \uacc4\uc0b0\uae30\ub97c \uc0ac\uc6a9\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.</span></div>
    <div class="calcSlotList">${state.electrodeCalcSlots.map((slot, index) => { const calc = electrodeSlotCalc(slot); const preset = calc.preset; const options = ELECTRODE_PRESET_OPTIONS.map((option) => `<option value="${escapeAttr(option.value)}"${option.value === slot.presetKey ? " selected" : ""}>${escapeXml(option.label)}</option>`).join(""); const fields = ELECTRODE_SLOT_FIELDS.map((field) => `<label>${escapeXml(electrodeSlotFieldLabel(field, preset))}<input type="number" step="${escapeAttr(field.step)}" value="${escapeAttr(slot.inputs[field.id] ?? "")}" data-slot-field="${escapeAttr(field.id)}" /></label>`).join(""); return `<article class="calcSlotCard" data-slot-index="${index}"><div class="calcSlotTop"><label>\uacc4\uc0b0 \uc774\ub984<input type="text" value="${escapeAttr(slot.name)}" data-slot-field="name" /></label><label>\uc804\uadf9<select data-slot-field="calcElectrodeType">${options}</select></label></div><div class="calcSlotGrid">${fields}</div><div class="calcSlotSummary"><div><small>1C \uc804\ub958</small><b>${fixed(calc.oneC, 4)} mA</b></div><div><small>${escapeXml(preset.active)} loading</small><b>${fixed(calc.ncmLoadingArea, 8)} g cm-2</b></div><div><small>${escapeXml(preset.collector)} \uc81c\uc678 \uc9c8\ub7c9</small><b>${fixed(calc.electrodeMass, 6)} g</b></div><div><small>${escapeXml(preset.collector)} \uc81c\uc678 \ub450\uaed8</small><b>${fixed(calc.electrodeThickness, 4)} mm</b></div></div><div class="calcSlotRateGrid">${calc.rates.map((rate) => `<span><strong>${rate.rate} C</strong>${fixed(rate.current, 4)} mA</span>`).join("")}</div><div class="calcSlotActions"><button type="button" data-slot-action="calc">\uacc4\uc0b0 \uc0c8\ub85c\uace0\uce68</button><button type="button" data-slot-action="load" class="secondaryAction">\uba54\uc778\uc73c\ub85c \ubd88\ub7ec\uc624\uae30</button><button type="button" data-slot-action="save" class="saveAction">\uc800\uc7a5\uc18c\uc5d0 \uc800\uc7a5</button></div></article>`; }).join("")}</div>`;
}

function updateElectrodeSlotField(target) {
  const card = target.closest(".calcSlotCard");
  const index = Number(card?.dataset.slotIndex);
  const field = target.dataset.slotField;
  const slot = state.electrodeCalcSlots[index];
  if (!slot || !field) return null;
  if (field === "name") {
    slot.name = target.value;
  } else if (field === "calcElectrodeType") {
    slot.presetKey = target.value || "ncm";
    slot.inputs = defaultElectrodeInputs(slot.presetKey);
  } else {
    slot.inputs[field] = target.value;
  }
  persistElectrodeCalcSlots();
  return slot;
}

function handleElectrodeSlotInput(event) {
  const target = event.target.closest?.("[data-slot-field]");
  if (!target || target.dataset.slotField === "calcElectrodeType") return;
  updateElectrodeSlotField(target);
}

function handleElectrodeSlotChange(event) {
  const target = event.target.closest?.("[data-slot-field]");
  if (!target) return;
  updateElectrodeSlotField(target);
  if (target.dataset.slotField === "calcElectrodeType") renderElectrodeCalcSlots();
}

function applyElectrodeSlotToMain(slot) {
  const inputs = normalizedSlotInputs(slot.inputs, slot.presetKey);
  for (const id of ELECTRODE_INPUT_IDS) {
    if ($(id)) $(id).value = inputs[id] ?? "";
  }
  updateElectrodeLabels();
  renderElectrodeCalc();
  $("electrodeCalcResult")?.scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(`${slot.name || "\uacc4\uc0b0\uae30"} \uac12\uc744 \uba54\uc778 \uc804\uadf9 \uacc4\uc0b0\uae30\uc5d0 \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.`);
}

function saveElectrodeSlotProfile(slot) {
  const inputs = normalizedSlotInputs(slot.inputs, slot.presetKey);
  const c = electrodeCalcFromInputs(inputs, slot.presetKey);
  const customName = String(slot.name || "").trim();
  const genericName = /^\uacc4\uc0b0\uae30\\s*\\d+$/i.test(customName);
  const name = customName && !genericName ? customName : `${customName || "\uacc4\uc0b0\uae30"} - ${defaultElectrodeProfileName(c)}`;
  const profile = buildElectrodeProfileFromCalc(c, name, inputs, slot.presetKey);
  state.electrodeProfiles = [profile, ...state.electrodeProfiles.filter((item) => item.id !== profile.id)].slice(0, 40);
  state.selectedElectrodeProfileId = profile.id;
  persistElectrodeProfiles();
  renderElectrodeCalcSlots();
  setStatus(`\uacc4\uc0b0\uae30 \uac12\uc744 \uc804\uadf9 C-rate \uc800\uc7a5\uc18c\uc5d0 \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4. ${profile.name}`);
}

function handleElectrodeSlotClick(event) {
  const button = event.target.closest?.("button[data-slot-action]");
  if (!button) return;
  const card = button.closest(".calcSlotCard");
  const index = Number(card?.dataset.slotIndex);
  const slot = state.electrodeCalcSlots[index];
  if (!slot) return;
  const action = button.dataset.slotAction;
  if (action === "calc") {
    renderElectrodeCalcSlots();
    return setStatus(`${slot.name || "\uacc4\uc0b0\uae30"} C-rate \uacc4\uc0b0 \uacb0\uacfc\ub97c \uac31\uc2e0\ud588\uc2b5\ub2c8\ub2e4.`);
  }
  if (action === "load") return applyElectrodeSlotToMain(slot);
  if (action === "save") return saveElectrodeSlotProfile(slot);
}

function selectedElectrodeProfile(id = state.selectedElectrodeProfileId) {
  return state.electrodeProfiles.find((profile) => profile.id === id) || null;
}

function selectElectrodeProfile(id) {
  state.selectedElectrodeProfileId = id;
  renderElectrodeProfileStore();
}

// ?\u0080?\u03bc\ub0fc \u79fb\ub300\ubc76??"\u907a\ub348\uc72d?\u317a\ub9b0" \u8e30\uafaa\ub4c9\\u003f\\u003f\\u003f\uafa8\u2164\uf9ce??\ub085\uc830\u79fb\uba84\uc4e3 ?\u0080\\u003f\\u003f\\u003f\ubc40\ub586 \u5a9b\ubbea\uc45d\u6fe1??\uc10e\ub8ce\u7531\uc388\ub572??
function applyElectrodeProfileToInputs(id = state.selectedElectrodeProfileId) {
  const profile = selectedElectrodeProfile(id);
  if (!profile) return setStatus("\ubd88\ub7ec\uc62c \uc804\uadf9 \uacc4\uc0b0\uac12\uc744 \uba3c\uc800 \uc120\ud0dd\ud558\uc138\uc694.");
  for (const [inputId, value] of Object.entries(profile.inputs || {})) {
    if ($(inputId)) $(inputId).value = value;
  }
  updateElectrodeLabels();
  renderElectrodeCalc();
  setStatus(`\uc804\uadf9 \uacc4\uc0b0\uac12\uc744 \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4: ${profile.name}`);
}

function deleteElectrodeProfile(id) {
  state.electrodeProfiles = state.electrodeProfiles.filter((profile) => profile.id !== id);
  if (state.selectedElectrodeProfileId === id) {
    state.selectedElectrodeProfileId = state.electrodeProfiles[0]?.id || null;
  }
  persistElectrodeProfiles();
  setStatus("\uc800\uc7a5\ub41c \uc804\uadf9 \uacc4\uc0b0\uac12\uc744 \uc0ad\uc81c\ud588\uc2b5\ub2c8\ub2e4.");
}

// ?\u0080?\u03bc\ub0fc \u79fb\ub300\ubc76\\u003f\\u003f\\u003f\ub301\uc29c??CYC ?\uacd7\uc520??cell.electrodeCalc\\u003f\\u003f\\u003f\uff4a\ub9b0 ?\uafaa\ube33 ?\ubea5\uae6d\u6fe1??\ubea3\u2501?\u2478\ub572??
// ?\ub300\uc803\u5bc3??\uff4c\ubf31?\uba2e\u3203 CYC Fig?\u0080 \u907a\uafa9\uaf4d ?\ubdbe\u3203?\uba2f\uaf4c \u5a9b\uc208? \u6028\uafa9\uad9b\u5a9b\ubbea\uc4e3 ?\u317c\ub586 ?\u044a\uc29c\\u003f\\u003f\\u003f??\ub349\ub4bf?\ub348\ub58e.
function electrodeProfileCellPayload(profile) {
  return {
    profileId: profile.id,
    profileName: profile.name,
    active: profile.preset?.active || "",
    collector: profile.preset?.collector || "",
    conductor: profile.preset?.conductor || "",
    binder: profile.preset?.binder || "",
    oneC_mA: profile.oneC_mA,
    activeLoading_g_cm2: profile.activeLoading_g_cm2,
    totalLoading_g_cm2: profile.totalLoading_g_cm2,
    electrodeMass_g: profile.electrodeMass_g,
    electrodeThickness_mm: profile.electrodeThickness_mm,
    area_cm2: profile.area_cm2,
    activeMass_g: profile.activeMass_g,
    capacity_mAh_g: profile.capacity_mAh_g,
    rates: profile.rates || [],
    appliedAt: new Date().toISOString(),
  };
}

// ?\uc88f\uae6e??CYC ?\uacd7\uc520?\uacd7\ubfc9 ?\u0080?\u03bb\ub9c2 ?\uafa7\ub808 \u6028\uafa9\uad9b\u5a9b\ubbea\uc4e3 ?\uacf8\uc29c?\u2478\ub572??
// PATCH API\u745c??\uba84\ud167?\uc10d\ub9b0 ?\ub6ae\u0426\\u003f\\u003f\\u003f\uacf8\uc29c ?\uafa9\ubfc9??SQLite DB?\uba2e\ub8c4 ?\u2463\ud361 ?\u0080?\u03bb\ub9d7?\ub348\ub58e.
async function applyElectrodeProfileToSelectedCyc(id = state.selectedElectrodeProfileId) {
  const profile = selectedElectrodeProfile(id);
  if (!profile) return setStatus("CYC\uc5d0 \ub123\uc744 \uc804\uadf9 \uacc4\uc0b0\uac12\uc744 \uba3c\uc800 \uc120\ud0dd\ud558\uc138\uc694.");
  const d = state.datasets.find((x) => x.id === state.selectedId);
  if (!d) return setStatus("\uba3c\uc800 CYC \ub370\uc774\ud130\ub97c \uc120\ud0dd\ud558\uc138\uc694.");
  if (d.dataType !== "cyc") return setStatus("\uc120\ud0dd\ud55c \ub370\uc774\ud130\uac00 CYC\uac00 \uc544\ub2d9\ub2c8\ub2e4. CYC \ub370\uc774\ud130\ub97c \uc120\ud0dd\ud55c \ub4a4 \uc801\uc6a9\ud558\uc138\uc694.");
  try {
    const nextCell = {
      ...(d.cell || {}),
      material: d.cell?.material || profile.preset?.active || "",
      electrodeCalc: electrodeProfileCellPayload(profile),
    };
    const res = await fetch(`/api/datasets/${encodeURIComponent(d.id)}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ cell: nextCell }),
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || "CYC \ub370\uc774\ud130 \uc801\uc6a9 \uc2e4\ud328");
    state.datasets = state.datasets.map((item) => item.id === saved.id ? saved : item);
    state.filtered = state.filtered.map((item) => item.id === saved.id ? saved : item);
    renderCurrent();
    renderSearchResults();
    renderSavedList();
    setStatus(`\uc804\uadf9 \uacc4\uc0b0\uac12\uc744 CYC \ub370\uc774\ud130\uc5d0 \ub123\uc5c8\uc2b5\ub2c8\ub2e4: ${profile.name}`);
  } catch (error) {
    setStatus(`CYC \uc801\uc6a9 \uc2e4\ud328: ${error.message}`);
  }
}

// ?\u0080?\u03bc\ub0fc \u79fb\ub300\ubc76 ?\ub300? \u8e30\uafaa\ub4c9?\u317c\uc4e3 ??\u6028\ub179\ubfc9??\uf9e3\uc10e\u2501?\uc10e\ub497 ?\ub300\uae7d\\u003f\\u003f\\u003f\uafa9\uc5eb ?\u2465\ub2d4?\ub085\ub572??
// \u79fb\ub300\ubc76\u5a9b\u0080 ?\ub348\uc908 \u6d39\uba83\uc82e?\uba83\ub8c4 \u907a\u0080\uf9cf?\uf9cf\u2478\uc909 ?\uc10e\uad79?\uba2e\ucb54 ?\ub300\uae7d?\uba83? \u5ac4\uba83\u3203 \u6028\uafa9\ub0fd ?\ubb10\ub8de?\u2478\ub572??
function handleElectrodeProfileListClick(event) {
  const button = event.target.closest("button[data-profile-action]");
  if (!button) return;
  const id = button.dataset.profileId;
  const action = button.dataset.profileAction;
  if (action === "select") return selectElectrodeProfile(id);
  if (action === "load") return applyElectrodeProfileToInputs(id);
  if (action === "apply") return applyElectrodeProfileToSelectedCyc(id);
  if (action === "delete") return deleteElectrodeProfile(id);
}

// ?\uafa7\ub808 C-rate ?\u0080?\u03bc\ub0fc \u79fb\ub300\ubc76 \uf9cf\u2478\uc909\\u003f\\u003f\\u003f\ubdbe\u3203??\u6d39\uba83\u2530?\ub348\ub58e.
// ?\uc88f\uae6e??\u79fb\ub300\ubc76?\uba2e\ub497 active ?\ub300\uc612?\u317b? \u907a\uc208\ubfec ?\u044a\uc29c?\uba2d? ?\uafa9\uc631 ?\uc88f\uae6e\u5a9b\ubbea\uc4e3 ?\ub6af\ube18\u8e42\ub2ff\ub9b0 ?\uc384\ucfb6 ?\u2478\ub572??
function renderElectrodeProfileStore() {
  const list = $("electrodeProfileList");
  const count = $("electrodeProfileCount");
  if (!list) return;
  const profiles = state.electrodeProfiles || [];
  if (count) count.textContent = `${profiles.length}\uac1c \uc800\uc7a5\ub428`;
  if (!profiles.length) {
    list.innerHTML = `<p class="emptyProfileList">\uc544\uc9c1 \uc800\uc7a5\ub41c \uc804\uadf9 C-rate \uacc4\uc0b0\uac12\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uc704 \uac12\uc744 \uacc4\uc0b0\ud55c \ub4a4 "\ud604\uc7ac \uacc4\uc0b0 \uc800\uc7a5"\uc744 \ub204\ub974\uc138\uc694.</p>`;
    return;
  }
  list.innerHTML = profiles.map((profile) => {
    const isActive = profile.id === state.selectedElectrodeProfileId;
    const created = profile.createdAt ? new Date(profile.createdAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
    return `
      <article class="electrodeProfileItem ${isActive ? "active" : ""}">
        <div class="electrodeProfileTitle">
          <strong>${escapeXml(profile.name)}</strong>
          <span>${escapeXml(created)}</span>
        </div>
        <div class="electrodeProfileMeta">
          <div><small>\uc804\uadf9</small><b>${escapeXml(profile.preset?.active || "-")}</b></div>
          <div><small>1C</small><b>${fixed(Number(profile.oneC_mA), 4)} mA</b></div>
          <div><small>loading</small><b>${fixed(Number(profile.activeLoading_g_cm2), 8)} g cm-2</b></div>
          <div><small>\uc9c8\ub7c9</small><b>${fixed(Number(profile.electrodeMass_g), 6)} g</b></div>
        </div>
        <div class="electrodeProfileButtons">
          <button type="button" data-profile-action="select" data-profile-id="${escapeAttr(profile.id)}">\uc120\ud0dd</button>
          <button type="button" data-profile-action="load" data-profile-id="${escapeAttr(profile.id)}">\ubd88\ub7ec\uc624\uae30</button>
          <button type="button" data-profile-action="apply" data-profile-id="${escapeAttr(profile.id)}" class="saveAction">CYC\uc5d0 \ub123\uae30</button>
          <button type="button" data-profile-action="delete" data-profile-id="${escapeAttr(profile.id)}" class="secondaryAction">\uc0ad\uc81c</button>
        </div>
      </article>`;
  }).join("");
}

function renderElectrodeCalc() {
  const box = $("electrodeCalcResult");
  if (!box) return;
  const calc = electrodeCalcData();
  const active = calc.preset.active;
  const collector = calc.preset.collector;
  const conductor = calc.preset.conductor;
  const binder = calc.preset.binder;
  box.innerHTML = `
    <div class="calcCards">
      <div class="calcCard"><strong>1C \uc804\ub958 ${calcHelp(`1C \uc804\ub958 = ${active} \uc9c8\ub7c9 \u00d7 \uc774\ub860 \uc6a9\ub7c9\uc785\ub2c8\ub2e4. ${fixed(calc.ncmMass, 9)} g \u00d7 ${fixed(calc.capacity, 4)} mAh g-1 = ${fixed(calc.oneC, 4)} mA`)}</strong><span>${fixed(calc.oneC, 4)} mA</span></div>
      <div class="calcCard"><strong>${collector} \uc81c\uc678 \uc804\uadf9 \ubb34\uac8c ${calcHelp(`${collector} \uc81c\uc678 \uc804\uadf9 \ubb34\uac8c = \uc804\uadf9 \uc804\uccb4 \ubb34\uac8c - ${collector} \ubb34\uac8c`)}</strong><span>${fixed(calc.electrodeMass, 6)} g</span></div>
      <div class="calcCard"><strong>${collector} \uc81c\uc678 \uc804\uadf9 \ub450\uaed8 ${calcHelp(`${collector} \uc81c\uc678 \uc804\uadf9 \ub450\uaed8 = \uc804\uadf9 \uc804\uccb4 \ub450\uaed8 - ${collector} \ub450\uaed8`)}</strong><span>${fixed(calc.electrodeThickness, 4)} mm</span></div>
      <div class="calcCard"><strong>${active} loading ${calcHelp(`${active} loading = ${active} \uc9c8\ub7c9 / \uc804\uadf9 \uba74\uc801`)}</strong><span>${fixed(calc.ncmLoadingArea, 8)} g cm-2</span></div>
    </div>
    <section class="calcFormulaBox"><div><strong>\ubb34\uac8c \uacc4\uc0b0</strong><span>${fixed(calc.totalMass, 6)} g - ${fixed(calc.collectorMass, 6)} g = ${fixed(calc.electrodeMass, 6)} g</span></div><div><strong>\ub450\uaed8 \uacc4\uc0b0</strong><span>${fixed(calc.totalThickness, 4)} mm - ${fixed(calc.collectorThickness, 4)} mm = ${fixed(calc.electrodeThickness, 4)} mm</span></div></section>
    <section class="rateCurrentBox"><div class="rateCurrentHeader"><h3>C-rate\ubcc4 \uc804\ub958 ${calcHelp(`\uac01 C-rate \uc804\ub958 = 1C \uc804\ub958 \u00d7 C-rate\uc785\ub2c8\ub2e4.`)}</h3><span>1C = ${fixed(calc.oneC, 4)} mA \uae30\uc900</span></div><div class="rateCurrentGrid">${calc.rates.map((rate) => `<div class="rateCurrentItem"><strong>${rate.rate} C</strong><span>${fixed(rate.current, 4)} mA</span></div>`).join("")}</div></section>
    <div class="calcTableWrap"><table class="calcTable"><thead><tr><th>\ud56d\ubaa9</th><th>\uacc4\uc0b0 \uac12</th><th>\uc124\uba85</th></tr></thead><tbody>
      <tr><td>${escapeXml(collector)} \ubb34\uac8c</td><td>${fixed(calc.collectorMass, 6)} g</td><td>\uc785\ub825\ud55c \uc9d1\uc804\uccb4 \ubb34\uac8c</td></tr>
      <tr><td>\uc804\uadf9 \uc9c8\ub7c9</td><td>${fixed(calc.electrodeMass, 6)} g</td><td>\uc804\uccb4 \ubb34\uac8c\uc5d0\uc11c \uc9d1\uc804\uccb4 \ubb34\uac8c\ub97c \uc81c\uc678</td></tr>
      <tr><td>\uc804\uadf9 \uba74\uc801</td><td>${fixed(calc.area, 6)} cm2</td><td>\uc9c0\ub984 ${fixed(calc.diameter, 4)} mm \uae30\uc900</td></tr>
      <tr><td>${escapeXml(active)} \uc9c8\ub7c9</td><td>${fixed(calc.ncmMass, 9)} g</td><td>\uc804\uadf9 \uc9c8\ub7c9 \u00d7 ${fixed(calc.ncmRatio * 100, 2)}%</td></tr>
      <tr><td>${escapeXml(conductor)} \uc9c8\ub7c9</td><td>${fixed(calc.superMass, 9)} g</td><td>\uc804\uadf9 \uc9c8\ub7c9 \u00d7 ${fixed(calc.superRatio * 100, 2)}%</td></tr>
      <tr><td>${escapeXml(binder)} \uc9c8\ub7c9</td><td>${fixed(calc.ptfeMass, 9)} g</td><td>\uc804\uadf9 \uc9c8\ub7c9 \u00d7 ${fixed(calc.ptfeRatio * 100, 2)}%</td></tr>
      <tr><td>loading</td><td>${fixed(calc.loading, 8)} g cm-2</td><td>\uc804\uadf9 \uc9c8\ub7c9 / \uba74\uc801</td></tr>
      <tr><td>${escapeXml(active)} loading</td><td>${fixed(calc.ncmLoadingArea, 8)} g cm-2</td><td>${escapeXml(active)} \uc9c8\ub7c9 / \uba74\uc801</td></tr>
    </tbody></table></div>
    <p class="copyNote">\uc9d1\uc804\uccb4 \ubb34\uac8c\uc640 \ub450\uaed8\ub294 \uc804\uccb4 \uc804\uadf9 \uac12\uc5d0\uc11c \ube60\uc9c4 \uac12\uc785\ub2c8\ub2e4. \uc9c0\ub984\uc744 \ubc14\uafb8\uba74 loading\uacfc \ubc00\ub3c4\uac00 \ud568\uaed8 \ubc14\ub00d\ub2c8\ub2e4.</p>`;
  renderElectrodeProfileStore();
  renderElectrodeCalcSlots();
}

function runElectrodeCalc() {
  lastElectrodeCalcAt = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  renderElectrodeCalc();
  const box = $("electrodeCalcResult");
  box?.insertAdjacentHTML("beforeend", `<p class="calcUpdated">\uacc4\uc0b0 \uc644\ub8cc: ${escapeXml(lastElectrodeCalcAt)}</p>`);
  box?.classList.remove("calcFlash");
  void box?.offsetWidth;
  box?.classList.add("calcFlash");
  setStatus("\uc804\uadf9 \uacc4\uc0b0 \uc644\ub8cc");
}

function toggleCalcHelp(event) {
  const button = event.target.closest?.(".calcHelpButton");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const old = button.parentElement?.querySelector(".calcHelpText");
  if (old) {
    old.remove();
    button.setAttribute("aria-expanded", "false");
    return;
  }
  document.querySelectorAll(".calcHelpText").forEach((el) => el.remove());
  document.querySelectorAll(".calcHelpButton[aria-expanded='true']").forEach((el) => el.setAttribute("aria-expanded", "false"));
  const text = button.dataset.calcHelp || "";
  const note = document.createElement("span");
  note.className = "calcHelpText";
  note.textContent = text;
  button.insertAdjacentElement("afterend", note);
  button.setAttribute("aria-expanded", "true");
}

function copyElectrodeCalc() {
  const c = electrodeCalcData();
  const rows = [
    ["\ud56d\ubaa9", "\uac12", "\ub2e8\uc704"],
    ["1C \uc804\ub958", fixed(c.oneC, 6), "mA"],
    ["\uc804\uadf9 \ubb34\uac8c except Al", fixed(c.electrodeMass, 9), "g"],
    ["\uc804\uadf9 \ub450\uaed8 except Al", fixed(c.electrodeThickness, 6), "mm"],
    ["\uba74\uc801", fixed(c.area, 9), "cm2"],
    ["loading", fixed(c.loading, 9), "g cm-2"],
    ["NCM \uc9c8\ub7c9", fixed(c.ncmMass, 9), "g"],
    ["Super P \uc9c8\ub7c9", fixed(c.superMass, 9), "g"],
    ["PTFE \uc9c8\ub7c9", fixed(c.ptfeMass, 9), "g"],
    ["\uc804\uccb4 \ubc00\ub3c4", fixed(c.totalDensity, 9), "g cm-3"],
    ["NCM loading", fixed(c.ncmLoadingArea, 9), "g cm-2"],
    ["NCM density", fixed(c.ncmLoadingVolume, 9), "g cm-3"],
    ...c.rates.map((r) => [`${r.rate} C \uc804\ub958`, fixed(r.current, 6), "mA"]),
  ];
  const text = rows.map((row) => row.join("\t")).join("\n");
  navigator.clipboard?.writeText(text).then(
    () => setStatus("\uc804\uadf9 \uacc4\uc0b0\ud45c\ub97c \ubcf5\uc0ac\ud588\uc2b5\ub2c8\ub2e4."),
    () => setStatus("\ubcf5\uc0ac \uad8c\ud55c\uc774 \uc5c6\uc5b4 \ud45c\ub97c \uc120\ud0dd\ud574\uc11c \ubcf5\uc0ac\ud574 \uc8fc\uc138\uc694.")
  );
}

async function submitFeedback(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = $("feedbackStatus");
  const fd = new FormData(form);
  const message = String(fd.get("message") || "").trim();
  if (!message) {
    if (status) {
      status.textContent = "\uc218\uc815 \uc694\uccad \ub0b4\uc6a9\uc744 \uba3c\uc800 \uc801\uc5b4\uc8fc\uc138\uc694.";
      status.className = "error";
    }
    return;
  }
  const selected = currentDataset();
  const activeTab = document.querySelector(".tab.active")?.textContent?.trim() || "";
  const payload = {
    name: fd.get("name"),
    email: fd.get("email"),
    page: fd.get("page") || activeTab,
    message,
    selectedDatasetId: selected?.id || "",
    selectedDatasetName: selected ? sampleLabel(selected) : "",
  };
  if (status) {
    status.textContent = "\uc758\uacac\uc744 \uc800\uc7a5\ud558\ub294 \uc911\uc785\ub2c8\ub2e4...";
    status.className = "";
  }
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "\uc758\uacac \uc800\uc7a5 \uc2e4\ud328");
    form.reset();
    if (status) {
      const when = new Date(body.createdAt || Date.now()).toLocaleString("ko-KR");
      status.textContent = `\uc800\uc7a5\ub410\uc2b5\ub2c8\ub2e4. \uc811\uc218 \uc2dc\uac04: ${when}`;
      status.className = "success";
    }
    setStatus("\uc218\uc815 \uc694\uccad \uc800\uc7a5 \uc644\ub8cc");
    if (state.user?.role === "admin") loadFeedbacks().catch(() => {});
  } catch (err) {
    if (status) {
      status.textContent = err.message || "\uc758\uacac\uc744 \uc800\uc7a5\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.";
      status.className = "error";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setBusy(false);
  if ($("appVersion")) $("appVersion").textContent = PORTAL_VERSION_LABEL;
  on("loginForm", "submit", safeLogin);
  on("registerForm", "submit", safeRegister);
  on("registerButton", "click", safeRegister);
  on("logoutBtn", "click", () => applyUser(null));
  on("createOrganization", "click", () => createOrganizationFromInput().catch((err) => setStatus(err.message)));
  on("addOrganizationMember", "click", () => addOrganizationMember().catch((err) => setStatus(err.message)));
  on("refreshOrganizationMembers", "click", () => loadOrganizationMembers().catch((err) => setStatus(err.message)));
  on("organizationSelect", "change", () => {
    state.selectedOrganizationId = $("organizationSelect")?.value || "";
    state.organizationMembers = [];
    renderOrganizationView();
    loadOrganizationMembers().catch((err) => setStatus(err.message));
  });
  on("createProject", "click", () => createProjectFromInput().catch((err) => setStatus(err.message)));
  on("createCampaign", "click", () => createCampaignFromInput().catch((err) => setStatus(err.message)));
  on("createDatasetGroup", "click", () => createDatasetGroupFromInput().catch((err) => setStatus(err.message)));
  on("openUploadFilePicker", "click", () => $("smartFile")?.click());
  on("cycFigureViewPicker", "click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-cyc-figure-view]") : null;
    if (!button) return;
    const dataset = state.datasets.find((item) => item.id === state.selectedId);
    const figureKind = String(button.dataset.cycFigureView || "");
    if (!dataset || dataset.dataType !== "cyc" || !CYC_FIGURE_VIEW_OPTIONS.some((option) => option.kind === figureKind)) return;
    state.cycFigureViewKinds[dataset.id] = figureKind;
    renderFigure(dataset);
  });
  on("projectSelect", "change", () => renderHierarchyControls({ projectId: $("projectSelect")?.value || "", campaignId: "", cellRecordId: "" }));
  on("campaignSelect", "change", () => renderHierarchyControls({ projectId: $("projectSelect")?.value || "", campaignId: $("campaignSelect")?.value || "", cellRecordId: "" }));
  on("cellRecordSelect", "change", () => renderHierarchyControls(hierarchySelectionPayload()));
  on("datasetGroupSelect", "change", () => renderHierarchyControls(hierarchySelectionPayload()));
  on("reloadUsers", "click", () => loadUsers());
  on("reloadFeedback", "click", () => loadFeedbacks().catch((err) => setStatus(err.message)));
  on("adminRawAccessForm", "submit", requestAdminRawAccess);
  on("refreshAdminRawData", "click", () => loadAdminRawDatasets().catch((err) => setAdminRawDataNotice(err.message || "\ub85c\uc6b0 \ub370\uc774\ud130 \ubaa9\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.", true)));
  on("clearAdminRawOwnerFilter", "click", () => clearAdminRawOwnerFilter().catch((err) => setAdminRawDataNotice(err.message || "\ub85c\uc6b0 \ub370\uc774\ud130 \ubaa9\ub85d\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.", true)));
  on("adminRawDatasetList", "click", (event) => {
    const button = event.target.closest("[data-admin-raw-download]");
    if (!button) return;
    downloadAdminRawDataset(button.dataset.adminRawDownload, button)
      .catch((err) => setAdminRawDataNotice(err.message || "\uc6d0\ubcf8 \ud30c\uc77c\uc744 \ub2e4\uc6b4\ub85c\ub4dc\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.", true));
  });
  on("backHome", "click", showHome);
  on("brandHome", "click", showHome);
  on("brandHome", "keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showHome();
    }
  });
  for (const card of document.querySelectorAll(".moduleCard")) {
    card.addEventListener("click", () => {
      if (card.dataset.view === "search") return openSearchView(card.dataset.searchType || "all");
      if (card.dataset.view) return openWorkspaceView(card.dataset.view);
      showModule(card.dataset.module);
    });
  }
  for (const item of document.querySelectorAll(".menuTrigger, .menuItem, .searchShortcutPanel [data-view]")) {
    item.addEventListener("click", () => navigateMenuTarget(item));
  }
  on("datasetForm", "submit", saveDataset);
  on("datasetSelect", "change", (e) => { state.selectedId = e.target.value; renderSavedList(); renderCurrent(); });
  on("analysisLabDatasetSelect", "change", (e) => {
    state.selectedId = e.target.value;
    state.analysisRuns = [];
    state.selectedAnalysisRunId = null;
    renderSelect();
    renderSavedList();
    renderCurrent();
    loadAnalysisRuns().catch((err) => setStatus(err.message));
  });
  on("analysisType", "change", () => renderAnalysisLab());
  on("runDatasetAnalysis", "click", runSelectedDatasetAnalysis);
  on("refreshAnalysisRuns", "click", () => loadAnalysisRuns().catch((err) => setStatus(err.message)));
  on("savedDateSelect", "change", applyFilters);
  on("fromDate", "input", applyFilters);
  on("toDate", "input", applyFilters);
  on("query", "input", applyFilters);
  on("clearFilters", "click", clearSearchFilters);
  on("reloadData", "click", loadData);
  on("cellMetadataForm", "submit", saveCellMetadata);
  on("protocolSegmentForm", "submit", saveProtocolSegment);
  for (const btn of document.querySelectorAll(".searchType")) {
    btn.addEventListener("click", () => {
      setSearchType(btn.dataset.searchType || "all");
      applyFilters();
    });
  }
  on("exportSvg", "click", exportSvg);
  on("exportPng", "click", exportPng);
  on("exportPpt", "click", exportPpt);
  on("deleteDataset", "click", deleteCurrent);
  on("applyCellInfo", "click", applyCellInfo);
  on("saveCellInfoTop", "click", applyCellInfo);
  on("undoExcelEdit", "click", undoExcelEdit);
  on("addExcelRow", "click", addExcelRow);
  on("deleteExcelRow", "click", deleteSelectedExcelRow);
  on("saveExcelRows", "click", saveCurrentExcelRows);
  on("excelTablePreviousPage", "click", () => changeExcelTablePage(-1));
  on("excelTableNextPage", "click", () => changeExcelTablePage(1));
  on("saveFigureEdits", "click", () => saveFigureEdits(false));
  on("compareCycFigures", "click", renderCycComparison);
  on("clearCompareSelection", "click", clearCompareSelection);
  on("addAnnotation", "click", addOrUpdateAnnotation);
  on("decreaseAnnotationSize", "click", () => changeAnnotationSize(-1));
  on("increaseAnnotationSize", "click", () => changeAnnotationSize(1));
  on("annotationSize", "change", () => changeAnnotationSize(0));
  on("figureSeriesColor", "input", changeFigureSeriesColor);
  on("profileSeriesSelect", "change", changeProfileSeriesSelection);
  on("profileSeriesColor", "input", changeProfileSeriesColor);
  on("profileSeriesColorReset", "click", resetProfileSeriesColor);
  on("dqdvSeriesSelect", "change", changeDqdvSeriesSelection);
  on("dqdvSeriesColor", "input", changeDqdvSeriesColor);
  on("dqdvSeriesColorReset", "click", resetDqdvSeriesColor);
  on("figureAspectRatio", "change", changeFigureAspectRatio);
  on("figureShowGrid", "change", changeFigureGridVisibility);
  on("figureConnectPoints", "change", changeFigureConnectionVisibility);
  on("figureMarkerSize", "change", changeFigureMarkerSize);
  on("applyFigureAxisRange", "click", applyFigureAxisRange);
  on("resetFigureAxisRange", "click", resetFigureAxisRange);
  on("figureAxisRangeTarget", "change", changeFigureAxisRangeTarget);
  on("clearAnnotations", "click", clearAnnotations);
  on("annotationText", "keydown", (event) => { if (event.key === "Enter") addOrUpdateAnnotation(); });
  on("smartFile", "change", () => resetAnalysisForNewFile());
  on("inspectFile", "click", () => inspectSelectedFile());
  on("batchCreateFigures", "click", createBatchFigures);
  on("inspectManual", "click", inspectManualFile);
  on("runElectrodeCalc", "click", runElectrodeCalc);
  on("copyElectrodeCalc", "click", copyElectrodeCalc);
  on("saveElectrodeProfile", "click", saveElectrodeProfile);
  on("applyElectrodeProfileToCyc", "click", () => applyElectrodeProfileToSelectedCyc());
  on("feedbackForm", "submit", submitFeedback);
  $("organizationMembersList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-organization-member]");
    if (button) removeOrganizationMember(button.dataset.removeOrganizationMember).catch((err) => setStatus(err.message));
  });
  $("electrodeProfileList")?.addEventListener("click", handleElectrodeProfileListClick);
  $("electrodeCalcResult")?.addEventListener("click", toggleCalcHelp);
  $("electrodeCalcSlots")?.addEventListener("input", handleElectrodeSlotInput);
  $("electrodeCalcSlots")?.addEventListener("change", handleElectrodeSlotChange);
  $("electrodeCalcSlots")?.addEventListener("click", handleElectrodeSlotClick);
  on("calcElectrodeType", "change", applyElectrodePreset);
  for (const id of ["calcTotalMass", "calcCollectorMass", "calcTotalThickness", "calcCollectorThickness", "calcDiameter", "calcCapacity", "calcNcmRatio", "calcSuperRatio", "calcPtfeRatio"]) {
    on(id, "input", renderElectrodeCalc);
  }
  on("createFigure", "click", createSmartFigure);
  $("batchFigureResults")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-batch-figure]");
    if (!button) return;
    const dataset = state.datasets.find((item) => item.id === button.dataset.openBatchFigure);
    if (!dataset) return setStatus("\uc120\ud0dd\ud55c Dataset\uc744 \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \ubaa9\ub85d\uc744 \uc0c8\ub85c\uace0\uce68\ud55c \ub4a4 \ub2e4\uc2dc \uc120\ud0dd\ud574 \uc8fc\uc138\uc694.");
    showDatasetImmediately(dataset);
    showModule(["cyc", "cv", "eis"].includes(dataset.dataType) ? dataset.dataType : "figure");
  });
  for (const tab of document.querySelectorAll(".tab")) {
    tab.addEventListener("click", () => {
      if (tab.dataset.module) {
        showModule(tab.dataset.module);
        return;
      }
      openWorkspaceView(tab.dataset.view);
    });
  }
  const cached = localStorage.getItem("eisUser");
  if (cached) {
    try { applyUser(JSON.parse(cached)); }
    catch { applyUser(null); }
  } else {
    applyUser(null);
  }
  loadElectrodeProfiles();
  loadElectrodeCalcSlots();
  updateElectrodeLabels();
  renderElectrodeCalc();
});

// Authoritative saved-Fig labels. Unicode escapes keep this browser-facing
// Korean text stable even when a Windows editor uses a non-UTF-8 code page.
function savedFigText() {
  return {
    empty: "\uc800\uc7a5\ub41c Fig\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
    open: "Fig \uc5f4\uae30",
    remove: "\uc800\uc7a5\ub41c Fig \uc0ad\uc81c",
    dateMissing: "\ub0a0\uc9dc \uc5c6\uc74c",
    compare: "\ube44\uad50",
    compareSelect: "CYC \ube44\uad50 \uc120\ud0dd",
    cycOnly: "CYC Fig\ub9cc \ube44\uad50\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    selected: "\uac1c CYC Fig \uc120\ud0dd\ub428",
    cleared: "\ube44\uad50 \uc120\ud0dd\uc744 \ud574\uc81c\ud588\uc2b5\ub2c8\ub2e4.",
    loaded: "\uc800\uc7a5\ub41c Fig\ub97c \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.",
    compareTitle: "CYC \ube44\uad50 Fig",
    compareCount: "\uac1c Fig \ube44\uad50",
    compareSave: "\ube44\uad50 Fig \uc800\uc7a5",
    chooseTwo: "CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uba74 \ube44\uad50 \uadf8\ub798\ud504\ub97c \ub9cc\ub4e4 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    noSeries: "\uc120\ud0dd\ud55c CYC Fig\uc5d0 \ube44\uad50\ud560 \uc218 \uc788\ub294 \ubc29\uc804\uc6a9\ub7c9 \ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
    compared: "CYC \ube44\uad50 Fig\ub97c \ub9cc\ub4e4\uc5c8\uc2b5\ub2c8\ub2e4.",
    saveNeedsTwo: "\uc800\uc7a5\ud558\ub824\uba74 CYC Fig\ub97c 2\uac1c \uc774\uc0c1 \uc120\ud0dd\ud558\uc138\uc694.",
    saveFailed: "\ube44\uad50 Fig \uc800\uc7a5\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.",
    saved: "\ube44\uad50 Fig\ub97c \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.",
    exportMissing: "\uba3c\uc800 \ube44\uad50 Fig\ub97c \ub9cc\ub4e4\uc5b4\uc8fc\uc138\uc694.",
  };
}

function figureLabel(d) {
  const labels = {
    "cycling-performance": "\uc131\ub2a5 \ud14c\uc2a4\ud2b8 Fig",
    "voltage-profile": "\uc804\uc555 \ud504\ub85c\ud30c\uc77c Fig",
    "dqdv": "dQ/dV Fig",
    "cyc-combined": "\uc131\ub2a5 \ud14c\uc2a4\ud2b8 Fig",
    "nyquist": "Nyquist Fig",
    "bode": "Bode Fig",
    "eis-combined": "Nyquist + Bode Fig",
    "cv-curve": "CV Fig",
    "cv-comparison": "CV \ube44\uad50 Fig",
    "table-preview": "\ud45c \ubbf8\ub9ac\ubcf4\uae30",
  };
  return labels[d.figureKind] || String(d.dataType || "data").toUpperCase() + " Fig";
}

function normalizeSavedFigureDateToken(token) {
  const digits = String(token || "");
  if (![6, 8].includes(digits.length)) return "";
  const year = digits.length === 6 ? 2000 + Number(digits.slice(0, 2)) : Number(digits.slice(0, 4));
  const month = Number(digits.slice(-4, -2));
  const day = Number(digits.slice(-2));
  if (year < 2000 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) return "";
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return "";
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function savedFigureSourceDateKey(sourceName) {
  const matches = String(sourceName || "").matchAll(/(?:^|\D)(\d{8}|\d{6})(?=\D|$)/g);
  for (const match of matches) {
    const dateKey = normalizeSavedFigureDateToken(match[1]);
    if (dateKey) return dateKey;
  }
  return "";
}

function savedFigureDateKey(dataset) {
  const sourceDate = savedFigureSourceDateKey(dataset?.sourceName);
  if (sourceDate) return sourceDate;
  const candidates = [dataset?.cell?.date, dataset?.createdAt, dataset?.updatedAt];
  for (const value of candidates) {
    const match = String(value || "").match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  return "unknown";
}

function savedFigureDateLabel(dateKey) {
  return dateKey === "unknown" ? savedFigText().dateMissing : dateKey;
}

function savedFigureTypeKey(dataset) {
  const type = String(dataset?.dataType || "").toLowerCase();
  return ["cyc", "eis", "cv"].includes(type) ? type : "other";
}

function savedFigureTypeLabel(type) {
  return { cyc: "CYC", eis: "EIS", cv: "CV", other: "\uae30\ud0c0" }[type] || "\uae30\ud0c0";
}

function savedFigureCardHtml(dataset, text) {
  const cell = dataset.cell || {};
  const dateKey = savedFigureDateKey(dataset);
  const active = dataset.id === state.selectedId ? " active" : "";
  const title = datasetDisplayName(dataset);
  const sub = [figureLabel(dataset), String(datasetPointCount(dataset)) + " points", hierarchyLabel(dataset), displayUserName(dataset)].filter(Boolean).join(" \u00b7 ");
  const isCyc = String(dataset.dataType || "").toLowerCase() === "cyc";
  return [
    '<article class="savedItem' + active + (isCyc ? " cycSavedItem" : "") + '" data-dataset-id="' + escapeAttr(dataset.id) + '">',
    '<label class="compareCheck' + (isCyc ? "" : " disabled") + '" title="' + (isCyc ? text.compareSelect : text.cycOnly) + '">',
    '<input type="checkbox" data-compare-id="' + escapeAttr(dataset.id) + '"' + (state.compareIds.includes(dataset.id) ? " checked" : "") + (isCyc ? "" : " disabled") + " />",
    "<span>" + text.compare + "</span></label>",
    '<button type="button" class="savedOpen" data-dataset-id="' + escapeAttr(dataset.id) + '" title="' + text.open + '">',
    figureThumb(dataset),
    '<span class="savedInfo"><strong>' + escapeXml(title) + "</strong>",
    "<span>" + escapeXml(savedFigureDateLabel(dateKey)) + " \u00b7 " + escapeXml(sub) + "</span>",
    "<em>" + escapeXml(dataset.sourceName || dataset.id) + "</em></span></button>",
    isCyc ? '<button type="button" class="savedRecordOpen" data-dataset-id="' + escapeAttr(dataset.id) + '" title="CYC \ud1b5\ud569 \uae30\ub85d \uc5f4\uae30">\ud1b5\ud569</button>' : "",
    '<button type="button" class="savedDelete" data-dataset-id="' + escapeAttr(dataset.id) + '" title="' + text.remove + '">\u00d7</button>',
    "</article>",
  ].join("");
}

function renderSavedList() {
  const list = $("savedList");
  if (!list) return;
  const text = savedFigText();
  document.querySelectorAll("#savedCount").forEach((element) => {
    element.textContent = String(state.filtered.length) + "\uac1c";
  });
  const heading = document.querySelector("#savedFiguresView .savedFigureHeader h2");
  const description = document.querySelector("#savedFiguresView .savedFigureHeader p");
  const compareButton = $("compareCycFigures");
  const clearButton = $("clearCompareSelection");
  if (heading) heading.textContent = "\uc800\uc7a5\ub41c Fig";
  if (description) description.textContent = "\uc800\uc7a5\ud55c Fig\ub97c \uc120\ud0dd\ud574 \ub2e4\uc2dc \uc5f4\uac70\ub098 \uc0ad\uc81c\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";
  if (compareButton) compareButton.textContent = "\uc120\ud0dd CYC \ube44\uad50";
  if (clearButton) clearButton.textContent = "\uc120\ud0dd \ud574\uc81c";
  if (!state.filtered.length) {
    list.innerHTML = '<p class="emptySaved">' + text.empty + "</p>";
    return;
  }
  const groupedByDate = state.filtered.reduce((groups, dataset) => {
    const dateKey = savedFigureDateKey(dataset);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(dataset);
    return groups;
  }, {});
  const dateKeys = Object.keys(groupedByDate).sort((a, b) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return b.localeCompare(a);
  });
  const typeOrder = ["cyc", "eis", "cv", "other"];
  list.innerHTML = dateKeys.map((dateKey, dateIndex) => {
    const datasets = groupedByDate[dateKey];
    const groupedByType = datasets.reduce((groups, dataset) => {
      const typeKey = savedFigureTypeKey(dataset);
      if (!groups[typeKey]) groups[typeKey] = [];
      groups[typeKey].push(dataset);
      return groups;
    }, {});
    const sections = typeOrder.filter((typeKey) => groupedByType[typeKey]?.length).map((typeKey) => [
      '<section class="savedFigureTypeSection" data-figure-type="' + typeKey + '">',
      '<div class="savedFigureTypeHeader"><strong>' + savedFigureTypeLabel(typeKey) + '</strong><span>' + groupedByType[typeKey].length + '\uac1c</span></div>',
      '<div class="savedFigureTypeGrid">',
      groupedByType[typeKey].map((dataset) => savedFigureCardHtml(dataset, text)).join(""),
      "</div></section>",
    ].join("")).join("");
    return [
      '<details class="savedFigureDateGroup"' + (dateIndex === 0 ? " open" : "") + '>',
      '<summary class="savedFigureDateSummary"><strong>' + savedFigureDateLabel(dateKey) + '</strong><span>' + datasets.length + '\uac1c Fig</span></summary>',
      '<div class="savedFigureDateBody">' + sections + "</div>",
      "</details>",
    ].join("");
  }).join("");
  list.querySelectorAll(".savedOpen").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.datasetId;
      state.selectedAnnotation = null;
      renderSelect();
      renderSavedList();
      renderCurrent();
      state.activeFigureModule = state.datasets.find((dataset) => dataset.id === state.selectedId)?.dataType || state.activeFigureModule;
      activateView("figure", state.activeFigureModule);
      setStatus(text.loaded);
    });
  });
  list.querySelectorAll(".savedRecordOpen").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      state.selectedId = button.dataset.datasetId;
      state.selectedAnnotation = null;
      await renderCycRecordView();
    });
  });
  list.querySelectorAll(".savedDelete").forEach((button) => {
    button.addEventListener("click", (event) => deleteSavedFigure(button.dataset.datasetId, event));
  });
  list.querySelectorAll("input[data-compare-id]").forEach((input) => {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", () => toggleCompareSelection(input.dataset.compareId, input.checked));
  });
}

function toggleCompareSelection(id, checked) {
  if (!id) return;
  const text = savedFigText();
  const target = state.datasets.find((dataset) => dataset.id === id);
  if (target?.dataType !== "cyc") {
    setStatus(text.cycOnly);
    return;
  }
  if (checked && !state.compareIds.includes(id)) state.compareIds.push(id);
  if (!checked) state.compareIds = state.compareIds.filter((item) => item !== id);
  setStatus(String(state.compareIds.length) + text.selected);
}

function clearCompareSelection() {
  state.compareIds = [];
  renderSavedList();
  const preview = $("comparisonPreview");
  if (preview) {
    preview.classList.add("hidden");
    preview.innerHTML = "";
  }
  setStatus(savedFigText().cleared);
}

async function renderCycComparison() {
  const preview = $("comparisonPreview");
  if (!preview) return;
  const text = savedFigText();
  const selectedIds = state.compareIds.slice(0, 8);
  preview.classList.remove("hidden");
  if (selectedIds.length < 2) {
    preview.innerHTML = '<p class="emptySaved">' + text.chooseTwo + "</p>";
    setStatus(text.chooseTwo);
    return;
  }
  const missingSeriesIds = selectedIds.filter((datasetId) => !state.comparisonSeriesByDatasetId.has(datasetId));
  if (missingSeriesIds.length) {
    try {
      setStatus("\uc120\ud0dd\ud55c CYC Fig \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4...");
      await Promise.all(missingSeriesIds.map((datasetId) => hydrateCycComparisonSeries(datasetId)));
    } catch (error) {
      const message = error.message || "\uc120\ud0dd\ud55c CYC Fig \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.";
      preview.innerHTML = '<p class="emptySaved">' + escapeXml(message) + "</p>";
      setStatus(message);
      return;
    }
  }
  const series = selectedComparisonSeries();
  if (series.length < 2) {
    preview.innerHTML = '<p class="emptySaved">' + text.noSeries + "</p>";
    setStatus(text.noSeries);
    return;
  }
  const colorMap = Object.fromEntries(series.map((item, index) => [item.d.id, comparisonColor(item.d.id, index)]));
  preview.innerHTML = [
    '<div class="comparisonTitle"><div><strong>' + text.compareTitle + "</strong>",
    "<span>" + String(series.length) + text.compareCount + "</span></div>",
    '<div class="comparisonActions">',
    '<button type="button" id="saveComparisonFigure">' + text.compareSave + "</button>",
    '<button type="button" id="exportComparisonSvg" class="secondaryAction">SVG</button>',
    '<button type="button" id="exportComparisonPng" class="secondaryAction">PNG</button>',
    '<button type="button" id="exportComparisonPpt" class="secondaryAction">PPT</button>',
    "</div></div>",
    '<div class="comparisonControls">',
    series.map((item, index) => [
      '<label class="comparisonColorItem"><input type="color" data-comparison-color="',
      escapeAttr(item.d.id),
      '" value="',
      comparisonColor(item.d.id, index),
      '" /><span>',
      escapeXml(item.name),
      "</span></label>",
    ].join("")).join(""),
    "</div>",
    renderComparisonSvg(series, colorMap),
  ].join("");
  preview.querySelectorAll("[data-comparison-color]").forEach((input) => {
    input.addEventListener("input", () => {
      state.comparisonColors[input.dataset.comparisonColor] = normalizeHexColor(input.value, "#0f766e");
      renderCycComparison();
    });
  });
  $("saveComparisonFigure")?.addEventListener("click", saveComparisonFigure);
  $("exportComparisonSvg")?.addEventListener("click", exportComparisonSvg);
  $("exportComparisonPng")?.addEventListener("click", exportComparisonPng);
  $("exportComparisonPpt")?.addEventListener("click", exportComparisonPpt);
  setStatus(text.compared);
}

async function saveComparisonFigure() {
  const series = selectedComparisonSeries();
  const text = savedFigText();
  if (series.length < 2) return setStatus(text.saveNeedsTwo);
  const comparisonColors = Object.fromEntries(series.map((item, index) => [item.d.id, comparisonColor(item.d.id, index)]));
  const payload = {
    dataType: "cyc-comparison",
    figureKind: "cyc-comparison",
    cell: {
      date: todayLocal(),
      cellId: "CYC comparison",
      sampleName: String(series.length) + " CYC figures",
      material: "CYC",
      condition: "comparison",
      notes: series.map((item) => item.name).join(" / "),
    },
    rows: comparisonRowsFromSeries(series),
    columns: ["sourceId", "sourceName", "cycle", "capacity"],
    sourceName: series.map((item) => item.name).join(" + "),
    figureEdits: { comparisonColors },
  };
  const response = await fetch("/api/datasets", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return setStatus(body.error || text.saveFailed);
  }
  const saved = await response.json();
  state.datasets.unshift(saved);
  showDatasetImmediately(saved);
  activateView("figure", "cyc");
  setStatus(text.saved);
}

function exportComparisonSvg() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus(savedFigText().exportMissing);
  download("cyc-comparison.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml");
}

function exportComparisonPng() {
  const svg = $("comparisonFigure");
  if (!svg) return setStatus(savedFigText().exportMissing);
  svgToPngBlob(svg).then((blob) => {
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "cyc-comparison.png";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }).catch((error) => setStatus(error.message || "PNG \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."));
}
