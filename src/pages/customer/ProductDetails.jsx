import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { cartStorage } from '../../services/cartStorage';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProductById(productId);
      setProduct(response.data);
    } catch (err) {
      setError('Failed to fetch product details');
      setTimeout(() => setError(''), 2000);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user?.userid) {
      setError('Please login to add items to cart');
      setTimeout(() => setError(''), 2000);
      return;
    }

    setAddingToCart(true);
    setError('');
    setSuccess('');

    try {
      cartStorage.addItem(
        {
          productId: Number(productId),
          productName: product.productName,
          productPrice: product.productPrice,
          productImage: product.productImage,
          brand: product.brand,
          categoryName: product.category ?? product.categoryName,
          quantity: product.quantity,
        },
        quantity
      );
      setSuccess('Product added to cart!');
      setTimeout(() => navigate('/cart'), 1500);
    } catch (err) {
      setError('Failed to add product to cart');
      setTimeout(() => setError(''), 2000);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error && !product) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
          <Link to="/products" className="btn-primary mt-4">
            Back to Products
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <Link to="/products" className="text-indigo-400 hover:text-indigo-300 font-semibold mb-6 inline-block flex items-center gap-1.5 transition-colors">
            <span>←</span> Back to Products
          </Link>

          {product && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 card bg-slate-900/40 border border-white/5 p-8 rounded-2xl shadow-2xl">
              {/* Product Image */}
              <div className="flex items-center justify-center bg-slate-800/40 border border-white/5 rounded-2xl h-96 overflow-hidden">
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-between">
                <div>
                  <h1 className="text-4xl font-extrabold mb-4 text-white bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent leading-tight">
                    {product.productName}
                  </h1>

                  <div className="mb-6 space-y-3 pt-2">
                    <p className="text-lg text-gray-300 flex items-center gap-2">
                      <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Brand:</span> 
                      <span className="font-bold text-white">{product.brand}</span>
                    </p>
                    <p className="text-lg text-gray-300 flex items-center gap-2">
                      <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Category:</span> 
                      <span className="font-bold text-white">{product.category ?? product.categoryName}</span>
                    </p>
                    <p className="text-lg text-gray-300 flex items-center gap-2">
                      <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Stock Available:</span>{' '}
                      <span className={`font-black ${product.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {product.quantity > 0 ? `${product.quantity} units` : 'Out of Stock'}
                      </span>
                    </p>
                  </div>

                  <div className="mb-8 border-t border-white/5 pt-6">
                    <p className="text-5xl font-black text-indigo-400 mb-4">
                      ₹{product.productPrice.toFixed(2)}
                    </p>
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

                  {product.quantity > 0 && (
                    <div className="mb-8">
                      <label className="form-label">Quantity to Add</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="1"
                          max={product.quantity}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value)), product.quantity))}
                          className="form-input w-24 text-center font-bold"
                        />
                        <span className="text-sm text-gray-400 font-semibold">
                          (Max limit: {product.quantity})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0 || addingToCart}
                  className="w-full btn-primary py-4 px-8 text-lg font-bold flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse-glow disabled:opacity-50"
                >
                  🛒 {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
