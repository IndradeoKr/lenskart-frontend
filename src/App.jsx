import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import Register from './pages/Register';
import ProductListing from './pages/customer/ProductListing';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import CustomerProfile from './pages/customer/CustomerProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import AdminManagement from './pages/admin/AdminManagement';
import AdminProfile from './pages/admin/AdminProfile';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/customer-register" element={<CustomerRegister />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/register" element={<Register />} />

          {/* Customer routes */}
          <Route
            path="/products"
            element={<ProtectedRoute requiredRole="CUSTOMER" component={<ProductListing />} />}
          />
          <Route
            path="/products/:productId"
            element={<ProtectedRoute requiredRole="CUSTOMER" component={<ProductDetails />} />}
          />
          <Route
            path="/cart"
            element={<ProtectedRoute requiredRole="CUSTOMER" component={<Cart />} />}
          />
          <Route
            path="/checkout"
            element={<ProtectedRoute requiredRole="CUSTOMER" component={<Checkout />} />}
          />
          <Route
            path="/orders"
            element={<ProtectedRoute requiredRole="CUSTOMER" component={<OrderHistory />} />}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute requiredRole="CUSTOMER" component={<CustomerProfile />} />}
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute requiredRole="ADMIN" component={<AdminDashboard />} />}
          />
          <Route
            path="/admin/products"
            element={<ProtectedRoute requiredRole="ADMIN" component={<ProductManagement />} />}
          />
          <Route
            path="/admin/categories"
            element={<ProtectedRoute requiredRole="ADMIN" component={<CategoryManagement />} />}
          />
          <Route
            path="/admin/orders"
            element={<ProtectedRoute requiredRole="ADMIN" component={<OrderManagement />} />}
          />
          <Route
            path="/admin/customers"
            element={<ProtectedRoute requiredRole="ADMIN" component={<CustomerManagement />} />}
          />
          <Route
            path="/admin/admins"
            element={<ProtectedRoute requiredRole="ADMIN" component={<AdminManagement />} />}
          />
          <Route
            path="/admin/profile"
            element={<ProtectedRoute requiredRole="ADMIN" component={<AdminProfile />} />}
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
