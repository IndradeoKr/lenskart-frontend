import { useMemo, useState, useEffect } from 'react';
import { authApi } from '../../services/api';
import Navbar from '../../components/Navbar';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const upsertCustomer = (customer) => {
    setCustomers((prev) => {
      const next = Array.isArray(prev) ? prev : [];
      const idx = next.findIndex((c) => c.userid === customer.userid);
      if (idx >= 0) {
        const updated = [...next];
        updated[idx] = customer;
        return updated;
      }
      return [customer, ...next];
    });
  };

  // Fetch all customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await authApi.getAllCustomers();
        setCustomers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleFind = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const q = email.trim();
    if (!q) {
      setError('Enter a customer email');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.getCustomerByEmail(q);
      upsertCustomer(res.data);
      setSuccess('Customer loaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Customer not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm(`Delete customer ID ${userId}?`)) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authApi.deleteCustomer(userId);
      setCustomers((prev) => (Array.isArray(prev) ? prev.filter((c) => c.userid !== userId) : []));
      setSuccess('Customer deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const tableRows = useMemo(() => (Array.isArray(customers) ? customers : []), [customers]);

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Customer Management</h1>

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

          <div className="card">
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
              <div className="flex-1">
                <label className="form-label">Find Customer by Email</label>
                <form onSubmit={handleFind} className="flex gap-3">
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                  <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                    Find
                  </button>
                </form>
              </div>
            </div>

            {tableRows.length === 0 ? (
              <p className="text-gray-600">No customers loaded yet.</p>
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
                    {tableRows.map((customer) => (
                      <tr key={customer.userid} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{customer.userid}</td>
                        <td className="px-4 py-3">{customer.userName}</td>
                        <td className="px-4 py-3">{customer.name}</td>
                        <td className="px-4 py-3 break-all">{customer.email}</td>
                        <td className="px-4 py-3">{customer.phoneNumber}</td>
                        <td className="px-4 py-3">{customer.address}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(customer.userid)}
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

export default CustomerManagement;
