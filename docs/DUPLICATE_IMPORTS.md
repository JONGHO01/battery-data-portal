# Duplicate upload replacement

The portal single-file, batch, and legacy CSV upload UI uses `POST /api/dataset-imports`. Existing `POST /api/datasets` callers retain their prior behavior (including same-hash reuse); this additive import API does not change analysis or figure editing contracts.

## Matching and consent

- Compare the authenticated owner's full original filename, including extension, after basename extraction, NFKC normalization, trim and case folding. Other owners are never replacement targets, even for a global administrator. Project/type filters do not hide that owner's matching files.
- A verified upload session's filename overrides client `sourceName`. Without an upload session (legacy CSV), require a nonempty sourceName, at most 500 characters.
- Request fields otherwise match Dataset creation. Initially omit `replaceExisting`.
- On a collision, return HTTP 409 with `detail: {code: "duplicate_source_name", conflicts: [{id, sourceName, updatedAt}, ...]}`. Nothing is saved or deleted yet. The UI lists every target and warns about irreversible deletion; cancel aborts this file, while a batch continues with its other files.
- After explicit confirmation, resend the payload with `replaceExisting` equal to that exact list. Validate the list shape, authenticated owner, current name and revision server-side; an altered/stale list requires a fresh confirmation. Never interpret a filename or client ID as a deletion path.

## Persistence and deletion

- Always create a fresh Dataset ID and artifacts for an import; do not reuse same-hash records during replacement.
- Commit the new Dataset and its stored artifacts before deleting old records. A failed new save never starts old-record deletion.
- Recheck each target's owner/name/revision under a database lock before deleting. Remove its registered raw/parsed/analysis/Fig/report files, upload staging records, archive metadata and Dataset row; workspace profiles/versions cascade with the Dataset.
- Response: HTTP 201 `{dataset, deletedIds, deleteFailures}`. A partial cleanup leaves the new Dataset saved and returns failed target IDs; UI shows an incomplete-deletion warning rather than claiming complete replacement. Storage and SQL do not have a distributed transaction: some earlier artifacts/targets may already be gone after a cleanup failure. Retain failed Dataset records for inspection/retry.
- Cloud deletion failures are strict for replacement, even in optional-cloud mode. Deletion concerns registered portal objects/local copies, not PC source files, independent Harvester backups, or provider-retained historical object versions. No claim of secure erasure of external backups is made.
- A consumed upload session cannot be replayed through this API; refresh the saved list rather than repeating a timed-out POST automatically.
- HTTP 404/405 for the new endpoint is not retried against the old unguarded API. Update/restart the server and reselect the upload. This source change does not itself authorize stopping the existing local server.

## Verification

`tests/test_dataset_imports.py` uses an isolated SQLite/local-artifact directory for confirmation, ownership, revision changes, exact same-file replacement, multi-target cleanup, save failure and strict cloud-failure checks. `tests/test_import_confirmation_ui.py` executes the actual JavaScript helper. `tests/browser_import_confirmation.py` is a disposable loopback-only UI harness with a fake API and no experiment-data writes, for testing the real HTML dialog's cancel/confirm behavior.
