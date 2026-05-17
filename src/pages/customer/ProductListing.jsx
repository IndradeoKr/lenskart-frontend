import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../services/api';
import Navbar from '../../components/Navbar';
import { cartStorage } from '../../services/cartStorage';
import { useAuth } from '../../context/AuthContext';

const ProductListing = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique brands from products
  const getBrands = () => {
    const brands = [...new Set(products.map(p => p.brand))];
    return brands.filter(Boolean);
  };

  const getCategories = () => {
    const cats = [...new Set(products.map((p) => p.category ?? p.categoryName))];
    return cats.filter(Boolean);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedBrand, selectedCategory, priceRange, searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => (p.category ?? p.categoryName) === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(p =>
      p.productPrice >= priceRange[0] && p.productPrice <= priceRange[1]
    );

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.userid) {
      setError('Please login to add items to cart');
      setTimeout(() => setError(''), 2000);
      return;
    }
    cartStorage.addItem(product, 1);
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Our Products</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="md:col-span-1">
              <div className="card sticky top-20">
                <h2 className="text-xl font-bold mb-4">Filters</h2>

                {/* Search */}
                <div className="mb-6">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    placeholder="Product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                  <label className="form-label">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Brands</option>
                    {getBrands().map(brand => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="form-label">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="form-input"
                  >
                    <option value="">All Categories</option>
                    {getCategories().map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <label className="form-label">Price Range</label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    ₹0 - ₹{priceRange[1]}
                  </p>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setSelectedCategory('');
                    setPriceRange([0, 10000]);
                    setSearchTerm('');
                  }}
                  className="w-full btn-secondary"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="md:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-xl">No products found matching your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <Link
                      key={product.productId}
                      to={`/products/${product.productId}`}
                      className="card hover:shadow-lg transition"
                    >
                      <div className="mb-4 bg-gray-200 h-48 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">
                        {product.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Brand: <span className="font-semibold">{product.brand}</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        Category:{' '}
                        <span className="font-semibold">{product.category ?? product.categoryName}</span>
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{product.productPrice}
                        </span>
                        <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                          {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.quantity <= 0}
                        className="w-full btn-primary disabled:opacity-50"
                      >
                        Add to Cart
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductListing;
