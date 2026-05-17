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
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Category Management</h1>
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
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Find Category by ID</h2>
              <form onSubmit={handleLookupById} className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="Category ID"
                  className="form-input"
                />
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  Find
                </button>
              </form>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Find Category by Name</h2>
              <form onSubmit={handleLookupByName} className="flex gap-3">
                <input
                  type="text"
                  value={lookupName}
                  onChange={(e) => setLookupName(e.target.value)}
                  placeholder="Category name"
                  className="form-input"
                />
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  Find
                </button>
              </form>
            </div>
          </div>

          {showForm && (
            <div className="card mb-8 max-w-md">
              <h2 className="text-2xl font-bold mb-6">
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
                <button type="submit" className="btn-primary w-full">
                  {editingId ? 'Update' : 'Add'} Category
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">All Categories</h2>
              <button onClick={fetchAll} disabled={loading} className="btn-secondary disabled:opacity-50">
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {tableRows.length === 0 ? (
              <p className="text-gray-600">No categories found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((c) => (
                      <tr key={c.categoryId} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{c.categoryId}</td>
                        <td className="px-4 py-3">{c.categoryName}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => {
                              setEditingId(c.categoryId);
                              setFormData({ categoryName: c.categoryName });
                              setShowForm(true);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDelete(c.categoryId)} className="px-3 py-1 btn-danger">
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
