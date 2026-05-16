import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isCustomer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            Lenskart
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/customer-login" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Customer Login
                </Link>
                <Link to="/admin-login" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Admin Login
                </Link>
              </>
            ) : isCustomer ? (
              <>
                <Link to="/products" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Products
                </Link>
                <Link to="/cart" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Cart
                </Link>
                <Link to="/orders" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Orders
                </Link>
                <Link to="/profile" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Dashboard
                </Link>
                <Link to="/admin/products" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Products
                </Link>
                <Link to="/admin/categories" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Categories
                </Link>
                <Link to="/admin/orders" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Orders
                </Link>
                <Link to="/admin/customers" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Customers
                </Link>
                <Link to="/admin/admins" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Admins
                </Link>
                <Link to="/admin/profile" className="hover:bg-blue-800 px-3 py-2 rounded">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

