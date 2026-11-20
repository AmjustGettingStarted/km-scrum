# Engineering Implementation Checklist

This checklist tracks the implementation progress across all 13 phases. Every step is designed to be completed independently by an AI coding agent or software engineer.

---

## Phase 0: Repository Inspection & Baseline Setup
- [x] **STEP-001**: Inspect existing repository state, Next.js 16.4.6 & Tailwind v4 dependencies, and establish clean folder scaffolding.
- [x] **STEP-002**: Initialize Git repository and create comprehensive `.gitignore` and `.env.example` templates.
- [x] **STEP-003**: Configure Tailwind v4 Dub design tokens (`@theme`) and typography in `app/globals.css`.

---

## Phase 1: Foundation, Design Tokens & Database Engine
- [x] **STEP-004**: Install and initialize Prisma ORM with PostgreSQL/Neon configuration.
- [x] **STEP-005**: Create database client singleton (`lib/prisma.ts`) and test connection route (`app/api/health/route.ts`).
- [x] **STEP-006**: Set up baseline UI component foundation (shadcn/ui primitives adapted for Tailwind v4).
- [x] **STEP-007**: Build authenticated application shell layout (`components/layout/AppSidebar.tsx`, `Header.tsx`, `Breadcrumbs.tsx`).

---

## Phase 2: Custom Authentication & User Administration
- [x] **STEP-008**: Create User and Session Prisma models and run initial database migration.
- [x] **STEP-009**: Implement Argon2id password hashing utilities (`lib/auth/password.ts`).
- [x] **STEP-010**: Build database-backed session engine and cookie helpers (`lib/auth/session.ts`).
- [x] **STEP-011**: Build Login page UI and authenticate Server Action (`app/(auth)/login/page.tsx`).
- [x] **STEP-012**: Implement Next.js edge middleware for session authentication and role-based route protection (`middleware.ts`).
- [x] **STEP-013**: Implement Manager User Management (create account, list users, reset password, force password change) and initial seed script (`prisma/seed.ts`).

---

## Phase 3: Task Management Core (CRUD & Data Access)
- [x] **STEP-014**: Define Task Prisma schema with PostgreSQL sequence for human-readable task codes (`KM-101`) and run migration.
- [x] **STEP-015**: Create Task Service (`services/task.service.ts`) with strict RBAC queries.
- [x] **STEP-016**: Build Task Creation modal and Server Action with full validation.
- [x] **STEP-017**: Build Task List view with role-scoped filtering (assignee, priority, status, date).
- [x] **STEP-018**: Build Task Detail view (`app/(dashboard)/tasks/[id]/page.tsx`) with editable fields for SM/Manager and read-only view for Dev.

---

## Phase 4: Task Status Lifecycle & Mandatory History
- [x] **STEP-019**: Define `TaskStatusHistory` Prisma model and run migration.
- [x] **STEP-020**: Implement Status Transition Service (`services/status.service.ts`) enforcing transition rules and atomic logging.
- [x] **STEP-021**: Build Mandatory Status Change Reason Dialog (`components/tasks/StatusChangeModal.tsx`).
- [x] **STEP-022**: Render Task Status History timeline inside Task Detail view with author, timestamps, and explanations.

---

## Phase 5: Interactive Task Board & Drag-and-Drop
- [x] **STEP-023**: Install and configure `@dnd-kit/core` and `@dnd-kit/sortable` for the 6 status columns.
- [x] **STEP-024**: Build draggable Task Card component (`components/tasks/TaskCard.tsx`) with priority indicators and pill styling.
- [x] **STEP-025**: Implement Drag-and-Drop Status Change Interception with optimistic UI and reason dialog rollback.
- [x] **STEP-026**: Implement column reordering persistence using fractional `order_index`.

---

## Phase 6: Daily & Monthly Planning Engine
- [ ] **STEP-027**: Build Developer Daily Tasks View (`app/(dashboard)/planning/daily/page.tsx`) with scheduled date switcher.
- [ ] **STEP-028**: Build Scrum Master & Manager Team Daily Breakdown with developer workload distribution and unassigned developer warnings.
- [ ] **STEP-029**: Build Monthly Planning Calendar (`app/(dashboard)/planning/monthly/page.tsx`) showing task counts per day per developer.
- [ ] **STEP-030**: Implement overdue task detection and visual alert badges.

---

## Phase 7: Cloudflare R2 Attachments & Secure File Pipeline
- [ ] **STEP-031**: Define `Attachment` Prisma model and configure Cloudflare R2 S3 Client (`lib/r2.ts`).
- [ ] **STEP-032**: Implement Presigned Upload URL Route Handler (`/api/files/presign-upload`) with MIME and file size validation (images, videos, APKs).
- [ ] **STEP-033**: Build Client Attachment Uploader (`components/files/AttachmentUploader.tsx`) with direct R2 upload progress.
- [ ] **STEP-034**: Build Secure Download Route Handler (`/api/files/download/[id]`) with role verification and presigned GET redirects.

---

## Phase 8: Requests, Complaints & Leave Management
- [ ] **STEP-035**: Define `Request` and `RequestHistory` Prisma models and run migration.
- [ ] **STEP-036**: Build Leave Application form for Developers and Approval/Rejection interface for SM/Manager.
- [ ] **STEP-037**: Build Confidential Complaint Submission & Review system with strict developer isolation.
- [ ] **STEP-038**: Build General Issue / Ticket tracking workflow.
- [ ] **STEP-039**: Integrate approved leaves into Team Daily Planning and Monthly Calendar views.

---

## Phase 9: Immutable Centralized Activity Logging & Audit Trail
- [ ] **STEP-040**: Define `ActivityLog` Prisma model and indexing strategy.
- [ ] **STEP-041**: Implement centralized Activity Service (`services/activity.service.ts`) with transactional helpers.
- [ ] **STEP-042**: Instrument all system mutations (tasks, statuses, users, requests, files) with audit logging.
- [ ] **STEP-043**: Build Dedicated Activity Logs UI (`app/(dashboard)/activity-logs/page.tsx`) with multi-factor filters (user, date, type, task) and pagination.

---

## Phase 10: Role-Specific Dashboards & Executive Analytics
- [ ] **STEP-044**: Build Developer Dashboard (`app/(dashboard)/developer/page.tsx`) focusing on today's assignments and personal status.
- [ ] **STEP-045**: Build Scrum Master Dashboard (`app/(dashboard)/scrum-master/page.tsx`) focusing on team throughput, blocked work, and QA queue.
- [ ] **STEP-046**: Build Manager Dashboard (`app/(dashboard)/manager/page.tsx`) focusing on executive stats, workload, and team capacity.
- [ ] **STEP-047**: Integrate Recharts visualizations (Task Status Breakdown, Priority Distribution, Weekly Velocity).

---

## Phase 11: In-App Notifications & UI Polish
- [ ] **STEP-048**: Define `Notification` Prisma model and notification creation service.
- [ ] **STEP-049**: Build Notification Bell dropdown component with unread badges and mark-as-read actions.
- [ ] **STEP-050**: Add global task search bar with keyboard shortcut (`Cmd+K` / `Ctrl+K`).
- [ ] **STEP-051**: Implement responsive layout polish, empty states, and skeleton loading screens across all pages.

---

## Phase 12: Production Hardening, Verification & Deployment
- [ ] **STEP-052**: Comprehensive automated and manual RBAC security audit across all routes and Server Actions.
- [ ] **STEP-053**: Neon PostgreSQL production branch setup, connection pooling test, and database backup verification.
- [ ] **STEP-054**: Cloudflare R2 production bucket configuration, CORS rules, and lifecycle rules.
- [ ] **STEP-055**: Vercel deployment configuration, environment variable verification, and end-to-end smoke test.
