# Radar — UX & Business Workflow Review
## Vendas Ativas (Sales CRM Prototype)
**Project:** myclipiq | **Branch:** prototype/v2-ui | **Date:** 2026-05-07
**Reviewer:** Radar (Growth Lead) | **Perspective:** Karine's daily operational reality

---

## Executive Summary

The Vendas Ativas prototype is a solid first pass at an internal sales CRM. It demonstrates strong visual cohesion with the rest of the myclipiq dashboard, but has meaningful gaps between the mock data and Karine's actual daily workflow. With targeted improvements, this could become both a daily driver for GrowBiz and a credible SaaS product for other agencies.

---

## Dimension Reviews

### 1. Daily Usability
**Verdict: PASS (with reservations)**

- Navigation is clean: search → filter → view toggle → card/drawer. No surprises.
- Actions are discoverable: clicking a card opens the drawer; table view is obvious.
- **Friction:** There is no quick-add or "new prospect" CTA anywhere on the page. Karine would need to leave this screen to add a lead, which breaks flow.
- **Friction:** No bulk actions (e.g., select 3 prospects and change status). If Karine does outreach blasts, this is manual one-by-one.
- **Friction:** The "last contact" date is just text — no visual cue if it's stale (e.g., >7 days, >14 days).

### 2. Funnel Clarity
**Verdict: PASS (with reservations)**

- The 12 statuses are operationally clear and map well to a typical B2B services sale.
- **Issue:** `columnGroups` groups 5 statuses into "Fechamento" (Closed Won, Lost, Pediu Contato Futuro). "Pediu contato futuro" is not a closed state — it's a deferred active lead. It should not share a column with Won/Lost, because it buries warm leads at the bottom of the pipeline visually.
- **Issue:** There is no concept of "lost reason" or tags for why a deal was lost. Karine would want to know: was it price? timing? internal decision?
- **Suggestion:** Add a "Reativar" quick action for lost/deferred leads to move them back into the pipeline without re-entering data.

### 3. Checklist Intuitiveness
**Verdict: PASS**

- Service-specific checklists (gravação, social, evento) are easy to understand and grouped logically.
- Checklist items are actionable and use plain language.
- **Note:** The checklists are static mocks. In real use, they should be editable per prospect (some clients need custom steps).
- **Missing:** No progress indicator on the card itself. Karine can't see at a glance which prospects have incomplete checklists.

### 4. Detail Drawer
**Verdict: PASS (but overloaded)**

- The drawer is well-organized into sections: contact info, products, revenue, notes, alerts, calls, timeline, checklist.
- **Overload:** All 8 sections are always visible and expanded. For a prospect with a lot of history, this becomes a long scroll.
- **Priority issue:** Revenue is visually prominent (big number), but for early-stage prospects it's "—" and takes up space.
- **Recommendation:** Collapse timeline and checklist by default; let Karine expand them. Keep contact info, alerts, and notes visible at top.

### 5. Kanban Scannability
**Verdict: PASS**

- Column colors (purple, amber, green, surface) are meaningful and consistent.
- Card density is appropriate: name, company, status dot, products (2 + overflow), assignee, revenue, alerts.
- **Issue:** The "Cadastro" column can only ever hold one status (`lead_cadastrado`). It wastes horizontal space. Consider merging "Cadastro" into "Contato" or making columns collapsible.
- **Issue:** Revenue is shown on every card. For early-stage prospects, this is speculative and adds noise. Consider showing revenue only for prospects in `negociacao` or later.

### 6. Mobile Realism
**Verdict: NEEDS WORK**

- The Kanban board uses `grid-cols-1` on mobile, which stacks all 4 columns vertically. This is unusable for managing a pipeline — Karine would need to scroll through entire columns.
- The drawer is full-width on mobile (good), but the checklist checkboxes are small touch targets.
- **Recommendation for mobile:** Default to table view on screens <768px. Table view is scannable; Kanban requires horizontal scrolling or column switching.
- **Mobile score: 4/10** — The prototype is technically responsive, but not practically usable for sales management on a phone.

### 7. Manual vs Automated
**Verdict: SIGNIFICANT OPPORTUNITY**

- **Manual pain points that stand out:**
  1. **Status changes are not logged automatically.** Every status change requires manual timeline entry. The timeline should auto-generate "Status changed to X by Karine on Y" entries.
  2. **No next-action auto-suggestion.** After a call, Karine has to manually create an alert. The system should suggest: "Follow up in 3 days?" with one click.
  3. **Alerts are static strings.** No recurrence, no snooze, no integration with calendar.
  4. **No lead source tracking.** Karine sources leads from Instagram DMs, referrals, events, cold outreach — none of this is captured.
  5. **No revenue forecasting.** With 12 prospects at various stages and revenue values, the page should auto-calculate a weighted pipeline value.

### 8. SaaS Opportunities
**Verdict: STRONG FOUNDATION**

- What would make this sellable to other agencies:
  1. **Multi-user assignment & permissions** — The `assignedTo` field exists but is just text. Real multi-user assignment with role-based access is essential.
  2. **Lead source tracking** — Where did this lead come from? (Instagram, referral, event, paid ads, etc.)
  3. **Pipeline analytics** — conversion rates by stage, average deal size, time-in-stage, win/loss reasons.
  4. **Email/WhatsApp integration** — Log communications automatically instead of typing them into timeline.
  5. **Quote/proposal builder** — Generate proposals from product selection and pricing rules.
  6. **Payment tracking** — Link to actual invoices/payment status, not just mock revenue strings.
  7. **White-labeling** — Other agencies want their own branding.
  8. **API/webhooks** — Connect to Zapier, Make, etc. for automation.
- **Missing for commercial CRM:** Dashboard with metrics, email templates, sequence automation, team activity feed, integrations.

---

## Scoring Summary

| Dimension | Verdict |
|-----------|---------|
| 1. Daily Usability | PASS (with reservations) |
| 2. Funnel Clarity | PASS (with reservations) |
| 3. Checklist Intuitiveness | PASS |
| 4. Detail Drawer | PASS (but overloaded) |
| 5. Kanban Scannability | PASS |
| 6. Mobile Realism | NEEDS WORK |
| 7. Manual vs Automated | SIGNIFICANT OPPORTUNITY |
| 8. SaaS Opportunities | STRONG FOUNDATION |

- **Mobile Usability Score:** 4/10
- **SaaS-Readiness Score:** 5/10

---

## Top 3 Strengths

1. **Visual coherence.** The dark theme, spacing, and card design feel premium and consistent with the rest of myclipiq. Karine won't feel like she's using a different product.
2. **Checklist system.** Service-specific operational checklists are a genuine differentiator. Most lightweight CRMs don't have built-in delivery checklists tied to product types.
3. **Dual view (Kanban + Table).** Giving Karine the choice of visual pipeline vs. dense data table respects different mental models and use cases.

## Top 3 Improvement Areas

1. **Add a pipeline health summary.** Auto-calculate: total pipeline value, weighted forecast, deals stalled >7 days, follow-ups due today. Show this as a sticky top bar or collapsible summary section. This is the #1 thing Karine needs every morning.
2. **Fix mobile experience.** On mobile, default to table view with swipe actions (call, WhatsApp, email). Add a "quick actions" FAB for common tasks. The Kanban vertical stack is not viable.
3. **Automate status logging and next-action suggestions.** Every status change should auto-log to timeline. After a call note is saved, suggest a follow-up date and auto-create the alert. Remove repetitive typing.

---

## Recommended Next Steps

| Priority | Action | Owner |
|----------|--------|-------|
| P0 | Add pipeline summary bar (total value, deals due, stalled alerts) | RodZilla |
| P0 | Add "Novo Prospecto" quick-add button on page | RodZilla |
| P0 | Separate "Pediu contato futuro" into its own column or move to "Contato" | RodZilla |
| P1 | Auto-log status changes to timeline | RodZilla |
| P1 | Add follow-up suggestion after call/save | RodZilla |
| P1 | Default to table view on mobile; add swipe actions | RodZilla |
| P1 | Add lead source field to prospect schema | RodZilla |
| P2 | Add pipeline analytics dashboard (conversion rates, time-in-stage) | RodZilla |
| P2 | Make checklists editable per prospect | RodZilla |
| P2 | Add revenue forecasting (weighted by stage probability) | RodZilla |

---

## SaaS Pivot Assessment

This prototype has more SaaS potential than it appears. The built-in operational checklists, product-to-task mapping, and bilingual support are genuine differentiators vs. generic CRMs like Pipedrive or HubSpot for agencies.

**To become a sellable product, the shortest path is:**
1. Add multi-tenancy (team/workspace isolation)
2. Add lead source + pipeline analytics
3. Add email/WhatsApp integration for auto-logging
4. Add a simple proposal/quote builder
5. Price at $15–29/user/month for agencies

**Differentiation angle:** "The CRM that knows what your agency actually delivers." Most CRMs track deals. This one tracks deals *and* delivery checklists.

---

*Review completed by Radar | Next review gate: after P0 fixes implemented*
