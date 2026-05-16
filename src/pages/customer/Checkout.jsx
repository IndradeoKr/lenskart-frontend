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
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <Link to="/products" className="btn-primary">
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
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Order Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <h2 className="text-2xl font-bold mb-6">Order Items</h2>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center pb-4 border-b"
                    >
                      <div>
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">₹{item.productPrice.toFixed(2)}</p>
                        <p className="font-bold text-lg">
                          ₹{(item.productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Delivery Address</h2>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="font-semibold mb-2">{user?.name}</p>
                  <p className="text-gray-700">{user?.address}</p>
                  <p className="text-gray-700">Email: {user?.email}</p>
                  <p className="text-gray-700">Phone: {user?.phoneNumber}</p>
                </div>
                <Link to="/profile" className="text-blue-600 hover:underline mt-4 inline-block">
                  Edit Address
                </Link>
              </div>
            </div>

            {/* Order Total */}
            <div className="lg:col-span-1">
              <div className="card sticky top-20">
                <h2 className="text-2xl font-bold mb-6">Order Total</h2>

                <div className="space-y-4 mb-6 border-b pb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Items:</span>
                    <span className="font-semibold">{getTotalItems()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Shipping:</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-xl border-t pt-4">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-blue-600">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                    {orderId ? (
                      <div className="mt-2 font-semibold">Order ID: {orderId}</div>
                    ) : null}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50"
                  >
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </button>
                  <Link
                    to="/cart"
                    className="block text-center btn-secondary py-2"
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
