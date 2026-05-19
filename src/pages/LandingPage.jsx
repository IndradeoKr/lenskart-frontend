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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 relative overflow-hidden flex flex-col justify-center animate-gradient-shift">
        
        {/* Ambient Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="container mx-auto px-6 py-24 relative z-10 animate-fade-in-up">
          <div className="text-center mb-20">
            <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-300 text-sm font-semibold tracking-wider uppercase mb-6 inline-block">
              ✨ Next-Gen E-Commerce Experience
            </span>
            <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse-glow">ShopWave</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-10 font-medium">
              Your premier destination for highly curated, premium quality products.
            </p>
          </div>

          {/* Feature sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto">
            <div className="card hover:-translate-y-3 transition-all duration-500 border border-white/5 hover:border-indigo-500/30 text-center flex flex-col items-center p-8 bg-slate-900/50 hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] group">
              <div className="text-5xl mb-6 p-4 bg-indigo-500/10 rounded-2xl group-hover:scale-110 duration-300">🛍️</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Premium Quality</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Discover our extensive collection of handpicked premium products from world-class brands.
              </p>
            </div>
            <div className="card hover:-translate-y-3 transition-all duration-500 border border-white/5 hover:border-purple-500/30 text-center flex flex-col items-center p-8 bg-slate-900/50 hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] group">
              <div className="text-5xl mb-6 p-4 bg-purple-500/10 rounded-2xl group-hover:scale-110 duration-300">🚚</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Fast Delivery</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Quick, safe, and fully trackable shipping direct to your doorstep.
              </p>
            </div>
            <div className="card hover:-translate-y-3 transition-all duration-500 border border-white/5 hover:border-cyan-500/30 text-center flex flex-col items-center p-8 bg-slate-900/50 hover:shadow-[0_20px_40px_rgba(6,182,212,0.15)] group">
              <div className="text-5xl mb-6 p-4 bg-cyan-500/10 rounded-2xl group-hover:scale-110 duration-300">💎</div>
              <h3 className="text-2xl font-bold mb-3 text-white">Unbeatable Value</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Uncompromising standard of value and highly competitive prices on premium items.
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-10 text-white">Ready to elevate your shopping?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/customer-login"
                className="btn-primary text-lg px-8 py-3.5 flex items-center justify-center animate-pulse-glow"
              >
                Customer Login
              </Link>
              <Link
                to="/register"
                className="btn-secondary text-lg px-8 py-3.5 flex items-center justify-center"
              >
                Create Account
              </Link>
              <Link
                to="/admin-login"
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300 transform active:scale-95 text-lg flex items-center justify-center"
              >
                Admin Gateway
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
