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
      setTimeout(() => setError(''), 2000);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="card bg-slate-900/40 border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
          <p className="text-4xl font-black text-white">{value}</p>
        </div>
        <div className="text-5xl opacity-40">{icon}</div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-10 border-b border-white/10 pb-6 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-400 font-medium">System Administration Overview</p>
            </div>
            <button 
              onClick={fetchStats}
              className="btn-secondary py-2 px-4 text-xs font-bold"
            >
              🔄 Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm animate-pulse">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="text-gray-400 mt-4 font-semibold">Loading stats...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                  title="Total Products"
                  value={stats.totalProducts}
                  icon="📦"
                />
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  icon="📊"
                />
                <StatCard
                  title="Total Customers"
                  value={stats.totalCustomers}
                  icon="👥"
                />
                <StatCard
                  title="Total Admins"
                  value={stats.totalAdmins}
                  icon="👨‍💼"
                />
              </div>

              {/* Management Sections */}
              <div className="card bg-slate-900/40 border border-white/5 p-8 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-2 border-b border-white/10 pb-3">
                  <span>🛠️</span> Administration Hub
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link
                    to="/admin/products"
                    className="p-5 bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 rounded-xl hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] transition-all duration-300 group"
                  >
                    <p className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">📦</p>
                    <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-indigo-300 transition-colors">Product Catalog</h3>
                    <p className="text-gray-400 text-xs font-medium">Add, update and remove inventory items</p>
                  </Link>

                  <Link
                    to="/admin/categories"
                    className="p-5 bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 rounded-xl hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] transition-all duration-300 group"
                  >
                    <p className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">🏷️</p>
                    <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-indigo-300 transition-colors">Category Manager</h3>
                    <p className="text-gray-400 text-xs font-medium">Create and filter item categories</p>
                  </Link>

                  <Link
                    to="/admin/orders"
                    className="p-5 bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 rounded-xl hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] transition-all duration-300 group"
                  >
                    <p className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">📋</p>
                    <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-indigo-300 transition-colors">Order Fullfillment</h3>
                    <p className="text-gray-400 text-xs font-medium">Track customer orders and update status</p>
                  </Link>

                  <Link
                    to="/admin/customers"
                    className="p-5 bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 rounded-xl hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] transition-all duration-300 group"
                  >
                    <p className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">👥</p>
                    <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-indigo-300 transition-colors">User Profiles</h3>
                    <p className="text-gray-400 text-xs font-medium">View registered customers and history</p>
                  </Link>

                  <Link
                    to="/admin/admins"
                    className="p-5 bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 rounded-xl hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] transition-all duration-300 group"
                  >
                    <p className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">👨‍💼</p>
                    <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-indigo-300 transition-colors">Staff Accounts</h3>
                    <p className="text-gray-400 text-xs font-medium">Manage administrators credentials</p>
                  </Link>

                  <Link
                    to="/admin/profile"
                    className="p-5 bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 rounded-xl hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(99,102,241,0.1)] transition-all duration-300 group"
                  >
                    <p className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 inline-block">⚙️</p>
                    <h3 className="font-bold text-lg text-white mb-1.5 group-hover:text-indigo-300 transition-colors">Admin Settings</h3>
                    <p className="text-gray-400 text-xs font-medium">Edit system account configuration</p>
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

