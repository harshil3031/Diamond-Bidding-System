import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { resetStore } from '../../store/store';

const UserLayout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
    const handleLogout = () => {
      dispatch(logout());
      resetStore();
      navigate('/login');
    };
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/user/dashboard', label: 'Active Bids', icon: '💎' },
    { path: '/user/my-bids', label: 'My Bids', icon: '📋' },
    { path: '/user/results', label: 'Results', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-amber-500/10 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path d="M20 2L28 12L20 38L12 12L20 2Z" fill="url(#user-sidebar-gradient)" stroke="#F59E0B" strokeWidth="1.5"/>
              <defs>
                <linearGradient id="user-sidebar-gradient" x1="20" y1="2" x2="20" y2="38">
                  <stop offset="0%" stopColor="#FCD34D"/>
                  <stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-bold tracking-wider text-amber-500">USER</span>
          </div>
          {user && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
              <p className="text-white font-semibold truncate text-sm">{user.name}</p>
              <p className="text-xs text-slate-400 truncate mt-1">{user.email}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm uppercase tracking-wider font-medium ${
                isActive(item.path)
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  : 'hover:bg-amber-500/10 hover:text-amber-500 border border-transparent hover:border-amber-500/20'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all font-medium uppercase tracking-wider text-sm"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
};

export default UserLayout;
