import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import CategoriesPage from './features/categories/CategoriesPage';
import CustomersPage from './features/customers/CustomersPage';
import CustomerDetailsPage from './features/customers/CustomerDetailsPage';
import LoginPage from './features/auth/LoginPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import UsersPage from './features/users/UsersPage';
import { UserRole } from './features/auth/authService';
import DashboardPage from './features/dashboard/DashboardPage';
import ProductsPage from './features/products/ProductsPage';
import { useAuthStore } from './store/useAuthStore';

const IndexRouteHelper = () => {
  const { user } = useAuthStore();
  if (user?.role === UserRole.ADMIN) {
    return <DashboardPage />;
  }
  return <Navigate to="/customers" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<IndexRouteHelper />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
              <Route path="users" element={<UsersPage />} />
              {/* Redirect old route if anyone tries it */}
              <Route path="register-user" element={<Navigate to="/users" replace />} />
            </Route>

            {/* Add other routes here */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
