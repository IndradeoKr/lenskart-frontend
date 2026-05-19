import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const AdminProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password to update profile');
      setTimeout(() => setError(''), 2000);
      return;
    }

    if ((newPassword || confirmNewPassword) && newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setTimeout(() => setError(''), 2000);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      setTimeout(() => setError(''), 2000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const nextPassword = newPassword ? newPassword : password;
      const updateData = {
        userName: user?.userName,
        password: nextPassword,
        name: formData.name,
        email: formData.email,
        phoneNumber: Number(formData.phoneNumber),
        address: formData.address,
        role: 'ADMIN',
      };

      await authApi.updateAdmin(user?.email, password, updateData);
      updateUser({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
            Admin Profile
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <div className="card bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span>👤</span> Profile Summary
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Username</p>
                    <p className="font-bold text-white text-lg">{user?.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Full Name</p>
                    <p className="font-bold text-white text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Email</p>
                    <p className="font-bold text-white text-lg break-all">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Phone</p>
                    <p className="font-bold text-white text-lg">{user?.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Role</p>
                    <p className="font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-xl text-sm inline-block">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="lg:col-span-2">
              {!editing ? (
                <div className="card bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>🏠</span> Account Details
                    </h2>
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-primary"
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Address</p>
                      <p className="text-lg text-white font-medium bg-slate-950/40 border border-white/5 p-4 rounded-xl leading-relaxed">
                        {user?.address}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
                    <button
                      onClick={handleLogout}
                      className="w-full btn-secondary"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
                  <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3 flex items-center gap-2">
                    <span>✏️</span> Edit Profile
                  </h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-input"
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
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your current password"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">New Password (optional)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="form-input"
                        disabled={!newPassword}
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Profile'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setPassword('');
                          setNewPassword('');
                          setConfirmNewPassword('');
                          setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phoneNumber: user?.phoneNumber || '',
                            address: user?.address || '',
                          });
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
