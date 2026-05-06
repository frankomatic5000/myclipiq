# MyClipIQ v2 — Environment Variables

## Required for Local Development

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Cloudflare R2
```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=myclipiq-videos
R2_PUBLIC_URL=https://videos.myclipiq.com
```

### Google Drive
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### OpenAI
```bash
OPENAI_API_KEY=sk-your_key
```

### Twilio (WhatsApp)
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### Application
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=your_webhook_secret
```

## Vercel Production Variables

All of the above, plus:
```bash
NEXT_PUBLIC_APP_URL=https://myclipiq.vercel.app
GOOGLE_REDIRECT_URI=https://myclipiq.vercel.app/api/auth/google/callback
```

## Optional Variables

```bash
# Analytics (future)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Error tracking (future)
SENTRY_DSN=

# Rate limiting (future)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Security Notes

- NEVER commit `.env.local` to git
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` client-side
- Rotate `WEBHOOK_SECRET` quarterly
- Rotate `OPENAI_API_KEY` on team changes
- Use Vercel Environment Variables UI for production
