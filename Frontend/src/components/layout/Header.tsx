import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { resetStore } from '../../store/store';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    resetStore();
    navigate('/login');
  };

  const handleDashboard = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
      return;
    }
    navigate('/user/dashboard');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-amber-500/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="group-hover:scale-110 transition-transform duration-300">
                <path d="M20 2L28 12L20 38L12 12L20 2Z" fill="url(#diamond-gradient)" stroke="#F59E0B" strokeWidth="1.5"/>
                <defs>
                  <linearGradient id="diamond-gradient" x1="20" y1="2" x2="20" y2="38">
                    <stop offset="0%" stopColor="#FCD34D"/>
                    <stop offset="100%" stopColor="#F59E0B"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 bg-amber-500/20 blur-xl group-hover:bg-amber-500/30 transition-all duration-300"></div>
            </div>
            <span className="text-2xl font-bold tracking-[0.3em] text-amber-500 font-serif">PRESTIGE</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <a 
              href="#auctions" 
              className="text-sm uppercase tracking-wider text-slate-300 hover:text-amber-500 transition-colors duration-300 relative group"
            >
              Auctions
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#how-it-works" 
              className="text-sm uppercase tracking-wider text-slate-300 hover:text-amber-500 transition-colors duration-300 relative group"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a 
              href="#contact" 
              className="text-sm uppercase tracking-wider text-slate-300 hover:text-amber-500 transition-colors duration-300 relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDashboard}
                  className="px-6 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-900 transition-all duration-300 text-sm uppercase tracking-wider font-medium rounded"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm uppercase tracking-wider font-bold rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-900 transition-all duration-300 text-sm uppercase tracking-wider font-medium rounded"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 transition-all duration-300 text-sm uppercase tracking-wider font-bold shadow-lg shadow-amber-500/20 rounded"
                >
                  Start Bidding
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
