import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';
import PageLayout from './components/PageLayout';
import './styles/global.css';

// Custom Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) {
    // Since we don't have a /login page anymore, redirect to home.
    // Dashboard has the AuthModal for users to sign in.
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to their default dashboard if role doesn't match
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <PageLayout>
        <Routes>
          {/* Main Public Home Page */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/cart" element={<Cart />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageLayout>
    </Router>
  );
}

export default App;
