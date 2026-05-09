# MyClipIQ v2 — User Experience Flows (Operational MVP)

> **Last updated**: 2026-05-09
> **Scope**: Sprint 1 — operational workflows
> **Phase 2 flows**: marked with [Phase 2]

---

## 1. Vendas Ativas — Sales Pipeline

### Kanban View
```
Dashboard → Vendas Ativas
    │
    ├── Kanban (default desktop)
    │   ├── Cadastro → Contato → Call/Proposta → Negociação → Fechamento
    │   ├── Drag card between columns (or click to change status)
    │   ├── Card shows: name, company, status dot, products, revenue, alerts
    │   └── Click card → Prospect Drawer
    │
    ├── Table View (default mobile <768px)
    │   ├── Sort by: name, status, last contact, revenue
    │   ├── Filter: status, product, assigned to, lead source
    │   ├── Search: name, company, Instagram, phone, email
    │   └── Click row → Prospect Drawer
    │
    └── Top Bar: Pipeline Summary
        ├── Total pipeline value
        ├── Deals due today
        ├── Stalled >7 days
        └── New leads this week
```

### Prospect Detail Drawer
```
Click Prospect Card/Row
    │
    ├── Header: Name, Company, Status badge, Revenue
    ├── Contact: Instagram, Phone, Email (click to call/WhatsApp)
    ├── Products Interested (tags)
    ├── Alerts (due dates, follow-ups)
    ├── Notes (free text, editable)
    ├── Calls (list + "Add Call" button)
    │   └── Add Call: date, duration, outcome, notes
    │       └── Auto-suggest follow-up in 3 days
    ├── Timeline (auto-logged + manual)
    │   └── Status change → auto entry: "Moved to Negociação by Karine"
    └── Checklist (service-specific, editable per prospect)
```

### New Prospect Flow
```
Vendas Ativas → "Novo Lead" Button
    │
    ├── Quick Add (modal)
    │   ├── Name* (required)
    │   ├── Instagram (auto-suggests from handle)
    │   ├── Phone
    │   ├── Email
    │   ├── Company
    │   ├── Products interested (multi-select)
    │   ├── Lead source (dropdown)
    │   ├── Assigned to (dropdown: Karine, Mônica, etc.)
    │   └── Revenue estimate
    │
    └── Save → Appears in "Cadastro" column
        └── Auto timeline entry: "Lead created by Karine"
```

---

## 2. Prospects vs Clients

### Prospect Lifecycle → Conversion
```
Prospect in pipeline
    │
    ├── Status = "Venda Fechada"
    │   └── Trigger: "Convert to Client" button
    │
    └── Conversion Dialog
        ├── Confirm client name, email, Instagram
        ├── Select service type (what was sold)
        ├── Set package type
        ├── Contract status: "Sent" or "Signed"
        ├── Image authorization: "Pending" or "Signed"
        └── Create Client + Create First Project
            │
            └── Auto: Prospect.converted_to_client_id = client.id
            └── Auto timeline: "Converted to client by Karine"
```

### Clients List
```
Dashboard → Clientes
    │
    ├── Table view (default)
    │   ├── Name, Company, Status, Contract, Image Auth, Last Post
    │   ├── Filter: status, content type, package, contract status
    │   └── Search: name, Instagram, email
    │
    ├── Click row → Client Drawer
    │   ├── Contact info
    │   ├── Contract details + status history
    │   ├── Image authorization + expiry
    │   ├── Active projects list
    │   ├── Posts history
    │   └── Upsell flag + reason
    │
    └── "Novo Cliente" Button
        └── Direct add (skip prospect pipeline for referrals/known contacts)
```

---

## 3. Projects by Service Type

### Project Creation
```
Clientes → Select Client → "Novo Projeto"
    │
    ├── Service Type (dropdown)
    │   ├── Podcast / Entrevista Imigrou
    │   ├── Gravação de Curso
    │   ├── Gravação de Mentoria
    │   ├── Gestão de Redes Sociais
    │   ├── GlowUp do Instagram
    │   ├── Cobertura de Evento
    │   └── Pacote Personalizado
    │
    ├── Auto-load checklist for service type
    │   └── Example: "Gravação de Curso"
    │       ├── [ ] Confirmar data com cliente
    │       ├── [ ] Enviar briefing de conteúdo
    │       ├── [ ] Preparar equipamento
    │       ├── [ ] Gravar aula 1
    │       ├── [ ] Gravar aula 2
    │       ├── [ ] Editar
    │       ├── [ ] Revisão com cliente
    │       └── [ ] Entregar
    │
    ├── Assign to editor
    ├── Due date
    └── Save → Appears in client project list
```

### Project Detail
```
Projects → Select Project
    │
    ├── Overview
    │   ├── Service type badge
    │   ├── Status timeline
    │   ├── Checklist (editable, mark done)
    │   └── Team members
    │
    ├── Clips [Phase 2]
    │   └── Video upload, AI analysis, watermarked preview
    │
    ├── Posts
    │   └── Linked posts from publishing calendar
    │
    └── Settings
        └── Archive, delete, reassign
```

---

## 4. Contract & Image Authorization

### Contract Tracking
```
Cliente → Contract Section
    │
    ├── Status: None → Pending → Sent → Signed → Expired
    ├── "Enviar Contrato" button → upload PDF
    ├── Signed date
    ├── Expiry date (auto 1 year)
    └── Alert: "Contrato expira em 30 dias" (dashboard + email)
```

### Image Authorization
```
Cliente → Image Auth Section
    │
    ├── Status: Not Requested → Pending → Signed → Expired
    ├── "Solicitar Autorização" button
    ├── Signed date
    ├── Expiry date
    └── Alert: "Autorização de imagem expira em 30 dias"

Block Rule: If image_auth_status ≠ 'signed'
  → Cannot create new projects for this client
  → Warning: "Autorização de imagem pendente. Solicitar antes de iniciar projeto."
```

---

## 5. Publishing Calendar & Clip Inventory

### Calendar View
```
Dashboard → Calendário
    │
    ├── Month View (default)
    │   ├── Posts shown as cards on date
    │   ├── Color by platform (Instagram=purple, TikTok=black, etc.)
    │   ├── Click date → "Nova Publicação"
    │   └── Click post → Edit drawer
    │
    ├── Week View
    │   └── Horizontal timeline
    │
    └── Filter: client, platform, status
```

### New Post
```
Calendário → "Nova Publicação" or Projeto → "Criar Post"
    │
    ├── Client (dropdown)
    ├── Project (optional — links to source project)
    ├── Platform: Instagram / TikTok / YouTube / LinkedIn
    ├── Content type: Reel / Story / Carousel / Video
    ├── Caption
    ├── Hashtags (tag input)
    ├── Scheduled date/time
    ├── Clip/Video (upload or select from project) [Phase 2: R2 upload]
    └── Status: Draft → Scheduled → Posted → Archived
```

### Clip Inventory
```
Cliente → Clips
    │
    ├── All clips for this client
    ├── Status: Draft → Scheduled → Posted → Archived
    ├── Linked to project + post
    └── Thumbnail + duration
```

---

## 6. Last-Post Upsell Trigger

### Dashboard Alert
```
Dashboard → Alertas
    │
    └── "Clientes Inativos"
        ├── Client X — last post 45 days ago
        ├── Client Y — last post 32 days ago
        └── "Criar Proposta" button
            │
            └── Creates new prospect in Vendas Ativas
                ├── Name: Client X (Upsell)
                ├── Source: "upsell_trigger"
                ├── Products: same as current + new options
                └── Revenue: suggest based on history
```

### Settings
```
Configurações → Upsell
    ├── Threshold days: default 30
    ├── Platforms to check: [x] Instagram [x] TikTok [ ] YouTube
    └── Auto-flag or manual review
```

---

## 7. Spreadsheet Import

### Import Flow
```
Vendas Ativas or Clientes → "Importar" Button
    │
    ├── Upload CSV/Excel
    ├── Preview first 5 rows
    ├── Column Mapping (drag/drop or dropdown)
    │   ├── CSV: "Nome" → Map to: "Name"
    │   ├── CSV: "Instagram" → Map to: "Instagram"
    │   ├── CSV: "Telefone" → Map to: "Phone"
    │   ├── CSV: "Email" → Map to: "Email"
    │   ├── CSV: "Status" → Map to: "Status"
    │   └── Unmapped columns → skip or custom field
    │
    ├── Validation
    │   ├── Duplicates by email/Instagram/phone (highlight)
    │   ├── Invalid emails (highlight)
    │   └── Required fields missing (highlight)
    │
    ├── Review & Fix
    │   └── Edit individual rows before import
    │
    └── Import → Progress bar → Results
        ├── Imported: 47 rows
        ├── Duplicates skipped: 3
        ├── Errors: 2 (show details)
        └── Undo (within 5 minutes)
```

---

## 8. Onboarding & Auth

### New Team Member
```
Admin → Team → "Adicionar Membro"
    │
    ├── Email
    ├── Name
    ├── Role: Admin / Editor / Viewer
    ├── Language preference: PT / EN / ES
    └── Send invite → Email with magic link
        └── First login → set password → dashboard
```

### Role-Based Default Views

| Role | Default Landing | Actions |
|------|-----------------|---------|
| **Admin** | Dashboard (stats + alerts) | All |
| **Editor** | Assigned Projects | Edit, upload, checklist |
| **Viewer** | Review Queue | Approve/reject [Phase 2] |
| **Sales** | Vendas Ativas | Prospects, calls, deals |

---

## Phase 2 Flows (Not Sprint 1)

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

## Mobile-First Rules

1. **Vendas Ativas**: Default to table view on mobile; Kanban requires horizontal scroll
2. **Drawer**: Full-width on mobile, 50% width on desktop
3. **Quick Actions**: FAB (floating action button) for: new prospect, new call, new post
4. **Swipe**: Table rows swipe to call/WhatsApp/email
5. **Touch targets**: All buttons ≥ 44px

---

## Key UI Decisions

### Domain Language (Portuguese-first)
| UI Label | English Equivalent |
|----------|-------------------|
| Venda Ativa | Sales Opportunity |
| Lead cadastrado | New Lead |
| Call agendada | Meeting Scheduled |
| Gravação de curso | Course Recording |
| GlowUp do Instagram | Instagram Package |
| Cobertura de evento | Event Coverage |

Always use domain language. Never generic CRM terms.
