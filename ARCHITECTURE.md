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
│       ├── guards/           # JwtAuthGuard, RolesGuard
│       ├── decorators/       # @Public(), @Roles()
│       ├── enums/            # SessionStatus, TableStatus, UserRole
│       └── seed/             # Seed data script
└── cafe-management-ui/       # React SPA (port 5173)
    └── src/
        ├── api/              # Axios API wrappers (one file per resource)
        ├── components/       # Shared UI components
        ├── pages/            # Route-level page components
        │   ├── admin/        # Superadmin panel (BusinessesPage, UsersPage)
        │   └── settings/     # Tenant CRUD settings pages
        ├── layouts/          # MainLayout (sidebar + outlet), AdminLayout
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
- **Auth**: `JwtAuthGuard` is global (`APP_GUARD`). Public routes use `@Public()` decorator. JWT payload: `{ sub, email, role, business_id }`.
- **Roles**: `RolesGuard` + `@Roles('superadmin')` used on Business and User controllers (superadmin-only routes). Roles enum: `superadmin | admin | manager | waiter`.
- **Transactions**: Session open/close uses `DataSource` transactions (atomic: session row + table status in one TX).
- **Session total**: recalculated in `recalcSessionTotal()` after every order-item create/delete.
- **DTOs**: `create-*.dto.ts` uses `class-validator`; `update-*.dto.ts` extends `PartialType(Create...)`.
- **Naming**: snake_case column names, camelCase TS properties.
- **Passwords**: hashed with bcrypt on user create.

### Tenant Isolation (Row-Level, `business_id` from JWT)

All tenant-scoped queries extract `business_id` from `req.user.business_id` (JWT payload). Three patterns are used depending on entity depth:

| Pattern | Entities | Example |
|---|---|---|
| **Direct FK** | User, Section, Category, Product, Expense, ExpenseCategory | `{ where: { business_id } }` |
| **Nested via Section** | TableSeat | `{ where: { section: { business_id } }, relations: { section: true } }` |
| **Nested via Table→Section** | Session | `{ where: { table: { section: { business_id } } }, relations: { table: { section: true } } }` |
| **In-memory filter** | Dashboard stats | fetch all then filter `s.table?.section?.business_id === business_id` |

> ⚠️ **Known gap**: `OrderItemService.findAll()` has no `business_id` filter — it returns items across all tenants. Individual session-scoped lookups (`getBySession`) are safe because session ownership is validated upstream.

## Frontend Conventions

- **API layer** (`src/api/`): thin wrappers — no business logic, just axios calls typed with interfaces from `src/types/index.ts`. Base instance in `api/axios.ts` with bearer token interceptor and 401 → redirect to `/login`.
- **Pages** fetch via `useQuery`; mutations via `useMutation` with `invalidateQueries` on success.
- **Confirmation dialogs**: use `<ConfirmDialog>` component (not `window.confirm`). Pass `confirmButtonVariant="success"` for non-destructive confirms.
- **Inline editing**: settings pages use `editingId` + `editingName` state pattern.
- **Toast**: always call `toast.success()` on mutation success; `toast.error()` in catch blocks.
- **Types**: all shared types in `src/types/index.ts`. No inline type duplication.
- **Login routing**: after login, superadmin is redirected to `/admin/businesses`; all other roles go to `/dashboard`.
- **Admin area**: `/admin/*` routes use `AdminLayout` (dark sidebar). Superadmin manages businesses and users globally (cross-tenant).
- **Section filtering**: `TablesPage` supports `?section=<id>` query param to filter the table grid by section.

---

## Key API Endpoints

### Public / Auth
| Method | Path | Description |
|---|---|---|
| POST | /auth/login | Returns JWT (`@Public()`) |

### Tenant-Scoped (business_id from JWT)
| Method | Path | Description |
|---|---|---|
| GET | /table-seats | All tables for business (nested filter via section) |
| GET | /sessions/table/:id/active | Active session for a table (null if none) |
| GET | /sessions?status=paid | Paid sessions for sales history |
| POST | /sessions | Opens a new session (transaction) |
| PATCH | /sessions/:id/close | Closes session + calculates total (transaction) |
| POST | /order-items | Creates order item + recalcs session total |
| DELETE | /order-items/:id | Deletes item + recalcs session total |
| GET | /order-items/session/:id | Items for a session |
| GET | /categories | Categories for business |
| GET | /products | Products for business |
| GET | /sections | Sections for business |
| GET | /expenses | Expenses for business |
| GET | /expense-categories | Expense categories for business |
| GET | /dashboard/stats | openCount, closedTodayCount, dailyRevenue, dailyExpense |

### Superadmin-Only (`@Roles('superadmin')`)
| Method | Path | Description |
|---|---|---|
| GET/POST/PATCH/DELETE | /businesses | Cross-tenant business management |
| GET/POST/PATCH/DELETE | /users | Cross-tenant user management |
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


## Multi-tenancy rule: 
Every service method that queries the database must accept business_id: string as a parameter and include it in the where clause. Controllers must extract business_id from req.user.business_id (JWT payload) and pass it to the service. Never query without a business_id filter except in superadmin-only endpoints.