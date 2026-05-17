import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const CustomerProfile = () => {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        role: 'CUSTOMER',
      };

      await authApi.updateCustomer(user?.email, password, updateData);
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

  const handleDeleteAccount = async () => {
    if (!password) {
      setError('Please enter your password');
      setTimeout(() => setError(''), 2000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.deleteCustomer(user?.userid);
      setSuccess('Account deleted successfully');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
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
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">My Profile</h1>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Profile Summary</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Username</p>
                    <p className="font-semibold">{user?.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Full Name</p>
                    <p className="font-semibold">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="font-semibold break-all">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <p className="font-semibold">{user?.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Role</p>
                    <p className="font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded inline-block">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="lg:col-span-2">
              {!editing ? (
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Account Details</h2>
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-primary"
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Address</p>
                      <p className="text-lg">{user?.address}</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t pt-6">
                    <button
                      onClick={handleLogout}
                      className="w-full btn-secondary"
                    >
                      Logout
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full btn-danger"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
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

                    <div className="flex gap-3">
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md">
                <h3 className="text-xl font-bold mb-4">Delete Account</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div>
                  <label className="form-label">Enter your password to confirm</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="form-input mb-4"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || !password}
                    className="btn-danger flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setPassword('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerProfile;
