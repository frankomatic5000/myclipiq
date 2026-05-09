# MyClipIQ v2 — GitHub Issues (Operational MVP Pivot)

> **Last updated**: 2026-05-09
> **Sprint 1**: Issues #61–#62, #96–#102
> **Phase 2 (Frozen)**: Issues #63–#65

---

## Sprint 1 Issues

### Issue #61: Foundation Setup + i18n
**URL**: https://github.com/frankomatic5000/myclipiq/issues/61
**Title**: [SPRINT 1] Operational MVP Foundation: Next.js + i18n + Auth + Supabase
**Priority**: P0
**Risk**: LOW
**Review Gates**: Radar UI/UX review required
**Status**: Ready for RodZilla

**Scope Update (2026-05-09)**:
- Repurposed from AI-clip-centric to operational-backbone foundation
- Sprint 1 focuses on business operations, not AI video analysis
- R2 setup deferred to Phase 2

**Deliverables**:
- Supabase client connection verified for new tables
- Auth roles working: admin, editor, viewer, sales
- CI/CD passing with new operational routes
- Vendas Ativas page loads from Supabase (not mock data)

---

### Issue #62: Database Schema v2 + RLS (HIGH RISK)
**URL**: https://github.com/frankomatic5000/myclipiq/issues/62
**Title**: [SPRINT 1] Database Schema v2: Prospects + Clients + Projects + Posts (HIGH RISK)
**Priority**: P0
**Risk**: **HIGH** — Rod approval required before implementation
**Review Gates**: Rod approval gate mandatory
**Status**: **READY FOR ROD APPROVAL** (all fixes applied)

**Scope Update (2026-05-09)**:
- Repurposed from AI-pipeline schema to operational-backbone schema
- Sprint 1 tables: prospects, clients, projects, posts, import_logs
- Phase 2 tables: ai_analyses, video_uploads, edited_videos (frozen)

**Fixes Applied**:
1. ✅ **Migration order**: clients table created BEFORE prospects (FK dependency)
2. ✅ **lead_source**: added `upsell_trigger` to enum
3. ✅ **Alerts**: `prospect_alerts` (sales) and `client_alerts` (operational) are separate tables
4. ✅ **Contracts/image auth**: client fields in Sprint 1 (not separate tables)
5. ✅ **FK deferred**: `prospects.converted_to_client_id` → `clients.id` added in migration 017 after both tables exist

**Migration Order (Fixed)**:
```
008_clients_table.sql          -- MUST be first
009_prospects_table.sql        -- FK to clients added later
010_prospect_events_calls.sql
011_client_alerts.sql
012_projects_service_checklist.sql  -- ALTER existing
013_posts_table.sql
014_import_logs.sql
015_operational_rls.sql
016_operational_indexes.sql
017_prospect_client_fk.sql     -- ADD FK after both tables exist
```

**Acceptance Criteria**:
- All migrations are additive
- Every table has RLS enabled
- Admin override policy on every table
- Seed data for testing
- Local verification steps documented
- No destructive operations

---

### Issue #96: Vendas Ativas Backend — Replace Mock Data
**URL**: https://github.com/frankomatic5000/myclipiq/issues/96
**Title**: [SPRINT 1] Vendas Ativas Backend: Replace mock data with Supabase
**Priority**: P0
**Risk**: MEDIUM
**Depends On**: #62 (Database Schema)
**Status**: Ready

**Scope**:
- Connect existing Kanban/Table/Drawer to Supabase
- API routes: prospects CRUD, timeline, calls, alerts
- New Prospect button + modal
- Status change auto-logs to timeline
- Search/filter/sort on real data
- Mobile table view default

---

### Issue #97: Vendas Ativas UI — New Prospect + Real-Time
**URL**: https://github.com/frankomatic5000/myclipiq/issues/97
**Title**: [SPRINT 1] Vendas Ativas: Kanban + Table + Drawer — backend + New Prospect button
**Priority**: P0
**Risk**: MEDIUM
**Depends On**: #96 (Vendas Ativas Backend)
**Status**: Ready

**Scope**:
- New Prospect modal (was missing in prototype)
- Status change auto-logs to timeline
- Add Call form saves to database
- Revenue estimate field
- Lead source dropdown
- Real-time subscriptions for status changes
- Loading/empty/error states

---

### Issue #98: Prospects vs Clients — Conversion Workflow
**URL**: https://github.com/frankomatic5000/myclipiq/issues/98
**Title**: [SPRINT 1] Prospects vs Clients: Separate tables + conversion workflow
**Priority**: P0
**Risk**: MEDIUM
**Depends On**: #62 (Database Schema), #96 (Vendas Ativas Backend)
**Status**: Ready

**Scope**:
- Create clients table with expanded fields
- Prospect → Client conversion (status = "venda_fechada")
- Client list page (table, filter, search)
- Client detail drawer (contract, image auth, projects, posts)
- Block rule: missing image auth → warn on new project
- Upsell flag logic

---

### Issue #99: Spreadsheet Import
**URL**: https://github.com/frankomatic5000/myclipiq/issues/99
**Title**: [SPRINT 1] Spreadsheet Import: Prospects + Clients from Imigrou/Mônica data
**Priority**: P1
**Risk**: LOW
**Depends On**: #62 (Database Schema), #97 (Vendas Ativas), #98 (Prospects vs Clients)
**Status**: Ready

**Scope**:
- Upload CSV/Excel
- Column mapping (auto + manual)
- Validation (duplicates, invalid emails, missing required)
- Import execution with progress
- Audit log (import_logs table)
- Export template for Mônica

---

### Issue #100: Publishing Calendar + Posts Table
**URL**: https://github.com/frankomatic5000/myclipiq/issues/100
**Title**: [SPRINT 1] Publishing Calendar + Posts Table
**Priority**: P1
**Risk**: LOW
**Depends On**: #62 (Database Schema), #98 (Prospects vs Clients)
**Status**: Ready

**Scope**:
- posts table: client_id, project_id, platform, content_type, caption, hashtags, scheduled_at, posted_at, status
- Calendar UI: month/week view, color by platform
- Post creation + editing
- Clip inventory (basic, no video yet)
- Auto-update client.last_post_at when post.status = "posted"

---

### Issue #101: Last-Post Upsell Trigger + Dashboard Alerts
**URL**: https://github.com/frankomatic5000/myclipiq/issues/101
**Title**: [SPRINT 1] Last-Post Upsell Trigger + Dashboard Alerts
**Priority**: P1
**Risk**: LOW
**Depends On**: #98 (Prospects vs Clients), #100 (Publishing Calendar)
**Status**: Ready

**Scope**:
- Configurable threshold (default 30 days)
- Scan clients: last_post_at > threshold → upsell_flag = true
- Dashboard "Clientes Inativos" section
- One-click "Criar Proposta" → creates prospect in Vendas Ativas
- Settings: threshold, platforms, auto-flag vs manual

---

### Issue #102: Master Tracking — Sprint 1 Implementation Plan
**URL**: https://github.com/frankomatic5000/myclipiq/issues/102
**Title**: [SPRINT 1] Master Tracking: Operational MVP — Sprint 1 Implementation Plan
**Priority**: P0
**Risk**: LOW
**Status**: Ready

**Scope**: Roll-up issue for all Sprint 1 issues. Definition of Done:
- All P0 issues merged to main
- Supabase tables populated with real data
- Karine can create prospects, move through pipeline, convert to clients
- Mônica can import spreadsheets
- Publishing calendar shows scheduled posts
- Upsell alerts appear on dashboard
- CI build passes
- Deployed to production

---

## Phase 2 Issues (FROZEN — Do Not Start)

### Issue #63: Video Upload Pipeline
**URL**: https://github.com/frankomatic5000/myclipiq/issues/63
**Title**: [PHASE 2] Video Upload Pipeline: Drive → R2 → Project
**Priority**: P0 → **P1 (deferred)**
**Risk**: MEDIUM
**Phase**: Phase 2
**Status**: ❄️ FROZEN until Sprint 1 complete

**Trigger Conditions**:
- Karine confirms operational MVP is usable daily
- At least 10 real prospects in pipeline
- At least 5 real clients with contracts
- At least 20 real posts in calendar
- Rod approves Phase 2 start

---

### Issue #64: AI Analysis Engine
**URL**: https://github.com/frankomatic5000/myclipiq/issues/64
**Title**: [PHASE 2] AI Analysis Engine: FFmpeg → Whisper → GPT
**Priority**: P1
**Risk**: MEDIUM
**Phase**: Phase 2
**Status**: ❄️ FROZEN until Sprint 1 complete

**Dependencies**: #63 (Upload Pipeline) completed

---

### Issue #65: Team Workflow
**URL**: https://github.com/frankomatic5000/myclipiq/issues/65
**Title**: [PHASE 2] Team Workflow: Editor → Creator → Customer Approval
**Priority**: P1
**Risk**: MEDIUM
**Phase**: Phase 2
**Status**: ❄️ FROZEN until Sprint 1 complete

**Dependencies**: #63 (Upload Pipeline), #64 (AI Analysis) completed

---

## Summary

### Sprint 1 (Active)

| Issue | Scope | Priority | Risk | Owner | Status |
|-------|-------|----------|------|-------|--------|
| #61 | Foundation + i18n | P0 | LOW | RodZilla | Ready |
| #62 | Database + RLS | P0 | **HIGH** | RodZilla | **Ready for Rod approval** |
| #96 | Vendas Ativas Backend | P0 | MEDIUM | RodZilla | Ready |
| #97 | Vendas Ativas UI | P0 | MEDIUM | RodZilla | Ready |
| #98 | Prospects vs Clients | P0 | MEDIUM | RodZilla | Ready |
| #99 | Spreadsheet Import | P1 | LOW | RodZilla | Ready |
| #100 | Publishing Calendar | P1 | LOW | RodZilla | Ready |
| #101 | Upsell Trigger | P1 | LOW | RodZilla | Ready |
| #102 | Master Tracking | P0 | LOW | Frank | Ready |

### Phase 2 (Frozen)

| Issue | Scope | Priority | Phase | Status |
|-------|-------|----------|-------|--------|
| #63 | Video Upload Pipeline | P1 | Phase 2 | ❄️ FROZEN |
| #64 | AI Analysis Engine | P1 | Phase 2 | ❄️ FROZEN |
| #65 | Team Workflow | P1 | Phase 2 | ❄️ FROZEN |

---

## Next Actions

1. **Rod approval on #62** — all 7 fixes applied, ready for review
2. Once #62 approved → RodZilla implements database migrations
3. Once migrations deployed → RodZilla implements #96 (Vendas Ativas Backend)
4. Parallel: RodZilla can start #61 (Foundation) immediately
5. **Phase 2 trigger**: Sprint 1 Definition of Done met + Karine sign-off + Rod approval

---

## Phase 2 Activation Checklist

- [ ] Sprint 1 Definition of Done complete
- [ ] Karine confirms operational MVP is usable daily
- [ ] At least 10 real prospects in pipeline
- [ ] At least 5 real clients with contracts
- [ ] At least 20 real posts in calendar
- [ ] CI build passes for 7 days straight
- [ ] No critical bugs open for 7 days
- [ ] Rod approves Phase 2 start
- [ ] OpenAI API key ready
- [ ] R2 bucket created
- [ ] Twilio account ready
- [ ] Google Cloud OAuth configured
