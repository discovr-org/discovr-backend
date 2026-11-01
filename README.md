# discovr-backend

**One app, many folders.** Run a single process on port `8080`.

```
discovr-backend/api/
  src/
    http/          # public routes (/v1/...) — thin
    catalog/       # listings domain (use-cases + adapters)
  supabase/        # discovr-catalog migrations
```

Rules: `.cursor/skills/discovr-backend/SKILL.md`

## Local (memory seed)

```bash
cd /Users/hritik2002/projects/discovr/discovr-backend/api
npm install
npm run dev
```

Smoke:

```bash
curl -s http://127.0.0.1:8080/health
curl -s http://127.0.0.1:8080/v1/catalog/feed | head
curl -s http://127.0.0.1:8080/v1/catalog/experiences/night-kayak-mangroves | head
```

## Frontend

```bash
# discovr-frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
```

## Supabase (sundowners seed)

Tables are empty until SQL is applied once.

1. In the Supabase SQL editor, run `api/supabase/bootstrap_catalog_and_sundowners.sql` (schema + Paloma / Bastian Riviera / Pisco / Slow Tide).
2. Or if schema already exists: `cd api && npm run seed:sundowners`
3. Set:

```bash
CATALOG_DATA_SOURCE=supabase
SUPABASE_URL=…
SUPABASE_SECRET_KEY=…
SUPABASE_PUBLISHABLE_KEY=…
SUPABASE_JWKS_URL=…
```

## Cloudflare Images (admin uploads)

In `discovr-backend/.env`:

```bash
CLOUDFLARE_TOKEN=…          # Images API token (not Global API Key)
# CLOUDFLARE_ACCOUNT_ID=…   # optional
```

Create the token in Cloudflare: **My Profile → API Tokens → Create Token** with **Account → Cloudflare Images → Edit**. Restart the API after changing `.env`.

## Phone OTP login (Twilio)

1. Run SQL: `api/supabase/migrations/007_auth_users_sessions.sql` in Supabase.
2. Set in `discovr-backend/.env`:

```bash
TWILIO_ACCOUNT_SID=AC…
TWILIO_AUTH_TOKEN=…
TWILIO_FROM_NUMBER=DSCOVR          # India alphanumeric sender ID
```

3. Routes:

```bash
curl -s -X POST http://127.0.0.1:8080/v1/auth/otp/request \
  -H 'content-type: application/json' \
  -d '{"phone":"9876543210"}'

curl -s -X POST http://127.0.0.1:8080/v1/auth/otp/verify \
  -H 'content-type: application/json' \
  -d '{"phone":"9876543210","code":"123456"}'

curl -s http://127.0.0.1:8080/v1/auth/me \
  -H "authorization: Bearer SESSION_ID"
```

Local memory mode already includes the four listings (`CATALOG_DATA_SOURCE=memory`).

## When to split processes

Keep one port until a domain needs its own deploy/scale (booking vs catalog, separate teams, etc.). Folder boundaries already allow that cut.
