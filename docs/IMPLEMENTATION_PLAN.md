# Comprehensive Technical Implementation Plan
## Internal Team Management & Task Tracking Application (`km-scrum`)

---

## 1. Project Overview

The objective of this project is to build an internal, high-efficiency team management and task tracking application tailored specifically for an internal software engineering team. The application serves as a focused, lightweight alternative to complex platforms like JIRA.

### Target Personas & Primary Workflows
- **Manager**: Executive overseer and administrator. Manages user provisioning, reviews team workload, monitors high-level progress, and retains full override capability.
- **Scrum Master**: Operational workflow leader. Creates tasks, assigns daily work, manages priorities, unblocks developers, reviews requests, and tracks day-to-day delivery.
- **Developer**: Execution-focused contributor. Views their assigned daily tasks, updates progress with mandatory explanations, uploads build artifacts (such as APKs, videos, screenshots), and submits leave or private complaints.

The application operates within a **single internal workspace** with **zero multi-tenancy overhead**.

---

## 2. Confirmed Requirements vs. Out-of-Scope Features

### Confirmed Requirements
1. **Single Fullstack Architecture**: Next.js App Router (React 19, Tailwind CSS v4, shadcn/ui) with Server Components, Server Actions, and Route Handlers.
2. **Custom Authentication**: Custom username/password login with **Argon2id** password hashing, database-backed sessions with SHA-256 hashed tokens, secure `HttpOnly` cookies, and session invalidation. No external auth providers (no Clerk, Auth0, Firebase, or Supabase Auth).
3. **Manager-Driven User Provisioning**: No public registration. Manager creates user accounts with initial temporary credentials and can trigger password resets. Users change password on first login.
4. **Relational Database**: PostgreSQL hosted on **Neon**, with **Prisma ORM** for schema definition and migrations.
5. **Private File Storage**: Cloudflare R2 object storage with time-limited presigned upload (PUT) and download (GET) URLs. Metadata stored in PostgreSQL.
6. **Task Management & Board**: Complete task lifecycle with the 6 mandatory statuses: `To Do`, `In Progress`, `Pending`, `Testing`, `Released`, `Completed`.
7. **Mandatory Status Change Explanation**: Every status transition strictly requires an explanation. Status changes, previous state, new state, user, timestamp, and reason are permanently logged.
8. **Interactive Board & Drag-and-Drop**: `dnd-kit` drag-and-drop board with fractional index sorting and an optimistic modal interception that enforces reason submission before saving column moves.
9. **Daily & Monthly Planning Views**: Separate developer-centric daily task view, team-wide daily workload grid for SM/Manager, and monthly calendar distribution.
10. **Requests & Leave Management**: Developer leave applications (with calendar integration), confidential complaint submissions (strict developer isolation), and general issue tickets.
11. **Immutable Audit Logging**: Centralized, immutable `ActivityLog` capturing system actions, with comprehensive filtering (user, date, activity type, task, request).
12. **Role-Specific Dashboards**: Tailored views for Manager, Scrum Master, and Developer.
13. **Design System**: Dub-inspired border-first design system (`c:\Users\Support Team\Downloads\DESIGN.md`) with 1px `#e5e5e5` hairline borders, pure white surfaces (`#ffffff`), paper mist secondary containers (`#f5f5f5`), and Electric Blue (`#2563eb`) accents.

### Strictly Out-of-Scope (Forbidden Scope Creep)
- Multi-tenancy or organization onboarding.
- Task dependencies or Gantt charts (explicitly confirmed: **NO task dependencies**).
- Sprint poker or complex story point estimation algorithms.
- Punch-clock time-tracking or timesheet invoice generation.
- AI task summarization or auto-assignment.
- External third-party integrations (Slack, Discord, GitHub webhooks).
- Public signup or social login.

---

## 3. Technology Architecture & Repository Inspection

### Current Repository State (Inspected)
- **Framework**: Next.js `16.4.6` (React `19.3.0`, React DOM `19.3.0`)
- **Styling**: Tailwind CSS `4.3.3` with `@tailwindcss/turbopack`
- **Compiler Options**: TypeScript `^5`, `strict: true`, target `ES2017`
- **Current App Structure**: Basic `create-next-app` template (`app/page.tsx`, `app/layout.tsx`, `app/globals.css`).
- **Git Status**: Git repository not yet initialized.

### Core Stack Compatibility Validation
1. **Next.js 16 + React 19 Compatibility**: React 19 introduces native `useActionState` and Server Actions. We use standard server actions with Zod validation.
2. **Tailwind CSS v4 Integration**: Configured in `app/globals.css` with `@import "tailwindcss";` and `@theme inline`. The Dub tokens will be declared cleanly under `@theme`.
3. **Prisma ORM**: Compatible with Node.js runtime and Neon PostgreSQL connection string (`postgresql://...`).
4. **Argon2id**: Recommended package is `argon2` or `@node-rs/argon2` (pre-compiled native binaries for Node.js).
5. **AWS SDK v3 for Cloudflare R2**: `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for presigned URL generation.

---

## 4. Folder Structure & Architectural Boundaries

```
km-scrum/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── change-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── developer/page.tsx
│   │   ├── scrum-master/page.tsx
│   │   ├── manager/page.tsx
│   │   ├── manager/users/page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── planning/
│   │   │   ├── daily/page.tsx
│   │   │   └── monthly/page.tsx
│   │   ├── requests/
│   │   │   ├── page.tsx
│   │   │   ├── leaves/page.tsx
│   │   │   ├── complaints/page.tsx
│   │   │   └── tickets/page.tsx
│   │   └── activity-logs/page.tsx
│   ├── api/
│   │   ├── files/
│   │   │   ├── presign-upload/route.ts
│   │   │   └── download/[id]/route.ts
│   │   └── health/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                    # Base Radix / shadcn primitives
│   ├── layout/                # AppSidebar, Header, Breadcrumbs
│   ├── auth/                  # LoginForm, ChangePasswordModal
│   ├── tasks/                 # TaskBoard, TaskCard, StatusChangeModal, TaskDetail
│   ├── planning/              # DailyPicker, WorkloadGrid, MonthCalendar
│   ├── requests/              # LeaveModal, ComplaintModal, RequestDetail
│   ├── activity/              # ActivityFilters, ActivityTable
│   ├── files/                 # AttachmentUploader, FileList
│   └── dashboard/             # MetricCard, WorkloadChart, StatusBreakdown
├── lib/
│   ├── prisma.ts              # Prisma singleton
│   ├── r2.ts                  # Cloudflare R2 S3 client
│   ├── utils.ts               # cn, formatters
│   ├── auth/
│   │   ├── session.ts         # Session verification and cookies
│   │   ├── password.ts        # Argon2id hashing
│   │   └── permissions.ts     # RBAC matrix & guards
│   └── validations/           # Zod schemas
├── services/                  # Business logic & DB transactions
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── task.service.ts
│   ├── status.service.ts
│   ├── request.service.ts
│   ├── storage.service.ts
│   └── activity.service.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── docs/                      # Architectural specifications
├── middleware.ts              # Session & route authentication guard
├── package.json
└── tsconfig.json
```

---

## 5. Database Entities & Relationships

For the full data dictionary and column-level constraints, see [DATABASE_DESIGN.md](file:///c:/Users/Support%20Team/Documents/HMV/km-scrum/docs/DATABASE_DESIGN.md).

### Summary of Entities
1. **`User`**: System identity (`id`, `username`, `password_hash`, `full_name`, `email`, `role`, `is_active`, `must_change_password`, timestamps).
2. **`Session`**: Active login sessions (`id`, `token_hash`, `user_id`, `expires_at`, `ip_address`, `user_agent`, `created_at`).
3. **`Task`**: Work items (`id`, `task_code`, `title`, `description`, `assigned_to_id`, `created_by_id`, `priority`, `status`, `scheduled_date`, `due_date`, `order_index`, `is_archived`, timestamps).
4. **`TaskStatusHistory`**: Immutable log of transitions (`id`, `task_id`, `previous_status`, `new_status`, `changed_by_id`, `reason`, `created_at`).
5. **`Attachment`**: R2 file metadata (`id`, `task_id`, `file_name`, `file_key`, `file_size`, `mime_type`, `uploaded_by_id`, `created_at`).
6. **`Request`**: Developer tickets (`id`, `request_code`, `user_id`, `category`, `subject`, `description`, `leave_type`, `start_date`, `end_date`, `status`, `reviewed_by_id`, `reviewer_remarks`, timestamps).
7. **`RequestHistory`**: Request audit trail (`id`, `request_id`, `action`, `previous_status`, `new_status`, `changed_by_id`, `remarks`, `created_at`).
8. **`ActivityLog`**: Global immutable audit trail (`id`, `user_id`, `activity_type`, `task_id`, `request_id`, `description`, `previous_value`, `new_value`, `reason`, `ip_address`, `created_at`).
9. **`Notification`**: In-app alerts (`id`, `user_id`, `title`, `message`, `link`, `is_read`, `type`, `created_at`).

---

## 6. Role Permission Matrix & Enforcement

For the detailed matrix, see [ROLE_PERMISSIONS.md](file:///c:/Users/Support%20Team/Documents/HMV/km-scrum/docs/ROLE_PERMISSIONS.md).

### Core Role Boundaries
- **Developer**: Restricted strictly to their own assigned tasks, own personal activity history, and own requests/complaints. Can transition task status with a mandatory explanation. Cannot see other developers' tasks or complaints.
- **Scrum Master**: Manages task creation, assignments, priorities, status overrides, reviews developer requests, and views all developer activity logs and team workloads.
- **Manager**: Complete system authority. Only role authorized to create user accounts, deactivate users, reset passwords, archive/delete tasks, and access global administrative analytics.

---

## 7. Status Lifecycle & Transition Rules

The six exact statuses are:
`TO_DO` -> `IN_PROGRESS` -> `PENDING` -> `TESTING` -> `RELEASED` -> `COMPLETED`

### Rules
1. **Mandatory Explanation**: Every transition requires a non-empty `reason` string (minimum 5 characters).
2. **Developer Terminal Restriction**: Developers can move tasks up to `TESTING`. Moving a task to `RELEASED` or `COMPLETED` requires Scrum Master or Manager authorization.
3. **Atomic Recording**: The status update, `TaskStatusHistory` insert, and `ActivityLog` insert are executed within a single database transaction.

---

## 8. Complete 13-Phase Implementation Breakdown & Detailed Steps

Below is the complete catalog of 55 atomic, numbered implementation steps.

---

### Phase 0: Repository Inspection & Baseline Setup

#### STEP-001: Inspect Repository State & Scaffolding
- **Objective**: Verify existing Next.js 16 and Tailwind v4 installation, remove unnecessary starter boilerplate, and establish project directory structure.
- **Functionality**: Clean up default `app/page.tsx` and create empty folder structure matching the architecture specification (`app/(auth)`, `app/(dashboard)`, `components`, `lib`, `services`, `prisma`).
- **Files to Modify/Create**: `app/page.tsx`, create placeholder directories.
- **Existing to Inspect**: `package.json`, `next.config.ts`, `tsconfig.json`.
- **Database Changes**: None.
- **Dependencies**: None.
- **Expected UI**: Minimal placeholder screen confirming Next.js is functioning cleanly.
- **Backend Behaviour**: N/A.
- **Authorization**: None.
- **Validation**: `npm run build` succeeds without TypeScript or Turbopack errors.
- **Acceptance Criteria**: Repository is clean of starter templates; directory tree matches architectural layout.
- **Manual Testing**: Execute `npm run dev` and confirm server loads at `http://localhost:3000`.
- **Do NOT Modify**: `next.config.ts`, `tsconfig.json` compiler options.

#### STEP-002: Initialize Git & Environment Configuration Templates
- **Objective**: Initialize version control and configure strict environment variable isolation.
- **Functionality**: Run `git init`, ensure `.gitignore` excludes `.env`, `.env.local`, `node_modules`, and `.next`. Create `.env.example` documenting all required variables (`DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `SESSION_SECRET`).
- **Files to Modify/Create**: `.gitignore`, `.env.example`.
- **Database Changes**: None.
- **Dependencies**: None.
- **Validation**: Verify `.env.example` contains complete dummy template; `.env` is ignored by Git.
- **Acceptance Criteria**: Git repository is initialized; clean initial commit prepared.
- **Manual Testing**: Run `git status` to verify clean tracking.
- **Do NOT Modify**: Core package scripts.

#### STEP-003: Configure Tailwind v4 Dub Design Tokens
- **Objective**: Integrate the Dub Style Reference tokens into Tailwind v4 in `app/globals.css`.
- **Functionality**: Define custom `@theme` variables for colors (`--color-canvas-white`, `--color-paper-mist`, `--color-ash`, `--color-charcoal`, `--color-electric-blue`, `--color-deep-sapphire`, `--color-soft-mint`, `--color-tangerine`, `--color-lavender`), typography, 1px border defaults, and pill radii (`--radius-full: 9999px`).
- **Files to Modify/Create**: `app/globals.css`.
- **Existing to Inspect**: `c:\Users\Support Team\Downloads\DESIGN.md`.
- **Database Changes**: None.
- **Dependencies**: None.
- **Expected UI**: Page surfaces default to pure white `#ffffff`, typography defaults to dark charcoal `#171717`.
- **Acceptance Criteria**: Dub design tokens accessible as utility classes (e.g. `bg-canvas-white`, `border-ash`, `text-charcoal`, `text-electric-blue`).
- **Manual Testing**: Create a test badge and card with 1px `#e5e5e5` border and inspect styles in DevTools.
- **Do NOT Modify**: `@import "tailwindcss";` directive.

---

### Phase 1: Foundation, Design Tokens & Database Engine

#### STEP-004: Install & Configure Prisma with PostgreSQL
- **Objective**: Install Prisma ORM and generate schema scaffolding configured for PostgreSQL/Neon.
- **Functionality**: Install `prisma` and `@prisma/client`. Initialize `prisma/schema.prisma` with `provider = "postgresql"` and `url = env("DATABASE_URL")`.
- **Files to Modify/Create**: `prisma/schema.prisma`, `package.json`.
- **Database Changes**: Initializes Prisma directory.
- **Dependencies**: `prisma`, `@prisma/client`.
- **Backend Behaviour**: Ready for model definitions and migrations.
- **Acceptance Criteria**: `npx prisma validate` runs successfully.
- **Manual Testing**: Validate Prisma CLI recognizes `schema.prisma`.
- **Do NOT Modify**: Next.js routing configuration.

#### STEP-005: Create Database Client Singleton & Health Route
- **Objective**: Prevent connection leaks in Next.js development and provide health check endpoint.
- **Functionality**: Implement `lib/prisma.ts` with global client caching. Create `app/api/health/route.ts` that runs a `SELECT 1` query to test database connectivity.
- **Files to Modify/Create**: `lib/prisma.ts`, `app/api/health/route.ts`.
- **Database Changes**: None.
- **Backend Behaviour**: `GET /api/health` returns `{ status: "ok", timestamp: ... }` when database is connected.
- **Acceptance Criteria**: Database ping returns 200 OK.
- **Manual Testing**: Query `curl http://localhost:3000/api/health`.
- **Do NOT Modify**: Existing route configurations.

#### STEP-006: Set Up UI Component Foundation (shadcn/ui Primitives)
- **Objective**: Establish accessible, lightweight UI primitives styled according to the Dub design system.
- **Functionality**: Implement Button, Input, Dialog, DropdownMenu, Label, Badge, and Textarea primitives with 1px hairline borders and pill badges.
- **Files to Modify/Create**: `components/ui/*`, `lib/utils.ts` (`cn` helper using `clsx` and `tailwind-merge`).
- **Dependencies**: `clsx`, `tailwind-merge`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`.
- **Expected UI**: Minimalist, flat, border-defined components with 8px radius for buttons, 6px for inputs, 12px for cards.
- **Acceptance Criteria**: All components render with zero console warnings and pass accessibility tests.
- **Manual Testing**: Render component gallery on test page.
- **Do NOT Modify**: Tailwind core theme definitions.

#### STEP-007: Build Authenticated App Shell Layout
- **Objective**: Build responsive dashboard shell including sidebar navigation, top header, breadcrumbs, and user status profile.
- **Functionality**: Create `components/layout/AppSidebar.tsx`, `Header.tsx`, `Breadcrumbs.tsx`, and `app/(dashboard)/layout.tsx`. Sidebar highlights active links using soft blue accent (`#dbeaff` / `#2563eb`).
- **Files to Modify/Create**: `app/(dashboard)/layout.tsx`, `components/layout/*`.
- **Expected UI**: 240px clean sidebar with hairline right border (`1px solid #e5e5e5`), top navigation bar with user avatar and role badge.
- **Acceptance Criteria**: Shell responds to desktop, tablet, and mobile screen widths.
- **Manual Testing**: Resize browser window; toggle navigation links.
- **Do NOT Modify**: Auth layout components.

---

### Phase 2: Custom Authentication & User Administration

#### STEP-008: Define User and Session Prisma Models
- **Objective**: Create database models for custom authentication and user management.
- **Functionality**: Add `User`, `Session`, and `UserRole` enum (`MANAGER`, `SCRUM_MASTER`, `DEVELOPER`) to `prisma/schema.prisma` with appropriate unique constraints and indexes. Run `npx prisma migrate dev --name init_auth`.
- **Files to Modify/Create**: `prisma/schema.prisma`, `prisma/migrations/*`.
- **Database Changes**: Creates `User` and `Session` tables.
- **Acceptance Criteria**: Migration succeeds against Neon PostgreSQL.
- **Manual Testing**: Verify tables in Prisma Studio (`npx prisma studio`).
- **Do NOT Modify**: Existing database tables.

#### STEP-009: Implement Argon2id Password Hashing
- **Objective**: Implement secure password hashing and verification utilities.
- **Functionality**: Create `lib/auth/password.ts` with `hashPassword(plain)` and `verifyPassword(plain, hash)` using Argon2id with 64MB memory cost, 3 iterations, and parallelism 4.
- **Files to Modify/Create**: `lib/auth/password.ts`.
- **Dependencies**: `@node-rs/argon2` or `argon2`.
- **Backend Behaviour**: Returns secure encoded hash string; rejects invalid password comparison safely without timing leaks.
- **Acceptance Criteria**: Unit test confirms hashed passwords verify correctly; mismatched passwords return false.
- **Manual Testing**: Run test script to verify hashing and rejection.
- **Do NOT Modify**: UI components.

#### STEP-010: Build Database-Backed Session Engine
- **Objective**: Implement cryptographic session token generation, hashing, and cookie management.
- **Functionality**: Create `lib/auth/session.ts` with `createSession(userId)`, `validateSession(rawToken)`, and `invalidateSession(rawToken)`. Cookie `km_session` configured with `HttpOnly`, `SameSite=Lax`, `Secure` in production, `Path=/`, maxAge 7 days.
- **Files to Modify/Create**: `lib/auth/session.ts`.
- **Backend Behaviour**: Hashes token with SHA-256 before database insertion/lookup.
- **Acceptance Criteria**: Session stored in DB; raw token issued in cookie; validates active session; rejects expired session.
- **Manual Testing**: Simulate cookie token lookup and expiry in test script.
- **Do NOT Modify**: Existing auth routes.

#### STEP-011: Build Login Page & Server Action
- **Objective**: Deliver login interface and credential validation Server Action.
- **Functionality**: Create `app/(auth)/login/page.tsx` and `services/auth.service.ts`. Form collects `username` and `password`. Server Action verifies credentials, creates session, sets cookie, and redirects to `/dashboard`.
- **Files to Modify/Create**: `app/(auth)/login/page.tsx`, `components/auth/LoginForm.tsx`, `services/auth.service.ts`.
- **Validation**: Zod schema validating non-empty username and password. Rate limiting helper to prevent brute-force attacks.
- **Expected UI**: Clean, centered login card with hairline border, subtle input focus rings, and explicit error alert.
- **Acceptance Criteria**: Valid credentials log user in and set cookie; invalid credentials display "Invalid username or password".
- **Manual Testing**: Attempt login with wrong password (fails); attempt with valid credentials (redirects).
- **Do NOT Modify**: App shell layout.

#### STEP-012: Implement Next.js Edge Middleware for Route Protection
- **Objective**: Intercept requests to protect dashboard routes and enforce forced password changes.
- **Functionality**: Create `middleware.ts`. Validates session cookie on all `/(dashboard)/*` routes. Redirects unauthenticated users to `/login`. If user has `must_change_password = true`, forcefully redirects to `/change-password`.
- **Files to Modify/Create**: `middleware.ts`.
- **Backend Behaviour**: Injects session user info into request headers (`x-user-id`, `x-user-role`).
- **Acceptance Criteria**: Unauthenticated requests to `/dashboard` immediately redirect to `/login`; logged-in users cannot view `/login`.
- **Manual Testing**: Navigate directly to `/dashboard` in incognito browser; verify redirect.
- **Do NOT Modify**: Static asset handling.

#### STEP-013: Implement Manager User Administration & Initial Seed
- **Objective**: Allow Managers to create user accounts, assign roles, and trigger password resets.
- **Functionality**: Create `services/user.service.ts`, `app/(dashboard)/manager/users/page.tsx`, and `prisma/seed.ts` (seeds initial Manager account: `admin` / secure temporary password). Manager user creation sets `must_change_password = true`.
- **Files to Modify/Create**: `services/user.service.ts`, `app/(dashboard)/manager/users/page.tsx`, `prisma/seed.ts`.
- **Authorization**: Strict check: `session.user.role === 'MANAGER'`.
- **Expected UI**: Table of users with role badges, active status toggle, and "Reset Password" button triggering a confirmation modal.
- **Acceptance Criteria**: Manager can create a Developer; non-managers get 403 Forbidden.
- **Manual Testing**: Log in as Manager, create a Developer user, verify Developer appears in table.
- **Do NOT Modify**: Developer or SM views.

---

### Phase 3: Task Management Core (CRUD & Data Access)

#### STEP-014: Define Task Model & PostgreSQL Sequence
- **Objective**: Create Task entity with sequential human-readable codes (`KM-101`).
- **Functionality**: Add `Task`, `TaskPriority`, and `TaskStatus` enums to `prisma/schema.prisma`. Configure PostgreSQL sequence for `task_code`. Run migration.
- **Files to Modify/Create**: `prisma/schema.prisma`, `prisma/migrations/*`.
- **Database Changes**: Creates `Task` table and sequence.
- **Acceptance Criteria**: Tasks can store title, description, priority, status, scheduled date, and due date.
- **Manual Testing**: Insert a mock task using Prisma Studio and check sequential code generation.
- **Do NOT Modify**: Auth models.

#### STEP-015: Create Task Service with Scoped RBAC Queries
- **Objective**: Implement domain query and mutation functions enforcing role boundaries.
- **Functionality**: Create `services/task.service.ts` with `getTasks(filter, user)`, `getTaskById(id, user)`, `createTask(data, user)`, `updateTask(id, data, user)`, `archiveTask(id, user)`.
- **Authorization**: If `user.role === 'DEVELOPER'`, queries automatically append `WHERE assigned_to_id = user.id AND is_archived = false`.
- **Files to Modify/Create**: `services/task.service.ts`.
- **Acceptance Criteria**: Developers cannot retrieve tasks assigned to other users.
- **Manual Testing**: Unit test `getTasks` with Developer session vs Manager session.
- **Do NOT Modify**: User service.

#### STEP-016: Build Task Creation Modal & Server Action
- **Objective**: Allow Scrum Masters and Managers to create new tasks.
- **Functionality**: Create `components/tasks/CreateTaskModal.tsx` and Server Action `createTaskAction`. Fields: Title, Description, Assignee (dropdown of active developers), Priority, Scheduled Date, Optional Due Date.
- **Files to Modify/Create**: `components/tasks/CreateTaskModal.tsx`, `app/(dashboard)/tasks/new/page.tsx`.
- **Validation**: Zod schema: Title (min 3 chars), Description (min 10 chars), Scheduled Date (valid date).
- **Authorization**: Scrum Master and Manager only.
- **Expected UI**: Clean modal with Dub-styled inputs and primary CTA button.
- **Acceptance Criteria**: New task created with sequential `KM-xxx` code and `TO_DO` status.
- **Manual Testing**: Create task as SM; confirm creation and validation errors on empty fields.
- **Do NOT Modify**: Login or shell layout.

#### STEP-017: Build Task List & Filter Bar
- **Objective**: Deliver searchable and filterable task listing.
- **Functionality**: Create `app/(dashboard)/tasks/page.tsx` with filter bar (Status, Priority, Assignee, Scheduled Date, Search query).
- **Files to Modify/Create**: `app/(dashboard)/tasks/page.tsx`, `components/tasks/TaskList.tsx`, `components/tasks/TaskFilterBar.tsx`.
- **Expected UI**: Clean tabular/card list with pill badges for priority and status, formatted dates, and developer avatar.
- **Acceptance Criteria**: Filters update URL query parameters; list dynamically refetches.
- **Manual Testing**: Filter by "Critical" priority; verify only critical tasks appear.
- **Do NOT Modify**: Sidebar navigation.

#### STEP-018: Build Task Detail View
- **Objective**: Deliver comprehensive task inspection screen with editable metadata.
- **Functionality**: Create `app/(dashboard)/tasks/[id]/page.tsx`. Displays task code, title, description, assignee, priority, status, dates, and timestamps. Editable for SM/Manager; read-only for Developer.
- **Files to Modify/Create**: `app/(dashboard)/tasks/[id]/page.tsx`, `components/tasks/TaskDetailView.tsx`.
- **Authorization**: Developers can only open tasks assigned to them; returns 403 Forbidden otherwise.
- **Acceptance Criteria**: Full details displayed with appropriate editing controls based on role.
- **Manual Testing**: Open task as assignee (viewable); open as unassigned developer (access denied).
- **Do NOT Modify**: Auth middleware.

---

### Phase 4: Task Status Lifecycle & Mandatory History

#### STEP-019: Define TaskStatusHistory Model & Migration
- **Objective**: Create immutable table for status change audit logs.
- **Functionality**: Add `TaskStatusHistory` model to `prisma/schema.prisma` (`task_id`, `previous_status`, `new_status`, `changed_by_id`, `reason`, `created_at`). Run migration.
- **Files to Modify/Create**: `prisma/schema.prisma`, `prisma/migrations/*`.
- **Database Changes**: Creates `TaskStatusHistory` table with foreign keys.
- **Acceptance Criteria**: Foreign keys and indexes created successfully.
- **Manual Testing**: Verify table in Prisma Studio.
- **Do NOT Modify**: Task core schema.

#### STEP-020: Implement Status Transition Service with Atomic Transactions
- **Objective**: Implement status mutation logic guaranteeing audit history insertion.
- **Functionality**: Create `services/status.service.ts` with `transitionTaskStatus(taskId, newStatus, reason, user)`. Executes inside `prisma.$transaction`: updates `Task.status`, inserts `TaskStatusHistory`, inserts `ActivityLog`.
- **Authorization**: Developers can only move own tasks to `IN_PROGRESS`, `PENDING`, `TESTING`. Only SM/Manager can move to `RELEASED` or `COMPLETED`.
- **Validation**: Reason must be non-empty (minimum 5 characters).
- **Files to Modify/Create**: `services/status.service.ts`.
- **Acceptance Criteria**: State change fails completely if reason is missing or audit insertion fails.
- **Manual Testing**: Attempt transition without reason (rejected); test valid transition (both tables updated).
- **Do NOT Modify**: Task query service.

#### STEP-021: Build Mandatory Status Change Reason Dialog
- **Objective**: UI modal requiring user to input a clear explanation before any status change is persisted.
- **Functionality**: Create `components/tasks/StatusChangeModal.tsx`. Prompts: "Please explain the reason for changing status from [Old] to [New]". Requires text submission. Cancel button aborts transition.
- **Files to Modify/Create**: `components/tasks/StatusChangeModal.tsx`.
- **Expected UI**: Accessible Radix Dialog with textarea, character counter, and confirmation button.
- **Acceptance Criteria**: Status change cannot proceed without submitting this modal.
- **Manual Testing**: Trigger status change dropdown; verify modal appears and requires input.
- **Do NOT Modify**: Header layout.

#### STEP-022: Render Task Status History Timeline
- **Objective**: Display visual chronological audit trail on Task Detail page.
- **Functionality**: Create `components/tasks/TaskHistoryTimeline.tsx`. Displays each transition: author name, timestamp, badge of old -> new status, and quoted reason text.
- **Files to Modify/Create**: `components/tasks/TaskHistoryTimeline.tsx`, modify `app/(dashboard)/tasks/[id]/page.tsx`.
- **Expected UI**: Clean vertical timeline with hairline connecting line and pill status tags.
- **Acceptance Criteria**: Every past transition is visible in reverse-chronological order.
- **Manual Testing**: Perform 2 status changes on a task; verify both appear with correct reasons.
- **Do NOT Modify**: Task creation modal.

---

### Phase 5: Interactive Task Board & Drag-and-Drop

#### STEP-023: Install & Configure dnd-kit for Board Columns
- **Objective**: Integrate `@dnd-kit/core` and `@dnd-kit/sortable` for status column layout.
- **Functionality**: Install packages; build `components/tasks/TaskBoard.tsx` with 6 status columns (`To Do`, `In Progress`, `Pending`, `Testing`, `Released`, `Completed`).
- **Dependencies**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- **Files to Modify/Create**: `components/tasks/TaskBoard.tsx`, `components/tasks/BoardColumn.tsx`.
- **Expected UI**: 6 columns side-by-side with horizontal scroll on small screens; column headers display task counts.
- **Acceptance Criteria**: Board renders empty and populated columns smoothly.
- **Manual Testing**: Check layout rendering across screen resolutions.
- **Do NOT Modify**: List view components.

#### STEP-024: Build Draggable Task Card Component
- **Objective**: Create compact, informative task cards adhering to Dub design tokens.
- **Functionality**: Create `components/tasks/TaskCard.tsx`. Displays `task_code`, title, assignee avatar, priority badge, and attachment count icon.
- **Files to Modify/Create**: `components/tasks/TaskCard.tsx`.
- **Expected UI**: White surface, 1px `#e5e5e5` border, 12px radius, compact padding, grab cursor.
- **Acceptance Criteria**: Card can be picked up and dragged smoothly.
- **Manual Testing**: Test drag start and drop indicator styling.
- **Do NOT Modify**: Sidebar styling.

#### STEP-025: Implement Drag-and-Drop Status Change Interception
- **Objective**: Enforce mandatory reason dialog upon drag-and-drop column change before updating database.
- **Functionality**: In `TaskBoard.tsx`, `onDragEnd` checks if destination column differs from origin. If different:
  1. Hold card drop optimistically.
  2. Open `StatusChangeModal`.
  3. If user confirms with reason: execute Server Action and commit drop.
  4. If user cancels: revert card to original position with smooth snap-back.
- **Files to Modify/Create**: `components/tasks/TaskBoard.tsx`.
- **Acceptance Criteria**: Dragging to another status strictly requires reason dialog; cancelling snaps card back without database modification.
- **Manual Testing**: Drag card from "To Do" to "In Progress"; cancel modal (card snaps back); repeat and confirm with reason (card stays and DB updates).
- **Do NOT Modify**: Status service core rules.

#### STEP-026: Implement Column Reordering Persistence (Fractional Indexing)
- **Objective**: Persist task card ordering within columns.
- **Functionality**: Calculate new `order_index` between adjacent cards `(prev.order_index + next.order_index) / 2` upon reordering. Save via Server Action `reorderTaskAction`.
- **Files to Modify/Create**: `services/task.service.ts`, `components/tasks/TaskBoard.tsx`.
- **Acceptance Criteria**: Dragging within the same column persists order upon page reload without updating other tasks in the column.
- **Manual Testing**: Reorder two cards; refresh page; verify ordering is maintained.
- **Do NOT Modify**: History timeline components.

---

### Phase 6: Daily & Monthly Planning Engine

#### STEP-027: Build Developer Daily Task Dashboard
- **Objective**: Deliver dedicated daily view for Developers.
- **Functionality**: Create `app/(dashboard)/planning/daily/page.tsx` (or default developer home). Features a calendar date selector. Displays all tasks where `assigned_to_id = session.user.id AND scheduled_date = selectedDate`.
- **Files to Modify/Create**: `app/(dashboard)/planning/daily/page.tsx`, `components/planning/DailyDatePicker.tsx`, `components/planning/DeveloperTaskList.tsx`.
- **Authorization**: Developers can only see their own tasks for the selected date.
- **Expected UI**: Prominent date switcher (Today, Yesterday, Tomorrow, Custom Date), task summary metrics (Total, Completed, Pending, In Progress), and task cards.
- **Acceptance Criteria**: Developer sees exact tasks scheduled for selected date.
- **Manual Testing**: Select different dates; verify scheduled tasks filter accurately.
- **Do NOT Modify**: Scrum Master dashboard.

#### STEP-028: Build Scrum Master & Manager Team Daily Breakdown
- **Objective**: Provide comprehensive team-wide daily workload visibility for SM and Manager.
- **Functionality**: Create developer-wise grouped breakdown showing each developer's scheduled tasks for the chosen date. Highlights developers with 0 assigned tasks and developers on approved leave.
- **Files to Modify/Create**: `components/planning/TeamDailyBreakdown.tsx`, `services/planning.service.ts`.
- **Authorization**: Scrum Master and Manager only.
- **Expected UI**: Accordion or grid grouped by developer, showing task count, workload status, and leave badges.
- **Acceptance Criteria**: SM can quickly identify unassigned developers and overloaded developers for today.
- **Manual Testing**: Schedule tasks for Dev A and leave Dev B empty; confirm warning badge for Dev B.
- **Do NOT Modify**: Developer daily view.

#### STEP-029: Build Monthly Planning Calendar View
- **Objective**: High-level monthly distribution of work across developers.
- **Functionality**: Create `app/(dashboard)/planning/monthly/page.tsx`. Calendar view showing total tasks per day, filtered by developer or team-wide.
- **Files to Modify/Create**: `app/(dashboard)/planning/monthly/page.tsx`, `components/planning/MonthCalendar.tsx`.
- **Expected UI**: Monthly calendar grid with task count badges, click-to-expand day drawer, and developer filter dropdown.
- **Acceptance Criteria**: Month navigation correctly calculates days and task counts.
- **Manual Testing**: Navigate through months; verify task counts match database records.
- **Do NOT Modify**: Task board.

#### STEP-030: Implement Overdue Task Detection & Badges
- **Objective**: Highlight tasks whose `due_date < now()` and status is not `COMPLETED` or `RELEASED`.
- **Functionality**: Add overdue computation in `task.service.ts`. Render prominent red/amber indicator badge on overdue task cards in all views.
- **Files to Modify/Create**: `components/tasks/TaskCard.tsx`, `services/task.service.ts`.
- **Expected UI**: Subtle amber/red pill badge: `Overdue by X days`.
- **Acceptance Criteria**: Completed tasks are never flagged as overdue; past-due unfinished tasks are clearly flagged.
- **Manual Testing**: Set a task due date to yesterday; verify overdue badge appears.
- **Do NOT Modify**: Activity logging logic.

---

### Phase 7: Cloudflare R2 Attachments & Secure File Pipeline

#### STEP-031: Define Attachment Model & Configure R2 S3 Client
- **Objective**: Setup Cloudflare R2 client and database schema for attachments.
- **Functionality**: Add `Attachment` model to `prisma/schema.prisma`. Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`. Create `lib/r2.ts` initializing S3 client with R2 endpoint. Run migration.
- **Files to Modify/Create**: `prisma/schema.prisma`, `lib/r2.ts`, `prisma/migrations/*`.
- **Dependencies**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`.
- **Acceptance Criteria**: R2 client initializes with environment variables; `Attachment` table created.
- **Manual Testing**: Run test script asserting R2 client connectivity.
- **Do NOT Modify**: Task status models.

#### STEP-032: Implement Presigned Upload URL Route Handler
- **Objective**: Secure endpoint granting time-limited upload capability directly to Cloudflare R2.
- **Functionality**: Create `app/api/files/presign-upload/route.ts`. Validates session, verifies user has access to task, checks file type (images, videos, APK, PDF, doc) and size (max 50MB). Generates signed S3 `PutObject` URL valid for 15 minutes.
- **Files to Modify/Create**: `app/api/files/presign-upload/route.ts`, `lib/validations/file.ts`.
- **Validation**: Strict MIME type whitelist: `image/*`, `video/*`, `application/vnd.android.package-archive` (APK), `application/pdf`. Rejects executable `.exe`, `.sh`, `.bat`.
- **Acceptance Criteria**: Generates presigned URL for allowed files; rejects oversized or unallowed formats.
- **Manual Testing**: Send test POST for a `.apk` file (succeeds) and `.exe` (rejected with 400).
- **Do NOT Modify**: Download route.

#### STEP-033: Build Client Attachment Uploader
- **Objective**: User interface for selecting files, showing upload progress, and confirming attachment metadata.
- **Functionality**: Create `components/files/AttachmentUploader.tsx`. Performs direct HTTP PUT to signed R2 URL with progress bar, then invokes Server Action `confirmAttachmentAction` to record metadata in PostgreSQL and log activity.
- **Files to Modify/Create**: `components/files/AttachmentUploader.tsx`, `services/storage.service.ts`.
- **Expected UI**: Drop zone supporting drag-and-drop file selection with progress bar and file preview.
- **Acceptance Criteria**: File uploads directly to R2 without routing binary data through Next.js server.
- **Manual Testing**: Upload a 20MB video or APK; confirm file arrives in R2 and row appears in `Attachment` table.
- **Do NOT Modify**: Daily calendar views.

#### STEP-034: Build Secure Download Route Handler
- **Objective**: Authorize and redirect users to short-lived signed download URLs.
- **Functionality**: Create `app/api/files/download/[id]/route.ts`. Verifies user session and task access. Generates signed `GetObject` URL valid for 5 minutes and returns a `307 Temporary Redirect`.
- **Files to Modify/Create**: `app/api/files/download/[id]/route.ts`.
- **Authorization**: Developers can only download attachments of tasks assigned to them. SM and Manager can download all attachments.
- **Acceptance Criteria**: Direct public access to R2 bucket is impossible; authorized users receive temporary download link.
- **Manual Testing**: Test download as assigned developer (downloads); test as unassigned developer (403 Forbidden).
- **Do NOT Modify**: App shell.

---

### Phase 8: Requests, Complaints & Leave Management

#### STEP-035: Define Request & RequestHistory Models
- **Objective**: Create database schema for developer requests, leaves, and confidential complaints.
- **Functionality**: Add `Request`, `RequestHistory`, `RequestCategory` (`LEAVE`, `COMPLAINT`, `GENERAL`), `LeaveType`, and `RequestStatus` to `prisma/schema.prisma`. Run migration.
- **Files to Modify/Create**: `prisma/schema.prisma`, `prisma/migrations/*`.
- **Database Changes**: Creates `Request` and `RequestHistory` tables.
- **Acceptance Criteria**: Tables and foreign key relations successfully created in Neon.
- **Manual Testing**: Verify models in Prisma Studio.
- **Do NOT Modify**: Attachment tables.

#### STEP-036: Build Leave Application & Approval Workflow
- **Objective**: Allow Developers to apply for leave and SM/Manager to approve or reject.
- **Functionality**: Create `components/requests/LeaveRequestModal.tsx` and `app/(dashboard)/requests/leaves/page.tsx`. Form captures leave type, start date, end date, and reason. SM/Manager interface allows Approve/Reject with mandatory reviewer remarks.
- **Files to Modify/Create**: `app/(dashboard)/requests/leaves/page.tsx`, `components/requests/LeaveRequestModal.tsx`, `services/request.service.ts`.
- **Expected UI**: Tabular queue with leave duration, type badge, status badge, and Action buttons (Approve/Reject).
- **Acceptance Criteria**: Approved leaves update request status and log reviewer remarks and timestamp.
- **Manual Testing**: Submit leave as Developer; approve as SM with remarks; verify Developer sees approved status.
- **Do NOT Modify**: Complaints module.

#### STEP-037: Build Confidential Complaint Submission & Review System
- **Objective**: Deliver private complaint submission with strict privacy controls.
- **Functionality**: Create `app/(dashboard)/requests/complaints/page.tsx` and `components/requests/ComplaintModal.tsx`.
- **Authorization**: **Strict Isolation**: A Developer can query ONLY their own complaints (`WHERE user_id = session.user.id`). SM and Manager can query all complaints. Server blocks any cross-developer leakage.
- **Files to Modify/Create**: `app/(dashboard)/requests/complaints/page.tsx`, `components/requests/ComplaintModal.tsx`.
- **Expected UI**: Discreet submission form with subject and detailed description. SM/Manager review screen with resolution input.
- **Acceptance Criteria**: Developer A cannot see Developer B's complaint in UI or via raw API/action call.
- **Manual Testing**: Create complaint as Dev A; log in as Dev B and verify complaint table is empty.
- **Do NOT Modify**: Leave application logic.

#### STEP-038: Build General Issue / Ticket Tracking Workflow
- **Objective**: Support general developer tickets and blockers submitted to the Scrum Master.
- **Functionality**: Create `app/(dashboard)/requests/tickets/page.tsx`. Allows developers to raise general operational questions or equipment/environment blockers.
- **Files to Modify/Create**: `app/(dashboard)/requests/tickets/page.tsx`, `components/requests/GeneralTicketModal.tsx`.
- **Acceptance Criteria**: General tickets follow `PENDING` -> `RESOLVED` / `CLOSED` lifecycle with remarks.
- **Manual Testing**: Create general ticket; resolve as SM; check status update.
- **Do NOT Modify**: Task board.

#### STEP-039: Integrate Approved Leaves into Planning Calendars
- **Objective**: Reflect approved developer leaves on the daily and monthly planning dashboards.
- **Functionality**: Query `Request` where `category = 'LEAVE' AND status = 'APPROVED'` in `services/planning.service.ts`. Display "On Leave" badge next to developer on daily breakdown and monthly calendar cells.
- **Files to Modify/Create**: `services/planning.service.ts`, `components/planning/TeamDailyBreakdown.tsx`, `components/planning/MonthCalendar.tsx`.
- **Expected UI**: Soft mint or amber pill tag: `🌴 On Leave (Casual)` on developer workload card.
- **Acceptance Criteria**: Developers on approved leave are visibly flagged so tasks are not assigned erroneously.
- **Manual Testing**: Approve leave for tomorrow; open tomorrow's team breakdown; verify leave badge appears.
- **Do NOT Modify**: Auth session helpers.

---

### Phase 9: Immutable Centralized Activity Logging & Audit Trail

#### STEP-040: Define ActivityLog Model & Strategic Indexes
- **Objective**: Setup centralized immutable activity ledger.
- **Functionality**: Add `ActivityLog` model to `prisma/schema.prisma` (`user_id`, `activity_type`, `task_id`, `request_id`, `description`, `previous_value`, `new_value`, `reason`, `ip_address`, `created_at`). Add compound indexes for filtering. Run migration.
- **Files to Modify/Create**: `prisma/schema.prisma`, `prisma/migrations/*`.
- **Database Changes**: Creates `ActivityLog` table.
- **Acceptance Criteria**: Table created with indexes on `(user_id, created_at DESC)`, `(activity_type, created_at DESC)`.
- **Manual Testing**: Verify table in Prisma Studio.
- **Do NOT Modify**: User or Task models.

#### STEP-041: Implement Centralized Activity Service
- **Objective**: Provide reliable logging helper for transactions and standalone actions.
- **Functionality**: Create `services/activity.service.ts` with `logActivity(tx, params)` and `getActivityLogs(filters, pagination)`. Supports JSON snapshot diffs.
- **Files to Modify/Create**: `services/activity.service.ts`.
- **Backend Behaviour**: Enforces immutability: service exposes NO update or delete methods for `ActivityLog`.
- **Acceptance Criteria**: Activity entries recorded accurately; cannot be modified.
- **Manual Testing**: Insert log entry; attempt deletion via service (method does not exist).
- **Do NOT Modify**: File download handler.

#### STEP-042: Instrument System Mutations with Audit Logging
- **Objective**: Hook all state changes into the activity logging pipeline.
- **Functionality**: Ensure task creation, assignment change, priority change, status change, file upload, user creation, and request approval write to `ActivityLog`.
- **Files to Modify/Create**: Update `services/task.service.ts`, `services/user.service.ts`, `services/request.service.ts`, `services/storage.service.ts`.
- **Acceptance Criteria**: Performing any key mutation automatically generates an activity log record.
- **Manual Testing**: Perform task assignment change; inspect `ActivityLog` table for `TASK_ASSIGNED` entry.
- **Do NOT Modify**: UI styling.

#### STEP-043: Build Dedicated Activity Logs UI with Multi-Factor Filtering
- **Objective**: Deliver high-density audit inspection screen for SM and Manager.
- **Functionality**: Create `app/(dashboard)/activity-logs/page.tsx` with filters: Developer/User, Date range, Activity Type dropdown, Task ID search, and pagination.
- **Files to Modify/Create**: `app/(dashboard)/activity-logs/page.tsx`, `components/activity/ActivityFilterBar.tsx`, `components/activity/ActivityTable.tsx`.
- **Authorization**: Scrum Master and Manager only. (Developers can view their personal activity via their profile/dashboard).
- **Expected UI**: High-density data table with timestamp, user badge, activity type pill, description, diff summary, and reason.
- **Acceptance Criteria**: Complex queries filter instantly with pagination.
- **Manual Testing**: Filter logs by "TASK_STATUS_CHANGED" and specific developer; verify results.
- **Do NOT Modify**: Navigation layout.

---

### Phase 10: Role-Specific Dashboards & Executive Analytics

#### STEP-044: Build Developer Dashboard
- **Objective**: Deliver personalized execution dashboard for Developers.
- **Functionality**: Create `app/(dashboard)/developer/page.tsx`. Summarizes: Today's Assigned Tasks, In Progress Tasks, Pending/Blocked Items, Overdue Tasks, and Recent Personal Status Changes.
- **Files to Modify/Create**: `app/(dashboard)/developer/page.tsx`, `components/dashboard/DeveloperDashboardView.tsx`.
- **Expected UI**: Clean summary metric cards at top, followed by Today's Task cards with quick-action status dropdowns.
- **Acceptance Criteria**: Developer logs in and immediately sees what needs to be worked on today.
- **Manual Testing**: Log in as Developer; verify metrics match assigned tasks.
- **Do NOT Modify**: Manager dashboard.

#### STEP-045: Build Scrum Master Dashboard
- **Objective**: Operational cockpit for Scrum Masters.
- **Functionality**: Create `app/(dashboard)/scrum-master/page.tsx`. Focuses on: Total Active Tasks, Testing Queue count, Pending Blockers, Developer Workload distribution, and Quick Task Assignment button.
- **Files to Modify/Create**: `app/(dashboard)/scrum-master/page.tsx`, `components/dashboard/ScrumMasterDashboardView.tsx`.
- **Expected UI**: Live status indicators, queue summaries, and direct links to unblock developers.
- **Acceptance Criteria**: SM has immediate visibility into team bottlenecks.
- **Manual Testing**: Log in as SM; check Testing Queue matches tasks in `TESTING` status.
- **Do NOT Modify**: User administration page.

#### STEP-046: Build Manager Executive Dashboard
- **Objective**: High-level progress, capacity, and administration dashboard for Managers.
- **Functionality**: Create `app/(dashboard)/manager/page.tsx`. Displays: Overall Team Progress, Daily & Monthly Completion Rate, Overdue Task Count, Priority Breakdown, and Pending Leave Requests.
- **Files to Modify/Create**: `app/(dashboard)/manager/page.tsx`, `components/dashboard/ManagerDashboardView.tsx`.
- **Expected UI**: Executive KPIs, workload balance across developers, and shortcut to User Management.
- **Acceptance Criteria**: Manager views holistic team health at a glance.
- **Manual Testing**: Verify metrics reflect aggregate team data.
- **Do NOT Modify**: Task board.

#### STEP-047: Integrate Recharts Visualizations
- **Objective**: Add data visualizations to Manager and Scrum Master dashboards.
- **Functionality**: Install `recharts`. Build `components/dashboard/TaskStatusChart.tsx` (donut chart of status breakdown) and `DeveloperWorkloadBarChart.tsx` (bar chart of tasks per developer).
- **Dependencies**: `recharts`.
- **Expected UI**: Clean, minimalist charts using Dub color palette (Electric Blue, Soft Mint, Tangerine, Ash). No heavy gradients.
- **Acceptance Criteria**: Charts render responsively with tooltips.
- **Manual Testing**: Hover over chart segments; verify data tooltips.
- **Do NOT Modify**: Server Actions.

---

### Phase 11: In-App Notifications & UI Polish

#### STEP-048: Define Notification Model & In-App Service
- **Objective**: Setup notification infrastructure for real-time awareness.
- **Functionality**: Add `Notification` model to `prisma/schema.prisma` (`user_id`, `title`, `message`, `link`, `is_read`, `type`, `created_at`). Create `services/notification.service.ts` to trigger notifications on task assignment, status updates, and request reviews. Run migration.
- **Files to Modify/Create**: `prisma/schema.prisma`, `services/notification.service.ts`, `prisma/migrations/*`.
- **Acceptance Criteria**: Notifications triggered when task is assigned to a developer.
- **Manual Testing**: Assign task to Dev; verify notification created for Dev.
- **Do NOT Modify**: Activity log service.

#### STEP-049: Build Notification Bell Dropdown Component
- **Objective**: UI indicator for unread notifications in top header.
- **Functionality**: Create `components/layout/NotificationBell.tsx`. Displays unread count badge. Clicking opens dropdown with notification list and "Mark all as read" button.
- **Files to Modify/Create**: `components/layout/NotificationBell.tsx`, modify `components/layout/Header.tsx`.
- **Expected UI**: Subtle bell icon with red unread pill badge; clean popover list.
- **Acceptance Criteria**: Clicking a notification marks it read and navigates to target task/request.
- **Manual Testing**: Generate unread notification; open dropdown; click notification; verify mark as read.
- **Do NOT Modify**: App sidebar.

#### STEP-050: Implement Global Task Search Command Bar (`Cmd+K`)
- **Objective**: Fast keyboard-driven task lookup.
- **Functionality**: Create `components/layout/CommandPalette.tsx` using `cmdk` or Radix dialog. Opens on `Cmd+K` / `Ctrl+K`. Searches tasks by code (`KM-101`) or title.
- **Files to Modify/Create**: `components/layout/CommandPalette.tsx`.
- **Dependencies**: `cmdk` (if needed) or native dialog.
- **Expected UI**: Sleek modal search input with keyboard navigation.
- **Acceptance Criteria**: Pressing `Cmd+K` opens search; selecting result navigates directly to task.
- **Manual Testing**: Press `Cmd+K`, type "KM-101", press Enter.
- **Do NOT Modify**: Login page.

#### STEP-051: Implement Empty States, Skeleton Loaders & Responsive Refinement
- **Objective**: Ensure seamless loading states and graceful empty states across all screens.
- **Functionality**: Create skeleton loaders (`components/ui/Skeleton.tsx`) and empty state placeholders for task lists, daily views, and activity logs. Polish mobile drawer navigation.
- **Files to Modify/Create**: `components/ui/Skeleton.tsx`, `components/ui/EmptyState.tsx`, polish page layouts.
- **Expected UI**: Consistent, non-jarring loading skeletons matching Dub design tokens.
- **Acceptance Criteria**: Zero layout shift during data fetching; informative empty states when no tasks exist.
- **Manual Testing**: Simulate slow 3G connection in DevTools; verify skeleton displays smoothly.
- **Do NOT Modify**: Business logic services.

---

### Phase 12: Production Hardening, Verification & Deployment

#### STEP-052: Comprehensive Role-Based Security Audit
- **Objective**: Validate server-side authorization across all Server Actions and Route Handlers.
- **Functionality**: Automated/manual verification verifying:
  1. Developer cannot query or update other developers' tasks.
  2. Developer cannot access complaint records of others.
  3. Non-manager cannot create users or reset passwords.
  4. Developer cannot move task to `RELEASED` or `COMPLETED`.
- **Files to Modify/Create**: `tests/security/rbac.test.ts` or audit script.
- **Acceptance Criteria**: 100% of unauthorized tampering attempts return 403 Forbidden.
- **Manual Testing**: Attempt forging Server Action payloads as Developer with another user's task ID.
- **Do NOT Modify**: Core application schemas.

#### STEP-053: Neon PostgreSQL Production Configuration & Backups
- **Objective**: Configure production connection pooling and backup schedule on Neon.
- **Functionality**: Set up Neon pooled connection string in production environment. Verify connection pooling parameters. Verify automated daily snapshot backups on Neon console.
- **Files to Modify/Create**: Documentation in `docs/DEPLOYMENT.md`.
- **Acceptance Criteria**: Application performs smoothly under concurrent pooled queries.
- **Manual Testing**: Run load test simulating 50 concurrent requests.
- **Do NOT Modify**: Local development settings.

#### STEP-054: Cloudflare R2 Production Bucket & CORS Configuration
- **Objective**: Finalize Cloudflare R2 bucket security and CORS rules for presigned uploads.
- **Functionality**: Configure R2 bucket CORS allowing `PUT` from production Vercel domain. Restrict public bucket access (private bucket only). Set up lifecycle rule for incomplete multipart uploads.
- **Files to Modify/Create**: Documentation in `docs/DEPLOYMENT.md`.
- **Acceptance Criteria**: Browser can PUT directly to presigned R2 URL; direct bucket reads are blocked.
- **Manual Testing**: Verify upload and private download redirect on staging/production domain.
- **Do NOT Modify**: Local mock scripts.

#### STEP-055: Vercel Production Deployment & End-to-End Verification
- **Objective**: Deploy application to Vercel and verify complete operational readiness.
- **Functionality**: Connect repository to Vercel. Configure environment variables (`DATABASE_URL`, `R2_*`, `SESSION_SECRET`). Execute production build (`next build`). Run database seed script in production. Execute end-to-end smoke test.
- **Files to Modify/Create**: `vercel.json` (if required), final production check documentation.
- **Acceptance Criteria**: Clean production build on Vercel; login, task creation, status transition, file upload, and activity logging work flawlessly.
- **Manual Testing**: Execute full user journey: Manager logs in -> creates Dev -> SM creates task -> Dev uploads APK -> Dev transitions status with reason -> SM verifies -> Manager reviews activity log.
- **Do NOT Modify**: Completed application source code.

---

## 9. AI Coding Agent Workflow Guidelines

To ensure stable, hallucination-free implementation when delegating steps to an AI coding agent, adhere strictly to the following protocol:

### Step Execution Protocol
1. **One Step at a Time**: Never prompt an AI agent to execute multiple numbered steps simultaneously.
2. **Context Injection**: For each step, provide:
   - The exact Step ID and Objective.
   - Reference to `docs/ARCHITECTURE.md`, `docs/DATABASE_DESIGN.md`, and `docs/ROLE_PERMISSIONS.md`.
   - The specific files to create or modify.
3. **Mandatory Pre-Flight Check**: Agent must inspect target files before modifying them.
4. **No Placeholder Stubs**: Agent must write complete, functional code with proper error handling. No `// TODO: implement later`.
5. **Post-Step Verification**: Run `npm run build` or the step's manual verification checklist before marking the step as complete.
6. **Git Commit Checkpoint**: Create a dedicated git commit after each step:
   ```bash
   git add .
   git commit -m "feat(step-00X): [Step title]"
   ```

---

## 10. Summary & Recommended Starting Step

- **Architecture**: Single Full-Stack Next.js App Router (React 19, Tailwind v4, shadcn/ui, Prisma ORM, Neon PostgreSQL, Cloudflare R2, Argon2id custom auth).
- **Total Phases**: 13 (Phase 0 through Phase 12).
- **Total Implementation Steps**: 55 granular, independent steps.
- **Immediate Recommended Step**: **STEP-001** (Inspect repository state, clean up initial template boilerplate, and establish folder scaffolding).
