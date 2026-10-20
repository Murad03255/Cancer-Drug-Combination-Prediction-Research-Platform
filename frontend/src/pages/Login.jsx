import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaDna, FaLock, FaEnvelope, FaSignInAlt, FaEye, FaEyeSlash, FaFlask } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      toast.error('Please provide both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(loginEmail, loginPass);
      localStorage.setItem('synergionco_token', res.access_token);
      localStorage.setItem('synergionco_user', JSON.stringify(res.user));
      // Dispatch storage event so Navbar updates immediately
      window.dispatchEvent(new Event('storage'));
      toast.success(`Welcome, ${res.user.name || res.user.email}!`);
      const targetPath = location.state?.from?.pathname || '/';
      navigate(targetPath, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('scientist@onco.org');
    setPassword('SecuredPassword2026!');
    handleLoginSubmit(null, 'scientist@onco.org', 'SecuredPassword2026!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <FaDna className="text-white text-xl animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Researcher Sign In</h2>
          <p className="text-xs text-slate-400">Access platform research credentials</p>
        </div>

        {/* 1-Click Demo Login Badge */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <FaFlask className="text-teal-400" /> Demo Account
            </div>
            <div className="text-[10px] text-slate-400">Instant access for evaluators</div>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 transition"
          >
            Auto-Fill &amp; Sign In
          </button>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative flex items-center">
              <FaEnvelope className="absolute left-3.5 text-slate-500 text-xs" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scientist@onco.org"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-xs outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-3.5 text-slate-500 text-xs" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white text-xs outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-teal-400 to-indigo-400 hover:from-teal-300 hover:to-indigo-300 transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <FaSignInAlt /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          New researcher?{' '}
          <Link to="/signup" state={location.state} className="text-teal-400 font-semibold hover:underline">
            Register Account
          </Link>
        </p>
      </div>
    </div>
  );
}
