# Technical Decisions, Assumptions & Trade-offs

## 1. Confirmed Architectural Decisions

| Decision Area | Selected Technology / Approach | Alternative Rejected | Rationale & Justification |
|---|---|---|---|
| **Architecture** | Single Next.js Fullstack (App Router) | Standalone FastAPI, Express, Spring Boot | Eliminates dual-repo synchronization, shared TypeScript types across client & server, native Server Actions. |
| **Styling System** | Tailwind CSS v4 + Dub Design System tokens | Tailwind v3, CSS Modules, Chakra UI | Tailwind v4 is already configured in the repo (`@tailwindcss/turbopack`). Dub system provides a clean, premium, border-first aesthetic with hairline 1px `#e5e5e5` borders. |
| **Authentication** | Custom Argon2id + Database Sessions | Clerk, Auth0, Firebase, Supabase Auth | Strict internal requirement: zero external SaaS dependencies, custom database-backed sessions, complete data ownership. |
| **Database** | Neon Hosted PostgreSQL + Prisma ORM | Raw pg driver, MongoDB, Supabase DB | Neon provides serverless connection pooling and instant branching; Prisma guarantees type-safe schema migrations. |
| **File Storage** | Cloudflare R2 Object Storage | AWS S3, Local filesystem, DB Bytea | Zero egress bandwidth fees, 100% S3 API compatibility, secure private storage via presigned URLs. |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` | react-beautiful-dnd, react-dnd | Modern, keyboard-accessible, React 19 compatible, lightweight, and supports controlled optimistic updates. |
| **Charts** | Recharts | Chart.js, Tremor | Mature React charting library for developer workload and task distribution metrics. |

---

## 2. Confirmed Assumptions

1. **Internal Single Workspace**: The system is exclusively for one internal team. Multi-tenancy, organization switching, and external invitations are strictly out of scope.
2. **No Public Registration**: No self-service registration route. The initial Manager account is provisioned via seed script (`prisma/seed.ts`), and subsequent accounts are created exclusively by the Manager.
3. **No Task Dependencies**: As explicitly instructed, tasks are independent work items. No Gantt dependency chains, blocking relations, or critical-path algorithms will be built.
4. **Soft Deletion / Archival**: Tasks are never physically deleted (`DELETE FROM "Task"`), which would destroy status logs and historical analytics. Deletion operates as `is_archived = true`.
5. **Atomic Audit Logging**: Every task modification and status change must write to `ActivityLog` and `TaskStatusHistory` within a Prisma interactive transaction. If the audit write fails, the entire mutation aborts.
6. **Timezone Handling**: All database timestamps are stored in UTC (`TIMESTAMPTZ`). UI displays relative time ("2 hours ago") or localized date-times based on the client browser locale.

---

## 3. Explicit Anti-Hallucination & Scope Boundaries

### Strictly Out of Scope
- Sprint planning poker / story point estimation games.
- Complex timesheet punch-in / punch-out time tracking.
- AI task summarization or auto-assignment.
- External Slack / Microsoft Teams webhooks.
- Git repository commit integrations.
- Billing / subscriptions / Stripe integrations.

---

## 4. Key Trade-offs & Open Design Decisions

The following architectural trade-offs have been evaluated and have default recommendations ready for user confirmation:

### Trade-off 1: Developer Access to Terminal Statuses (`RELEASED` / `COMPLETED`)
- **Option A (Recommended Default)**: Developers can progress tasks through `TO_DO` -> `IN_PROGRESS` -> `PENDING` -> `TESTING`. Only Scrum Masters and Managers can approve transition to `RELEASED` and `COMPLETED`.
- **Option B (Permissive)**: Developers can mark tasks directly as `RELEASED` or `COMPLETED`.
- **Decision/Recommendation**: Adopt **Option A**. In high-discipline engineering teams, "Released" and "Completed" signify deployment and customer/stakeholder verification, which requires SM/Manager sign-off.

### Trade-off 2: Drag-and-Drop Interaction with Mandatory Reasons
- **Option A (Recommended Default - Modal Interception)**: When a card is dropped into a new status column, the board temporarily holds the optimistic drop in a pending state and opens a "Reason for Status Change" dialog. If the user submits, the change is saved to the database. If cancelled or dismissed, the card snaps back to its origin column.
- **Option B (Inline quick-prompt)**: The card displays an inline input box directly on the board.
- **Decision/Recommendation**: Adopt **Option A**. It ensures clear focus, prevents accidental status transitions, and guarantees thorough documentation.

### Trade-off 3: Task Code Generation (`KM-101` vs UUID)
- **Option A (Recommended Default - Sequential Code)**: PostgreSQL database sequence generates sequential integers formatted as `KM-101`, `KM-102`.
- **Option B (UUID Only)**: Use raw UUIDs (e.g. `c7b8...`) in UI and URLs.
- **Decision/Recommendation**: Adopt **Option A**. Team members constantly communicate using short task codes in daily standups and chat.

### Trade-off 4: Temporary Password Lifecycle
- **Option A (Recommended Default)**: Manager generates a temporary password. The user record is created with `must_change_password = true`. On initial login, Next.js middleware forcefully redirects the user to `/change-password` before any dashboard route can be accessed.
- **Option B (Magic Link via Email)**: Send an email reset link.
- **Decision/Recommendation**: Adopt **Option A**. Keeps auth completely self-contained without requiring an external SMTP / email delivery provider for an internal app.
