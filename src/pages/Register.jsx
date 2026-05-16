import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('CUSTOMER');
  const [adminAvailable, setAdminAvailable] = useState(false);
  const [checkingAdmins, setCheckingAdmins] = useState(true);

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
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/products');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const checkAdmins = async () => {
      setCheckingAdmins(true);
      try {
        const res = await authApi.getAllAdmins();
        const list = Array.isArray(res.data) ? res.data : [];
        setAdminAvailable(list.length > 0);
        if (list.length > 0 && role === 'ADMIN') setRole('CUSTOMER');
      } catch {
        setAdminAvailable(false);
      } finally {
        setCheckingAdmins(false);
      }
    };
    checkAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canChooseAdmin = useMemo(() => !checkingAdmins && !adminAvailable, [checkingAdmins, adminAvailable]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
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
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Phone number must be 10 digits');
      return false;
    }
    if (role === 'ADMIN' && adminAvailable) {
      setError('An admin already exists. Only one admin account is allowed.');
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

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        userName: formData.userName,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phoneNumber: Number(formData.phoneNumber),
        address: formData.address,
        role,
      };

      if (role === 'ADMIN') {
        await authApi.adminRegister(payload);
      } else {
        await authApi.customerRegister(payload);
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate(role === 'ADMIN' ? '/admin-login' : '/customer-login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">Create Account</h1>

          <div className="mb-6">
            <label className="form-label">Account Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={role === 'CUSTOMER' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
              >
                Customer
              </button>
              {canChooseAdmin ? (
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={role === 'ADMIN' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
                >
                  Admin
                </button>
              ) : (
                <button type="button" className="btn-secondary flex-1 opacity-50 cursor-not-allowed" disabled>
                  Admin
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>
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
                minLength={4}
                maxLength={20}
              />
            </div>

            <div>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" />
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
                maxLength={10}
              />
            </div>

            <div>
              <label className="form-label">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required className="form-input" rows={3} />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input" />
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
              />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-2 text-lg font-semibold disabled:opacity-50">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to={role === 'ADMIN' ? '/admin-login' : '/customer-login'} className="text-blue-600 hover:underline font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

