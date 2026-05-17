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
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Product Management</h1>
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
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Edit Product' : 'Add New Product'}
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
                    className="form-input"
                    required
                  >
                    <option value="">Select category</option>
                    {knownCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom">Other (type)</option>
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
                  className="md:col-span-2 btn-primary"
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
              className="form-input"
            />
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto card">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Brand</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.productId} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{product.productId}</td>
                      <td className="px-4 py-3">{product.productName}</td>
                      <td className="px-4 py-3">{product.brand}</td>
                      <td className="px-4 py-3">{product.category ?? product.categoryName}</td>
                      <td className="px-4 py-3">₹{product.productPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">{product.quantity}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.productId)}
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
        </div>
      </div>
    </>
  );
};

export default ProductManagement;
