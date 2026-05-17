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
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Order Management</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-6">
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
            </div>
          ) : (
            <div className="overflow-x-auto card">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Cart ID</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.orderId} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{order.orderId}</td>
                      <td className="px-4 py-3">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{order.cartId}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {order.status === 'IN_PROGRESS' ? 'In Progress' : 'Delivered'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => {
                            setEditingOrder(order);
                            setNewStatus(order.status);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => handleDelete(order.orderId)}
                          className="px-3 py-1 btn-danger"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md">
                <h3 className="text-xl font-bold mb-4">Update Order Status</h3>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-input mb-4"
                >
                  <option value="IN_PROGRESS" disabled={editingOrder.status === 'DELIVERED'}>
                    In Progress {editingOrder.status === 'DELIVERED' ? '(Cannot revert from Delivered)' : ''}
                  </option>
                  <option value="DELIVERED">Delivered</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateStatus}
                    className="btn-primary flex-1"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setEditingOrder(null)}
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

export default OrderManagement;

