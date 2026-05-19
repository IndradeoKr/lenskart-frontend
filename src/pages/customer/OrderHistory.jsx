import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { orderApi } from '../../services/api';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (user?.userid) {
        const res = await orderApi.getCustomerOrders(user.userid);
        setOrders(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || '';
      const text = typeof msg === 'string' ? msg : '';
      if (text.toLowerCase().includes('no orders')) {
        setOrders([]);
        setError('');
      } else {
        setError('Failed to fetch orders');
        setTimeout(() => setError(''), 2000);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm(`Cancel order ${orderId}?`)) return;
    setError('');
    setCancellingId(orderId);
    try {
      await orderApi.deleteOrder(orderId);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to cancel order');
      setTimeout(() => setError(''), 2000);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  const getStatusBadge = (status) => {
    const colors = {
      IN_PROGRESS: 'bg-amber-950/60 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black shadow-[0_0_12px_rgba(245,158,11,0.15)] uppercase tracking-wider',
      DELIVERED: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-black shadow-[0_0_12px_rgba(16,185,129,0.15)] uppercase tracking-wider',
    };
    return colors[status] || 'bg-slate-800 text-slate-300 border border-white/5 px-3 py-1 rounded-full text-xs font-bold';
  };

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
            Order History
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm animate-pulse">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-8 card bg-slate-900/40 border border-white/5 p-4 rounded-xl max-w-md">
            <label className="form-label mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input bg-slate-950 text-white border-white/10"
            >
              <option value="" className="bg-slate-950">All Orders</option>
              <option value="IN_PROGRESS" className="bg-slate-950">In Progress</option>
              <option value="DELIVERED" className="bg-slate-950">Delivered</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="text-gray-400 mt-4 font-semibold">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20 card border border-white/5 bg-slate-900/30">
              <span className="text-5xl mb-4 block">📦</span>
              <p className="text-xl text-gray-300 font-bold">
                {orders.length === 0 ? 'No orders yet' : 'No orders matching the filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.orderId} className="card bg-slate-900/40 border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-bold text-white text-lg">{order.orderId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Date</p>
                      <p className="font-bold text-white">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Cart ID</p>
                      <p className="font-bold text-white">{order.cartId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Status</p>
                      <span className={`${getStatusBadge(order.status)}`}>
                        {order.status === 'IN_PROGRESS' ? 'In Progress' : 'Delivered'}
                      </span>
                    </div>
                    <div className="md:text-right">
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Time</p>
                      <p className="font-bold text-white">{new Date(order.date).toLocaleTimeString()}</p>
                    </div>
                    <div className="md:text-right">
                      {order.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => handleCancel(order.orderId)}
                          disabled={cancellingId === order.orderId}
                          className="btn-danger py-1.5 px-4 text-xs font-bold disabled:opacity-50"
                        >
                          {cancellingId === order.orderId ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500 font-semibold">-</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
