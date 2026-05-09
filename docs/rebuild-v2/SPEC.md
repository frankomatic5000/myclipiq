# MyClipIQ v2 — Product Specification (Operational MVP Pivot)

> **Last updated**: 2026-05-09
> **Status**: Sprint 1 scope — operational backbone, not AI clip analysis
> **Branch**: `prototype/v2-ui` → merge to `main` after Sprint 1

---

## Product Vision

MyClipIQ is the operational backbone for Imigrou / GrowBiz — a business-operations platform that runs Karine's content agency end-to-end:
- **Prospects** → leads captured, tracked, converted
- **Clients** → active contracts, services, projects
- **Projects** → content production by service type (podcast, curso, evento, etc.)
- **Publishing** → calendar, posts, clip inventory
- **Upsell** → triggers based on last-post gaps

AI clip analysis (FFmpeg → Whisper → GPT viral scoring) moves to **Phase 2** after the operational MVP is usable daily.

---

## Target Users

| Role | Who | Actions |
|------|-----|---------|
| **Karine (Admin)** | Creator/CEO | CRM, sales pipeline, project oversight, publishing calendar, upsell decisions |
| **Mônica / Sales** | Brasil (remote) | Prospecting, lead follow-up, call notes, deal closing |
| **Editor** | Brasil (remote) | Download/upload clips, basic project workflow |
| **Client** | Various | Review watermarked previews, approve/reject |

---

## Core Use Cases (Operational MVP)

### 1. Vendas Ativas (Sales Pipeline)
- **Prospect lifecycle**: Lead → First Contact → Follow-up → Call → Proposal → Negotiation → Closed Won/Lost
- **Kanban + Table** views with search/filter
- **Prospect detail drawer**: timeline, calls, checklist, alerts, products interested
- **Operational checklists** per service type (gravação, social, evento)
- **Lead source tracking** (Instagram DM, referral, event, cold outreach)
- **Revenue forecast** (weighted pipeline value)

### 2. Prospects vs Clients
- **Prospects table**: leads not yet converted, with full sales lifecycle
- **Clients table**: active customers with contracts, services, projects
- **Conversion flow**: Prospect status = "Closed Won" → auto-create Client + Project
- **Separate schemas** — prospects have sales fields; clients have operational fields

### 3. Client/Project Management
- **Clients** expanded fields: contract status, image authorization, package type, monthly posts, service mix
- **Projects by service type**: podcast, curso, mentoria, gestão redes sociais, glowup, evento, etc.
- **Project checklist** per service type (operational delivery tasks)
- **Status**: intake → editing → review → approved → posted → archived

### 4. Contract & Image Authorization Tracking
- **Contract status**: pending → sent → signed → expired
- **Image authorization**: signed/not signed, date, expiration
- **Alert when expiring** (30-day reminder)
- **Block new projects if authorization missing**

### 5. Publishing Calendar & Clip Inventory
- **Calendar view**: scheduled posts by date, platform, client
- **Clip inventory**: all clips per client, status (draft → scheduled → posted → archived)
- **Post details**: caption, hashtags, platform, scheduled time, actual post time
- **Clip-project linkage**: which project generated which clips

### 6. Last-Post Upsell Trigger
- **Flag clients** with no posts in last X days (configurable, default 30)
- **Dashboard alert**: "Client X — last post 45 days ago"
- **One-click upsell action**: create new proposal from template
- **Pipeline integration**: upsell opportunity appears in Vendas Ativas

### 7. Spreadsheet Import Foundation
- **Import prospects** from Imigrou/Mônica Google Sheets/Excel
- **Import clients** from existing customer list
- **Map columns** to schema fields on first import
- **Deduplicate** by email/Instagram/phone
- **Audit log**: who imported, when, how many rows, errors

---

## Sprint 1 Scope (Operational MVP)

### Must Have (P0)
- [ ] `prospects` table + Supabase backend for Vendas Ativas (replace mock data)
- [ ] Prospect lifecycle: 12 statuses, kanban, table, detail drawer
- [ ] Separate `clients` table (evolution of `customers`) with expanded fields
- [ ] Prospect → Client conversion workflow
- [ ] Contract tracking + image authorization fields on clients
- [ ] Projects by service type with operational checklists
- [ ] Publishing calendar + `posts` table (basic)
- [ ] Last-post flag + upsell trigger (basic dashboard alert)
- [ ] Spreadsheet import foundation (CSV/Excel upload, column mapping)
- [ ] i18n: PT (primary), EN, ES
- [ ] Supabase auth with roles (admin, editor, viewer)

### Should Have (P1)
- [ ] Lead source tracking on prospects
- [ ] Revenue forecast (weighted pipeline)
- [ ] Mobile-optimized table view (default on <768px)
- [ ] Auto-log status changes to timeline
- [ ] Follow-up suggestions after call/save
- [ ] Contract expiration alerts (30-day)
- [ ] Basic publishing calendar UI (month/week view)

### Moved to Phase 2 (AI Layer)
- [ ] Google Drive webhook integration (video intake)
- [ ] Cloudflare R2 storage (temporary, 30-day lifecycle)
- [ ] AI video analysis: FFmpeg → Whisper → GPT-4o-mini → hooks, captions, hashtags, viral score
- [ ] Watermarked preview generation
- [ ] Background job processing (Supabase pg_cron + durable jobs)
- [ ] TikTok API upload (inbox)
- [ ] Archive to Google Drive after 30 days
- [ ] Advanced analytics dashboard

---

## Non-Goals

- Not a generic video editor (no timeline, no effects)
- Not a social media scheduler with auto-posting
- Not a replacement for Adobe/Final Cut
- Not multi-tenant SaaS (single team per instance)
- AI viral scoring / clip analysis is Phase 2, not Sprint 1

---

## Data Model Summary

```
prospects ──► clients ──► projects ──► posts
   │            │            │
   │            │            └── clips (future)
   │            └── contracts
   │            └── image_authorizations
   └── timeline_events
   └── call_records
   └── alerts
```

See `DATABASE.md` for full schema.
