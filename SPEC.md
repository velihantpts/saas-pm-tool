# NexusFlow — SaaS Project Management Tool

> Jira/Linear-inspired project management platform with real-time collaboration, AI-powered task management, and multi-tenant workspace architecture.

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Name** | NexusFlow |
| **Type** | SaaS Project Management Tool |
| **Inspiration** | Linear, Jira, Asana, ClickUp |
| **Target** | Development teams, startups, agencies |
| **Multi-tenant** | Yes — workspace-based isolation |
| **Billing** | Stripe subscription (Free / Pro / Enterprise) |

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React framework |
| **Language** | TypeScript 5 | Type safety |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first + component library |
| **Database** | PostgreSQL (Neon) | Relational data |
| **ORM** | Prisma 6 | Type-safe database access |
| **Auth** | NextAuth v5 (Auth.js) | OAuth + Credentials + Magic Link |
| **Real-time** | Pusher / Ably | WebSocket channels |
| **AI** | OpenAI API (GPT-4o) | Task suggestions, summaries, writing |
| **Email** | Resend | Transactional emails + notifications |
| **File Storage** | Uploadthing / Cloudinary | File & image uploads |
| **Payment** | Stripe | Subscription billing |
| **Animation** | Framer Motion | UI animations |
| **Charts** | Recharts | Analytics dashboards |
| **DnD** | @dnd-kit | Kanban board drag & drop |
| **State** | Zustand | Client-side state management |
| **Validation** | Zod | Schema validation |
| **Testing** | Vitest + Playwright | Unit + E2E tests |
| **CI/CD** | GitHub Actions | Automated pipeline |
| **Deploy** | Vercel | Serverless hosting |
| **Monitoring** | Sentry | Error tracking |

---

## 3. Feature Modules (18 Modules)

### Module 1: Authentication & Onboarding
- Email/password login + registration
- Google & GitHub OAuth
- Magic link email login
- Email verification flow
- Forgot/reset password
- Onboarding wizard (create workspace → invite team → create first project)
- Avatar upload in onboarding
- Protected routes via middleware

### Module 2: Multi-Tenant Workspaces
- Create workspace with name, slug, logo
- Workspace switcher in sidebar
- Member invitation via email link
- Member roles: Owner, Admin, Member, Viewer
- Workspace settings (name, logo, delete, billing)
- Workspace-scoped data isolation (all queries filtered by workspaceId)
- Slug-based routing: `/w/[slug]/projects`

### Module 3: Project Management
- Create project with name, description, icon, color
- Project key auto-generation (e.g., "NXF" from "NexusFlow")
- Project list view (cards + table toggle)
- Project settings (name, description, members, archive, delete)
- Project-level member assignment
- Favorite/star projects (pinned in sidebar)
- Project templates (Bug Tracker, Sprint Board, Roadmap)
- Archive & restore projects

### Module 4: Task / Issue Management (Core)
- Create task with: title, description (rich text), status, priority, assignee, labels, due date, estimate
- Task ID auto-generation: `NXF-42` (project key + auto-increment)
- Task detail modal (slide-over panel)
- Sub-tasks (parent-child relationship)
- Task comments with @mentions
- Task activity log (status changes, assignments, edits)
- File attachments on tasks
- Copy task link, move task between projects
- Bulk actions (multi-select → change status/assignee/priority)
- Quick add task (inline creation)
- Markdown editor for description (with preview)

### Module 5: Kanban Board
- Drag & drop columns (status-based: Backlog, Todo, In Progress, In Review, Done)
- Drag tasks between columns → auto-update status
- Custom column creation & reordering
- Column WIP limits (visual warning when exceeded)
- Swimlanes (group by: assignee, priority, label)
- Quick filters on board (assignee, priority, label)
- Card preview: title, assignee avatar, priority badge, due date, sub-task progress
- Collapsible columns
- Real-time updates (other users' changes appear live)

### Module 6: List View
- Table/spreadsheet-style task view
- Sortable columns (status, priority, assignee, due date, created)
- Inline editing (click to edit title, status, assignee, priority)
- Column visibility toggle
- Group by: status, priority, assignee, label, none
- Bulk selection & actions
- Pagination (infinite scroll or page-based)
- Export to CSV

### Module 7: Sprint Management
- Create sprints with: name, goal, start date, end date
- Sprint backlog → drag tasks into sprint
- Active sprint board (filtered Kanban)
- Sprint completion → move incomplete to next sprint or backlog
- Sprint velocity chart (story points completed per sprint)
- Sprint burndown chart
- Sprint retrospective notes (markdown)

### Module 8: Labels & Filters
- Custom labels with name + color (workspace-scoped)
- Predefined priority levels: Urgent, High, Medium, Low, None
- Advanced filter builder: combine status, priority, assignee, label, due date, created date with AND/OR logic
- Save custom filter views
- Shared filter views (team-visible)
- Quick filters sidebar

### Module 9: Real-Time Collaboration
- Live cursors on Kanban board (see who's viewing)
- Real-time task updates (status, assignee changes broadcast to all)
- Presence indicators (online/offline/away per user)
- Real-time notifications (bell icon + dropdown)
- Optimistic UI updates with rollback on failure
- "User X is typing..." in comments
- Channel-based subscriptions: workspace, project, task

### Module 10: AI Features
- **AI Task Generator**: Describe a feature → AI breaks it into sub-tasks with estimates
- **AI Summary**: Summarize project progress, blockers, sprint status
- **AI Writing Assistant**: Improve/expand/shorten task descriptions
- **AI Labels**: Auto-suggest labels based on task content
- **AI Priority**: Suggest priority based on keywords, due date, dependencies
- **AI Sprint Planning**: Suggest which tasks to include based on velocity & estimates
- **AI Daily Standup**: Auto-generate standup report from yesterday's activity
- Streaming responses with typing effect
- Token usage tracking per workspace

### Module 11: Notifications System
- In-app notification bell with unread count badge
- Notification types: assigned to you, mentioned, status changed, comment added, sprint started, due date approaching
- Notification preferences per type (in-app, email, both, none)
- Mark as read / mark all as read
- Notification grouping by project
- Email digest (daily/weekly summary)
- Real-time push via Pusher

### Module 12: Dashboard & Analytics
- Workspace dashboard: active projects, tasks this week, overdue count, team activity
- Project dashboard: burndown, velocity, task distribution (pie by status), completion rate
- Team dashboard: workload per member (bar chart), completion leaderboard
- Personal dashboard: my tasks, my overdue, my upcoming, recent activity
- Date range filter on all charts
- Custom KPI cards (total tasks, completed this week, avg cycle time)
- Activity heatmap (GitHub-style contribution grid)

### Module 13: Timeline / Gantt Chart
- Gantt-style timeline view for tasks with start/end dates
- Drag to resize task duration
- Drag to reschedule
- Dependency arrows (task A blocks task B)
- Milestone markers
- Zoom levels (day, week, month, quarter)
- Critical path highlighting
- Export as image/PDF

### Module 14: Team & Member Management
- Invite members via email (generates invite link)
- Role management: Owner, Admin, Member, Viewer
- Member list with role, status (active/pending), last active
- Remove member / change role
- User profile (avatar, name, email, timezone, notification preferences)
- Team activity feed
- Workload view (tasks assigned per member)

### Module 15: Activity & Audit Log
- Workspace-level activity stream
- Project-level activity stream
- Task-level activity log (every change tracked)
- Filter by: user, action type, date range
- Export activity log
- Tracked actions: create, update, delete, comment, status_change, assignment, sprint_change

### Module 16: Integrations
- GitHub: Link PRs to tasks, auto-update task status on PR merge
- Slack: Send notifications to Slack channels
- Webhook: Custom webhook for any event
- Integration settings page per workspace
- API key generation for external access

### Module 17: Settings & Preferences
- Workspace settings: name, logo, slug, default project template
- User settings: profile, avatar, theme, language, timezone
- Notification preferences matrix
- Keyboard shortcuts panel
- Dark / Light / System theme
- Language: EN / TR
- Data export (workspace data as JSON)
- Danger zone: leave workspace, delete workspace, delete account

### Module 18: Billing & Subscription (Stripe)
- Plan tiers: Free (5 members, 3 projects), Pro ($12/user/mo, unlimited), Enterprise (custom)
- Stripe Checkout integration
- Stripe Customer Portal (manage subscription)
- Usage-based limits enforcement
- Billing history & invoices
- Plan comparison page
- Upgrade/downgrade flow
- Trial period (14 days Pro)

---

## 4. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Auth ──────────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?
  image         String?
  timezone      String    @default("UTC")
  theme         String    @default("dark")
  lang          String    @default("en")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  memberships   WorkspaceMember[]
  assignedTasks Task[]           @relation("assignee")
  createdTasks  Task[]           @relation("creator")
  comments      Comment[]
  activities    Activity[]
  notifications Notification[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Workspace (Multi-Tenant) ──────────────────────────
model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  logo      String?
  plan      Plan     @default(FREE)
  stripeCustomerId   String?  @unique
  stripeSubId        String?  @unique
  trialEndsAt        DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members   WorkspaceMember[]
  projects  Project[]
  labels    Label[]
  invites   WorkspaceInvite[]
  webhooks  Webhook[]
  activities Activity[]
  notifications Notification[]
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

model WorkspaceMember {
  id          String        @id @default(cuid())
  userId      String
  workspaceId String
  role        WorkspaceRole @default(MEMBER)
  joinedAt    DateTime      @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model WorkspaceInvite {
  id          String   @id @default(cuid())
  email       String
  workspaceId String
  role        WorkspaceRole @default(MEMBER)
  token       String   @unique @default(cuid())
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([email, workspaceId])
}

// ─── Projects ──────────────────────────────────────────
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  key         String   // e.g. "NXF" — auto-generated
  icon        String?
  color       String   @default("#6366f1")
  workspaceId String
  archived    Boolean  @default(false)
  taskCounter Int      @default(0) // for NXF-1, NXF-2...
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tasks     Task[]
  columns   Column[]
  sprints   Sprint[]
  favorites ProjectFavorite[]

  @@unique([key, workspaceId])
}

model ProjectFavorite {
  id        String @id @default(cuid())
  userId    String
  projectId String

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

// ─── Kanban Columns ────────────────────────────────────
model Column {
  id        String @id @default(cuid())
  name      String
  order     Int
  color     String @default("#6366f1")
  wipLimit  Int?   // work in progress limit
  projectId String

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks   Task[]
}

// ─── Tasks / Issues ────────────────────────────────────
model Task {
  id          String    @id @default(cuid())
  title       String
  description String?   // markdown
  number      Int       // auto-increment per project
  status      TaskStatus @default(BACKLOG)
  priority    Priority   @default(NONE)
  estimate    Float?     // story points
  dueDate     DateTime?
  startDate   DateTime?
  position    Int        @default(0)  // order within column
  projectId   String
  columnId    String?
  assigneeId  String?
  creatorId   String
  parentId    String?    // sub-task parent
  sprintId    String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  project  Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  column   Column?  @relation(fields: [columnId], references: [id], onDelete: SetNull)
  assignee User?    @relation("assignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  creator  User     @relation("creator", fields: [creatorId], references: [id])
  parent   Task?    @relation("subtasks", fields: [parentId], references: [id], onDelete: SetNull)
  children Task[]   @relation("subtasks")
  sprint   Sprint?  @relation(fields: [sprintId], references: [id], onDelete: SetNull)

  labels      TaskLabel[]
  comments    Comment[]
  attachments Attachment[]
  activities  Activity[]
  dependencies TaskDependency[] @relation("dependent")
  blockedBy    TaskDependency[] @relation("blocker")
}

enum TaskStatus {
  BACKLOG
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
  CANCELLED
}

enum Priority {
  URGENT
  HIGH
  MEDIUM
  LOW
  NONE
}

model TaskDependency {
  id          String @id @default(cuid())
  dependentId String // task that is blocked
  blockerId   String // task that blocks

  dependent Task @relation("dependent", fields: [dependentId], references: [id], onDelete: Cascade)
  blocker   Task @relation("blocker", fields: [blockerId], references: [id], onDelete: Cascade)

  @@unique([dependentId, blockerId])
}

// ─── Labels ────────────────────────────────────────────
model Label {
  id          String @id @default(cuid())
  name        String
  color       String @default("#6366f1")
  workspaceId String

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tasks     TaskLabel[]

  @@unique([name, workspaceId])
}

model TaskLabel {
  taskId  String
  labelId String

  task  Task  @relation(fields: [taskId], references: [id], onDelete: Cascade)
  label Label @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@id([taskId, labelId])
}

// ─── Comments ──────────────────────────────────────────
model Comment {
  id        String   @id @default(cuid())
  content   String   // markdown
  taskId    String
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id])
}

// ─── Attachments ───────────────────────────────────────
model Attachment {
  id        String   @id @default(cuid())
  name      String
  url       String
  size      Int      // bytes
  type      String   // mime type
  taskId    String
  createdAt DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

// ─── Sprints ───────────────────────────────────────────
model Sprint {
  id          String       @id @default(cuid())
  name        String
  goal        String?
  startDate   DateTime
  endDate     DateTime
  status      SprintStatus @default(PLANNING)
  projectId   String
  retroNotes  String?      // markdown
  createdAt   DateTime     @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks   Task[]
}

enum SprintStatus {
  PLANNING
  ACTIVE
  COMPLETED
}

// ─── Activity Log ──────────────────────────────────────
model Activity {
  id          String   @id @default(cuid())
  action      String   // created, updated, status_changed, assigned, commented, etc.
  entity      String   // task, project, sprint, member
  entityId    String
  details     Json?    // { field: "status", from: "TODO", to: "DONE" }
  userId      String
  workspaceId String
  taskId      String?
  createdAt   DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id])
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  task      Task?     @relation(fields: [taskId], references: [id], onDelete: SetNull)
}

// ─── Notifications ─────────────────────────────────────
model Notification {
  id          String   @id @default(cuid())
  type        String   // assigned, mentioned, status_changed, comment, due_soon
  title       String
  message     String?
  read        Boolean  @default(false)
  link        String?  // deep link to entity
  userId      String
  workspaceId String
  createdAt   DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

// ─── Webhooks (Integrations) ───────────────────────────
model Webhook {
  id          String   @id @default(cuid())
  url         String
  events      String[] // task.created, task.updated, etc.
  secret      String
  active      Boolean  @default(true)
  workspaceId String
  createdAt   DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}
```

---

## 5. API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Email/password registration |
| POST | `/api/auth/[...nextauth]` | NextAuth handler (OAuth, credentials, magic link) |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/verify-email` | Verify email token |

### Workspaces
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/workspaces` | List user's workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/[slug]` | Get workspace details |
| PATCH | `/api/workspaces/[slug]` | Update workspace |
| DELETE | `/api/workspaces/[slug]` | Delete workspace |
| GET | `/api/workspaces/[slug]/members` | List members |
| POST | `/api/workspaces/[slug]/invite` | Invite member |
| DELETE | `/api/workspaces/[slug]/members/[id]` | Remove member |
| PATCH | `/api/workspaces/[slug]/members/[id]` | Change role |
| POST | `/api/invites/accept` | Accept invite via token |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/workspaces/[slug]/projects` | List projects |
| POST | `/api/workspaces/[slug]/projects` | Create project |
| GET | `/api/workspaces/[slug]/projects/[key]` | Get project |
| PATCH | `/api/workspaces/[slug]/projects/[key]` | Update project |
| DELETE | `/api/workspaces/[slug]/projects/[key]` | Delete project |
| POST | `/api/workspaces/[slug]/projects/[key]/favorite` | Toggle favorite |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/workspaces/[slug]/tasks` | List tasks (filterable, sortable, paginated) |
| POST | `/api/workspaces/[slug]/tasks` | Create task |
| GET | `/api/workspaces/[slug]/tasks/[id]` | Get task detail |
| PATCH | `/api/workspaces/[slug]/tasks/[id]` | Update task |
| DELETE | `/api/workspaces/[slug]/tasks/[id]` | Delete task |
| POST | `/api/workspaces/[slug]/tasks/[id]/comments` | Add comment |
| GET | `/api/workspaces/[slug]/tasks/[id]/comments` | List comments |
| POST | `/api/workspaces/[slug]/tasks/[id]/attachments` | Upload attachment |
| PATCH | `/api/workspaces/[slug]/tasks/bulk` | Bulk update tasks |

### Columns (Kanban)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/workspaces/[slug]/projects/[key]/columns` | List columns |
| POST | `/api/workspaces/[slug]/projects/[key]/columns` | Create column |
| PATCH | `/api/workspaces/[slug]/projects/[key]/columns/[id]` | Update column |
| DELETE | `/api/workspaces/[slug]/projects/[key]/columns/[id]` | Delete column |
| PATCH | `/api/workspaces/[slug]/projects/[key]/columns/reorder` | Reorder columns |

### Sprints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/workspaces/[slug]/projects/[key]/sprints` | List sprints |
| POST | `/api/workspaces/[slug]/projects/[key]/sprints` | Create sprint |
| PATCH | `/api/workspaces/[slug]/projects/[key]/sprints/[id]` | Update sprint |
| POST | `/api/workspaces/[slug]/projects/[key]/sprints/[id]/complete` | Complete sprint |

### Labels
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/workspaces/[slug]/labels` | List labels |
| POST | `/api/workspaces/[slug]/labels` | Create label |
| PATCH | `/api/workspaces/[slug]/labels/[id]` | Update label |
| DELETE | `/api/workspaces/[slug]/labels/[id]` | Delete label |

### Notifications
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notifications` | List notifications |
| PATCH | `/api/notifications/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| GET | `/api/notifications/stream` | SSE real-time stream |

### Analytics
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/workspaces/[slug]/analytics/overview` | Workspace overview stats |
| GET | `/api/workspaces/[slug]/analytics/burndown` | Sprint burndown data |
| GET | `/api/workspaces/[slug]/analytics/velocity` | Sprint velocity data |
| GET | `/api/workspaces/[slug]/analytics/workload` | Team workload data |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/generate-tasks` | Generate sub-tasks from description |
| POST | `/api/ai/summarize` | Summarize project/sprint status |
| POST | `/api/ai/improve-text` | Improve/expand/shorten text |
| POST | `/api/ai/suggest-priority` | Suggest priority for task |
| POST | `/api/ai/standup` | Generate daily standup report |

### Billing (Stripe)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/billing/checkout` | Create Stripe checkout session |
| POST | `/api/billing/portal` | Create customer portal session |
| POST | `/api/billing/webhook` | Stripe webhook handler |
| GET | `/api/billing/status` | Get current plan & usage |

### Integrations
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/workspaces/[slug]/webhooks` | Create webhook |
| GET | `/api/workspaces/[slug]/webhooks` | List webhooks |
| DELETE | `/api/workspaces/[slug]/webhooks/[id]` | Delete webhook |

---

## 6. File / Folder Structure

```
saas-pm-tool/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── layout.tsx                    # Auth layout (centered card)
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Dashboard layout (sidebar + topbar)
│   │   ├── page.tsx                      # Redirect to workspace or onboarding
│   │   ├── onboarding/page.tsx           # First-time setup wizard
│   │   └── w/[slug]/
│   │       ├── page.tsx                  # Workspace dashboard
│   │       ├── projects/
│   │       │   ├── page.tsx              # Project list
│   │       │   └── [key]/
│   │       │       ├── page.tsx          # Redirect to board
│   │       │       ├── board/page.tsx    # Kanban board
│   │       │       ├── list/page.tsx     # List/table view
│   │       │       ├── timeline/page.tsx # Gantt chart
│   │       │       ├── sprints/page.tsx  # Sprint management
│   │       │       └── settings/page.tsx # Project settings
│   │       ├── my-tasks/page.tsx         # Personal task list
│   │       ├── analytics/page.tsx        # Analytics dashboard
│   │       ├── activity/page.tsx         # Activity feed
│   │       ├── members/page.tsx          # Team management
│   │       ├── settings/
│   │       │   ├── page.tsx              # General workspace settings
│   │       │   ├── members/page.tsx      # Member settings
│   │       │   ├── billing/page.tsx      # Billing & subscription
│   │       │   ├── integrations/page.tsx # Integrations
│   │       │   └── notifications/page.tsx # Notification preferences
│   │       └── labels/page.tsx           # Label management
│   ├── invite/[token]/page.tsx           # Accept invite page
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── auth/register/route.ts
│   │   ├── auth/forgot-password/route.ts
│   │   ├── auth/reset-password/route.ts
│   │   ├── auth/verify-email/route.ts
│   │   ├── workspaces/route.ts
│   │   ├── workspaces/[slug]/route.ts
│   │   ├── workspaces/[slug]/members/route.ts
│   │   ├── workspaces/[slug]/members/[id]/route.ts
│   │   ├── workspaces/[slug]/invite/route.ts
│   │   ├── workspaces/[slug]/projects/route.ts
│   │   ├── workspaces/[slug]/projects/[key]/route.ts
│   │   ├── workspaces/[slug]/projects/[key]/columns/route.ts
│   │   ├── workspaces/[slug]/projects/[key]/columns/[id]/route.ts
│   │   ├── workspaces/[slug]/projects/[key]/columns/reorder/route.ts
│   │   ├── workspaces/[slug]/projects/[key]/sprints/route.ts
│   │   ├── workspaces/[slug]/projects/[key]/sprints/[id]/route.ts
│   │   ├── workspaces/[slug]/projects/[key]/sprints/[id]/complete/route.ts
│   │   ├── workspaces/[slug]/tasks/route.ts
│   │   ├── workspaces/[slug]/tasks/[id]/route.ts
│   │   ├── workspaces/[slug]/tasks/[id]/comments/route.ts
│   │   ├── workspaces/[slug]/tasks/[id]/attachments/route.ts
│   │   ├── workspaces/[slug]/tasks/bulk/route.ts
│   │   ├── workspaces/[slug]/labels/route.ts
│   │   ├── workspaces/[slug]/labels/[id]/route.ts
│   │   ├── workspaces/[slug]/webhooks/route.ts
│   │   ├── workspaces/[slug]/webhooks/[id]/route.ts
│   │   ├── workspaces/[slug]/analytics/overview/route.ts
│   │   ├── workspaces/[slug]/analytics/burndown/route.ts
│   │   ├── workspaces/[slug]/analytics/velocity/route.ts
│   │   ├── workspaces/[slug]/analytics/workload/route.ts
│   │   ├── notifications/route.ts
│   │   ├── notifications/read/route.ts
│   │   ├── notifications/read-all/route.ts
│   │   ├── notifications/stream/route.ts
│   │   ├── ai/generate-tasks/route.ts
│   │   ├── ai/summarize/route.ts
│   │   ├── ai/improve-text/route.ts
│   │   ├── ai/suggest-priority/route.ts
│   │   ├── ai/standup/route.ts
│   │   ├── billing/checkout/route.ts
│   │   ├── billing/portal/route.ts
│   │   ├── billing/webhook/route.ts
│   │   ├── billing/status/route.ts
│   │   └── invites/accept/route.ts
│   ├── layout.tsx                         # Root layout
│   ├── global.css
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── WorkspaceSwitcher.tsx
│   │   ├── ProjectNav.tsx
│   │   └── MobileBottomNav.tsx
│   ├── board/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── ColumnHeader.tsx
│   │   └── QuickAddTask.tsx
│   ├── tasks/
│   │   ├── TaskModal.tsx                  # Slide-over detail
│   │   ├── TaskRow.tsx                    # List view row
│   │   ├── TaskForm.tsx                   # Create/edit form
│   │   ├── TaskComments.tsx
│   │   ├── TaskActivity.tsx
│   │   ├── TaskAttachments.tsx
│   │   ├── SubtaskList.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   └── AssigneeAvatar.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   └── CreateProjectModal.tsx
│   ├── sprints/
│   │   ├── SprintBoard.tsx
│   │   ├── SprintCard.tsx
│   │   ├── SprintBurndown.tsx
│   │   ├── SprintVelocity.tsx
│   │   └── CompleteSprintModal.tsx
│   ├── analytics/
│   │   ├── OverviewCards.tsx
│   │   ├── BurndownChart.tsx
│   │   ├── VelocityChart.tsx
│   │   ├── WorkloadChart.tsx
│   │   ├── TaskDistribution.tsx
│   │   ├── ActivityHeatmap.tsx
│   │   └── CycleTimeChart.tsx
│   ├── timeline/
│   │   ├── GanttChart.tsx
│   │   ├── GanttRow.tsx
│   │   ├── GanttMilestone.tsx
│   │   └── TimelineHeader.tsx
│   ├── ai/
│   │   ├── AiTaskGenerator.tsx
│   │   ├── AiSummary.tsx
│   │   ├── AiWritingAssistant.tsx
│   │   └── AiStandup.tsx
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationPanel.tsx
│   │   └── NotificationItem.tsx
│   ├── billing/
│   │   ├── PlanCard.tsx
│   │   ├── PricingTable.tsx
│   │   └── UsageBar.tsx
│   ├── ui/                                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── tooltip.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── command.tsx                    # Command palette
│   │   ├── dropdown-menu.tsx
│   │   ├── popover.tsx
│   │   ├── calendar.tsx
│   │   ├── sheet.tsx                      # Slide-over panel
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── sonner.tsx
│   │   └── ... (other shadcn components)
│   └── shared/
│       ├── EmptyState.tsx
│       ├── CommandPalette.tsx
│       ├── ThemeToggle.tsx
│       ├── LanguageToggle.tsx
│       ├── LiveCursors.tsx
│       ├── PresenceIndicator.tsx
│       ├── MarkdownEditor.tsx
│       ├── MarkdownPreview.tsx
│       ├── FilterBuilder.tsx
│       ├── ConfirmDialog.tsx
│       └── FileUpload.tsx
├── hooks/
│   ├── useWorkspace.ts                    # Current workspace context
│   ├── useProject.ts                      # Current project context
│   ├── useTasks.ts                        # Task CRUD + filters
│   ├── useKanban.ts                       # Board state + DnD logic
│   ├── useRealtime.ts                     # Pusher subscription
│   ├── usePresence.ts                     # Online presence
│   ├── useNotifications.ts                # Notification state
│   ├── useKeyboardShortcuts.ts
│   ├── useFilterBuilder.ts
│   ├── useDebounce.ts
│   └── useMediaQuery.ts
├── lib/
│   ├── prisma.ts                          # Prisma client singleton
│   ├── auth.ts                            # NextAuth config
│   ├── auth-options.ts                    # Auth providers
│   ├── rbac.ts                            # Role permission checks
│   ├── pusher.ts                          # Pusher server client
│   ├── pusher-client.ts                   # Pusher browser client
│   ├── ai.ts                              # OpenAI client + helpers
│   ├── stripe.ts                          # Stripe client + helpers
│   ├── email.ts                           # Resend email client
│   ├── upload.ts                          # File upload helpers
│   ├── activity.ts                        # Activity log helper
│   ├── notifications.ts                   # Create notification helper
│   ├── rate-limit.ts
│   ├── validations.ts                     # Zod schemas
│   ├── utils.ts                           # General utilities
│   └── constants.ts                       # Plan limits, colors, etc.
├── providers/
│   ├── Providers.tsx                      # Root provider wrapper
│   ├── ThemeProvider.tsx
│   ├── WorkspaceProvider.tsx              # Current workspace context
│   └── RealtimeProvider.tsx               # Pusher connection provider
├── store/
│   ├── useTaskStore.ts                    # Zustand task state
│   ├── useFilterStore.ts                  # Filter state
│   └── useBoardStore.ts                   # Kanban board state
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   ├── manifest.json
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   └── og-image.png
├── e2e/
│   ├── auth.spec.ts
│   ├── board.spec.ts
│   ├── tasks.spec.ts
│   └── workspace.spec.ts
├── emails/
│   ├── invite.tsx                         # React Email template
│   ├── welcome.tsx
│   ├── reset-password.tsx
│   └── notification-digest.tsx
├── .env.example
├── .gitignore
├── .github/workflows/ci.yml
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
├── vitest.config.ts
├── package.json
└── README.md
```

---

## 7. Page-by-Page UI Design

### 7.1 Login Page (`/login`)
- Centered card with logo
- Email + password fields
- "Continue with Google" + "Continue with GitHub" OAuth buttons
- "Sign in with Magic Link" option
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Dark gradient background with subtle grid

### 7.2 Register Page (`/register`)
- Centered card: name, email, password, confirm password
- OAuth buttons
- Password strength indicator
- Terms & Privacy checkbox
- Auto-login after registration

### 7.3 Onboarding (`/onboarding`)
- 3-step wizard with progress indicator:
  1. **Create Workspace**: Name, slug (auto-generated), logo upload
  2. **Invite Team**: Email input (multiple), skip option
  3. **Create First Project**: Name, key, template selection
- Animated transitions between steps

### 7.4 Workspace Dashboard (`/w/[slug]`)
- Top KPI row: Active Projects, Open Tasks, Overdue, Completed This Week
- Recent Activity feed (last 10 activities)
- My Tasks widget (assigned to current user)
- Task distribution pie chart (by status)
- Team workload bar chart
- Quick action buttons: New Project, New Task

### 7.5 Project List (`/w/[slug]/projects`)
- Toggle: Card view / Table view
- Project cards: icon, name, task count, progress bar, members avatars, last activity
- Sort: name, created, last updated
- "New Project" button → modal
- Favorited projects pinned to top with star icon

### 7.6 Kanban Board (`/w/[slug]/projects/[key]/board`)
- Horizontal scrollable columns
- Column header: name, task count, WIP limit badge, "+" add task button
- Draggable cards between columns
- Card: title, assignee avatar, priority dot, due date badge, sub-task progress (2/5), label dots
- Swimlane toggle dropdown
- Quick filter bar: assignee, priority, label
- Real-time: cards move when other users drag them
- Column menu: rename, set WIP limit, delete

### 7.7 List View (`/w/[slug]/projects/[key]/list`)
- Spreadsheet-like table
- Columns: ID, Title, Status, Priority, Assignee, Labels, Due Date, Estimate, Created
- Click to sort any column
- Inline edit: click cell to edit
- Checkbox for bulk selection
- Group by dropdown: None, Status, Priority, Assignee
- Floating bulk action bar when items selected

### 7.8 Task Detail (Modal / Slide-over)
- Left panel (wide): Title (editable), Description (markdown editor), Sub-tasks list, Comments, Activity log
- Right panel (narrow): Status select, Priority select, Assignee select, Labels multi-select, Due date picker, Start date picker, Sprint select, Estimate input, Copy link button, Delete button
- Comment box with @mention autocomplete
- Activity timeline: "John changed status from Todo to In Progress — 2h ago"
- Attachment upload zone (drag & drop)

### 7.9 Sprint Management (`/w/[slug]/projects/[key]/sprints`)
- Sprint list: current sprint highlighted
- Sprint card: name, date range, progress bar, task count
- Active sprint → shows mini Kanban board
- "Complete Sprint" → modal: move incomplete tasks to next sprint or backlog
- Burndown chart for active sprint
- "Start Sprint" / "Create Sprint" buttons
- Sprint retrospective notes (markdown editor)

### 7.10 Timeline / Gantt (`/w/[slug]/projects/[key]/timeline`)
- Left panel: task list with hierarchy
- Right panel: horizontal timeline bars
- Drag bars to resize (change dates)
- Dependency arrows between tasks
- Zoom: Day / Week / Month / Quarter
- Today line (red vertical)
- Milestone diamonds
- Scroll horizontal with mouse wheel

### 7.11 Analytics (`/w/[slug]/analytics`)
- Date range picker
- Overview KPIs: Total Tasks, Completion Rate, Avg Cycle Time, Active Members
- Burndown chart (if sprint active)
- Velocity chart (last 6 sprints)
- Task distribution by status (donut chart)
- Task distribution by priority (bar chart)
- Workload per member (horizontal bar)
- Activity heatmap (GitHub-style 52-week grid)
- Completion trend line chart

### 7.12 Activity Feed (`/w/[slug]/activity`)
- Timeline of all workspace activities
- Avatar + "User did X on Entity — time ago"
- Filter by: user, action type, project
- Infinite scroll
- Activity types with icons and colors

### 7.13 Members (`/w/[slug]/members`)
- Member list: avatar, name, email, role badge, joined date, last active
- "Invite" button → email input modal
- Pending invites list
- Change role dropdown
- Remove member (with confirmation)
- Current user role indicator

### 7.14 Settings Pages
- **General**: Workspace name, slug, logo, delete workspace
- **Members**: Same as member page
- **Billing**: Current plan, usage stats, upgrade/downgrade, billing history
- **Integrations**: GitHub, Slack, Webhooks list
- **Notifications**: Matrix of notification types × delivery methods

### 7.15 My Tasks (`/w/[slug]/my-tasks`)
- Personal task list (assigned to current user)
- Grouped by: Overdue, Today, Upcoming, No Date
- Quick status toggle
- Priority badges
- Link to task detail

---

## 8. AI Features Detail

### 8.1 AI Task Generator
- **Input**: Text description of a feature/epic
- **Output**: Structured list of tasks with title, description, priority, estimate
- **UI**: Modal with textarea → "Generate" button → streaming response → confirm/edit → create all
- **Prompt**: "Break down this feature into actionable development tasks. For each task provide: title (concise), description (1-2 sentences), priority (High/Medium/Low), estimate in story points (1/2/3/5/8)."

### 8.2 AI Summary
- **Input**: Project ID or Sprint ID
- **Output**: Natural language summary of progress, blockers, stats
- **UI**: "AI Summary" button on project/sprint page → streaming text card
- **Data**: Fetches tasks, recent activity, completion rates → feeds as context

### 8.3 AI Writing Assistant
- **Input**: Selected text + action (improve/expand/shorten/fix grammar)
- **Output**: Improved text
- **UI**: Floating toolbar on text selection in markdown editor
- **Streaming**: Yes, character by character

### 8.4 AI Priority Suggestion
- **Input**: Task title + description
- **Output**: Suggested priority with reasoning
- **UI**: Small "AI" badge button next to priority selector → tooltip with suggestion

### 8.5 AI Daily Standup
- **Input**: User's activity from last 24h
- **Output**: Formatted standup report (Yesterday / Today / Blockers)
- **UI**: "Generate Standup" button on personal dashboard → copy to clipboard

---

## 9. Auth & RBAC

### Role Permissions Matrix

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Manage workspace settings | Yes | Yes | No | No |
| Manage billing | Yes | No | No | No |
| Invite/remove members | Yes | Yes | No | No |
| Create project | Yes | Yes | Yes | No |
| Delete project | Yes | Yes | No | No |
| Create/edit task | Yes | Yes | Yes | No |
| Delete task | Yes | Yes | No | No |
| Change task status | Yes | Yes | Yes | No |
| Add comment | Yes | Yes | Yes | Yes |
| View tasks | Yes | Yes | Yes | Yes |
| View analytics | Yes | Yes | Yes | Yes |
| Manage labels | Yes | Yes | Yes | No |
| Manage sprints | Yes | Yes | Yes | No |
| Manage integrations | Yes | Yes | No | No |

### Middleware Implementation
```typescript
// lib/rbac.ts
type Permission = 'workspace:manage' | 'workspace:billing' | 'members:manage'
  | 'project:create' | 'project:delete' | 'task:create' | 'task:delete'
  | 'task:update_status' | 'comment:create' | 'view:all'
  | 'label:manage' | 'sprint:manage' | 'integration:manage';

const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  OWNER: ['*'], // all permissions
  ADMIN: ['workspace:manage', 'members:manage', 'project:create', 'project:delete',
          'task:create', 'task:delete', 'task:update_status', 'comment:create',
          'view:all', 'label:manage', 'sprint:manage', 'integration:manage'],
  MEMBER: ['project:create', 'task:create', 'task:update_status', 'comment:create',
           'view:all', 'label:manage', 'sprint:manage'],
  VIEWER: ['comment:create', 'view:all'],
};
```

---

## 10. Implementation Roadmap (Phase-by-Phase)

### Phase 1: Foundation (Session 1-2)
1. `npx create-next-app@latest` with TypeScript, Tailwind, App Router
2. Install: shadcn/ui, prisma, next-auth, framer-motion, zustand, zod, @dnd-kit, recharts, sonner, lucide-react
3. Set up Prisma schema + Neon PostgreSQL
4. Set up NextAuth (credentials + Google + GitHub)
5. Create auth pages (login, register, forgot password)
6. Global CSS, theme system (dark/light), layout foundation

### Phase 2: Core Layout & Workspace (Session 3-4)
7. Sidebar component with workspace switcher
8. TopBar with search, notifications bell, user menu
9. Workspace CRUD API
10. Multi-tenant middleware (verify user belongs to workspace)
11. Onboarding wizard (create workspace → invite → first project)
12. RBAC system

### Phase 3: Projects & Tasks (Session 5-6)
13. Project CRUD API + UI (list, create modal, settings)
14. Task CRUD API + UI (list view with table)
15. Task detail slide-over modal
16. Labels CRUD
17. Comments on tasks
18. File attachments

### Phase 4: Kanban Board (Session 7)
19. Kanban board UI with @dnd-kit
20. Column management (create, reorder, WIP limits)
21. Drag tasks between columns → auto status update
22. Quick add task inline
23. Swimlanes & quick filters

### Phase 5: Sprint Management (Session 8)
24. Sprint CRUD API + UI
25. Sprint board (filtered Kanban)
26. Complete sprint flow
27. Burndown chart
28. Velocity chart

### Phase 6: Real-time (Session 9)
29. Pusher setup (server + client)
30. Real-time task updates
31. Live cursors on board
32. Presence indicators (online/offline)
33. Typing indicators in comments

### Phase 7: AI Features (Session 10)
34. OpenAI client setup
35. AI Task Generator
36. AI Summary
37. AI Writing Assistant
38. AI Priority Suggestion
39. AI Daily Standup

### Phase 8: Analytics & Timeline (Session 11)
40. Analytics dashboard with charts
41. Activity heatmap
42. Gantt/Timeline view
43. Activity feed page

### Phase 9: Billing & Integrations (Session 12)
44. Stripe integration (checkout, portal, webhook)
45. Plan limits enforcement
46. GitHub integration (link PRs to tasks)
47. Webhook system
48. Notification preferences

### Phase 10: Polish & Deploy (Session 13)
49. Command palette (Ctrl+K)
50. Keyboard shortcuts
51. PWA manifest
52. Error boundaries + loading states
53. Seed data script
54. E2E tests
55. CI/CD pipeline
56. Docker setup
57. README with badges
58. Deploy to Vercel

---

## 11. Seed Data Plan

```typescript
// prisma/seed.ts
// 1. Users (5)
//    - admin@nexusflow.dev (Owner, password: Admin123!)
//    - sarah@nexusflow.dev (Admin)
//    - john@nexusflow.dev (Member)
//    - emily@nexusflow.dev (Member)
//    - viewer@nexusflow.dev (Viewer)
//
// 2. Workspaces (2)
//    - "NexusFlow Team" (slug: nexusflow, plan: PRO)
//    - "Side Project" (slug: side-project, plan: FREE)
//
// 3. Projects (3 in main workspace)
//    - "Platform v2.0" (key: PLT, 5 columns, 25 tasks)
//    - "Mobile App" (key: MOB, 5 columns, 15 tasks)
//    - "Marketing Site" (key: MKT, 5 columns, 10 tasks)
//
// 4. Labels (8)
//    - Bug (red), Feature (blue), Enhancement (cyan),
//    - Documentation (green), Design (purple), Performance (amber),
//    - Security (orange), Testing (teal)
//
// 5. Sprints (3 per project)
//    - Sprint 1 (completed), Sprint 2 (active), Sprint 3 (planning)
//
// 6. Tasks (50 total, distributed across projects)
//    - Various statuses, priorities, assignees
//    - Some with sub-tasks, comments, labels
//    - Some with dependencies
//
// 7. Activities (100+ entries)
// 8. Notifications (20 for admin user)
// 9. Comments (30 across tasks)
```

---

## 12. Testing Strategy

### Unit Tests (Vitest)
- lib/rbac.ts — permission checks
- lib/validations.ts — Zod schema validation
- lib/utils.ts — utility functions
- Store tests (Zustand)

### Integration Tests (Vitest)
- API route tests with mock Prisma
- Auth flow tests

### E2E Tests (Playwright)
- Auth: login, register, logout
- Workspace: create, switch, settings
- Project: create, open, settings
- Board: drag task, create column, quick add
- Task: create, edit, comment, change status
- Sprint: create, start, complete

### Coverage Target
- Unit: 80%+
- E2E: Critical paths covered

---

## 13. Deploy & CI/CD

### GitHub Actions (`ci.yml`)
```yaml
jobs:
  lint-and-build:
    - Checkout, setup Node 20, install deps
    - Run ESLint
    - Run Vitest
    - Build Next.js

  e2e:
    - PostgreSQL service container
    - Prisma migrate + seed
    - Playwright tests
```

### Vercel Deployment
- Connect GitHub repo → auto-deploy on push to `main`
- Environment variables in Vercel dashboard
- Preview deployments for PRs
- Production: custom domain `nexusflow.vercel.app`

### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# AI
OPENAI_API_KEY="sk-..."

# Real-time
PUSHER_APP_ID="..."
PUSHER_KEY="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="..."
NEXT_PUBLIC_PUSHER_CLUSTER="eu"

# Email
RESEND_API_KEY="re_..."

# Storage
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."

# Payments
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Monitoring
SENTRY_DSN="..."
```

---

## 14. README Content Outline

```markdown
# NexusFlow 🚀
> AI-Powered Project Management for Modern Teams

![Next.js](badge) ![TypeScript](badge) ![Prisma](badge) ![Tailwind](badge)

[Live Demo](link) · [Documentation](link) · [Report Bug](link)

## Screenshots
- Dashboard, Kanban Board, Task Detail, Analytics, AI Features

## Features
- ✅ Multi-tenant workspaces
- ✅ Kanban board with drag & drop
- ✅ Sprint management with burndown
- ✅ AI-powered task generation
- ✅ Real-time collaboration
- ✅ Gantt timeline view
- ... (full feature list)

## Tech Stack
(table)

## Quick Start
1. Clone → 2. Install → 3. Setup env → 4. Prisma migrate → 5. Seed → 6. Dev

## Docker
docker-compose up

## Login Credentials
| Role | Email | Password |
(seed users table)

## Project Structure
(tree)

## Keyboard Shortcuts
(table)

## Scripts
(npm scripts table)

## License
MIT
```

---

## 15. Key Architectural Decisions

1. **Multi-tenant via workspaceId**: Every query includes `workspaceId` filter. Middleware verifies membership.
2. **Optimistic updates**: Board drag operations update UI immediately, sync with server in background. Rollback on failure.
3. **Real-time channels**: `workspace-{id}` for global events, `project-{id}` for project events, `task-{id}` for task detail events.
4. **AI streaming**: Use `ReadableStream` + `TextEncoder` for streaming AI responses to client.
5. **Task numbering**: Atomic counter on Project model (`taskCounter++` in transaction) for unique sequential IDs.
6. **Slug routing**: Workspaces use URL slugs (`/w/my-team/projects`) for readable URLs.
7. **Zustand stores**: Client state for board, filters, UI state. Server state via React hooks with SWR pattern.
8. **Column-based status**: Tasks have both `status` (enum) and `columnId`. Moving between columns auto-updates status. Custom columns map to statuses.
