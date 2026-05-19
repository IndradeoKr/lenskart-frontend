import { useEffect, useMemo, useState } from 'react';
import { categoryApi } from '../../services/api';
import Navbar from '../../components/Navbar';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ categoryName: '' });
  const [lookupId, setLookupId] = useState('');
  const [lookupName, setLookupName] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await categoryApi.getAllCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || '';
      const text = typeof msg === 'string' ? msg : '';
      if (text.toLowerCase().includes('no categories')) {
        setCategories([]);
      } else {
        setError(text || 'Failed to fetch categories');
        setTimeout(() => setError(''), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ categoryName: e.target.value });
  };

  const upsertCategory = (category) => {
    setCategories((prev) => {
      const next = Array.isArray(prev) ? prev : [];
      const idx = next.findIndex((c) => c.categoryId === category.categoryId);
      if (idx >= 0) {
        const updated = [...next];
        updated[idx] = category;
        return updated;
      }
      return [category, ...next];
    });
  };

  const handleLookupById = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const id = Number(lookupId);
    if (!Number.isFinite(id) || id <= 0) {
      setError('Enter a valid category ID');
      setTimeout(() => setError(''), 2000);
      return;
    }
    setLoading(true);
    try {
      const res = await categoryApi.getCategoryById(id);
      upsertCategory(res.data);
      setSuccess('Category loaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Category not found');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupByName = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const name = lookupName.trim();
    if (!name) {
      setError('Enter a category name');
      setTimeout(() => setError(''), 2000);
      return;
    }
    setLoading(true);
    try {
      const res = await categoryApi.getCategoryByName(name);
      upsertCategory(res.data);
      setSuccess('Category loaded');
    } catch (err) {
      setError(err.response?.data?.message || 'Category not found');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await categoryApi.updateCategory(editingId, formData.categoryName);
        upsertCategory({ categoryId: editingId, categoryName: formData.categoryName });
        setSuccess('Category updated');
      } else {
        await categoryApi.addCategory(formData);
        setSuccess('Category added');
      }
      setFormData({ categoryName: '' });
      setShowForm(false);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure?')) return;
    setError('');
    setSuccess('');
    try {
      await categoryApi.deleteCategory(categoryId);
      setCategories((prev) => (Array.isArray(prev) ? prev.filter((c) => c.categoryId !== categoryId) : []));
      setSuccess('Category deleted');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to delete category');
      setTimeout(() => setError(''), 2000);
    }
  };

  const tableRows = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
              Category Management
            </h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ categoryName: '' });
              }}
              className="btn-primary"
            >
              {showForm ? 'Cancel' : 'Add New Category'}
            </button>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">Find Category by ID</h2>
              <form onSubmit={handleLookupById} className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="Category ID"
                  className="form-input"
                />
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50 font-bold px-6">
                  Find
                </button>
              </form>
            </div>

            <div className="card bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-white">Find Category by Name</h2>
              <form onSubmit={handleLookupByName} className="flex gap-3">
                <input
                  type="text"
                  value={lookupName}
                  onChange={(e) => setLookupName(e.target.value)}
                  placeholder="Category name"
                  className="form-input"
                />
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50 font-bold px-6">
                  Find
                </button>
              </form>
            </div>
          </div>

          {showForm && (
            <div className="card mb-8 max-w-md bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Category Name"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                  className="form-input mb-4"
                />
                <button type="submit" className="btn-primary w-full py-3 font-bold">
                  {editingId ? 'Update' : 'Add'} Category
                </button>
              </form>
            </div>
          )}

          <div className="card bg-slate-900/40 border border-white/5 rounded-2xl p-0 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🏷️</span> All Categories
              </h2>
              <button onClick={fetchAll} disabled={loading} className="btn-secondary py-1.5 px-4 text-xs font-bold disabled:opacity-50">
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {tableRows.length === 0 ? (
              <p className="text-gray-400 p-6">No categories found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-950/80 text-indigo-300 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableRows.map((c) => (
                      <tr key={c.categoryId} className="hover:bg-white/5 text-gray-200 transition-colors">
                        <td className="px-6 py-4 font-semibold text-sm">{c.categoryId}</td>
                        <td className="px-6 py-4 font-bold text-white text-sm">{c.categoryName}</td>
                        <td className="px-6 py-4 space-x-2">
                          <button
                            onClick={() => {
                              setEditingId(c.categoryId);
                              setFormData({ categoryName: c.categoryName });
                              setShowForm(true);
                            }}
                            className="px-3 py-1.5 btn-secondary text-xs font-bold"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDelete(c.categoryId)} className="px-3 py-1.5 btn-danger text-xs font-bold">
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

export default CategoryManagement;
