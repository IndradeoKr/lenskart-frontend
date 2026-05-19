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
      setTimeout(() => setError(''), 2000);
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setTimeout(() => setError(''), 2000);
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError('Phone number must be 10 digits');
      setTimeout(() => setError(''), 2000);
      return false;
    }
    if (role === 'ADMIN' && adminAvailable) {
      setError('An admin already exists. Only one admin account is allowed.');
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

          <div className="mb-6">
            <label className="form-label">Account Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={role === 'CUSTOMER' ? 'btn-primary flex-1 py-2' : 'btn-secondary flex-1 py-2'}
              >
                Customer
              </button>
              {canChooseAdmin ? (
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={role === 'ADMIN' ? 'btn-primary flex-1 py-2' : 'btn-secondary flex-1 py-2'}
                >
                  Admin
                </button>
              ) : (
                <button type="button" className="btn-secondary flex-1 py-2 opacity-40 cursor-not-allowed" disabled>
                  Admin
                </button>
              )}
            </div>
          </div>

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
                placeholder="Choose a username"
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
                placeholder="10-digit number"
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
                placeholder="Your address"
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
                placeholder="Confirm password"
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
              <Link to={role === 'ADMIN' ? '/admin-login' : '/customer-login'} className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold">
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

