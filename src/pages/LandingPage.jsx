import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/products');
    }
  }, [isAuthenticated, user, navigate]);
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to Lenskart
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your premier destination for premium eyewear
            </p>
          </div>

          {/* Feature sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center">
              <div className="text-4xl mb-4">👓</div>
              <h3 className="text-2xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Discover our extensive collection of premium eyewear from top brands
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-2xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick and reliable shipping to your doorstep
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-2xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Competitive prices on all your favorite eyewear styles
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Get Started</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/customer-login"
                className="btn-primary text-lg"
              >
                Customer Login
              </Link>
              <Link
                to="/register"
                className="btn-secondary text-lg"
              >
                Create Account
              </Link>
              <Link
                to="/admin-login"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-lg"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
