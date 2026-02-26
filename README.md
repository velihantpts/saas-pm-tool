# NexusFlow — SaaS Project Management Tool

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A comprehensive, full-stack project management platform inspired by **Linear** and **Jira**. Built with modern technologies and designed for real-world team collaboration.

## Features

### Core
- **Multi-tenant Workspaces** — Slug-based routing, RBAC (Owner/Admin/Member/Viewer)
- **Project Management** — CRUD, auto-generated project keys, color coding
- **Task / Issue Tracking** — Full lifecycle management with atomic task numbering (PLT-1, PLT-2...)
- **Kanban Board** — Drag-and-drop with @dnd-kit, optimistic UI updates, quick-add tasks
- **List View** — Sortable table, inline editing, CSV export
- **Sprint Management** — Create, start, complete sprints with progress tracking

### Collaboration
- **Comments** — Real-time comment threads on tasks
- **Activity Feed** — Workspace-wide timeline with entity filtering
- **Notifications** — In-app notification panel with unread badges
- **Real-time Sync** — BroadcastChannel API for cross-tab updates
- **Member Management** — Invite, assign roles, remove members

### Productivity
- **Command Palette** — `Ctrl+K` global search across tasks, projects, and navigation
- **Keyboard Shortcuts** — Vim-style navigation (G+D, G+P, G+A...), shortcut panel
- **AI Assistant** — Task generation, project summarization, writing assistant, standup reports
- **Analytics Dashboard** — KPI cards, pie/bar/line/area charts (Recharts), team workload

### UX & Polish
- **Dark/Light Theme** — View Transition API with circular reveal animation
- **Onboarding Wizard** — 3-step animated setup (Create Workspace → Invite → First Project)
- **Settings** — Workspace, profile, appearance, notification preferences
- **Responsive Design** — Optimized for desktop, tablet, and mobile

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL + Prisma 5 ORM |
| **Authentication** | NextAuth v5 (Auth.js) with JWT |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **State** | Zustand |
| **Drag & Drop** | @dnd-kit |
| **Charts** | Recharts |
| **Animation** | Framer Motion |
| **AI** | OpenAI API (optional) |
| **Validation** | Zod |

## Architecture

```
app/
├── (auth)/               # Login, Register (public)
├── (dashboard)/          # Protected dashboard
│   └── w/[slug]/         # Workspace routes
│       ├── projects/     # Project list & board
│       ├── my-tasks/     # List view
│       ├── sprints/      # Sprint management
│       ├── analytics/    # Charts & KPIs
│       ├── activity/     # Activity feed
│       ├── members/      # Team management
│       └── settings/     # Workspace & profile
├── api/
│   ├── auth/             # NextAuth handlers
│   ├── ai/               # AI assistant
│   ├── search/           # Global search
│   ├── user/             # User profile
│   └── workspaces/[slug]/
│       ├── tasks/        # Task CRUD + comments
│       ├── projects/     # Project CRUD + columns
│       ├── sprints/      # Sprint CRUD
│       ├── members/      # Member management
│       ├── notifications/# Notification system
│       ├── activity/     # Activity log
│       ├── analytics/    # Analytics data
│       ├── labels/       # Label CRUD
│       └── settings/     # Workspace settings
components/
├── layout/               # Sidebar, TopBar
├── board/                # KanbanCard, KanbanColumn
├── tasks/                # TaskDetailModal
├── notifications/        # NotificationPanel
├── ai/                   # AIPanel
├── shared/               # CommandPalette, KeyboardShortcuts, RealtimeProvider
└── ui/                   # shadcn/ui components (29)
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- (Optional) OpenAI API key for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nexusflow.git
cd nexusflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# Push database schema
npm run db:push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with:
- **Email:** `admin@nexusflow.dev`
- **Password:** `password123`

### Demo Accounts

| Name | Email | Role |
|------|-------|------|
| Alex Johnson | admin@nexusflow.dev | Owner |
| Sarah Chen | sarah@nexusflow.dev | Admin |
| John Williams | john@nexusflow.dev | Member |
| Emily Davis | emily@nexusflow.dev | Member |

## Database

The application uses **20 Prisma models** with full relational mapping:

- **Auth:** User, Account, Session, VerificationToken
- **Multi-tenant:** Workspace, WorkspaceMember, WorkspaceInvite
- **Project Management:** Project, ProjectFavorite, Column
- **Tasks:** Task, TaskDependency, Label, TaskLabel, Comment, Attachment
- **Agile:** Sprint
- **System:** Activity, Notification, Webhook

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment variables to set in Vercel:**
- `DATABASE_URL` — PostgreSQL connection string (Neon, Supabase, Railway)
- `NEXTAUTH_SECRET` — Random 32+ character secret
- `NEXTAUTH_URL` — Your production URL
- `OPENAI_API_KEY` — (Optional) For AI features

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

## License

MIT
