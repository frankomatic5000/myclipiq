# MyClipIQ v2 — User Experience Flows

## 1. Onboarding

### New User (Editor in Brazil)
```
1. Receives WhatsApp invite link from Karine
2. Clicks link → Opens MyClipIQ
3. Signs up with email + password
4. Completes profile (name, role=editor, timezone)
5. Sees dashboard with assigned projects
```

### New Customer
```
1. Karine creates customer in CRM
2. Customer receives WhatsApp with review link
3. Clicks link → Views watermarked preview
4. Approves or rejects with notes
```

## 2. Upload Video (Karine)

```
Google Drive
    │
    ├── Upload raw video to "MyClipIQ/Intake" folder
    │
    ▼
Webhook → MyClipIQ
    │
    ├── Download video
    ├── Upload to R2 (temporary)
    ├── Create project record
    ├── Extract metadata (duration, resolution)
    │
    ▼
Notify Editor (WhatsApp)
    "New project: Customer Name - Project Name"
    Link to download from R2
```

### UI Flow
```
Dashboard → "New Project" Button
    │
    ├── Select Customer (dropdown)
    ├── Upload Video (drag & drop)
    ├── Auto-extract: filename → project name
    ├── Edit project name (optional)
    │
    ▼
Processing State
    ├── Uploading to R2 (progress bar)
    ├── Extracting metadata
    ├── Creating project
    │
    ▼
Success → Project card appears in dashboard
```

## 3. AI Analysis

### Trigger
```
Editor uploads edited video
    │
    ▼
Auto-trigger AI analysis
    │
    ├── FFmpeg extract audio
    ├── Whisper transcription
    ├── GPT-4o-mini analysis
    │
    ▼
Results stored in ai_analyses
```

### Results Page
```
Project → "AI Analysis" Tab
    │
    ├── Transcription (scrollable, time-stamped)
    ├── Hook Suggestions (3-5 variants)
    │   ├── Variant 1: "Don't skip this..." (score: 92)
    │   ├── Variant 2: "The secret is..." (score: 88)
    │   └── Variant 3: "Wait for it..." (score: 85)
    ├── Caption Optimization
    │   ├── Short: "..."
    │   ├── Medium: "..."
    │   └── Long: "..."
    ├── Hashtag Recommendations
    │   ├── Primary: #creator #business
    │   ├── Secondary: #growth #tips
    │   └── Trending: #viral2026
    ├── Viral Score: 87/100
    ├── Predicted Views: 50K-100K
    └── Optimal Posting: Tuesday, 8PM BRT
    │
    ▼
Editor picks suggestions
    ├── Select hook variant
    ├── Select caption length
    ├── Select hashtags
    │
    ▼
Save → Send for Karine review
```

## 4. Results Page (Karine Review)

```
Dashboard → Project Card → "Review" Button
    │
    ├── Video Player (watermarked preview)
    ├── Selected AI suggestions (read-only)
    ├── Editor notes
    │
    ├── [✅ Approve] [❌ Reject]
    │
    └── Reject → Text area for notes
    │
    ▼
Approve → Send to Customer
Reject → Back to Editor
```

## 5. Project History

```
Dashboard → "Projects" Tab
    │
    ├── Filter: All | Intake | Editing | Analysis | Review | Approved | Posted | Archived
    ├── Sort: Date | Customer | Status
    │
    ├── Project Card
    │   ├── Thumbnail
    │   ├── Customer Name
    │   ├── Project Name
    │   ├── Status Badge (color-coded)
    │   ├── Last Updated
    │   └── Actions: View | Edit | Archive
    │
    ▼
Click Card → Project Detail
    ├── Tabs: Overview | Video | Analysis | Reviews | Settings
    ├── Status Timeline
    │   ├── Intake → Editing → Analysis → Review → Approved
    │   └── Current stage highlighted
    ├── Team Members
    ├── Activity Log
    └── Archive (30 days after posted)
```

## 6. Customer Approval (External)

```
WhatsApp Message
    "Your video is ready for review: [Link]"
    │
    ▼
Click Link → Review Page (no login required)
    ├── Watermarked video player
    ├── Hook + Caption preview
    ├── [✅ Approve] [❌ Request Changes]
    │
    ▼
Approve → Karine notified → Ready to post
Request Changes → Notes → Back to Editor
```

## 7. Archive Flow

```
30 Days After Posted
    │
    ├── pg_cron triggers archive job
    ├── Download from R2
    ├── Upload to Google Drive
    ├── Delete from R2
    ├── Update project status to "archived"
    │
    ▼
Project moves to "Archived" filter
```

## Key UI Decisions

### Mobile-First
- All flows work on mobile
- WhatsApp is primary notification channel
- Upload works from phone gallery

### Role-Based Views
| Role | Default View | Actions |
|------|-------------|---------|
| Admin | Dashboard + CRM | All |
| Editor | Assigned Projects | Download, Edit, Upload, Pick AI |
| Viewer | Review Queue | Approve/Reject |

### Status Colors
| Status | Color |
|--------|-------|
| Intake | Gray |
| Editing | Blue |
| Analysis | Purple |
| Review | Yellow |
| Approved | Green |
| Posted | Teal |
| Archived | Slate |
