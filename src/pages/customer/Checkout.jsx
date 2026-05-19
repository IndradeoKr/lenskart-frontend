import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { cartStorage } from '../../services/cartStorage';
import { cartApi, orderApi } from '../../services/api';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setCart(cartStorage.getCart());
  }, []);

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!user?.userid) {
      setError('User not found');
      setTimeout(() => setError(''), 2000);
      return;
    }

    setPlacing(true);
    setError('');

    try {
      let lastOrderId = null;
      // 1. Add all items to the backend cart
      for (const item of cart) {
        await cartApi.addItemToCart({
          productId: item.productId,
          customerId: user.userid,
          quantity: item.quantity
        });
      }

      // 2. Fetch the newly created backend cart
      const cartRes = await cartApi.getCartForCustomer(user.userid);
      const backendCart = cartRes.data;

      if (!backendCart) {
        throw new Error('Could not retrieve cart from backend');
      }

      // 3. Place ONE order for this cart
      const orderRes = await orderApi.placeOrder({
        date: new Date().toISOString(),
        status: 'IN_PROGRESS',
        cartId: backendCart.cartId,
      });

      const msg = orderRes.data;
      const idMatch = typeof msg === 'string' ? msg.match(/ID:\s*(\d+)/i) : null;
      if (idMatch) {
        lastOrderId = Number(idMatch[1]);
      }

      setOrderId(lastOrderId);
      setSuccess('Order placed successfully!');
      cartStorage.clearCart();
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to place order');
      setTimeout(() => setError(''), 2000);
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="page-container animate-fade-in-up">
          <div className="container mx-auto px-6 relative z-10 text-center py-20 card border border-white/5 bg-slate-900/30">
            <span className="text-5xl mb-6 block">🛒</span>
            <p className="text-xl text-gray-300 mb-6 font-bold">Your cart is empty</p>
            <Link to="/products" className="btn-primary inline-block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container animate-fade-in-up">
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent animate-pulse-glow">
            Order Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span>🛍️</span> Order Items
                </h2>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center pb-4 border-b border-white/5"
                    >
                      <div>
                        <h3 className="font-bold text-white text-lg">{item.productName}</h3>
                        <p className="text-gray-400 text-sm">Qty: <span className="font-semibold text-gray-200">{item.quantity}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">₹{item.productPrice.toFixed(2)}</p>
                        <p className="font-black text-indigo-400 text-lg">
                          ₹{(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span>📍</span> Delivery Address
                </h2>
                <div className="bg-slate-950/60 border border-white/5 p-5 rounded-xl space-y-2">
                  <p className="font-bold text-white text-lg">{user?.name}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{user?.address}</p>
                  <div className="pt-2 border-t border-white/5 space-y-1 text-xs text-gray-400">
                    <p>Email: <span className="text-gray-200">{user?.email}</span></p>
                    <p>Phone: <span className="text-gray-200">{user?.phoneNumber}</span></p>
                  </div>
                </div>
                <Link to="/profile" className="text-indigo-400 hover:text-indigo-300 hover:underline mt-4 inline-block font-semibold">
                  Edit Address
                </Link>
              </div>
            </div>

            {/* Order Total */}
            <div className="lg:col-span-1">
              <div className="card sticky top-28 bg-slate-900/60 border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-3">
                  Order Total
                </h2>

                <div className="space-y-4 mb-6 border-b border-white/10 pb-6 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Items:</span>
                    <span className="font-bold text-white">{getTotalItems()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="font-bold text-white">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Shipping:</span>
                    <span className="font-bold text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between items-center text-lg border-t border-white/5 pt-4">
                    <span className="font-bold text-white">Total:</span>
                    <span className="font-black text-indigo-400 text-xl">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm animate-pulse">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl font-medium text-sm">
                    {success}
                    {orderId ? (
                      <div className="mt-2 font-semibold text-xs">Order ID: {orderId}</div>
                    ) : null}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full btn-primary py-3.5 text-lg font-bold flex items-center justify-center animate-pulse-glow disabled:opacity-50"
                  >
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </button>
                  <Link
                    to="/cart"
                    className="block text-center btn-secondary py-2.5 text-sm"
                  >
                    Back to Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
