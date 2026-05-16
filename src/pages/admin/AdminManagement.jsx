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
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.getAdminByEmail(q);
      upsertAdmin(res.data);
      setSuccess('Admin loaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin not found');
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
    } finally {
      setLoading(false);
    }
  };

  const tableRows = useMemo(() => (Array.isArray(admins) ? admins : []), [admins]);

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Admin Management</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? 'Cancel' : 'Add New Admin'}
            </button>
          </div>

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

          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Admins</h2>
              <button onClick={fetchAdmins} disabled={loading} className="btn-secondary disabled:opacity-50">
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            <form onSubmit={handleFindByEmail} className="flex gap-3">
              <input
                type="email"
                value={emailLookup}
                onChange={(e) => setEmailLookup(e.target.value)}
                placeholder="Find by email"
                className="form-input"
              />
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                Find
              </button>
            </form>
          </div>

          {showForm && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">Add New Admin</h2>
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
                  className="md:col-span-2 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Admin'}
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Known Admins</h2>
              <p className="text-sm text-gray-600">Use Find to populate.</p>
            </div>

            {tableRows.length === 0 ? (
              <p className="text-gray-600">No admins loaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Username</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Address</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((admin) => (
                      <tr key={admin.userid} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{admin.userid}</td>
                        <td className="px-4 py-3">{admin.userName}</td>
                        <td className="px-4 py-3">{admin.name}</td>
                        <td className="px-4 py-3 break-all">{admin.email}</td>
                        <td className="px-4 py-3">{admin.phoneNumber}</td>
                        <td className="px-4 py-3">{admin.address}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteAdmin(admin.userid)}
                            disabled={loading}
                            className="px-3 py-1 btn-danger disabled:opacity-50"
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
