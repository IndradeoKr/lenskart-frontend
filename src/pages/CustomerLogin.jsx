import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import Navbar from '../components/Navbar';

const CustomerLogin = () => {
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
      // Use the login endpoint which validates credentials
      const response = await authApi.login(email, password);
      const userData = response.data;

      // Verify it's a customer
      if (userData.role !== 'CUSTOMER') {
        setError('This account is not a customer account. Please use the admin login.');
        setTimeout(() => setError(''), 2000);
        setLoading(false);
        return;
      }

      // Store user data and redirect
      login(userData);
      navigate('/products');
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
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="glass-card w-full max-w-md animate-fade-in-up z-10">
          <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
            Customer Login
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
                placeholder="your@email.com"
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
              className="w-full btn-primary py-3.5 text-lg font-bold disabled:opacity-50 flex items-center justify-center animate-pulse-glow"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
            <p className="text-gray-400 font-medium">
              Don't have an account?{' '}
              <Link to="/customer-register" className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold">
                Register here
              </Link>
            </p>
            <p className="text-gray-400 font-medium text-sm">
              Are you an admin?{' '}
              <Link to="/admin-login" className="text-purple-400 hover:text-purple-300 hover:underline font-semibold">
                Admin Gateway
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerLogin;

