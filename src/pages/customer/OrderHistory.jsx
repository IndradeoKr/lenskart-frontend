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
      setError('Failed to fetch orders');
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
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = statusFilter
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  const getStatusBadge = (status) => {
    const colors = {
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      DELIVERED: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Order History</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6">
            <label className="form-label">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input max-w-xs"
            >
              <option value="">All Orders</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">
                {orders.length === 0 ? 'No orders yet' : 'No orders matching the filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.orderId} className="card">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Order ID</p>
                      <p className="font-semibold text-lg">{order.orderId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Date</p>
                      <p className="font-semibold">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Cart ID</p>
                      <p className="font-semibold">{order.cartId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}>
                        {order.status === 'IN_PROGRESS' ? 'In Progress' : 'Delivered'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Order Time</p>
                      <p className="font-semibold">{new Date(order.date).toLocaleTimeString()}</p>
                    </div>
                    <div className="md:text-right">
                      {order.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => handleCancel(order.orderId)}
                          disabled={cancellingId === order.orderId}
                          className="btn-danger disabled:opacity-50"
                        >
                          {cancellingId === order.orderId ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
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
