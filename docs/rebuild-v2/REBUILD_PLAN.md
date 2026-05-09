# MyClipIQ v2 — Rebuild Plan (Operational MVP Pivot)

> **Last updated**: 2026-05-09
> **Sprint 1**: Operational CRM + Publishing (Karine's daily workflow)
> **Phase 2**: AI Clip Analysis + Video Pipeline (after operational MVP is usable)

---

## Phase 1: Operational MVP (Sprint 1 — Week 1-4)

### Week 1-2: Database + Foundation
- [ ] Create `clients` table (before `prospects` — FK dependency)
- [ ] Create `prospects` table with `converted_to_client_id` (FK added in separate migration)
- [ ] Create `prospect_timeline_events`, `prospect_call_records`, `prospect_alerts`
- [ ] Create `client_alerts` (contract, image auth, upsell — separate from prospect_alerts)
- [ ] ALTER `projects`: add `service_type`, `checklist`, `status_history`
- [ ] Create `posts` table (publishing calendar)
- [ ] Create `import_logs` table (spreadsheet audit)
- [ ] Indexes + RLS policies for all new tables
- [ ] Seed with realistic data

### Week 2-3: Vendas Ativas Backend
- [ ] Replace mock data with Supabase queries (Issue #97)
- [ ] API routes: GET/POST/PATCH prospects
- [ ] API routes: timeline, calls, alerts
- [ ] New Prospect button + modal
- [ ] Status change auto-logs to timeline
- [ ] Search, filter, sort on real data
- [ ] Mobile table view (default on <768px)

### Week 3-4: Clients + Conversion
- [ ] Client list page (table, filter, search) (Issue #98)
- [ ] Client detail drawer (contract, image auth, projects, posts)
- [ ] Prospect → Client conversion workflow
- [ ] Contract upload + status tracking
- [ ] Image authorization upload + status tracking
- [ ] Block rule: missing image auth → warn on new project
- [ ] Upsell flag logic (last_post_at > threshold)

### Week 4: Publishing + Import + Polish
- [ ] Publishing calendar UI (month/week view) (Issue #100)
- [ ] Post creation + editing
- [ ] Clip inventory (basic, no video yet)
- [ ] Spreadsheet import (CSV/Excel, column mapping, validation) (Issue #99)
- [ ] Dashboard alerts (inactive clients, contract expiry)
- [ ] Upsell trigger + "Criar Proposta" action (Issue #101)
- [ ] Mobile optimization
- [ ] i18n completion for operational flows
- [ ] Deploy to production

---

## Phase 2: AI + Video Pipeline (Week 5-10) — FROZEN until Sprint 1 complete

> **Trigger conditions**:
> - Karine confirms operational MVP is usable daily
> - At least 10 real prospects in pipeline
> - At least 5 real clients with contracts
> - At least 20 real posts in calendar
> - Rod approves Phase 2 start

### Phase 2.1: Video Upload (Week 5-6)
- [ ] Google Drive webhook
- [ ] Cloudflare R2 bucket + presigned URLs
- [ ] Video upload pipeline: Drive → R2 → Project
- [ ] Editor download/upload UI
- [ ] WhatsApp notification to editor

### Phase 2.2: AI Analysis (Week 7-8)
- [ ] FFmpeg audio extraction
- [ ] OpenAI Whisper transcription
- [ ] GPT-4o-mini structured analysis:
  - Hook suggestions (3-5 variants)
  - Caption optimization
  - Hashtag recommendations
  - Viral score prediction
- [ ] AI results page
- [ ] Editor picker interface

### Phase 2.3: Team Workflow (Week 9-10)
- [ ] Watermarked preview generation
- [ ] Review workflow: Karine → Customer approval
- [ ] Status transitions + notifications
- [ ] Archive automation (30 days → Google Drive)
- [ ] Background job processing (pg_cron)

---

## Phase 3: Scale + SaaS (Week 11-12)

- [ ] Multi-tenancy (team/workspace isolation)
- [ ] Lead source + pipeline analytics
- [ ] Email/WhatsApp auto-logging
- [ ] Proposal/quote builder
- [ ] White-labeling
- [ ] API/webhooks (Zapier, Make)

---

## GitHub Issues (Sprint 1)

| Issue | Scope | Priority | Risk | Phase |
|-------|-------|----------|------|-------|
| #61 | Foundation: Next.js + i18n + Auth + Supabase | P0 | LOW | Sprint 1 |
| #62 | Database Schema: Prospects + Clients + Projects + Posts | P0 | **HIGH** | Sprint 1 |
| #97 | Vendas Ativas Backend: Replace mock data | P0 | MEDIUM | Sprint 1 |
| #98 | Prospects vs Clients: Conversion workflow | P0 | MEDIUM | Sprint 1 |
| #99 | Spreadsheet Import: Prospects + Clients | P1 | LOW | Sprint 1 |
| #100 | Publishing Calendar + Posts Table | P1 | LOW | Sprint 1 |
| #101 | Last-Post Upsell Trigger + Dashboard Alerts | P1 | LOW | Sprint 1 |
| #102 | Master Tracking: Sprint 1 Implementation | P0 | LOW | Sprint 1 |

## GitHub Issues (Phase 2 — FROZEN)

| Issue | Scope | Priority | Phase |
|-------|-------|----------|-------|
| #63 | Video Upload Pipeline: Drive → R2 → Project | P0 → P1 | Phase 2 |
| #64 | AI Analysis Engine: FFmpeg → Whisper → GPT | P1 | Phase 2 |
| #65 | Team Workflow: Editor → Creator → Customer | P1 | Phase 2 |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Migration order bug (clients → prospects FK) | Low | High | Fixed: clients table created first |
| Customers → clients data migration | Medium | High | Additive only, nullable new fields |
| RLS policy gaps | Low | High | Test every table, every role |
| Import data quality | Medium | Medium | Validation + audit log |
| Mobile Kanban unusable | Medium | Medium | Default to table view |
| Editor timezone confusion | Low | Low | Store timezone in profile |
| i18n translation gaps | Medium | Low | PT first, EN/ES secondary |
| Phase 2 scope creep | Medium | High | Strict freeze, Rod approval required |

---

## Dependencies

- Supabase project ✅
- Vercel project + domains ✅
- **Sprint 1 only**: None (no R2, no AI, no Twilio needed)
- **Phase 2**: R2 bucket, Google Cloud OAuth, OpenAI API, Twilio

---

## Success Metrics

### Sprint 1 (Operational MVP)
| Metric | Target |
|--------|--------|
| Prospect creation → pipeline | < 30s |
| Client conversion | < 1 min |
| Spreadsheet import (100 rows) | < 5s |
| Dashboard load (50 prospects) | < 1s |
| Mobile usage | > 50% |
| Karine daily active | > 5 days/week |
| Mônica prospects added/week | > 10 |
| Contract/image auth tracked | 100% of clients |

### Phase 2 (AI + Video)
| Metric | Target |
|--------|--------|
| Video upload → project creation | < 30s |
| AI analysis completion | < 2 min |
| Editor → Karine review | < 24h |
| Karine → Customer approval | < 48h |
| Archive automation | 100% |
