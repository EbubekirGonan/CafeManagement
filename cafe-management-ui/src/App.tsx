import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { getRole } from './utils/auth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TablesPage from './pages/TablesPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import SalesPage from './pages/SalesPage';
import CategoriesPage from './pages/settings/CategoriesPage';
import ExpenseCategoriesPage from './pages/settings/ExpenseCategoriesPage';
import SectionsPage from './pages/settings/SectionsPage';
import TablesSettingsPage from './pages/settings/TablesSettingsPage';
import ProductsPage from './pages/settings/ProductsPage';
import BusinessesPage from './pages/admin/BusinessesPage';
import UsersPage from './pages/admin/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Admin routes — superadmin only */}
      <Route element={<ProtectedRoute requiredRole="superadmin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/businesses" element={<BusinessesPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        </Route>
      </Route>

      {/* Regular routes — non-superadmin */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings/categories" element={<CategoriesPage />} />
          <Route path="/settings/expense-categories" element={<ExpenseCategoriesPage />} />
          <Route path="/settings/sections" element={<SectionsPage />} />
          <Route path="/settings/tables" element={<TablesSettingsPage />} />
          <Route path="/settings/products" element={<ProductsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={getRole() === 'superadmin' ? '/admin/businesses' : '/dashboard'} replace />} />
    </Routes>
  );
}
