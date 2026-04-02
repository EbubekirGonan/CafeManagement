# Architecture — CafeManagement

## Overview
Multi-tenant café management system. A business owner can manage tables, sessions (open tabs), orders, products, categories, sections, expenses, and view a sales/dashboard summary. Auth is JWT-based with full business isolation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, TypeORM, PostgreSQL (port 5433) |
| Frontend | React 18 + Vite, TypeScript, Tailwind CSS v4 |
| State / Data | @tanstack/react-query, axios |
| Auth | JWT (HS256), global `JwtAuthGuard` with `@Public()` escape hatch |
| Notifications | react-hot-toast |

---

## Repository Layout

```
CafeManagement/
├── cafe-management/          # NestJS API (port 3000)
│   └── src/
│       ├── entities/         # TypeORM entities (one file per table)
│       ├── dto/              # Validation DTOs (create + update per resource)
│       ├── services/         # Business logic
│       ├── controllers/      # HTTP route handlers
│       ├── modules/          # NestJS feature modules
│       ├── guards/           # JwtAuthGuard
│       ├── decorators/       # @Public()
│       ├── enums/            # SessionStatus, TableStatus, UserRole
│       └── seed/             # Seed data script
└── cafe-management-ui/       # React SPA (port 5173)
    └── src/
        ├── api/              # Axios API wrappers (one file per resource)
        ├── components/       # Shared UI components
        ├── pages/            # Route-level page components
        │   └── settings/     # CRUD settings pages
        ├── layouts/          # MainLayout (sidebar + outlet)
        ├── types/            # Shared TypeScript interfaces & enums
        ├── hooks/            # Custom React hooks
        └── utils/            # Helpers
```

---

## Database Entities

| Entity | Table | Key Relations |
|---|---|---|
| Business | businesses | Root tenant; all other entities FK to this |
| User | users | ManyToOne → Business |
| Section | sections | ManyToOne → Business |
| TableSeat | table_seats | ManyToOne → Section |
| Session | sessions | ManyToOne → TableSeat; status: open/closed/paid |
| OrderItem | order_items | ManyToOne → Session, Product |
| Category | categories | ManyToOne → Business |
| Product | products | ManyToOne → Category, Business |
| ExpenseCategory | expense_categories | ManyToOne → Business |
| Expense | expenses | ManyToOne → ExpenseCategory, Business |

---

## Backend Conventions

- **Every module** = `entity` + `dto/` + `service` + `controller` + `module`.
- **Business isolation**: all queries include `{ where: { business_id } }` extracted from `req.user.business_id` (JWT payload).
- **Auth**: `JwtAuthGuard` is global (`APP_GUARD`). Public routes use `@Public()` decorator.
- **Transactions**: Session open/close uses `DataSource` transactions.
- **Session total**: recalculated in `recalcSessionTotal()` after every order-item create/delete.
- **DTOs**: `create-*.dto.ts` uses `class-validator`; `update-*.dto.ts` extends `PartialType(Create...)`.
- **Naming**: snake_case column names, camelCase TS properties.

## Frontend Conventions

- **API layer** (`src/api/`): thin wrappers — no business logic, just axios calls typed with interfaces from `src/types/index.ts`.
- **Pages** fetch via `useQuery`; mutations via `useMutation` with `invalidateQueries` on success.
- **Confirmation dialogs**: use `<ConfirmDialog>` component (not `window.confirm`). Pass `confirmButtonVariant="success"` for non-destructive confirms.
- **Inline editing**: settings pages use `editingId` + `editingName` state pattern.
- **Toast**: always call `toast.success()` on mutation success; `toast.error()` in catch blocks.
- **Types**: all shared types in `src/types/index.ts`. No inline type duplication.

---

## Key API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /auth/login | Returns JWT |
| GET | /table-seats | All tables for business |
| GET | /sessions/table/:id/active | Active session for a table (null if none) |
| POST | /sessions | Opens a new session (transaction) |
| PATCH | /sessions/:id/close | Closes session + calculates total (transaction) |
| GET | /sessions?status=paid | Paid sessions for sales history |
| POST | /order-items | Creates order item + recalcs session total |
| DELETE | /order-items/:id | Deletes item + recalcs session total |
| GET | /order-items/session/:id | Items for a session |
| GET | /dashboard/stats | openCount, closedTodayCount, dailyRevenue, dailyExpense |
| GET | /expense-categories | List expense categories for business |

---

## Do's
- Always pass `business_id` from JWT when creating/querying records.
- Use `PartialType` in update DTOs.
- Use `ConfirmDialog` instead of `window.confirm`.
- Add `expenseCategoryId` (FK UUID) — not a free-text string — when creating expenses.

## Don'ts
- Don't add `@Public()` to business-data endpoints.
- Don't call `expenseApi.create` with `expense_category` string — it's now `expenseCategoryId`.
- Don't skip `recalcSessionTotal()` after order-item mutations.
- Don't add new pages without registering the route in `App.tsx` and adding a sidebar link in `MainLayout`.

---

## Extending the Project

1. **New resource**: create entity → DTO → service → controller → module → register in `app.module.ts`. Mirror existing patterns (e.g. `category.*`).
2. **New page**: create in `src/pages/`, add route in `App.tsx`, add sidebar entry in `MainLayout`.
3. **New API call**: add to corresponding `src/api/*.ts` file using the existing `api` axios instance.
