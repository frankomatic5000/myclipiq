# Vendas Ativas — Sales CRM Module Spec

## Overview
A lightweight sales CRM prototype for myclipiq to track active sales prospects through a full pipeline from prospecting to closed deals. No backend — mock data only.

## Feature List
1. **Kanban Board** — 4+ columns grouping 12 sales statuses
2. **Table View** — toggle between kanban and sortable/filterable table
3. **Prospect Detail Drawer** — click any prospect to open detail panel
4. **Contact Timeline** — chronological events inside detail view
5. **Commercial Call Notes** — record call outcomes
6. **Products of Interest** — tag/assign which products the prospect wants
7. **Closed Sale / Payment Section** — mock amounts, dates, payment status
8. **Operational Checklist** — per-service-type task list
9. **Alerts / Reminders** — upcoming actions and deadlines
10. **Search / Filter** — by name, company, status, product, date range

## 12 Sales Statuses (Portuguese)
1. Prospecting (Prospecto)
2. First Contact (Primeiro Contato)
3. Follow-up (Retorno)
4. Proposal Sent (Proposta Enviada)
5. Negotiation (Negociação)
6. Pending Contract (Contrato Pendente)
7. Contract Signed (Contrato Assinado)
8. Onboarding (Onboarding)
9. In Production (Em Produção)
10. Pending Payment (Pagamento Pendente)
11. Closed Won (Venda Fechada)
12. Closed Lost (Perdido)

## Status Column Grouping
- **Prospecting**: Prospecting, First Contact
- **Active Pipeline**: Follow-up, Proposal Sent, Negotiation, Pending Contract
- **Closing / In Progress**: Contract Signed, Onboarding, In Production, Pending Payment
- **Closed**: Closed Won, Closed Lost

## 10 Products
1. Gestão de Redes Sociais (Social Media Management)
2. Criação de Conteúdo (Content Creation)
3. Edição de Vídeo (Video Editing)
4. Identidade Visual (Visual Identity)
5. Consultoria de Marketing (Marketing Consulting)
6. Landing Page
7. Campanha Ads (Ads Campaign)
8. Fotografia de Produto (Product Photography)
9. E-mail Marketing
10. Branding Completo (Full Branding)

## Design System
- Dark theme: `surface-950` background, `surface-900` cards
- Brand accent: `brand-500` (#7c3aed)
- Status colors:
  - green (positive/active): Active, Won, Signed, Onboarding, In Production
  - amber (waiting): Proposal Sent, Negotiation, Pending Contract, Pending Payment
  - red (lost/negative): Closed Lost
  - blue (in progress): Follow-up, First Contact
  - purple (prospecting): Prospecting
- Mobile-first responsive
- Same spacing, typography, borders as dashboard/customers
- `rounded-xl` cards, `border border-surface-800/50` borders

## Mock Data Schema
```ts
interface Prospect {
  id: string;
  name: string;
  company: string;
  instagram: string;
  phone: string;
  email: string;
  status: Status;
  lastContact: string; // ISO date
  productsInterested: string[];
  assignedTo: string; // salesperson name
  notes: string;
  revenue: string; // mock amount if closed
  timeline: TimelineEvent[];
  calls: CallRecord[];
  checklist: ChecklistItem[];
  alerts: Alert[];
}

interface TimelineEvent {
  id: string;
  date: string;
  type: "message" | "call" | "email" | "status_change" | "note";
  description: string;
  author: string;
}

interface CallRecord {
  id: string;
  date: string;
  duration: string;
  outcome: string;
  notes: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  category: string;
}

interface Alert {
  id: string;
  type: "follow_up" | "deadline" | "payment";
  message: string;
  dueDate: string;
}
```

## Component Breakdown
| Component | Path | Purpose |
|-----------|------|---------|
| `KanbanBoard.tsx` | `src/app/components/KanbanBoard.tsx` | Draggable-looking columns (visual only) |
| `ProspectCard.tsx` | `src/app/components/ProspectCard.tsx` | Card shown in kanban column |
| `ProspectTable.tsx` | `src/app/components/ProspectTable.tsx` | Sortable/filterable table view |
| `ProspectDrawer.tsx` | `src/app/components/ProspectDrawer.tsx` | Detail drawer/modal |
| `Timeline.tsx` | `src/app/components/Timeline.tsx` | Vertical timeline |
| `Checklist.tsx` | `src/app/components/Checklist.tsx` | Operational checklist |

## Translations Namespace
`vendasAtivas` added to `en.json`, `pt.json`, `es.json` — includes all UI labels, status names, product names, action buttons.
