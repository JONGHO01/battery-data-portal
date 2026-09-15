# Data Workspace — v0.3.0

## Scope

Open **업로드 → 데이터 관리 · 전처리 · 채팅**. This release is the local-first foundation, not a deployed LLM agent.

- Regular users can read and modify only their own research data. Global administrators can access all research data; organization membership and organization-admin roles do not grant access.
- File cards show original name, owner, measurement type, row count and user-managed material/composition/conditions/tags. Original filenames are retained. Material aliases are suggestions requiring a user action, not inferred experimental facts.
- Source downloads retain existing private-storage handling. Global administrators must also complete the existing additional raw-access confirmation.
- The chat panel performs authorized keyword search only. It sends nothing to an LLM and has no durable conversation history. It does not execute mutations.

## Preprocessing

Preview supports dropping entirely empty rows and explicit numeric multiplication into a new column with a user-provided unit. It does not infer mass, physical units or missing scientific values. Invalid numeric values are counted and become null only in the new column. Original rows remain unchanged.

The complete retained analysis artifact is used, not the UI preview. Current limit: 200,000 input rows; preview returns the first 20 processed rows.

A saved version contains the immutable recipe, input fingerprint, metadata and parser/provenance information. Processed rows are regenerated for JSON download only if the input fingerprint still matches. Changed inputs produce HTTP 409. This is **not** an independent historical snapshot of processed data; do not rely on it for long-term archival after editing or deleting the source.

## API contract

All endpoints require an authenticated portal session and server-side owner/global-admin checks.

| Route under /api/data-workspace | Method | Purpose |
| --- | --- | --- |
| /files?q=&page=1 | GET | Authorized file search, 20 results/page |
| /files/{id}/profile | PUT | Allowlisted metadata and optimistic revision check |
| /files/{id}/download | GET | Protected source download |
| /files/{id}/preview | POST | Recipe preview and input fingerprint |
| /files/{id}/versions | POST | Explicitly confirmed recipe version |
| /files/{id}/versions | GET | Latest 100 version manifests |
| /files/{id}/versions/{version}/download | GET | Verified JSON regeneration |

Foreign and missing Dataset IDs return 404. Stale revisions or fingerprints return 409. Invalid recipes return 400. New tables are additive: workspace_profiles and workspace_versions.

## Remaining work

Actual OpenAI integration needs an API key and explicit agreement on research-data transmission scope. Administrative read access does not imply permission to send data to an external model or use it for training.

Persistent per-user conversations, immutable processed-artifact storage, richer scientifically validated preprocessing, granular training consent and versioned aggregate model datasets are not implemented. Every current manifest marks trainingStatus as not_authorized. Production Neon/B2 integration and the running local process must be verified separately.
