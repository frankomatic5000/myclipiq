# MyClipIQ v2 — Rebuild Plan

## Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js 15 + Tailwind + shadcn/ui
- [ ] Supabase project + auth
- [ ] Database schema (v2 migrations)
- [ ] R2 bucket + presigned URLs
- [ ] i18n foundation (next-intl, EN/PT/ES message files)
- [ ] Language switcher + profile preference
- [ ] Basic project structure
- [ ] CI/CD (Vercel)

### Phase 2: Core Upload (Week 3-4)
- [ ] Google Drive webhook
- [ ] Video upload to R2
- [ ] Project creation
- [ ] Basic dashboard
- [ ] Customer CRUD

### Phase 3: AI Pipeline (Week 5-6)
- [ ] FFmpeg audio extraction
- [ ] Whisper transcription
- [ ] GPT-4o-mini analysis
- [ ] Results storage
- [ ] AI results page

### Phase 4: Team Workflow (Week 7-8)
- [ ] Editor download/upload
- [ ] AI suggestion picker
- [ ] Review workflow
- [ ] Approval/rejection
- [ ] Status transitions

### Phase 5: Polish (Week 9-10)
- [ ] WhatsApp notifications
- [ ] Watermarked previews
- [ ] Archive automation
- [ ] i18n completion (translate all UI, validation, notifications)
- [ ] Mobile optimization

### Phase 6: Launch (Week 11-12)
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation
- [ ] Training (Karine + Editor)
- [ ] Go-live

## Suggested GitHub Issues (First 5)

### Issue #1: Foundation Setup
**Scope**: Next.js 15, Tailwind, shadcn/ui, Supabase, R2, next-intl i18n
**Labels**: `system`, `setup`, `i18n`
**Priority**: P0

Includes:
- Install and configure next-intl
- Create `messages/en.json`, `messages/pt.json`, `messages/es.json`
- Wire user profile language preference (`profiles.language` column)
- Add LanguageSwitcher component
- Translate core layout, navigation, and project statuses
- No locale routes for MVP (language stored in profile/cookie)

### Issue #2: Database Schema v2
**Scope**: Migrations for customers, projects, edited_videos, ai_analyses, team_members, project_reviews, archive_log
**Labels**: `database`, `migration`
**Priority**: P0
**Risk**: HIGH — RLS policies must be correct

### Issue #3: Video Upload Pipeline
**Scope**: Google Drive webhook → R2 → project creation
**Labels**: `feature`, `upload`
**Priority**: P0

### Issue #4: AI Analysis Engine
**Scope**: FFmpeg → Whisper → GPT → storage
**Labels**: `feature`, `ai`
**Priority**: P1

### Issue #5: Team Workflow
**Scope**: Editor upload, AI picker, review queue, approval
**Labels**: `feature`, `workflow`
**Priority**: P1

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| FFmpeg memory issues on Vercel | Medium | High | Use edge functions or background jobs |
| OpenAI API costs | Medium | Medium | Set limits, monitor usage |
| R2 egress costs | Low | Low | Monitor, optimize |
| Editor timezone confusion | Medium | Low | Store timezone in profile |
| WhatsApp delivery failures | Medium | Medium | Fallback to email |
| Google Drive API rate limits | Low | Medium | Exponential backoff |
| i18n translation quality | Medium | Low | Start with EN + PT |

## Dependencies

- Supabase project created
- R2 bucket created
- Google Cloud project + OAuth
- OpenAI API key
- Twilio account + WhatsApp sandbox
- Vercel project + domains

## Success Metrics

| Metric | Target |
|--------|--------|
| Video upload → project creation | < 30s |
| AI analysis completion | < 2 min |
| Editor → Karine review | < 24h |
| Karine → Customer approval | < 48h |
| Archive automation | 100% |
| Mobile usage | > 50% |
