# Render Upload Storage Checklist

Use this checklist when a CYC, CV, or EIS file is detected successfully but the Dataset save step fails on Render.

## Required Render Service Variables

Open the Render web service, then choose **Environment**. Keep values secret; do not put them in GitHub or `.env.example`.

| Variable | Required value |
| --- | --- |
| `APP_ENV` | `production` |
| `DATABASE_URL` | The Neon PostgreSQL connection string |
| `JWT_SECRET` | A generated private value |
| `ALLOW_LEGACY_USER_HEADER` | `false` |
| `CORS_ALLOW_ORIGINS` | The public portal origin, for example `https://battery-data-portal.onrender.com` |
| `STORAGE_BACKEND` | `s3` |
| `REQUIRE_DURABLE_STORAGE` | `true` |
| `S3_PROVIDER` | `b2` |
| `S3_BUCKET` | The existing private B2 bucket name |
| `S3_ACCESS_KEY_ID` | B2 `keyID` from a `Read and Write` application key restricted to this bucket |
| `S3_SECRET_ACCESS_KEY` | Matching secret key |
| `S3_REGION` | The exact B2 region shown for the bucket, for example `us-west-004` |
| `S3_ENDPOINT_URL` | The matching endpoint, for example `https://s3.us-west-004.backblazeb2.com` |
| `S3_FORCE_PATH_STYLE` | `true` |
| `S3_PUBLIC_BASE_URL` | Leave blank so the bucket stays private |

`DATA_DIR=/tmp/battery-data` is only temporary staging space. It is not the final storage location. With durable storage enabled, final raw files and parsed artifacts must be copied to the configured object store.

When one or more storage variables are missing, the Render service still starts so the portal and `/api/health` can identify the missing setting. Dataset uploads remain safely refused with HTTP 503 until storage is configured; the portal never treats `/tmp` as final research-file storage.

## After Changing Variables

1. Click **Save Changes** in Render.
2. Use **Manual Deploy -> Clear build cache & deploy** once.
3. After the service is live, open `https://YOUR-SERVICE.onrender.com/api/health`.
4. Confirm `storageProvider` is `b2`, `storageConfigured` is `true`, and `storageMissingVariables` is an empty list.
5. Upload one small CYC file and save it as a Dataset before trying a large batch.

The health response intentionally lists only missing variable names. It never returns storage keys or other credential values.

## What the New Errors Mean

- `Missing Render environment variables: ...`: add exactly those names in Render Environment.
- `Object storage rejected the upload`: check the bucket name, endpoint URL, region, and write permission in Render Logs and the storage provider console.
- `Dataset save failed`: check Render Logs for the matching timestamp. The portal now logs the backend error class without logging secrets.
