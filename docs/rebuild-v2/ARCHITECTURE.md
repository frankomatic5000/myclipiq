# MyClipIQ v2 — Architecture

> **Last updated**: 2026-05-09
> **Sprint 1**: Operational Backbone (CRM + Sales + Publishing)
> **Phase 2**: AI Clip Analysis + Video Pipeline

---

## Sprint 1 Architecture (Operational MVP)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KARINE / MÔNICA                            │
│                    (Admin / Sales / Operations)                     │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MyClipIQ (Next.js 15)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Vendas Ativas│  │   Clientes   │  │   Calendário            │  │
│  │  (Kanban)    │  │  (Contracts) │  │   (Posts)               │  │
│  │  (Table)     │  │  (Image Auth)│  │   (Clip Inventory)      │  │
│  │  (Drawer)    │  │  (Upsell)    │  │   (Upsell Alerts)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Projetos   │  │   Importar   │  │   Dashboard             │  │
│  │ (Checklists) │  │ (Sheets/CSV) │  │   (Stats + Alerts)      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Supabase (PostgreSQL)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ prospects│ │ clients  │ │ projects │ │  posts   ││import_ │  │
│  │ timeline │ │ contracts│ │checklists│ │  clips   ││ logs   │  │
│  │  calls   │ │image_auth│ │          │ │          ││        │  │
│  │  alerts  │ │ alerts   │ │          │ │          ││        │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                            │
│  │ profiles │ │team_membs│ │notifications                          │
│  └──────────┘ └──────────┘ └──────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Vercel Edge                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  API Routes: /api/prospects, /api/clients, /api/posts, etc.   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 2 Architecture (AI + Video Pipeline)

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

---

## Tech Stack (v2)

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 15 + Tailwind CSS + shadcn/ui | App Router, server components |
| **Backend** | Next.js API Routes + Edge Functions | Serverless, no dedicated backend |
| **Database** | Supabase (PostgreSQL) | Auth + data + jobs |
| **Storage** | Cloudflare R2 (temp) + Google Drive (archive) | **Phase 2 only** |
| **AI** | OpenAI Whisper + GPT-4o-mini | **Phase 2 only** — Audio → text → analysis |
| **Auth** | Supabase Auth | Row Level Security (RLS) |
| **Hosting** | Vercel | Edge functions, ISR |
| **Notifications** | Twilio (WhatsApp) | **Phase 2** — Editor ↔ Creator |
| **i18n** | next-intl | EN, PT, ES |
| **Testing** | Jest + React Testing Library | Unit + integration |

---

## Sprint 1 Data Flow

### 1. Prospect Pipeline
```
Vendas Ativas → Kanban/Table
    │
    ├── New Prospect → prospects table
    ├── Status Change → prospect_timeline_events (auto-log)
    ├── Add Call → prospect_call_records
    ├── Set Alert → prospect_alerts
    └── Convert to Client → clients table + projects table
```

### 2. Client Management
```
Clientes → Table/Drawer
    │
    ├── Contract tracking: status, sent_at, signed_at, expires_at
    ├── Image authorization: status, signed_at, expires_at
    ├── Block rule: image_auth_status ≠ 'signed' → warn on new project
    ├── Active projects list
    ├── Posts history
    └── Upsell flag: last_post_at > threshold days
```

### 3. Project + Checklist
```
Projetos → Service Type → Auto-load Checklist
    │
    ├── Podcast / Entrevista → [ ] Confirm date, [ ] Prepare questions, ...
    ├── Gravação de Curso → [ ] Briefing, [ ] Gravar aula 1, ...
    ├── Gestão Redes Sociais → [ ] Plano mensal, [ ] Criar posts, ...
    └── Status: intake → editing → review → approved → posted → archived
```

### 4. Publishing Calendar
```
Calendário → Month/Week View
    │
    ├── Click Date → New Post → posts table
    ├── Platform: Instagram / TikTok / YouTube / LinkedIn
    ├── Status: draft → scheduled → posted → archived
    └── Auto-update: client.last_post_at when post.status = 'posted'
```

### 5. Upsell Trigger
```
Daily check (or manual)
    │
    ├── Scan clients: last_post_at > threshold (default 30 days)
    ├── Set: client.upsell_flag = true
    ├── Set: client.upsell_flag_reason = "Last post 45 days ago"
    ├── Create: client_alerts (type = 'upsell_opportunity')
    └── Dashboard: "Clientes Inativos" section
```

### 6. Spreadsheet Import
```
Importar → Upload CSV/Excel
    │
    ├── Preview first 5 rows
    ├── Column mapping (auto + manual)
    ├── Validation (duplicates, invalid emails, missing required)
    ├── Execute import → prospects or clients table
    └── Audit log: import_logs table
```

---

## Phase 2 Data Flow (Frozen for Sprint 1)

### Video Intake [Phase 2]
```
Google Drive → Webhook → MyClipIQ → R2 → Project
```

### AI Analysis [Phase 2]
```
Video Upload → FFmpeg → Whisper → GPT-4o-mini → Hooks/Captions/Hashtags/Viral Score
```

### Customer Approval [Phase 2]
```
WhatsApp → Watermarked Preview → Approve/Reject
```

### Archive [Phase 2]
```
30 days → Google Drive → Delete from R2
```

---

## Key Decisions

### Why Next.js API Routes (not separate backend)?
- Team is small (2 people)
- Less infra to manage
- Vercel handles scaling
- Edge functions for webhooks (Phase 2)

### Why Supabase (not PlanetScale/Neon)?
- Built-in auth
- Real-time subscriptions
- Row Level Security
- Good free tier
- pg_cron for background jobs

### Why Field-Based Contracts (not separate tables)?
- Sprint 1 simplicity
- Karine needs to see contract status at a glance
- No complex contract versioning needed yet
- Phase 2: split to separate tables if versioning required

### Why Separate prospect_alerts and client_alerts?
- Different lifecycles: sales vs operational
- Different owners: Mônica (sales) vs Karine (operations)
- Different UIs: pipeline drawer vs client dashboard

---

## Background Job Strategy

| Job Type | Trigger | Handler | Retry | Phase |
|----------|---------|---------|-------|-------|
| **Upsell check** | Daily cron | API route | 2x | Sprint 1 |
| **Contract expiry alert** | Daily cron | API route | 2x | Sprint 1 |
| **Image auth expiry alert** | Daily cron | API route | 2x | Sprint 1 |
| Video download | Webhook | Edge function | 3x | Phase 2 |
| AI analysis | Upload complete | API route + pg_cron | 3x | Phase 2 |
| WhatsApp notification | Status change | Twilio API | 2x | Phase 2 |
| Archive | 30-day cron | pg_cron + API | 3x | Phase 2 |
| Google Drive sync | Manual or cron | API route | 3x | Phase 2 |

### Durable Jobs Pattern (from legacy)
- Uses Supabase `background_jobs` table
- State machine: pending → processing → completed/failed
- Exponential backoff
- Idempotent execution

---

## Security Model

- **Auth**: Supabase Auth with email/password + OAuth (Google)
- **RLS**: Every table has row-level policies
- **Roles**: viewer → editor → admin → sales
- **API keys**: Never exposed client-side
- **R2**: Presigned URLs, 15-min expiry (Phase 2)
- **Webhooks**: Signed with secret (Phase 2)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page load | < 2s |
| API response | < 200ms |
| First contentful paint | < 1.5s |
| Kanban render (50 prospects) | < 1s |
| Import (100 rows) | < 5s |
| Video upload | < 30s for 100MB | (Phase 2)
| AI analysis | < 2 min | (Phase 2)
