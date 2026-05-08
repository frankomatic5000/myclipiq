# 🎨 MyClipIQ v2 Prototype — Design Spec

## Overview

Modern, minimalist creator-focused dashboard for MyClipIQ v2. Designed for content creators who need a clean, fast, and video-first workspace.

---

## 1. Component Inventory

### Layout Components

| Component | Purpose | Notes |
|-----------|---------|-------|
| `Sidebar` | Primary navigation | Collapsible, icon-based |
| `Header` | Page context + actions | Sticky top |
| `DashboardShell` | Main layout wrapper | Sidebar + Header + Content |
| `MobileNav` | Mobile hamburger overlay | Full-screen, animated |

### UI Components

| Component | Purpose | Notes |
|-----------|---------|-------|
| `StatCard` | Key metrics display | Number + label + icon + trend |
| `ProjectCard` | Project list item | Thumbnail + meta + status |
| `StatusBadge` | Pipeline state indicator | 7 color-coded states |
| `PipelineProgress` | Visual pipeline flow | Horizontal stepper |
| `EmptyState` | No-data placeholder | Icon + CTA |
| `SkeletonCard` | Loading placeholder | Pulsing shimmer |
| `LanguageSwitcher` | Locale toggle | EN \| PT \| ES |
| `Avatar` | User/assignee placeholder | Initials + background |
| `SearchBar` | Visual search input | Placeholder only |
| `NotificationBell` | Visual notification trigger | Badge support |

---

## 2. Color Palette

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-50` | `#f0f9ff` | Light backgrounds |
| `brand-100` | `#e0f2fe` | Hover states |
| `brand-200` | `#bae6fd` | Borders |
| `brand-400` | `#38bdf8` | Primary accent |
| `brand-500` | `#0ea5e9` | Buttons, links |
| `brand-600` | `#0284c7` | Active states |
| `brand-900` | `#0c4a6e` | Dark accents |

### Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `surface-950` | `#020617` | Deepest background |
| `surface-900` | `#0f172a` | App background |
| `surface-800` | `#1e293b` | Cards, panels |
| `surface-700` | `#334155` | Borders, dividers |
| `surface-600` | `#475569` | Muted text |
| `surface-400` | `#94a3b8` | Secondary text |
| `surface-200` | `#e2e8f0` | Primary text |
| `surface-100` | `#f1f5f9` | Lightest text |

### Status Colors

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| `intake` | `#451a03` | `#fbbf24` | `#92400e` |
| `editing` | `#172554` | `#60a5fa` | `#1e40af` |
| `analysis` | `#3b0764` | `#c084fc` | `#6b21a8` |
| `review` | `#422006` | `#facc15` | `#a16207` |
| `approved` | `#052e16` | `#4ade80` | `#166534` |
| `posted` | `#134e4a` | `#2dd4bf` | `#0f766e` |
| `archived` | `#1e293b` | `#94a3b8` | `#475569` |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22c55e` | Positive trends, checks |
| `warning` | `#f59e0b` | Alerts, attention |
| `error` | `#ef4444` | Errors, failures |
| `info` | `#3b82f6` | Neutral info |

---

## 3. Typography

### Font Stack

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

### Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 2.25rem (36px) | 700 | 1.2 | Page titles |
| `heading-1` | 1.5rem (24px) | 600 | 1.3 | Section headers |
| `heading-2` | 1.25rem (20px) | 600 | 1.4 | Card titles |
| `body-lg` | 1.125rem (18px) | 400 | 1.6 | Emphasized body |
| `body` | 1rem (16px) | 400 | 1.5 | Default text |
| `body-sm` | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| `caption` | 0.75rem (12px) | 500 | 1.4 | Labels, badges |

### Hierarchy Rules

- **Page Title**: `display` + `surface-100` + tracking-tight
- **Section Title**: `heading-1` + `surface-200` + mb-6
- **Card Title**: `heading-2` + `surface-200`
- **Body**: `body` + `surface-400`
- **Caption**: `caption` + `surface-600` + uppercase tracking-wider

---

## 4. Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Inline elements |
| `space-3` | 12px | Small padding |
| `space-4` | 16px | Default padding |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large sections |
| `space-10` | 40px | Page padding |
| `space-12` | 48px | Major sections |
| `space-16` | 64px | Hero spacing |

### Layout Spacing

- **Sidebar width**: 256px (16rem) expanded, 64px (4rem) collapsed
- **Header height**: 64px (4rem)
- **Content padding**: 24px (space-6)
- **Card gap**: 16px (space-4)
- **Section gap**: 32px (space-8)

---

## 5. Animation Specs

### Timing Tokens

| Token | Duration | Usage |
|-------|----------|-------|
| `instant` | 0ms | Immediate |
| `fast` | 150ms | Hover, focus |
| `normal` | 250ms | Transitions |
| `slow` | 350ms | Complex animations |
| `slower` | 500ms | Page transitions |

### Easing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default transitions |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful elements |

### Component Animations

#### Sidebar

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Collapse/Expand | Width transition | 250ms ease-default |
| Item hover | Background opacity 0 → 1 | 150ms ease-default |
| Active indicator | Slide in from left | 200ms ease-out |

#### Stat Cards

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Hover | translateY(-2px) + shadow increase | 200ms ease-default |
| Number change | Fade + scale pulse | 300ms ease-bounce |

#### Project Cards

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Hover | translateY(-2px) + border brand glow | 200ms ease-default |
| Click | Scale(0.98) | 100ms ease-in |
| Loading | Skeleton pulse opacity 0.4 ↔ 0.8 | 1.5s ease-in-out infinite |

#### Status Badges

| Trigger | Animation | Duration |
|---------|-----------|----------|
| State change | Background color transition | 300ms ease-default |
| Appear | Scale(0.9) → Scale(1) + opacity | 200ms ease-out |

#### Mobile Nav

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Open | Slide from left + fade overlay | 300ms ease-out |
| Close | Slide to left + fade out overlay | 200ms ease-in |
| Item tap | Scale(0.98) + background flash | 100ms ease-default |

#### Empty State

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Appear | Fade in + translateY(10px → 0) | 400ms ease-out |
| Icon | Gentle float up/down loop | 3s ease-in-out infinite |

#### Language Switcher

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Toggle | Dropdown fade + slideY(-5px → 0) | 200ms ease-out |
| Select | Checkmark scale in | 150ms ease-bounce |

### Skeleton Loading

```
Shimmer effect:
- Background: linear-gradient(90deg, surface-800, surface-700, surface-800)
- Background-size: 200% 100%
- Animation: background-position 1.5s infinite
```

---

## 6. Responsive Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| `xs` | < 640px | Mobile — sidebar hidden, hamburger nav |
| `sm` | 640px | Small tablets — sidebar collapsed by default |
| `md` | 768px | Tablets — sidebar collapsible |
| `lg` | 1024px | Desktop — sidebar expanded default |
| `xl` | 1280px | Large desktop — comfortable spacing |
| `2xl` | 1536px | Ultra-wide — max-width content container |

### Responsive Rules

#### Mobile (< 640px)

- Sidebar: hidden, full-screen overlay on hamburger
- Header: compact, search hidden behind icon
- Stats: 2×2 grid → 1 column stack
- Projects: single column cards
- Pipeline: vertical stack or hidden summary
- Language switcher: compact (codes only)

#### Tablet (640px – 1023px)

- Sidebar: collapsed by default, expandable
- Stats: 2×2 grid
- Projects: 1–2 columns
- Pipeline: horizontal compact

#### Desktop (≥ 1024px)

- Sidebar: expanded default, collapsible
- Stats: 4-column row
- Projects: 2–3 columns
- Pipeline: full horizontal flow
- All controls visible

---

## 7. Mock Data Examples

### MockProject Interface

```typescript
interface MockProject {
  id: string;
  title: string;
  customer: string;
  status: 'intake' | 'editing' | 'analysis' | 'review' | 'approved' | 'posted' | 'archived';
  thumbnail: string; // CSS color or gradient string
  lastUpdated: string; // ISO date or relative string
  assignee: {
    initials: string;
    color: string; // Tailwind bg color class
  };
  progress: number; // 0-100
}
```

### Example Projects

```typescript
const mockProjects: MockProject[] = [
  {
    id: 'proj-001',
    title: 'Summer Product Launch',
    customer: 'Acme Co',
    status: 'editing',
    thumbnail: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    lastUpdated: '2 hours ago',
    assignee: { initials: 'RR', color: 'bg-brand-500' },
    progress: 65,
  },
  {
    id: 'proj-002',
    title: 'Behind the Scenes — Q3',
    customer: 'Studio Nova',
    status: 'review',
    thumbnail: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    lastUpdated: '5 hours ago',
    assignee: { initials: 'KA', color: 'bg-purple-500' },
    progress: 90,
  },
  {
    id: 'proj-003',
    title: 'Tutorial Series Ep. 4',
    customer: 'TechLearn',
    status: 'intake',
    thumbnail: 'linear-gradient(135deg, #10b981, #3b82f6)',
    lastUpdated: '1 day ago',
    assignee: { initials: 'JM', color: 'bg-emerald-500' },
    progress: 10,
  },
  {
    id: 'proj-004',
    title: 'Brand Refresh Reel',
    customer: 'Bloom Agency',
    status: 'approved',
    thumbnail: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    lastUpdated: '3 days ago',
    assignee: { initials: 'RR', color: 'bg-brand-500' },
    progress: 100,
  },
  {
    id: 'proj-005',
    title: 'Customer Testimonial Compilation',
    customer: 'TrustVault',
    status: 'posted',
    thumbnail: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
    lastUpdated: '1 week ago',
    assignee: { initials: 'TD', color: 'bg-teal-500' },
    progress: 100,
  },
];
```

### Dashboard Stats

```typescript
interface DashboardStats {
  totalProjects: number;
  inProgress: number;
  pendingReview: number;
  completedThisWeek: number;
}

const mockStats: DashboardStats = {
  totalProjects: 24,
  inProgress: 8,
  pendingReview: 3,
  completedThisWeek: 7,
};
```

### Pipeline Stages

```typescript
interface PipelineStage {
  id: string;
  label: string;
  status: 'intake' | 'editing' | 'analysis' | 'review' | 'approved' | 'posted' | 'archived';
  count: number;
}

const pipelineStages: PipelineStage[] = [
  { id: 'stage-1', label: 'Intake', status: 'intake', count: 4 },
  { id: 'stage-2', label: 'Editing', status: 'editing', count: 3 },
  { id: 'stage-3', label: 'Analysis', status: 'analysis', count: 2 },
  { id: 'stage-4', label: 'Review', status: 'review', count: 3 },
  { id: 'stage-5', label: 'Approved', status: 'approved', count: 8 },
  { id: 'stage-6', label: 'Posted', status: 'posted', count: 4 },
];
```

### Sidebar Navigation

```typescript
interface NavItem {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  href: string;
  badge?: number;
}

const sidebarNav: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'Home', href: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: 'FolderOpen', href: '/projects', badge: 3 },
  { id: 'upload', label: 'Upload', icon: 'Upload', href: '/upload' },
  { id: 'team', label: 'Team', icon: 'Users', href: '/team' },
  { id: 'settings', label: 'Settings', icon: 'Settings', href: '/settings' },
];
```

---

## 8. Accessibility Considerations

- **Color contrast**: All text meets WCAG AA (4.5:1 minimum)
- **Focus states**: Visible focus rings on all interactive elements (2px brand-400)
- **Reduced motion**: Respect `prefers-reduced-motion` — disable animations
- **Screen readers**: Proper ARIA labels on all icon-only buttons
- **Keyboard nav**: Full keyboard navigation for sidebar and dropdowns

---

## 9. Empty State Spec

### No Projects

```
Icon: Film or UploadCloud (Lucide)
Size: 64px
Color: surface-600

Title: "No projects yet"
Style: heading-2, surface-200

Subtitle: "Upload your first video to get started"
Style: body, surface-500

CTA: "Upload your first video"
Style: Primary button (brand-500)
```

### No Pipeline Data

```
Icon: BarChart3 (Lucide)
Title: "No activity yet"
Subtitle: "Your pipeline will fill up as projects move forward"
```

---

## 10. Loading State Spec

### Dashboard Loading

```
Skeleton Stats: 4 cards, each with:
  - Rectangular shimmer (w-full, h-24)
  - Circle shimmer (48px) + 2 line shimmers

Skeleton Projects: 3 cards, each with:
  - Rectangular shimmer for thumbnail (aspect-video)
  - Line shimmer for title
  - Line shimmer for meta
  - Circle shimmer for avatar

Skeleton Pipeline: 6 step placeholders
  - Circle + line shimmer per step
```

---

## Summary

This design spec defines a clean, creator-focused dashboard that prioritizes:

1. **Clarity** — status at a glance
2. **Speed** — fast scan-ability, minimal cognitive load
3. **Delight** — subtle animations without distraction
4. **Scalability** — responsive from mobile to ultra-wide

All components are defined with mock data structures ready for RodZilla implementation.
