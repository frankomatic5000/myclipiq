# Testing Guide

## Test Admin User

A test admin account is available for local development, QA, and demo use.

### Default Credentials

| Field | Value |
|-------|-------|
| Email | `admin@myclipiq.test` |
| Password | `TestAdmin123!` |

### Create or Reset Test Admin

```bash
# Use default credentials
npx ts-node scripts/seed-test-admin.ts

# Override via environment variables
TEST_ADMIN_EMAIL=demo@myclipiq.test \
TEST_ADMIN_PASSWORD=MyDemoPass456! \
TEST_ADMIN_FULL_NAME="Demo Admin" \
npx ts-node scripts/seed-test-admin.ts
```

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The script is **idempotent** — running it again will update the existing user's profile to `role = admin` and re-print the credentials.

### What the script does

1. Checks if the email already exists in Supabase Auth
2. Creates the user (with `email_confirm: true`) if missing
3. Upserts the `profiles` row with `role = admin`
4. Logs credentials to the console

### Access

- Login: `http://localhost:3000/auth/login`
- Admin panel: `http://localhost:3000/admin`

### Notes

- The test admin is **not** for production.
- Service-role key stays server-side only.
- Password can be changed via the admin panel or Supabase dashboard.
