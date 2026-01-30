import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { resetStore } from '../../store/store';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    resetStore();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-amber-500/10 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <path d="M20 2L28 12L20 38L12 12L20 2Z" fill="url(#sidebar-gradient)" stroke="#F59E0B" strokeWidth="1.5"/>
              <defs>
                <linearGradient id="sidebar-gradient" x1="20" y1="2" x2="20" y2="38">
                  <stop offset="0%" stopColor="#FCD34D"/>
                  <stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-bold tracking-wider text-amber-500">ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <a
            href="/admin/dashboard"
            className="block px-4 py-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider font-medium border border-transparent hover:border-amber-500/20"
          >
            📊 Dashboard
          </a>
          <a
            href="/admin/diamonds"
            className="block px-4 py-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider font-medium border border-transparent hover:border-amber-500/20"
          >
            💎 Diamonds
          </a>
          <a
            href="/admin/bids"
            className="block px-4 py-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider font-medium border border-transparent hover:border-amber-500/20"
          >
            🔨 Bids
          </a>
          <a
            href="/admin/monitor"
            className="block px-4 py-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider font-medium border border-transparent hover:border-amber-500/20"
          >
            📈 Monitor
          </a>
          <a
            href="/admin/results"
            className="block px-4 py-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider font-medium border border-transparent hover:border-amber-500/20"
          >
            🏆 Results
          </a>
          <a
            href="/admin/users/add"
            className="block px-4 py-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider font-medium border border-transparent hover:border-amber-500/20"
          >
            ➕ Add User
          </a>
          <a
            href="/admin/users"
            className="block px-4 py-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 transition-colors text-sm uppercase tracking-wider font-medium border border-transparent hover:border-amber-500/20"
          >
            👥 Users
          </a>
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

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
