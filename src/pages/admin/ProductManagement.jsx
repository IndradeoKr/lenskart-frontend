import { useState, useEffect } from 'react';
import { productApi, categoryApi } from '../../services/api';
import Navbar from '../../components/Navbar';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [knownCategories, setKnownCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    productPrice: '',
    productImage: '',
    quantity: '',
    brand: '',
    categoryName: '',
  });
  const [categoryMode, setCategoryMode] = useState('select'); // select | custom
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAllProducts();
      setProducts(response.data);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || '';
      const text = typeof msg === 'string' ? msg : '';
      if (text.toLowerCase().includes('no products')) {
        setProducts([]);
        setError('');
      } else {
        setError('Failed to fetch products');
        setTimeout(() => setError(''), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAllCategories();
      const list = Array.isArray(res.data) ? res.data : [];
      const names = list.map((c) => c.categoryName).filter(Boolean);
      setKnownCategories(names);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || '';
      const text = typeof msg === 'string' ? msg : '';
      if (text.toLowerCase().includes('no categories')) {
        setKnownCategories([]);
      } else {
        console.error('Failed to fetch categories', err);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        productPrice: parseFloat(formData.productPrice),
        quantity: parseInt(formData.quantity),
        category: (formData.categoryName || '').trim(),
      };
      delete data.categoryName;

      if (editingId) {
        await productApi.updateProduct({ ...data, productId: editingId });
        setError('');
      } else {
        await productApi.addProduct(data);
      }

      setFormData({
        productName: '',
        productPrice: '',
        productImage: '',
        quantity: '',
        brand: '',
        categoryName: '',
      });
      setCategoryMode('select');
      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await productApi.deleteProduct(productId);
      setProducts((prev) => (Array.isArray(prev) ? prev.filter((p) => p.productId !== productId) : []));
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to delete product');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleEdit = (product) => {
    const categoryValue = product.category ?? product.categoryName ?? '';
    setFormData({
      productName: product.productName ?? '',
      productPrice: String(product.productPrice ?? ''),
      productImage: product.productImage ?? '',
      quantity: String(product.quantity ?? ''),
      brand: product.brand ?? '',
      categoryName: categoryValue,
    });
    setCategoryMode(knownCategories.includes(categoryValue) ? 'select' : 'custom');
    setEditingId(product.productId);
    setShowForm(true);
  };

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
              Product Management
            </h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({
                  productName: '',
                  productPrice: '',
                  productImage: '',
                  quantity: '',
                  brand: '',
                  categoryName: '',
                });
                setCategoryMode('select');
                fetchCategories();
              }}
              className="btn-primary"
            >
              {showForm ? 'Cancel' : 'Add New Product'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm animate-pulse">
              {error}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="card mb-8 bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <span>📦</span> {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="productName"
                  placeholder="Product Name"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="number"
                  name="productPrice"
                  placeholder="Price"
                  value={formData.productPrice}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="form-input"
                />
                <input
                  type="text"
                  name="brand"
                  placeholder="Brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <div className="md:col-span-1">
                  <label className="form-label">Category</label>
                  <select
                    value={categoryMode === 'select' ? formData.categoryName : '__custom'}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '__custom') {
                        setCategoryMode('custom');
                        setFormData((p) => ({ ...p, categoryName: '' }));
                      } else {
                        setCategoryMode('select');
                        setFormData((p) => ({ ...p, categoryName: v }));
                      }
                    }}
                    className="form-input bg-slate-950 text-white"
                    required
                  >
                    <option value="" className="bg-slate-950">Select category</option>
                    {knownCategories.map((c) => (
                      <option key={c} value={c} className="bg-slate-950">
                        {c}
                      </option>
                    ))}
                    <option value="__custom" className="bg-slate-950">Other (type)</option>
                  </select>
                  {categoryMode === 'custom' && (
                    <input
                      type="text"
                      name="categoryName"
                      placeholder="Enter category name"
                      value={formData.categoryName}
                      onChange={handleChange}
                      required
                      className="form-input mt-3"
                    />
                  )}
                </div>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="url"
                  name="productImage"
                  placeholder="Image URL"
                  value={formData.productImage}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <button
                  type="submit"
                  className="md:col-span-2 btn-primary py-3 font-bold"
                >
                  {editingId ? 'Update' : 'Add'} Product
                </button>
              </form>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input bg-slate-900/40 border border-white/5"
            />
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto card bg-slate-900/40 border border-white/5 rounded-2xl p-0">
              <table className="w-full">
                <thead className="bg-slate-950/80 text-indigo-300 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Brand</th>
                    <th className="px-6 py-4 text-left">Category</th>
                    <th className="px-6 py-4 text-left">Price</th>
                    <th className="px-6 py-4 text-left">Quantity</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map(product => (
                    <tr key={product.productId} className="hover:bg-white/5 text-gray-200 transition-colors">
                      <td className="px-6 py-4 font-semibold text-sm">{product.productId}</td>
                      <td className="px-6 py-4 font-bold text-white text-sm">{product.productName}</td>
                      <td className="px-6 py-4 text-sm">{product.brand}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md text-xs font-bold">
                          {product.category ?? product.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-sm text-indigo-400">₹{product.productPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{product.quantity}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3.5 py-1.5 btn-secondary text-xs font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.productId)}
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
        </div>
      </div>
    </>
  );
};

export default ProductManagement;
