import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { cartStorage } from '../../services/cartStorage';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(cartStorage.getCart());
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    const next = cartStorage.updateQuantity(productId, newQuantity);
    setCartItems(next);
  };

  const removeItem = (productId) => {
    const next = cartStorage.removeItem(productId);
    setCartItems(next);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
              <Link to="/products" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="card flex gap-6">
                      <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {item.productName}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          Brand: {item.brand}
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mb-4">
                          ₹{item.productPrice.toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="btn-secondary px-3 py-1"
                            >
                              −
                            </button>
                            <span className="px-4 py-1 border rounded">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={
                                typeof item.maxQuantity === 'number' &&
                                Number.isFinite(item.maxQuantity) &&
                                item.quantity >= item.maxQuantity
                              }
                              className="btn-secondary px-3 py-1 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="btn-danger"
                          >
                            Remove
                          </button>
                        </div>
                        {typeof item.maxQuantity === 'number' && Number.isFinite(item.maxQuantity) ? (
                          <p className="text-sm text-gray-500 mt-2">Max available: {item.maxQuantity}</p>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <p className="text-gray-600 mb-2">Subtotal</p>
                        <p className="text-2xl font-bold">
                          ₹{(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/products" className="btn-secondary mt-6 inline-block">
                  Continue Shopping
                </Link>
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="card sticky top-20">
                  <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6 border-b pb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Items:</span>
                      <span className="font-semibold">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between text-xl">
                      <span className="text-gray-900 font-bold">Total Price:</span>
                      <span className="font-bold text-blue-600">
                        ₹{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full btn-primary py-3 text-lg"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
