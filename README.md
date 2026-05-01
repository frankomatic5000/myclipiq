# 🎬 MyClipIQ

AI-powered content intelligence platform for creators with distributed teams.

## 🎯 Vision
Transform raw video into optimized social media content with AI analysis, team collaboration, and CRM management.

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes + Edge Functions |
| Database | Supabase (PostgreSQL) |
| Storage | Cloudflare R2 (temp) + Google Drive (archive) |
| AI | OpenAI Whisper + GPT-4o-mini |
| Auth | Supabase Auth |
| Hosting | Vercel |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your keys

# Run development server
npm run dev
```

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/             # Utilities, API clients
├── types/           # TypeScript types
├── hooks/           # Custom React hooks
└── utils/           # Helper functions

supabase/
├── migrations/      # Database schema
└── seed.sql         # Initial data

docs/
├── ARCHITECTURE.md  # System design
├── API.md          # API documentation
└── DEPLOYMENT.md   # Deployment guide
```

## 📊 Features (MVP)

- [ ] Google Drive integration (intake)
- [ ] Cloudflare R2 storage (temporary)
- [ ] CRM (customers, projects)
- [ ] AI video analysis (hooks, captions, viral score)
- [ ] Team workflow (editor + creator + customer)
- [ ] Watermarked previews
- [ ] WhatsApp notifications
- [ ] TikTok upload (inbox)
- [ ] Archive to Google Drive

## 📄 License

MIT — GrowBiz Media
