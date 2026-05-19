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
    <nav className="sticky top-0 z-50 bg-slate-950/65 backdrop-blur-xl border-b border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition duration-300">
            ShopWave
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/customer-login" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Customer Login
                </Link>
                <Link to="/admin-login" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Admin Login
                </Link>
              </>
            ) : isCustomer ? (
              <>
                <Link to="/products" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Products
                </Link>
                <Link to="/cart" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium flex items-center gap-1.5">
                  Cart
                </Link>
                <Link to="/orders" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Orders
                </Link>
                <Link to="/profile" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/25 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
                >
                  Logout
                </button>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Dashboard
                </Link>
                <Link to="/admin/products" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Products
                </Link>
                <Link to="/admin/categories" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Categories
                </Link>
                <Link to="/admin/orders" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Orders
                </Link>
                <Link to="/admin/customers" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Customers
                </Link>
                <Link to="/admin/admins" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Admins
                </Link>
                <Link to="/admin/profile" className="hover:bg-white/10 px-4 py-2 rounded-xl transition duration-300 font-medium">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/25 px-4 py-2 rounded-xl transition-all duration-300 font-medium"
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

