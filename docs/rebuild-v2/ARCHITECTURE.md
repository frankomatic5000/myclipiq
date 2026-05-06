# MyClipIQ v2 — Architecture

## Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   KARINE    │────▶│ GOOGLE DRIVE│────▶│  MyClipIQ   │
│  (Creator)  │     │  (Raw Video)│     │   (Intake)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ CLOUDFLARE  │
                                        │    R2       │
                                        │ (Temp Store)│
                                        └──────┬──────┘
                                               │
                ┌───────────────────────────────┼───────────────────────────────┐
                │                               │                               │
                ▼                               ▼                               ▼
         ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
         │   EDITOR    │              │   AI PIPE   │              │    CRM      │
         │  (Brazil)   │◀────────────▶│  (Analysis) │◀────────────▶│  (Records)  │
         └──────┬──────┘              └─────────────┘              └─────────────┘
                │
                ▼
         ┌─────────────┐
         │   KARINE    │
         │  (Approval) │
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │  CUSTOMER   │
         │  (Approval) │
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │   POSTING   │
         │ (TikTok/IG) │
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │   ARCHIVE   │
         │(Google Drive)│
         └─────────────┘
```

## Tech Stack (v2)

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 15 + Tailwind CSS + shadcn/ui | App Router, server components |
| **Backend** | Next.js API Routes + Edge Functions | Serverless, no dedicated backend |
| **Database** | Supabase (PostgreSQL) | Auth + data + jobs |
| **Storage** | Cloudflare R2 (temp) + Google Drive (archive) | R2: 30-day lifecycle |
| **AI** | OpenAI Whisper + GPT-4o-mini | Audio → text → analysis |
| **Auth** | Supabase Auth | Row Level Security (RLS) |
| **Hosting** | Vercel | Edge functions, ISR |
| **Notifications** | Twilio (WhatsApp) | Editor ↔ Creator |
| **i18n** | next-intl | EN, PT, ES |
| **Testing** | Jest + React Testing Library | Unit + integration |

## Data Flow

### 1. Intake
1. Karine uploads to Google Drive
2. Google Drive webhook → MyClipIQ
3. Download → Upload to R2 (temporary)
4. Create project record in Supabase
5. Notify editor via WhatsApp

### 2. Editing
1. Editor downloads from R2
2. Edits in local tool (Adobe, CapCut, etc.)
3. Uploads back to R2
4. Creates edited_video record
5. Triggers AI analysis

### 3. Analysis
1. FFmpeg extracts audio from edited video
2. OpenAI Whisper transcribes
3. GPT-4o-mini analyzes:
   - Hook suggestions (3-5 variants)
   - Caption optimization
   - Hashtag recommendations
   - Viral score prediction
   - Optimal posting time
4. Store results in ai_analyses
5. Notify Karine

### 4. Review
1. Editor picks AI suggestions
2. Karine reviews in app
3. Customer reviews watermarked preview
4. Approve / Reject with notes

### 5. Posting
1. TikTok API upload (inbox)
2. Editor publishes from TikTok app
3. Mark as posted in Supabase

### 6. Archive
1. 30 days after posting
2. Move from R2 to Google Drive
3. Delete from R2
4. Mark as archived

## Key Decisions

### Why Next.js API Routes (not separate backend)?
- Team is small (2 people)
- Less infra to manage
- Vercel handles scaling
- Edge functions for webhooks

### Why R2 (not S3)?
- No egress fees
- S3-compatible API
- Good for temporary storage
- Cheaper than S3 for this use case

### Why Supabase (not PlanetScale/Neon)?
- Built-in auth
- Real-time subscriptions
- Row Level Security
- Good free tier
- pg_cron for background jobs

### Why GPT-4o-mini (not Claude/Gemini)?
- Fast enough for this use case
- Cost-effective
- Good at structured output
- Whisper + GPT same provider

## Background Job Strategy

| Job Type | Trigger | Handler | Retry |
|----------|---------|---------|-------|
| Video download | Webhook | Edge function | 3x |
| AI analysis | Upload complete | API route + pg_cron | 3x |
| WhatsApp notification | Status change | Twilio API | 2x |
| Archive | 30-day cron | pg_cron + API | 3x |
| Google Drive sync | Manual or cron | API route | 3x |

### Durable Jobs Pattern (from legacy)
- Uses Supabase `background_jobs` table
- State machine: pending → processing → completed/failed
- Exponential backoff
- Idempotent execution

## AI Analysis Flow

```
Video Upload
    │
    ▼
FFmpeg extract audio
    │
    ▼
OpenAI Whisper transcribe
    │
    ▼
GPT-4o-mini analyze
    ├── Hook suggestions
    ├── Caption optimization
    ├── Hashtag recommendations
    ├── Viral score
    └── Optimal posting time
    │
    ▼
Store in ai_analyses
    │
    ▼
Notify stakeholders
```

## Security Model

- **Auth**: Supabase Auth with email/password + OAuth (Google)
- **RLS**: Every table has row-level policies
- **Roles**: viewer → editor → admin
- **API keys**: Never exposed client-side
- **R2**: Presigned URLs, 15-min expiry
- **Webhooks**: Signed with secret

## Performance Targets

| Metric | Target |
|--------|--------|
| Page load | < 2s |
| Video upload | < 30s for 100MB |
| AI analysis | < 2 min |
| API response | < 200ms |
| First contentful paint | < 1.5s |
