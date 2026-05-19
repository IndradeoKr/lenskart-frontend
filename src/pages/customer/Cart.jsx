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
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 card border border-white/5 bg-slate-900/30">
              <span className="text-5xl mb-6 block">🛒</span>
              <p className="text-xl text-gray-300 mb-6 font-bold">Your cart is empty</p>
              <Link to="/products" className="btn-primary inline-block">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="card flex gap-6 bg-slate-900/40 border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
                      <div className="w-32 h-32 flex-shrink-0 bg-slate-800/50 rounded-xl overflow-hidden border border-white/5">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                          {item.productName}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          Brand: <span className="font-semibold text-gray-300">{item.brand}</span>
                        </p>
                        <p className="text-2xl font-black text-indigo-400 mb-4">
                          ₹{item.productPrice.toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="btn-secondary px-3.5 py-1.5 text-xs font-bold"
                            >
                              −
                            </button>
                            <span className="px-4 py-1.5 border border-white/10 rounded-xl bg-white/5 font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={
                                typeof item.maxQuantity === 'number' &&
                                Number.isFinite(item.maxQuantity) &&
                                item.quantity >= item.maxQuantity
                              }
                              className="btn-secondary px-3.5 py-1.5 text-xs font-bold disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="btn-danger py-1.5 px-4 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        {typeof item.maxQuantity === 'number' && Number.isFinite(item.maxQuantity) ? (
                          <p className="text-xs text-gray-500 mt-3 font-medium">Max available: {item.maxQuantity}</p>
                        ) : null}
                      </div>

                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-400 mb-1 font-semibold">Subtotal</p>
                        <p className="text-xl font-black text-white">
                          ₹{(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/products" className="btn-secondary mt-8 inline-block">
                  Continue Shopping
                </Link>
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="card sticky top-28 bg-slate-900/60 border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
                  <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3 flex items-center gap-2">
                    <span>📋</span> Order Summary
                  </h2>

                  <div className="space-y-4 mb-6 border-b border-white/10 pb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium">Total Items:</span>
                      <span className="font-bold text-white">{getTotalItems()}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg border-t border-white/5 pt-4">
                      <span className="text-white font-bold">Total Price:</span>
                      <span className="font-black text-indigo-400">
                        ₹{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full btn-primary py-3.5 text-lg font-bold flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse-glow"
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
