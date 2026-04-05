# Progress — CafeManagement

## ✅ Completed

### Backend (NestJS)
- [x] Project scaffold — NestJS + TypeORM + PostgreSQL
- [x] JWT authentication (`/auth/login`, global `JwtAuthGuard`, `@Public()` decorator)
  - JWT payload includes `{ sub, email, role, business_id }` for both auth and tenant isolation
- [x] **Tenant isolation (row-level, `business_id` from JWT)**
  - Direct FK: User, Section, Category, Product, Expense, ExpenseCategory — `{ where: { business_id } }`
  - Nested via Section: TableSeat — `{ where: { section: { business_id } } }`
  - Nested via Table→Section: Session — `{ where: { table: { section: { business_id } } } }`
  - Dashboard stats: in-memory filter after fetch
- [x] `RolesGuard` + `@Roles()` decorator — `@Roles('superadmin')` enforced on Business and User controllers
- [x] Entities: Business, User, Section, TableSeat, Session, OrderItem, Category, Product, ExpenseCategory, Expense
- [x] Full CRUD modules for: Business, User, Section, TableSeat, Category, Product, OrderItem, Expense, ExpenseCategory
- [x] `UserService` dual-layer: tenant-scoped methods + `createAsAdmin / findAllGlobal / updateAsAdmin / removeAsAdmin` for superadmin
- [x] Password hashing with bcrypt on user create
- [x] Session flow: `POST /sessions` (open, transaction), `PATCH /sessions/:id/close` (PAID status, total calc, transaction)
- [x] `GET /sessions/table/:id/active` — returns null (not 404) if no active session
- [x] `recalcSessionTotal()` called on every order-item create/delete
- [x] `GET /sessions?status=paid` for sales history with table + section relations
- [x] `GET /order-items/session/:id` with product relations loaded
- [x] `GET /dashboard/stats` — openCount, closedTodayCount, dailyRevenue, dailyExpense
- [x] Seed script (Demo Kafe, admin@kafe.com/123456, 5 categories, 4 sections, 20 tables, 13 products)
- [x] `ExpenseCategory` entity + module (id, name, business_id FK); Expense migrated from string category to FK

### Frontend (React)
- [x] Auth flow: LoginPage, JWT stored in localStorage, axios interceptor (bearer token + 401 → redirect)
- [x] Login routing: superadmin → `/admin/businesses`; all other roles → `/dashboard`
- [x] Protected routes (`<ProtectedRoute>`) with role check
- [x] Main layout with sidebar navigation (collapsible sections submenu, logout button)
- [x] **AdminLayout** + superadmin panel:
  - **BusinessesPage** — cross-tenant business CRUD (create, edit, delete)
  - **UsersPage** — cross-tenant user CRUD (create, edit, delete, assign business, set role)
- [x] **DashboardPage** — live stats cards (open tables, today's revenue, today's expense, closed sessions), 30s refresh
- [x] **TablesPage** — color-coded table cards (available/occupied), section filter (`?section=<id>`), click to open detail modal, highlight ring on last interacted table, 10s poll for open session totals
- [x] **TableDetailModal** — view session items, delete item, add order button, close session (with ConfirmDialog)
- [x] **OrderModal** — category filter, basket, parallel order submission
- [x] **SalesPage** — paid sessions table with date filter (today/week/month/all), Bölüm + Masa columns, info icon → SessionDetailModal with order items
- [x] **ExpensesPage** — expense list, create form with ExpenseCategory dropdown (FK-based)
- [x] **Settings pages** (all with create + inline edit + delete + ConfirmDialog):
  - CategoriesPage
  - SectionsPage
  - TablesSettingsPage
  - ProductsPage (inline edit includes name, price, category select)
  - ExpenseCategoriesPage
- [x] **ConfirmDialog** component — `confirmButtonVariant: 'danger' | 'success'`
- [x] Git repository initialized, initial commit made

---

## 🔄 In Progress

- [ ] Nothing currently in flight

---

## 📋 TODO / Backlog

### Backend
- [ ] Role-based access control for non-superadmin roles (admin vs manager vs waiter permissions) — `UserRole` enum has all values but enforcement is only on superadmin routes
- [ ] Fix `OrderItemService.findAll()` tenant isolation gap — currently returns items across all businesses
- [ ] Dashboard stats: move from in-memory filter to DB-level aggregation with proper `business_id` scoping
- [ ] Expense update endpoint (currently create + delete only)
- [ ] Reports endpoint (revenue/expense aggregates by date range)
- [ ] User management endpoints (invite, change role, change password)
- [ ] Pagination for large datasets (sessions, order-items)

### Frontend
- [ ] **ReportsPage** — currently a placeholder; needs date-range revenue/expense charts
- [ ] Expense inline editing (currently only delete)
- [ ] User management page (list users, add user, change role) — superadmin has backend; tenant admin does not
- [ ] Waiter-level view (limited sidebar — tables only, no settings)
- [ ] Export sales to CSV/PDF
- [ ] Dark mode

### Infrastructure
- [ ] SSH key added to GitHub → push to remote
- [ ] Docker Compose for local dev (postgres + api + ui)
- [ ] Environment variable documentation (`.env.example`)

---

## 📝 Notes

- PostgreSQL runs on port **5433** (non-default)
- Backend: `http://localhost:3000`, Frontend: `http://localhost:5173`
- `expense_category` string field replaced by `expense_category_id` UUID FK in backend; frontend uses `expenseCategoryId`
- `Expense.expense_category` removed from `types/index.ts` — now `expenseCategoryId: string`
- All `window.confirm` calls replaced with `<ConfirmDialog>` component
- `UserRole` enum values: `superadmin | admin | manager | waiter` — only `superadmin` has enforced route guards; others exist for future RBAC
- `TableSeat` and `Session` do not have a direct `business_id` column — tenant scoping goes through the `section` hierarchy
- `OrderItemService.findAll()` has no tenant filter — only `getBySession(sessionId)` is used in the UI (safe path)
