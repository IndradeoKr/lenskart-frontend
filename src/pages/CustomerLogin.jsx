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
        setLoading(false);
        return;
      }

      // Store user data and redirect
      login(userData);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Customer Login
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full btn-primary py-2 text-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">
              Don't have an account?{' '}
              <Link to="/customer-register" className="text-blue-600 hover:underline font-semibold">
                Register here
              </Link>
            </p>
            <p className="text-gray-600">
              Are you an admin?{' '}
              <Link to="/admin-login" className="text-purple-600 hover:underline font-semibold">
                Admin Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerLogin;

