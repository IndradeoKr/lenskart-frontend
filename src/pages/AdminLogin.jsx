import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import Navbar from '../components/Navbar';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/products');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        navigate(storedUser.role === 'ADMIN' ? '/admin/dashboard' : '/products');
      } catch {
        navigate('/');
      }
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      const userData = response.data;

      // Verify it's an admin
      if (userData.role !== 'ADMIN') {
        setError('This account is not an admin account. Please use the customer login.');
        setTimeout(() => setError(''), 2000);
        setLoading(false);
        return;
      }

      // Store user data and redirect
      login(userData);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 relative overflow-hidden flex items-center justify-center px-4">
        
        {/* Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="glass-card w-full max-w-md animate-fade-in-up z-10">
          <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent animate-pulse-glow">
            Admin Login
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="admin@email.com"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300 transform active:scale-95 py-3.5 text-lg disabled:opacity-50 flex items-center justify-center animate-pulse-glow"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
            <p className="text-gray-400 font-medium">
              Don't have an admin account?{' '}
              <Link to="/admin-register" className="text-purple-400 hover:text-purple-300 hover:underline font-semibold">
                Register here
              </Link>
            </p>
            <p className="text-gray-400 font-medium text-sm">
              Are you a customer?{' '}
              <Link to="/customer-login" className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold">
                Customer Gateway
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

