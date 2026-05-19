import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailLookup, setEmailLookup] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authApi.getAllAdmins();
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || '';
      const text = typeof msg === 'string' ? msg : '';
      if (text.toLowerCase().includes('no admins')) {
        setAdmins([]);
      } else {
        setError(text || 'Failed to load admins');
        setTimeout(() => setError(''), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const upsertAdmin = (admin) => {
    setAdmins((prev) => {
      const next = Array.isArray(prev) ? prev : [];
      const idx = next.findIndex((a) => a.userid === admin.userid);
      if (idx >= 0) {
        const updated = [...next];
        updated[idx] = admin;
        return updated;
      }
      return [admin, ...next];
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const adminData = {
        ...formData,
        phoneNumber: Number(formData.phoneNumber),
        role: 'ADMIN',
      };

      await authApi.adminRegister(adminData);
      setSuccess('Admin added successfully!');
      setFormData({
        userName: '',
        password: '',
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
      });
      setShowForm(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add admin');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleFindByEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const q = emailLookup.trim();
    if (!q) {
      setError('Enter an admin email');
      setTimeout(() => setError(''), 2000);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.getAdminByEmail(q);
      upsertAdmin(res.data);
      setSuccess('Admin loaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin not found');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm(`Delete admin ID ${adminId}?`)) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authApi.deleteAdmin(adminId);
      setAdmins((prev) => (Array.isArray(prev) ? prev.filter((a) => a.userid !== adminId) : []));
      setSuccess('Admin deleted');
      if (user?.role === 'ADMIN' && Number(user?.userid) === Number(adminId)) {
        logout();
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const tableRows = useMemo(() => (Array.isArray(admins) ? admins : []), [admins]);

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
              Admin Management
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? 'Cancel' : 'Add New Admin'}
            </button>
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

          <div className="card mb-8 bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-3">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🛡️</span> Search Administrators
              </h2>
              <button onClick={fetchAdmins} disabled={loading} className="btn-secondary py-1.5 px-4 text-xs font-bold disabled:opacity-50">
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            <form onSubmit={handleFindByEmail} className="flex gap-3">
              <input
                type="email"
                value={emailLookup}
                onChange={(e) => setEmailLookup(e.target.value)}
                placeholder="Enter email to find"
                className="form-input max-w-md bg-slate-950/60"
              />
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50 font-bold px-6">
                Find
              </button>
            </form>
          </div>

          {showForm && (
            <div className="card mb-8 bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3">Add New Admin</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="userName"
                  placeholder="Username"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  maxLength="10"
                  className="form-input"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="md:col-span-2 btn-primary py-3 font-bold disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Admin'}
                </button>
              </form>
            </div>
          )}

          <div className="card bg-slate-900/40 border border-white/5 rounded-2xl p-0 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>👥</span> Known Admins
              </h2>
              <p className="text-xs text-gray-400 font-semibold mt-1">Use the search box above to add administrative accounts here.</p>
            </div>

            {tableRows.length === 0 ? (
              <p className="text-gray-400 p-6">No admins loaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-950/80 text-indigo-300 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Username</th>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Phone</th>
                      <th className="px-6 py-4 text-left">Address</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableRows.map((admin) => (
                      <tr key={admin.userid} className="hover:bg-white/5 text-gray-200 transition-colors">
                        <td className="px-6 py-4 font-semibold text-sm">{admin.userid}</td>
                        <td className="px-6 py-4 font-bold text-white text-sm">{admin.userName}</td>
                        <td className="px-6 py-4 text-sm">{admin.name}</td>
                        <td className="px-6 py-4 text-sm break-all font-semibold text-indigo-300">{admin.email}</td>
                        <td className="px-6 py-4 text-sm">{admin.phoneNumber}</td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">{admin.address}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteAdmin(admin.userid)}
                            disabled={loading}
                            className="px-3.5 py-1.5 btn-danger text-xs font-bold disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminManagement;
