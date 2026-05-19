import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/products');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 2000);
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setTimeout(() => setError(''), 2000);
      return false;
    }
    if (formData.phoneNumber.length !== 10) {
      setError('Phone number must be 10 digits');
      setTimeout(() => setError(''), 2000);
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Phone number must contain only digits');
      setTimeout(() => setError(''), 2000);
      return false;
    }
    return true;
  };

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
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const customerData = {
        userName: formData.userName,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phoneNumber: Number(formData.phoneNumber),
        address: formData.address,
        role: 'CUSTOMER',
      };

      await authApi.customerRegister(customerData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/customer-login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 relative overflow-hidden py-16 px-4">
        
        {/* Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="glass-card w-full max-w-md mx-auto animate-fade-in-up z-10">
          <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
            Create Account
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl font-medium text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Choose a username (4-20 chars)"
                minLength={4}
                maxLength={20}
              />
            </div>

            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="10-digit phone number"
                maxLength={10}
              />
            </div>

            <div>
              <label className="form-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Your delivery address"
                rows={3}
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-lg font-bold disabled:opacity-50 flex items-center justify-center animate-pulse-glow"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 font-medium">
              Already have an account?{' '}
              <Link to="/customer-login" className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerRegister;

