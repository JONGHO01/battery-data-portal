# Battery Data Portal v0.15 Architecture

## Purpose

Battery Data Portal keeps raw battery experiment files, normalized analysis data, metadata, figures, and reports connected in one research hierarchy.

```text
Organization (optional)
  Project
    Campaign / experiment batch
      Cell
        Cell metadata
        Protocol segments
        Dataset group
          CYC / EIS / CV datasets
          Figure records
          Report records
```

An empty organization means the project remains private to its owner. An organization project can be shared according to the member role.

## Roles

| Role | Read shared data | Upload / edit / analyze | Manage members |
|---|---:|---:|---:|
| viewer | Yes | No | No |
| researcher | Yes | Yes | No |
| admin | Yes | Yes | Yes |
| owner | Yes | Yes | Yes |
| system administrator | Yes | Yes | Yes |

Users must register before an organization owner or admin adds their user ID as a member.

## BDF Normalized Data

The parser layer accepts `.csv`, `.xlsx`, `.xls`, `.xlsb`, `.wrd`, and `.seo` files. Each file type is routed to a dedicated parser before it is mapped to the portal's canonical Battery Data Format (BDF).

Important normalized fields include:

- `record_index`, `cycle_index`, `step_index`, `test_time_s`, `unix_time_s`
- `voltage_v`, `current_a`, `ambient_temperature_c`
- `charge_capacity_ah`, `discharge_capacity_ah`, `specific_capacity_mah_g`, `coulombic_efficiency_pct`
- `frequency_hz`, `z_real_ohm`, `z_imag_ohm`, `magnitude_ohm`, `phase_deg`
- `quality_flag`, `exclude_reason`, `analysis_include`, `protocol_segment`

Quality review preserves source rows. Rows marked for review or exclusion are not silently deleted; analyses omit `analysis_include=false` by default and can include them intentionally.

## Storage Layout

For a dataset, object keys follow this stable layout:

```text
projects/{project}/cells/{cell}/datasets/{dataset}/
  raw/{original filename}
  parsed/normalized.json
  analysis/{analysis-run}.json
  figure/{figure-record}.json
  report/{report-record}.json
```

- `raw` is the original uploaded file.
- `parsed` contains BDF-normalized data, mapping, parser, and quality provenance.
- `analysis` contains versioned reproducible analysis parameters and results.
- `figure` stores the figure definition and edit settings; future SVG/PNG exports can be attached here without changing the hierarchy.
- `report` stores the saved AI/report content.

Local storage is the default. The same object key structure is used when S3-compatible storage is configured.

## Analysis Modules

Analysis runs do not overwrite the raw or editable table data. Each run records an analysis version, parameters, input quality filtering, and results.

- Retention / SOH
- dQ/dV
- DVA (dV/dQ)
- Rate capability
- Pulse resistance
- EIS summary

If a source file lacks the required columns, a module returns `unavailable` instead of inventing a result.

## Equipment-PC Harvester

`harvester/portal_harvester.py` watches a configured folder, waits for a file to become stable, hashes it to avoid duplicates, and uploads it through `/api/harvester/uploads`.

Important safety rules:

- Set `HARVESTER_ENABLED=true` only for a server that should accept machine uploads.
- Create a one-time API token through the portal API. The portal stores only its hash.
- Put the plaintext token in the equipment PC environment variable `BATTERY_PORTAL_TOKEN`, never in `config.json`, Git, screenshots, or documents.
- Start from `harvester/config.example.json` and keep the real `harvester/config.json` out of Git.

## Production Checklist

The code supports PostgreSQL and S3-compatible object storage, but creating those external services requires the portal owner's cloud accounts.

Before using the portal with multiple computers in production:

1. Create a managed PostgreSQL database and set `DATABASE_URL`.
2. Create an S3/Supabase bucket and set the matching storage environment variables.
3. Set a long random `JWT_SECRET` and production bootstrap-admin credentials only in the server environment.
4. Restrict CORS to the real portal domain.
5. Deploy FastAPI with persistent external database/storage, then connect a custom domain and HTTPS.
6. Create organization projects and add lab members with the appropriate roles.

See `PRODUCTION_RUNBOOK.md` for the deployment-variable checklist.

## Next Improvements

- Save actual SVG/PNG/PDF figure exports in the same `figure/` storage area.
- Add optional Parquet export for large normalized datasets.
- Add email invitations, audit logs, and organization-level storage quotas.
- Add device registration and central Harvester status monitoring.
