import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManageCategories from './pages/ManageCategories';
import ManageCatalogues from './pages/ManageCatalogues';
import CatalogueProducts from './pages/CatalogueProducts';
import ManageProducts from './pages/ManageProducts';
import AdminOrders from './pages/AdminOrders';
import Reports from './pages/Reports';
import ManageUsers from './pages/ManageUsers';
import MyOrders from './pages/MyOrders';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import ReturnRefund from './pages/ReturnRefund';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import FAQs from './pages/FAQs';
import Categories from './pages/Categories';
import PageLayout from './components/PageLayout';
import './styles/global.css';

// Custom Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }

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

// Route for pages only users (or guests) should see, redirect admins
const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {}

  if (token && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
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
          <Route path="/product/:id" element={<UserRoute><ProductDetails /></UserRoute>} />
          <Route path="/catalogue/:id" element={<UserRoute><CatalogueProducts /></UserRoute>} />
          <Route path="/checkout" element={<UserRoute><Checkout /></UserRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute allowedRole="user"><MyOrders /></ProtectedRoute>} />
          <Route path="/cart" element={<UserRoute><Cart /></UserRoute>} />
          <Route path="/privacy-policy" element={<UserRoute><PrivacyPolicy /></UserRoute>} />
          <Route path="/terms-and-conditions" element={<UserRoute><TermsAndConditions /></UserRoute>} />
          <Route path="/return-refund" element={<UserRoute><ReturnRefund /></UserRoute>} />
          <Route path="/contact-us" element={<UserRoute><ContactUs /></UserRoute>} />
          <Route path="/about-us" element={<UserRoute><AboutUs /></UserRoute>} />
          <Route path="/faqs" element={<UserRoute><FAQs /></UserRoute>} />
          <Route path="/categories" element={<UserRoute><Categories /></UserRoute>} />

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
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageProducts />
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
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRole="admin">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/catalogues"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageCatalogues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageUsers />
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
