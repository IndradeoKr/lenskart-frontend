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
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Link to="/products" className="text-blue-600 hover:underline mb-4">
            ← Back to Products
          </Link>

          {product && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow">
              {/* Product Image */}
              <div className="flex items-center justify-center bg-gray-200 rounded-lg h-96">
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              </div>

              {/* Product Details */}
              <div>
                <h1 className="text-4xl font-bold mb-4 text-gray-900">
                  {product.productName}
                </h1>

                <div className="mb-6">
                  <p className="text-lg text-gray-700 mb-2">
                    <strong>Brand:</strong> {product.brand}
                  </p>
                  <p className="text-lg text-gray-700 mb-2">
                    <strong>Category:</strong> {product.category ?? product.categoryName}
                  </p>
                  <p className="text-lg text-gray-700 mb-2">
                    <strong>Stock Available:</strong>{' '}
                    <span className={product.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.quantity > 0 ? `${product.quantity} units` : 'Out of Stock'}
                    </span>
                  </p>
                </div>

                <div className="mb-8 border-t pt-6">
                  <p className="text-5xl font-bold text-blue-600 mb-4">
                    ₹{product.productPrice.toFixed(2)}
                  </p>
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

                {product.quantity > 0 && (
                  <div className="mb-6">
                    <label className="form-label">Quantity</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value)), product.quantity))}
                        className="form-input w-20"
                      />
                      <span className="text-gray-600">
                        (Max: {product.quantity})
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0 || addingToCart}
                  className="btn-primary py-3 px-6 text-lg disabled:opacity-50"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
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
