import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/advisor');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Register a temporary demo user behind the scenes if needed, or just login
      // For the hackathon, we assume a "demo" user logic or just simulate it
      // Here we simply log in as a hardcoded demo user if your auth service supports it,
      // or we just auto-fill and submit.
      
      // Let's auto-fill and submit for visual clarity
      setUsername('JudgeDemo');
      setPassword('password123');
      
      // Artificial delay to show the "filling"
      await new Promise(r => setTimeout(r, 300));
      
      // You might need to ensure this user exists in your AuthService or handle it gracefully.
      // For now, we will try to login. If it fails (user doesn't exist), we will catch and register them automatically.
      try {
        await login('JudgeDemo', 'password123');
      } catch (e) {
        // If login fails, register them on the fly
        const { register } = await import('../services/authService'); // Dynamic import to avoid circular dep issues if any
        await register('JudgeDemo', 'demo@hackathon.com', 'password123');
      }
      navigate('/advisor');
    } catch (err: any) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 text-xl shadow-lg shadow-indigo-200 dark:shadow-none">
            <i className="fa-solid fa-user"></i>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to access your wealth plans</p>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 flex items-center gap-2"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Username</label>
            <div className="relative">
              <i className="fa-solid fa-at absolute left-4 top-3.5 text-slate-400"></i>
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-3.5 text-slate-400"></i>
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-circle-notch fa-spin"></i> Signing In...</span> : 'Sign In'}
            </button>
            
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-play"></i> One-Click Demo Login
            </button>
          </div>
        </form>
        <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;