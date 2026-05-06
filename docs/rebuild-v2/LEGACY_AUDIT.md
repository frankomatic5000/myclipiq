# MyClipIQ — Legacy Audit

## What to Keep

### Architecture Decisions
- Next.js 15 + App Router — modern, server components
- Tailwind CSS — utility-first, fast
- Supabase Auth + RLS — built-in security
- Cloudflare R2 — no egress fees
- Vercel hosting — edge functions, ISR

### Database Tables
- `customers` — CRM core
- `projects` — workflow core
- `edited_videos` — with v2 enhancements
- `video_uploads` — R2 lifecycle
- `profiles` — user management
- `background_jobs` — durable execution
- `ai_analyses` — new analysis table

### Components (Partial)
- `Header.tsx` — navigation
- `Sidebar.tsx` — layout
- `LanguageSwitcher.tsx` — i18n
- `AgentChat.tsx` — AI interaction (adapted)

### API Patterns
- `app/api/health/route.ts` — health check
- `app/api/ai/analyze/route.ts` — AI analysis
- R2 presigned URL pattern
- Supabase client/server setup

### Configuration
- `next.config.ts` — i18n routing
- `tailwind.config.ts` — theme
- `tsconfig.json` — strict mode
- `jest.config.ts` — testing

## What to Discard

### Failed/Problematic Features
- Flight search (extracted to FlyIQ)
- `ai_analysis` (legacy table) — replaced by `ai_analyses`
- i18n middleware complexity — simplify

### Code Smells
- Over-engineered middleware
- Tight coupling between upload and analysis
- Missing error boundaries
- Incomplete test coverage

### Unused Dependencies
- `next-intl` (if switching to simpler i18n)
- `googleapis` (if using webhook-only approach)

## What is Unknown

### Needs Investigation
1. **Editor workflow** — How does editor actually download/upload? Current flow unclear.
2. **WhatsApp integration** — Is Twilio working? Test required.
3. **TikTok API** — Is upload-inbox actually possible? Verify.
4. **Archive automation** — Is pg_cron configured? Test 30-day flow.
5. **R2 lifecycle** — Are files actually deleted? Audit.
6. **AI accuracy** — How good are GPT suggestions? A/B test needed.
7. **Performance** — How slow is FFmpeg on Vercel? Benchmark.
8. **Cost** — What's monthly OpenAI bill? Track.

### Technical Debt
- No integration tests for end-to-end flow
- No monitoring/alerting
- No backup strategy for R2
- No CDN for video delivery
- No rate limiting on AI endpoints
- No input validation on upload sizes

## Migration Strategy

### Data Migration
1. Backup legacy database
2. Run v2 migrations
3. Migrate `ai_analysis` → `ai_analyses`
4. Verify counts
5. Deploy v2 app
6. Monitor for 48h

### Code Migration
1. Copy `customers`, `projects`, `edited_videos` logic
2. Rewrite upload/analysis pipeline
3. Add team workflow
4. Add review/approval
5. Add notifications
6. Add archive

### Testing Strategy
1. Unit tests for utilities
2. Integration tests for API routes
3. E2E tests for critical flows
4. Load tests for upload
5. Security audit for RLS
