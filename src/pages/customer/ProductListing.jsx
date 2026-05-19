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
      <div className="bg-slate-950 min-h-screen py-12 relative overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            Explore Our Products
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm animate-pulse">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="md:col-span-1">
              <div className="card sticky top-28 bg-slate-900/60 border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
                <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span>🎯</span> Filters
                </h2>

                {/* Search */}
                <div className="mb-6">
                  <label className="form-label">Search Product</label>
                  <input
                    type="text"
                    placeholder="Search by name..."
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
                    className="form-input bg-slate-950 text-white"
                  >
                    <option value="" className="bg-slate-950">All Brands</option>
                    {getBrands().map(brand => (
                      <option key={brand} value={brand} className="bg-slate-950">
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
                    className="form-input bg-slate-950 text-white"
                  >
                    <option value="" className="bg-slate-950">All Categories</option>
                    {getCategories().map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-950">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="form-label mb-0">Max Price</label>
                    <span className="text-sm font-semibold text-indigo-400">₹{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setSelectedBrand('');
                    setSelectedCategory('');
                    setPriceRange([0, 10000]);
                    setSearchTerm('');
                  }}
                  className="w-full btn-secondary mt-2"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="md:col-span-3">
              {loading ? (
                <div className="text-center py-24">
                  <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="text-gray-400 mt-6 font-semibold">Loading awesome products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-24 card border border-white/5 bg-slate-900/30">
                  <span className="text-5xl mb-4 block">🔍</span>
                  <p className="text-gray-300 text-xl font-bold">No products found matching your filters</p>
                  <p className="text-gray-500 mt-2">Try adjusting your filter options in the sidebar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map(product => (
                    <Link
                      key={product.productId}
                      to={`/products/${product.productId}`}
                      className="card group hover:-translate-y-2.5 transition-all duration-500 border border-white/5 hover:border-indigo-500/30 bg-slate-900/40 hover:shadow-[0_20px_45px_rgba(99,102,241,0.15)] flex flex-col justify-between overflow-hidden relative"
                    >
                      <div>
                        <div className="mb-4 bg-slate-800/40 h-52 rounded-xl flex items-center justify-center overflow-hidden border border-white/5 relative group-hover:border-indigo-500/20 transition-all duration-300">
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="w-full h-full object-cover group-hover:scale-105 duration-700 ease-out"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                        </div>
                        
                        <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold inline-block mb-3">
                          {product.category ?? product.categoryName}
                        </span>

                        <h3 className="font-bold text-xl mb-2 text-white group-hover:text-indigo-300 transition-colors duration-300 leading-tight">
                          {product.productName}
                        </h3>
                        
                        <p className="text-sm text-gray-400 mb-4 flex items-center gap-1">
                          <span>🏷️</span> Brand: <span className="font-semibold text-gray-200">{product.brand}</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-5 border-t border-white/5 pt-4">
                          <span className="text-2xl font-black text-indigo-400">
                            ₹{product.productPrice}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                            product.quantity > 0 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.quantity <= 0}
                          className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                        >
                          <span>🛒</span> Add to Cart
                        </button>
                      </div>
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
