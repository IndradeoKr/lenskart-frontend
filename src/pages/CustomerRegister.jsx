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
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.phoneNumber.length !== 10) {
      setError('Phone number must be 10 digits');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Phone number must contain only digits');
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Create Account
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full btn-primary py-2 text-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/customer-login" className="text-blue-600 hover:underline font-semibold">
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

