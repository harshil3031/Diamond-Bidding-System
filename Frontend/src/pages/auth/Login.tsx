import { useState } from 'react';
import api from '../../api/axios';
import { LoginResponse } from '../../types/auth';
import { useAppDispatch } from '../../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';

const Login = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    dispatch(loginStart());

    try {
      const res = await api.post<{ data: LoginResponse }>(
        '/auth/login',
        { email, password }
      );

      const { token, user } = res.data.data;
      dispatch(loginSuccess({ user, token }));

      window.location.href =
        user.role === 'ADMIN'
          ? '/admin/dashboard'
          : '/user/dashboard';
    } catch (err: any) {
      setError('Invalid email or password');
      dispatch(loginFailure('Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-black p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <path d="M20 2L28 12L20 38L12 12L20 2Z" fill="url(#login-gradient)" stroke="#F59E0B" strokeWidth="1.5"/>
              <defs>
                <linearGradient id="login-gradient" x1="20" y1="2" x2="20" y2="38">
                  <stop offset="0%" stopColor="#FCD34D"/>
                  <stop offset="100%" stopColor="#F59E0B"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-3xl font-bold tracking-[0.3em] text-amber-500 font-serif">PRESTIGE</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-500/10 p-8 border border-slate-700/50">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-slate-400 mb-8">
            Sign in to access your dashboard
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Email Input */}
            <div className="flex flex-col">
              <label className="mb-2 text-slate-300 font-medium text-sm uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@diamond.com"
                className="px-4 py-3 rounded-lg border border-slate-600 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col">
              <label className="mb-2 text-slate-300 font-medium text-sm uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="px-4 py-3 rounded-lg border border-slate-600 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold uppercase tracking-wider rounded-lg shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account? <a href="/" className="text-amber-500 hover:text-amber-400 font-medium">Contact Admin</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
