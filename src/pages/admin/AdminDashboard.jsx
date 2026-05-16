import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, orderApi, authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalAdmins: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch products
      const productsRes = await productApi.getAllProducts();
      const products = productsRes.data || [];

      // Fetch orders
      const ordersRes = await orderApi.getAllOrders();
      const orders = ordersRes.data || [];

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomers: orders.length > 0 ? 1 : 0, // Simplified count
        totalAdmins: 1,
      });
    } catch (err) {
      setError('Failed to fetch dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`card ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-5xl opacity-20">{icon}</div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600">Here's your dashboard overview</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading dashboard...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                  title="Total Products"
                  value={stats.totalProducts}
                  icon="📦"
                  color="bg-blue-50"
                />
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  icon="📊"
                  color="bg-green-50"
                />
                <StatCard
                  title="Total Customers"
                  value={stats.totalCustomers}
                  icon="👥"
                  color="bg-yellow-50"
                />
                <StatCard
                  title="Total Admins"
                  value={stats.totalAdmins}
                  icon="👨‍💼"
                  color="bg-purple-50"
                />
              </div>

              {/* Management Sections */}
              <div className="card mb-8">
                <h2 className="text-2xl font-bold mb-6">Management Sections</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    to="/admin/products"
                    className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition"
                  >
                    <p className="text-2xl mb-2">📦</p>
                    <h3 className="font-semibold text-lg">Product Management</h3>
                    <p className="text-gray-600 text-sm">Manage all products</p>
                  </Link>

                  <Link
                    to="/admin/categories"
                    className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition"
                  >
                    <p className="text-2xl mb-2">🏷️</p>
                    <h3 className="font-semibold text-lg">Category Management</h3>
                    <p className="text-gray-600 text-sm">Manage categories</p>
                  </Link>

                  <Link
                    to="/admin/orders"
                    className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition"
                  >
                    <p className="text-2xl mb-2">📋</p>
                    <h3 className="font-semibold text-lg">Order Management</h3>
                    <p className="text-gray-600 text-sm">Manage all orders</p>
                  </Link>

                  <Link
                    to="/admin/customers"
                    className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition"
                  >
                    <p className="text-2xl mb-2">👥</p>
                    <h3 className="font-semibold text-lg">Customer Management</h3>
                    <p className="text-gray-600 text-sm">Manage customers</p>
                  </Link>

                  <Link
                    to="/admin/admins"
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition"
                  >
                    <p className="text-2xl mb-2">👨‍💼</p>
                    <h3 className="font-semibold text-lg">Admin Management</h3>
                    <p className="text-gray-600 text-sm">Manage admins</p>
                  </Link>

                  <Link
                    to="/admin/profile"
                    className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <p className="text-2xl mb-2">⚙️</p>
                    <h3 className="font-semibold text-lg">My Profile</h3>
                    <p className="text-gray-600 text-sm">Edit your profile</p>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

