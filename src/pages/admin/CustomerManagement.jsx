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
        setTimeout(() => setError(''), 2000);
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
      setTimeout(() => setError(''), 2000);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.getCustomerByEmail(q);
      upsertCustomer(res.data);
      setSuccess('Customer loaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Customer not found');
      setTimeout(() => setError(''), 2000);
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
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const tableRows = useMemo(() => (Array.isArray(customers) ? customers : []), [customers]);

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
            Customer Management
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

          <div className="card bg-slate-900/40 border border-white/5 rounded-2xl p-0 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1 max-w-md">
                  <label className="form-label mb-2">Find Customer by Email</label>
                  <form onSubmit={handleFind} className="flex gap-3">
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                    />
                    <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50 font-bold px-6">
                      Find
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {tableRows.length === 0 ? (
              <p className="text-gray-400 p-6">No customers loaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-950/80 text-indigo-300 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Username</th>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Phone</th>
                      <th className="px-6 py-4 text-left">Address</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableRows.map((customer) => (
                      <tr key={customer.userid} className="hover:bg-white/5 text-gray-200 transition-colors">
                        <td className="px-6 py-4 font-semibold text-sm">{customer.userid}</td>
                        <td className="px-6 py-4 font-bold text-white text-sm">{customer.userName}</td>
                        <td className="px-6 py-4 text-sm">{customer.name}</td>
                        <td className="px-6 py-4 text-sm break-all font-semibold text-indigo-300">{customer.email}</td>
                        <td className="px-6 py-4 text-sm">{customer.phoneNumber}</td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">{customer.address}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(customer.userid)}
                            disabled={loading}
                            className="px-3.5 py-1.5 btn-danger text-xs font-bold disabled:opacity-50"
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
