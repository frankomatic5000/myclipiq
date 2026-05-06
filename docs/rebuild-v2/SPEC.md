# MyClipIQ v2 — Product Specification

## Product Vision

MyClipIQ transforms raw video into optimized social media content through AI analysis, team collaboration, and CRM management. Built for creators with distributed teams — think Karine (creator) + editor (Brazil) + customers (approval workflow).

## Target Users

| Role | Location | Actions |
|------|----------|---------|
| **Creator** | USA | Uploads raw video, reviews AI suggestions, approves final cuts |
| **Editor** | Brazil (remote) | Downloads from R2, edits, uploads back, picks AI hooks |
| **Customer** | Various | Reviews watermarked previews, approves/rejects |
| **Admin** | USA | Manages customers, projects, team roles |

## Core Use Cases

1. **Video Intake** — Creator drops video → Google Drive → MyClipIQ → R2 temp storage
2. **AI Analysis** — Extract audio (FFmpeg) → Whisper transcription → GPT-4o-mini analysis → hooks, captions, hashtags, viral score
3. **Team Workflow** — Editor downloads → edits → uploads → picks AI suggestions → sends for review
4. **Approval Loop** — Karine reviews → Customer approves → Ready to post
5. **Publishing** — TikTok/IG upload (inbox) → Editor publishes from app
6. **Archive** — 30 days → Move to Google Drive → Delete from R2

## MVP Scope (v2.0)

### Must Have
- [ ] Google Drive webhook integration (video intake)
- [ ] Cloudflare R2 storage (temporary, 30-day lifecycle)
- [ ] CRM: customers, projects, team management
- [ ] AI video analysis: transcription, hooks, captions, viral score
- [ ] Team workflow: editor + creator + customer roles
- [ ] Watermarked preview generation
- [ ] WhatsApp notifications via Twilio
- [ ] i18n: EN, PT, ES
- [ ] Supabase auth with roles (viewer, editor, admin)

### Should Have
- [ ] TikTok API upload (inbox)
- [ ] Archive to Google Drive after 30 days
- [ ] Background job processing (Supabase pg_cron + durable jobs)

### Out of Scope
- Live streaming
- Analytics dashboard
- Affiliate/revenue tracking
- AI video generation (not editing)

## Non-Goals

- Not a generic video editor (no timeline, no effects)
- Not a social media scheduler (no post queue)
- Not a replacement for Adobe/Final Cut
- Not multi-tenant SaaS (single team per instance)
