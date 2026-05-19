import { useState, useEffect } from 'react';
import { orderApi } from '../../services/api';
import Navbar from '../../components/Navbar';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getAllOrders();
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await orderApi.updateOrder({
        orderId: editingOrder.orderId,
        date: editingOrder.date,
        status: newStatus,
        cartId: editingOrder.cartId,
      });
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || typeof err.response?.data === 'string' ? err.response.data : 'Failed to update order');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await orderApi.deleteOrder(orderId);
      fetchOrders();
    } catch (err) {
      setError('Failed to delete order');
      setTimeout(() => setError(''), 2000);
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
            Order Management
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm animate-pulse">
              {error}
            </div>
          )}

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
            </div>
          ) : (
            <div className="overflow-x-auto card bg-slate-900/40 border border-white/5 rounded-2xl p-0 shadow-2xl">
              <table className="w-full">
                <thead className="bg-slate-950/80 text-indigo-300 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left">Order ID</th>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Cart ID</th>
                    <th className="px-6 py-4 text-left">Customer Email</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map(order => (
                    <tr key={order.orderId} className="hover:bg-white/5 text-gray-200 transition-colors">
                      <td className="px-6 py-4 font-semibold text-sm">{order.orderId}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{order.cartId}</td>
                      <td className="px-6 py-4 font-bold text-white text-sm">
                        {order.customerEmail || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                            order.status === 'IN_PROGRESS'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                          }`}
                        >
                          {order.status === 'IN_PROGRESS' ? 'In Progress' : 'Delivered'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => {
                            setEditingOrder(order);
                            setNewStatus(order.status);
                          }}
                          className="px-3.5 py-1.5 btn-secondary text-xs font-bold"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => handleDelete(order.orderId)}
                          className="px-3.5 py-1.5 btn-danger text-xs font-bold"
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

          {editingOrder && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-up">
              <div className="glass-card max-w-md w-full border border-white/10">
                <h3 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span>📋</span> Update Order Status
                </h3>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-input mb-6 bg-slate-950 text-white"
                >
                  <option value="IN_PROGRESS" disabled={editingOrder.status === 'DELIVERED'}>
                    In Progress {editingOrder.status === 'DELIVERED' ? '(Cannot revert from Delivered)' : ''}
                  </option>
                  <option value="DELIVERED">Delivered</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateStatus}
                    className="btn-primary flex-1 py-2.5 font-bold"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="btn-secondary flex-1 py-2.5 font-semibold"
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

export default OrderManagement;

